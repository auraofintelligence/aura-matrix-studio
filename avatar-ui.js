import {mountPersonalSpace} from './personal-space-ui.js?v=0.4.12';
import {mountMeasurements} from './measurement-ui.js?v=0.4.12';
import {AVATAR_HOME,AVATAR_CREATION,AVATAR_SECTIONS,AVATAR_PAGES,avatarValues,avatarProgress,saveAvatar,avatarRatios} from './avatar-data.js?v=0.4.12';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.12';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn,cls='')=>{const n=make('button',cls,text);n.type='button';n.onclick=fn;return n;};
const paths={person:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 22v-3a8 8 0 0 1 16 0v3',space:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14M8 2h8M8 22h8',eyes:'M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',reach:'M12 7v14M8 22l4-7 4 7M5 2l7 9 7-9M12 2v1',shoulders:'M2 12h20M12 10v12M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6'};
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[name]);svg.append(path);return svg;}
export function mountAvatar({page,screen,go}){
 if(page.id===AVATAR_CREATION)return mountAvatarMenu({page,screen,go});
 if(AVATAR_PAGES[page.id]?.key==='space')return mountPersonalSpace({screen,go});
 if(['eyes','reach','shoulders'].includes(AVATAR_PAGES[page.id]?.key))return mountMeasurements({screen,go,section:AVATAR_PAGES[page.id]});
 for(const child of screen.children)child.hidden=true;
 const panel=make('section','avatar-panel');screen.append(panel);const section=AVATAR_PAGES[page.id];let project,values,index=0,dirty=false;
 const status=make('p','avatar-status');status.setAttribute('role','status');
 try{project=readTravelProject();values=section?avatarValues(project,section):{};}catch(e){panel.append(make('h1','','Avatar data could not be opened'),make('p','',e.message),button('Back',()=>go('command:back')));return {resize(){},dispose(){}};}
 const header=title=>{const head=make('header','avatar-header');head.append(button('‹',()=>go(section?AVATAR_HOME:'command:back'),'avatar-back'),make('h1','',title));head.firstChild.setAttribute('aria-label',section?'Back to avatar setup':'Back');panel.append(head);};
 function home(){panel.classList.add('avatar-home');panel.replaceChildren();header('Your avatar');
  const hero=make('div','avatar-hero'),image=make('img');image.src='assets/mockplus/D52CE30DEF548874D92448790837F294.jpg';image.alt='Original Aura body and colour rings';const copy=make('div');copy.append(make('h2','','Make Aura fit you'),make('p','','Your preferences, personal space and body proportions. Start anywhere.'));hero.append(copy,image);panel.append(hero);
  const menu=make('nav','avatar-menu');menu.setAttribute('aria-label','Avatar setup sections');for(const s of AVATAR_SECTIONS){const count=avatarProgress(project,s),b=button('',()=>go(s.id),'avatar-card'),symbol=make('span','avatar-symbol'),copy=make('span','avatar-card-copy');symbol.append(icon(s.icon));copy.append(make('strong','',s.title),make('small','',s.summary));const progress=make('span','avatar-count',count.filled?`${count.filled}/${count.total}`:'›');progress.setAttribute('aria-label',count.filled?`${count.filled} of ${count.total} answered`:'Open section');b.append(symbol,copy,progress);menu.append(b);}panel.append(menu);
  panel.append(make('p','avatar-footnote','Optional inputs, saved on this browser. Measurements prepare your avatar; they do not yet resize the live matrix.'));
  const ratios=avatarRatios(project),summary=[];if(ratios.reach!==null)summary.push(`Overhead reach / height: ${ratios.reach.toFixed(2)}`);if(ratios.span!==null)summary.push(`Arm span / height: ${ratios.span.toFixed(2)}`);if(summary.length)panel.append(make('p','avatar-ratio',summary.join(' · ')));
  const foot=make('footer','avatar-footer');foot.append(button('QuickStart',()=>go('D203ACAB-C2D1-4433-8EE2-3522C47CC3D0')),button('Pose tools',()=>go('962597DE-3BC2-4A07-8EBF-1FAA1BB3CA5E')));panel.append(foot);
 }
 function draw(){panel.replaceChildren();header(section.title);panel.append(make('p','avatar-intro',section.intro));
  const tabs=make('nav','avatar-steps');tabs.setAttribute('aria-label','Question pages');section.steps.forEach((step,i)=>{const b=button(String(i+1),()=>{index=i;draw();});b.title=step.title;b.setAttribute('aria-label',step.title);b.setAttribute('aria-current',index===i?'step':'false');tabs.append(b);});tabs.append(make('span','',`${index+1} / ${section.steps.length}`));if(section.steps.length>1)panel.append(tabs);
  const step=section.steps[index],form=make('form','avatar-form');panel.append(form);form.append(make('h2','',step.title));
  for(const field of step.fields){const label=make('label','avatar-field'),caption=make('span','',field.label+(field.unit?` (${field.unit})`:'')),input=make(field.options?'select':field.kind==='text'?'textarea':'input');input.setAttribute('aria-label',caption.textContent);
   if(field.options){const choices=['',...field.options];if(values[field.id]&&!choices.includes(values[field.id]))choices.push(values[field.id]);for(const option of choices){const n=make('option','',option||'Choose if you wish');n.value=option;input.append(n);}}else if(field.kind==='number'){input.type='number';input.min='0';input.step='any';input.inputMode='decimal';input.placeholder='Not entered';}else{input.rows=2;input.maxLength=2000;input.placeholder='Add a note (optional)';}
   input.value=values[field.id]||'';input.oninput=()=>{values[field.id]=input.value;dirty=true;status.textContent='Unsaved changes';};input.onchange=input.oninput;label.append(caption,input);form.append(label);
  }
  if(step.help)form.append(make('p','avatar-help',step.help));
  status.textContent=dirty?'Unsaved changes':'Your answers are optional. Leave unknown values blank.';panel.append(status);
  const foot=make('footer','avatar-footer'),save=make('button','avatar-primary',index<section.steps.length-1?'Save & next':'Save answers');save.type='submit';save.setAttribute('form','avatar-form');form.id='avatar-form';form.onsubmit=e=>{e.preventDefault();try{project=writeTravelProject(p=>saveAvatar(p,section,values));dirty=false;if(index<section.steps.length-1)index++;draw();status.textContent='Saved in your Aura tables.';}catch(e){status.textContent=e.message;}};
  foot.append(button('Cancel',()=>go(AVATAR_HOME)),save);panel.append(foot);
 }
 if(section)draw();else home();return {resize(){},dispose(){}};
}

