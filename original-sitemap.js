import {framePoint} from './frame-display.js?v=0.3.8';
import {pageIcon} from './page-icons.js?v=0.3.8';
import {HOME,livePage,canonicalPage,CAMERA_VARIANTS,PAGE_ALIASES,PAGE_PARENTS} from './original-routes.js?v=0.3.8';
export const SITEMAP='E3222692-1B76-4EAF-9517-C5E94323947C';
const LABELS={'Aura Menu':'Main menu','QuickStart Aura':'QuickStart','We Are Family':'Family','Schedules':'Calendar','Public Life Goals':'Goals','Favorites Lists':'Favourites','Learning':'Skills & learning','Timelines':'Timing & signals','Private Wish Lists':'Hopes & wishes','Matrix Programmer':'Enter the matrix','System Preferences':'Settings','SiteMap':'Find your way'};
export const SECTIONS=[['daily','Everyday'],['people','People'],['aura','Aura'],['places','Places'],['tools','Tools'],['all','All']];
const SHORTCUTS=['We Are Family','Birthdays','Schedules','Reminders','Public Life Goals','Favorites Lists','Learning','Private Wish Lists','Avatar','Timelines','QuickStart Aura','Matrix Programmer'];
const ROOTS={people:['Social Web'],aura:['Chakras','Avatar','Matrix Programmer','Mind Palace'],places:['Travel Plans','Crown','Mind Palace','Nearby Opportunities','GAJRA.Earth','The Aura Affinity'],tools:['System Preferences','Tool Inventory']};
const SYMBOLS={'We Are Family':'♡','Birthdays':'🎂','Schedules':'▦','Reminders':'♧','Public Life Goals':'◎','Favorites Lists':'☆','Learning':'📚','Private Wish Lists':'✧','Avatar':'♙','Timelines':'◷','QuickStart Aura':'▷','Matrix Programmer':'◉'};
export function pageTitle(page){const id=canonicalPage(page.id),live=livePage(id),name=page.name.replace(/ CK$/,'');if(['1D740128-8621-43EE-8D85-E81F0241A569','7E5774BE-BCC6-4684-8A88-0F8D2A26B1F0'].includes(page.parent))return name+' · '+(page.parent==='1D740128-8621-43EE-8D85-E81F0241A569'?'connect':'import');if(['Vision','Membership'].includes(name))return name+' · '+(page.parent==='2DB77618-AB8D-4FDA-84DF-032AEE78FF3E'?'GAJRA':'Affinity');return live?(live.shape==='flat'?'Finite map':['Red','Orange','Yellow','Green','Blue','Indigo','Violet'][live.shell]+' torus')+' · '+(live.face==='I'?'inside':'outside'):LABELS[name]||name;}
export function mapPages(pages,section='daily',query=''){
  const clean=pages.filter(p=>!CAMERA_VARIANTS[p.id]&&!PAGE_ALIASES[p.id]&&p.name!=='Page'),q=query.trim().toLowerCase();
  if(q)return clean.filter(p=>(pageTitle(p)+' '+p.name+(p.id===HOME?' camera background':'')).toLowerCase().includes(q));
  if(section==='daily')return SHORTCUTS.map(n=>clean.find(p=>p.name===n)).filter(Boolean);
  if(section==='all')return [...clean].sort((a,b)=>pageTitle(a).localeCompare(pageTitle(b)));
  const byId=new Map(pages.map(p=>[p.id,p]));return clean.filter(p=>{let current=p;const seen=new Set();while(current&&!seen.has(current.id)){seen.add(current.id);if(ROOTS[section]?.includes(current.name))return true;current=byId.get(PAGE_PARENTS[current.id]||current.parent);}return false;});
}
export function mountSiteMap({page,screen,pages,go,previewMode=false}){
  const all=[...pages.values()];let section='daily',query='',offset=0,selected=all.find(p=>p.name==='We Are Family')||pages.get(HOME);
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
  for(const c of page.controls)if(c.controlTypeID!=='StatusBar(Android)'&&!(c.links.length&&+c.y>=560))screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;
  const heading=make('h1','wayfinder-heading','Find your way');screen.append(heading);
  const map=make('section','wayfinder');map.setAttribute('aria-label','Aura destinations');
  const search=make('input','wayfinder-search');search.type='search';search.placeholder='Family, birthdays, goals…';search.setAttribute('aria-label','Find something in Aura');
  const tabs=make('nav','wayfinder-tabs');tabs.setAttribute('aria-label','Destination categories');
  const list=make('div','wayfinder-destinations'),paging=make('div','wayfinder-paging');map.append(search,tabs,list,paging);screen.append(map);
  const preview=make('section','wayfinder-preview');preview.setAttribute('aria-label','Page preview');
  const caption=make('div','wayfinder-preview-title'),frame=make('div','wayfinder-preview-frame'),open=button('Open',()=>go(selected.id)),previous=button('‹',()=>cycle(-1)),next=button('›',()=>cycle(1));previous.setAttribute('aria-label','Previous preview');next.setAttribute('aria-label','Next preview');preview.append(caption,frame,previous,next,open);screen.append(preview);
  function showPreview(direction=0){
    caption.textContent=pageTitle(selected);open.textContent='Open '+pageTitle(selected);frame.replaceChildren();
    if(!previewMode){const iframe=make('iframe');iframe.title='Preview of '+pageTitle(selected);iframe.tabIndex=-1;iframe.inert=true;iframe.setAttribute('aria-hidden','true');iframe.src='?'+new URLSearchParams({page:selected.id,preview:'1'});iframe.style.width=selected.width+'px';iframe.style.height=selected.height+'px';const scale=Math.min(252/selected.width,126/selected.height);iframe.style.transform=`scale(${scale})`;iframe.style.left=(252-selected.width*scale)/2+'px';iframe.style.top=(126-selected.height*scale)/2+'px';frame.append(iframe);}else frame.append(make('span','',pageTitle(selected)));
    if(direction&&!matchMedia('(prefers-reduced-motion: reduce)').matches)frame.animate([{transform:`perspective(600px) rotateY(${direction*60}deg)`,opacity:.4},{transform:'perspective(600px) rotateY(0deg)',opacity:1}],{duration:450});
  }
  function cycle(delta){const found=mapPages(all,section,query);if(!found.length)return;const i=found.findIndex(p=>p.id===selected.id);selected=found[i<0?(delta>0?0:found.length-1):(i+delta+found.length)%found.length];offset=Math.floor(found.indexOf(selected)/12)*12;draw();showPreview(delta);}
  let start=null;frame.addEventListener('pointerdown',e=>{start={...framePoint(screen,e)};frame.setPointerCapture(e.pointerId);});frame.addEventListener('pointerup',e=>{if(start&&Math.abs(framePoint(screen,e).x-start.x)>35&&Math.abs(framePoint(screen,e).x-start.x)>Math.abs(framePoint(screen,e).y-start.y))cycle(framePoint(screen,e).x<start.x?1:-1);start=null;});frame.addEventListener('pointercancel',()=>start=null);
  function draw(){
    const found=mapPages(all,section,query);offset=Math.max(0,Math.min(offset,Math.max(0,Math.floor((found.length-1)/12)*12)));
    tabs.replaceChildren();for(const [id,label]of SECTIONS){const tab=button(label,()=>{section=id;query='';search.value='';offset=0;draw();});tab.setAttribute('aria-pressed',String(!query&&section===id));tabs.append(tab);}
    list.replaceChildren();for(const p of found.slice(offset,offset+12)){
      const item=make('div','wayfinder-item'),link=make('a','wayfinder-open');link.href='?page='+p.id;link.setAttribute('aria-label','Open '+pageTitle(p));link.onclick=e=>{e.preventDefault();go(p.id);};
      const icon=make('span','wayfinder-icon');const asset=pageIcon(p.id);if(asset){const image=make('img');image.src='assets/mockplus/'+asset;image.alt='';icon.append(image);}else icon.textContent=SYMBOLS[p.name]||'◇';link.append(icon,make('span','wayfinder-label',pageTitle(p)));
      const peek=button('⌕',()=>{selected=p;showPreview();});peek.className='wayfinder-peek';peek.title='Preview '+pageTitle(p);peek.setAttribute('aria-label','Preview '+pageTitle(p));item.append(link,peek);list.append(item);
    }
    if(!found.length)list.append(make('p','wayfinder-empty','No match. Try a name such as family, calendar or goals.'));
    paging.replaceChildren();const prev=button('‹',()=>{offset-=12;draw();}),next=button('›',()=>{offset+=12;draw();});prev.disabled=offset===0;next.disabled=offset+12>=found.length;prev.setAttribute('aria-label','Previous destinations');next.setAttribute('aria-label','More destinations');paging.append(prev,make('span','',found.length>12?`${offset+1}-${Math.min(offset+12,found.length)} of ${found.length}`:'Tap an icon to open · ⌕ to preview'),next);
  }
  search.oninput=()=>{query=search.value;offset=0;draw();};draw();showPreview();return {resize(){},dispose(){frame.replaceChildren();}};
}
