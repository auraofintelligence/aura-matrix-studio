import {validateProject} from './core.js?v=0.4.17';
import {loadMedia,storeMedia,deleteMedia} from './palace-media.js?v=0.4.17';
import {readTravelProject,PROJECT_KEY} from './travel-data.js?v=0.4.17';
export const BACKUP_FORMAT='aura-complete-backup-v1';
export function mediaReferences(project){const table=project.tables.find(t=>t.id==='aura-palace-media');return (table?.rows||[]).filter(r=>r.values[table.columns.indexOf('Storage')]==='This browser').map(r=>({id:r.id,name:r.values[table.columns.indexOf('Title')],bytes:Number(r.values[table.columns.indexOf('Bytes')])}));}
export function backupSummary(project,media=[]){return {tables:project.tables.length,rows:project.tables.reduce((n,t)=>n+t.rows.length,0),records:project.records.length,files:media.length};}
function encode(bytes){let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);}
export async function makeBackup(project,load=loadMedia){
 project=validateProject(project);const media=[];
 for(const ref of mediaReferences(project)){const blob=await load(ref.id);if(!(blob instanceof Blob))throw Error(`The saved file "${ref.name}" is missing from this browser. Reattach it before exporting a complete backup.`);media.push({id:ref.id,type:blob.type,size:blob.size,base64:encode(new Uint8Array(await blob.arrayBuffer()))});}
 return {format:BACKUP_FORMAT,exportedAt:new Date().toISOString(),project,media};
}
export function parseBackup(raw){
 const complete=raw?.format===BACKUP_FORMAT,project=validateProject(complete?raw.project:raw),files=[];
 if(complete){
  if(!Array.isArray(raw.media))throw Error('This backup is missing its media list.');
  const refs=new Map(mediaReferences(project).map(r=>[r.id,r])),seen=new Set();
  for(const item of raw.media){
   if(!item||typeof item.id!=='string'||seen.has(item.id)||!refs.has(item.id)||typeof item.type!=='string'||typeof item.base64!=='string'||!Number.isSafeInteger(item.size)||item.size<0||item.size!==refs.get(item.id).bytes||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(item.base64))throw Error('A media file in this backup is invalid. Nothing has been imported.');
   const binary=atob(item.base64);if(binary.length!==item.size)throw Error('A media file is incomplete. Nothing has been imported.');
   files.push({id:item.id,blob:new Blob([Uint8Array.from(binary,c=>c.charCodeAt(0))],{type:item.type})});seen.add(item.id);
  }
  if(refs.size!==seen.size)throw Error('This full backup is missing an attached file. Nothing has been imported.');
 }
 return {project,files,complete,summary:backupSummary(project,files)};
}
// Validate everything first. Roll back replaced blobs if project storage fails.
export async function restoreBackup(prepared,{load=loadMedia,store=storeMedia,remove=deleteMedia,storage=localStorage}={}){
 const project=validateProject(prepared.project),json=JSON.stringify(project),old=[],added=[];
 for(const file of prepared.files){const blob=await load(file.id);if(blob)old.push({id:file.id,blob});else added.push(file.id);}
 await store(prepared.files);
 try{storage.setItem(PROJECT_KEY,json);}catch(error){await store(old);await remove(added);throw Error('Import could not be saved. Your previous Aura was kept. '+error.message);}
 return project;
}
export async function exportAura(){return makeBackup(readTravelProject());}
