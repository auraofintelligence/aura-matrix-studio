import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {bounds,linkBounds,fitOriginal,colour,MATRIX_PAGES,openingPage,screenLayout} from '../original.js';
import {HOME,CAMERA_VARIANTS} from '../original-routes.js';
import {QUICKSTART} from '../quickstart.js';
import {framePoint,frameOrientation} from '../frame-display.js';

const source=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url),'utf8'));
const pages=new Map(source.pages.map(p=>[p.id,p]));
function* controls(items){for(const c of items){yield c;yield* controls(c.children);}}

test('original archive retains every screen, valid destination and referenced artwork',()=>{
  assert.equal(source.sourceSha256,'d769cc18650a1d5bc6e36764692dfec8456291f4ac6ef016ff00a543aee1b0ea');
  assert.equal(pages.size,145);assert.equal(pages.get(source.home).name,'Aura Menu');
  const assets=new Set();let links=0,back=0,unassigned=0;
  for(const page of pages.values()){
    assert.ok(page.width>0&&page.height>0);if(page.parent)assert.ok(pages.has(page.parent));
    for(const c of controls(page.controls)){
      assert.ok(bounds(c).every(Number.isFinite));
      if(c.properties.URL){assets.add(c.properties.URL);assert.ok(existsSync(new URL('../assets/mockplus/'+c.properties.URL,import.meta.url)));}
      for(const link of c.links){links++;if(!link.target)unassigned++;else if(link.target==='command:back')back++;else assert.ok(pages.has(link.target),link.target);
        for(const area of link.areas)assert.ok(linkBounds(area,c).every(Number.isFinite));
      }
    }
  }
  assert.equal(assets.size,153);assert.equal(links,621);assert.equal(back,138);assert.equal(unassigned,8);
});

test('Enter the Matrix and the original three programmer buttons retain source destinations and positions',()=>{
  const programmer='BDBC5806-9DB0-4CB2-901E-31E2E973173B';
  assert.ok([...controls(pages.get(source.home).controls)].some(c=>c.links.some(l=>l.target===programmer)));
  const p=pages.get(programmer);assert.deepEqual([p.width,p.height],[640,360]);
  for(const [name,box,target] of [
    ['Tool Inventory',[50,243,176,96],'C257728B-7CA9-485C-9069-09F15D808274'],
    ['Finite Map',[236,243,178,96],'1FE14FC9-F981-4E27-B038-BDF3FF404838'],
    ['Infinite Map',[425,243,171,96],'1773263D-945B-4087-ACEF-8C088C29FB47']
  ]){const c=p.controls.find(c=>c.controlTypeID==='Button'&&c.links.some(l=>l.title===name));assert.deepEqual(bounds(c),box);assert.equal(c.links[0].target,target);}
});

test('uniform scaling keeps the original screen and hit areas in view without reflow',()=>{
  for(const [w,h] of [[320,568],[360,640],[640,360],[1280,720]]){
    const scale=fitOriginal(640,360,w,h);assert.ok(640*scale<=w&&360*scale<=h);assert.equal((640*scale)/(360*scale),640/360);
  }
  assert.deepEqual(linkBounds({coords:'(12,3,80,29)'},{w:100,h:40}),[12,3,68,26]);
  assert.deepEqual(linkBounds(null,{w:100,h:40}),[0,0,100,40]);
  assert.equal(colour('4294901760'),'rgba(255,0,0,1)');
});

test('inside and outside source maps route to the fixed working model',()=>{
  assert.equal(MATRIX_PAGES['61CEB74B-9978-49D9-8514-E5D0F0E1E989'],'I');
  assert.equal(MATRIX_PAGES['BCB57A67-242E-4B77-9AC3-9B760D7181DD'],'O');
  assert.equal(MATRIX_PAGES['F8799D0F-5FC9-4A10-83A4-5D491C1DE094'],'I');
  assert.equal(MATRIX_PAGES['A6C23855-5F57-4601-8F6A-02749BA0895E'],'O');
  for(const id of Object.keys(MATRIX_PAGES))assert.ok(pages.has(id));
  assert.ok(!MATRIX_PAGES['0D39C84A-0C31-40C0-BDEF-D8F334131ECB']);
});

test('the opening route is QuickStart while links and camera menu aliases retain their destinations',()=>{
  for(const id of [null,undefined,'','missing'])assert.equal(openingPage(id,pages),QUICKSTART);
  assert.equal(openingPage(HOME,pages),HOME);
  const camera=Object.keys(CAMERA_VARIANTS).find(id=>CAMERA_VARIANTS[id]===HOME);
  assert.equal(openingPage(camera,pages),HOME);
  assert.equal(openingPage('DAFCEEE9-7303-415D-975B-AB7176A59010',pages),'DAFCEEE9-7303-415D-975B-AB7176A59010');
});

test('every frame retains its designed orientation and all corners remain accessible when the phone turns',()=>{
 for(const page of pages.values()){
  for(const [w,h]of [[320,568],[390,664],[568,320],[1280,720]]){
    const layout=screenLayout(page,w,h);assert.equal(layout.rotated,Math.min(w,h)<=600&&(page.width>page.height)!==(w>h)&&page.width!==page.height);
    assert.equal(frameOrientation(page),page.width>page.height?'landscape':'portrait');
    assert.ok(layout.width<=w+1e-8&&layout.height<=h+1e-8);
    // Both opposing corners of a menu button stay within the transformed frame.
    for(const c of page.controls)for(const [x,y]of [[+c.x,+c.y],[+c.x + +c.w,+c.y + +c.h]]){
      if(x<0||y<0||x>page.width||y>page.height)continue;
      const px=(layout.rotated?page.height-y:x)*layout.scale,py=(layout.rotated?x:y)*layout.scale;
      assert.ok(px>=-1e-8&&px<=layout.width+1e-8&&py>=-1e-8&&py<=layout.height+1e-8);
    }
  }
 }
});

test('rotated matrix picking and book gestures use the original frame coordinates',()=>{
 const element={clientWidth:640,clientHeight:360,closest:()=>true,getBoundingClientRect:()=>({left:10,top:20,width:180,height:320})};
 assert.deepEqual(framePoint(element,{clientX:145,clientY:260}),{u:.75,v:.25,x:480,y:90});
 const start=framePoint(element,{clientX:100,clientY:260}),end=framePoint(element,{clientX:100,clientY:100});
 assert.equal(end.x-start.x,-320);assert.equal(end.y-start.y,0);
 element.closest=()=>false;element.getBoundingClientRect=()=>({left:10,top:20,width:320,height:180});
 assert.deepEqual(framePoint(element,{clientX:250,clientY:65}),{u:.75,v:.25,x:480,y:90});
});
