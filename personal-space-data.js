import {AVATAR_SECTIONS,avatarValues,saveAvatar} from './avatar-data.js?v=0.4.2';
import {validateProject} from './core.js?v=0.4.2';
export const SPACE_LAYERS=[
 {id:'space-close',name:'Red',colour:'#e84b49',colourName:'Red',example:45},
 {id:'space-conversation',name:'Orange',colour:'#ed902e',colourName:'Orange',example:100},
 {id:'space-group',name:'Yellow',colour:'#d2ad16',colourName:'Yellow',example:160},
 {id:'space-public',name:'Green',colour:'#43a465',colourName:'Green',example:240},
 {id:'space-blue',name:'Blue',colour:'#3b8bdd',colourName:'Blue',example:320},
 {id:'space-indigo',name:'Indigo',colour:'#6555c5',colourName:'Indigo',example:400},
 {id:'space-violet',name:'Violet',colour:'#a460cb',colourName:'Violet',example:480}
];
const space=AVATAR_SECTIONS.find(s=>s.key==='space'),body=AVATAR_SECTIONS.find(s=>s.key==='reach');
const positive=v=>Number.isFinite(Number(v))&&Number(v)>0&&Number.isFinite(Number(v)*2);
export function readPersonalSpace(project){
 const values=avatarValues(project,space),savedHeight=avatarValues(project,body)['body-height'],height=positive(savedHeight)?Number(savedHeight):170;
 const raw=SPACE_LAYERS.map(l=>positive(values[l.id])?Number(values[l.id]):l.example),radii=raw.map((r,i)=>Math.max(r,...raw.slice(0,i).map((v,j)=>v+i-j)));
 const table=project.tables.find(t=>t.id==='aura-personal-space-shells');const meanings=SPACE_LAYERS.map(l=>{const row=table?.rows.find(r=>r.id===l.id);return row?.values[table.columns.indexOf('Meaning')]||'';});
 return {height,radii,meanings,notes:Object.fromEntries(['space-context','space-contact','space-adjustments'].map(k=>[k,values[k]||''])),example:SPACE_LAYERS.some(l=>!positive(values[l.id]))||!positive(savedHeight),adjusted:radii.some((r,i)=>r!==raw[i])};
}
export function changeSpaceRadius(radii,index,value){
 if(!Number.isInteger(index)||index<0||index>=SPACE_LAYERS.length||!Number.isFinite(value)||value<=0)throw Error('Choose a positive distance.');
 const next=[...radii];next[index]=Math.max(index+1,value);
 for(let i=index-1;i>=0;i--)next[i]=Math.min(next[i],next[i+1]-1);
 for(let i=index+1;i<next.length;i++)next[i]=Math.max(next[i],next[i-1]+1);
 return next;
}
export function spaceShells(height,radii){
 if(!Number.isFinite(height)||height<=0||radii.length!==SPACE_LAYERS.length||radii.some((r,i)=>!Number.isFinite(r)||r<=0||(i>0&&r<=radii[i-1])))throw Error('Use a positive height and seven increasing distances.');
 return SPACE_LAYERS.map((layer,i)=>({...layer,radius:radii[i],diameter:radii[i]*2}));
}
// One centimetre has the same screen length on both axes and on the person.
export function spaceDiagram(height,radii){
 const shells=spaceShells(height,radii),scale=78/Math.max(radii[6],height/2);
 return {scale,personHeight:height*scale,shells:shells.map(s=>({...s,radiusPx:s.radius*scale,diameterPx:s.diameter*scale}))};
}
export function savePersonalSpace(project,height,radii,meanings=[],notes={}){
 const shells=spaceShells(height,radii);
 let p=saveAvatar(project,body,{'body-height':String(height)});
 p=saveAvatar(p,space,{...notes,...Object.fromEntries(shells.map(s=>[s.id,String(s.radius)]))});
 // These additional social shells have their own table, separate from the fixed matrix.
 let table=p.tables.find(t=>t.id==='aura-personal-space-shells');
 const columns=['Title','Radius','Diameter','Unit','Person height','View','Meaning'];
 if(!table){table={id:'aura-personal-space-shells',name:'Personal space aura shells',category:'self',recommendation:'boundaries',columns:[],rows:[],chakraTags:[0,3,4]};p.tables.push(table);}
 for(const c of columns)if(!table.columns.includes(c)){table.columns.push(c);table.rows.forEach(r=>r.values.push(''));}
 for(const [index,shell]of shells.entries()){let row=table.rows.find(r=>r.id===shell.id);if(!row){row={id:shell.id,values:table.columns.map(()=> '')};table.rows.push(row);}const data={Title:shell.name,Radius:String(shell.radius),Diameter:String(shell.diameter),Unit:'cm','Person height':String(height),View:'2D personal-space shells'};if(meanings[index]!==undefined)data.Meaning=String(meanings[index]).trim().slice(0,2000);for(const [key,v]of Object.entries(data))row.values[table.columns.indexOf(key)]=v;}
 return validateProject(p);
}
