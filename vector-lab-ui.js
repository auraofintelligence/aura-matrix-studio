import {make,button,download} from './local-tools.js?v=0.4.17';
import {emptyLab,parseImport,mergeImport,record,exampleRecords,validateLab,nearest,ALGORITHMS,COLOURS} from './vector-lab-data.js?v=0.4.20';
import {VectorLabScene} from './vector-lab-scene.js?v=0.4.20';
import {openLabStore} from './vector-lab-store.js?v=0.4.20';
import {SHELLS} from './core.js?v=0.4.17';
export const VECTOR_LAB='aura-vector-space';
const addressLabel=a=>a.kind==='geosphere'?`Geosphere ${a.side}${a.index}`:`${SHELLS[a.shell][0]} ${a.side}${a.index}${a.kind==='facet'?'':' · '+a.kind}${a.kind==='stack'?' '+a.layer:''}`;
export function mountProgrammerTools({page,screen,go}){
  const targets=page.controls.filter(c=>c.controlTypeID==='Button').sort((a,b)=>+a.x-+b.x);
  for(const c of targets)screen.querySelector(`[data-source-control="${c.controlID}"]`)?.setAttribute('hidden','');
  const oldBack=screen.querySelector('.original-nav-control');if(oldBack)oldBack.hidden=true;
  const bar=make('nav','programmer-tools');bar.setAttribute('aria-label','Matrix tools');
  bar.append(button('Back',()=>go('command:back'),'ethereal-nav'));
  const labels=['Tool inventory','Finite map','Infinite map'];targets.forEach((c,i)=>bar.append(button(labels[i],()=>go(c.links[0].target))));
  bar.append(button('Vector Space',()=>go(VECTOR_LAB),'vector-launch'));screen.append(bar);
  return {resize(){},dispose(){bar.remove();}};
}
export function mountVectorLab({screen,go}){
  for(const n of screen.children)n.hidden=true;
  const panel=make('section','vector-lab');screen.append(panel);
  let state=emptyLab(),selectedId=null,scene=null,store=null,worker=null,disposed=false,saving=Promise.resolve(),tab='data',address=null,ready=false;
  const head=make('header','vl-header'),back=button('Back',()=>go('command:back'),'ethereal-nav'),title=make('h1','','Vector Space'),label=make('span','vl-badge','Experimental');head.append(back,title,label);panel.append(head);
  const stage=make('div','vl-stage'),canvas=make('canvas');canvas.setAttribute('aria-label','Shared torus, geosphere and memory volume. Drag to rotate; pinch to zoom.');stage.append(canvas);
  const toolbar=make('div','vl-scene-tools'),side=button('Outside',()=>{if(!scene)return;scene.inside=!scene.inside;side.textContent=scene.inside?'Inside':'Outside';scene.render();}),mode=make('select');mode.setAttribute('aria-label','Pick in the volume');
  for(const [v,t]of [['memories','Memories'],...SHELLS.map(([n],i)=>[String(i),n+' facets']),['geosphere','Geosphere']]){const o=make('option','',t);o.value=v;mode.append(o);}mode.onchange=()=>{if(scene)scene.target=mode.value;};
  const rays=button('Rays',()=>{if(!scene)return;scene.rays=!scene.rays;rays.setAttribute('aria-pressed',String(scene.rays));drawScene();});rays.setAttribute('aria-pressed','false');
  const play=button('Pulse',()=>{if(!scene)return;scene.playing=!scene.playing;play.setAttribute('aria-pressed',String(scene.playing));scene.render();});play.setAttribute('aria-pressed','false');
  const fit=button('Fit',()=>{if(scene){scene.zoom=1;scene.theta=.7;scene.phi=.35;scene.render();}});toolbar.append(side,mode,rays,play,fit);stage.append(toolbar);
  const overlay=make('p','vl-overlay','One volume · seven tori · geosphere'),hint=make('p','vl-gesture','Drag to orbit · pinch to zoom · tap to select');stage.append(overlay,hint);panel.append(stage);
  const lower=make('section','vl-lower'),tabs=make('nav','vl-tabs'),body=make('div','vl-body'),status=make('p','vl-status','Opening this browser’s separate lab…');status.setAttribute('role','status');
  const tabButtons={};for(const [key,text]of [['data','Data'],['analyse','Analyse'],['inspect','Inspect'],['files','Save / restore']]){const b=button(text,()=>{tab=key;drawPanel();});tabs.append(b);tabButtons[key]=b;}lower.append(tabs,body,status);panel.append(lower);
  function report(text){status.textContent=text;}
  function event(kind,details={}){state.events.push({at:new Date().toISOString(),kind,...details});}
  function persist(){if(!store){report('In this tab only. Export the lab to keep your work.');return;}const snapshot=structuredClone(state),priorMessage=status.textContent;saving=saving.then(()=>store.write(snapshot)).then(()=>{if(!disposed && status.textContent===priorMessage)report('Saved in this browser · separate from your Aura records.');}).catch(()=>{if(!disposed)report('Storage could not be saved. Export the lab now to keep your work.');});}
  function current(){return state.records.find(r=>r.id===selectedId);}
  function drawScene(){const r=current();scene?.update(state.records,r,nearest(state.records,r));overlay.textContent=address?addressLabel(address):r?r.title:state.records.length?`${state.records.length} memories · ${state.records.some(r=>r.values.length)?'word-pattern space':'awaiting analysis'}`:'Seven tori · geosphere · empty memory volume';hint.textContent=state.records.length>600?'Showing first 600 points + selection · find every record in Inspect':'Drag to orbit · pinch to zoom · tap to select';}
  function select(id){selectedId=id;address=null;if(scene)scene.address=null;event('recall',{recordId:id});persist();tab='inspect';drawPanel();drawScene();}
  function stop(){worker?.terminate();worker=null;}
  function changed(){stop();state.projection=null;state.records.forEach(r=>r.values=[]);event('data-changed');persist();drawPanel();drawScene();}
  function field(parent,title,type,value){const label=make('label','vl-field',title),input=make(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.value=value??'';label.append(input);parent.append(label);return input;}
  function selectField(parent,title,choices,value){const label=make('label','vl-field',title),s=make('select');for(const [v,t]of choices){const o=make('option','',t);o.value=v;s.append(o);}s.value=value;label.append(s);parent.append(label);return s;}
  function drawPanel(){
    body.replaceChildren();for(const [key,b]of Object.entries(tabButtons))b.setAttribute('aria-current',String(tab===key));
    if(!ready){body.append(make('p','','Loading…'));return;}
    if(tab==='data'){
      body.append(make('p','vl-copy','Import text, CSV or conversation JSON. This lab stays separate from Social Media and your saved Aura.'));
      const row=make('div','vl-row'),file=make('input');file.type='file';file.accept='.txt,.md,.csv,.json';file.setAttribute('aria-label','Import text, CSV or conversation JSON');
      file.onchange=async()=>{try{const f=file.files[0];if(!f)return;if(f.size>20*1024*1024)throw Error('This prototype accepts files up to 20 MB. Split larger exports first.');const incoming=parseImport(f.name,await f.text());if(disposed)return;const previous=state.records.length;state.records=mergeImport(state.records,incoming);changed();report(`${state.records.length-previous} new text records. Non-text attachments are not imported. Choose Analyse next.`);}catch(e){report(e.message);}};
      row.append(file,button('Try example',()=>{if(state.records.length&&!confirm('Replace this lab with labelled example records? Export first to keep it.'))return;stop();state=emptyLab();state.records=exampleRecords();selectedId=null;address=null;if(scene)scene.address=null;changed();tab='analyse';drawPanel();}));body.append(row);
      const form=make('form','vl-form'),text=field(form,'Add a memory','textarea','');text.placeholder='Your own words…';text.required=true;const add=make('button','','Add memory');add.type='submit';form.append(add);form.onsubmit=e=>{e.preventDefault();if(!text.value.trim())return;state.records.push(record(text.value.trim(),{manual:true}));changed();report('Memory added. Analyse to calculate its position.');};body.append(form);
    }else if(tab==='analyse'){
      body.append(make('p','vl-copy','Local mathematical word patterns, not a neural language model. Cosine scores measure shared vocabulary. PCA places the vectors in this volume.'));
      const algorithm=selectField(body,'Algorithm',Object.entries(ALGORITHMS),state.algorithm);algorithm.disabled=!!worker;algorithm.onchange=()=>{state.algorithm=algorithm.value;persist();};
      const row=make('div','vl-row'),run=button(worker?'Analysing…':'Analyse '+state.records.length+' memories',()=>{
        if(!state.records.length)return;stop();worker=new Worker(new URL('./vector-lab-worker.js?v=0.4.20',import.meta.url),{type:'module'});const job=worker;report('Calculating vectors and positions on this device…');drawPanel();
        job.onmessage=({data})=>{if(worker!==job||disposed)return;stop();if(data.error){report(data.error);drawPanel();return;}state.records=data.result.records;state.projection=data.result.projection;state.runs.push(data.result.run);event('analysis',{runId:data.result.run.id});persist();drawPanel();drawScene();};
        job.onerror=()=>{stop();report('Analysis could not run. Your input is unchanged.');drawPanel();};job.postMessage({records:state.records,algorithm:state.algorithm});
      },'vl-primary');run.disabled=!!worker||!state.records.length;row.append(run);if(worker)row.append(button('Cancel',()=>{stop();drawPanel();report('Analysis cancelled.');}));body.append(row);
      const latest=state.runs.at(-1);if(latest)body.append(make('p','vl-copy',`Last run: ${ALGORITHMS[latest.algorithm]} · ${latest.vocabulary.length} features (maximum 768) · ${latest.records} records. ${state.projection?'Positions are a 3D projection; similarity uses the full vector.':'Data changed: run analysis again.'}`));
    }else if(tab==='inspect'){
      const search=field(body,'Find a memory','search',''),list=make('div','vl-memory-list');body.append(list);
      function results(){list.replaceChildren();const matches=state.records.filter(r=>(r.title+' '+r.text).toLowerCase().includes(search.value.toLowerCase()));for(const r of matches.slice(0,60)){const b=button(r.title,()=>select(r.id),'vl-memory');b.style.setProperty('--memory-colour',r.colour);b.setAttribute('aria-pressed',String(r.id===selectedId));list.append(b);}if(matches.length>60)list.append(make('p','vl-copy','Narrow your search to see more matches.'));}search.oninput=results;results();
      const r=current();if(!r){body.append(make('p','vl-copy','Select a point or find a memory here.'));return;}
      const details=make('div','vl-detail');details.append(make('h2','',r.title),make('p','vl-source',r.source.example?'Example record':JSON.stringify(r.source)),make('p','vl-text',r.text));body.append(details);
      const info=make('p','vl-copy',`${r.values.length} vector dimensions · recalled ${state.events.filter(e=>e.kind==='recall'&&e.recordId===r.id).length} times`);details.append(info);
      const props=make('details');props.append(make('summary','','Field properties'));const form=make('form','vl-form'),colour=field(form,'Colour','color',r.colour),charge=field(form,'Charge · signed value','range',r.charge);charge.min=-1;charge.max=1;charge.step=.05;charge.value=r.charge;const chargeValue=make('output','',String(r.charge));charge.after(chargeValue);charge.oninput=()=>chargeValue.value=charge.value;
      const hz=field(form,'Pulse frequency · Hz (0 = still)','number',r.frequency);hz.min=0;hz.max=2;hz.step=.1;
      const dirs=make('div','vl-row'),direction=r.direction.map((n,i)=>{const v=field(dirs,['Direction X','Direction Y','Direction Z'][i],'number',n);v.min=-1;v.max=1;v.step=.1;return v;});form.append(dirs);
      const positions=make('div','vl-row'),pos=r.position.map((n,i)=>{const v=field(positions,['Position X','Position Y','Position Z'][i],'number',n);v.min=-1;v.max=1;v.step='any';return v;});form.append(positions);const pin=field(form,'Keep this position on re-analysis','checkbox','');pin.checked=r.pinned;
      form.append(make('p','vl-copy','Charge controls the selected arrow’s length here; it does not simulate forces. Direction is a display vector. Pulse is a visual rate, separate from the timestamped recall log.'));
      const save=make('button','vl-primary','Save properties');save.type='submit';form.append(save);form.onsubmit=e=>{e.preventDefault();stop();const previous=structuredClone(r);Object.assign(r,{colour:colour.value,charge:+charge.value,frequency:+hz.value,direction:direction.map(n=>+n.value),position:pos.map(n=>+n.value),pinned:pin.checked});try{validateLab(state);}catch(error){Object.assign(r,previous);report(error.message);return;}event('properties',{recordId:r.id,before:{colour:previous.colour,charge:previous.charge,frequency:previous.frequency,direction:previous.direction,position:previous.position},after:{colour:r.colour,charge:r.charge,frequency:r.frequency,direction:r.direction,position:r.position}});persist();drawScene();};props.append(form);details.append(props);
      const bindings=make('details');bindings.open=!!address;bindings.append(make('summary','','Geometry associations'));
      bindings.append(make('p','vl-copy','Choose a shell or geosphere above, then tap its surface. The selected memory remains active.'));
      if(address){
        if(address.kind!=='geosphere'){
          const kind=selectField(bindings,'Address element',[['facet','Facet centre'],['vertex','Vertex'],['edge-u','Row edge'],['edge-v','Column edge'],['stack','Stack layer']],address.kind);
          kind.onchange=()=>{address={...address,kind:kind.value};if(address.kind==='stack')address.layer=1;else delete address.layer;scene.address=address;drawPanel();drawScene();};
          if(address.kind==='stack'){const layer=field(bindings,'Stack layer','number',address.layer);layer.min=1;layer.max=16777215;layer.step=1;layer.onchange=()=>{if(!layer.checkValidity())return;address.layer=+layer.value;scene.address=address;drawPanel();drawScene();};bindings.append(make('p','vl-copy','Stores a layer address in the lab only; does not create a stack in your main Aura.'));}
        }
        bindings.append(button('Link to '+addressLabel(address),()=>{stop();if(!r.anchors.some(a=>JSON.stringify(a)===JSON.stringify(address)))r.anchors.push({...address});event('association',{recordId:r.id,address:{...address}});persist();drawPanel();drawScene();}));
      }
      for(const a of r.anchors)bindings.append(button(addressLabel(a)+' · remove',()=>{stop();r.anchors=r.anchors.filter(x=>x!==a);event('unlink',{recordId:r.id,address:a});persist();drawPanel();drawScene();}));details.append(bindings);
      const edit=make('details');edit.append(make('summary','','Edit memory'));const editForm=make('form','vl-form'),name=field(editForm,'Title','text',r.title),words=field(editForm,'Text','textarea',r.text);name.required=true;words.required=true;const apply=make('button','','Save memory');apply.type='submit';editForm.append(apply);editForm.onsubmit=e=>{e.preventDefault();if(!words.value.trim()||!name.value.trim())return;event('edit',{recordId:r.id,before:{title:r.title,text:r.text},after:{title:name.value,text:words.value}});r.title=name.value;r.text=words.value;changed();report('Memory changed. Re-analyse to update vectors; the original text is retained in the activity log.');};edit.append(editForm,button('Delete this memory',()=>{if(!confirm('Delete this memory and its activity entries from the lab? Exported backups are unchanged.'))return;state.records=state.records.filter(x=>x.id!==r.id);state.events=state.events.filter(e=>e.recordId!==r.id);selectedId=null;changed();}));details.append(edit);
      const similar=make('details');similar.append(make('summary','','Related by word patterns'));for(const n of nearest(state.records,r))similar.append(button(`${n.record.title} · ${n.score.toFixed(3)}`,()=>select(n.record.id)));if(!nearest(state.records,r).length)similar.append(make('p','vl-copy','No shared vocabulary found, or analysis has not run.'));details.append(similar);
      const log=make('details');log.append(make('summary','','Activity log'));for(const e of state.events.filter(e=>e.recordId===r.id).slice(-20).reverse())log.append(make('p','vl-copy',`${e.at} · ${e.kind}`));log.append(make('p','vl-copy','Showing latest 20 entries; the complete log is included in Export lab.'));details.append(log);
    }else{
      body.append(make('p','vl-copy','This experimental page uses its own browser database. Existing Aura backups do not include it. Export this lab separately. Browser storage is not an encrypted vault. No model service receives these records.'));
      const row=make('div','vl-row');row.append(button('Export lab',()=>download('aura-vector-space.json',state),'vl-primary'));const file=make('input');file.type='file';file.accept='.json';file.setAttribute('aria-label','Restore Vector Space backup');file.onchange=async()=>{try{const f=file.files[0];if(!f)return;if(f.size>50*1024*1024)throw Error('Restore files up to 50 MB in this prototype.');const next=validateLab(JSON.parse(await f.text()));if(disposed)return;if(!confirm(`Replace this lab with ${next.records.length} memories?`))return;stop();state=next;selectedId=null;address=null;if(scene)scene.address=null;persist();drawPanel();drawScene();}catch(e){report(e.message);}};row.append(file);body.append(row,button('Clear this lab',()=>{if(!confirm('Clear the separate Vector Space lab? Export first to keep it.'))return;stop();state=emptyLab();selectedId=null;address=null;if(scene)scene.address=null;persist();drawPanel();drawScene();}));
    }
  }
  try{scene=new VectorLabScene(canvas,pick=>{if(pick.record)select(pick.record);else{address=pick.address;scene.address=address;tab='inspect';drawPanel();drawScene();}});}catch(e){canvas.hidden=true;stage.append(make('p','vl-no-webgl','3D is unavailable on this device. Import, analysis and the searchable inspector still work.'));for(const b of [side,mode,rays,play,fit])b.disabled=true;}
  drawPanel();
  (async()=>{try{store=await openLabStore();const saved=await store.read();if(disposed){store.close();return;}if(saved)state=validateLab(saved);report('Separate lab · saved on this browser.');}catch(e){store?.close();store=null;report('Lab storage unavailable or unreadable. Use Export to keep this session.');}ready=true;if(!disposed){drawPanel();drawScene();}})();
  return {resize(){scene?.resize();},dispose(){disposed=true;stop();scene?.dispose();saving.finally(()=>store?.close());panel.remove();}};
}
