import test from 'node:test';
import assert from 'node:assert/strict';
import {mountMenuCamera} from '../menu-camera.js';
test('camera stays off until requested and releases tracks on toggle, leaving and late permission',async()=>{
  const oldDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  const classes=new Set(),controls=[{setAttribute(){}}],nodes=[],listeners=new Map();let calls=0,stops=0,grant;
  const stream={getTracks:()=>[{stop:()=>stops++}]};
  const node=()=>({hidden:false,setAttribute(){},remove(){},async play(){}});
  const screen={classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c)},querySelectorAll:()=>controls,prepend:n=>nodes.push(n),append:n=>nodes.push(n)};
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false,createElement:node,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async constraints=>{calls++;assert.equal(constraints.audio,false);return stream;}}}});
  try{
    const camera=mountMenuCamera(screen);assert.equal(calls,0);await camera.toggle();assert.ok(classes.has('camera-on'));await camera.toggle();assert.equal(stops,1);assert.ok(!classes.has('camera-on'));
    await camera.toggle();document.hidden=true;listeners.get('visibilitychange')();assert.equal(stops,2);camera.dispose();assert.equal(listeners.size,0);
    document.hidden=false;navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>grant=resolve);const later=mountMenuCamera(screen),pending=later.toggle();later.dispose();grant(stream);await pending;assert.equal(stops,3);assert.ok(!classes.has('camera-on'));
    navigator.mediaDevices.getUserMedia=async()=>{throw Object.assign(new Error('Denied'),{name:'NotAllowedError'});};const denied=mountMenuCamera(screen);await denied.toggle();assert.match(nodes.at(-1).textContent,/not granted/);denied.dispose();
  }finally{if(oldDocument)Object.defineProperty(globalThis,'document',oldDocument);else delete globalThis.document;if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}
});
