// Suggestions are invitations to choose, never inferred answers.
export const GUIDED='Guided answers', NOTES='Answer notes', FOCUS='Focus priorities';
const split=s=>s.split('|');
const ideas={
 'Gender':'Woman|Man|Non-binary|Prefer my own words',
 'Identity notes':'Still exploring|My understanding can change|Prefer to discuss in person|No label needed',
 'Attracted to':'Women|Men|More than one gender|Personality first|No fixed type|Still exploring',
 'Hopes':'Companionship|Shared discovery|Belonging|Playfulness|Mutual encouragement|Meaningful conversation',
 'Pace':'Friendship first|Slow trust|Clear intentions|One step at a time|Regular check-ins|Decide together',
 'Current situation':'Learning again|Creating|Exploring|Rebuilding|Caring|Starting a new chapter',
 'Longevity outlook':'Many life chapters|Reinventing together|Independent growth|Renewable commitments|Long shared projects|Open to discovery',
 'Renewing agreements':'Regular check-ins|Revisit after changes|Keep room for independence|Renew commitments|Discuss changing needs|Part well if needed',
 'Love examples':'Undivided attention|Thoughtful messages|Practical help|Remembered occasions|Welcome affection|Time outdoors together',
 'My appearance':'Athletic build|Slender build|Fuller build|Short hair|Long hair|Natural presentation',
 'Appearance preferences':'Breasts / tits|Bottom / bum / ass|Defined abs|Soft curves|Chest and shoulders|Legs and thighs|Face and smile|Hair and body hair|Height and proportions|Skin and texture|Style and presentation|No fixed type',
 'Attraction flexibility':'Looks are central|Personality is central|Knowledge draws me in|Wealth or status matters|Chemistry grows with trust|Preferences can change|Several factors together|Physical chemistry first|Looks matter very little|Personality matters very little|No fixed type|Depends on the person',
 'Smell details':'Natural skin scent|Fresh hair|Subtle fragrance|Strong fragrance|Fragrance-free|Individual body chemistry|Dislike smoke smells|Dislike heavy cologne|Prefer freshly showered|Smell matters strongly|Smell matters little|Changes with the person',
 'Voice touch and movement':'Deep voice|Light voice|Expressive voice|A particular accent|Warm laughter|Gentle touch|Firm touch|Soft skin|Body warmth|Confident posture|Graceful movement|Playful energy',
 'Sensory turn offs':'Strong perfume|Smoke smells|Body odour|Certain textures|Loud voice|Harsh tone|Unwelcome touch|Certain tastes|Poor hygiene|A particular scent|Nothing fixed|Depends on context',
 'Resources and status':'Knowledge and expertise|Intellectual challenge|Wealth|Financial security|Generosity|Social status|Influence|Ambition|Practical competence|Creative talent|Independence|None of these matters',
 'Familiar qualities':'Warmth I grew up with|A parent’s humour|A caregiver’s steadiness|Family generosity|Familiar ambition|Shared traditions|A parent’s confidence|Familiar curiosity|A sense of home|A role model’s independence|No particular pattern|Still reflecting',
 'Different qualities':'More emotional openness|More independence|More affection|Less control|Different communication|More reliability|More adventure|Less conflict|A different worldview|Different family roles|A healthier balance for me|No particular contrast',
 'Attraction reflection':'Initial chemistry matters|What I want has changed|Familiarity feels good|Difference excites me|Attraction grows over time|My choices surprise me|My type is very specific|I do not have a type|Drawn in but not compatible|Compatibility without initial chemistry|Different chapters, different preferences|Still exploring',
 'Rejuvenation preferences':'Energy and vitality|Mobility|Maintain my appearance|Explore a new appearance|Physical capabilities|Decide as possibilities emerge',
 'Values':'Kindness|Honesty|Curiosity|Freedom|Responsibility|Mutual respect|Creativity|Spirituality|Community|Fairness|Family|Adventure',
 'Personality frameworks':'Star signs / astrology|16 personalities|MBTI|Big Five|Enneagram|My own descriptions|Useful for reflection|Useful for conversation|Important in my choices|Just for fun|No framework|My view has changed',
 'Differences welcome':'Cultures|Languages|Interests|Worldviews|Personalities|Life experiences',
 'Emotional needs':'Clear communication|Consistency|Reassurance|Time alone|Being listened to|Space to be myself',
 'Conflict and repair':'Pause and return|Listen without interrupting|Name the issue clearly|Acknowledge impact|Agree a next step|Make time to reconnect',
 'Care and support':'Practical help|Emotional presence|Independent pursuits|Space during change|Shared learning|Regular check-ins',
 'Emotional boundaries':'Ask before sensitive topics|Time to process|No pressure to disclose|Respect a pause|Discuss expectations|Respect time alone',
 'Kink notes':'An established interest|Curious but undecided|Discuss before trying|No pressure to explore|Prefer kink-free intimacy|My interests may change',
 'Intimacy rhythm':'Slow build-up|Spontaneous when welcome|Planned time together|Varies with energy|Discuss different needs|No fixed frequency',
 'Intimacy yes maybe no':'Yes to discussing preferences|Maybe after building trust|Ask each time|No pressure|No assumptions from a profile|Revisit as needs change',
 'Consent and aftercare':'Clear verbal check-ins|Agree a pause signal|Stop when asked|Discuss comfort afterwards|Quiet time afterwards|Revisit boundaries',
 'Intimacy conversations':'Comfort and boundaries|Safer sex|Testing|Contraception|Privacy|Changing preferences',
 'Boundaries':'Ask before touch|Respect my time|Keep confidence|No pressure|Discuss money first|Respect separate interests',
 'Easy to share':'Interests|Favourite activities|Everyday routines|General goals|Creative projects|Public stories',
 'Trust first':'Personal history|Family matters|Health details|Intimacy preferences|Financial details|Private contact details',
 'Keep private':'Exact address|Private messages|Financial records|Health records|Other people’s details|Intimate details',
 'Private details':'Exact address|Private messages|Financial details|Health details|Family matters|Other people’s stories',
 'Ask first':'Sharing photos|Making introductions|Changing plans|Physical touch|Sensitive topics|Sharing my details',
 'AI boundaries':'Use only what I select|Leave out private messages|Leave out intimate details|Leave out other people’s details|Ask before sharing|Show me a draft first',
 'Availability':'Work|Study|Care responsibilities|Shift work|Travel|Energy levels',
 'Time together':'Regular shared time|Independent pursuits|Short daily contact|Longer occasional visits|Shared projects|Flexible chapters',
 'Location plans':'Staying local|Exploring a move|Travelling soon|Seasonal travel|Flexible base|Discuss together',
 'Meeting preferences':'Quiet café|Park walk|Public venue|Accessible transport|Low sensory setting|Meet halfway',
 'Activities':'Walk together|Cook a meal|Visit an exhibition|Learn something|Make something|Explore a new place',
 'Family and children':'Chosen family|Parenthood|No parenthood|Shared care|Community kinship|Evolving commitments',
 'Home and pets':'Separate homes|Shared home|Community living|Travelling home|Life with pets|Revisit over time',
 'Lifestyle':'Sleep rhythm|Food preferences|Movement|Faith or spirituality|Substance preferences|Access needs',
 'Money and responsibilities':'Separate finances|Shared budget|Transparent expectations|Fair division of tasks|Discuss large commitments|Regular reviews',
 'Shared future':'Travel widely|Keep learning|Creative projects|Build community|Explore longevity|Protect time for discovery',
 'Continuity and change':'Enduring care|Honest communication|Freedom to grow|Flexible agreements|Shared memories|New chapters',
 'Green signals':'Reliability|Mutual curiosity|Warmth|Clear intentions|Respect for boundaries|Reciprocal effort',
 'Amber signals':'Mixed messages|Unclear expectations|Limited time|Different needs|Moving too quickly|Need more context',
 'Red signals':'Coercion|Dishonesty|Boundary violations|Cruelty|Manipulation|Repeated disrespect',
 'First step':'A friendly message|A shared activity|A short introduction|A quiet conversation|A mutual introduction|An easy invitation',
 'Deeper questions':'What brings you joy?|What are you learning?|What matters to you?|What are you creating?|What helps you feel safe?|What future excites you?',
 'Invitation':'Walk together|Meet for coffee|Cook together|Join a class|Visit a local event|Try a shared hobby',
 'Friendship meaning':'Mutual effort|Being dependable|Room to be ourselves|Shared laughter|Honest conversations|Growing together',
 'Curious about':'Other cultures|Different worldviews|New skills|Spiritual perspectives|Life experiences|Creative practices',
 'Respectful disagreement':'Listen first|Ask rather than assume|No personal attacks|Allow a pause|Accept different views|Find common ground',
 'Openness limits':'Respect for boundaries|Honesty|No pressure to agree|Mutual dignity|Shared ethical ground|Room for questions',
 'Hard no details':'No pressure|No manipulation|No unwanted attention|No private gossip|No repeated disrespect|No one-sided demands',
 'Needs discussion':'Different expectations|Lending money|Contact frequency|Substances|Physical affection|Sensitive topics',
 'Repair':'Acknowledge harm|A sincere apology|Changed behaviour|Time to rebuild|Clear agreements|Step away if repeated',
 'Recovery time':'Quiet time|Advance notice|Shorter visits|A day without messages|Low-pressure invitations|Permission to decline',
 'Try something new':'A class|A local walk|Volunteering|A creative project|A new sport|A community event',
 'Offer to share':'A skill|A meal|Local knowledge|A creative space|Practical help|An introduction',
 'Budget and access':'Free activities|Agree a budget|Step-free access|Public transport|Quiet spaces|Flexible timing',
 'Access needs':'Step-free access|Nearby transport|Quiet setting|Rest breaks|Flexible timing|Online option',
 'Local ideas':'Libraries|Community gardens|Walking groups|Interest clubs|Classes|Local events',
 'Support offered':'Listening|Practical help|Encouragement|Sharing knowledge|Company|Help with planning',
 'Support wanted':'Listening|Practical help|Encouragement|Perspective|Company|Gentle check-ins',
 'Check-ins':'A short message|Ask if I need space|Offer a simple activity|No pressure to reply|Agree a check-in rhythm|Phone when agreed',
 'Mutual effort':'Take turns inviting|Share planning|Respect different capacities|Offer help freely|Talk about imbalance|Appreciate small gestures',
 'Next step':'Message someone|Join a group|Attend an event|Invite a neighbour|Arrange a walk|Try a class',
 'Stay connected':'Make another plan|Exchange contact details|A regular activity|Remember key dates|Small check-ins|Share something interesting'
};
export const DIRECT_ENTRY=new Set(['Display name','Based near','Time zone']);
export function suggestionsFor(key){return ideas[key]?split(ideas[key]):[];}
function object(value){try{const v=JSON.parse(value||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
export function ownNote(profile,key){return object(profile[NOTES])[key]||'';}
export function notePatch(profile,key,value){return {[NOTES]:JSON.stringify({...object(profile[NOTES]),[key]:value})};}
export const composeAnswer=({selected,own})=>[...selected,own.trim()].filter(Boolean).join('\n');
export function answerParts(profile,key){const v=object(profile[GUIDED])[key];return v&&Array.isArray(v.selected)&&typeof v.own==='string'&&composeAnswer(v)===String(profile[key]||'')?{selected:[...v.selected],own:v.own}:{selected:[],own:String(profile[key]||'')};}
export function answerPatch(profile,key,parts){return {[key]:composeAnswer(parts),[GUIDED]:JSON.stringify({...object(profile[GUIDED]),[key]:parts})};}
const SOURCES={
 'Values':['Drawn to qualities','Friend qualities','My qualities'],
 'Hopes':['Connection wanted','Friendship hopes'],
 'Activities':['Shared activities','Shared interests'],
 'Invitation':['Shared interests','Meeting options'],
 'Try something new':['Shared interests'],
 'Meeting preferences':['Meeting options'],
 'Love examples':['Love receiving'],
 'First step':['Meeting routes','Meeting options'],
 'Time together':['Contact rhythm'],
 'Emotional needs':['Communication style'],
 'Hard no details':['Hard no topics'],
 'Kink notes':['Kink interests'],
 'Shared future':['Planning horizon','Shared activities'],
 'Mutual effort':['My qualities'],
 'Green signals':['Friend qualities','Drawn to qualities']
};
export function relatedSuggestions(profile,key){return (SOURCES[key]||[]).flatMap(source=>{try{const values=JSON.parse(profile[source]||'[]');return Array.isArray(values)?values.filter(v=>typeof v==='string').map(text=>({text,source})):[];}catch{return [];}}).filter((v,i,a)=>a.findIndex(x=>x.text===v.text)===i);}
export function focusValue(profile){const f=object(profile[FOCUS]);return {order:Array.isArray(f.order)?[...f.order]:[],areas:{...(f.areas||{})}};}
export function focusPatch(profile,id,changes){const f=focusValue(profile);f.areas[id]={...f.areas[id],...changes};return {[FOCUS]:JSON.stringify(f)};}
export function rankPatch(profile,id,position){const f=focusValue(profile);f.order=f.order.filter(x=>x!==id);if(position!=null)f.order.splice(Math.max(0,Math.min(position,f.order.length)),0,id);return {[FOCUS]:JSON.stringify(f)};}
export function validateGuidance(profile,chapters){
 const fields=chapters.flatMap(c=>c.fields),ids=chapters.map(c=>c.id);
 function parsed(key){try{const v=JSON.parse(profile[key]);if(!v||typeof v!=='object'||Array.isArray(v))throw Error();return v;}catch{throw Error('Invalid saved connection preferences: '+key);}}
 if(profile[GUIDED])for(const [key,v] of Object.entries(parsed(GUIDED))){if(!fields.some(f=>f.key===key&&f.type==='text')||!v||!Array.isArray(v.selected)||v.selected.some(s=>typeof s!=='string')||new Set(v.selected).size!==v.selected.length||typeof v.own!=='string')throw Error('Invalid guided answer.');}
 if(profile[NOTES])for(const [key,v] of Object.entries(parsed(NOTES)))if(!fields.some(f=>f.key===key)||typeof v!=='string')throw Error('Invalid answer notes.');
 if(profile[FOCUS]){const f=parsed(FOCUS);if(!Array.isArray(f.order)||new Set(f.order).size!==f.order.length||f.order.some(id=>!ids.includes(id))||!f.areas||Array.isArray(f.areas)||typeof f.areas!=='object')throw Error('Invalid focus priorities.');for(const [id,v]of Object.entries(f.areas))if(!ids.includes(id)||!v||!['', 'Flexible','Important','Essential',undefined].includes(v.importance)||!['','Later','Soon','Now',undefined].includes(v.urgency))throw Error('Invalid importance or urgency.');}
}