function mountAvatarMenu({page,screen,go}){
 for(const child of screen.children)child.hidden=true;
 const panel=make('section','avatar-panel avatar-creation');screen.append(panel);
 const head=make('header','avatar-header'),back=button('‹',()=>go('command:back'),'avatar-back');back.setAttribute('aria-label','Back');head.append(back,make('h1','','Avatar creation'));panel.append(head,make('p','creation-intro','Shape how your Aura looks, moves and communicates.'));
 const choices=[
  ['Ratios of Body to Aura','Body & Aura','Measurements, proportions and personal space','body'],
  ['Pose Estimation Algorithm','Pose & movement','Body position and motion','pose'],
  ['Face Mapping and Overlays','Face & overlays','Facial points and appearance','face'],
  ['Emotional Expression Algorithm','Expression','Expressions and reactions','expression'],
  ['Natural Language Processing','Language','Words and communication','language']
 ];
 const menu=make('nav','creation-grid');menu.setAttribute('aria-label','Avatar creation sections');
 for(const [original,title,description,art]of choices){
  const control=page.controls.find(c=>c.properties.text===original),target=control?.links[0]?.target;
  if(!target)continue;
  const card=button('',()=>go(target),`creation-card creation-${art}`);card.setAttribute('aria-label',original);card.title=original;card.dataset.destination=target;
  const visual=make('span','creation-art');visual.append(creationArt(art));const copy=make('span','creation-copy');copy.append(make('strong','',title),make('small','',description));card.append(visual,copy);menu.append(card);
 }
 panel.append(menu);const foot=make('footer','avatar-footer');foot.append(button('QuickStart',()=>go('D203ACAB-C2D1-4433-8EE2-3522C47CC3D0')));panel.append(foot);
 return {resize(){},dispose(){}};
}
function creationArt(kind){
 const node=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
 const root=node('svg',{viewBox:'0 0 160 125','aria-hidden':'true'});
 const picture=(file,crop,x=0,y=0,width=160,height=125)=>{const frame=node('svg',{x,y,width,height,viewBox:crop,preserveAspectRatio:'xMidYMid meet',overflow:'hidden'});const id=`creation-clip-${kind}-${x}`;const defs=node('defs'),clip=node('clipPath',{id});const [a,b,c,d]=crop.split(' ');clip.append(node('rect',{x:a,y:b,width:c,height:d}));defs.append(clip);frame.append(defs,node('image',{href:file,x:0,y:0,width:1254,height:1254,'clip-path':`url(#${id})`}));root.append(frame);};
 if(kind==='body'){
  root.append(node('image',{href:'assets/mockplus/D52CE30DEF548874D92448790837F294.jpg',x:17,y:0,width:126,height:125,preserveAspectRatio:'xMidYMid meet'}));
 }else if(kind==='pose'){
  picture('assets/avatar/measurements-male.png','650 0 570 600');
  root.append(node('path',{d:'M28 30H132 M80 30V72 M80 72L69 111 M80 72L91 111',fill:'none',stroke:'#6c4ca9','stroke-width':1.2}));
  for(const [cx,cy]of [[28,30],[53,30],[80,30],[107,30],[132,30],[80,72],[69,111],[91,111]])root.append(node('circle',{cx,cy,r:2.3,fill:'#8360bd',stroke:'white','stroke-width':.8}));
 }else if(kind==='face'){
  picture('assets/avatar/measurements-female.png','160 10 310 380');
  root.append(node('path',{d:'M49 62L80 55 111 62 98 88 80 101 62 88Z M49 62L80 81 111 62 M62 88H98 M80 55V101',fill:'none',stroke:'#49a7a7','stroke-width':1.2}));
  for(const [cx,cy]of [[49,62],[80,55],[111,62],[80,81],[62,88],[98,88],[80,101]])root.append(node('circle',{cx,cy,r:2,fill:'#49a7a7',stroke:'white','stroke-width':.6}));
 }else if(kind==='expression'){
  picture('assets/avatar/eyes-male.png','418 20 418 360',2,8,80,108);
  picture('assets/avatar/eyes-female.png','418 856 418 360',80,8,80,108);
 }else{
  picture('assets/avatar/measurements-female.png','100 0 450 600',0,8,95,115);
  root.append(node('path',{d:'M83 17H146Q153 17 153 24V48Q153 55 146 55H102L91 65V55H83Q76 55 76 48V24Q76 17 83 17Z',fill:'#ece4f8',stroke:'#bfa8dc','stroke-width':1}),node('text',{x:115,y:42,'text-anchor':'middle','font-family':'Segoe UI, sans-serif','font-size':16,fill:'#5c3988'},'Hello'));
  for(let i=0;i<9;i++){const h=[8,15,22,12,28,18,10,19,7][i];root.append(node('line',{x1:95+i*6,x2:95+i*6,y1:90-h/2,y2:90+h/2,stroke:'#9873bb','stroke-width':3,'stroke-linecap':'round'}));}
 }
 return root;
}
