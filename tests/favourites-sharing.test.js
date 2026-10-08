import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyFavourites,updateFavourite} from '../favourites-data.js';
import {exportShortcutMenu,reviewShortcutMap,importShortcutMap} from '../favourites-sharing.js';
const pageId='AE87688C-93C9-4AB1-A72D-A447ED56C5E0',pages=new Set([pageId]),icons=new Set();
test('sharing keeps only shortcuts and importing preserves existing menus',()=>{
 const f=updateFavourite(emptyFavourites(),'favourites',7,{pageId,icon:'',answers:'private',encrypted:'secret'});
 const payload=exportShortcutMenu(f,'favourites');assert.deepEqual(Object.keys(payload),['format','menus']);
 assert.deepEqual(payload.menus[0].slots[7],{pageId,icon:''});
 const reviewed=reviewShortcutMap(payload,pages,icons),imported=importShortcutMap(f,reviewed);
 assert.deepEqual(imported.menus[0],f.menus[0]);assert.equal(imported.menus.length,2);assert.notEqual(imported.activeId,f.activeId);
 assert.deepEqual(imported.menus[1].slots,f.menus[0].slots);
});
test('review rejects private payloads, missing destinations and unsafe icons',()=>{
 const payload=exportShortcutMenu(updateFavourite(emptyFavourites(),'favourites',0,{pageId,icon:''}),'favourites');
 assert.throws(()=>reviewShortcutMap({...payload,tables:[{answer:'private'}]},pages,icons));
 const withAnswer=structuredClone(payload);withAnswer.menus[0].slots[0].answer='private';assert.throws(()=>reviewShortcutMap(withAnswer,pages,icons));
 assert.throws(()=>reviewShortcutMap(payload,new Set(),icons));
 const unsafe=structuredClone(payload);unsafe.menus[0].slots[0].icon='https://example.org/tracker.png';assert.throws(()=>reviewShortcutMap(unsafe,pages,icons));
 assert.throws(()=>reviewShortcutMap({format:'encrypted',data:'secret'},pages,icons));
});
