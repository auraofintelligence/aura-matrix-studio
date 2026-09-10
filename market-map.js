export const MARKET_CATEGORIES={all:'All places',accommodation:'Accommodation',creative:'Creative industries',events:'Events',health:'Health & wellbeing',cities:'Cities & developments',other:'Other / to review'};
export const MARKET_PAGES={
 '9635446B-1F60-4AF2-A62C-E40C90E1806E':'all',
 'EFF01120-F6DF-4D09-AB86-D792114F4510':'accommodation',
 '1048D647-11A8-4997-B027-C927A9B57CC0':'creative',
 'FA23A5C1-2574-4A2A-9E31-E3CB83E295DB':'events',
 '6A95127D-17FB-4306-BA72-9197A8A8742E':'health',
 '6BD52E9F-2F2E-4DAE-A60F-54E7DCF7BD77':'cities',
 '9BF63D63-6482-4050-8630-8D632BB10DDF':'all',
 'C62804F4-68A6-4814-AA4E-CA454CE9CF91':'all'
};
const normalise=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
export function filterMarket(records,{category='all',source='all',query=''}={}){
 const words=normalise(query).trim().split(/\s+/).filter(Boolean);
 return records.filter(r=>(category==='all'||r.category===category)&&(source==='all'||r.source===source)&&words.every(w=>normalise(r.name+' '+r.place+' '+MARKET_CATEGORIES[r.category]).includes(w)));
}
let library;
export function loadMap(){
 if(window.L)return Promise.resolve(window.L);
 if(!library)library=new Promise((resolve,reject)=>{const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';document.head.append(css);const script=document.createElement('script');script.src='vendor/leaflet/leaflet.js';script.onload=()=>resolve(window.L);script.onerror=()=>{library=null;script.remove();reject(Error('The map could not load. Close and try again.'));};document.head.append(script);});
 return library;
}
export function mountMarket({page,screen}){
 const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
 const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
 const select=(label,entries)=>{const n=make('select');n.setAttribute('aria-label',label);for(const [id,text]of entries){const o=make('option','',text);o.value=id;n.append(o);}return n;};
 let disposed=false,map=null,layer=null,data=null,found=[],offset=0,opening=0;
 const dialog=make('dialog','market-dialog'),header=make('header'),title=make('h2','','Market map'),close=button('Done',()=>dialog.close());header.append(title,close);
 const controls=make('div','market-filters'),category=select('Market category',Object.entries(MARKET_CATEGORIES)),source=select('Map source',[['all','Alliance + Affinity'],['alliance','Original Alliance'],['affinity','Affinity discoveries']]);
 const search=make('input');search.type='search';search.placeholder='Find a name, place or service';search.setAttribute('aria-label',search.placeholder);
 controls.append(category,source,search);
 const status=make('p','market-status','Loading places…');status.setAttribute('role','status');
 const canvas=make('div','market-canvas');canvas.setAttribute('aria-label','Map of matching market places');
 const results=make('div','market-results'),pager=make('nav','market-pager'),back=button('‹',()=>{offset=Math.max(0,offset-3);list();}),next=button('›',()=>{offset+=3;list();}),count=make('span');back.setAttribute('aria-label','Previous places');next.setAttribute('aria-label','More places');pager.append(back,count,next);
 const footer=make('footer'),fit=button('Fit places',()=>fitPlaces()),sources=button('Sources & filters',()=>info.showModal());footer.append(fit,sources);
 dialog.append(header,controls,status,canvas,results,pager,footer);document.body.append(dialog);
 const info=make('dialog','market-info'),infoHead=make('header');infoHead.append(make('h2','','Sources & filters'),button('Done',()=>info.close()));info.append(infoHead);document.body.append(info);
 function sourcesInfo(){
  info.replaceChildren(infoHead,make('p','',data.rules),make('p','','Listings are archival discovery leads, not confirmed Alliance members. Category suggestions need review.'));
  for(const s of data.sources){const a=make('a','',s.label);a.href=s.id==='affinity'?'https://auraofintelligence.github.io/aura-affinity/':s.url;a.target='_blank';a.rel='noopener';info.append(a,make('p','',`${s.recordsRead.toLocaleString()} source records. Imported ${s.importedAt}. ${s.warning}`));}
  info.append(make('p','',`${data.held.affinity.nameDoesNotMatch.toLocaleString()} Affinity results held out because their names do not match; ${data.held.alliance.duplicate} duplicate Alliance pins combined. Original source files are unchanged.`));
 }
 function popup(r){const n=make('div','market-place');n.append(make('strong','',r.name),make('p','',r.place),make('small','',`${r.source==='alliance'?'Original Alliance list':'Affinity discovery'} · ${MARKET_CATEGORIES[r.category]}`),make('p','',r.categoryBasis));if(r.url&&/^https?:\/\//.test(r.url)){const a=make('a','','Source website');a.href=r.url;a.target='_blank';a.rel='noopener';n.append(a);}return n;}
 function showPlace(r){map.setView([r.lat,r.lng],Math.max(map.getZoom(),12));window.L.popup({maxWidth:230}).setLatLng([r.lat,r.lng]).setContent(popup(r)).openOn(map);}
 function list(){
  offset=Math.max(0,Math.min(offset,Math.max(0,Math.floor((found.length-1)/3)*3)));results.replaceChildren();
  for(const r of found.slice(offset,offset+3)){const b=button('',()=>showPlace(r));b.append(make('strong','',r.name),make('small','',`${r.source==='alliance'?'Alliance':'Affinity'} · ${r.place}`));results.append(b);}
  if(!found.length)results.append(make('p','','No matching places. Try All places or another name.'));
  count.textContent=found.length?`${offset+1}-${Math.min(offset+3,found.length)} of ${found.length.toLocaleString()}`:'0 places';back.disabled=offset===0;next.disabled=offset+3>=found.length;
 }
 function fitPlaces(){if(found.length)map.fitBounds(window.L.latLngBounds(found.map(r=>[r.lat,r.lng])),{padding:[24,24],maxZoom:13});}
 function refresh(){if(!data||!map)return;found=filterMarket(data.records,{category:category.value,source:source.value,query:search.value});offset=0;map.closePopup();layer.clearLayers();
  for(const r of found)window.L.circleMarker([r.lat,r.lng],{radius:5,color:r.source==='alliance'?'#8b570a':'#315b75',weight:1,fillColor:r.source==='alliance'?'#e6ae45':'#589bc0',fillOpacity:.8}).bindPopup(()=>popup(r),{maxWidth:230}).addTo(layer);
  status.textContent=`${found.length.toLocaleString()} places · gold: Alliance · blue: Affinity`;list();fitPlaces();
 }
 async function open(mode='Map'){
  const token=++opening;category.value=MARKET_PAGES[page.id];source.value='all';search.value='';dialog.showModal();
  try{const [L,loaded]=await Promise.all([loadMap(),data||fetch('assets/market-data.json?v=0.3.8').then(r=>{if(!r.ok)throw Error('Places could not load. Close and try again.');return r.json();})]);if(disposed||!dialog.open||token!==opening)return;data=loaded;
   if(!map){map=L.map(canvas,{preferCanvas:true,minZoom:0,maxZoom:19}).setView([-15,135],2);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);layer=L.layerGroup().addTo(map);}
   map.invalidateSize();sourcesInfo();refresh();if(mode!=='Map')search.focus();
  }catch(e){if(!disposed)status.textContent=e.message;}
 }
 category.onchange=source.onchange=refresh;let debounce;search.oninput=()=>{clearTimeout(debounce);debounce=setTimeout(refresh,180);};
 dialog.addEventListener('close',()=>{opening++;info.close();});
 const searches=page.controls.filter(c=>/^Search by (Map|Name|Service|Size)$/.test(c.properties.text||''));
 for(const c of searches){const node=screen.querySelector(`[data-source-control="${c.controlID}"]`),label=c.properties.text==='Search by Size'?'Browse places':c.properties.text,b=button(label,()=>open(c.properties.text.slice(10)));b.className='market-source-button';node.replaceChildren(b);}
 if(!searches.length){const b=button('Open market map',()=>open());b.className='market-launch';if(MARKET_PAGES[page.id]==='all'&&page.name==='Marketplace'){b.style.top='161px';b.style.left='101px';b.style.width='158px';}screen.append(b);}
 return {resize(){map?.invalidateSize();},dispose(){disposed=true;opening++;clearTimeout(debounce);map?.remove();dialog.remove();info.remove();}};
}
