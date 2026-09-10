import {blankProject,validateProject,parseCSV,SHELLS} from './core.js?v=0.3.1';
import {allocationPlan,allocateTable,pendingRows} from './dataset-allocation.js?v=0.3.1';
import {targetLabel} from './spatial.js?v=0.3.1';
import {TORUS} from './original-routes.js?v=0.3.1';
export const QUICKSTART='D203ACAB-C2D1-4433-8EE2-3522C47CC3D0';
const KEY='aura-matrix-studio:v3:project';
export const turnPage=(index,delta,count)=>Math.max(0,Math.min(count-1,index+delta));
export const swipeDirection=(dx,dy)=>Math.abs(dx)>=35&&Math.abs(dx)>Math.abs(dy)?dx<0?1:-1:0;
export function mountQuickStart({page,screen,catalogue}){
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(text,fn)=>{const b=make('button','',text);b.type='button';b.onclick=fn;return b;};
  let project,index=0,tableId='',recId='',rowPage=0,colPage=0,preview=null,pane='setup';
  function read(){const raw=localStorage.getItem(KEY)??localStorage.getItem('aura-matrix-studio:v2:project')??localStorage.getItem('aura-matrix-studio:v1:project');project=raw?validateProject(JSON.parse(raw)):blankProject();}
  function mutate(fn){read();const next=fn(structuredClone(project));project=validateProject(next);localStorage.setItem(KEY,JSON.stringify(project));}
  function safely(fn){try{fn();}catch(e){message.textContent=e.message;}}
  read();index=project.quickStart.step;
  for(const c of page.controls){if(['CoverFlow','ProgressBar'].includes(c.controlTypeID)||c.controlTypeID==='Shape'&&/Step|Constructer/.test(c.properties.text||''))screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;}
  const book=make('section','quick-book');book.setAttribute('aria-label','QuickStart swipe reader');book.tabIndex=0;
  const card=button('',()=>{if(!swiped)open();});card.className='quick-card';const prev=button('Previous\nStep',()=>turn(-1)),next=button('Next\nStep',()=>turn(1));prev.className='quick-prev';next.className='quick-next';book.append(prev,card,next);screen.append(book);
  const progress=make('div','quick-progress');progress.setAttribute('role','status');screen.append(progress);
  const dialog=make('dialog','quick-dialog'),head=make('header'),title=make('h2'),close=button('Done',()=>dialog.close()),body=make('div','quick-body'),message=make('p','quick-message');message.setAttribute('role','status');head.append(title,close);dialog.append(head,body,message);document.body.append(dialog);
  const selectedTable=()=>project.tables.find(t=>t.id===tableId);
  function redrawCard(){const step=catalogue.steps[index];card.replaceChildren(make('small','',`${index+1} / ${catalogue.steps.length}`),make('strong','',step.title),make('span','','Tap to open'));prev.disabled=index===0;next.disabled=index===catalogue.steps.length-1;progress.textContent=`Step ${index+1} of 10 · ${project.tables.length} tables`;card.setAttribute('aria-label','Open '+step.title);}
  function turn(delta){safely(()=>{index=turnPage(index,delta,catalogue.steps.length);mutate(p=>{p.quickStart.step=index;return p;});book.dataset.direction=delta>0?'next':'previous';redrawCard();});}
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
  function open(){safely(()=>{read();tableId='';recId=catalogue.datasets.find(d=>d.category===catalogue.steps[index].id)?.id||'imports';rowPage=colPage=0;render();dialog.showModal();});}
  function render(){
    read();const step=catalogue.steps[index];title.textContent=step.title;body.replaceChildren();message.textContent='';preview=null;
    const top=make('div','quick-actions'),catalogueLink=make('a','','Read full catalogue');catalogueLink.href='DATASET-CATALOGUE.md';catalogueLink.target='_blank';catalogueLink.rel='noopener';
    top.append(button('← Previous',()=>{turn(-1);recId='';tableId='';render();}),button('Next →',()=>{turn(1);recId='';tableId='';render();}),button('Backup',backup),catalogueLink);body.append(top);
    if(step.id==='allocate'){renderAllocation();return;}
    const activeTable=selectedTable();if(activeTable){const tabs=make('div','quick-actions');for(const [key,label] of [['setup','Dataset'],['table','Rows'],['tags','Chakras']]){const b=button(label,()=>{pane=key;render();});b.setAttribute('aria-pressed',String(pane===key));tabs.append(b);}body.append(tabs);if(pane!=='setup'){renderTable(activeTable);return;}}
    const recs=catalogue.datasets.filter(d=>d.category===step.id);if(!recs.some(r=>r.id===recId))recId=recs[0].id;
    const rec=catalogue.datasets.find(d=>d.id===recId),choices=select('Recommended dataset',recs.map(r=>[r.id,r.name]),recId,()=>{recId=choices.value;tableId='';render();});
    body.append(field('Recommended dataset',choices));
    const reasons=make('p','quick-reasons',rec.chakraRelevance.map(r=>`${SHELLS[r.shell][0]}: ${r.reason}`).join(' '));body.append(reasons);
    const tables=project.tables.filter(t=>t.recommendation===recId),list=select('Your tables',[['','Choose a saved table'],...tables.map(t=>[t.id,t.name])],tableId,()=>{tableId=list.value;pane='table';rowPage=colPage=0;render();});
    const actions=make('div','quick-actions');actions.append(list,button('New table',()=>safely(()=>{const id=crypto.randomUUID();mutate(p=>{p.tables.push({id,name:rec.name,category:step.id,recommendation:rec.id,columns:[...rec.columns],rows:[],chakraTags:rec.chakraRelevance.map(r=>r.shell)});return p;});tableId=id;pane='table';rowPage=colPage=0;render();})),button('Import CSV',()=>file.click()));body.append(actions);
    const file=make('input');file.type='file';file.accept='.csv,text/csv';file.hidden=true;body.append(file);
    file.onchange=async()=>{try{const f=file.files[0];if(!f)return;const csv=parseCSV(await f.text()),id=crypto.randomUUID();mutate(p=>{p.tables.push({id,name:f.name.replace(/\.csv$/i,''),category:step.id,recommendation:rec.id,columns:csv.headers,rows:csv.rows.map(values=>({id:crypto.randomUUID(),values})),chakraTags:rec.chakraRelevance.map(r=>r.shell)});return p;});tableId=id;pane='table';rowPage=colPage=0;render();message.textContent=`Imported ${csv.rows.length} rows, retaining all columns.`;}catch(e){message.textContent=e.message;}};
    if(rec.note)body.append(make('p','quick-note',rec.note));
    const table=selectedTable();if(table){body.append(button('Edit table rows',()=>{pane='table';render();}));}else body.append(make('p','quick-empty','Start a blank table or import a CSV. You can skip any dataset and return later.'));
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
  redrawCard();return {resize(){},dispose(){dialog.remove();}};
}
