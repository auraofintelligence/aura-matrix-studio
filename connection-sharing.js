import {ownNote} from './connection-inputs.js?v=0.4.13';
export const DISCLOSURE='Connection disclosure';
export const AUDIENCES={private:'Private',permission:'By permission',public:'Public'};
export function disclosureMap(profile){try{const m=JSON.parse(profile[DISCLOSURE]||'{}');return m&&typeof m==='object'&&!Array.isArray(m)?m:{};}catch{return {};}}
export const audienceFor=(profile,key)=>{const value=disclosureMap(profile)[key];return Object.hasOwn(AUDIENCES,value)?value:'private';};
export function disclosurePatch(profile,key,audience){if(!Object.hasOwn(AUDIENCES,audience))throw Error('Choose an audience.');return {[DISCLOSURE]:JSON.stringify({...disclosureMap(profile),[key]:audience})};}
export function validateDisclosure(profile,chapters){if(!profile[DISCLOSURE])return;let m;try{m=JSON.parse(profile[DISCLOSURE]);}catch{throw Error('Invalid disclosure choices.');}const keys=chapters.flatMap(c=>c.fields.map(f=>f.key));if(!m||typeof m!=='object'||Array.isArray(m)||Object.entries(m).some(([key,value])=>!keys.includes(key)||!Object.hasOwn(AUDIENCES,value)))throw Error('Invalid disclosure choices.');}
export function disclosurePreview(profile,chapters,audience){
 if(!['permission','public'].includes(audience))throw Error('Choose the permission or public preview.');
 validateDisclosure(profile,chapters);
 return chapters.flatMap(chapter=>chapter.fields.filter(f=>audienceFor(profile,f.key)===audience).flatMap(f=>{
  const raw=profile[f.key]||'',notes=ownNote(profile,f.key);let value=raw;
  if(['choices','week','love','weights'].includes(f.type)){try{value=JSON.parse(raw||(['choices','week'].includes(f.type)?'[]':'{}'));}catch{throw Error('Invalid answer: '+f.label);}}
  const populated=Array.isArray(value)?value.length:typeof value==='object'?Object.keys(value).length:String(value).trim().length;
  return populated||notes?[{key:f.key,label:f.label,area:chapter.title,value,notes}]:[];
 }));
}
export function disclosurePacket(profile,chapters,audience){return {format:'aura-connection-disclosure/1',audience,permissionEnforced:false,notice:'A selected local snapshot. This file does not provide access control or publish a profile.',answers:disclosurePreview(profile,chapters,audience)};}
