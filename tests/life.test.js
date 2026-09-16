import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {saveQuickEntry} from '../quickstart.js';
import {timingEntries} from '../timing-data.js';
import {KINSHIP_TERMS,FAMILY_STARTERS,familyLinks,familyNeighbours,LIFE_SECTIONS,entriesFor,categoryFor,birthdayFor,rowRef,progressOf,saveLife,importLifePreview,importLife} from '../life-data.js';
const catalogue=JSON.parse(readFileSync(new URL('../assets/dataset-catalogue.json',import.meta.url)));
const rec=id=>catalogue.datasets.find(d=>d.id===id);
test('all five original lists are present, with all source categories retained',()=>{
 const source=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url))).pages;
 for(const section of LIFE_SECTIONS){const page=source.find(p=>p.id===section.id);assert.ok(page);const names=LIFE_SECTIONS.flatMap(s=>s.groups.map(g=>g.name));const walk=controls=>{for(const c of controls){if(c.controlTypeID==='TextInput')assert.ok(names.includes(c.properties.text),c.properties.text);walk(c.children);}};walk(page.controls);assert.ok(section.groups.every(g=>g.prompts.length));}
});
test('family editing retains QuickStart identity and updates its original birthday in place',()=>{
 let p=saveQuickEntry(blankProject(),rec('relationships'),{Title:'Alex',Relationship:'Sibling',Notes:'Keep this'},'person-a');p=saveQuickEntry(p,rec('life-events'),{Title:'Birthday: Alex','Person or subject':'Alex',Date:'1990-03-02'},'person-a-birthday');
 const row=entriesFor(p,'family')[0];p=saveLife(p,'family',{Title:'Alexander',Birthday:'1990-03-03',Category:'Build Your Family Tree'},row);
 assert.equal(entriesFor(p,'family').length,1);assert.equal(entriesFor(p,'family')[0].Notes,'Keep this');assert.equal(entriesFor(p,'family')[0].id,'person-a');assert.equal(timingEntries(p,'birthdays').length,1);assert.equal(birthdayFor(p,row).Date,'1990-03-03');assert.equal(birthdayFor(p,row)['Person or subject'],'Alexander');
 p=saveLife(p,'family',{Title:'Alexander',Birthday:''},row);assert.equal(birthdayFor(p,row).Date,'');assert.equal(birthdayFor(p,row).Enabled,'No');
});
test('new records remain editable from QuickStart and backup round trips',()=>{
 for(const [key,id,fields]of [['family','relationships',{Title:'Friend',Relationship:'Friend'}],['favourites','inspiration',{Title:'Album',Category:'Music'}],['goals','goals',{Title:'Learn', 'Next action':'Read'}]]){let p=saveLife(blankProject(),key,fields);const row=entriesFor(p,key)[0];p=saveQuickEntry(p,rec(id),fields,row.id);assert.equal(entriesFor(p,key).length,1);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);}
});
test('goals stay distinct from combined wishes and bucket entries while feeding timing tables',()=>{
 let p=saveQuickEntry(blankProject(),rec('goals'),{Title:'Existing goal'},'goal-a');p=saveLife(p,'wishes',{Title:'Garden','Target date':'2027-03-02','Reminder minutes':'60'});p=saveLife(p,'bucket',{Title:'Festival',Value:'2',Target:'4'});
 assert.deepEqual(entriesFor(p,'goals').map(r=>r.Title),['Existing goal']);assert.deepEqual(entriesFor(p,'wishes').map(r=>r.Title),['Garden','Festival']);assert.equal(progressOf(entriesFor(p,'wishes')[1]),50);assert.ok(timingEntries(p,'reminders').some(r=>r.Title==='Garden'));
});
test('family relationships reference saved identities rather than matching names',()=>{
 let p=saveLife(blankProject(),'family',{Title:'Alex'});const first=entriesFor(p,'family')[0];p=saveLife(p,'family',{Title:'Alex','Connected person':rowRef(first),Connection:'Sibling of'});const second=entriesFor(p,'family')[1];assert.notEqual(first.id,second.id);assert.equal(second['Connected person'],rowRef(first));assert.throws(()=>saveLife(p,'family',{Title:'Alex','Connected person':rowRef(first)},first));
});
test('CSV imports preserve extra columns and fail atomically on invalid rows',()=>{
 const p=blankProject(),before=JSON.stringify(p);const rows=importLifePreview('Title,Next action,Custom\nA,Begin,keep\nB,Continue,also keep','wishes','Home Wish Lists');const next=importLife(p,'wishes',rows);assert.equal(entriesFor(next,'wishes')[0].Custom,'keep');assert.equal(entriesFor(next,'wishes').length,2);assert.equal(JSON.stringify(p),before);
 assert.throws(()=>importLife(p,'wishes',[...rows,{Title:'Bad','Target date':'2026-02-30'}]));assert.equal(JSON.stringify(p),before);assert.throws(()=>importLifePreview('Name\nA','wishes','Other'));assert.throws(()=>saveLife(p,'goals',{Title:'Bad',Target:'0'}));assert.throws(()=>saveLife(p,'goals',{Title:'Bad',Asset:'javascript:alert(1)'}));
});
test('favourite QuickStart categories return to their original list groups',()=>{
 const s=LIFE_SECTIONS.find(s=>s.key==='favourites');for(const name of ['Book','Music','TV','Film','Game'])assert.equal(categoryFor({Category:name},s),'Books, Music, TV, Film, Games I Enjoy');assert.equal(categoryFor({Category:'Value'},s),'Values I Prefer');
});
test('family occasions feed ceremonies while invalid time or switching person type is rejected',()=>{
 const p=saveLife(blankProject(),'family',{Title:'Family reunion',Category:'Ceremonies for New Family',Date:'2027-05-10',Time:'14:00'}),row=entriesFor(p,'family')[0];assert.equal(row.recommendation,'ceremonies');assert.ok(timingEntries(p,'ceremonies').some(r=>r.Title==='Family reunion'));assert.ok(p.tables[0].columns.includes('Date or season'));assert.throws(()=>saveLife(p,'family',{Title:'Person',Category:'Build Your Family Tree'},row));assert.throws(()=>saveLife(p,'family',{Title:'Bad time',Time:'29:00'}));
});

