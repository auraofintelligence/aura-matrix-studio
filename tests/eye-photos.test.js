import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {EYE_POSES,eyePhotos,saveEyePhoto} from '../eye-photos.js';
import {AVATAR_SECTIONS,avatarValues,saveAvatar} from '../avatar-data.js';
const photo={Asset:'data:image/jpeg;base64,AA==',Filename:'reference.jpg'};
test('eye walkthrough retains all nine positions in the original order',()=>{
 assert.deepEqual(EYE_POSES.map(p=>p.id.replace('eyes-pose-','')),['camera','wide','left','right','up','down','ahead','closed-gently','closed-tightly']);
 const source=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url))).pages.find(p=>p.name==='Eyes and Distance');
 assert.ok(source.controls.some(c=>c.properties.text?.includes('9 eyes closed tightly')));
 assert.equal(new Set(EYE_POSES.map(p=>p.id)).size,9);
});
test('each pose keeps a separate photo and survives project backup alongside numerical eye inputs',()=>{
 let p=saveAvatar(blankProject(),AVATAR_SECTIONS.find(s=>s.key==='eyes'),{'eyes-spacing':'64','eyes-left':'29','eyes-right':'30'});
 for(const pose of EYE_POSES)p=saveEyePhoto(p,pose.id,{...photo,Filename:pose.id+'.jpg'});
 const restored=validateProject(JSON.parse(JSON.stringify(p)));
 assert.equal(Object.keys(eyePhotos(restored)).length,9);
 assert.equal(avatarValues(restored,AVATAR_SECTIONS.find(s=>s.key==='eyes'))['eyes-spacing'],'64');
 const t=restored.tables.find(t=>t.id==='avatar-eye-photos');t.columns.push('Note');t.rows.forEach(r=>r.values.push('Keep this'));
 const next=saveEyePhoto(restored,EYE_POSES[2].id,{...photo,Filename:'replacement.jpg'});
 assert.equal(eyePhotos(next)[EYE_POSES[2].id].Filename,'replacement.jpg');
 assert.equal(eyePhotos(next)[EYE_POSES[2].id].Note,'Keep this');
 assert.equal(eyePhotos(next)[EYE_POSES[3].id].Filename,EYE_POSES[3].id+'.jpg');
 const removed=saveEyePhoto(next,EYE_POSES[2].id,{Asset:'',Filename:''});
 assert.equal(eyePhotos(removed)[EYE_POSES[2].id].Asset,'');assert.equal(eyePhotos(removed)[EYE_POSES[2].id].Note,'Keep this');
 assert.deepEqual(next.records,restored.records);
});
test('opening or skipping a pose creates no personal data and invalid photos fail without mutation',()=>{
 const p=blankProject();assert.deepEqual(eyePhotos(p),{});assert.equal(saveEyePhoto(p,EYE_POSES[0].id,{}),p);
 for(const Asset of ['https://example.com/private.jpg','data:image/svg+xml;base64,AA==','x'.repeat(90001)])assert.throws(()=>saveEyePhoto(p,EYE_POSES[0].id,{...photo,Asset}));
 assert.throws(()=>saveEyePhoto(p,'unknown',photo));assert.equal(p.tables.length,0);
});
