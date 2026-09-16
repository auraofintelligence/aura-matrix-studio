import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {saveRow,rows} from '../local-tools.js';
import {DATING_CHAPTERS,datingProfile,saveDatingProfile,chapterProgress} from '../dating-data.js';
import {FRIENDSHIP_CHAPTERS,friendshipProfile,saveFriendshipProfile} from '../friendship-data.js';

test('expanded dating profile preserves legacy notes, unrelated preferences and saved connections',()=>{
 let p=saveRow(blankProject(),'aura-preferences','Preferences',{Hopes:'Meet someone kind',Activities:'Paint together',Availability:'Shift work',Custom:'Keep me'},'social-dating');
 p=saveRow(p,'aura-preferences','Preferences',{Values:'Friendship'},'social-friends');p=saveRow(p,'aura-dating','People',{Title:'Example'},'person');
 p=saveDatingProfile(p,{...datingProfile(p),Sexuality:JSON.stringify(['Bisexual','Queer']),'Age minimum':'25','Age maximum':'60','Love giving':JSON.stringify({time:5,words:0})});
 assert.equal(datingProfile(p).Activities,'Paint together');assert.equal(datingProfile(p).Custom,'Keep me');assert.equal(friendshipProfile(p).Values,'Friendship');assert.equal(rows(p,'aura-dating')[0].Title,'Example');
 assert.equal(rows(p,'aura-preferences').filter(r=>r.id==='social-dating').length,1);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});
test('love preferences distinguish unanswered, explicit zero, giving and receiving',()=>{
 let p=saveDatingProfile(blankProject(),{'Love giving':'{"time":0}','Love receiving':'{"words":5}'});const c=DATING_CHAPTERS.find(c=>c.id==='love');assert.equal(chapterProgress(c,datingProfile(p)),2);
 p=saveDatingProfile(p,{'Love giving':'{}'});assert.equal(chapterProgress(c,datingProfile(p)),1);assert.equal(datingProfile(p)['Love receiving'],'{"words":5}');
});
test('invalid dimensions, age ranges, love scores and imported choices fail without changing existing records',()=>{
 const p=saveDatingProfile(blankProject(),{'Age minimum':'30','Age maximum':'50'}),before=JSON.stringify(p);
 for(const f of [{'Age minimum':'17'},{'Age maximum':'29'},{'Hours together':'169'},{'Travel distance':'NaN'},{'Love giving':'{"time":6}'},{'Love giving':'{"time":null}'},{'Love giving':'[]'},{Sexuality:'["Invalid"]'},{Sexuality:'["Gay","Gay"]'},{'Weekly availability':'["Someday"]'}])assert.throws(()=>saveDatingProfile(p,f));
 assert.equal(JSON.stringify(p),before);
});
test('friendship preferences support new connections, differences, boundaries and time without replacing legacy details',()=>{
 let p=saveRow(blankProject(),'aura-preferences','Preferences',{Hopes:'Local friends',Pace:'Slow',Activities:'Walking',Availability:'Weekends',Boundaries:'No pressure'},'social-friends');
 p=saveFriendshipProfile(p,{...friendshipProfile(p),'Friendship hopes':'["Local friends","Creative collaborators"]','Differences welcome':'["Cultures","Worldviews"]','Hard no topics':'["Pressure"]','Weekly availability':'["Sat Morning","Sun Afternoon"]','Hours for friends':'4'});
 assert.equal(friendshipProfile(p).Activities,'Walking');assert.equal(friendshipProfile(p).Boundaries,'No pressure');assert.equal(chapterProgress(FRIENDSHIP_CHAPTERS.find(c=>c.id==='time'),friendshipProfile(p)),3);assert.equal(datingProfile(p).Hopes,undefined);
 p=saveFriendshipProfile(p,{'Weekly availability':'[]'});assert.equal(friendshipProfile(p)['Weekly availability'],'[]');assert.throws(()=>saveFriendshipProfile(p,{'Hours for friends':'-1'}));assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});

test('longevity planning accepts older adults without weakening chronological adult age limits',()=>{
 const imported=saveRow(blankProject(),'aura-preferences','Preferences',{'Chronological age':'17'},'social-dating');assert.throws(()=>saveDatingProfile(imported,{Hopes:'A new chapter'}));
 const fields=DATING_CHAPTERS.flatMap(c=>c.fields);assert.equal(fields.some(f=>f.key==='Pronouns'),false);
 assert.ok(fields.some(f=>f.key==='Longevity outlook'));assert.ok(fields.some(f=>f.key==='Renewing agreements'));
 let p=saveDatingProfile(blankProject(),{'Chronological age':'220','Age minimum':'18','Age maximum':'700','Planning horizon':'["Centuries or longer","Open-ended"]'});
 assert.equal(datingProfile(p)['Age maximum'],'700');assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
 for(const key of ['Chronological age','Age minimum','Age maximum'])for(const value of ['17','17.9','-1','Infinity','9007199254740992'])assert.throws(()=>saveDatingProfile(p,{[key]:value}));
 p=saveDatingProfile(p,{'Age maximum':''});assert.equal(datingProfile(p)['Age maximum'],'');assert.equal(datingProfile(p)['Chronological age'],'220');
});
