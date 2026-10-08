import {AVATAR_QUESTIONS as AVATAR_FIELDS,AVATAR_SECTIONS,avatarValues,saveAvatar} from './avatar-data.js?v=0.4.26';
import {framePoint} from './frame-display.js?v=0.4.26';
import {tripForm,goalForm} from './travel-ui.js?v=0.4.26';
import {pageIcon} from './page-icons.js?v=0.4.26';
import {blankProject,validateProject,parseCSV,SHELLS} from './core.js?v=0.4.26';
import {readPersonalSpace,savePersonalSpace} from './personal-space-data.js?v=0.4.26';
import {allocationPlan,allocateTable,pendingRows} from './dataset-allocation.js?v=0.4.26';
import {targetLabel} from './spatial.js?v=0.4.26';
import {TORUS} from './original-routes.js?v=0.4.26';
import {QUICK_SECTIONS,QUICK_ORDER,QUICK_BATCHES,QUICK_JOURNEY,QUICK_ROUTES,quickStage,AVATAR_LINKS,SETUP_TABLES,connectSetupEntries,saveSectionEntry} from './quickstart-data.js?v=0.4.26';
import {birthdayFor} from './life-data.js?v=0.4.26';
import {mountAvatarPhotos} from './avatar-photo-ui.js?v=0.4.26';
import {profilePhotos} from './avatar-photos-data.js?v=0.4.26';
import {FRIENDSHIP_CHAPTERS,friendshipProfile,saveFriendshipProfile} from './friendship-data.js?v=0.4.26';
import {DATING_CHAPTERS,datingProfile,saveDatingProfile} from './dating-data.js?v=0.4.26';
import {mountDimensionsPreview} from './aura-dimensions-preview.js?v=0.4.26';
import {mountAuraGlow,GLOW_UP} from './aura-glow-ui.js?v=0.4.26';
export const QUICKSTART='D203ACAB-C2D1-4433-8EE2-3522C47CC3D0';
const KEY='aura-matrix-studio:v4:project';
export const turnPage=(index,delta,count)=>Math.max(0,Math.min(count-1,index+delta));
export const swipeDirection=(dx,dy)=>Math.abs(dx)>=35&&Math.abs(dx)>Math.abs(dy)?dx<0?1:-1:0;
export function saveQuickEntry(project,dataset,values,rowId){
  const next=structuredClone(project);let table=next.tables.find(t=>t.id==='quickstart-'+dataset.id);
  if(!table){table={id:'quickstart-'+dataset.id,name:dataset.name,category:dataset.category,recommendation:dataset.id,columns:[...dataset.columns],rows:[],chakraTags:dataset.chakraRelevance.map(r=>r.shell)};next.tables.push(table);}
  for(const key of Object.keys(values))if(!table.columns.includes(key))throw Error('This table no longer has the '+key+' column. Use Tables to edit it.');
  let row=rowId&&table.rows.find(r=>r.id===rowId);if(!row){row={id:rowId||crypto.randomUUID(),values:table.columns.map(()=> '')};table.rows.push(row);}
  for(const [key,value]of Object.entries(values))row.values[table.columns.indexOf(key)]=value;
  return validateProject(next);
}
export function validBirthday(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
export function birthdayFromParts(day,month,year){if(!/^\d{4}$/.test(String(year))||Number(year)<1)return '';const date=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return validBirthday(date)?date:'';}
export function mountQuickStart({page,screen,catalogue,go}){
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(text,fn)=>{const b=make('button','quick-secondary',text);b.type='button';b.onclick=fn;return b;};
  let project,index=0,stage='birthday',tableId='',recId='',rowPage=0,colPage=0,preview=null,pane='setup',flipping=false,flipAnimation=null,welcome=true,draft=null,draftTimer=0,auraPreview=null,photoPanel=null,renderGeneration=0;
  function read(){const raw=localStorage.getItem(KEY)??localStorage.getItem('aura-matrix-studio:v3:project')??localStorage.getItem('aura-matrix-studio:v2:project')??localStorage.getItem('aura-matrix-studio:v1:project');project=raw?validateProject(JSON.parse(raw)):blankProject();}
  function mutate(fn){read();const next=fn(structuredClone(project));project=validateProject(next);localStorage.setItem(KEY,JSON.stringify(project));}
  function safely(fn){try{fn();}catch(e){message.textContent=e.message;}}
  function chooseStage(id){if(id==='body')id='avatar';if(id==='family')id='dating';const guided=quickStage(id),legacy=catalogue.steps.findIndex(s=>s.id===id);if(guided||id==='ready'||legacy>=0){stage=id;index=guided?.index??(id==='ready'?9:legacy);return true;}return false;}
  read();index=project.quickStart.step;stage=project.quickStart.stage|| (index===9?'aura-setup':catalogue.steps[index].id);const requestedStep=new URLSearchParams(location.search).get('step');chooseStage(requestedStep||stage);
  for(const c of page.controls){if(c.controlTypeID==='Icon'&&!c.links.length&&+c.w===24&&+c.h===24||['CoverFlow','ProgressBar'].includes(c.controlTypeID)||c.controlTypeID==='Shape'&&/Step|Constructer/.test(c.properties.text||''))screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;}
  const book=make('section','quick-book');book.setAttribute('aria-label','QuickStart swipe reader');book.tabIndex=0;
  const card=button('',()=>{if(!swiped)open();});card.className='quick-card';const prev=button('Previous\nStep',()=>turn(-1)),next=button('Next\nStep',()=>turn(1));prev.className='quick-prev';next.className='quick-next';book.append(prev,card,next);screen.append(book);
  const progress=make('div','quick-progress');progress.setAttribute('role','status');screen.append(progress);
  const dialog=make('dialog','quick-dialog'),head=make('header'),title=make('h2'),close=button('Done',()=>safely(()=>{checkPhotoReady();rememberDraft();dialog.close();})),body=make('div','quick-body'),message=make('p','quick-message');message.setAttribute('role','status');head.append(title,close);dialog.append(head,body,message);document.body.append(dialog);
  const selectedTable=()=>project.tables.find(t=>t.id===tableId);
  const stepPages=['DC827E51-FDDD-49EC-BB9D-7FFAE33159BC','3A178076-5EF1-41A0-8229-62636BE4F256','AE87688C-93C9-4AB1-A72D-A447ED56C5E0','951AAB58-F4AE-41E2-A790-4F204A0EC475','2E5320C1-E2FE-4EE5-B62E-3CB9013D4010','82791921-1F9A-4056-A0FE-B4385FD5377A','02B0EE12-8186-4347-BFC7-06657FAC52D8','E933DDB8-9FDE-445A-97A0-686C17B77380','DAFCEEE9-7303-415D-975B-AB7176A59010','1FE14FC9-F981-4E27-B038-BDF3FF404838'];
  function savePosition(p){p.quickStart.step=index;p.quickStart.stage=stage;return p;}
  function checkPhotoReady(){if(photoPanel?.busy())throw Error('Wait for the photo to finish preparing.');}
  function draftControls(form){return [...form.querySelectorAll('input:not([type=file]):not([type=hidden]),select,textarea')].map(n=>[n.getAttribute('aria-label')||n.closest('label')?.querySelector('span')?.textContent,n]).filter(([label])=>label);}
  function draftFields(form){return Object.fromEntries(draftControls(form).map(([label,n])=>[label,n.type==='checkbox'?n.checked:n.value]));}
  function rememberDraft(){
    clearTimeout(draftTimer);if(!draft)return;const fields=draftFields(draft.form);if(JSON.stringify(fields)===draft.baseline&&!draft.restored)return;
    mutate(p=>{p.quickStart.drafts={...p.quickStart.drafts,[draft.key]:fields};return p;});
  }
  function registerDraft(form,save,filled,key=stage){
    const baseline=JSON.stringify(draftFields(form)),saved=project.quickStart.drafts?.[key];
    if(saved)for(const [label,n]of draftControls(form))if(Object.hasOwn(saved,label)){if(n.type==='checkbox')n.checked=saved[label]===true;else n.value=saved[label];}
    draft={form,key,baseline,restored:!!saved,filled,canCommit:!!save,save(){save();clearDraft(key);}};
    const queue=()=>{clearTimeout(draftTimer);draftTimer=setTimeout(()=>safely(rememberDraft),200);};form.addEventListener('input',queue);form.addEventListener('change',queue);
  }
  function clearDraft(key){mutate(p=>{if(p.quickStart.drafts)delete p.quickStart.drafts[key];return p;});clearTimeout(draftTimer);if(draft?.key===key){draft.baseline=JSON.stringify(draftFields(draft.form));draft.restored=false;}}
  function openSection(destination=quickStage(stage)?.destination||stepPages[index],extra={}){safely(()=>{checkPhotoReady();rememberDraft();if(draft?.canCommit&&draft.filled()&&draft.form.checkValidity())draft.save();mutate(savePosition);dialog.close();go(destination,{quickstep:stage,...extra});});}
  function redrawCard(){const step=catalogue.steps[index],guided=quickStage(stage),position=QUICK_JOURNEY.findIndex(s=>s.id===stage),icon=make('img');icon.src='assets/mockplus/'+pageIcon(guided?.destination||stepPages[index]);icon.alt='';const label=guided?.title||(stage==='ready'?'Your Aura is ready':step.title);card.replaceChildren(make('small','',guided?`${position+1} / ${QUICK_JOURNEY.length}`:'Explore when useful'),icon,make('strong','',label),make('span','',guided?.group||QUICK_BATCHES[index]),make('span','','Tap to open'));prev.disabled=QUICK_ROUTES.indexOf(stage)<=0;next.disabled=QUICK_ROUTES.indexOf(stage)>=QUICK_ROUTES.length-1;progress.textContent=guided?`Know Thy Self: step ${position+1} of ${QUICK_JOURNEY.length}`:'Optional sections: explore in any order';card.setAttribute('aria-label','Open '+label);}
  function turn(delta){
    if(photoPanel?.busy()){message.textContent='Wait for the photo to finish preparing.';return false;}
    if(flipping){flipAnimation?.cancel();book.querySelector('.quick-turning-page')?.remove();flipping=false;delete book.dataset.flipping;}let moved=false;
    safely(()=>{const nextStage=QUICK_ROUTES[turnPage(QUICK_ROUTES.indexOf(stage),delta,QUICK_ROUTES.length)];if(nextStage===stage)return;
      rememberDraft();
      const old=card.cloneNode(true);old.removeAttribute('aria-label');old.setAttribute('aria-hidden','true');old.tabIndex=-1;old.classList.add('quick-turning-page');
      chooseStage(nextStage);mutate(savePosition);const url=new URL(location.href);url.searchParams.set('step',stage);history.replaceState(history.state,'',url);redrawCard();moved=true;
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      flipping=true;book.dataset.flipping='true';book.append(old);
      const sheet=delta>0?old:card;old.style.zIndex=delta>0?'5':'1';card.style.zIndex='2';
      const frames=delta>0?[{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:'rotateY(-95deg)',filter:'brightness(.65)',offset:.55},{transform:'rotateY(-180deg)',filter:'brightness(.9)'}]:[{transform:'rotateY(-180deg)',filter:'brightness(.8)'},{transform:'rotateY(-85deg)',filter:'brightness(.65)',offset:.45},{transform:'rotateY(0deg)',filter:'brightness(1)'}];
      flipAnimation=sheet.animate(frames,{duration:650,easing:'ease-in-out'});
      flipAnimation.finished.catch(()=>{}).finally(()=>{old.remove();flipping=false;delete book.dataset.flipping;});
    });return moved;
  }
  function navigate(delta){if(!turn(delta))return;recId='';tableId='';pane='setup';welcome=true;render();animateBody(delta);}
  function jumpStage(id){safely(()=>{rememberDraft();if(!chooseStage(id))return;mutate(savePosition);const url=new URL(location.href);url.searchParams.set('step',stage);history.replaceState(history.state,'',url);welcome=stage!=='allocate';tableId='';render();redrawCard();});}
  function animateBody(delta){if(!matchMedia('(prefers-reduced-motion: reduce)').matches)body.animate([{transform:`perspective(900px) rotateY(${delta>0?30:-30}deg)`,opacity:.25},{transform:'perspective(900px) rotateY(0deg)',opacity:1}],{duration:450,easing:'ease-out'});}
  let start=null,swiped=false;
  book.addEventListener('pointerdown',e=>{start={...framePoint(screen,e),id:e.pointerId};swiped=false;});
  book.addEventListener('pointermove',e=>{if(start&&Math.abs(framePoint(screen,e).x-start.x)>10)book.setPointerCapture(e.pointerId);});
  book.addEventListener('pointerup',e=>{if(!start)return;const direction=swipeDirection(framePoint(screen,e).x-start.x,framePoint(screen,e).y-start.y);if(direction){swiped=true;turn(direction);}start=null;});
  book.addEventListener('pointercancel',()=>start=null);
  book.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopImmediatePropagation();swiped=false;}},true);
  book.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}});
  function field(label,input){const n=make('label','quick-field');n.append(make('span','',label),input);return n;}
  function select(label,items,value,onchange){const n=make('select');n.setAttribute('aria-label',label);for(const [v,t]of items){const o=make('option','',t);o.value=v;n.append(o);}n.value=value;n.onchange=onchange;return n;}
  function input(label,value,type='text'){const n=make('input');n.type=type;n.value=value;n.setAttribute('aria-label',label);return n;}
  function open(){safely(()=>{read();tableId='';recId=catalogue.steps[index].datasets[0]||'imports';rowPage=colPage=0;welcome=stage!=='allocate';render();dialog.showModal();});}
  function render(){
    clearTimeout(draftTimer);photoPanel?.dispose();photoPanel=null;renderGeneration++;auraPreview?.dispose();auraPreview=null;read();const step=catalogue.steps[index],guided=quickStage(stage);dialog.dataset.step=String(index);dialog.dataset.stage=stage;dialog.classList.toggle('is-guided',welcome);title.textContent=guided?.title||(stage==='ready'?'Review your starting Aura':step.title);body.replaceChildren();message.textContent='';preview=null;draft=null;
    body.append(make('p','quick-intro',guided?.intro||(stage==='ready'?'Your starting profile and choices are saved. Your Aura can keep growing. Explore the existing sections in whatever order is useful to you.':QUICK_SECTIONS[index].intro)));
    renderContent(step);if(welcome&&stage!=='ready'&&index!==8)stepNavigation();renderFooter();body.scrollTop=0;
  }
  function renderFooter(){
    const footer=make('footer','quick-page-footer'),details=make('details'),links=make('div','quick-footer-links'),guided=quickStage(stage);details.append(make('summary','','More options'),links);
    const full=button('Open '+(guided?.label||QUICK_SECTIONS[index].label),()=>openSection());links.append(full);
    if(index===1)for(const [label,destination]of AVATAR_LINKS)if(destination!==(guided?.destination||stepPages[index]))links.append(button('Open '+label,()=>openSection(destination)));
    if(index===9)links.append(button('Open matrix',()=>openSection(TORUS)));
    links.append(button('Import or export Aura data',()=>openSection('aura-data-transfer')));footer.append(details);body.append(footer);
  }
  function renderContent(step){
    if(stage==='aura-dimensions'&&welcome){renderDimensions();return;}
    if(stage==='avatar-photos'&&welcome){photoPanel=mountAvatarPhotos({screen:body,go,onContinue:()=>navigate(1),compact:true});return;}
    if(stage==='favourites'&&welcome){renderFavourites();return;}
    if(stage==='social-preferences'&&welcome){renderSocialPreferences();return;}
    if(stage==='dating'&&welcome){renderDating();return;}
    if(index===9&&welcome){renderAuraSetup();return;}
    if(index===8&&welcome){renderTravel();return;}
    if(index<8&&welcome){renderGuided();return;}
    const top=make('div','quick-actions'),catalogueLink=make('a','','Read full catalogue');catalogueLink.href='DATASET-CATALOGUE.md';catalogueLink.target='_blank';catalogueLink.rel='noopener';
    const previousStep=button('Back',()=>navigate(-1)),nextStep=button('Next',()=>navigate(1));previousStep.disabled=index===0;nextStep.disabled=index===catalogue.steps.length-1;top.append(previousStep,nextStep,button('Backup',backup),catalogueLink);body.append(top);
    if(step.id==='allocate'){renderAllocation();return;}
    const activeTable=selectedTable();if(activeTable){const tabs=make('div','quick-actions');for(const [key,label] of [['setup','Dataset'],['table','Rows'],['tags','Chakras']]){const b=button(label,()=>{pane=key;render();});b.setAttribute('aria-pressed',String(pane===key));tabs.append(b);}body.append(tabs);if(pane!=='setup'){renderTable(activeTable);return;}}
    const recs=step.datasets.map(id=>catalogue.datasets.find(d=>d.id===id));if(!recs.some(r=>r.id===recId))recId=recs[0].id;
    const rec=catalogue.datasets.find(d=>d.id===recId),choices=select('Recommended dataset',recs.map(r=>[r.id,r.name]),recId,()=>{recId=choices.value;tableId='';render();});
    body.append(field('Recommended dataset',choices));
    const reasons=make('p','quick-reasons',rec.chakraRelevance.map(r=>`${SHELLS[r.shell][0]}: ${r.reason}`).join(' '));body.append(reasons);
    const tables=project.tables.filter(t=>t.recommendation===recId),list=select('Your tables',[['','Choose a saved table'],...tables.map(t=>[t.id,t.name])],tableId,()=>{tableId=list.value;pane='table';rowPage=colPage=0;render();});
    const actions=make('div','quick-actions');actions.append(list,button('New table',()=>safely(()=>{const id=crypto.randomUUID();mutate(p=>{p.tables.push({id,name:rec.name,category:rec.category,recommendation:rec.id,columns:[...rec.columns],rows:[],chakraTags:rec.chakraRelevance.map(r=>r.shell)});return p;});tableId=id;pane='table';rowPage=colPage=0;render();})),button('Import CSV',()=>file.click()));body.append(actions);
    const file=make('input');file.type='file';file.accept='.csv,text/csv';file.hidden=true;body.append(file);
    file.onchange=async()=>{try{const f=file.files[0];if(!f)return;const csv=parseCSV(await f.text()),id=crypto.randomUUID();mutate(p=>{p.tables.push({id,name:f.name.replace(/\.csv$/i,''),category:rec.category,recommendation:rec.id,columns:csv.headers,rows:csv.rows.map(values=>({id:crypto.randomUUID(),values})),chakraTags:rec.chakraRelevance.map(r=>r.shell)});return p;});tableId=id;pane='table';rowPage=colPage=0;render();message.textContent=`Imported ${csv.rows.length} rows, retaining all columns.`;}catch(e){message.textContent=e.message;}};
    if(rec.note)body.append(make('p','quick-note',rec.note));
    const table=selectedTable();if(table){body.append(button('Edit table rows',()=>{pane='table';render();}));}else body.append(make('p','quick-empty','Start a blank table or import a CSV. You can skip any dataset and return later.'));
  }
  function renderTravel(){
    const choices=make('div','quick-answer-choices quick-travel-choices'),form=make('div','quick-travel-entry');
    function choose(mode){rememberDraft();const key='travel-'+mode;for(const b of choices.children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode));form.replaceChildren();if(mode==='goal')goalForm(form,()=>clearDraft(key));else tripForm(form,{initialStatus:mode,brief:true,onSave:()=>clearDraft(key)});const travelForm=form.querySelector('form');registerDraft(travelForm,null,()=>[...travelForm.querySelectorAll('input')].some(n=>n.value.trim()),key);}
    for(const [mode,label]of [['Visited','Already visited'],['Want to go','Want to visit'],['goal','Travel goal']]){const b=button(label,()=>choose(mode));b.dataset.mode=mode;choices.append(b);}body.append(stepArt(8,'Your world'),choices,form);choose('Visited');
    const actions=make('div','quick-actions quick-travel-footer');actions.append(button('Back',()=>navigate(-1)),button('Continue',()=>navigate(1)));body.append(actions);
  }
  function stepNavigation(){
    const bar=make('nav','quick-step-navigation'),position=QUICK_JOURNEY.findIndex(s=>s.id===stage),back=button('Back',()=>navigate(-1));bar.setAttribute('aria-label','QuickStart steps');back.disabled=stage==='birthday';bar.append(back,make('span','',position>=0?`${position+1} of ${QUICK_JOURNEY.length}`:'Review'),button('Skip for now',()=>navigate(1)));body.append(bar);
  }
  function renderDimensions(){
    const state=readPersonalSpace(project),form=make('form','quick-welcome'),drawing=make('div','quick-space-drawing'),inputs=[];
    const height=input('Your height (cm)',state.height,'number');height.min=1;height.step='any';form.append(drawing,field('Your height (cm)',height));
    const grid=make('div','quick-space-fields');for(const [i,name]of SHELLS.entries()){const n=input(name[0]+' layer radius (cm)',state.radii[i],'number');n.min=1;n.step='any';inputs.push(n);grid.append(field(name[0]+' radius (cm)',n));}form.append(grid,make('p','quick-note','Radius is measured from your centre. Keep each outer layer wider than the one inside it.'));
    const context=input('Where or with whom do these distances apply?',state.notes['space-context']||''),contact=input('Touch and greeting preferences',state.notes['space-contact']||'');form.append(field('Context',context),field('Touch and greetings',contact));
    auraPreview=mountDimensionsPreview(drawing,state);function draw(){auraPreview.update({...state,height:Number(height.value),radii:inputs.map(n=>Number(n.value))});}
    for(const n of [height,...inputs])n.oninput=draw;draw();
    const save=()=>mutate(p=>savePersonalSpace(p,Number(height.value),inputs.map(n=>Number(n.value)),state.meanings,{...state.notes,'space-context':context.value,'space-contact':contact.value},state.figure));const submit=make('button','quick-primary','Save dimensions & continue');submit.type='submit';form.append(submit);registerDraft(form,save,()=>true);draw();form.onsubmit=e=>{e.preventDefault();safely(()=>{draft.save();navigate(1);});};body.append(form);
  }
  function renderSocialPreferences(){
    const form=make('form','quick-welcome'),values=friendshipProfile(project),fields=[];
    const keys=['Friendship hopes','Values','Contact rhythm','Communication','Boundaries','Based near'];
    for(const key of keys){const descriptor=FRIENDSHIP_CHAPTERS.flatMap(c=>c.fields).find(f=>f.key===key);if(!descriptor)continue;if(descriptor.type==='choices'){const group=make('fieldset','quick-social-choices');group.append(make('legend','',descriptor.label));let selected=[];try{selected=JSON.parse(values[key]||'[]');}catch{}const choices=[];for(const value of descriptor.options){const n=make('input');n.type='checkbox';n.checked=selected.includes(value);choices.push([value,n]);group.append(field(value,n));}form.append(group);fields.push([key,()=>JSON.stringify(choices.filter(([,n])=>n.checked).map(([v])=>v))]);}else{const n=input(descriptor.label,values[key]||'');form.append(field(descriptor.label,n));fields.push([key,()=>n.value]);}}
    const save=()=>mutate(p=>saveFriendshipProfile(p,Object.fromEntries(fields.map(([key,value])=>[key,value()]))));const submit=make('button','quick-primary','Save preferences & continue');submit.type='submit';form.append(submit);registerDraft(form,save,()=>fields.some(([,value])=>!['','[]'].includes(value())));form.onsubmit=e=>{e.preventDefault();safely(()=>{draft.save();navigate(1);});};body.append(form);
  }
  function renderFavourites(){
    const form=make('form','quick-welcome'),groups=[];
    for(const [key,label,category]of [['favourites-value','A value that matters to you','Value'],['favourites-experience','An experience you enjoy','Experience'],['favourites-item','Something you love','Book']]){
      const ref=project.quickStart.entries?.[key]||(key==='favourites-item'?project.quickStart.entries?.favourites:null),table=project.tables.find(t=>t.id===ref?.tableId),row=table?.rows.find(r=>r.id===ref?.id),values=row?Object.fromEntries(table.columns.map((c,i)=>[c,row.values[i]])):{};
      const title=input(label,values.Title||''),meaning=input('What resonates: '+label,values['What resonates']||''),type=key==='favourites-item'?select('Favourite category',['Book','Music','TV','Film','Game','Place','Experience','Value','Virtue','Emotion','Sensation'].map(v=>[v,v]),values.Category||category,()=>{}):null;
      form.append(make('h3','',label),field(label,title));if(type)form.append(field('Category',type));form.append(field('What makes it meaningful?',meaning));groups.push({key,title,meaning,type,category,ref:row?ref:null});
    }
    const save=()=>mutate(project=>{let next=project;for(const group of groups){if(!group.title.value.trim()){if(group.ref)throw Error('Keep a title for a saved favourite. Remove entries in the full section.');if(group.meaning.value.trim())throw Error('Give this favourite a title so its meaning can be saved.');continue;}const before=new Set(next.tables.filter(t=>t.recommendation==='inspiration').flatMap(t=>t.rows.map(r=>r.id)));next=saveSectionEntry(next,5,{Title:group.title.value.trim(),Category:group.type?.value||group.category,'What resonates':group.meaning.value.trim()},group.ref);const ref=group.ref||next.tables.filter(t=>t.recommendation==='inspiration').flatMap(t=>t.rows.map(r=>({tableId:t.id,id:r.id}))).find(r=>!before.has(r.id));next.quickStart.entries={...next.quickStart.entries,[group.key]:ref};}return next;});
    const submit=make('button','quick-primary','Save & continue');submit.type='submit';form.append(submit);registerDraft(form,save,()=>groups.some(g=>g.title.value.trim()));form.onsubmit=e=>{e.preventDefault();safely(()=>{draft.save();navigate(1);});};body.append(form);
  }
  function renderDating(){
    const form=make('form','quick-welcome'),values=datingProfile(project),descriptors=DATING_CHAPTERS.flatMap(c=>c.fields),fields=[];
    for(const key of ['Connection wanted','Attracted to','Pace','Boundaries']){const descriptor=descriptors.find(f=>f.key===key);if(descriptor.type==='choices'){const group=make('fieldset','quick-social-choices');group.append(make('legend','','What are you open to?'));let selected=[];try{selected=JSON.parse(values[key]||'[]');}catch{}const choices=[];for(const value of descriptor.options.filter(v=>['Romance','Long-term partnership','Casual dating','Companionship','Friendship first','Exploring'].includes(v))){const n=input(value,'','checkbox');n.checked=selected.includes(value);choices.push([value,n]);group.append(field(value,n));}fields.push([key,()=>JSON.stringify([...new Set([...selected.filter(v=>!choices.some(([option])=>option===v)),...choices.filter(([,n])=>n.checked).map(([v])=>v)])])]);form.append(group);}else{const labels={'Attracted to':'Who would you like to meet?','Pace':'What pace feels right?','Boundaries':'What boundaries matter to you?'},n=input(labels[key],values[key]||'');form.append(field(labels[key],n));fields.push([key,()=>n.value]);}}
    const submit=make('button','quick-primary','Save preferences & continue');submit.type='submit';form.append(submit);registerDraft(form,()=>mutate(p=>saveDatingProfile(p,Object.fromEntries(fields.map(([key,get])=>[key,get()])))),()=>fields.some(([,get])=>!['','[]'].includes(get())));form.onsubmit=e=>{e.preventDefault();safely(()=>{draft.save();navigate(1);});};body.append(form);
  }
  function renderAuraSetup(){
    if(stage==='ready'){renderReady();return;}
    auraPreview=mountAuraGlow({screen:body,go,onContinue:()=>navigate(1),compact:true});
  }
  function renderReady(){
    const birthday=project.tables.find(t=>t.id==='quickstart-life-events'),profile=birthday?.rows.find(r=>r.id==='my-birthday'),name=profile?.values[birthday.columns.indexOf('Person or subject')]||'Your profile',space=readPersonalSpace(project),photos=profilePhotos(project).length;
    const summary=make('div','quick-review');summary.append(make('h3','',name),make('p','',`${photos} avatar views · ${space.height} cm tall`),button('Open my Aura',()=>openSection(GLOW_UP)));const review=make('details');review.append(make('summary','','Review my setup'));for(const section of QUICK_JOURNEY)review.append(button(section.title,()=>jumpStage(section.id)));summary.append(review);body.append(summary);
    const pending=project.tables.filter(t=>SETUP_TABLES.includes(t.id)).reduce((n,t)=>n+pendingRows(project,t).length,0);if(pending){body.append(make('p','quick-note','Connect your saved entries so you can explore them through your Aura.'),button('Connect my entries',()=>safely(()=>{mutate(connectSetupEntries);render();message.textContent='Entries connected.';})));}
    body.append(make('h3','','Keep developing your Aura'),make('p','','Choose any section when it becomes relevant. You can return to your setup choices at any time.'));const choices=make('div','quick-actions');for(const id of ['skills','goals','dates','timing','travel']){const i=catalogue.steps.findIndex(s=>s.id===id);choices.append(button(QUICK_SECTIONS[i].label,()=>jumpStage(id)));}choices.append(button('Programmable favourite pages',()=>openSection('B47A9839-38E6-49D8-B255-0D9E428E521C')));body.append(choices);
  }
  function stepArt(step,label){
    const paths=['M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z','M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 22v-3a8 8 0 0 1 16 0v3','M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a6 6 0 0 1 12 0v3m1-8a6 6 0 0 1 7 5v3','m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z','M6 10a6 6 0 0 1 12 0v5l2 3H4l2-3v-5Zm4 11h4','M12 21S2 15 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 7-10 13-10 13Z','M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3V4Zm9 2v15','M5 22V3m0 1h14l-3 5 3 5H5','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c-6 5-6 15 0 20 6-5 6-15 0-20ZM2 12h20','M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h6v6h-6v-6M9 6h6M6 9v6m12-6v6M9 18h6'];
    const hero=make('div','quick-step-hero'),art=make('div','quick-step-art');art.setAttribute('aria-hidden','true');
    art.innerHTML=`<svg viewBox="0 0 160 160"><circle class="step-orbit" cx="80" cy="80" r="70"/><circle class="step-orbit inner" cx="80" cy="80" r="55"/><circle class="step-spark" cx="127" cy="28" r="4"/><circle class="step-spark" cx="25" cy="112" r="2"/><g transform="translate(52 52) scale(2.33)" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[step]||paths[0]}"/></g></svg>`;
    hero.append(art,make('h3','',label));return hero;
  }
  function birthdayPicker(form,date){
    const hero=stepArt(0,'Your birthday');hero.classList.add('quick-birthday-hero');const art=hero.querySelector('.quick-step-art');art.querySelector('g').remove();
    const dayFace=make('strong','quick-birthday-day','?'),monthFace=make('span','quick-birthday-month','YOUR DAY');art.append(dayFace,monthFace);hero.append(make('p','','One date to start your Aura.'));form.append(hero);
    const parts=date.value.split('-'),group=make('div','quick-birthday-parts'),months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const day=select('Birth day',[['','Day'],...Array.from({length:31},(_,i)=>[String(i+1),String(i+1)])],parts[2]?String(Number(parts[2])):'',update),month=select('Birth month',[['','Month'],...months.map((m,i)=>[String(i+1),m])],parts[1]?String(Number(parts[1])):'',update),year=input('Birth year',parts[0]||'');year.inputMode='numeric';year.maxLength=4;year.placeholder='Year';year.pattern='[0-9]{4}';year.oninput=update;
    day.required=month.required=year.required=true;group.append(field('Day',day),field('Month',month),field('Year',year));form.append(group);
    const summary=make('p','quick-birthday-summary','Choose your day, month and year.');summary.setAttribute('role','status');form.append(summary);update();
    function update(){date.value=birthdayFromParts(day.value,month.value,year.value);dayFace.textContent=day.value||'?';monthFace.textContent=month.value?months[Number(month.value)-1]:'YOUR DAY';summary.textContent=date.value?`${Number(day.value)} ${months[Number(month.value)-1]} ${year.value}`:day.value&&month.value&&year.value.length===4?'Check that date.':'Choose your day, month and year.';}
  }
  function renderGuided(){
    const step=catalogue.steps[index],rec=catalogue.datasets.find(d=>d.id===step.datasets[0]);
    const form=make('form','quick-welcome'),controls=[];let rowId,defaults={},heading='';
    const sectionTable=project.tables.find(t=>t.id===project.quickStart.entries?.[step.id]?.tableId),sectionRow=sectionTable?.rows.find(r=>r.id===project.quickStart.entries[step.id].id),existing=sectionRow?{tableId:sectionTable.id,id:sectionRow.id}:null;
    function entry(column,label,type='text',options,required=true){
      const saved=existing?sectionTable:project.tables.find(t=>t.id==='quickstart-'+rec.id),row=existing?sectionRow:rowId&&saved?.rows.find(r=>r.id===rowId),section=AVATAR_SECTIONS.find(s=>s.steps.some(step=>step.fields.some(f=>f.id===column))),value=index===1&&section?avatarValues(project,section)[column]||'':column==='Birthday'&&existing?birthdayFor(project,existing)?.Date||'':row?.values[saved.columns.indexOf(column)]||'';
      if(options&&value&&!options.includes(value))options=[...options,value];
      const n=options?select(label,[['','Choose'],...options.map(v=>[v,v])],value,()=>{}):input(label,value,type);n.required=required;controls.push([column,n,required]);const wrap=field(label,n);form.append(wrap);return n;
    }
    if(index===0){rowId='my-birthday';defaults={Title:'My birthday'};entry('Person or subject','Name you want to use');entry('Date','Date of birth (optional)','date',null,false);entry('Place','Place of birth (optional)','text',null,false);entry('Meaning','A little about your background (optional)','text',null,false);}
    if(stage==='avatar'){form.append(make('h3','','Body details'));const height=entry('body-height','Height (cm)','number',null,false);height.min=.01;height.step='any';const weight=entry('body-weight','Weight (kg)','number',null,false);weight.min=.01;weight.step='any';form.append(make('h3','','Appearance and fit'));for(const f of [AVATAR_FIELDS[2],AVATAR_FIELDS[4],AVATAR_FIELDS[5]])entry(f.id,f.label,'text',f.options,false);form.append(make('h3','','Clothing sizes'));const group=AVATAR_SECTIONS[0].steps.find(s=>s.title==='Body and clothing details');for(const f of group.fields.filter(f=>f.id!=='body-weight'))entry(f.id,f.label,'text',null,false);form.append(make('p','quick-note',group.help));}
    if(index===2){entry('Title','Person’s name');entry('Relationship','Relationship to you');entry('Birthday','Birthday (optional)','date',null,false);entry('Notes','What would you like to remember? (optional)','text',null,false);}
    if(index===3){entry('Title','Event or milestone');entry('Date','Date','date');entry('Meaning','Why is this significant? (optional)','text',null,false);}
    if(index===4){entry('Title','Action to review');entry('Date','Start date','date');entry('Time','Time (optional)','time',null,false);entry('Repeat','Repeat','text',['None','Daily','Weekly','Monthly','Yearly'],false);entry('Instructions','What needs to happen? (optional)','text',null,false);}
    if(index===5){entry('Title','Favourite item');entry('Category','Category','text',['Book','Music','TV','Film','Game','Place','Experience','Value','Virtue','Emotion','Sensation']);}
    if(index===5)entry('What resonates','What do you love about it? (optional)','text',null,false);
    if(index===6){entry('Title','Skill you use or want to learn');entry('Practice','How could you practise? (optional)','text',null,false);entry('Evidence','What can you already do? (optional)','text',null,false);entry('Source','Learning source (optional)','text',null,false);}
    if(index===7){entry('Title','Goal');entry('Why it matters','Why it matters (optional)','text',null,false);entry('Next action','First action, if you have one (optional)','text',null,false);}
    if(index!==0&&!quickStage(stage)){const titles=['','Make it yours','Your people','A date to remember','A little reminder','Something you love','Keep growing','Your next goal'];const hero=stepArt(index,titles[index]);if(heading)hero.append(make('p','quick-guided-description',heading));form.prepend(hero);}
    const submit=make('button','quick-primary','Save & continue');submit.type='submit';form.append(submit);
    const save=()=>{const values={...defaults};for(const [column,n,required]of controls){if(required&&!n.value.trim())throw Error('Complete '+n.getAttribute('aria-label')+'.');if(n.type==='date'&&n.value&&!validBirthday(n.value))throw Error('Enter a valid date.');if(n.value||existing||index<2)values[column]=n.value.trim();}mutate(p=>{if(index===0)return saveQuickEntry(p,rec,values,rowId);if(index===1){let next=p;for(const section of AVATAR_SECTIONS)next=saveAvatar(next,section,values);return next;}const before=new Set(p.tables.flatMap(t=>t.rows.map(r=>r.id)));const next=saveSectionEntry(p,index,values,existing);const saved=existing||next.tables.filter(t=>t.recommendation===rec.id).flatMap(t=>t.rows.map(r=>({tableId:t.id,id:r.id}))).find(r=>!before.has(r.id));next.quickStart.entries={...next.quickStart.entries,[step.id]:saved};return next;});};
    registerDraft(form,save,()=>controls.some(([,n])=>n.value.trim()));
    form.onsubmit=e=>{e.preventDefault();safely(()=>{draft.save();navigate(1);});};body.append(form);
    const extras=make('div','quick-actions quick-step-extras');if(index>=2)extras.append(button('Save and add another',()=>safely(()=>{draft.save();mutate(p=>{delete p.quickStart.entries[step.id];return p;});render();message.textContent='Saved. Add the next item.';})));
    body.append(extras);
  }
  function renderTable(table){
    const name=input('Table name',table.name);name.onchange=()=>safely(()=>{mutate(p=>{p.tables.find(t=>t.id===table.id).name=name.value;return p;});message.textContent='Table name saved.';});body.append(field('Table name',name));
    if(pane==='tags'){const tags=make('fieldset','quick-tags');tags.append(make('legend','','Chakra associations · edit the suggestions'));
    SHELLS.forEach(([label],shell)=>{const box=make('input');box.type='checkbox';box.checked=table.chakraTags.includes(shell);const l=make('label');l.append(box,document.createTextNode(label));box.onchange=()=>safely(()=>mutate(p=>{const t=p.tables.find(t=>t.id===table.id);t.chakraTags=box.checked?[...new Set([...t.chakraTags,shell])]:t.chakraTags.filter(s=>s!==shell);return p;}));tags.append(l);});body.append(tags);const rec=catalogue.datasets.find(d=>d.id===table.recommendation);if(rec)body.append(make('p','quick-reasons',rec.chakraRelevance.map(r=>SHELLS[r.shell][0]+': '+r.reason).join(' ')));body.append(make('p','quick-note','These are philosophical associations. Choose the actual shell and side separately when allocating.'));return;}
    const controls=make('div','quick-actions');controls.append(button('Add row',()=>safely(()=>{mutate(p=>{const t=p.tables.find(t=>t.id===table.id);t.rows.push({id:crypto.randomUUID(),values:t.columns.map(()=> '')});return p;});rowPage=Math.floor((selectedTable().rows.length-1)/4);render();})),button('Export CSV',()=>download(table.name+'.csv','text/csv',csvText(selectedTable()))));
    const colName=input('New column name','');colName.placeholder='New column';colName.className='quick-new-column';controls.append(colName,button('Add column',()=>safely(()=>{mutate(p=>{const t=p.tables.find(t=>t.id===table.id);t.columns.push(colName.value);t.rows.forEach(r=>r.values.push(''));return p;});colPage=Math.floor((selectedTable().columns.length-1)/3);render();})));body.append(controls);
    rowPage=Math.min(rowPage,Math.max(0,Math.ceil(table.rows.length/4)-1));colPage=Math.min(colPage,Math.max(0,Math.ceil(table.columns.length/3)-1));
    const grid=make('table','quick-table'),thead=make('thead'),tr=make('tr');
    table.columns.slice(colPage*3,colPage*3+3).forEach(c=>tr.append(make('th','',c)));thead.append(tr);grid.append(thead);const tbody=make('tbody');
    for(const r of table.rows.slice(rowPage*4,rowPage*4+4)){const tr=make('tr');for(let i=colPage*3;i<Math.min(table.columns.length,colPage*3+3);i++){const td=make('td'),edit=input(`${table.columns[i]}, row ${table.rows.indexOf(r)+1}`,r.values[i]);edit.onchange=()=>safely(()=>{mutate(p=>{p.tables.find(t=>t.id===table.id).rows.find(row=>row.id===r.id).values[i]=edit.value;return p;});message.textContent='Saved in this browser.';});td.append(edit);tr.append(td);}tbody.append(tr);}grid.append(tbody);body.append(grid);
    const paging=make('div','quick-actions');paging.append(button('← Rows',()=>{rowPage=Math.max(0,rowPage-1);render();}),make('span','',`${table.rows.length} rows · page ${rowPage+1}/${Math.max(1,Math.ceil(table.rows.length/4))}`),button('Rows →',()=>{rowPage=Math.max(0,Math.min(Math.ceil(table.rows.length/4)-1,rowPage+1));render();}),button('← Columns',()=>{colPage=Math.max(0,colPage-1);render();}),make('span','',`${colPage*3+1}-${Math.min(table.columns.length,colPage*3+3)} / ${table.columns.length}`),button('Columns →',()=>{colPage=Math.min(Math.ceil(table.columns.length/3)-1,colPage+1);render();}));body.append(paging);
    const footer=make('div','quick-actions');footer.append(button('Allocate this table',()=>{turn(QUICK_ORDER.indexOf(9)-QUICK_ORDER.indexOf(index));welcome=false;render();}));body.append(footer);
  }
  function renderAllocation(){
    body.append(stepArt(9,'Place it in your Aura'));
    const list=select('Table to allocate',[['','Choose a table'],...project.tables.map(t=>[t.id,t.name])],tableId,()=>{tableId=list.value;render();});body.append(field('Table to allocate',list));
    const table=selectedTable();if(!table){body.append(make('p','','Create or import a table on an earlier card first.'));return;}
    const remaining=make('p','quick-reasons');const updateRemaining=()=>{const t=selectedTable();remaining.textContent=`${t.rows.length} rows; ${pendingRows(project,t).length} not yet allocated. Suggested associations: ${t.chakraTags.map(n=>SHELLS[n][0]).join(', ')||'Choose your own'}.`;};updateRemaining();body.append(remaining);
    const shell=select('Destination chakra',[['','Choose a chakra'],...SHELLS.map(([n],i)=>[String(i),n])],'',clear),face=select('Destination side',[['','Choose a side'],['I','Inside'],['O','Outside']],'',clear),mode=select('Allocation layout',[['facets','Consecutive facets'],['stack','Steps in one outward stack']],'facets',clear),start=input('Starting facet',1,'number');start.min=1;start.max=288;start.oninput=clear;
    const titleColumn=select('Row title column',table.columns.map((c,i)=>[String(i),c]),'0',clear),settings=make('div','quick-settings');settings.append(field('Chakra',shell),field('Side',face),field('Layout',mode),field('Starting facet',start),field('Title column',titleColumn));body.append(settings);
    const explanation=make('p','quick-note','Facets wrap after 288, keeping extra rows as separate records. Stack steps append after existing layers. Repeating allocation adds only new rows. It does not publish records or run an agent.');body.append(explanation);
    const previewText=make('p','quick-preview'),commit=button('Allocate new rows',()=>safely(()=>{
      read();const options=optionsNow(),plan=allocationPlan(project,tableId,options);if(!preview||preview!==JSON.stringify({options,plan}))throw Error('The table or destination changed. Preview the allocation again.');
      mutate(p=>allocateTable(p,tableId,options));updateRemaining();commit.disabled=true;preview=null;message.textContent=`Allocated ${plan.length} rows. Tables and records are saved together.`;
      const open=make('a','','Open this torus');open.href='?'+new URLSearchParams({page:TORUS,shell:String(options.shell),face:options.face});previewText.replaceChildren(open);
    }));commit.disabled=true;
    function clear(){preview=null;commit.disabled=true;previewText.textContent='';}
    function optionsNow(){if(shell.value===''||face.value==='')throw Error('Choose a chakra and a side.');return {shell:+shell.value,face:face.value,mode:mode.value,start:+start.value,titleColumn:+titleColumn.value};}
    const previewButton=button('Preview allocation',()=>safely(()=>{read();const options=optionsNow(),plan=allocationPlan(project,tableId,options);preview=JSON.stringify({options,plan});previewText.textContent=plan.length?`${plan.length} new rows: ${plan.slice(0,3).map(p=>targetLabel(p.target)).join('; ')}${plan.length>3?' … through '+targetLabel(plan.at(-1).target):''}`:'All rows are already allocated.';commit.disabled=!plan.length;}));
    const actions=make('div','quick-actions');actions.append(previewButton,commit);body.append(actions,previewText);
  }
  function download(name,type,text){const url=URL.createObjectURL(new Blob([text],{type})),a=make('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function backup(){openSection('aura-data-transfer');}
  function csvText(table){const esc=v=>'"'+String(v).replaceAll('"','""')+'"';return [table.columns,...table.rows.map(r=>r.values)].map(r=>r.map(esc).join(',')).join('\r\n');}
  const beforeLeave=()=>safely(rememberDraft);window.addEventListener('beforeunload',beforeLeave);
  dialog.addEventListener('cancel',e=>{try{checkPhotoReady();rememberDraft();}catch(error){e.preventDefault();message.textContent=error.message;}});
  dialog.addEventListener('close',()=>{safely(rememberDraft);draft=null;photoPanel?.dispose();photoPanel=null;renderGeneration++;auraPreview?.dispose();auraPreview=null;safely(read);redrawCard();card.focus();});
  redrawCard();if(new URLSearchParams(location.search).get('resume')==='1')open();return {resize(){auraPreview?.resize();},dispose(){beforeLeave();clearTimeout(draftTimer);window.removeEventListener('beforeunload',beforeLeave);photoPanel?.dispose();renderGeneration++;auraPreview?.dispose();flipAnimation?.cancel();dialog.remove();}};
}
