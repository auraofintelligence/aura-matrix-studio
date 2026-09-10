import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject,PRESETS,SHELLS} from '../core.js?v=0.2.1';
import {target,targetKey,targetLabel,remembered,remember,parameters,targetPoint,rayEnd,stackColour,stackSamples,sequenceLength,sequenceStep,agentPackage,cameraFrame,parseValues} from '../spatial.js?v=0.2.1';

test('each torus and side starts unselected, remembers its own choice, and clears independently',()=>{
  let selections={};const red=target(0,'O','facet',17),green=target(3,'O','facet',42),inner=target(0,'I','vertex',25);
  assert.equal(remembered(selections,0,'O'),null);selections=remember(selections,red);
  assert.equal(remembered(selections,3,'O'),null);selections=remember(selections,green);
  assert.deepEqual(remembered(selections,0,'O'),red);assert.deepEqual(remembered(selections,3,'O'),green);
  assert.equal(remembered(selections,0,'I'),null);selections=remember(selections,inner);
  assert.deepEqual(remembered(selections,0,'O'),red);selections=remember(selections,null,3,'O');
  assert.equal(remembered(selections,3,'O'),null);assert.deepEqual(remembered(selections,0,'I'),inner);
  const project=validateProject({...blankProject(),selections});assert.deepEqual(validateProject(JSON.parse(JSON.stringify(project))).selections,selections);
  assert.throws(()=>validateProject({...blankProject(),selections:{'3/O':red}}));
});
test('vertex and both edge directions have distinct stable addresses independent of facets',()=>{
  const keys=new Set();for(const kind of ['facet','vertex','edge-u','edge-v'])for(let i=1;i<=288;i++)keys.add(targetKey(target(0,'O',kind,i)));assert.equal(keys.size,1152);
  assert.deepEqual(parameters(target(0,'O','vertex',25)),[0,1/12]);
  assert.deepEqual(parameters(target(0,'O','edge-u',1)),[.5/24,0]);
  assert.deepEqual(parameters(target(0,'O','edge-v',1)),[0,.5/12]);
  for(let i=1;i<=24;i++){assert.ok(Math.hypot(...targetPoint(target(0,'O','vertex',i),PRESETS.horn))<1e-10);assert.deepEqual(rayEnd(target(0,'O','vertex',i),PRESETS.horn),[0,4.4,0]);}
});
test('inside camera is inside the selected tube at every shell scale and body position',()=>{
  for(const p of [PRESETS.ring,PRESETS.horn,PRESETS.nested,PRESETS.body])for(let s=0;s<7;s++){
    const inside=cameraFrame(p,s,'I',0,0,16/9),outside=cameraFrame(p,s,'O',.55,.4,16/9);
    const scale=1+(((s+1)/7+(.44-(s+1)/7)*p.arrange)-1)*p.nest;
    const R=(24-12*p.pinch)/(2*Math.PI)*scale,r=12/(2*Math.PI)*scale,cy=(s-3)*2.3*p.arrange*p.nest;
    const [x,y,z]=inside.eye;assert.ok((Math.hypot(x,z)-R)**2+(y-cy)**2<r*r);assert.ok(inside.near<r*.1);assert.equal(inside.inside,true);assert.notDeepEqual(inside.eye,outside.eye);
    assert.notDeepEqual(inside.look,cameraFrame(p,s,'I',1,.3,16/9).look);
  }
  assert.ok(cameraFrame(PRESETS.flat,0,'I',0,0,1).eye[2]<0);assert.ok(cameraFrame(PRESETS.flat,0,'O',0,0,1).eye[2]>0);
});
test('a cubic point retains the full embedding separately from its 3D display coordinates',()=>{
  const p=blankProject();p.vectors=[{id:'v',label:'Memory',shell:2,face:'I',position:[.2,-.3,.4],values:Array.from({length:1024},(_,i)=>i/1024),anchor:target(2,'I','edge-u',100)}];
  p.selections=remember({},target(2,'I','volume','v'));const copy=validateProject(JSON.parse(JSON.stringify(p)));
  assert.equal(copy.vectors[0].values.length,1024);assert.deepEqual(targetPoint(p.selections['2/I'],PRESETS.horn,p.vectors),[.2*4.4,-.3*4.4,.4*4.4]);
  assert.throws(()=>validateProject({...p,vectors:[{...p.vectors[0],position:[2,0,0]}]}));assert.throws(()=>parseValues('[1,"2"]'));assert.throws(()=>parseValues('1 Infinity'));assert.deepEqual(parseValues('1, 2 3'),[1,2,3]);
});
test('stack colour advances by precisely one 24-bit value, including wrap, without allocating all layers',()=>{
  for(let s=0;s<7;s++)for(const layer of [1,2,100,16777215])assert.equal(parseInt(stackColour(s,layer).slice(1),16),(parseInt(SHELLS[s][1].slice(1),16)+layer)%16777216);
  assert.equal(stackColour(0,1),'#e23a2f');assert.notEqual(targetKey(target(0,'O','stack',97,1)),targetKey(target(0,'O','stack',97,2)));
  assert.ok(stackSamples(16777215,50000).length<=14);assert.ok(stackSamples(16777215,50000).includes(50000));
  const base=targetPoint(target(0,'O','facet',97),PRESETS.horn),a=targetPoint(target(0,'O','stack',97,1),PRESETS.horn),b=targetPoint(target(0,'O','stack',97,2),PRESETS.horn);
  const distance=p=>Math.hypot(...p.map((n,i)=>n-base[i]));assert.ok(distance(b)>distance(a));
});
test('compact stack sequences recall each layer with instructions, required data and asset links intact',()=>{
  const p=blankProject();p.stacks=[{shell:0,face:'O',cell:97,count:1000000}];const first=target(0,'O','stack',97,1),second=target(0,'O','stack',97,2);
  p.records=[{id:'input',title:'Compare readings',note:'Two sample observations',shell:0,cell:97,face:'O',anchor:second,fields:{units:'metres'},instructions:'Calculate the difference.',data:{readings:[2,5]},asset:{url:'https://example.com/data.csv'}},{id:'unrelated',title:'Other data',note:'Excluded from agent export',shell:1,cell:1,face:'I',fields:{}}];
  p.programs=[{id:'walk',name:'Stack programme',loop:false,steps:[{target:first,span:1000000,action:'recall',seconds:2}]}];
  const saved=validateProject(JSON.parse(JSON.stringify(p))),program=saved.programs[0];assert.equal(program.steps.length,1);assert.equal(sequenceLength(program),1000000);
  assert.equal(sequenceStep(program,0,saved).records.length,0);const result=sequenceStep(program,1,saved);assert.equal(result.target.layer,2);assert.equal(result.records[0].instructions,'Calculate the difference.');assert.deepEqual(result.records[0].data,{readings:[2,5]});assert.equal(result.records[0].asset.url,'https://example.com/data.csv');assert.equal(result.records[0].fields.units,'metres');assert.equal(sequenceStep(program,999999,saved).next,null);
  program.loop=true;assert.equal(sequenceStep(program,999999,saved).next,0);
  const pack=agentPackage(program,saved);assert.equal(pack.format,'aura-agent-program/1');assert.equal(pack.records.length,1);assert.deepEqual(pack.records[0].data,{readings:[2,5]});
  assert.throws(()=>validateProject({...p,stacks:[{shell:0,face:'O',cell:97,count:1}]}));
});
test('old backups migrate without discarding records; unsafe asset protocols and broken anchors are rejected',()=>{
  const old=blankProject();delete old.selections;delete old.stacks;delete old.programs;delete old.vectors;
  old.records=[{id:'r',title:'Legacy',shell:0,cell:17,face:'I',note:'Kept',fields:{a:'b'}}];const fresh=validateProject(old);assert.deepEqual(fresh.records,old.records);assert.deepEqual(fresh.selections,{});assert.deepEqual(fresh.stacks,[]);
  assert.throws(()=>validateProject({...old,records:[{...old.records[0],asset:{url:'javascript:alert(1)'}}]}));
  assert.throws(()=>validateProject({...old,records:[{...old.records[0],anchor:target(0,'I','stack',17,2)}]}));
  assert.throws(()=>validateProject({...old,records:[{...old.records[0],data:{reading:Infinity}}]}));
});
test('exploding and collapsing changes display positions while retaining addresses, order and inputs',()=>{
  const t=target(3,'O','stack',100,8),key=targetKey(t),compact=targetPoint(t,PRESETS.horn),expanded=targetPoint(t,{...PRESETS.horn,explodeStacks:1});
  assert.notDeepEqual(expanded,compact);assert.deepEqual(targetPoint(t,{...PRESETS.horn,explodeStacks:0}),compact);assert.equal(targetKey(t),key);
  const p=blankProject();p.stacks=[{shell:3,face:'O',cell:100,count:10}];p.programs=[{id:'p',name:'Order',loop:false,steps:[{target:{...t,layer:1},span:10,action:'visit',seconds:1}]}];
  for(let i=0;i<10;i++)assert.equal(sequenceStep(p.programs[0],i,p).target.layer,i+1);
});
