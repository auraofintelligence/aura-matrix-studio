import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {AVATAR_SECTIONS,saveAvatar,avatarValues} from '../avatar-data.js';
import {SPACE_LAYERS,readPersonalSpace,changeSpaceRadius,spaceShells,spaceDiagram,personalTorusPoint,savePersonalSpace} from '../personal-space-data.js';
test('person height and every shell use the same physical scale at all fitted sizes',()=>{
 for(const height of [100,170,220,1200])for(const outer of [480,1000,10000])for(const view of ['top','side']){
  const radii=[105,150,200,240,320,400,outer],d=spaceDiagram(height,radii,view);
  for(const [i,shell] of d.shells.entries()){
   assert.ok(Math.abs(shell.radiusPx/d.personHeight-radii[i]/height)<1e-10);
   assert.ok(Math.abs(shell.diameterPx/d.personHeight-2*radii[i]/height)<1e-10);
   assert.ok(shell.radiusPx<=(view==='top'?74:152)+1e-10);
  }
  assert.ok(d.personHeight<=(view==='top'?124:148)+1e-10);
 }
 const focused=spaceDiagram(170,[45,100,160,240,320,400,480],'side',0);assert.ok(focused.personHeight>spaceDiagram(170,[45,100,160,240,320,400,480],'side').personHeight);assert.throws(()=>spaceDiagram(170,[45,100,160,240,320,400,480],'side',7));
 const d=spaceDiagram(170,[105,150,200,240,320,400,480]);
 assert.ok(d.shells[2].radiusPx>d.personHeight,'a 2 m radius must be longer than a 1.7 m person');
 assert.ok(d.shells[0].diameterPx>d.personHeight,'a 210 cm diameter must exceed a 170 cm height');
});
test('seven social shells start as a preview and preserve original saved distances and height',()=>{
 const p=blankProject();assert.deepEqual(readPersonalSpace(p).radii,[45,60,75,90,110,130,150]);assert.equal(p.tables.length,0);assert.equal(readPersonalSpace(p).example,true);
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
 let next=savePersonalSpace(p,185,r,meanings,{'space-context':'A shared workspace'},'female');assert.equal(JSON.stringify(p),before);
 const loaded=readPersonalSpace(validateProject(JSON.parse(JSON.stringify(next))));assert.deepEqual(loaded.radii,r);assert.deepEqual(loaded.meanings,meanings);assert.equal(loaded.height,185);assert.equal(loaded.notes['space-context'],'A shared workspace');assert.equal(loaded.example,false);assert.equal(loaded.figure,'female');
 const t=next.tables.find(t=>t.id==='aura-personal-space-shells');t.columns.push('Asset');t.rows.forEach((row,i)=>row.values.push(i===0?'my-asset':''));next=savePersonalSpace(next,185,changeSpaceRadius(r,0,60),meanings);assert.equal(next.tables.find(t=>t.id==='aura-personal-space-shells').rows[0].values.at(-1),'my-asset');
 assert.equal(readPersonalSpace(next).figure,'female');assert.throws(()=>savePersonalSpace(next,185,r,meanings,{},'invalid'));
 const geometry=next.tables.find(t=>t.id==='aura-personal-space-shells');assert.equal(geometry.rows.length,7);assert.equal(geometry.rows[0].values[geometry.columns.indexOf('Diameter')],'120');
 for(const key of Object.keys(p).filter(k=>k!=='tables'))assert.deepEqual(next[key],p[key],key);
});

test('stretched horn tori retain the central horn and exact entered width and height',()=>{
 for(const radius of [45,150,480])for(const height of [100,170,220]){
  const equator=personalTorusPoint(radius,height,0,0);assert.equal(equator[0],radius);assert.equal(equator[1],0);
  const pole=personalTorusPoint(radius,height,0,Math.PI/2);assert.ok(Math.abs(pole[1]-height/2)<1e-10);
  for(let u=0;u<6;u++){const horn=personalTorusPoint(radius,height,u,Math.PI);assert.ok(horn.every(x=>Math.abs(x)<1e-10));}
  const fit=spaceDiagram(height,[45,60,75,90,110,130,150],'side',null,{width:336,height:320},'person');
  assert.ok(fit.personHeight>=240&&fit.personHeight<=250+1e-10);assert.ok(Math.abs(fit.shells[0].radiusPx/fit.personHeight-45/height)<1e-10);
 }
});
