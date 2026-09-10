import {CROWN,canonicalPage,parentPage} from '../original-routes.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {blankProject,validateProject} from '../core.js';
import {saveTrip,saveTravelGoal,travelProgress,travelEntries,travelTimeline} from '../travel-data.js';
import {buildTimeContext} from '../time-context.js';
import {clockState} from '../celestial-clock.js';
import {PLANETS,solarSystemState,orbitTracks,mapPoint} from '../solar-system.js';
const context=vm.createContext({Date,Math});vm.runInContext(readFileSync(new URL('../vendor/astronomy/astronomy.browser.min.js',import.meta.url),'utf8'),context);const A=context.Astronomy;
test('travel goals stay editable and repeat visits count once without limiting custom territories',()=>{
 let p=saveTravelGoal(blankProject(),{target:400,years:7.5,start:'2027-01-01'});
 for(const name of ['Japan',' JAPAN ','My extra island'])p=saveTrip(p,{Destination:name,Status:'Visited'});
 p=saveTrip(p,{Destination:'Another territory',Status:'Want to go'});
 assert.deepEqual(travelProgress(p),{visited:2,target:400,years:7.5,start:'2027-01-01'});
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
 assert.throws(()=>saveTravelGoal(p,{target:0,years:10}));
});
test('trip updates keep row identity, preserve extra fields and reject invalid dates atomically',()=>{
 const p=saveTrip(blankProject(),{Destination:'Japan',Status:'Planned',Date:'2027-03-21','Return date':'2027-04-08'}),entry=travelEntries(p)[0];
 const next=saveTrip(p,{...entry,Date:'2027-03-22','Astrology notes':'Personal reflection'},entry);
 assert.equal(travelEntries(next)[0].id,entry.id);assert.equal(travelEntries(next).length,1);
 assert.equal(travelTimeline(next)[0].Date,'2027-03-22');assert.equal(travelTimeline(p)[0].Date,'2027-03-21');
 assert.throws(()=>saveTrip(p,{...entry,Date:'2027-05-01'},entry));
 assert.throws(()=>saveTrip(p,{Destination:'Japan',Status:'Visited',Date:'2027-02-30'}));
});
test('the clock computes opposite hemisphere seasons, tropical signs and actual next lunar phases',()=>{
 const date=new Date('2026-06-22T12:00:00Z'),north=clockState(A,date,'north'),south=clockState(A,date,'south');
 assert.equal(north.season,'Summer');assert.equal(south.season,'Winter');assert.equal(north.zodiac,'Cancer');assert.ok(north.rotation>=0&&north.rotation<24);
 const full=A.SearchMoonPhase(180,date,40);assert.ok(full.date>date);assert.ok(Math.abs(A.MoonPhase(full.date)-180)<.01);
 const tomorrow=clockState(A,new Date('2026-06-23T12:00:00Z'),'north');assert.ok(tomorrow.sun>north.sun);assert.notEqual(tomorrow.earth,north.earth);
});
test('AI context composes selected datasets and dated trip positions without sending or losing interpretation',()=>{
 let p=saveTrip(blankProject(),{Destination:'Japan',Status:'Planned',Date:'2027-03-21','Return date':'2027-04-08',Hemisphere:'north','Astrology notes':'My interpretation'});
 p=saveTrip(p,{Destination:'A future island',Status:'Want to go'});
 const pack=buildTimeContext(p,{groups:['travel'],from:'2027-03-25',to:'2027-03-30',engine:A});
 assert.equal(pack.tables[0].rows.length,2);assert.equal(pack.celestial.length,1);assert.equal(pack.celestial[0].zodiac,'Aries');
 assert.ok(JSON.stringify(pack).includes('My interpretation'));assert.equal(pack.matrixRecords,undefined);
 assert.equal(buildTimeContext(p,{groups:['time']}).tables.length,0);
 assert.throws(()=>buildTimeContext(p,{from:'2027-05-01',to:'2027-01-01'}));
});

test('Crown owns celestial tools while the old star-map URL resolves to the same clock',()=>{
 const pages=new Map(JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url),'utf8')).pages.map(p=>[p.id,p]));
 const celestial='04D7A1CD-024B-4CC1-8116-37139DF95A29';assert.equal(canonicalPage('49B01240-CBE1-4CAE-A639-D79E064FE56B'),celestial);assert.equal(parentPage(pages.get(celestial),pages),CROWN);
});

test('solar map contains eight physical planet positions and a Moon orbiting Earth at lunar distance',()=>{
 const date=new Date('2026-09-10T00:00:00Z'),state=solarSystemState(A,date),later=solarSystemState(A,new Date('2026-10-10T00:00:00Z'));
 assert.deepEqual(state.planets.map(p=>p.name),PLANETS);
 assert.ok(state.planets[2].distance>.98&&state.planets[2].distance<1.02);
 assert.ok(state.planets[7].distance>29&&state.planets[7].distance<31);
 assert.ok(state.moon.distance>.0023&&state.moon.distance<.0028);
 const earth=state.planets[2];assert.ok(Math.abs(Math.hypot(state.moon.x-earth.x,state.moon.y-earth.y,state.moon.z-earth.z)-state.moon.distance)<1e-12);
 for(const p of state.planets){const next=later.planets.find(n=>n.name===p.name);assert.notEqual(p.x,next.x);assert.ok(Number.isFinite(p.z));}
 // Projection keeps orbital direction; the linear option preserves distance ratios.
 const one=mapPoint({x:1,y:0},'scale'),two=mapPoint({x:2,y:0},'scale');assert.ok(Math.abs((two.x-108)/(one.x-108)-2)<1e-12);
 for(const mode of ['compact','scale'])for(const p of state.planets){const point=mapPoint(p,mode);assert.ok(point.x>20&&point.x<200&&point.y>3&&point.y<171);}
 const tracks=orbitTracks(A,date);assert.equal(tracks.length,8);assert.equal(tracks[0].points.length,97);
});
