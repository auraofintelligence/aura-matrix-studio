import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject,PRESETS} from '../core.js';
import {rayTargets,rayDescriptor,rayEnd,target,targetPoint,targetKey,remember,sequenceStep,agentPackage} from '../spatial.js';
test('ray groups cover all centres, vertices and both edge directions without duplicate addresses',()=>{
 for(let shell=0;shell<7;shell++)for(const face of ['I','O']){
  assert.equal(rayTargets(shell,face,'off').length,0);
  assert.equal(rayTargets(shell,face,'centres').length,288);
  assert.equal(rayTargets(shell,face,'vertices').length,288);
  assert.equal(rayTargets(shell,face,'edges').length,576);
  const all=rayTargets(shell,face,'all');assert.equal(new Set(all.map(targetKey)).size,1152);
  for(const t of all){const d=rayDescriptor(t);assert.deepEqual(d.origin,[0,0,0]);assert.deepEqual(d.end,targetPoint(d.endpoint,PRESETS.horn));assert.equal(d.id,targetKey(t));}
 }
});
test('coincident horn rays have no spurious vertical line',()=>{
 for(let i=1;i<=24;i++)for(const kind of ['ray-vertex','ray-edge-u'])assert.equal(rayEnd(target(0,'O',kind,i),PRESETS.horn),null);
 assert.ok(rayDescriptor(target(0,'O','ray-facet',1)).length>0);
});
test('a ray owns data separately from its surface endpoint and survives recall and export',()=>{
 const p=blankProject(),t=target(3,'I','ray-edge-v',158);
 p.selections=remember({},t);p.records=[{id:'ray-data',title:'Signal',shell:3,face:'I',cell:158,anchor:t,fields:{},instructions:'Read the signal',data:{value:12}}];
 p.programs=[{id:'rays',name:'Ray sequence',loop:false,steps:[{target:t,action:'recall',seconds:1}]}];
 const saved=validateProject(JSON.parse(JSON.stringify(p))),pack=agentPackage(saved.programs[0],saved);
 assert.equal(sequenceStep(saved.programs[0],0,saved).records[0].data.value,12);assert.equal(pack.records.length,1);assert.deepEqual(pack.geometry.rayOrigin,[0,0,0]);assert.notEqual(targetKey(t),targetKey({...t,kind:'edge-v'}));
});
