import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TIMING_IDEAS,ideaDraft,originalTimingNotes} from '../timing-ideas.js';
import {TIMING_PAGES,saveTiming,timingEntries} from '../timing-data.js';
import {blankProject} from '../core.js';
const pages=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url))).pages;
test('all ten original timing sections have substantial options before personal data exists',()=>{
 for(const [id,group]of Object.entries(TIMING_PAGES)){
  const ideas=TIMING_IDEAS[group];assert.ok(ideas.length>=8,group);
  assert.equal(new Set(ideas.map(x=>x.title)).size,ideas.length);
  for(const x of ideas){assert.ok(x.title&&x.description.length>30);assert.equal(x.fields.Title,x.title);}
  const page=pages.find(x=>x.id===id),notes=originalTimingNotes(page);
  for(const c of page.controls.filter(x=>x.properties?.text))assert.ok(notes.includes(c.properties.text));
 }
 assert.equal(Object.keys(TIMING_IDEAS).length,10);
 for(const title of ['Achievement Counter','Action Counter','Timer','Lap Counter','Date Countdown'])assert.ok(TIMING_IDEAS.counters.some(x=>x.title.toLowerCase()===title.toLowerCase()),title);
 assert.equal(TIMING_IDEAS.ceremonies.length,18);
});
test('every suggested draft saves and edits without changing existing entries or the catalogue',()=>{
 const snapshot=JSON.stringify(TIMING_IDEAS);
 for(const [group,ideas]of Object.entries(TIMING_IDEAS))for(let i=0;i<ideas.length;i++){
  const original=saveTiming(blankProject(),group,{Title:'Existing personal entry',Instructions:'Keep my instructions'}),before=JSON.stringify(original);
  const draft=ideaDraft(group,i);draft.Title+=' personalised';
  assert.equal(JSON.stringify(original),before);
  const saved=saveTiming(original,group,draft),row=timingEntries(saved,group).find(x=>x.Title===draft.Title);assert.ok(row,group);
  const edited=saveTiming(saved,group,{...draft,Instructions:'My chosen action'},row);
  assert.equal(timingEntries(edited,group).find(x=>x.id===row.id).Instructions,'My chosen action');
  assert.equal(timingEntries(edited,group).find(x=>x.Title==='Existing personal entry').Instructions,'Keep my instructions');
 }
 assert.equal(JSON.stringify(TIMING_IDEAS),snapshot);assert.throws(()=>ideaDraft('missing',0));
});
