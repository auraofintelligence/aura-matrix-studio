const choices=(key,label,options,hint='')=>({key,label,type:'choices',options:options.split('|'),hint});
const words=(key,label,hint='')=>({key,label,type:'text',hint});
const single=(key,label,options,hint='')=>({...choices(key,label,options,hint),type:'single'});
export const ATTRACTION_DRIVERS=['Appearance','Sexual chemistry','Personality','Intelligence & knowledge','Wealth & resources','Status & influence','Emotional connection','Shared values','Lifestyle & experiences','Spiritual connection'];
export const STAR_SIGNS='Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces';
export const PERSONALITY_TYPES='INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP';
export const ATTRACTION_FIELDS=[
 {key:'Attraction drivers',label:'What actually drives your attraction?',type:'weights',axes:ATTRACTION_DRIVERS,group:'What draws me',hint:'Set each independently. Looks, personality, knowledge, wealth or any combination can matter as much or as little as you choose.'},
 choices('Physical attractors','Which physical features attract you?','Breasts / tits|Bottom / bum / ass|Abs / stomach|Chest / pecs|Hips / waist|Shoulders / back|Arms / hands|Legs / thighs|Feet|Face / smile|Eyes / lips|Hair / body hair|Height|Build / proportions|Skin|Genitals','Choose any features you notice. Add the sizes, shapes or details you like in your own words.'),
 choices('Breasts and chest','Breasts, chest and pecs','Small breasts|Medium breasts|Large breasts|Very large breasts|Full shape|Subtle curves|Natural breasts|Enhanced breasts|Flat chest|Defined pecs|Broad chest|No particular preference','Select any, then add shape, size or other details in your own words.'),
 choices('Bottom hips and waist','Bottom, hips and waist','Small bottom|Full bottom|Round bottom|Muscular glutes|Wide hips|Narrow hips|Defined waist|Soft waist|Curvy proportions|Straight proportions|No particular preference'),
 choices('Body build preferences','Build, muscle and body shape','Lean|Slim|Muscular|Defined abs|Broad shoulders|Soft stomach|Fuller build|Curvy|Strong arms|Full thighs|Long legs|No particular preference'),
 choices('Face hair and details','Face, hair and other details','Smile|Eyes|Lips|Jawline|Facial hair|Clean-shaven|Long hair|Short hair|Body hair|Smooth skin|Tattoos / piercings|No particular preference'),
 choices('Sensory attractors','Which senses draw you in?','Natural scent|Perfume / cologne|Voice|Laughter|Touch / texture|Kissing / taste|Movement|Posture|Eye contact|Style|Body warmth|Overall chemistry'),
 choices('Smell preferences','What smells attract you?','Natural body scent|Clean skin|Hair scent|Freshly showered|Perfume|Cologne|Woody scents|Floral scents|Musky scents|Fragrance-free|Individual chemistry|Smell is not a factor'),
 words('Smell details','The smells you like, dislike or notice','Describe what draws you closer, what puts you off, and how much scent matters.'),
 words('Voice touch and movement','Voice, touch and movement','Tone, accent, laughter, texture, warmth, posture, rhythm or the way someone carries themselves.'),
 words('Sensory turn offs','What sensory details put you off?','Smell, sound, touch, taste, movement or visual details. Use your own words.'),
 {key:'Attraction develops',label:'Instant attraction or growing connection?',type:'scale',options:['Usually instant','Mostly immediate','Either can happen','Usually grows with connection','Only after a bond develops'],hint:'Describe your experience, including exceptions.'},
 words('Resources and status','What about knowledge, wealth, status or capability attracts you?','Money, expertise, independence, security, influence, generosity, competence or something else.'),
 choices('Familiar influences','Where do you recognise familiar qualities?','Mother / maternal figures|Father / paternal figures|Other caregivers|Extended family|Earlier relationships|Role models|Friends|Culture / community|Fiction / media|No obvious pattern|Still exploring','Reflect on qualities and relationship patterns you know. Aura does not assign a cause.'),
 single('Family pattern direction','Familiar qualities or something different?','Seek familiar qualities|Prefer very different qualities|A mixture of both|No connection I notice|Still exploring','For example, you might value a parent’s humour while wanting a very different communication style.'),
 words('Familiar qualities','Which familiar qualities do you want to find?','Qualities exhibited by parents, caregivers or others that you value in a partner.'),
 words('Different qualities','What would you like to be different from familiar relationships?','Name qualities or patterns you want more of, less of, or a different approach to.'),
 words('Attraction reflection','What draws you in, and what works for you over time?','These might match, conflict or change. Reflect without needing a correct answer.')
];
const groupByKey={
 'Physical attractors':'Body & looks','Breasts and chest':'Body & looks','Bottom hips and waist':'Body & looks','Body build preferences':'Body & looks','Face hair and details':'Body & looks',
 'Sensory attractors':'Senses','Smell preferences':'Senses','Smell details':'Senses','Voice touch and movement':'Senses','Sensory turn offs':'Senses',
 'Familiar influences':'Reflection','Family pattern direction':'Reflection','Familiar qualities':'Reflection','Different qualities':'Reflection','Attraction reflection':'Reflection'
};
ATTRACTION_FIELDS.forEach(f=>f.group=groupByKey[f.key]||f.group||'What draws me');
export const FRAMEWORK_FIELDS=[
 choices('Framework interests','Which frameworks interest you?','Star signs / astrology|16 personalities|MBTI|Big Five|Enneagram|Attachment styles|My own descriptions|None','Use frameworks if they mean something to you. Your own observations can sit alongside them.'),
 single('My star sign','Your star sign, if you use it',STAR_SIGNS,'Choose your own sign. This is not inferred from your birthday.'),
 choices('Star sign preferences','Any star signs you are drawn to?',STAR_SIGNS,'Choose any, or leave unset. Describe preferences or signs you avoid in your own words.'),
 single('My personality type','Your self-described personality type',PERSONALITY_TYPES,'Optional four-letter type used by MBTI and 16-personality frameworks. Aura does not type you.'),
 choices('Personality type preferences','Any personality types you are drawn to?',PERSONALITY_TYPES,'Choose any, or leave unset. Add nuance, reservations or your own descriptions below.'),
 {key:'Framework importance',label:'How much do these frameworks matter?',type:'scale',options:['Not a factor','Just for fun','A conversation starter','Important to me','Central to my preferences'],hint:'Your personal use of a framework, without a compatibility verdict from Aura.'}
].map(f=>({...f,group:'Frameworks'}));
