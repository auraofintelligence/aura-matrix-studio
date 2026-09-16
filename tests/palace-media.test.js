import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {rows,saveRow} from '../local-tools.js';
import {savePlace,attachMedia,reconstructionBrief,mediaKind,PLACE_TABLE,MEDIA_TABLE} from '../palace-media.js';

test('captured places need no invented dimensions and preserve existing palace data',()=>{
 const old=saveRow(blankProject(),'aura-palace-rooms','Legacy rooms',{Title:'Existing study',Width:4,Length:5},'old');
 const p=savePlace(old,{Title:'Captured garden',Section:'home'},'place');
 assert.equal(rows(p,PLACE_TABLE)[0].Title,'Captured garden');assert.equal(rows(p,PLACE_TABLE)[0].Width,undefined);
 assert.deepEqual(p.tables.find(t=>t.id==='aura-palace-rooms'),old.tables[0]);
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);assert.equal(old.tables.length,1);
});
test('source photos, video, scans and reconstruction results remain distinguishable',()=>{
 let p=savePlace(blankProject(),{Title:'Study',Section:'home'},'place');
 p=attachMedia(p,'place',[{id:'photo',name:'study.JPG',size:200,type:'image/jpeg'},{id:'video',name:'walk.mp4',size:400},{id:'scan',name:'room.ply',size:100}]);
 p=attachMedia(p,'place',[{id:'result',name:'reconstruction.glb',size:800}],'Result');
 const brief=reconstructionBrief(p,'place');assert.equal(brief.sourceMedia.length,3);assert.equal(brief.resultMedia.length,1);
 assert.equal(brief.status,'Awaiting a connected reconstruction tool');assert.equal(brief.dataTableId,null);
 assert.equal(mediaKind('script.html'),null);assert.equal(mediaKind('unsafe.svg'),null);
 assert.deepEqual(rows(validateProject(JSON.parse(JSON.stringify(p))),MEDIA_TABLE),rows(p,MEDIA_TABLE));
});
test('a rejected media batch leaves the project untouched; table links must resolve',()=>{
 const p=savePlace(blankProject(),{Title:'Study',Section:'home'},'place'),before=JSON.stringify(p);
 assert.throws(()=>attachMedia(p,'place',[{id:'ok',name:'ok.png',size:2},{id:'bad',name:'bad.js',size:3}]));
 assert.throws(()=>attachMedia(p,'missing',[{id:'file',name:'x.ply',size:2}]));
 assert.throws(()=>attachMedia(p,'place',[{id:'file',name:'empty.png',size:0}]));
 assert.throws(()=>savePlace(p,{Title:'Study',Section:'home',Dataset:'missing'},'place'));
 assert.equal(JSON.stringify(p),before);
 const linked=savePlace(p,{Title:'Study',Section:'home',Dataset:PLACE_TABLE,Instructions:'Retain the window as a memory landmark'},'place');
 const brief=reconstructionBrief(linked,'place');assert.equal(brief.dataTableId,PLACE_TABLE);assert.match(brief.instructions,/window/);
 assert.equal('tables' in brief,false);
});
