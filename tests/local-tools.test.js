import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {rows,saveRow} from '../local-tools.js';
import {saveAlgorithm} from '../preferences-ui.js';
import {saveRoom,savePin,removeRoom,samplePalace,SAMPLE_PALACE} from '../palace-ui.js';
import {importSocial,socialSummary,saveConnection,addSocialPages,FRIENDS} from '../social-ui.js';
import {saveAffinityNote,AFFINITY_HOME} from '../affinity-ui.js';
import {validateFavourites} from '../favourites-data.js';
import {pageIcon} from '../page-icons.js';
test('local settings update by identity and retain unrelated columns, tables and backups',()=>{
 let p=saveRow(blankProject(),'aura-preferences','Preferences',{Title:'Test',Custom:'Retain'},'test');p=saveRow(p,'aura-preferences','Preferences',{Title:'Changed',Topics:'Gardens'},'test');
 assert.equal(rows(p,'aura-preferences').length,1);assert.equal(rows(p,'aura-preferences')[0].Custom,'Retain');assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});
test('algorithm specifications validate current dataset and device references without execution',()=>{
 let p=saveRow(blankProject(),'aura-devices','Devices',{Title:'Example'},'example');p=saveAlgorithm(p,'algorithm',{Title:'Draft',Device:'example',Dataset:'aura-devices',Rule:'When requested'});
 assert.equal(rows(p,'aura-algorithms')[0].Status,'Configuration only');assert.throws(()=>saveAlgorithm(p,'other',{Title:'Bad',Device:'missing'}));assert.equal(rows(p,'aura-algorithms').length,1);
});
test('palace rooms and pin coordinates round trip; invalid dimensions, references and assets fail atomically',()=>{
 let p=saveRoom(blankProject(),{Title:'Study',Section:SAMPLE_PALACE,Width:'3.5',Length:'5'},'room');p=savePin(p,{Title:'Idea',Room:'room',X:'.25',Y:'.75',Facet:'Violet I288',Instructions:'Recall this'},'pin');
 assert.equal(rows(validateProject(JSON.parse(JSON.stringify(p))),'aura-palace-pins')[0].X,'.25');
 assert.throws(()=>saveRoom(p,{Title:'Bad',Section:SAMPLE_PALACE,Width:'0',Length:'5'}));
 for(const extra of [{X:'1.1'},{Room:'missing'},{Asset:'javascript:alert(1)'},{Facet:'Red O289'},{Table:'missing'}])assert.throws(()=>savePin(p,{Title:'Bad',Room:'room',X:'.5',Y:'.5',...extra}));
 assert.equal(rows(p,'aura-palace-pins').length,1);const removed=removeRoom(p,'room');assert.equal(rows(removed,'aura-palace-pins').length,0);assert.equal(rows(removed,'aura-palace-rooms').length,0);
});
test('sample palace is explicit and repeat creation is idempotent',()=>{const p=samplePalace(blankProject());assert.equal(rows(p,'aura-palace-rooms').length,3);assert.equal(rows(p,'aura-palace-pins').length,3);assert.deepEqual(samplePalace(p),p);});
test('social imports preserve arbitrary columns and quoted cells and report actual completeness',()=>{
 const p=importSocial(blankProject(),'People','Name,Interests,Extra\r\nExample,"Gardens, music",\r\nOther,Art,Notes');assert.equal(p.tables[0].rows[0].values[1],'Gardens, music');assert.deepEqual(socialSummary(p)[0],{id:p.tables[0].id,name:'People',rows:2,columns:3,filled:5,cells:6});assert.throws(()=>importSocial(p,'Bad','Name,Name\nA,B'));assert.throws(()=>importSocial(p,'Empty','Name\n'));
});
test('dating and friendships remain separate and invalid dates cannot corrupt saved connections',()=>{let p=saveConnection(blankProject(),'friends',{Title:'Example',Context:'Garden group'},'one');p=saveConnection(p,'dating',{Title:'Example',Context:'Shared walk'},'one');assert.equal(rows(p,'aura-friends')[0].Context,'Garden group');assert.equal(rows(p,'aura-dating')[0].Context,'Shared walk');assert.throws(()=>saveConnection(p,'friends',{Title:'Example','Next catch-up':'2026-02-30'},'one'));assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);});
test('new friendship destination and achievement artwork work in favourites',()=>{const source=addSocialPages({pages:[]});addSocialPages(source);assert.equal(source.pages.length,1);const raw={activeId:'f',menus:[{id:'f',name:'Favourites',slots:Array(25).fill(null)}]};raw.menus[0].slots[0]={pageId:FRIENDS,icon:pageIcon(FRIENDS)};raw.menus[0].slots[1]={pageId:'A95C1B93-E697-4764-9F0D-D819C3B71AC1',icon:pageIcon('A95C1B93-E697-4764-9F0D-D819C3B71AC1')};assert.doesNotThrow(()=>validateFavourites(raw));});
test('Affinity notes remain local drafts and update without duplicates',()=>{let p=saveAffinityNote(blankProject(),AFFINITY_HOME,'Interest',{Interest:'Example'});p=saveAffinityNote(p,AFFINITY_HOME,'Interest',{Questions:'Example question'});const r=rows(p,'affinity-notes')[0];assert.equal(r.Interest,'Example');assert.equal(r.Status,'Draft');assert.equal(rows(p,'affinity-notes').length,1);});
