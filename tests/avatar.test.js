import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {saveQuickEntry} from '../quickstart.js';
import {AVATAR_HOME,AVATAR_SECTIONS,AVATAR_QUESTIONS,avatarValues,saveAvatar,avatarProgress,avatarRatios} from '../avatar-data.js';
const catalogue=JSON.parse(readFileSync(new URL('../assets/dataset-catalogue.json',import.meta.url)));
const body=catalogue.datasets.find(x=>x.id==='body');
test('avatar forms cover the five original destinations with unique field addresses',()=>{
 const pages=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url))).pages;
 const root=pages.find(x=>x.id===AVATAR_HOME),links=root.controls.flatMap(c=>c.links.map(l=>l.target));
 assert.equal(AVATAR_SECTIONS.length,5);for(const s of AVATAR_SECTIONS)assert.ok(links.includes(s.id));
 const ids=AVATAR_SECTIONS.flatMap(s=>s.steps.flatMap(p=>p.fields.map(f=>f.id)));assert.equal(new Set(ids).size,ids.length);assert.equal(AVATAR_QUESTIONS.length,8);
});
test('avatar answers share QuickStart rows and preserve old answers, custom columns, dates and assets',()=>{
 let p=saveQuickEntry(blankProject(),body,{Title:'Old question',Measurement:'Yes',Method:'My original note',Date:'2026-01-02',Asset:'local-reference'},'avatar-answer-2');
 p.tables[0].columns.push('Custom');p.tables[0].rows[0].values.push('Keep me');
 const section=AVATAR_SECTIONS[0];assert.equal(avatarValues(p,section)['avatar-answer-2'],'Yes');
 const next=saveAvatar(p,section,{'avatar-answer-2':'Glasses','avatar-answer-0':'Both'}),t=next.tables[0];
 assert.equal(t.rows.length,2);assert.equal(t.rows[0].id,'avatar-answer-2');for(const [c,v]of [['Custom','Keep me'],['Method','My original note'],['Date','2026-01-02'],['Asset','local-reference']])assert.equal(t.rows[0].values[t.columns.indexOf(c)],v);
 const roundTrip=saveQuickEntry(next,body,{Title:AVATAR_QUESTIONS[2].label,Measurement:'Contact lenses'},'avatar-answer-2');assert.equal(avatarValues(roundTrip,section)['avatar-answer-2'],'Contact lenses');assert.deepEqual(validateProject(JSON.parse(JSON.stringify(roundTrip))),roundTrip);
});
test('optional blanks do not create facts and invalid measurements fail atomically',()=>{
 const p=blankProject(),s=AVATAR_SECTIONS[3],before=JSON.stringify(p);
 assert.equal(saveAvatar(p,s,{'body-height':''}).tables.length,0);
 for(const value of ['-1','0','not a number','Infinity'])assert.throws(()=>saveAvatar(p,s,{'body-height':value}));assert.equal(JSON.stringify(p),before);
 let next=saveAvatar(p,s,{'body-height':'180.5'});assert.equal(avatarProgress(next,s).filled,1);next=saveAvatar(next,s,{'body-height':''});assert.equal(avatarProgress(next,s).filled,0);assert.equal(next.tables[0].rows.length,1);
});
test('measurement units, personal space and derived ratios retain their meaning',()=>{
 let p=saveAvatar(blankProject(),AVATAR_SECTIONS[3],{'body-height':'180','body-reach':'225'});
 p=saveAvatar(p,AVATAR_SECTIONS[4],{'body-arm-span':'180'});p=saveAvatar(p,AVATAR_SECTIONS[2],{'eyes-spacing':'64'});
 p=saveAvatar(p,AVATAR_SECTIONS[1],{'space-conversation':'120','space-context':'At a busy event'});
 assert.deepEqual(avatarRatios(p),{reach:1.25,span:1});const t=p.tables.find(t=>t.id==='quickstart-body');assert.equal(t.rows.find(r=>r.id==='eyes-spacing').values[t.columns.indexOf('Unit')],'mm');assert.equal(t.rows.find(r=>r.id==='body-height').values[t.columns.indexOf('Unit')],'cm');assert.equal(p.tables.find(t=>t.id==='avatar-boundaries').recommendation,'boundaries');assert.equal(avatarValues(p,AVATAR_SECTIONS[1])['space-context'],'At a busy event');
});
