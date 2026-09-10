import {ROWS,COLS,CELLS,FORMAT,LATTICE,SHELLS,PRESETS,CAMERAS,address,neighbours,blankProject,validateProject,poseAt,parseCSV,recordsFromCSV,exampleRecords} from './core.js';
import {AuraView} from './renderer.js';
const $=id=>document.getElementById(id),page=document.body.dataset.page;
const KEY='aura-matrix-studio:v1:project';let project=blankProject(),history=[],selectedId=null,shell=0,cell=97,face='I',view=null,shape='horn',time=0,playing=false,shotIndex=0,recording=null,playingLast=0,pendingCSV=null,toastTimer;
const id=()=>crypto.randomUUID();
function notify(message){$('toast').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',7000);}
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function saveStatus(text){if($('save-status'))$('save-status').textContent=text;}
try{const saved=localStorage.getItem(KEY);if(saved)project=validateProject(JSON.parse(saved));saveStatus('Saved on this browser');}catch(e){saveStatus('Stored project could not be read. A blank session is open.');notify('The stored copy was left untouched. Import a backup to recover it.');}
function commit(next){next=validateProject(next);history.push(project);project=next;try{localStorage.setItem(KEY,JSON.stringify(project));saveStatus('Saved on this browser');}catch(e){saveStatus('Browser storage is unavailable or full. Download a backup now.');notify('Your changes are in this tab. Download a backup to keep them.');}if($('undo'))$('undo').disabled=!history.length;refresh();}
function change(fn){const next=structuredClone(project);fn(next);commit(next);}
function download(name,blob){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function jsonDownload(name,data){download(name,new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));}
function select(s,c,f=face){address(s,c,f);shell=s;cell=c;face=f;selectedId=null;refresh();}
function selectOptions(node,items,value){node.replaceChildren();for(const [v,name]of items){const o=el('option',name);o.value=v;node.append(o);}if(value!==undefined)node.value=value;}
function refresh(){
  document.documentElement.style.setProperty('--shell',SHELLS[shell][1]);
  if($('selected-address'))$('selected-address').textContent=address(shell,cell,face);
  if($('stage-address'))$('stage-address').textContent=address(shell,cell,face);
  if($('address-detail'))$('address-detail').textContent=`Row ${Math.floor((cell-1)/24)+1} · Column ${(cell-1)%24+1} · ${face==='I'?'Inside':'Outside'}`;
  document.querySelectorAll('[data-shell]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.shell===shell)));
  document.querySelectorAll('[data-face]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.face===face)));
  if(view){view.records=project.records;view.links=project.links;view.set(page==='story'?poseAt(project.story,time).pose:{...PRESETS[shape]},shell,cell,face);}
  if(page==='matrix'){renderGrid();renderRecords();}
  if(page==='inventory')renderInventory();
  if(page==='story'){renderShots();updateTimeline();}
  if($('record-count'))$('record-count').textContent=`${project.records.length} records · ${project.links.length} connections`;
}
if($('aura-canvas')){
  try{view=new AuraView($('aura-canvas'),select);}catch(e){$('stage-error').textContent='The 3D view needs WebGL. You can still use the numbered matrix, records and backups below.';}
  for(let s=6;s>=0;s--){const b=el('button');b.dataset.shell=s;b.style.setProperty('--colour',SHELLS[s][1]);b.title=SHELLS[s][0];b.setAttribute('aria-label',`Select ${SHELLS[s][0]} shell`);b.setAttribute('aria-pressed',String(s===shell));b.onclick=()=>{if(!recording)select(s,cell);};$('shell-rail').append(b);}
  $('reset-view').onclick=()=>view?.reset();
  $('save-png').onclick=()=>{if(!view)return notify('PNG export needs the 3D view.');const c=document.createElement('canvas');c.width=1280;c.height=720;view.paintExport(c.getContext('2d'),1280,720,page==='story'?poseAt(project.story,time).caption:`${PRESETS[shape].name}. Twelve rows, twenty-four columns.`,page==='story'&&$('include-labels').checked);c.toBlob(b=>b&&download('aura-matrix-frame.png',b),'image/png');};
}
document.querySelectorAll('[data-face]').forEach(b=>b.onclick=()=>select(shell,cell,b.dataset.face));
if(page==='matrix'){
  for(const [key,p]of Object.entries(PRESETS)){const b=el('button',p.name);b.dataset.shape=key;b.setAttribute('aria-pressed',String(key===shape));b.onclick=()=>{shape=key;document.querySelectorAll('[data-shape]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh();view?.reset();};$('shapes').append(b);}
  for(let i=1;i<=288;i++){const b=el('button',String(i));b.dataset.cell=i;b.onclick=()=>select(shell,i);b.addEventListener('keydown',e=>{const key={ArrowUp:'north',ArrowRight:'east',ArrowDown:'south',ArrowLeft:'west'}[e.key];if(key){e.preventDefault();const next=neighbours(i)[key];select(shell,next);$('matrix-grid').children[next-1].focus();}});$('matrix-grid').append(b);}
  $('record-form').onsubmit=e=>{e.preventDefault();const title=$('record-title').value.trim();if(!title)return;const old=project.records.find(r=>r.id===selectedId);const record={id:old?.id||id(),title,note:$('record-note').value,shell,cell,face,fields:old?.fields||{}};change(p=>{const i=p.records.findIndex(r=>r.id===record.id);if(i<0)p.records.push(record);else p.records[i]=record;});selectedId=record.id;renderRecords();notify('Record saved at '+address(shell,cell,face)+'.');};
  $('new-record').onclick=()=>{selectedId=null;renderRecords();$('record-title').focus();};
  $('delete-record').onclick=()=>{const rid=selectedId;selectedId=null;change(p=>{p.records=p.records.filter(r=>r.id!==rid);p.links=p.links.filter(l=>l.from!==rid&&l.to!==rid);});notify('Record removed. Undo will restore it.');};
  $('connection-form').onsubmit=e=>{e.preventDefault();const to=$('link-to').value,label=$('link-label').value.trim();if(!selectedId||!to||!label)return;change(p=>p.links.push({from:selectedId,to,label}));notify('Connection saved.');};
}
function renderGrid(){const occupied=new Set(project.records.filter(r=>r.shell===shell&&r.face===face).map(r=>r.cell));for(const b of $('matrix-grid').children){const n=+b.dataset.cell;b.classList.toggle('occupied',occupied.has(n));b.setAttribute('aria-pressed',String(n===cell));b.setAttribute('aria-label',`${address(shell,n,face)}${occupied.has(n)?', contains records':''}`);b.tabIndex=n===cell?0:-1;}}
function renderRecords(){
  const list=$('cell-records');list.replaceChildren();const records=project.records.filter(r=>r.shell===shell&&r.cell===cell&&r.face===face);
  if(!records.length)list.append(el('p','This cell is empty. Give your first record a title.','empty'));
  for(const r of records){const b=el('button',r.title,'record-item');b.setAttribute('aria-pressed',String(r.id===selectedId));b.onclick=()=>{selectedId=r.id;renderRecords();};list.append(b);}
  const r=project.records.find(r=>r.id===selectedId);$('form-state').textContent=r?'Editing selected record':'New record at this address';$('record-title').value=r?.title||'';$('record-note').value=r?.note||'';$('delete-record').hidden=!r;$('new-record').hidden=!r;
  $('connections-editor').hidden=!r;$('record-fields').replaceChildren();
  if(r){for(const [k,v] of Object.entries(r.fields||{})){$('record-fields').append(el('dt',k),el('dd',v));}}
  selectOptions($('link-to'),[['','Choose another record'],...project.records.filter(x=>x.id!==selectedId).map(x=>[x.id,`${x.title} · ${address(x.shell,x.cell,x.face)}`])]);$('link-label').value='';$('connections').replaceChildren();
  for(const l of project.links.filter(x=>x.from===selectedId||x.to===selectedId)){const a=project.records.find(r=>r.id===l.from),b=project.records.find(r=>r.id===l.to),n=el('div',`${a.title} → ${l.label} → ${b.title}`,'connection'),remove=el('button','Remove');remove.onclick=()=>change(p=>p.links.splice(project.links.indexOf(l),1));n.append(remove);$('connections').append(n);}
}
function renderInventory(){const q=$('search').value.toLowerCase(),rows=project.records.filter(r=>`${r.title} ${r.note} ${address(r.shell,r.cell,r.face)} ${JSON.stringify(r.fields)}`.toLowerCase().includes(q));$('inventory-rows').replaceChildren();for(const r of rows){const tr=el('tr');tr.append(el('td',r.title),el('td',address(r.shell,r.cell,r.face)),el('td',r.note,'note-cell'));const td=el('td'),b=el('button','Open cell');b.onclick=()=>location.href=`index.html?shell=${r.shell}&cell=${r.cell}&face=${r.face}`;td.append(b);tr.append(td);$('inventory-rows').append(tr);}$('inventory-empty').hidden=rows.length>0;$('inventory-count').textContent=`${rows.length} of ${project.records.length} records`;}
if($('search'))$('search').oninput=renderInventory;
if($('undo'))$('undo').onclick=()=>{if(!history.length)return;const previous=history.pop();project=previous;selectedId=null;try{localStorage.setItem(KEY,JSON.stringify(project));saveStatus('Saved on this browser');}catch{saveStatus('Undo is in this tab. Download a backup.');}$('undo').disabled=!history.length;refresh();notify('Last change undone.');};
document.querySelectorAll('[data-backup]').forEach(b=>b.onclick=()=>jsonDownload('aura-matrix-backup.json',project));
document.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>$('backup-file').click());
$('backup-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{const next=validateProject(JSON.parse(await file.text()));$('restore-summary').textContent=`This backup contains ${next.records.length} records, ${next.links.length} connections and ${next.story.length} explainer shots. Restore will replace this browser's project. You can download your current backup first.`;$('restore-confirm').onclick=()=>{stopPlayback();selectedId=null;time=0;shotIndex=0;commit(next);$('restore-dialog').close();notify('Backup restored.');};$('restore-dialog').showModal();}catch(error){notify(error.message);}};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{const records=exampleRecords(id);change(p=>{p.records.push(...records);p.links.push({from:records[0].id,to:records[1].id,label:'raises a question'},{from:records[1].id,to:records[2].id,label:'explored through'},{from:records[2].id,to:records[3].id,label:'suggests an action'});});if(page==='matrix')select(0,97,'I');notify('Four clearly labelled example records added. Your existing records are kept.');});
document.querySelectorAll('[data-csv]').forEach(b=>b.onclick=()=>$('csv-file').click());
$('csv-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{pendingCSV=parseCSV(await file.text());selectOptions($('csv-title'),pendingCSV.headers.map(h=>[h,h]));selectOptions($('csv-note'),[['','No note column'],...pendingCSV.headers.map(h=>[h,h])]);selectOptions($('csv-cell'),[['','Place consecutive rows from the starting cell'],...pendingCSV.headers.map(h=>[h,h])]);selectOptions($('csv-shell'),SHELLS.map((s,i)=>[i,s[0]]),shell);$('csv-start').value=cell;$('csv-face').value=face;$('csv-summary').textContent=`${file.name}: ${pendingCSV.rows.length} rows. All original columns are kept with each record.`;$('csv-preview').textContent=pendingCSV.headers.join(' | ')+'\n'+pendingCSV.rows.slice(0,3).map(r=>r.join(' | ')).join('\n');$('csv-dialog').showModal();}catch(error){notify(error.message);}};
$('csv-form').onsubmit=e=>{e.preventDefault();try{const mapping={title:$('csv-title').value,note:$('csv-note').value,cell:$('csv-cell').value,shell:+$('csv-shell').value,start:+$('csv-start').value,face:$('csv-face').value};const records=recordsFromCSV(pendingCSV,mapping,id);change(p=>p.records.push(...records));$('csv-dialog').close();notify(`${records.length} records placed. Download a backup to keep a separate copy.`);}catch(error){$('csv-error').textContent=error.message;}};
function stopPlayback(){playing=false;playingLast=0;if($('play'))$('play').textContent='Play explainer';if(view)view.locked=Boolean(recording);}
function renderShots(){
  shotIndex=Math.min(shotIndex,project.story.length-1);$('shot-list').replaceChildren();project.story.forEach((s,i)=>{const li=el('li'),b=el('button');b.append(el('span',String(i+1),'shot-number'));const label=el('span',PRESETS[s.preset].name);label.append(el('small',`${s.duration} seconds`));b.append(label);b.setAttribute('aria-pressed',String(i===shotIndex));b.onclick=()=>{stopPlayback();shotIndex=i;time=project.story.slice(0,i).reduce((n,s)=>n+s.duration,0)+Math.min(3,s.duration*.65);refresh();};li.append(b);$('shot-list').append(li);});
  const shot=project.story[shotIndex];selectOptions($('shot-preset'),Object.entries(PRESETS).map(([k,v])=>[k,v.name]),shot.preset);selectOptions($('shot-camera'),[['front','Front'],['quarter','Three quarter'],['top','From above']],shot.camera);$('shot-duration').value=shot.duration;$('shot-caption').value=shot.caption;$('delete-shot').disabled=project.story.length===1;$('shot-editor-title').textContent=`Edit shot ${shotIndex+1}`;
}
function updateTimeline(){const at=poseAt(project.story,time);time=at.time;$('scrub').max=at.total;$('scrub').value=time;$('time-label').textContent=`${time.toFixed(1)} / ${at.total.toFixed(1)} sec`;$('caption').textContent=at.caption;if(view)view.set(at.pose,shell,cell,face);}
if(page==='story'){
  $('play').onclick=()=>{if(playing){stopPlayback();return;}if(time>=poseAt(project.story,time).total)time=0;playing=true;playingLast=0;if(view)view.locked=true;$('play').textContent='Pause';};
  $('restart').onclick=()=>{stopPlayback();time=0;updateTimeline();};$('scrub').oninput=e=>{stopPlayback();time=+e.target.value;updateTimeline();};
  $('shot-form').onsubmit=e=>{e.preventDefault();stopPlayback();change(p=>p.story[shotIndex]={preset:$('shot-preset').value,camera:$('shot-camera').value,duration:+$('shot-duration').value,caption:$('shot-caption').value});notify('Explainer shot saved.');};
  $('add-shot').onclick=()=>{stopPlayback();const shot=structuredClone(project.story[shotIndex]);shotIndex=project.story.length;change(p=>p.story.push(shot));};
  $('delete-shot').onclick=()=>{if(project.story.length<2)return;stopPlayback();const old=shotIndex;shotIndex=Math.max(0,shotIndex-1);time=0;change(p=>p.story.splice(old,1));};
  $('move-shot-up').onclick=()=>{if(shotIndex<1)return;stopPlayback();const old=shotIndex;shotIndex--;time=0;change(p=>[p.story[old-1],p.story[old]]=[p.story[old],p.story[old-1]]);};
  $('story-json').onclick=()=>jsonDownload('aura-explainer.json',{format:'aura-explainer/1',lattice:LATTICE,rows:ROWS,columns:COLS,shell,cell,face,story:project.story});
  $('record-video').onclick=exportVideo;
  if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('record-video').disabled=true;$('video-hint').textContent='Video recording is unavailable in this browser. Use the PNG and explainer file exports.';}
  function tick(now){if(playing&&!recording){if(playingLast)time+=(now-playingLast)/1000;playingLast=now;updateTimeline();if(time>=poseAt(project.story,time).total)stopPlayback();}requestAnimationFrame(tick);}requestAnimationFrame(tick);
}
async function exportVideo(){
  if(recording){recording.cancelled=true;recording.recorder.stop();return;}
  if(!view)return notify('Video export needs the 3D view.');
  const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!type)return notify('This browser cannot record WebM. Use Chrome or Edge, or export the explainer file.');
  stopPlayback();const previousTime=time,previousTheta=view.theta,previousPhi=view.phi;
  const output=document.createElement('canvas');output.width=1280;output.height=720;const ctx=output.getContext('2d');
  const stream=output.captureStream(30);let recorder;try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:6000000});}catch(e){stream.getTracks().forEach(t=>t.stop());return notify('The browser could not start recording. Try PNG or the explainer file.');}
  const chunks=[],session={recorder,cancelled:false,frame:null};recording=session;view.locked=true;
  document.querySelectorAll('main button,main input,main select,main textarea').forEach(n=>{if(n.id!=='record-video'){n.dataset.wasDisabled=String(n.disabled);n.disabled=true;}});
  $('record-video').textContent='Cancel recording';$('record-video').classList.add('recording');$('video-hint').textContent='Recording the complete sequence at 1280 × 720. Keep this tab visible. No sound is recorded.';
  const onHide=()=>{if(document.hidden&&recording){session.cancelled=true;recorder.stop();notify('Recording cancelled because the tab was hidden. Keep it visible for a complete video.');}};document.addEventListener('visibilitychange',onHide);
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onerror=()=>{session.cancelled=true;notify('The browser could not finish the recording.');if(recorder.state!=='inactive')recorder.stop();};
  recorder.onstop=()=>{cancelAnimationFrame(session.frame);document.removeEventListener('visibilitychange',onHide);stream.getTracks().forEach(t=>t.stop());recording=null;view.locked=false;time=previousTime;updateTimeline();view.theta=previousTheta;view.phi=previousPhi;view.render();document.querySelectorAll('[data-was-disabled]').forEach(n=>{n.disabled=n.dataset.wasDisabled==='true';delete n.dataset.wasDisabled;});$('record-video').textContent='Record video';$('record-video').classList.remove('recording');$('video-hint').textContent='1280 × 720 WebM video. Captions included. Silent, ready for a voice-over.';if(!session.cancelled&&chunks.length){download('aura-explainer.webm',new Blob(chunks,{type}));notify('Explainer video downloaded.');}};
  time=0;updateTimeline();view.paintExport(ctx,1280,720,poseAt(project.story,0).caption,$('include-labels').checked);recorder.start(1000);const start=performance.now(),total=poseAt(project.story,0).total;
  const frame=now=>{if(session.cancelled)return;try{time=Math.min(total,(now-start)/1000);updateTimeline();view.paintExport(ctx,1280,720,poseAt(project.story,time).caption,$('include-labels').checked);if(time>=total){recorder.stop();return;}session.frame=requestAnimationFrame(frame);}catch(e){session.cancelled=true;recorder.stop();notify('Recording stopped. Your project is unchanged.');}};session.frame=requestAnimationFrame(frame);
}
const params=new URLSearchParams(location.search);if(params.has('cell'))try{shell=+params.get('shell');cell=+params.get('cell');face=params.get('face');address(shell,cell,face);}catch{shell=0;cell=97;face='I';}
refresh();
// Local-only interface: no analytics, upload endpoint, external model or automatic sharing.
window.addEventListener('storage',e=>{if(e.key===KEY)notify('This project changed in another tab. Download this tab’s backup before reloading if you have unsaved edits.');});
