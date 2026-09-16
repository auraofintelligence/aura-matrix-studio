import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {saveDatingProfile,datingProfile,DATING_CHAPTERS,chapterProgress} from '../dating-data.js';
import {saveFriendshipProfile,friendshipProfile,FRIENDSHIP_CHAPTERS} from '../friendship-data.js';
import {answerParts,answerPatch,notePatch,ownNote,relatedSuggestions,focusPatch,rankPatch,focusValue,GUIDED,FOCUS,NOTES,suggestionsFor,DIRECT_ENTRY} from '../connection-inputs.js';

test('guided selections can be removed without losing original or newly typed words',()=>{
 let profile={Values:'My old notes\nKeep these.'};
 let parts=answerParts(profile,'Values');assert.deepEqual(parts,{selected:[],own:profile.Values});
 parts.selected.push('Kindness','Curiosity');Object.assign(profile,answerPatch(profile,'Values',parts));
 let p=saveDatingProfile(blankProject(),profile);profile=datingProfile(validateProject(JSON.parse(JSON.stringify(p))));
 parts=answerParts(profile,'Values');assert.equal(parts.own,'My old notes\nKeep these.');assert.deepEqual(parts.selected,['Kindness','Curiosity']);
 parts.selected=[];parts.own+=' And my new words.';p=saveDatingProfile(p,answerPatch(profile,'Values',parts));
 assert.equal(datingProfile(p).Values,'My old notes\nKeep these. And my new words.');
 // Another editor may update the ordinary text column. Stale composition must not overwrite it.
 assert.deepEqual(answerParts({...datingProfile(p),Values:'External edit'},'Values'),{selected:[],own:'External edit'});
});
test('own-word notes extend choices without pretending to be predefined options',()=>{
 let p=saveFriendshipProfile(blankProject(),{'Shared interests':'["Nature"]',...notePatch({},'Shared interests','Botanical drawing')});
 assert.equal(friendshipProfile(p)['Shared interests'],'["Nature"]');assert.equal(ownNote(friendshipProfile(p),'Shared interests'),'Botanical drawing');
 p=saveFriendshipProfile(p,{'Shared interests':'[]'});assert.equal(chapterProgress(FRIENDSHIP_CHAPTERS.find(c=>c.id==='activities'),friendshipProfile(p)),1);
 p=saveFriendshipProfile(p,notePatch(friendshipProfile(p),'Shared interests',''));assert.equal(chapterProgress(FRIENDSHIP_CHAPTERS.find(c=>c.id==='activities'),friendshipProfile(p)),0);
});
test('related suggestions are explicit existing choices with source labels and do not mutate the profile',()=>{
 const profile={'Shared interests':'["Nature","Learning"]','Meeting options':'["Nearby"]'},before=JSON.stringify(profile);
 assert.deepEqual(relatedSuggestions(profile,'Activities'),[{text:'Nature',source:'Shared interests'},{text:'Learning',source:'Shared interests'}]);
 assert.deepEqual(relatedSuggestions(profile,'Sexuality'),[]);assert.equal(JSON.stringify(profile),before);
});
test('importance, urgency and unique focus order persist independently and can be cleared',()=>{
 let d={};Object.assign(d,focusPatch(d,'time',{importance:'Essential',urgency:'Later'}));
 Object.assign(d,rankPatch(d,'time',0),rankPatch(d,'life',0));
 Object.assign(d,rankPatch(d,'time',0));Object.assign(d,rankPatch(d,'location',1));
 let p=saveDatingProfile(blankProject(),d),v=focusValue(datingProfile(p));
 assert.deepEqual(v.order,['time','location','life']);assert.deepEqual(v.areas.time,{importance:'Essential',urgency:'Later'});
 d=datingProfile(p);Object.assign(d,rankPatch(d,'life',0));Object.assign(d,focusPatch(d,'time',{urgency:'Now'}));
 assert.deepEqual(focusValue(d).order,['life','time','location']);assert.equal(focusValue(d).areas.time.importance,'Essential');
 Object.assign(d,rankPatch(d,'time',null));assert.deepEqual(focusValue(d).order,['life','location']);assert.equal(focusValue(d).areas.time.urgency,'Now');
 p=saveDatingProfile(p,d);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});
test('new scales and culture preferences are optional, separate and preserved in both profiles',()=>{
 for(const [save,read,chapters] of [[saveDatingProfile,datingProfile,DATING_CHAPTERS],[saveFriendshipProfile,friendshipProfile,FRIENDSHIP_CHAPTERS]]){
  const fields={'Planning style':'Fully planned','Novelty and randomness':'Random discovery','Similarity and contrast':'Complementary opposites','Cultural connection':'Shared culture only','Faith connection':'Open to interfaith connection'};
  let p=save(blankProject(),fields);for(const [k,v]of Object.entries(fields))assert.equal(read(p)[k],v);
  p=save(p,{'Planning style':''});assert.equal(read(p)['Planning style'],'');assert.equal(read(p)['Novelty and randomness'],'Random discovery');
  for(const key of Object.keys(fields))assert.throws(()=>save(p,{[key]:'Invented position'}));
  for(const f of chapters.flatMap(c=>c.fields).filter(f=>f.type==='text'&&!DIRECT_ENTRY.has(f.key)))assert.ok(suggestionsFor(f.key).length,'Missing ideas: '+f.key);
 }
});
test('malformed imported guidance and rank data fail before touching saved data',()=>{
 const p=saveDatingProfile(blankProject(),{Hopes:'Saved'}),before=JSON.stringify(p);
 for(const invalid of [{[GUIDED]:'invalid'},{[GUIDED]:'{"Hopes":{"selected":["x","x"],"own":""}}'},{[GUIDED]:'{"Hopes":{"selected":[4],"own":""}}'},{[NOTES]:'{"Hopes":3}'},{[FOCUS]:'{"order":["time","time"],"areas":{}}'},{[FOCUS]:'{"order":["unknown"],"areas":{}}'},{[FOCUS]:'{"order":[],"areas":{"time":{"urgency":"Yesterday"}}}'}])assert.throws(()=>saveDatingProfile(p,invalid));
 assert.equal(JSON.stringify(p),before);
});
