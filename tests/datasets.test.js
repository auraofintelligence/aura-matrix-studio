import {mapPages,pageTitle} from '../original-sitemap.js?v=0.3.2';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js?v=0.3.2';
import {allocateTable,allocationPlan} from '../dataset-allocation.js?v=0.3.2';
import {turnPage,swipeDirection,saveQuickEntry,validBirthday} from '../quickstart.js?v=0.3.2';
import {HOME,PROGRAMMER,FINITE,TORUS,COLOUR_PAGES,livePage,parentPage,stageBounds} from '../original-routes.js?v=0.3.2';
const source=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url)));
const catalogue=JSON.parse(readFileSync(new URL('../assets/dataset-catalogue.json',import.meta.url)));
const fixture=(count=3)=>{const p=blankProject();p.tables=[{id:'t',name:'Chosen data',category:'assets',recommendation:'imports',columns:['Title','Details','Asset','Instructions'],chakraTags:[0,3,5],rows:Array.from({length:count},(_,i)=>({id:'r'+i,values:['Row '+i,'Required information '+i,'https://example.org/'+i,'Recall and review '+i]}))}];return p;};

test('every original page has dataset recommendations with reasons and valid source references',()=>{
  assert.equal(catalogue.pageReview.length,source.pages.length);assert.equal(catalogue.datasets.length,37);assert.equal(catalogue.steps.length,10);
  const ids=new Set(source.pages.map(p=>p.id)),datasets=new Set(catalogue.datasets.map(d=>d.id));
  assert.equal(new Set(catalogue.pageReview.map(p=>p.pageId)).size,145);
  for(const page of catalogue.pageReview){assert.ok(ids.has(page.pageId));assert.ok(page.datasets.length);for(const id of page.datasets)assert.ok(datasets.has(id));}
  for(const d of catalogue.datasets){assert.ok(d.columns.length);assert.ok(d.chakraRelevance.length);for(const r of d.chakraRelevance){assert.ok(r.shell>=0&&r.shell<=6);assert.ok(r.reason.trim());}for(const id of d.sourcePages)assert.ok(ids.has(id));}
});
test('tables, arbitrary columns, multiple chakra tags and QuickStart cursor survive project backups',()=>{
  const p=fixture();p.quickStart.step=9;assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
  const legacy=blankProject();delete legacy.tables;delete legacy.quickStart;assert.deepEqual(validateProject(legacy).tables,[]);assert.equal(validateProject(legacy).quickStart.step,0);
  const bad=fixture();bad.tables[0].rows[0].values.pop();assert.throws(()=>validateProject(bad));
  const invalid=fixture();invalid.tables[0].chakraTags=[7];assert.throws(()=>validateProject(invalid));
});
test('600 rows wrap across fixed facets without losing fields, instructions, data or source links',()=>{
  const p=fixture(600),options={shell:3,face:'I',start:287,mode:'facets'},plan=allocationPlan(p,'t',options);assert.equal(plan[2].target.index,1);
  let id=0;const result=allocateTable(p,'t',options,()=>String(++id));assert.equal(result.records.length,600);assert.equal(result.rows,12);assert.equal(result.columns,24);
  assert.equal(result.records[599].data.Details,'Required information 599');assert.equal(result.records[599].instructions,'Recall and review 599');assert.equal(result.records[599].asset.url,'https://example.org/599');assert.equal(result.records[599].fields['Aura chakra tags'],'0,3,5');
  assert.equal(p.records.length,0);assert.equal(allocationPlan(result,'t',options).length,0);assert.deepEqual(allocateTable(result,'t',options),result);
});
test('stack allocation appends ordered steps and repeated allocation adds only new rows',()=>{
  const p=fixture();p.stacks=[{shell:1,face:'O',cell:159,count:100}];let id=0;const options={shell:1,face:'O',start:159,mode:'stack'};
  const result=allocateTable(p,'t',options,()=>String(++id));assert.equal(result.stacks[0].count,103);assert.deepEqual(result.records.map(r=>r.anchor.layer),[101,102,103]);
  result.tables[0].rows.push({id:'extra',values:['Extra','Input','','Instruction']});const appended=allocateTable(result,'t',options,()=>String(++id));assert.equal(appended.stacks[0].count,104);assert.equal(appended.records.length,4);assert.equal(appended.records[3].anchor.layer,104);
  assert.equal(appended.selections['1/O'].layer,104);
});
test('invalid allocations fail atomically and preserve existing records and stacks',()=>{
  const p=fixture(),snapshot=JSON.stringify(p);p.tables[0].rows[2].values[2]='javascript:alert(1)';const before=JSON.stringify(p);
  let id=0;assert.throws(()=>allocateTable(p,'t',{shell:0,face:'I',start:1,mode:'stack'},()=>String(++id)));assert.equal(JSON.stringify(p),before);
  const q=JSON.parse(snapshot);q.stacks=[{shell:0,face:'I',cell:1,count:16777215}];assert.throws(()=>allocationPlan(q,'t',{shell:0,face:'I',start:1,mode:'stack'}));
});
test('back arrows resolve to a logical parent and every historical torus keeps fixed geometry',()=>{
  const pages=new Map(source.pages.map(p=>[p.id,p]));assert.equal(parentPage(pages.get(PROGRAMMER),pages),HOME);
  for(const id of [FINITE,...COLOUR_PAGES]){assert.equal(parentPage(pages.get(id),pages),PROGRAMMER);const box=stageBounds(pages.get(id));assert.ok(box[2]>500&&box[3]>100);}
  COLOUR_PAGES.forEach((id,shell)=>assert.deepEqual(livePage(id),{shell,face:'O',shape:'horn'}));
  assert.deepEqual(livePage(TORUS,new URLSearchParams('shell=3&face=I')),{shell:3,face:'I',shape:'horn'});
  assert.equal(livePage(HOME),null);assert.equal(livePage(TORUS,new URLSearchParams('shell=99')).shell,0);
});
test('reader swipe direction uses distance and direction; previous and next clamp at boundaries',()=>{
  assert.equal(swipeDirection(-90,4),1);assert.equal(swipeDirection(90,4),-1);assert.equal(swipeDirection(8,2),0);assert.equal(swipeDirection(40,80),0);
  assert.equal(turnPage(0,-1,10),0);assert.equal(turnPage(9,1,10),9);assert.equal(turnPage(4,1,10),5);
});

