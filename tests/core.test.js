import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {ROWS,COLS,CELLS,SHELLS,PRESETS,address,neighbours,point,shellPoint,poseAt,blankProject,validateProject,parseCSV,recordsFromCSV,exampleRecords} from '../core.js?v=0.3.0';

test('fixed lattice has 4032 unique face addresses and cannot accept other dimensions',()=>{
  assert.equal(ROWS,12);assert.equal(COLS,24);assert.equal(CELLS,288);
  const ids=new Set();for(let s=0;s<7;s++)for(const face of ['I','O'])for(let c=1;c<=288;c++)ids.add(address(s,c,face));assert.equal(ids.size,4032);
  for(const n of [0,289,1.5,NaN])assert.throws(()=>address(0,n,'I'));
  assert.throws(()=>validateProject({...blankProject(),columns:45}));assert.throws(()=>validateProject({...blankProject(),rows:24}));
});
test('horn surface agrees with independent closed form, including all coincident seam identities',()=>{
  const r=12/(2*Math.PI);
  for(let row=0;row<=12;row++)for(let col=0;col<=24;col++){
    const u=col/24,v=row/12,p=point(u,v,PRESETS.horn),q=r*(1-Math.cos(2*Math.PI*v)),expected=[q*Math.sin((u-.5)*Math.PI*2),-r*Math.sin(v*Math.PI*2),q*Math.cos((u-.5)*Math.PI*2)];
    p.forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<1e-10));
  }
  for(let c=0;c<24;c++)assert.ok(Math.hypot(...point(c/24,0,PRESETS.horn))<1e-10);
  assert.equal(new Set(Array.from({length:24},(_,c)=>address(0,c+1,'I'))).size,24);
});
test('flat matrix dimensions and wrapped neighbours remain correct',()=>{
  assert.deepEqual(point(0,0,PRESETS.flat),[-12,6,0]);assert.deepEqual(point(1,1,PRESETS.flat),[12,-6,0]);
  assert.deepEqual(neighbours(1),{north:265,east:2,south:25,west:24});
  for(let n=1;n<=288;n++){assert.equal(neighbours(neighbours(n).east).west,n);assert.equal(neighbours(neighbours(n).south).north,n);}
});
test('story is finite, continuous at shot boundaries and reversible by seeking',()=>{
  const story=blankProject().story;
  for(let t=0;t<=36;t+=.125){const at=poseAt(story,t);for(let s=0;s<7;s++){const p=shellPoint(.42,.7,at.pose,s);assert.ok(p.every(Number.isFinite));}}
  for(let t=6;t<36;t+=6){const before=poseAt(story,t-1e-6).pose,after=poseAt(story,t+1e-6).pose;for(const k of ['curl','ring','pinch','nest','arrange'])assert.ok(Math.abs(before[k]-after[k])<1e-8);}
  const sample=poseAt(story,15);poseAt(story,29);assert.deepEqual(poseAt(story,15),sample);
  assert.deepEqual(poseAt(story,-2).pose,poseAt(story,0).pose);
});
test('CSV handles quoted data and 600 records without changing the matrix',()=>{
  const csv=parseCSV('\uFEFFTitle,Note\r\n"A, B","Line 1\nLine 2"\r\nC,"A ""quote"""');assert.equal(csv.rows[0][0],'A, B');assert.equal(csv.rows[1][1],'A "quote"');
  const rows=parseCSV('Title,Note\n'+Array.from({length:600},(_,i)=>`Record ${i},Meaning ${i}`).join('\n'));let i=0;
  const records=recordsFromCSV(rows,{title:'Title',note:'Note',shell:0,face:'I',start:1,cell:''},()=>String(++i));
  assert.equal(records.length,600);assert.equal(records[288].cell,1);assert.equal(records[599].cell,24);assert.equal(records[2].fields.Note,'Meaning 2');
  assert.throws(()=>parseCSV('a,b\n"oops,b'));assert.throws(()=>parseCSV('a,a\n1,2'));assert.throws(()=>parseCSV('a,b\n1,2,3'));
  assert.throws(()=>recordsFromCSV(parseCSV('title,cell\na,289'),{title:'title',cell:'cell',shell:0,face:'I',start:1},()=>String(++i)));
});
test('backup round trip preserves both sides, imported fields and links; invalid imports are atomic',()=>{
  const p=blankProject();let i=0;p.records=exampleRecords(()=>String(++i));p.records[1].face='O';p.links=[{from:'1',to:'2',label:'asks'}];
  assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
  const snapshot=JSON.stringify(p);assert.throws(()=>validateProject({...p,links:[{from:'1',to:'missing',label:'bad'}]}));assert.equal(JSON.stringify(p),snapshot);
  assert.throws(()=>validateProject({...p,records:[p.records[0],p.records[0]]}));
  assert.throws(()=>validateProject({...p,story:[{preset:'__proto__',duration:5,camera:'front',caption:'bad'}]}));
});
test('local routes and assets exist; pages have unique IDs and no remote runtime dependencies',()=>{
  for(const file of ['index.html','matrix.html','inventory.html','explainer.html','guide.html']){
    const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${file}`);
    for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^https?:/.test(m[1]))continue;assert.ok(existsSync(new URL('../'+m[1].split('#')[0],import.meta.url)),`${file}: ${m[1]}`);}
    assert.ok(!/<script[^>]+src="https?:/.test(html));
  }
});
test('write cross-implementation fixture for Blender and future runtimes',()=>{
  mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});
  const p=blankProject(),frames=[0,3,6,7,9,12,14,18,20,24,25,27,30,32,36];
  const fixture={format:'aura-explainer/1',lattice:p.lattice,rows:12,columns:24,shell:0,cell:97,face:'I',story:p.story};
  writeFileSync(new URL('../test-results/example-explainer.json',import.meta.url),JSON.stringify(fixture,null,2));
  writeFileSync(new URL('../test-results/geometry-fixture.json',import.meta.url),JSON.stringify(frames.map(time=>({time,pose:poseAt(p.story,time).pose,points:SHELLS.map((_,s)=>shellPoint(.37,.63,poseAt(p.story,time).pose,s))})),null,2));
});
