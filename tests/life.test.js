import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {saveQuickEntry} from '../quickstart.js';
import {timingEntries} from '../timing-data.js';
import {LIFE_SECTIONS,entriesFor,categoryFor,birthdayFor,rowRef,progressOf,saveLife,importLifePreview,importLife} from '../life-data.js';
const catalogue=JSON.parse(readFileSync(new URL('../assets/dataset-catalogue.json',import.meta.url)));
const rec=id=>catalogue.datasets.find(d=>d.id===id);
test('all five original lists are present, with all source categories retained',()=>{
 const source=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url))).pages;
 for(const section of LIFE_SECTIONS){const page=source.find(p=>p.id===section.id);assert.ok(page);const names=section.groups.map(g=>g.name);const walk=controls=>{for(const c of controls){if(c.controlTypeID==='TextInput')assert.ok(names.includes(c.properties.text),c.properties.text);walk(c.children);}};walk(page.controls);assert.ok(section.groups.every(g=>g.prompts.length));}
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
test('goals, wishes and bucket entries stay distinct while feeding shared timing tables',()=>{
 let p=saveQuickEntry(blankProject(),rec('goals'),{Title:'Existing goal'},'goal-a');p=saveLife(p,'wishes',{Title:'Garden','Target date':'2027-03-02','Reminder minutes':'60'});p=saveLife(p,'bucket',{Title:'Festival',Value:'2',Target:'4'});
 assert.deepEqual(entriesFor(p,'goals').map(r=>r.Title),['Existing goal']);assert.deepEqual(entriesFor(p,'wishes').map(r=>r.Title),['Garden']);assert.equal(progressOf(entriesFor(p,'bucket')[0]),50);assert.ok(timingEntries(p,'reminders').some(r=>r.Title==='Garden'));
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
