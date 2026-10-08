import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {profilePhotos,saveProfilePhoto,MAX_PROFILE_PHOTOS,AVATAR_PHOTO_VIEWS} from '../avatar-photos-data.js';
const photo={Asset:'data:image/jpeg;base64,YQ==',Filename:'portrait.jpg'};
test('profile photos keep ten independent slots and survive backup and restore',()=>{
 let p=blankProject();for(let position=1;position<=MAX_PROFILE_PHOTOS;position++)p=saveProfilePhoto(p,position,photo);
 assert.equal(profilePhotos(p).length,10);assert.deepEqual(profilePhotos(validateProject(JSON.parse(JSON.stringify(p)))),profilePhotos(p));
 const changed=saveProfilePhoto(p,2,{...photo,Filename:'updated.jpg'});assert.equal(profilePhotos(changed).length,10);assert.equal(profilePhotos(changed)[1].Filename,'updated.jpg');assert.equal(profilePhotos(p)[1].Filename,'portrait.jpg');
 const removed=saveProfilePhoto(changed,1,{Asset:'',Filename:''});assert.equal(profilePhotos(removed).length,9);assert.equal(profilePhotos(removed)[0].Position,'2');
 assert.throws(()=>saveProfilePhoto(p,11,photo));assert.throws(()=>saveProfilePhoto(p,0,photo));assert.throws(()=>saveProfilePhoto(p,1,{...photo,Asset:'https://example.org/portrait.jpg'}));
});
test('reference views retain their purpose when a photo is replaced or backed up',()=>{
 assert.equal(new Set(AVATAR_PHOTO_VIEWS.map(v=>v.id)).size,10);
 let p=blankProject();for(let i=1;i<=10;i++)p=saveProfilePhoto(p,i,photo);
 const rows=profilePhotos(validateProject(JSON.parse(JSON.stringify(p))));
 rows.forEach((row,i)=>{assert.equal(row.View,AVATAR_PHOTO_VIEWS[i].id);assert.equal(row.Title,AVATAR_PHOTO_VIEWS[i].title);});
 p=saveProfilePhoto(p,3,{...photo,Filename:'new-side.jpg'});assert.equal(profilePhotos(p)[2].View,AVATAR_PHOTO_VIEWS[2].id);assert.equal(profilePhotos(p).length,10);
});
