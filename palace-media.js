import {rows,saveRow} from './local-tools.js?v=0.4.14';

export const PLACE_TABLE='aura-palace-places',MEDIA_TABLE='aura-palace-media';
const kinds={jpg:'Photo',jpeg:'Photo',png:'Photo',webp:'Photo',avif:'Photo',mp4:'Video',webm:'Video',mov:'Video',glb:'Scan / model',gltf:'Scan / model',obj:'Scan / model',ply:'Scan / model',stl:'Scan / model',e57:'Scan / model',las:'Scan / model',laz:'Scan / model',zip:'Scan / model'};
export const CAPTURE_ACCEPT=Object.keys(kinds).map(x=>'.'+x).join(',');
export function mediaKind(name){return kinds[String(name).split('.').pop().toLowerCase()]||null;}
export function savePlace(project,fields,id=crypto.randomUUID()){
 if(!fields.Title?.trim())throw Error('Name the place you are capturing.');
 if(!fields.Section)throw Error('Choose a palace collection.');
 if(fields.Dataset&&!project.tables.some(t=>t.id===fields.Dataset))throw Error('Choose an available Aura table.');
 return saveRow(project,PLACE_TABLE,'Mind palace places',fields,id,'place');
}
export function attachMedia(project,placeId,files,role='Source'){
 if(!rows(project,PLACE_TABLE).some(p=>p.id===placeId))throw Error('Save the place before adding its media.');
 if(!['Source','Result'].includes(role))throw Error('Choose source media or a reconstruction result.');
 let p=project;
 for(const f of files){const kind=mediaKind(f.name);if(!kind||!f.size)throw Error(`Unsupported or empty file: ${f.name}`);if(!f.id)throw Error('The media needs a storage reference.');
  p=saveRow(p,MEDIA_TABLE,'Mind palace media',{Place:placeId,Title:f.name,Kind:kind,Role:role,Bytes:f.size,Type:f.type||'',Storage:'This browser',Added:new Date().toISOString()},f.id,'assets');
 }return p;
}
export function reconstructionBrief(project,placeId){
 const place=rows(project,PLACE_TABLE).find(p=>p.id===placeId);if(!place)throw Error('This place is unavailable.');
 const files=rows(project,MEDIA_TABLE).filter(f=>f.Place===placeId);
 return {format:'aura-palace-reconstruction-v1',place:{id:place.id,title:place.Title,description:place.Notes||''},
  aim:'Reconstruct this captured place as a realistic navigable environment. Preserve observed layout and landmarks. Identify uncertain or invented geometry; do not silently replace it with an imagined room.',
  sourceMedia:files.filter(f=>f.Role==='Source'),resultMedia:files.filter(f=>f.Role==='Result'),
  dataTableId:place.Dataset||null,instructions:place.Instructions||'',status:'Awaiting a connected reconstruction tool',
  fileTransfer:'Media files are stored separately in this browser. Supply the original files alongside this manifest. No files or table contents are sent by this export.'};
}
function openStore(){return new Promise((resolve,reject)=>{const request=indexedDB.open('aura-palace-media',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Close older Aura tabs, then try the import again.'));});}
export async function storeMedia(files){const db=await openStore();try{await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');for(const f of files)tx.objectStore('files').put(f.blob,f.id);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Media storage was interrupted.'));tx.onerror=()=>{};});}finally{db.close();}}
export async function loadMedia(id){const db=await openStore();try{return await new Promise((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}finally{db.close();}}
export async function deleteMedia(ids){const db=await openStore();try{await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');for(const id of ids)tx.objectStore('files').delete(id);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