test('birthday entry validates real dates and updates one row without losing other tables',()=>{
 const rec=catalogue.datasets.find(d=>d.id==='life-events'),p=fixture();
 const saved=saveQuickEntry(p,rec,{Title:'My birthday',Date:'2000-02-29'},'my-birthday');
 assert.equal(saved.tables.length,2);assert.deepEqual(saved.tables[0],p.tables[0]);
 const updated=saveQuickEntry(saved,rec,{Date:'2004-02-29'},'my-birthday');assert.equal(updated.tables[1].rows.length,1);assert.equal(updated.tables[1].rows[0].values[2],'2004-02-29');
 assert.ok(validBirthday('2000-02-29'));assert.equal(validBirthday('2001-02-29'),false);assert.equal(validBirthday(''),false);
 assert.deepEqual(catalogue.steps.slice(0,8).map(s=>s.id),['birthday','avatar','family','dates','timing','favourites','skills','goals']);
 for(const step of catalogue.steps)for(const id of step.datasets)assert.ok(catalogue.datasets.some(d=>d.id===id));
});

test('site map reaches every original page through searchable names and parent sections',()=>{
 const all=source.pages,seen=new Set();const visit=parent=>{for(const p of mapPages(all,parent)){if(seen.has(p.id))continue;seen.add(p.id);visit(p.id);}};visit('');assert.equal(seen.size,145);
 assert.ok(mapPages(all,'','birthday').some(p=>p.name==='Birthdays'));assert.ok(mapPages(all,'','green torus').length);assert.equal(mapPages(all,'','no such page here').length,0);
 for(const p of all)assert.ok(pageTitle(p).length);
});
