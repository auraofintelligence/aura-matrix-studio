import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject} from '../core.js';
import {saveRow} from '../local-tools.js';
import {makeBackup,parseBackup,restoreBackup} from '../backup-data.js';
import {visitHistory} from '../visit-history.js';
import {addExtraPages,MERCH,DATA_TRANSFER} from '../extra-pages.js';
function fixture(){let p=saveRow(blankProject(),'test','My inputs',{Title:'Birthday',Date:'1990-02-03'},'r');p=saveRow(p,'aura-palace-media','Mind palace media',{Title:'room.png',Bytes:'3',Storage:'This browser'},'photo');return p;}
test('full backup restores exact project values and uploaded bytes; legacy project backups remain readable',async()=>{
 const project=fixture(),blob=new Blob([new Uint8Array([0,128,255])],{type:'image/png'}),backup=await makeBackup(project,async()=>blob),prepared=parseBackup(JSON.parse(JSON.stringify(backup)));
 assert.deepEqual(prepared.project,project);assert.equal(prepared.complete,true);assert.deepEqual([...new Uint8Array(await prepared.files[0].blob.arrayBuffer())],[0,128,255]);assert.equal(prepared.files[0].blob.type,'image/png');
 assert.equal(parseBackup(project).complete,false);
 let saved;const store=new Map();await restoreBackup(prepared,{load:async id=>store.get(id),store:async files=>files.forEach(f=>store.set(f.id,f.blob)),remove:async ids=>ids.forEach(id=>store.delete(id)),storage:{setItem(k,v){saved=JSON.parse(v);}}});assert.deepEqual(saved,project);assert.equal(store.get('photo').size,3);
});
test('corrupt or incomplete full backups fail before restoration',async()=>{
 await assert.rejects(makeBackup(fixture(),async()=>undefined),/missing/);
 const valid=await makeBackup(fixture(),async()=>new Blob(['abc']));
 for(const change of [b=>b.media=[],b=>b.media.push(b.media[0]),b=>b.media[0].base64='bad!',b=>b.media[0].size=4,b=>b.project.rows=13]){const b=structuredClone(valid);change(b);assert.throws(()=>parseBackup(b));}
});
test('failed project storage restores overwritten media and removes newly staged files',async()=>{
 const old=new Blob(['old']),store=new Map([['photo',old]]),prepared=parseBackup(await makeBackup(fixture(),async()=>new Blob(['new'])));
 const options={load:async id=>store.get(id),store:async files=>files.forEach(f=>store.set(f.id,f.blob)),remove:async ids=>ids.forEach(id=>store.delete(id)),storage:{setItem(){throw Error('Full');}}};
 await assert.rejects(restoreBackup(prepared,options),/previous Aura was kept/);assert.equal(await store.get('photo').text(),'old');
 store.clear();await assert.rejects(restoreBackup(prepared,options));assert.equal(store.size,0);
});
test('Back follows the actual visit trail, survives reload and preserves Forward',()=>{
 const entries=[{url:'?page=favourites',state:null}];let index=0;const history={get state(){return entries[index].state;},replaceState(state,_,url){entries[index]={state,url};},pushState(state,_,url){entries.splice(++index);entries.push({state,url});},back(){index--;}};
 let visits=visitHistory(history,entries[0].url);assert.equal(visits.back(),false);visits.push('?page=eyes');visits.push('?page=merch&filter=shirts');assert.equal(visits.back(),true);assert.equal(entries[index].url,'?page=eyes');
 visits=visitHistory(history,entries[index].url);visits.back();assert.equal(entries[index].url,'?page=favourites');index++;assert.equal(entries[index].url,'?page=eyes');visits.push('?page=data');assert.equal(entries.length,3);assert.equal(entries[2].url,'?page=data');
});
test('new pages register once under Marketplace and System Preferences',()=>{const source={pages:[]};addExtraPages(source);addExtraPages(source);assert.equal(source.pages.length,2);assert.equal(source.pages.find(p=>p.id===MERCH).parent,'9635446B-1F60-4AF2-A62C-E40C90E1806E');assert.ok(source.pages.find(p=>p.id===DATA_TRANSFER));});
