import {tripForm,goalForm} from './travel-ui.js?v=0.3.5';
import {pageIcon} from './page-icons.js?v=0.3.5';
import {blankProject,validateProject,parseCSV,SHELLS} from './core.js?v=0.3.5';
import {allocationPlan,allocateTable,pendingRows} from './dataset-allocation.js?v=0.3.5';
import {targetLabel} from './spatial.js?v=0.3.5';
import {TORUS} from './original-routes.js?v=0.3.5';
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
const AVATAR_QUESTIONS=[
 ['Are you right handed or left handed?',['Right handed','Left handed','Both']],
 ['Are you right footed or left footed?',['Right footed','Left footed','Both']],
 ['Do you wear corrective lenses for eyesight?',['Yes','No']],
 ['Do you have any facial tattoos or piercings?',['Yes','No']],
 ['Do you prefer tight, slim, or baggy clothes?',['Tight','Slim','Baggy']],
 ['Do you prefer an active or non-active life?',['Active','Non-active']],
 ['Do you alter your hair style or colour often?',['Yes','No']],
 ['Do you wear hats or hair coverings often?',['Yes','No']]
];
export function mountQuickStart({page,screen,catalogue}){
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(text,fn)=>{const b=make('button','',text);b.type='button';b.onclick=fn;return b;};
  let project,index=0,tableId='',recId='',rowPage=0,colPage=0,preview=null,pane='setup',flipping=false,flipAnimation=null,welcome=true,avatarIndex=0;
  function read(){const raw=localStorage.getItem(KEY)??localStorage.getItem('aura-matrix-studio:v3:project')??localStorage.getItem('aura-matrix-studio:v2:project')??localStorage.getItem('aura-matrix-studio:v1:project');project=raw?validateProject(JSON.parse(raw)):blankProject();}
  function mutate(fn){read();const next=fn(structuredClone(project));project=validateProject(next);localStorage.setItem(KEY,JSON.stringify(project));}
  function safely(fn){try{fn();}catch(e){message.textContent=e.message;}}
  read();index=project.quickStart.step;const requestedStep=new URLSearchParams(location.search).get('step'),requestedIndex=catalogue.steps.findIndex(s=>s.id===requestedStep);if(requestedIndex>=0)index=requestedIndex;
  for(const c of page.controls){if(['CoverFlow','ProgressBar'].includes(c.controlTypeID)||c.controlTypeID==='Shape'&&/Step|Constructer/.test(c.properties.text||''))screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;}
  const book=make('section','quick-book');book.setAttribute('aria-label','QuickStart swipe reader');book.tabIndex=0;
  const card=button('',()=>{if(!swiped)open();});card.className='quick-card';const prev=button('Previous\nStep',()=>turn(-1)),next=button('Next\nStep',()=>turn(1));prev.className='quick-prev';next.className='quick-next';book.append(prev,card,next);screen.append(book);
  const progress=make('div','quick-progress');progress.setAttribute('role','status');screen.append(progress);
  const dialog=make('dialog','quick-dialog'),head=make('header'),title=make('h2'),close=button('Done',()=>dialog.close()),body=make('div','quick-body'),message=make('p','quick-message');message.setAttribute('role','status');head.append(title,close);dialog.append(head,body,message);document.body.append(dialog);
  const selectedTable=()=>project.tables.find(t=>t.id===tableId);
  const stepPages=['DC827E51-FDDD-49EC-BB9D-7FFAE33159BC','3A178076-5EF1-41A0-8229-62636BE4F256','AE87688C-93C9-4AB1-A72D-A447ED56C5E0','951AAB58-F4AE-41E2-A790-4F204A0EC475','2E5320C1-E2FE-4EE5-B62E-3CB9013D4010','82791921-1F9A-4056-A0FE-B4385FD5377A','02B0EE12-8186-4347-BFC7-06657FAC52D8','E933DDB8-9FDE-445A-97A0-686C17B77380','DAFCEEE9-7303-415D-975B-AB7176A59010','1FE14FC9-F981-4E27-B038-BDF3FF404838'];
  function redrawCard(){const step=catalogue.steps[index],icon=make('img');icon.src='assets/mockplus/'+pageIcon(stepPages[index]);icon.alt='';card.replaceChildren(make('small','',`${index+1} / ${catalogue.steps.length}`),icon,make('strong','',step.title),make('span','','Tap to open'));prev.disabled=index===0;next.disabled=index===catalogue.steps.length-1;progress.textContent=`Step ${index+1} of 10`;card.setAttribute('aria-label','Open '+step.title);}
  function turn(delta){
    if(flipping)return false;let moved=false;
    safely(()=>{const nextIndex=turnPage(index,delta,catalogue.steps.length);if(nextIndex===index)return;
      const old=card.cloneNode(true);old.removeAttribute('aria-label');old.setAttribute('aria-hidden','true');old.tabIndex=-1;old.classList.add('quick-turning-page');
      mutate(p=>{p.quickStart.step=nextIndex;return p;});index=nextIndex;const url=new URL(location.href);url.searchParams.set('step',catalogue.steps[index].id);history.replaceState(history.state,'',url);redrawCard();moved=true;
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      flipping=true;book.dataset.flipping='true';book.append(old);
      const sheet=delta>0?old:card;old.style.zIndex=delta>0?'5':'1';card.style.zIndex='2';
      const frames=delta>0?[{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:'rotateY(-95deg)',filter:'brightness(.65)',offset:.55},{transform:'rotateY(-180deg)',filter:'brightness(.9)'}]:[{transform:'rotateY(-180deg)',filter:'brightness(.8)'},{transform:'rotateY(-85deg)',filter:'brightness(.65)',offset:.45},{transform:'rotateY(0deg)',filter:'brightness(1)'}];
      flipAnimation=sheet.animate(frames,{duration:650,easing:'ease-in-out'});
      flipAnimation.finished.catch(()=>{}).finally(()=>{old.remove();flipping=false;delete book.dataset.flipping;});
    });return moved;
  }
  function navigate(delta){if(!turn(delta))return;recId='';tableId='';pane='setup';welcome=true;render();animateBody(delta);}
  function animateBody(delta){if(!matchMedia('(prefers-reduced-motion: reduce)').matches)body.animate([{transform:`perspective(900px) rotateY(${delta>0?30:-30}deg)`,opacity:.25},{transform:'perspective(900px) rotateY(0deg)',opacity:1}],{duration:450,easing:'ease-out'});}
  let start=null,swiped=false;
  book.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId};swiped=false;});
  book.addEventListener('pointermove',e=>{if(start&&Math.abs(e.clientX-start.x)>10)book.setPointerCapture(e.pointerId);});
  book.addEventListener('pointerup',e=>{if(!start)return;const scale=screen.getBoundingClientRect().width/360,direction=swipeDirection((e.clientX-start.x)/scale,(e.clientY-start.y)/scale);if(direction){swiped=true;turn(direction);}start=null;});
  book.addEventListener('pointercancel',()=>start=null);
  book.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopImmediatePropagation();swiped=false;}},true);
  book.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}});
  function field(label,input){const n=make('label','quick-field');n.append(make('span','',label),input);return n;}
  function select(label,items,value,onchange){const n=make('select');n.setAttribute('aria-label',label);for(const [v,t]of items){const o=make('option','',t);o.value=v;n.append(o);}n.value=value;n.onchange=onchange;return n;}
  function input(label,value,type='text'){const n=make('input');n.type=type;n.value=value;n.setAttribute('aria-label',label);return n;}
  function open(){safely(()=>{read();tableId='';recId=catalogue.steps[index].datasets[0]||'imports';rowPage=colPage=0;welcome=true;render();dialog.showModal();});}
  function render(){
    read();const step=catalogue.steps[index];title.textContent=step.title;body.replaceChildren();message.textContent='';preview=null;
    if(index===8&&welcome){renderTravel();return;}
    if(index<8&&welcome){renderGuided();return;}
    const top=make('div','quick-actions'),catalogueLink=make('a','','Read full catalogue');catalogueLink.href='DATASET-CATALOGUE.md';catalogueLink.target='_blank';catalogueLink.rel='noopener';
    top.append(button('← Previous',()=>navigate(-1)),button('Next →',()=>navigate(1)),button('Backup',backup),catalogueLink);body.append(top);
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
    const choices=make('div','quick-actions'),form=make('div');
    function choose(mode){form.replaceChildren();if(mode==='goal')goalForm(form);else tripForm(form,{initialStatus:mode,brief:true});}
    choices.append(button('Already visited',()=>choose('Visited')),button('Want to visit',()=>choose('Want to go')),button('Travel goal',()=>choose('goal')));body.append(choices,form);choose('Visited');
    const actions=make('div','quick-actions');actions.append(button('← Previous',()=>navigate(-1)),button('Continue →',()=>navigate(1)),button('Tables and other data',()=>{welcome=false;render();}));body.append(actions);
  }
  function renderGuided(){
    const step=catalogue.steps[index],rec=catalogue.datasets.find(d=>d.id===step.datasets[0]);
    const bar=make('div','quick-actions');const back=button('← Previous',()=>navigate(-1));back.disabled=index===0;bar.append(back,make('span','',`${index+1} / 10`),button('Skip →',()=>navigate(1)));body.append(bar);
    const form=make('form','quick-welcome'),controls=[];let familyBirthday=null,rowId,defaults={},heading='';
    function entry(column,label,type='text',options){
      const saved=project.tables.find(t=>t.id==='quickstart-'+rec.id),row=rowId&&saved?.rows.find(r=>r.id===rowId),value=row?.values[saved.columns.indexOf(column)]||'';
      const n=options?select(label,[['','Choose'],...options.map(v=>[v,v])],value,()=>{}):input(label,value,type);n.required=true;controls.push([column,n]);form.append(field(label,n));return n;
    }
    if(index===0){rowId='my-birthday';defaults={Title:'My birthday'};heading='Start with your date of birth.';entry('Date','Date of birth','date');}
    if(index===1){const [question,options]=AVATAR_QUESTIONS[avatarIndex];rowId='avatar-answer-'+avatarIndex;defaults={Title:question};heading=`Avatar questionnaire · ${avatarIndex+1} of 8`;entry('Measurement',question,'text',options);}
    if(index===2){rowId=crypto.randomUUID();entry('Title','Family member’s name');entry('Relationship','Relationship to you');familyBirthday=input('Birthday (optional)','','date');form.append(field('Birthday (optional)',familyBirthday));}
    if(index===3){entry('Title','Event or milestone');entry('Date','Date','date');}
    if(index===4){entry('Title','Reminder or scheduled action');entry('Date','Date','date');entry('Time','Time','time');}
    if(index===5){entry('Title','Favourite item');entry('Category','Category','text',['Book','Music','TV','Film','Game','Place','Experience','Value','Virtue','Emotion','Sensation']);}
    if(index===6){entry('Title','Skill');entry('Practice','Current level or practice');}
    if(index===7){entry('Title','Goal');entry('Next action','Next action');}
    if(heading)form.prepend(make('p','quick-guided-description',heading));
    const submit=make('button','quick-primary',index===0?'Save birthday and continue':index===1?'Save answer and continue':'Save and continue');submit.type='submit';form.append(submit);
    const save=()=>{const values={...defaults};for(const [column,n]of controls){if(!n.value.trim())throw Error('Complete '+n.getAttribute('aria-label')+'.');if(n.type==='date'&&!validBirthday(n.value))throw Error('Enter a valid date.');values[column]=n.value.trim();}mutate(p=>{let next=saveQuickEntry(p,rec,values,rowId);if(familyBirthday?.value){if(!validBirthday(familyBirthday.value))throw Error('Enter a valid birthday.');const birthdays=catalogue.datasets.find(d=>d.id==='life-events');next=saveQuickEntry(next,birthdays,{Title:'Birthday: '+values.Title,'Person or subject':values.Title,Date:familyBirthday.value},rowId+'-birthday');}return next;});};
    form.onsubmit=e=>{e.preventDefault();safely(()=>{save();if(index===1&&avatarIndex<7){avatarIndex++;render();animateBody(1);}else navigate(1);});};body.append(form);
    const extras=make('div','quick-actions');if(index>=2)extras.append(button('Save and add another',()=>safely(()=>{save();render();message.textContent='Saved. Add the next item.';})));if(index===1&&avatarIndex>0)extras.append(button('← Previous question',()=>{avatarIndex--;render();animateBody(-1);}));
    extras.append(button(index===4?'Counters and other timing data':'Tables',()=>{welcome=false;render();}));body.append(extras);
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
    const footer=make('div','quick-actions');footer.append(button('Allocate this table',()=>{turn(9-index);render();}));body.append(footer);
  }
  function renderAllocation(){
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
  function backup(){safely(()=>{read();download('aura-project-backup.json','application/json',JSON.stringify(project,null,2));});}
  function csvText(table){const esc=v=>'"'+String(v).replaceAll('"','""')+'"';return [table.columns,...table.rows.map(r=>r.values)].map(r=>r.map(esc).join(',')).join('\r\n');}
  dialog.addEventListener('close',()=>{safely(read);redrawCard();card.focus();});
  redrawCard();return {resize(){},dispose(){flipAnimation?.cancel();dialog.remove();}};
}
