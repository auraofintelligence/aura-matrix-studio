import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {AVATAR_SECTIONS,saveAvatar,avatarValues} from '../avatar-data.js';
import {SPACE_LAYERS,readPersonalSpace,changeSpaceRadius,spaceShells,savePersonalSpace} from '../personal-space-data.js';
test('seven social shells start as a preview and preserve original saved distances and height',()=>{
 const p=blankProject();assert.equal(readPersonalSpace(p).radii.length,7);assert.equal(p.tables.length,0);assert.equal(readPersonalSpace(p).example,true);
 const space=AVATAR_SECTIONS.find(s=>s.key==='space'),body=AVATAR_SECTIONS.find(s=>s.key==='reach');let next=saveAvatar(p,body,{'body-height':'183'});next=saveAvatar(next,space,{'space-close':'50','space-context':'Old note'});
 const draft=readPersonalSpace(next);assert.equal(draft.height,183);assert.equal(draft.radii[0],50);assert.equal(draft.notes['space-context'],'Old note');assert.equal(SPACE_LAYERS[0].name,'Red');
});
test('changing any radius keeps seven layers nested and diameter is twice its radius',()=>{
 const initial=[45,100,160,240,320,400,480];
 for(let i=0;i<7;i++)for(const value of [1,80,300,1000]){const r=changeSpaceRadius(initial,i,value);assert.deepEqual(initial,[45,100,160,240,320,400,480]);assert.equal(r.length,7);for(let j=0;j<7;j++){assert.ok(r[j]>0);if(j)assert.ok(r[j]>r[j-1]);}spaceShells(170,r).forEach((s,j)=>assert.equal(s.diameter,r[j]*2));}
 assert.throws(()=>changeSpaceRadius(initial,7,30));assert.throws(()=>spaceShells(0,initial));assert.throws(()=>spaceShells(170,[1,2,3,4]));assert.throws(()=>spaceShells(170,[1,2,3,4,5,6,6]));
});
test('saved shell geometry, meanings and notes round-trip without changing matrix shells or losing attachments',()=>{
 const p=blankProject(),before=JSON.stringify(p),r=[45,100,160,240,320,400,480],meanings=['Close friends','','','','','Learning','Reflection'];
 let next=savePersonalSpace(p,185,r,meanings,{'space-context':'A shared workspace'});assert.equal(JSON.stringify(p),before);
 const loaded=readPersonalSpace(validateProject(JSON.parse(JSON.stringify(next))));assert.deepEqual(loaded.radii,r);assert.deepEqual(loaded.meanings,meanings);assert.equal(loaded.height,185);assert.equal(loaded.notes['space-context'],'A shared workspace');assert.equal(loaded.example,false);
 const t=next.tables.find(t=>t.id==='aura-personal-space-shells');t.columns.push('Asset');t.rows.forEach((row,i)=>row.values.push(i===0?'my-asset':''));next=savePersonalSpace(next,185,changeSpaceRadius(r,0,60),meanings);assert.equal(next.tables.find(t=>t.id==='aura-personal-space-shells').rows[0].values.at(-1),'my-asset');
 const geometry=next.tables.find(t=>t.id==='aura-personal-space-shells');assert.equal(geometry.rows.length,7);assert.equal(geometry.rows[0].values[geometry.columns.indexOf('Diameter')],'120');
 for(const key of Object.keys(p).filter(k=>k!=='tables'))assert.deepEqual(next[key],p[key],key);
});
