import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {CHAKRA_PAGES} from '../chakra-workspace.js';
import {defaultShellStyle} from '../shell-style.js';
import {allocateTable} from '../dataset-allocation.js';
test('all seven original colour pages own the matching shell',()=>{
 const pages=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url),'utf8')).pages;
 assert.deepEqual(CHAKRA_PAGES.map(id=>pages.find(p=>p.id===id).name),['Red','Orange','Yellow','Green','Blue','Indigo','Violet']);
});
test('appearance is separate on all fourteen sides and survives backups alongside data',()=>{
 const p=blankProject();for(let shell=0;shell<7;shell++)for(const face of ['I','O'])p.shellStyles[`${shell}/${face}`]={...defaultShellStyle(),skin:face==='I'?'glass':'luminous',motion:face==='I'?'still':'breathe'};
 const restored=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.shellStyles,p.shellStyles);
 delete p.shellStyles;assert.deepEqual(validateProject(p).shellStyles,{});
 for(const bad of [{'8/O':defaultShellStyle()},{'0/O':{...defaultShellStyle(),speed:20}},{'0/O':{...defaultShellStyle(),image:'javascript:bad'}}])assert.throws(()=>validateProject({...p,shellStyles:bad}));
});
test('table allocation to a chakra stack preserves appearance, source fields and instructions',()=>{
 const p=blankProject();p.shellStyles['3/I']={...defaultShellStyle(),skin:'glass'};p.tables=[{id:'tasks',name:'Tasks',category:'life',columns:['Title','Instructions'],rows:[{id:'one',values:['First','Use the attached data']}],chakraTags:[3]}];
 const result=allocateTable(p,'tasks',{shell:3,face:'I',start:42,mode:'stack'},()=> 'record-one');
 assert.deepEqual(result.shellStyles,p.shellStyles);assert.equal(result.records[0].anchor.layer,1);assert.equal(result.records[0].cell,42);assert.equal(result.records[0].instructions,'Use the attached data');assert.equal(result.records[0].fields['Aura row ID'],'one');
});
