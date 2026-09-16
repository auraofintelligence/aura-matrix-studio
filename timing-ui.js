import {TIMING_IDEAS,ideaDraft,originalTimingNotes} from './timing-ideas.js?v=0.4.10';
import {TIMING_PAGES,timingEntries,timingRows,timingDate,repeatOf,saveTiming,nextOccurrences,conditionResult,timingRule} from './timing-data.js?v=0.4.10';
import {readTravelProject,writeTravelProject,TIMELINES} from './travel-data.js?v=0.4.10';
import {QUICKSTART} from './quickstart.js?v=0.4.10';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
const names={birthdays:'Birthdays',milestones:'Milestones & goals',counters:'Counters',schedules:'Schedules',reminders:'Reminders',ceremonies:'Ceremonies',learning:'Learning & skills',work:'Work',weather:'Weather signals',community:'Community'};
const colours={birthdays:['#ac4d75','#f8e4ee'],milestones:['#90661f','#f9edce'],counters:['#287e83','#def2f2'],schedules:['#456daa','#e5edf9'],reminders:['#b35e35','#fae7da'],ceremonies:['#8856a5','#f0e4f6'],learning:['#476f54','#e7f2df'],work:['#556d9b','#e9edf6'],weather:['#2c839f','#ddf2f7'],community:['#a26044','#f7eadc']};
const timingPaths={
 birthdays:'M4 12h24v16H4ZM8 12V7M16 12V7M24 12V7M8 4V2M16 4V2M24 4V2M4 20q4 5 8 0q4 5 8 0q4 5 8 0',
 milestones:'M5 29V3M5 4h22l-5 6 5 6H5M11 28l4-5 4 2 8-8',
 counters:'M16 3a13 13 0 1 0 13 13M16 3v13l9-8M8 24l4-4',
 schedules:'M5 6h22v23H5ZM5 13h22M10 3v6M22 3v6M10 18h3M19 18h3M10 24h3M19 24h3',
 reminders:'M5 24h22l-3-5v-7a8 8 0 0 0-16 0v7ZM12 28q4 5 8 0M16 2v2',
 ceremonies:'M4 28l6-18 12 12ZM17 3l1 6M26 5l-4 6M29 15l-6 1M7 3l3 3',
 learning:'M16 7Q9 2 3 5v22q7-3 13 2q6-5 13-2V5q-7-3-13 2v22M7 12l5 1M20 13l5-1',
 work:'M3 10h26v18H3ZM11 10V4h10v6M3 17q13 8 26 0M16 17v6',
 weather:'M11 18a7 7 0 1 1 13-2q7 0 6 8H9q-6-3-2-7M9 5V2M3 9L1 7M20 6l2-3M14 28l-1 3M23 28l-1 3',
 community:'M16 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10M7 29v-5a9 9 0 0 1 18 0v5M5 6a4 4 0 0 0 0 8M3 19l-1 9M27 6a4 4 0 0 1 0 8M29 19l1 9',
 star:'M16 2l4 9 10 1-8 7 3 11-9-6-9 6 3-11-8-7 10-1Z',
 gift:'M3 12h26v7H3ZM6 19v11h20V19M16 12v18M16 12S4 12 6 5s10 7 10 7S28 12 26 5s-10 7-10 7',
 place:'M16 30S5 17 5 12a11 11 0 0 1 22 0c0 5-11 18-11 18ZM16 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
 clock:'M16 3a13 13 0 1 0 0 26 13 13 0 0 0 0-26M16 8v9l7 4',
 action:'M5 4v8h8M5 12l9-9M19 17h9v12h-9ZM5 20h8M9 16v8'
};
function timingArt(kind){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');path.setAttribute('d',timingPaths[kind]||timingPaths.clock);svg.append(path);return svg;}
function optionArt(title,group){return /gift|giving/i.test(title)?'gift':/star|sun|moon|astro|orbit/i.test(title)?'star':/travel|place|distance|journey/i.test(title)?'place':/weather|season/i.test(title)?'weather':/family|people|relationship|community/i.test(title)?'community':/learn|skill|practice/i.test(title)?'learning':/time|day|hour|routine|repeat/i.test(title)?'clock':group;}
const extraFields={birthdays:['Person or subject','Place','Meaning'],milestones:['Next action','Why it matters'],counters:['Value','Unit','Target'],schedules:[],reminders:[],ceremonies:['People','Date or season','Meaning'],learning:['Topic','Practice','Source'],work:['Role','Next action','Outcome'],weather:['Location','Observation','Value','Unit'],community:['People','Commitment','Place']};
export function mountTimingBadges({page,screen}){
 for(const c of page.controls){const target=c.links?.find(l=>TIMING_PAGES[l.target]);if(!target)continue;const count=timingEntries(readTravelProject(),TIMING_PAGES[target.target]).length;
  const n=make('span','timing-badge',String(count));n.title=`${count} saved entries`;Object.assign(n.style,{left:(+c.x + +c.w-24)+'px',top:(+c.y+3)+'px'});screen.append(n);
 }return {resize(){},dispose(){}};
}
export function mountTiming({page,screen,go}){
 const group=TIMING_PAGES[page.id];let offset=0,query='',editing=false;const panel=make('section','timing-panel');panel.setAttribute('aria-label',names[group]);
 panel.style.setProperty('--timing-accent',colours[group][0]);panel.style.setProperty('--timing-tint',colours[group][1]);
 // Retain the original status bar and bottom navigation. Replace placeholder content
 // with a fixed-size working page in the same designed frame.
 for(const c of page.controls)screen.querySelector(`[data-source-control="${c.controlID}"]`)?.setAttribute('hidden','');
 screen.append(panel);
 function list(){editing=false;panel.classList.add('timing-overview');
  const entries=timingEntries(readTravelProject(),group),ideas=TIMING_IDEAS[group];
  // A saved idea takes its place in the same menu; custom entries join the menu.
  const used=new Set(),items=ideas.flatMap((item,index)=>{const matches=entries.filter(r=>(r.Title||'').toLowerCase()===item.title.toLowerCase());if(matches.length){matches.forEach(r=>used.add(r));return matches.map(entry=>({title:entry.Title,entry}));}return [{title:item.title,item,index}];});
  items.unshift(...entries.filter(r=>!used.has(r)).map(entry=>({title:entry.Title||'Untitled entry',entry})));
  const visible=items.filter(x=>(x.title+' '+(x.item?.description||'')).toLowerCase().includes(query.toLowerCase())),size=8;
  offset=Math.max(0,Math.min(offset,Math.max(0,Math.floor((visible.length-1)/size)*size)));
  panel.replaceChildren();const head=make('header');head.append(make('h2','',names[group]),button('+ Add',()=>edit()));panel.append(head);
  const search=make('input');search.type='search';search.placeholder='Find an option or saved entry';search.setAttribute('aria-label','Find an option or saved entry');search.value=query;search.oninput=()=>{const pos=search.selectionStart;query=search.value;offset=0;list();const next=panel.querySelector('input');next.focus();try{next.setSelectionRange(pos,pos);}catch{}};panel.append(search);
  const summary=make('div','timing-visual-summary'),copy=make('div');summary.append(timingArt(group));copy.append(make('strong','',`${entries.length} saved · ${ideas.length} starting points`),make('small','','Explore an idea or continue a saved entry.'));summary.append(copy);panel.append(summary);
  const grid=make('div','timing-option-grid');for(const x of visible.slice(offset,offset+size)){const b=button('',()=>x.entry?edit(x.entry):edit(null,ideaDraft(group,x.index),x.item.description)),top=make('span','timing-card-top');top.append(timingArt(optionArt(x.title,group)),make('strong','',x.title));b.append(top);
   let detail=x.item?.description;if(x.entry){const r=x.entry,next=nextOccurrences(r,new Date(),1)[0];detail='Saved · '+(group==='counters'?`${r.Value||'0'} ${r.Unit||''}`:next?next.date:r.Practice||r['Next action']||r.Commitment||'Edit details and signals');b.classList.add('timing-saved-option');if(r.Target&&+r.Target>0&&r.Value!==''&&Number.isFinite(+r.Value)){const progress=make('progress');progress.max=+r.Target;progress.value=Math.max(0,+r.Value);progress.setAttribute('aria-label',`${r.Value} of ${r.Target} ${r.Unit||''}`);b.append(progress);}}b.append(make('small','',detail));b.title=detail;grid.append(b);}
  if(!visible.length)grid.append(make('p','','No matching options. Try another word or add your own.'));panel.append(grid);
  const pager=make('nav','timing-pager'),prev=button('‹',()=>{offset-=size;list();}),next=button('›',()=>{offset+=size;list();});prev.setAttribute('aria-label','Previous options');next.setAttribute('aria-label','More options');prev.disabled=offset===0;next.disabled=offset+size>=visible.length;pager.append(prev,make('span','',visible.length?`${offset+1}-${Math.min(offset+size,visible.length)} of ${visible.length}`:'0 matches'),next);panel.append(pager);
  const foot=make('footer');foot.append(button('Original ideas',readOriginal),button('QuickStart',()=>go(QUICKSTART)),button('Timing menu',()=>go(TIMELINES)));panel.append(foot);
 }
 function readOriginal(){editing=true;panel.classList.remove('timing-overview');const text=originalTimingNotes(page),chunks=text.match(/[\s\S]{1,300}(?:\s|$)|[\s\S]{1,300}/g)||['No original notes on this page.'];let n=0;function draw(){panel.replaceChildren();const head=make('header');head.append(make('h2','','Original ideas'),button('Back',list));panel.append(head,make('p','timing-note','Original design notes, including any historical examples.'),make('p','timing-original-notes',chunks[n]));const foot=make('footer'),prev=button('Previous',()=>{n--;draw();}),next=button('Next',()=>{n++;draw();});prev.disabled=n===0;next.disabled=n===chunks.length-1;foot.append(prev,make('span','',`${n+1} / ${chunks.length}`),next);panel.append(foot);}draw();}
 function edit(entry=null,seed=null,description=''){editing=true;panel.classList.remove('timing-overview');const p=readTravelProject();let values={...entry,Title:entry?.Title||'',Date:entry?timingDate(entry):'',Time:entry?.Time||'09:00',Repeat:entry?repeatOf(entry):group==='birthdays'?'Yearly':'None',Interval:entry?.Interval||'1','Reminder minutes':entry?.['Reminder minutes']||'0',Enabled:entry?.Enabled||'Yes','End date':entry?.['End date']||'',Status:entry?.Status||'Active',...seed},pane='details';
  const controls={},message=make('p','timing-note');message.setAttribute('role','status');panel.replaceChildren();const head=make('header');head.append(make('h2','',entry?'Edit '+names[group].toLowerCase():'Add '+names[group].toLowerCase()),button('Cancel',list));panel.append(head);
  const tabs=make('nav','timing-tabs'),content=make('div','timing-editor'),actions=make('footer');panel.append(tabs,content,actions,message);
  function field(parent,key,label=key,type='text',options=null){const wrap=make('label','',label),n=make(options?'select':type==='textarea'?'textarea':'input');n.setAttribute('aria-label',label);if(options){for(const [value,text]of options.map(x=>Array.isArray(x)?x:[x,x])){const o=make('option','',text);o.value=value;n.append(o);}}else if(type!=='textarea')n.type=type;n.value=values[key]??'';if(type==='number')n.step='any';n.oninput=()=>values[key]=n.value;n.onchange=()=>values[key]=n.value;controls[key]=n;wrap.append(n);parent.append(wrap);return n;}
  const datasets=timingRows(p),numeric=[];for(const r of datasets)for(const [column,v]of Object.entries(r))if(!['id','tableId','recommendation','tableName'].includes(column)&&typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v)))numeric.push({tableId:r.tableId,rowId:r.id,column,title:`${r.Title||r.tableName} · ${column}`});
  function draw(){content.replaceChildren();tabs.replaceChildren();message.textContent='';for(const [id,label]of [['details','Details'],['when','When'],['if','If'],['action','Action'],['preview','Preview']]){const b=button('',()=>{pane=id;draw();});b.append(timingArt(({details:group,when:'schedules',if:'counters',action:'action',preview:'clock'})[id]),make('span','',label));b.setAttribute('aria-pressed',String(pane===id));tabs.append(b);}
   if(pane==='details'){if(description)content.append(make('p','timing-note',description));field(content,'Title',group==='birthdays'?'Name or birthday title':'Name');for(const key of extraFields[group])field(content,key,key,['Value','Target'].includes(key)?'number':'text');field(content,'Status','Status','text',['Active','Done','Paused']);}
   if(pane==='when'){
    const two=make('div','timing-two');content.append(two);field(two,'Date',group==='birthdays'?'Date of birth':'Start date','date');field(two,'Time','Time','time');
    const repeat=make('div','timing-two');content.append(repeat);field(repeat,'Repeat','Repeat','text',['None','Daily','Weekly','Monthly','Yearly']);const n=field(repeat,'Interval','Every (cycles)','number');n.min=1;n.step=1;
    field(content,'End date','Stop after (optional)','date');const lead=field(content,'Reminder minutes','Remind how many minutes before?','number');lead.min=0;
    content.append(make('p','timing-note','Times use this device’s local time. Short months use their final day; 29 February uses 28 February in other years.'));
   }
   if(pane==='if'){
    content.append(make('p','timing-note','Only prepare the action when this saved measurement meets your threshold. Update measurements in their table or Counters.'));
    let c;try{c=JSON.parse(values['Signal condition']||'null');}catch{c=null;}
    const select=make('select');select.setAttribute('aria-label','Condition record');const none=make('option','','No condition');none.value='';select.append(none);numeric.forEach((r,i)=>{const o=make('option','',r.title);o.value=String(i);select.append(o);});const index=numeric.findIndex(r=>c&&r.tableId===c.tableId&&r.rowId===c.rowId&&r.column===c.column);select.value=index<0?'':String(index);content.append(make('label','','Saved measurement'),select);
    const op=make('select');op.setAttribute('aria-label','Comparison');for(const value of ['>=','>','=','<=','<']){const o=make('option','',value);o.value=value;op.append(o);}op.value=c?.operator||'>=';const threshold=make('input');threshold.type='number';threshold.step='any';threshold.value=c?.value??0;threshold.setAttribute('aria-label','Threshold');content.append(make('label','','Comparison'),op,make('label','','Threshold'),threshold);
    const update=()=>{values['Signal condition']=select.value===''?'':JSON.stringify({...numeric[Number(select.value)],operator:op.value,value:threshold.value===''?null:Number(threshold.value)});};select.onchange=update;op.onchange=update;threshold.oninput=update;
    if(c&&index<0)content.append(make('p','timing-note','Saved condition record is missing. Choose a replacement or No condition.'));
   }
   if(pane==='action'){
    field(content,'Instructions','What should happen?','textarea');field(content,'Program ID','Linked matrix sequence','text',[['','No sequence'],...p.programs.map(x=>[x.id,x.name])]);field(content,'Required data','Data for this action (JSON)','textarea');field(content,'Enabled','Signal enabled','text',['Yes','No']);content.append(make('p','timing-note','Save and export for an agent to read. Background notifications and automatic execution are not connected.'));
   }
   if(pane==='preview'){
    try{const draft=saveTiming(p,group,fields(),entry),r=entry?timingEntries(draft,group).find(x=>x.tableId===entry.tableId&&x.id===entry.id):timingEntries(draft,group).filter(x=>x.tableId==='timing-'+group).at(-1);if(!r)throw Error('Save the entry to preview it.');
     const condition=conditionResult(draft,r),upcoming=nextOccurrences(r);content.append(make('h3','','Next reminders'),make('p','timing-note',r.Enabled==='No'||r.Status==='Done'||r.Status==='Paused'?'This signal is paused or complete.':upcoming.length?'Calculated in device local time.':'Add a future date or repeat pattern.'));
     for(const next of upcoming)content.append(make('p','timing-occurrence',new Date(next.remindAt).toLocaleString()+' · event '+next.date));content.append(make('p','',condition.message),make('p','timing-note','This preview checks saved data. It does not send a notification or run the action.'));
     content.append(button('Save & export agent rule',()=>{try{const saved=writeTravelProject(current=>saveTiming(current,group,fields(),entry));const rows=timingEntries(saved,group);entry=entry?rows.find(x=>x.tableId===entry.tableId&&x.id===entry.id):rows.filter(x=>x.tableId==='timing-'+group).at(-1);const blob=new Blob([JSON.stringify(timingRule(saved,entry),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download='aura-timing-rule.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='Saved and exported with its table reference.';}catch(e){message.textContent=e.message;}}));
    }catch(e){content.append(make('p','',e.message));}
   }
  }
  function fields(){const data={};for(const key of ['Title',...extraFields[group],'Status','Date','Time','Repeat','Interval','Reminder minutes','End date','Enabled','Instructions','Program ID','Required data','Signal condition'])if(values[key]!==undefined)data[key]=values[key];if(data['Required data'])JSON.parse(data['Required data']);return data;}
  actions.append(button('Save',()=>{try{writeTravelProject(p=>saveTiming(p,group,fields(),entry));list();}catch(e){message.textContent=e.message;}}),button('Preview rule',()=>{pane='preview';draw();}));draw();
 }
 const refresh=e=>{if(!editing&&(!e||e.key?.startsWith('aura-matrix-studio:')))list();};window.addEventListener('storage',refresh);list();return {resize(){},dispose(){window.removeEventListener('storage',refresh);}};
}
