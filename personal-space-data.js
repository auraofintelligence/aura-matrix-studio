import {AVATAR_SECTIONS,avatarValues,saveAvatar} from './avatar-data.js?v=0.4.7';
import {validateProject} from './core.js?v=0.4.7';
export const SPACE_LAYERS=[
 {id:'space-close',name:'Red',colour:'#e84b49',colourName:'Red',example:45},
 {id:'space-conversation',name:'Orange',colour:'#ed902e',colourName:'Orange',example:60},
 {id:'space-group',name:'Yellow',colour:'#d2ad16',colourName:'Yellow',example:75},
 {id:'space-public',name:'Green',colour:'#43a465',colourName:'Green',example:90},
 {id:'space-blue',name:'Blue',colour:'#3b8bdd',colourName:'Blue',example:110},
 {id:'space-indigo',name:'Indigo',colour:'#6555c5',colourName:'Indigo',example:130},
 {id:'space-violet',name:'Violet',colour:'#a460cb',colourName:'Violet',example:150}
];
const space=AVATAR_SECTIONS.find(s=>s.key==='space'),body=AVATAR_SECTIONS.find(s=>s.key==='reach');
const positive=v=>Number.isFinite(Number(v))&&Number(v)>0&&Number.isFinite(Number(v)*2);
export function readPersonalSpace(project){
 const values=avatarValues(project,space),savedHeight=avatarValues(project,body)['body-height'],height=positive(savedHeight)?Number(savedHeight):170;
 const raw=SPACE_LAYERS.map(l=>positive(values[l.id])?Number(values[l.id]):l.example),radii=raw.map((r,i)=>Math.max(r,...raw.slice(0,i).map((v,j)=>v+i-j)));
 const table=project.tables.find(t=>t.id==='aura-personal-space-shells');const meanings=SPACE_LAYERS.map(l=>{const row=table?.rows.find(r=>r.id===l.id);return row?.values[table.columns.indexOf('Meaning')]||'';});
 return {height,radii,meanings,figure:table?.rows[0]?.values[table.columns.indexOf('Reference figure')]==='female'?'female':'male',notes:Object.fromEntries(['space-context','space-contact','space-adjustments'].map(k=>[k,values[k]||''])),example:SPACE_LAYERS.some(l=>!positive(values[l.id]))||!positive(savedHeight),adjusted:radii.some((r,i)=>r!==raw[i])};
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
// A horn torus with independent horizontal radius and vertical body-height stretch.
export function personalTorusPoint(radius,height,u,v){
 const ring=radius/2,rho=ring*(1+Math.cos(v));
 return [rho*Math.cos(u),height/2*Math.sin(v),rho*Math.sin(u)];
}
// Zoom changes the camera scale, never the relative size of person and shells.
export function spaceDiagram(height,radii,view='top',focus=null,viewport={width:336,height:218},framing='all',zoom=1){
 if(!['top','side'].includes(view))throw Error('Choose a top or side view.');
 if(focus!==null&&(!Number.isInteger(focus)||focus<0||focus>6))throw Error('Choose one of the seven layers.');
 const shells=spaceShells(height,radii),extent=focus===null?radii[6]:Math.max(radii[focus],height*.6);
 const halfWidth=(viewport.width-32)/2,availableHeight=Math.max(80,viewport.height-70);
 let scale=view==='top'?Math.min(halfWidth,availableHeight/2)/Math.max(extent,height*.6):Math.min(halfWidth/extent,availableHeight/height);
 if(framing==='person')scale=view==='side'?Math.min(availableHeight/height,halfWidth/(height*.55)):Math.min(halfWidth,availableHeight/2)/(height*.65);
 scale*=zoom;
 return {scale,personHeight:height*scale,shells:shells.map(s=>({...s,radiusPx:s.radius*scale,diameterPx:s.diameter*scale}))};
}
export function savePersonalSpace(project,height,radii,meanings=[],notes={},figure){
 if(figure!==undefined&&!['male','female'].includes(figure))throw Error('Choose a reference figure.');
 const shells=spaceShells(height,radii);
 let p=saveAvatar(project,body,{'body-height':String(height)});
 p=saveAvatar(p,space,{...notes,...Object.fromEntries(shells.map(s=>[s.id,String(s.radius)]))});
 // These additional social shells have their own table, separate from the fixed matrix.
 let table=p.tables.find(t=>t.id==='aura-personal-space-shells');
 const columns=['Title','Radius','Diameter','Unit','Person height','View','Meaning'];if(figure!==undefined)columns.push('Reference figure');
 if(!table){table={id:'aura-personal-space-shells',name:'Personal space aura shells',category:'self',recommendation:'boundaries',columns:[],rows:[],chakraTags:[0,3,4]};p.tables.push(table);}
 for(const c of columns)if(!table.columns.includes(c)){table.columns.push(c);table.rows.forEach(r=>r.values.push(''));}
 for(const [index,shell]of shells.entries()){let row=table.rows.find(r=>r.id===shell.id);if(!row){row={id:shell.id,values:table.columns.map(()=> '')};table.rows.push(row);}const data={Title:shell.name,Radius:String(shell.radius),Diameter:String(shell.diameter),Unit:'cm','Person height':String(height),View:'2D personal-space shells'};if(figure!==undefined)data['Reference figure']=figure;if(meanings[index]!==undefined)data.Meaning=String(meanings[index]).trim().slice(0,2000);for(const [key,v]of Object.entries(data))row.values[table.columns.indexOf(key)]=v;}
 return validateProject(p);
}
