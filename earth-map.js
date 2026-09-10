import {loadMap} from './market-map.js?v=0.3.8';
import {EARTH,EARTH_WIDE,earthRows,filterEarth,clusterEarth,pickEarthMarker,personalEarthRows,importEarthPoints,saveEarthPoints} from './earth-data.js?v=0.3.8';
import {readTravelProject,writeTravelProject,CELESTIAL} from './travel-data.js?v=0.3.8';
import {CROWN} from './original-routes.js?v=0.3.8';
import {framePoint} from './frame-display.js?v=0.3.8';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};

let snapshot,viewState;
function earthSnapshot(){return snapshot||(snapshot=fetch('assets/earth/manifest.json?v=0.3.8').then(async response=>{if(!response.ok)throw Error('Earth layer list could not load.');const metadata=await response.json();const data=await Promise.all(metadata.layers.map(async layer=>{const r=await fetch(layer.data);if(!r.ok)throw Error(layer.label+' could not load.');return earthRows(layer,await r.json());}));return {metadata,records:data.flat()};}).catch(e=>{snapshot=null;throw e;}));}
export function mountEarth({page,screen,go}){
 for(const c of page.controls)if(c.controlTypeID!=='StatusBar(Android)')screen.querySelector(`[data-source-control="${c.controlID}"]`)?.setAttribute('hidden','');
 let disposed=false,map,L,markers,metadata,records=[],found=[],hits=[],pinning=false,filterAffinity=viewState?.filterAffinity??true,selected=new Set(),query=viewState?.query||'';
 const panel=make('section','earth-panel'+(page.width>page.height?' earth-wide':''));panel.style.width=(page.width-16)+'px';panel.style.height=(page.height-32)+'px';panel.setAttribute('aria-label','Crown Earth map');screen.append(panel);
 const head=make('header');head.append(make('h2','','Earth'),button('Stars',()=>go(CELESTIAL)),button(page.id===EARTH?'Wide':'Tall',()=>go(page.id===EARTH?EARTH_WIDE:EARTH)),button('Crown',()=>go(CROWN)));panel.append(head);
 const search=make('input');search.type='search';search.value=query;search.placeholder='Find any name or place';search.setAttribute('aria-label',search.placeholder);panel.append(search);
 const status=make('p','earth-status','Loading the eight Horn Torus layers…');status.setAttribute('role','status');panel.append(status);
 const canvas=make('div','earth-canvas');canvas.setAttribute('aria-label','Interactive Earth map');panel.append(canvas);
 const foot=make('footer'),layersButton=button('Layers',layers),pin=button('Drop pin',()=>{pinning=!pinning;pin.setAttribute('aria-pressed',String(pinning));status.textContent=pinning?'Tap the map to place a pin.':summary();}),file=make('input');file.type='file';file.accept='.geojson,.json,.csv';file.hidden=true;file.setAttribute('aria-label','Import map points');foot.append(layersButton,pin,button('Import',()=>file.click()),button('Fit',fit));panel.append(foot,file);
 const drawer=make('section','earth-drawer');drawer.hidden=true;panel.append(drawer);
 function summary(){return `${found.length.toLocaleString()} matching places · ${metadata?.total.toLocaleString()||'0'} source records`;}
 function show(r,group=null,index=0){
  map.setView([r.lat,r.lng],Math.min(19,Math.max(14,map.getZoom()+2)),{animate:false});heading('Place details');drawer.classList.add('earth-detail-drawer');status.textContent=r.name;const tabs=make('nav','earth-detail-tabs'),body=make('div','earth-place-info'),actions=make('footer');drawer.append(tabs,body,actions);let section='place',textPage=0;
  const meta=metadata.layers.find(x=>x.id===r.layer);
  function render(){tabs.replaceChildren();body.replaceChildren();for(const [id,label]of [['place','Place'],['source','Source']]){const b=button(label,()=>{section=id;textPage=0;render();});b.setAttribute('aria-pressed',String(section===id));tabs.append(b);}
   const text=section==='place'?[r.name,r.detail,r.category,`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`].filter(Boolean).join('\n\n'):[meta?.label||'My saved place',meta?.statusLabel,meta?.coordinateBasis,meta?.warning,meta?.sourceUpdatedAt?'Source date: '+meta.sourceUpdatedAt:''].filter(Boolean).join('\n\n');
   // Page long notes inside the original frame instead of expanding the whole app.
   const chunks=text.match(new RegExp('[\\s\\S]{1,'+(page.width>page.height?140:220)+'}','g'))||[''];textPage=Math.min(textPage,chunks.length-1);body.append(make('p','earth-place-copy',chunks[textPage]));
   if(chunks.length>1){const row=make('nav','earth-pager'),prev=button('‹',()=>{textPage--;render();}),next=button('›',()=>{textPage++;render();});prev.setAttribute('aria-label','Previous detail');next.setAttribute('aria-label','More detail');prev.disabled=textPage===0;next.disabled=textPage===chunks.length-1;row.append(prev,make('span','',`${textPage+1} / ${chunks.length}`),next);body.append(row);}
   if(section==='source'){const url=r.url||meta?.sourceUrl||metadata.source;if(/^https?:\/\//i.test(url)){const a=make('a','','Open source website');a.href=url;a.target='_blank';a.rel='noopener';body.append(a);}}
  }
  actions.append(button('Show on map',()=>{drawer.hidden=true;map.setView([r.lat,r.lng],Math.max(14,map.getZoom()));status.textContent=r.name+' · '+r.detail;}));if(group){const prev=button('‹',()=>show(group.members[(index-1+group.count)%group.count],group,(index-1+group.count)%group.count)),next=button('›',()=>show(group.members[(index+1)%group.count],group,(index+1)%group.count));prev.setAttribute('aria-label','Previous place at this spot');next.setAttribute('aria-label','Next place at this spot');actions.append(prev,make('span','',`${index+1} / ${group.count}`),next);}render();
  const covered=page.width>page.height?[Math.max(0,canvas.clientWidth-drawer.offsetLeft)/2,0]:[0,Math.max(0,canvas.clientHeight-(drawer.offsetTop-canvas.offsetTop))/2];map.panBy(covered,{animate:false});
 }
 function showCluster(group){show(group.first,group.count>1?group:null);}
 function activate(group){
  if(group.count===1){show(group.first);return;}
  if(map.getZoom()>=19||group.members.every(r=>Math.abs(r.lat-group.first.lat)<1e-7&&Math.abs(r.lng-group.first.lng)<1e-7)){showCluster(group);return;}
  drawer.hidden=true;map.fitBounds(L.latLngBounds(group.members.map(r=>[r.lat,r.lng])),{padding:[24,24],maxZoom:Math.min(19,map.getZoom()+3),animate:false});
  status.textContent=`${group.count.toLocaleString()} places in this group. Tap a dot or zoom further.`;
 }
 function draw(){if(!map)return;markers.clearLayers();hits=[];const w=canvas.clientWidth,h=canvas.clientHeight;
  const clusters=clusterEarth(found,r=>{const p=map.latLngToContainerPoint([r.lat,r.lng]);return p.x>=-20&&p.x<=w+20&&p.y>=-20&&p.y<=h+20?p:null;});
  for(const g of clusters){const r=g.first,radius=g.count>1?Math.min(17,7+Math.log10(g.count)*3):5,b=L.circleMarker([r.lat,r.lng],{radius,interactive:false,color:'#fff',weight:1,fillColor:r.colour||'#547c94',fillOpacity:.85}).addTo(markers);hits.push({group:g,point:map.latLngToContainerPoint([r.lat,r.lng]),radius});if(g.count>1)b.bindTooltip(String(g.count),{permanent:true,direction:'center',className:'earth-cluster'});}

 }
 function refresh(){if(!metadata)return;found=filterEarth([...records,...personalEarthRows(readTravelProject())],{layers:selected,query,filterAffinity});status.textContent=summary();draw();}
 function fit(){if(!map)return;if(found.length)map.fitBounds(L.latLngBounds(found.map(r=>[r.lat,r.lng])),{padding:[20,20],maxZoom:14});}
 function heading(text){drawer.classList.remove('earth-detail-drawer');drawer.replaceChildren();const h=make('header');h.append(make('h3','',text),button('Done',()=>drawer.hidden=true));drawer.append(h);drawer.hidden=false;}
 function layers(){if(!metadata)return;heading('Map layers');const grid=make('div','earth-layers');for(const m of [...metadata.layers,{id:'personal',label:'My pins & imports'}]){const row=make('label'),check=make('input');check.type='checkbox';check.checked=selected.has(m.id);check.onchange=()=>{if(check.checked)selected.add(m.id);else selected.delete(m.id);refresh();};row.append(check,make('span','',m.label));grid.append(row);}drawer.append(grid);
  const match=make('label','earth-affinity'),check=make('input');check.type='checkbox';check.checked=filterAffinity;check.onchange=()=>{filterAffinity=check.checked;refresh();};match.append(check,make('span','','Affinity: matching names only'));drawer.append(match,button('Sources and accuracy',sources));
 }
 function sources(){heading('Sources');const select=make('select');select.setAttribute('aria-label','Map source details');for(const m of metadata.layers){const o=make('option','',m.label);o.value=m.id;select.append(o);}const details=make('div','earth-source-detail');const update=()=>{const m=metadata.layers.find(m=>m.id===select.value);details.replaceChildren(make('p','',`${m.mappedCount.toLocaleString()} points · ${m.statusLabel}`),make('p','',m.warning),make('p','',m.rightsNote||m.coordinateBasis));const a=make('a','','Original Horn Torus map');a.href=metadata.source;a.target='_blank';a.rel='noopener';details.append(a);};select.onchange=update;drawer.append(select,details);update();}
 function pinForm(latlng){pinning=false;pin.setAttribute('aria-pressed','false');heading('Save this place');const name=make('input');name.placeholder='Place name';name.setAttribute('aria-label','Place name');const notes=make('input');notes.placeholder='Notes (optional)';notes.setAttribute('aria-label','Pin notes');drawer.append(name,notes,make('p','',`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`),button('Save pin',()=>{try{writeTravelProject(p=>saveEarthPoints(p,[{name:name.value,lat:latlng.lat,lng:latlng.lng,detail:notes.value}]));selected.add('personal');drawer.hidden=true;refresh();}catch(e){status.textContent=e.message;}}));name.focus();}
 file.onchange=async()=>{const f=file.files[0];if(!f)return;try{const points=importEarthPoints(await f.text(),f.name);if(disposed)return;if(!points.length)throw Error('The file has no points.');heading(`Import ${points.length} points`);drawer.append(make('p','',`${f.name}. These points will be added to My Earth places in your Aura tables.`),button('Add these points',()=>{try{writeTravelProject(p=>saveEarthPoints(p,points,f.name));selected.add('personal');drawer.hidden=true;refresh();}catch(e){status.textContent=e.message;}}));}catch(e){status.textContent=e.message;}file.value='';};
 let delay;search.oninput=()=>{clearTimeout(delay);delay=setTimeout(()=>{query=search.value;refresh();if(query.trim())fit();},250);};
 // Leaflet's built-in dragging assumes an unscaled, upright viewport. Use frame
 // coordinates so drag and pin placement also work in the original rotated layouts.
 let drag=null,moved=false;
 const down=e=>{if(!map||e.target.closest('button,a,input,.leaflet-control,.leaflet-popup'))return;drag=framePoint(canvas,e);moved=false;canvas.setPointerCapture(e.pointerId);};
 const move=e=>{if(!drag)return;const p=framePoint(canvas,e);if(Math.hypot(p.x-drag.x,p.y-drag.y)>3){moved=true;map.panBy([drag.x-p.x,drag.y-p.y],{animate:false});drag=p;}};
 const up=e=>{if(!drag)return;const p=framePoint(canvas,e);if(!moved){if(pinning){const ll=map.containerPointToLatLng([p.x,p.y]).wrap();if(Math.abs(ll.lat)<=90)pinForm(ll);}else{const hit=pickEarthMarker(hits,p);if(hit)activate(hit.group);}}drag=null;};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('wheel',e=>{if(!map)return;e.preventDefault();map.setZoom(map.getZoom()+(e.deltaY<0?1:-1));},{passive:false});
 Promise.all([loadMap(),earthSnapshot()]).then(([lib,loaded])=>{if(disposed)return;L=lib;metadata=loaded.metadata;records=loaded.records;selected=new Set(viewState?.selected||[...metadata.layers.map(m=>m.id),'personal']);
  map=L.map(canvas,{preferCanvas:true,dragging:false,scrollWheelZoom:false,touchZoom:false,doubleClickZoom:false,boxZoom:false,minZoom:1,maxZoom:19,maxBounds:[[-85,-180],[85,180]]}).setView(viewState?.center||[0,0],viewState?.zoom||1);map.mouseEventToContainerPoint=e=>{const p=framePoint(canvas,e);return L.point(p.x,p.y);};
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);markers=L.layerGroup().addTo(map);map.on('moveend',draw);map.invalidateSize();refresh();
 }).catch(e=>{if(!disposed)status.textContent=e.message;});
 return {resize(){map?.invalidateSize();},dispose(){disposed=true;clearTimeout(delay);if(map)viewState={center:map.getCenter(),zoom:map.getZoom(),query,selected:[...selected],filterAffinity};map?.remove();}};
}
