import {TIMING_PAGES,timingEntries,timingRows,timingDate,repeatOf,saveTiming,nextOccurrences,conditionResult,timingRule} from './timing-data.js?v=0.3.7';
import {readTravelProject,writeTravelProject,TIMELINES} from './travel-data.js?v=0.3.7';
import {QUICKSTART} from './quickstart.js?v=0.3.7';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
const names={birthdays:'Birthdays',milestones:'Milestones & goals',counters:'Counters',schedules:'Schedules',reminders:'Reminders',ceremonies:'Ceremonies',learning:'Learning & skills',work:'Work',weather:'Weather signals',community:'Community'};
const extraFields={birthdays:['Person or subject','Place','Meaning'],milestones:['Next action','Why it matters'],counters:['Value','Unit','Target'],schedules:[],reminders:[],ceremonies:['People','Date or season','Meaning'],learning:['Topic','Practice','Source'],work:['Role','Next action','Outcome'],weather:['Location','Observation','Value','Unit'],community:['People','Commitment','Place']};
export function mountTimingBadges({page,screen}){
 for(const c of page.controls){const target=c.links?.find(l=>TIMING_PAGES[l.target]);if(!target)continue;const count=timingEntries(readTravelProject(),TIMING_PAGES[target.target]).length;
  const n=make('span','timing-badge',String(count));n.title=`${count} saved entries`;Object.assign(n.style,{left:(+c.x + +c.w-24)+'px',top:(+c.y+3)+'px'});screen.append(n);
 }return {resize(){},dispose(){}};
}
export function mountTiming({page,screen,go}){
 const group=TIMING_PAGES[page.id];let offset=0,query='',editing=false;const panel=make('section','timing-panel');panel.setAttribute('aria-label',names[group]);
 // Retain the original status bar and bottom navigation. Replace placeholder content
 // with a fixed-size working page in the same designed frame.
 for(const c of page.controls)if(c.controlTypeID!=='StatusBar(Android)'&&!(c.controlTypeID==='Icon'&&+c.y>=580))screen.querySelector(`[data-source-control="${c.controlID}"]`)?.setAttribute('hidden','');
 screen.append(panel);
 function list(){editing=false;const p=readTravelProject(),entries=timingEntries(p,group).filter(r=>(r.Title||'').toLowerCase().includes(query.toLowerCase()));offset=Math.max(0,Math.min(offset,Math.max(0,Math.floor((entries.length-1)/5)*5)));
  panel.replaceChildren();const head=make('header');head.append(make('h2','',names[group]),button('+ Add',()=>edit()));panel.append(head);
  const search=make('input');search.type='search';search.placeholder='Find a saved entry';search.setAttribute('aria-label','Find a saved entry');search.value=query;search.oninput=()=>{const pos=search.selectionStart;query=search.value;offset=0;list();const next=panel.querySelector('input');next.focus();try{next.setSelectionRange(pos,pos);}catch{}};panel.append(search);
  panel.append(make('p','timing-note','Your QuickStart answers and tables, shared here.'));
  const rows=make('div','timing-list');for(const r of entries.slice(offset,offset+5)){const next=nextOccurrences(r,new Date(),1)[0],b=button('',()=>edit(r));b.append(make('strong','',r.Title||'Untitled entry'));
   const detail=group==='counters'?`${r.Value||'0'} ${r.Unit||''}${r.Target?' / target '+r.Target:''}`:next?`Next: ${next.date} · ${repeatOf(r)}`:timingDate(r)?`${timingDate(r)} · ${r.Status||'Saved'}`:r.Practice||r['Next action']||r.Commitment||'Add dates or program a signal';b.append(make('small','',detail));rows.append(b);}
  if(!entries.length)rows.append(make('p','','No entries here yet. Add one above, or use QuickStart.'));panel.append(rows);
  const pager=make('nav','timing-pager'),prev=button('‹',()=>{offset-=5;list();}),next=button('›',()=>{offset+=5;list();});prev.setAttribute('aria-label','Previous entries');next.setAttribute('aria-label','More entries');prev.disabled=offset===0;next.disabled=offset+5>=entries.length;pager.append(prev,make('span','',entries.length?`${offset+1}-${Math.min(offset+5,entries.length)} of ${entries.length}`:'0 entries'),next);panel.append(pager);
  const foot=make('footer');foot.append(button('QuickStart',()=>go(QUICKSTART)),button('Timing menu',()=>go(TIMELINES)));panel.append(foot);
 }
 function edit(entry=null){editing=true;const p=readTravelProject();let values={...entry,Title:entry?.Title||'',Date:entry?timingDate(entry):'',Time:entry?.Time||'09:00',Repeat:entry?repeatOf(entry):group==='birthdays'?'Yearly':'None',Interval:entry?.Interval||'1','Reminder minutes':entry?.['Reminder minutes']||'0',Enabled:entry?.Enabled||'Yes','End date':entry?.['End date']||'',Status:entry?.Status||'Active'},pane='details';
  const controls={},message=make('p','timing-note');message.setAttribute('role','status');panel.replaceChildren();const head=make('header');head.append(make('h2','',entry?'Edit '+names[group].toLowerCase():'Add '+names[group].toLowerCase()),button('Cancel',list));panel.append(head);
  const tabs=make('nav','timing-tabs'),content=make('div','timing-editor'),actions=make('footer');panel.append(tabs,content,actions,message);
  function field(parent,key,label=key,type='text',options=null){const wrap=make('label','',label),n=make(options?'select':type==='textarea'?'textarea':'input');n.setAttribute('aria-label',label);if(options){for(const [value,text]of options.map(x=>Array.isArray(x)?x:[x,x])){const o=make('option','',text);o.value=value;n.append(o);}}else if(type!=='textarea')n.type=type;n.value=values[key]??'';if(type==='number')n.step='any';n.oninput=()=>values[key]=n.value;n.onchange=()=>values[key]=n.value;controls[key]=n;wrap.append(n);parent.append(wrap);return n;}
  const datasets=timingRows(p),numeric=[];for(const r of datasets)for(const [column,v]of Object.entries(r))if(!['id','tableId','recommendation','tableName'].includes(column)&&typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v)))numeric.push({tableId:r.tableId,rowId:r.id,column,title:`${r.Title||r.tableName} · ${column}`});
  function draw(){content.replaceChildren();tabs.replaceChildren();message.textContent='';for(const [id,label]of [['details','Details'],['when','When'],['if','If'],['action','Action'],['preview','Preview']]){const b=button(label,()=>{pane=id;draw();});b.setAttribute('aria-pressed',String(pane===id));tabs.append(b);}
   if(pane==='details'){field(content,'Title',group==='birthdays'?'Name or birthday title':'Name');for(const key of extraFields[group])field(content,key,key,['Value','Target'].includes(key)?'number':'text');field(content,'Status','Status','text',['Active','Done','Paused']);}
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
