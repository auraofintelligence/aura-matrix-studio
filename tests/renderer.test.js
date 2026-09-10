import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {PRESETS} from '../core.js?v=0.3.2';
import {target,targetPoint} from '../spatial.js?v=0.3.2';

test('actual Three scene draws all 100 layers and keeps markers and connections aligned after resizing the stack',async()=>{
  const context={};vm.runInNewContext(readFileSync(new URL('../vendor/three.min.js',import.meta.url),'utf8'),context);
  const T=context.THREE,oldThree=globalThis.THREE,oldDocument=globalThis.document,text=[];
  globalThis.THREE=T;
  // Canvas text stub only: this exercises scene geometry without a browser or WebGL.
  globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(value){text.push(value);}})})};
  try{
    const {AuraView}=await import('../renderer.js?v=0.3.2'),view=Object.create(AuraView.prototype);
    const mesh=()=>new T.Mesh(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([],3)).setAttribute('color',new T.Float32BufferAttribute([],3)),new T.MeshBasicMaterial());
    const anchor=target(0,'O','stack',159,50);
    Object.assign(view,{pose:{...PRESETS.horn},shell:0,face:'O',selection:anchor,kind:'facet',vectors:[],records:[],links:[],stacks:[{shell:0,face:'O',cell:159,count:100}],meshes:Array.from({length:7},mesh),wires:Array.from({length:7},mesh),parameters:[],lineParameters:[],marker:new T.Object3D(),connect:mesh(),spatialGroup:new T.Group(),render(){}});
    view.update();
    assert.deepEqual(view.stackPicking.filter(o=>o.isMesh).map(o=>o.userData.target.layer),Array.from({length:100},(_,i)=>i+1));
    const expected=targetPoint(anchor,view.pose),record={shell:0,face:'O',cell:159,anchor};
    assert.deepEqual(Array.from(view.marker.position.toArray()),expected);assert.deepEqual(view.centre(record),expected);
    const first=view.stackPicking.find(o=>o.userData.target.layer===1).geometry.attributes.position.array;
    const last=view.stackPicking.find(o=>o.userData.target.layer===100).geometry.attributes.position.array;
    assert.ok(Math.abs(Math.hypot(...[0,1,2].map(i=>last[i]-first[i]))-1.188)<1e-5);
    assert.ok(text.includes('+100'));assert.ok(!text.some(t=>t.includes('sampled')));
    view.stacks[0].count=16777215;view.pose.explodeStacks=1;view.update();
    assert.equal(view.stackPicking.filter(o=>o.isMesh).length,257);
    assert.ok(text.includes('+16777215 (sampled)'));
    assert.deepEqual(Array.from(view.marker.position.toArray()),targetPoint(anchor,view.pose));
    assert.notDeepEqual(Array.from(view.marker.position.toArray()),expected);
    const frame=view.stackPicking.find(o=>o.isMesh&&o.userData.target.layer===16777215);
    assert.equal(frame.material.color.getHexString(),'e23a2d');
    view.stacks=[];view.selection=null;view.kind='vertex';view.rayMode='vertices';view.update();
    const rays=view.spatialGroup.children.filter(o=>o.isLineSegments);
    assert.equal(rays.length,1);assert.equal(rays[0].geometry.attributes.position.count,264*2);
  }finally{globalThis.THREE=oldThree;globalThis.document=oldDocument;}
});
