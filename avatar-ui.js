import {mountPersonalSpace} from './personal-space-ui.js?v=0.4.3';
import {AVATAR_HOME,AVATAR_SECTIONS,AVATAR_PAGES,avatarValues,avatarProgress,saveAvatar,avatarRatios} from './avatar-data.js?v=0.4.3';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.3';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn,cls='')=>{const n=make('button',cls,text);n.type='button';n.onclick=fn;return n;};
const paths={person:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 22v-3a8 8 0 0 1 16 0v3',space:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14M8 2h8M8 22h8',eyes:'M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',reach:'M12 7v14M8 22l4-7 4 7M5 2l7 9 7-9M12 2v1',shoulders:'M2 12h20M12 10v12M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6'};
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[name]);svg.append(path);return svg;}
export function mountAvatar({page,screen,go}){
 if(AVATAR_PAGES[page.id]?.key==='space')return mountPersonalSpace({screen,go});
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
