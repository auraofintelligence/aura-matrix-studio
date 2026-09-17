import {rows} from './local-tools.js?v=0.4.15';
export const REUSE='Reused answers';
const shared=new Set(['Based near','Weekly availability','Availability','Time zone','My height']);
export function reuseMap(profile){try{return JSON.parse(profile[REUSE]||'{}');}catch{return {};}}
const rawProfile=(project,id)=>rows(project,'aura-preferences').find(r=>r.id===id)||{};
function sourceValue(project,id,key,seen=new Set()){
 const token=id+'/'+key;if(seen.has(token))throw Error('Answers cannot refer back to each other.');seen.add(token);
 if(id==='avatar'&&key==='My height'){const t=project.tables.find(t=>t.id==='quickstart-body');return t?.rows.find(r=>r.id==='body-height')?.values[t.columns.indexOf('Measurement')]||'';}
 const p=rawProfile(project,id),ref=reuseMap(p)[key];return ref?sourceValue(project,ref,key,seen):p[key]||'';
}
export function resolvedProfile(project,id){const p={...rawProfile(project,id)};for(const [key,source]of Object.entries(reuseMap(p))){if(shared.has(key))p[key]=sourceValue(project,source,key,new Set([id+'/'+key]));}return p;}
export function reuseCandidate(project,id,key){if(!shared.has(key))return null;const source=key==='My height'?'avatar':id==='social-dating'?'social-friends':'social-dating';try{const value=sourceValue(project,source,key,new Set([id+'/'+key]));return value&&value!=='[]'?{source,value,label:source==='avatar'?'Your avatar':source==='social-friends'?'Friendships':'Dating'}:null;}catch{return null;}}
export function reusePatch(profile,key,source){if(!shared.has(key))throw Error('This answer is specific to its context.');return {[REUSE]:JSON.stringify({...reuseMap(profile),[key]:source})};}
export function detachAnswer(profile,key){const refs={...reuseMap(profile)};delete refs[key];return {[REUSE]:JSON.stringify(refs)};}
export function prepareReusedAnswers(project,id,values){let refs;try{refs=JSON.parse(values[REUSE]||'{}');}catch{throw Error('Invalid reused answers.');}if(!refs||Array.isArray(refs)||typeof refs!=='object')throw Error('Invalid reused answers.');const out={...values};for(const [key,source]of Object.entries(refs)){if(!shared.has(key)||!['social-dating','social-friends','avatar'].includes(source)||source===id||(source==='avatar'&&key!=='My height'))throw Error('Invalid answer source.');sourceValue(project,source,key,new Set([id+'/'+key]));out[key]='';}return out;}

// Old fields remain in the storage schema. Only the repeated prompts are folded.
const datingFold={
 'Attraction cues':'Attraction drivers','Appearance preferences':'Physical attractors','Attraction flexibility':'Attraction reflection','Smell details':'Smell preferences',
 'Familiar qualities':'Family pattern direction','Different qualities':'Family pattern direction','Personality frameworks':'Framework interests',
 'Differences welcome':'Similarity and contrast','Love examples':'Love receiving','Kink notes':'Kink interests','Emotional boundaries':'Boundaries',
 'Easy to share':'Trust first','Keep private':'Trust first','Red signals':'Boundaries','Activities':'Shared activities','Shared future':'Hopes','Continuity and change':'Renewing agreements',
 'Deeper questions':'First step'
};
const friendsFold={
 'Hopes':'Friendship hopes','First step':'Next step','Invitation':'Next step','Friendship meaning':'Friend qualities',
 'Hard no details':'Hard no topics','Openness limits':'Boundaries','Private details':'Boundaries','Try something new':'Shared interests',
 'Activities':'Shared interests','Offer to share':'Support offered','Stay connected':'Next step','Local ideas':'Meeting routes','Respectful disagreement':'Repair'
};
const labels={
 'Family pattern direction':'Which familiar qualities would you keep or change?',
 'Trust first':'What needs trust, privacy or permission?',
 'Next step':'What would you like to invite someone to do?',
 'Boundaries':'Your boundaries and hard no’s',
 'Renewing agreements':'What should endure, and when would you revisit agreements?'
};
export function conciseChapters(chapters,kind){const fold=kind==='friends'?friendsFold:datingFold;const keys=new Set(chapters.flatMap(c=>c.fields.map(f=>f.key)));return chapters.map(c=>({...c,fields:c.fields.filter(f=>!(fold[f.key]&&keys.has(fold[f.key]))).map(f=>({...f,label:labels[f.key]||f.label,earlier:chapters.flatMap(c=>c.fields).filter(old=>fold[old.key]===f.key)}))}));}
