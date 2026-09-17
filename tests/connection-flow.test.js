import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProject,validateProject} from '../core.js';
import {rows} from '../local-tools.js';
import {DATING_CHAPTERS,datingProfile,saveDatingProfile} from '../dating-data.js';
import {FRIENDSHIP_CHAPTERS,friendshipProfile,saveFriendshipProfile} from '../friendship-data.js';
import {conciseChapters,reusePatch,detachAnswer,reuseCandidate,REUSE} from '../connection-flow.js';
import {disclosurePreview} from '../connection-sharing.js';
test('concise flows fold repeated prompts without removing earlier answers or adult preferences',()=>{
 const dating=conciseChapters(DATING_CHAPTERS,'dating'),friends=conciseChapters(FRIENDSHIP_CHAPTERS,'friends');
 assert.equal(dating.flatMap(c=>c.fields).length,85);assert.equal(friends.flatMap(c=>c.fields).length,37);
 const keys=dating.flatMap(c=>c.fields.map(f=>f.key));for(const key of ['Breasts and chest','Smell preferences','Kink interests','Love receiving','Love giving'])assert.ok(keys.includes(key));
 const boundaries=dating.flatMap(c=>c.fields).find(f=>f.key==='Boundaries');assert.ok(boundaries.earlier.some(f=>f.key==='Red signals'));
 const p=saveDatingProfile(blankProject(),{'Red signals':'Pressure','Boundaries':'Respect my time'});assert.equal(datingProfile(p)['Red signals'],'Pressure');
 for(const c of [...dating,...friends])assert.ok(c.fields.length);
});
test('linked facts stay at their source, update in context, preserve private defaults and allow overrides',()=>{
 let p=saveFriendshipProfile(blankProject(),{'Based near':'Brisbane','Weekly availability':'["Sat Morning"]'});
 assert.equal(reuseCandidate(p,'social-dating','Based near').label,'Friendships');
 p=saveDatingProfile(p,{...reusePatch({},'Based near','social-friends'),'Based near':'Brisbane'});
 assert.equal(rows(p,'aura-preferences').find(r=>r.id==='social-dating')['Based near'],'');
 p=saveFriendshipProfile(p,{'Based near':'Cairns'});assert.equal(datingProfile(p)['Based near'],'Cairns');
 assert.deepEqual(disclosurePreview(datingProfile(p),DATING_CHAPTERS,'public'),[]);
 p=validateProject(JSON.parse(JSON.stringify(p)));assert.equal(datingProfile(p)['Based near'],'Cairns');
 p=saveDatingProfile(p,{...detachAnswer(datingProfile(p),'Based near'),'Based near':'Sydney'});
 assert.equal(datingProfile(p)['Based near'],'Sydney');assert.equal(friendshipProfile(p)['Based near'],'Cairns');
 assert.throws(()=>reusePatch({},'Kink interests','social-friends'));
});
test('reuse rejects circular or invalid sources and blank source updates do not resurrect old answers',()=>{
 let p=saveFriendshipProfile(blankProject(),{'Based near':'Perth'});p=saveDatingProfile(p,reusePatch({},'Based near','social-friends'));
 assert.throws(()=>saveFriendshipProfile(p,reusePatch({},'Based near','social-dating')),/refer back/);
 assert.throws(()=>saveDatingProfile(p,{[REUSE]:'{"Based near":"unknown"}'}),/Invalid/);
 p=saveFriendshipProfile(p,{'Based near':''});assert.equal(datingProfile(p)['Based near'],'');
});
