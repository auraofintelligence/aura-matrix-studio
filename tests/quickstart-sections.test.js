import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {saveSectionEntry,QUICK_SECTIONS,QUICK_JOURNEY,connectSetupEntries} from '../quickstart-data.js';
import {entriesFor,birthdayFor} from '../life-data.js';
import {timingEntries} from '../timing-data.js';
import {saveProfilePhoto} from '../avatar-photos-data.js';

test('quick family entry uses the full family and linked birthday contract',()=>{
 const p=saveSectionEntry(blankProject(),2,{Title:'Alex',Relationship:'Sibling',Birthday:'2000-02-29'});
 const person=entriesFor(p,'family')[0];assert.equal(person.Title,'Alex');
 assert.equal(birthdayFor(p,person).Date,'2000-02-29');
 assert.equal(timingEntries(p,'birthdays').length,1);
 const updated=saveSectionEntry(p,2,{Title:'Alex',Relationship:'Chosen family',Birthday:'2000-02-29'},person);
 assert.equal(entriesFor(updated,'family').length,1);assert.equal(timingEntries(updated,'birthdays').length,1);
});
test('goals, learning and schedules are visible in their full sections',()=>{
 let p=saveSectionEntry(blankProject(),7,{Title:'Learn pottery','Why it matters':'Make useful things'});
 assert.equal(entriesFor(p,'goals')[0]['Why it matters'],'Make useful things');
 p=saveSectionEntry(p,6,{Title:'Pottery',Practice:'Try a class',Evidence:'Beginner'});
 assert.equal(timingEntries(p,'learning')[0].Practice,'Try a class');
 p=saveSectionEntry(p,4,{Title:'Practise',Date:'2026-10-08',Repeat:'Weekly'});
 assert.equal(timingEntries(p,'schedules')[0].Repeat,'Weekly');
});
test('backup retains references to quick entries without duplicating their data',()=>{
 const p=blankProject();p.quickStart={step:2,entries:{family:{tableId:'people',id:'alex'}}};
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))).quickStart,p.quickStart);
 assert.equal(QUICK_SECTIONS.length,10);
});
test('setup route is independent of the full sections and its stage survives backup',()=>{
 assert.deepEqual(QUICK_JOURNEY.map(s=>s.id),['birthday','avatar-photos','avatar','aura-dimensions','aura-setup','favourites','social-preferences','dating']);
 const p=blankProject();p.quickStart={step:1,stage:'avatar-photos'};assert.deepEqual(validateProject(p).quickStart,p.quickStart);
});

test('unfinished QuickStart inputs survive project backups without becoming section entries',()=>{
 const p=blankProject();p.quickStart.drafts={birthday:{'Place of birth (optional)':'Brisbane'},'social-preferences':{'Close friends':true,'What values would you like to share?':'Kindness'}};
 const restored=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.quickStart.drafts,p.quickStart.drafts);assert.deepEqual(restored.tables,[]);
});

test('QuickStart drafts reject malformed field values and unsafe field names',()=>{
 const p=blankProject();p.quickStart.drafts={birthday:{Name:{unexpected:true}}};assert.throws(()=>validateProject(p),/QuickStart draft value/);
 p.quickStart.drafts={birthday:JSON.parse('{"__proto__":"unsafe"}')};assert.throws(()=>validateProject(p),/QuickStart draft field/);
});
test('connecting setup entries stays inside, preserves source data and avoids duplicates',()=>{
 const p=saveSectionEntry(blankProject(),2,{Title:'Alex',Relationship:'Sibling'}),before=structuredClone(p.tables);
 const connected=connectSetupEntries(p);assert.deepEqual(connected.tables,before);assert.equal(connected.records.length,1);assert.equal(connected.records[0].face,'I');assert.equal(connected.records[0].shell,3);assert.equal(connectSetupEntries(connected).records.length,1);
});
test('photo placement references the source row without copying local image data',()=>{
 const p=saveProfilePhoto(blankProject(),1,{Asset:'data:image/jpeg;base64,YQ==',Filename:'portrait.jpg'}),connected=connectSetupEntries(p);
 assert.deepEqual(connected.tables,p.tables);assert.equal(connected.records.length,1);assert.equal(connected.records[0].fields['Aura table ID'],'avatar-profile-photos');assert.equal(connected.records[0].fields['Aura row ID'],'avatar-profile-photo-1');assert.equal(connected.records[0].asset,undefined);assert.equal(connected.records[0].fields.Asset,undefined);
});
