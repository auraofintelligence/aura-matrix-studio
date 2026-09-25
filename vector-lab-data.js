import {parseCSV} from './core.js?v=0.4.17';

export const LAB_FORMAT='aura-vector-lab/1';
export const ALGORITHMS={words:'Word patterns · TF-IDF',phrases:'Words + pairs · TF-IDF'};
export const COLOURS=['#ed635d','#f5a34e','#efd56b','#66d49c','#69b7ff','#a191ff','#d99ff2'];
export const emptyLab=()=>({format:LAB_FORMAT,records:[],runs:[],events:[],algorithm:'words',projection:null});
const id=()=>crypto.randomUUID();
export function record(text,source={},title=''){
  return {id:id(),text:String(text),title:String(title||String(text).slice(0,70)),source,position:[0,0,0],values:[],anchors:[],colour:COLOURS[0],direction:[0,1,0],charge:0,frequency:0,pinned:false};
}
export function parseImport(name,text){
  let items=[];
  if(/\.csv$/i.test(name)){
    const csv=parseCSV(text);items=csv.rows.map((r,i)=>record(csv.headers.map((h,j)=>h+': '+(r[j]||'')).join('\n'),{file:name,row:i+2}));
  }else if(/\.json$/i.test(name)){
    const raw=JSON.parse(text);if(raw?.format===LAB_FORMAT)throw Error('Use Restore lab for a Vector Space backup.');
    const list=Array.isArray(raw)?raw:raw.conversations||raw.messages||raw.records;
    if(!Array.isArray(list))throw Error('Use a JSON list of text records, messages, or conversations.');
    const content=m=>typeof m==='string'?m:typeof m?.content==='string'?m.content:m?.content?.parts?.filter(p=>typeof p==='string').join('\n')||m?.text||'';
    for(const [i,item]of list.entries()){
      if(item?.mapping){for(const [key,node]of Object.entries(item.mapping)){const m=node?.message,t=content(m);if(t.trim())items.push(record(t,{file:name,conversation:item.id||item.title||String(i),message:key,parent:node.parent||null,role:m.author?.role||'',timestamp:m.create_time??null},item.title?item.title+' · '+(m.author?.role||'message'):''));}}
      else if(Array.isArray(item?.messages)){for(const m of item.messages){const t=content(m);if(t.trim())items.push(record(t,{file:name,conversation:item.id||item.title||String(i),role:m.role||m.sender||'',timestamp:m.created_at||m.timestamp||null}));}}
      else{const t=content(item);if(t.trim())items.push(record(t,{file:name,row:i+1,role:item?.role||'',timestamp:item?.timestamp||null},item?.title||''));}
    }
  }else items=text.split(/\n\s*\n/).filter(s=>s.trim()).map((s,i)=>record(s.trim(),{file:name,paragraph:i+1}));
  if(!items.length)throw Error('No readable text records found.');
  return items;
}
export function mergeImport(existing,incoming){
  const key=r=>JSON.stringify([r.text,r.source]),seen=new Set(existing.map(key)),result=[...existing];
  for(const r of incoming){const k=key(r);if(!seen.has(k)){result.push(r);seen.add(k);}}return result;
}
const STOP=new Set('a an the and or but to of in on at for from with is are was were be been it its this that i you we they my your our as by do does did have has had'.split(' '));
function terms(text,algorithm){const words=(text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(w=>w.length>1&&!STOP.has(w));return algorithm==='phrases'?[...words,...words.slice(1).map((w,i)=>words[i]+' '+w)]:words;}
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*(b[i]||0),0);
const normalise=a=>{const norm=Math.sqrt(dot(a,a));return norm?a.map(x=>x/norm):a.map(()=>0);};
// Deterministic principal-component projection. Full vectors remain unchanged.
export function projectVectors(vectors){
  if(!vectors.length)return {positions:[],basis:[],mean:[]};
  const d=vectors[0].length,mean=Array(d).fill(0);for(const v of vectors)v.forEach((x,j)=>mean[j]+=x/vectors.length);
  const rows=vectors.map(v=>v.map((x,j)=>x-mean[j])),basis=[];
  for(let k=0;k<3;k++){
    let axis=normalise(Array.from({length:d},(_,j)=>Math.sin((j+1)*(k+1)*1.618)));
    for(let n=0;n<28;n++){
      const next=Array(d).fill(0);for(const r of rows){const weight=dot(r,axis);r.forEach((x,j)=>next[j]+=x*weight);}
      for(const prev of basis){const overlap=dot(next,prev);next.forEach((_,j)=>next[j]-=overlap*prev[j]);}
      axis=normalise(next);
    }
    const dominant=axis.reduce((a,x,j)=>Math.abs(x)>Math.abs(axis[a]||0)?j:a,0);if(axis[dominant]<0)axis=axis.map(x=>-x);basis.push(axis);
  }
  const coords=rows.map(r=>basis.map(a=>dot(r,a)));let extent=1e-9;for(const p of coords)for(const x of p)extent=Math.max(extent,Math.abs(x));
  return {positions:coords.map(p=>p.map(x=>x/extent*.8)),basis,mean};
}
export function analyseRecords(records,algorithm='words'){
  if(!ALGORITHMS[algorithm])throw Error('Unknown algorithm.');
  const documents=records.map(r=>terms(r.text,algorithm)),df=new Map();
  for(const words of documents)for(const t of new Set(words))df.set(t,(df.get(t)||0)+1);
  // Bounded feature count is explicit in run metadata, not a record limit.
  const vocabulary=[...df].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,768).map(([t])=>t),index=new Map(vocabulary.map((t,i)=>[t,i]));
  if(!vocabulary.length)throw Error('Add some descriptive text before analysing.');
  const vectors=documents.map(words=>{const v=Array(vocabulary.length).fill(0);for(const w of words)if(index.has(w))v[index.get(w)]++;return normalise(v.map((n,j)=>n? (1+Math.log(n))*(1+Math.log((records.length+1)/(df.get(vocabulary[j])+1))):0));});
  const projection=projectVectors(vectors);
  return {records:records.map((r,i)=>({...r,values:vectors[i],position:r.pinned?r.position:projection.positions[i]})),projection:{method:'PCA, three components; uniform scale to volume',basis:projection.basis,mean:projection.mean},run:{id:id(),at:new Date().toISOString(),algorithm,version:'tfidf-pca/1',vocabulary,featureLimit:768,records:records.length,inputIds:records.map(r=>r.id)}};
}
export function nearest(records,selected,limit=5){if(!selected?.values.length)return [];return records.filter(r=>r.id!==selected.id&&r.values.length===selected.values.length).map(r=>({record:r,score:dot(r.values,selected.values)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);}
export function validateLab(raw){
  if(raw?.format!==LAB_FORMAT||!Array.isArray(raw.records)||!Array.isArray(raw.events)||!Array.isArray(raw.runs)||!ALGORITHMS[raw.algorithm])throw Error('Not a supported Vector Space backup.');
  const ids=new Set(),triple=(v,bound)=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=bound);
  for(const r of raw.records){
    if(typeof r.id!=='string'||ids.has(r.id)||typeof r.text!=='string'||typeof r.title!=='string'||!r.source||typeof r.source!=='object'||!triple(r.position,1)||!triple(r.direction,1)||!Number.isFinite(r.charge)||Math.abs(r.charge)>1||!Number.isFinite(r.frequency)||r.frequency<0||r.frequency>2||!/^#[0-9a-f]{6}$/i.test(r.colour)||typeof r.pinned!=='boolean'||!Array.isArray(r.values)||r.values.length>768||!r.values.every(Number.isFinite)||!Array.isArray(r.anchors))throw Error('Invalid memory record in backup.');
    for(const a of r.anchors)if(!a||!((['facet','edge-u','edge-v','vertex','stack'].includes(a.kind)&&Number.isInteger(a.shell)&&a.shell>=0&&a.shell<7&&Number.isInteger(a.index)&&a.index>=1&&a.index<=288&&['I','O'].includes(a.side)&&(a.kind!=='stack'||Number.isInteger(a.layer)&&a.layer>=1&&a.layer<=16777215))||(a.kind==='geosphere'&&Number.isInteger(a.index)&&a.index>=1&&a.index<=80&&['I','O'].includes(a.side))))throw Error('Invalid geometry address.');
    for(const a of r.anchors)if(a.kind==='geosphere'&&(a.lat!==undefined||a.lon!==undefined||a.body!==undefined)&&!(a.body==='Earth'&&Number.isFinite(a.lat)&&Math.abs(a.lat)<=90&&Number.isFinite(a.lon)&&Math.abs(a.lon)<=180))throw Error('Invalid geographic coordinates.');
    ids.add(r.id);
  }
  for(const e of raw.events)if(!e||typeof e.at!=='string'||typeof e.kind!=='string'||(e.recordId!==undefined&&typeof e.recordId!=='string'))throw Error('Invalid activity log.');
  for(const run of raw.runs)if(!run||typeof run.id!=='string'||typeof run.at!=='string'||!ALGORITHMS[run.algorithm]||!Array.isArray(run.vocabulary)||run.vocabulary.length>768||!run.vocabulary.every(t=>typeof t==='string')||!Number.isInteger(run.records)||run.records<0)throw Error('Invalid analysis history.');
  if(raw.projection!==null&&(!raw.projection||typeof raw.projection.method!=='string'||!Array.isArray(raw.projection.basis)||raw.projection.basis.length!==3||!raw.projection.basis.every(v=>Array.isArray(v)&&v.length<=768&&v.every(Number.isFinite))||!Array.isArray(raw.projection.mean)||!raw.projection.mean.every(Number.isFinite)))throw Error('Invalid projection.');
  return structuredClone(raw);
}
export function exampleRecords(){return [
  ['A coastal journey','Plan a coastal journey with time for swimming, local food and quiet beaches.'],
  ['A meal with friends','Invite friends to share local food and talk about our travel plans.'],
  ['Learning together','Explore new ideas with friends and build a small creative project.'],
  ['Making a map','Build a map of places to visit on the coastal journey.'],
  ['Time to reflect','Keep quiet time to reflect on ideas and record what I learn.'],
  ['Creating with colour','Use colour and shapes to explore ideas for a creative project.'],
  ['Watching the sky','Watch the stars from a quiet beach and record the date.'],
  ['A shared celebration','Make time for friends, a shared meal and a celebration.']
  ].map(([title,text],i)=>({...record(text,{example:true},title),colour:COLOURS[i%7]}));}