test('family supports extended generations, many connections and family-defined terminology',()=>{
 for(const term of ['Cousin','Aunt','Uncle','Niece','Nephew','Ancestor','Descendant'])assert.ok(KINSHIP_TERMS.includes(term));
 assert.ok(FAMILY_STARTERS.some(([title])=>title==='Use your own kinship term'));
 let p=blankProject();for(let n=0;n<18;n++)p=saveLife(p,'family',{Title:'Person '+n});
 let people=entriesFor(p,'family');for(let n=1;n<18;n++)p=saveLife(p,'family',{Title:people[n].Title,'Family links':JSON.stringify([{person:rowRef(people[n-1]),term:'Descendant of'}])},people[n]);
 people=entriesFor(p,'family');assert.equal(familyNeighbours(people,people[16]).length,2);
 const ties=people.slice(1,9).map(r=>({person:rowRef(r),term:'Whānau of',reciprocal:'Kin of',meaning:'Our family defines this connection'}));
 p=saveLife(p,'family',{Title:'Person 0',Relationship:'Our own term','Kinship approach':'Our family practice','Kinship language':'Te reo Māori','Belonging groups':'Household A; extended family','Family links':JSON.stringify(ties)},people[0]);
 people=entriesFor(p,'family');assert.equal(familyLinks(people[0]).length,8);assert.equal(familyNeighbours(people,people[0]).length,8);assert.equal(people[0].Relationship,'Our own term');assert.ok(familyNeighbours(people,people[8])[0].labels.some(x=>x.includes('Kin of')));assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});

test('legacy ties migrate on save without losing memories or birthdays and can be removed',()=>{
 let p=saveLife(blankProject(),'family',{Title:'Alex'});const alex=entriesFor(p,'family')[0];
 p=saveLife(p,'family',{Title:'Jamie','Connected person':rowRef(alex),Connection:'Child of',Notes:'Keep me',Birthday:'2000-04-05',Traditions:'Shared meal'});let jamie=entriesFor(p,'family')[1],birthday=birthdayFor(p,jamie);
 const links=familyLinks(jamie);assert.equal(links[0].term,'Child of');
 p=saveLife(p,'family',{Title:'Jamie','Family links':JSON.stringify(links)},jamie);jamie=entriesFor(p,'family')[1];assert.equal(jamie.Notes,'Keep me');assert.equal(jamie.Traditions,'Shared meal');assert.equal(birthdayFor(p,jamie).id,birthday.id);
 const before=JSON.stringify(p);for(const bad of ['not json','{}',JSON.stringify([{person:rowRef(jamie)}]),JSON.stringify([{person:'missing'}])])assert.throws(()=>saveLife(p,'family',{Title:'Jamie','Family links':bad},jamie));assert.equal(JSON.stringify(p),before);
 p=saveLife(p,'family',{Title:'Jamie','Family links':'[]'},jamie);assert.deepEqual(familyLinks(entriesFor(p,'family')[1]),[]);assert.equal(familyNeighbours(entriesFor(p,'family'),alex).length,0);
});

test('merged wishes expose legacy bucket rows in place and achievements stay separate',()=>{
 let p=saveLife(blankProject(),'wishes',{Title:'Old trip',Category:'Places to Visit',Notes:'Original'});const t=p.tables[0];t.rows[0].id='old-bucket';t.rows[0].values[t.columns.indexOf('Collection')]='bucket';
 p=saveLife(p,'wishes',{Title:'New wish',Category:'Home Wish Lists'});let legacy=entriesFor(p,'wishes').find(r=>r.id==='old-bucket');assert.equal(legacy.Collection,'bucket');
 p=saveLife(p,'wishes',{Title:'Updated trip',Category:legacy.Category},legacy);legacy=entriesFor(p,'wishes').find(r=>r.id==='old-bucket');assert.equal(legacy.Notes,'Original');assert.equal(legacy.tableId,'quickstart-goals');assert.equal(entriesFor(p,'wishes').length,2);
 p=saveLife(p,'achievements',{Title:'My old home',Category:'Places I have lived',Date:'2001-01-01','End date':'2009-01-01',Place:'Brisbane',Period:'Childhood',Story:'Our shared home'});
 const memory=entriesFor(p,'achievements')[0];assert.equal(memory.Status,'Done');assert.equal(memory['Event kind'],'Memory');assert.equal(entriesFor(p,'wishes').length,2);assert.equal(entriesFor(p,'goals').length,0);assert.ok(timingEntries(p,'milestones').some(r=>r.id===memory.id));assert.equal(timingEntries(p,'reminders').length,0);
 assert.throws(()=>saveLife(p,'achievements',{Title:'Bad dates',Date:'2009-01-01','End date':'2001-01-01'}));assert.throws(()=>saveLife(p,'achievements',{Title:'Bad date',Date:'2001-02-30'}));
 assert.ok(LIFE_SECTIONS.find(s=>s.key==='wishes').groups.some(g=>g.name==='Skills to Master'));assert.ok(LIFE_SECTIONS.find(s=>s.key==='achievements').groups.some(g=>g.name==='Places I have visited'));assert.ok(!LIFE_SECTIONS.some(s=>s.groups.some(g=>g.name==='Music experiences')));
});
