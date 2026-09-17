import {make,button,rows,panelFor,header,hero,tile,grid,download} from './local-tools.js?v=0.4.15';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.15';
import {pageIcon} from './page-icons.js?v=0.4.15';
import {PLACE_TABLE,MEDIA_TABLE,CAPTURE_ACCEPT,savePlace,attachMedia,reconstructionBrief,storeMedia,loadMedia,deleteMedia} from './palace-media.js?v=0.4.15';
const PALACE='F9CE754E-27BE-49C3-AD43-F39BCEC0B3E8';
export function mountPalaceCapture({page,screen,pages,go}){
 const panel=panelFor(screen,'palace-capture');let generation=0,disposed=false,urls=[];
 function clear(title,back){generation++;urls.forEach(URL.revokeObjectURL);urls=[];header(panel,title,back);}
 const places=()=>rows(readTravelProject(),PLACE_TABLE).filter(p=>p.Section===page.id);
 function home(){clear(page.id===PALACE?'Mind Palaces':page.name,()=>go(page.id===PALACE?'command:back':PALACE));
  hero(panel,'Begin with a real place','Use photos, a walk-through video or a scan as the basis for a realistic memory environment.',pageIcon(page.id)||'⌂');
  const flow=make('div','palace-capture-flow');for(const [icon,title] of [['◎','Capture'],['◇','Reconstruct'],['✧','Attach memories']]){const item=make('div');item.append(make('b','',icon),make('span','',title));flow.append(item);}panel.append(flow);
  if(page.id===PALACE){const children=[...pages.values()].filter(p=>p.parent===PALACE);grid(panel,children.map(p=>()=>tile(p.name,`${rows(readTravelProject(),PLACE_TABLE).filter(r=>r.Section===p.id).length} captured places`,pageIcon(p.id),()=>go(p.id))),6);}
  else grid(panel,[()=>tile('Add a place','Collect its photos, videos and scans','+',()=>editPlace()),...places().map(p=>()=>{
   const media=rows(readTravelProject(),MEDIA_TABLE).filter(f=>f.Place===p.id),card=tile(p.Title,`${media.length} media file${media.length===1?'':'s'}`,'⌂',()=>place(p)),cover=media.find(f=>f.Kind==='Photo'&&f.Role==='Result')||media.find(f=>f.Kind==='Photo'),mine=generation;
   if(cover)loadMedia(cover.id).then(blob=>{if(!blob||disposed||mine!==generation||!card.isConnected)return;const url=URL.createObjectURL(blob);urls.push(url);const img=make('img','palace-cover');img.src=url;img.alt='';card.querySelector('.tool-glyph')?.replaceWith(img);}).catch(()=>{});
   return card;
  })],6);
  panel.append(make('p','tool-help','Capture and review work locally. AI reconstruction will use a connected software extension.'));
 }
 function editPlace(existing){const id=existing?.id||crypto.randomUUID();clear(existing?.Title||'Add a place',existing?()=>place(existing):home);
  const form=make('form','tool-form'),titleLabel=make('label','','Name of this place'),title=make('input'),notesLabel=make('label','','Landmarks or details to preserve'),notes=make('textarea'),status=make('p','tool-status');title.value=existing?.Title||'';title.required=true;title.setAttribute('aria-label','Name of this place');notes.value=existing?.Notes||'';notes.setAttribute('aria-label','Landmarks or details to preserve');titleLabel.append(title);notesLabel.append(notes);const save=button('Save & add media',()=>{});save.type='submit';form.append(titleLabel,notesLabel,status,save);panel.append(form);
  form.onsubmit=e=>{e.preventDefault();try{const fields={...existing,Title:title.value,Notes:notes.value,Section:page.id};writeTravelProject(p=>savePlace(p,fields,id));place({...fields,id});}catch(error){status.textContent=error.message;}};
 }
 function place(p,tab='Source',index=0){p=rows(readTravelProject(),PLACE_TABLE).find(saved=>saved.id===p.id)||p;clear(p.Title,home);const mine=generation,controls=make('nav','tool-tabs');
  for(const [key,label]of [['Source','Capture'],['Result','Rendering'],['Data','Memories & data']]){const b=button(label,()=>place(p,key));b.setAttribute('aria-pressed',String(tab===key));controls.append(b);}panel.append(controls);
  if(tab==='Data'){hero(panel,'Give this place meaning','Link an Aura table and instructions to carry into the reconstructed environment.','✧');
   const project=readTravelProject();editorData(p,project);return;}
  const files=rows(readTravelProject(),MEDIA_TABLE).filter(f=>f.Place===p.id&&f.Role===tab);index=Math.max(0,Math.min(index,files.length-1));
  const stage=make('div','palace-media-stage'),status=make('p','tool-status');status.setAttribute('role','status');panel.append(stage);
  if(files.length){const f=files[index];stage.append(make('span','palace-media-label',`${f.Kind} · ${index+1} / ${files.length}`));
   loadMedia(f.id).then(blob=>{if(disposed||mine!==generation)return;if(!blob){stage.append(make('p','','This file is not stored in this browser. Re-import the original media.'));return;}const url=URL.createObjectURL(blob);urls.push(url);
    if(f.Kind==='Photo'){const image=make('img');image.src=url;image.alt=f.Title;image.onerror=()=>{image.remove();stage.append(make('p','','This image format cannot be previewed here. The original is saved.'));};stage.append(image);}
    else if(f.Kind==='Video'){const video=make('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=url;video.onerror=()=>{video.remove();stage.append(make('p','','This video cannot be played by this browser. The original is saved.'));};stage.append(video);}
    else{const symbol=make('div','palace-model-file');symbol.append(make('b','','◇'),make('strong','',f.Title.split('.').pop().toUpperCase()),make('span','','Scan / model retained for reconstruction'));stage.append(symbol);}
    const a=make('a','palace-file-download','Download original');a.href=url;a.download=f.Title;stage.append(a);
   }).catch(e=>{if(mine===generation)status.textContent='Media could not load: '+e.message;});
   panel.append(make('strong','palace-filename',f.Title));const nav=make('nav','tool-pager'),prev=button('‹',()=>place(p,tab,index-1)),next=button('›',()=>place(p,tab,index+1));prev.disabled=index===0;next.disabled=index===files.length-1;prev.setAttribute('aria-label','Previous media');next.setAttribute('aria-label','Next media');nav.append(prev,make('span','',`${index+1} / ${files.length}`),next);panel.append(nav);
   let start;stage.onpointerdown=e=>{if(e.target.closest('video,a'))return;start={x:e.clientX,y:e.clientY};};stage.onpointerup=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){if(dx<0&&index<files.length-1)place(p,tab,index+1);if(dx>0&&index>0)place(p,tab,index-1);}};stage.onpointercancel=()=>{start=null;};
  }else{const blank=make('div','palace-capture-empty');blank.append(make('b','',tab==='Source'?'◎':'◇'),make('h2','',tab==='Source'?'Capture this place':'Your reconstructed place'),make('p','',tab==='Source'?'Photograph overlapping views, film a slow walk-through, or import a 3D scan.':'Import the image, video or model returned by your reconstruction tool.'));stage.append(blank);}
  const input=make('input');input.type='file';input.multiple=true;input.accept=CAPTURE_ACCEPT;input.hidden=true;input.setAttribute('aria-label','Import palace media');panel.append(input);
  const actions=make('footer','tool-footer'),add=button(tab==='Source'?'Add photos, video or scan':'Import rendering',()=>input.click());actions.append(add,button(tab==='Source'?'Place details':'Export AI brief',()=>{if(tab==='Source')editPlace(p);else download('aura-palace-reconstruction.json',reconstructionBrief(readTravelProject(),p.id));}));panel.append(actions,status);
  panel.append(make('p','tool-help',tab==='Result'?'AI reconstruction is not connected yet. Export the brief and supply your original files to your chosen tool.':'Media stays in this browser. Aura JSON backups contain file references, not the media. Keep your original files.'));
  input.onchange=async()=>{const selected=[...input.files];if(!selected.length)return;const items=selected.map(blob=>({id:crypto.randomUUID(),name:blob.name,type:blob.type,size:blob.size,blob}));add.disabled=true;status.textContent='Saving media…';let stored=false;
   try{attachMedia(readTravelProject(),p.id,items,tab);await storeMedia(items);stored=true;writeTravelProject(project=>attachMedia(project,p.id,items,tab));if(!disposed&&mine===generation)place(p,tab,files.length);}
   catch(e){if(stored)await deleteMedia(items.map(f=>f.id)).catch(()=>{});if(!disposed&&mine===generation){status.textContent='Import failed: '+e.message;add.disabled=false;}}
  };
 }
 function editorData(p,project){const form=make('form','tool-form'),label=make('label','','Aura table'),select=make('select');select.setAttribute('aria-label','Aura table');for(const [id,name]of [['','No table selected'],...project.tables.map(t=>[t.id,t.name])]){const option=make('option','',name);option.value=id;select.append(option);}select.value=p.Dataset||'';label.append(select);
  const instructionsLabel=make('label','','Memories, associations and instructions'),notes=make('textarea');notes.value=p.Instructions||'';notes.setAttribute('aria-label','Memories, associations and instructions');instructionsLabel.append(notes);const save=button('Save connections',()=>{});save.type='submit';const status=make('p','tool-status');status.setAttribute('role','status');form.append(label,instructionsLabel,save,status);panel.append(form,make('p','tool-help','These links belong to the place. Spatial anchors will be placed on the reconstructed environment.'));
  form.onsubmit=e=>{e.preventDefault();try{writeTravelProject(project=>savePlace(project,{...p,Dataset:select.value,Instructions:notes.value},p.id));p={...p,Dataset:select.value,Instructions:notes.value};status.textContent='Connections saved.';}catch(error){status.textContent=error.message;}};
 }
 home();return {resize(){},dispose(){disposed=true;generation++;urls.forEach(URL.revokeObjectURL);}};
}
