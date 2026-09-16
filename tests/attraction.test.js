import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {DATING_CHAPTERS,datingProfile,saveDatingProfile,fieldAnswered} from '../dating-data.js';
import {FRIENDSHIP_CHAPTERS} from '../friendship-data.js';
import {ATTRACTION_DRIVERS} from '../attraction-data.js';
import {notePatch,answerPatch} from '../connection-inputs.js';
import {DISCLOSURE,audienceFor,disclosurePatch,disclosurePreview,disclosurePacket} from '../connection-sharing.js';

test('physical and sensory preferences are available without gender restrictions and survive backups',()=>{
 const data={'Physical attractors':JSON.stringify(['Breasts / tits','Bottom / bum / ass','Abs / stomach']), 'Smell preferences':JSON.stringify(['Natural body scent','Fragrance-free']), 'Smell details':'Cedar, but not heavy perfume', 'Familiar influences':'["Father / paternal figures"]','Family pattern direction':'A mixture of both','Familiar qualities':'Humour','Different qualities':'More patient communication', 'My star sign':'Taurus', 'My personality type':'INTP', 'Personality type preferences':'["ENFP","INTJ"]'};
 const p=saveDatingProfile(blankProject(),data),read=datingProfile(validateProject(JSON.parse(JSON.stringify(p))));
 for(const [k,v]of Object.entries(data))assert.equal(read[k],v);
 assert.equal(read.Gender,undefined);assert.equal(read['Attraction drivers'],undefined);
 const fields=DATING_CHAPTERS.flatMap(c=>c.fields);assert.equal(new Set(fields.map(f=>f.key)).size,fields.length);
 assert.throws(()=>saveDatingProfile(p,{'My personality type':'Assigned by Aura'}));
});

test('attraction factors are independent, distinguish explicit zero and preserve legacy data',()=>{
 const weights={Appearance:5,Personality:0,'Wealth & resources':5},field=DATING_CHAPTERS.flatMap(c=>c.fields).find(f=>f.type==='weights');
 let p=saveDatingProfile(blankProject(),{'Appearance preferences':'Existing own words',Custom:'Keep', 'Attraction drivers':JSON.stringify(weights)});
 assert.deepEqual(JSON.parse(datingProfile(p)['Attraction drivers']),weights);assert.equal(ATTRACTION_DRIVERS.length,10);
 assert.ok(fieldAnswered(field,'{"Personality":0}'));assert.equal(fieldAnswered(field,'{}'),false);
 p=saveDatingProfile(p,{'Attraction drivers':'{}'});assert.equal(datingProfile(p)['Appearance preferences'],'Existing own words');assert.equal(datingProfile(p).Custom,'Keep');
 const before=JSON.stringify(p);for(const invalid of ['{"Appearance":6}','{"Appearance":-1}','{"Appearance":1.5}','{"Unknown":5}','{"Appearance":null}','[]','null','invalid'])assert.throws(()=>saveDatingProfile(p,{'Attraction drivers':invalid}));
 assert.equal(JSON.stringify(p),before);
});

test('disclosure includes only explicitly chosen answers and their notes for the exact audience',()=>{
 let d={'Physical attractors':'["Abs / stomach"]','Smell preferences':'["Natural body scent"]',Gender:'Private test value', 'Attraction drivers':'{"Personality":0}'};
 Object.assign(d,notePatch(d,'Physical attractors','My custom detail'));
 assert.deepEqual(disclosurePreview(d,DATING_CHAPTERS,'public'),[]);assert.equal(audienceFor(d,'Gender'),'private');
 Object.assign(d,disclosurePatch(d,'Physical attractors','public'));Object.assign(d,disclosurePatch(d,'Smell preferences','permission'));Object.assign(d,disclosurePatch(d,'Attraction drivers','public'));
 const p=saveDatingProfile(blankProject(),d),restored=datingProfile(validateProject(JSON.parse(JSON.stringify(p))));
 const pub=disclosurePacket(restored,DATING_CHAPTERS,'public'),permission=disclosurePreview(restored,DATING_CHAPTERS,'permission');
 assert.deepEqual(pub.answers.map(a=>a.key),['Attraction drivers','Physical attractors']);assert.equal(pub.answers[1].notes,'My custom detail');assert.deepEqual(pub.answers[0].value,{Personality:0});assert.deepEqual(permission.map(a=>a.key),['Smell preferences']);
 assert.equal(JSON.stringify(pub).includes('Private test value'),false);assert.equal(pub.permissionEnforced,false);
 Object.assign(d,disclosurePatch(d,'Physical attractors','private'));assert.deepEqual(disclosurePreview(d,DATING_CHAPTERS,'public').map(a=>a.key),['Attraction drivers']);
});

test('private notes do not leak through guided answers and malformed disclosure fails closed',()=>{
 let d={};Object.assign(d,answerPatch(d,'Smell details',{selected:['Freshly washed hair'],own:'Specific scent'}));Object.assign(d,notePatch(d,'Gender','Private detail'));Object.assign(d,disclosurePatch(d,'Smell details','public'));
 const before=JSON.stringify(d),preview=disclosurePreview(d,DATING_CHAPTERS,'public');assert.equal(preview.length,1);assert.match(preview[0].value,/Specific scent/);assert.equal(JSON.stringify(preview).includes('Private detail'),false);assert.equal(JSON.stringify(d),before);
 assert.throws(()=>disclosurePreview(d,DATING_CHAPTERS,'private'));
 for(const invalid of ['broken','[]','{"Gender":"everyone"}','{"Unknown":"public"}']){assert.throws(()=>saveDatingProfile(blankProject(),{[DISCLOSURE]:invalid}));assert.throws(()=>disclosurePreview({[DISCLOSURE]:invalid},DATING_CHAPTERS,'public'));}
 assert.equal(audienceFor({[DISCLOSURE]:'{"Gender":"unknown"}'},'Gender'),'private');
});

test('dating grouping does not mutate shared friendship questions',()=>{assert.ok(FRIENDSHIP_CHAPTERS.flatMap(c=>c.fields).every(f=>!f.group));});
