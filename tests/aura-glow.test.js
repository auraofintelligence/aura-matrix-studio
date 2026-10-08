import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {defaultAuraGlow,validateAuraGlow,glowAddressPoint,GLOW_PATTERNS} from '../aura-glow-data.js';
import {readPersonalSpace} from '../personal-space-data.js';
test('Glow-Up settings survive backup and old projects receive a default',()=>{
 const p=blankProject();delete p.auraGlow;assert.deepEqual(validateProject(p).auraGlow,defaultAuraGlow());
 p.auraGlow={...defaultAuraGlow(),enabled:true,pattern:'petals',seed:4294967295,detail:.9};
 const restored=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.auraGlow,p.auraGlow);assert.deepEqual(restored.tables,p.tables);assert.deepEqual(restored.records,p.records);
 for(const change of [{pattern:'unknown'},{seed:-1},{seed:1.5},{flow:Infinity},{glow:2},{detail:-.1},{enabled:'true'}])assert.throws(()=>validateAuraGlow({...defaultAuraGlow(),...change}));
});
test('the ornate field maps every matrix address to a repeatable finite point',()=>{
 const space=readPersonalSpace(blankProject()),config=defaultAuraGlow();
 for(const [pattern] of GLOW_PATTERNS)for(let shell=0;shell<7;shell++)for(let cell=1;cell<=288;cell++){
  const c={...config,pattern},address={shell,cell},point=glowAddressPoint(c,space,address,2);
  assert.ok(point.every(Number.isFinite));assert.deepEqual(point,glowAddressPoint(c,space,address,2));
 }
 const a={shell:4,cell:47},point=glowAddressPoint(config,space,a);
 assert.notDeepEqual(point,glowAddressPoint({...config,seed:3},space,a));assert.notDeepEqual(point,glowAddressPoint(config,space,a,10));
 assert.notDeepEqual(point,glowAddressPoint(config,{...space,radii:space.radii.map((r,i)=>i===4?r*.8:r)},a));
 assert.notDeepEqual(point,glowAddressPoint(config,{...space,height:space.height*1.2},a));
 for(const a of [{shell:7,cell:1},{shell:0,cell:0},{shell:0,cell:289}])assert.throws(()=>glowAddressPoint(config,space,a));
});
