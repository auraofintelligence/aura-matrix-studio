import {HOME,livePage} from './original-routes.js?v=0.3.2';
export const SITEMAP='E3222692-1B76-4EAF-9517-C5E94323947C';
export function pageTitle(page){const live=livePage(page.id);return live?(live.shape==='flat'?'Finite map':['Red','Orange','Yellow','Green','Blue','Indigo','Violet'][live.shell]+' torus')+(['I','O'].includes(live.face)?' · '+(live.face==='I'?'inside':'outside'):''):page.name;}
export function mapPages(pages,parent='',query=''){
  const ids=new Set(pages.map(p=>p.id)),q=query.trim().toLowerCase();
  return pages.filter(p=>q?pageTitle(p).toLowerCase().includes(q):parent?p.parent===parent:!p.parent||!ids.has(p.parent));
}
export function mountSiteMap({page,screen,pages,go,previewMode=false}){
  const all=[...pages.values()];let parent='',query='',offset=0,selected=pages.get(HOME),textSize=14;
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
  for(const c of page.controls)if(c.controlTypeID!=='StatusBar(Android)'&&!(c.links.length&&+c.y>=560)&&c.properties.text!=='Site Map')screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;
  const map=make('section','site-map-browser');map.setAttribute('aria-label','Browse Aura pages');
  const search=make('input','site-map-search');search.type='search';search.placeholder='Find a page';search.setAttribute('aria-label','Find a page');
  const path=make('div','site-map-path'),list=make('div','site-map-list'),paging=make('div','site-map-paging');map.append(search,path,list,paging);screen.append(map);
  const zoom=make('div','site-map-zoom');zoom.append(button('A−',()=>{textSize=Math.max(12,textSize-2);draw();}),make('span','','Text size'),button('A+',()=>{textSize=Math.min(20,textSize+2);draw();}));zoom.firstChild.title='Smaller page names';zoom.lastChild.title='Larger page names';screen.append(zoom);
  const preview=make('section','site-map-preview');preview.setAttribute('aria-label','Selected page preview');
  const caption=make('div','site-map-preview-title'),frame=make('div','site-map-preview-frame'),open=button('Open page',()=>go(selected.id)),previous=button('‹',()=>cycle(-1)),next=button('›',()=>cycle(1));previous.setAttribute('aria-label','Previous page preview');next.setAttribute('aria-label','Next page preview');
  preview.append(caption,frame,previous,next,open);screen.append(preview);let start=null;
  frame.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};frame.setPointerCapture(e.pointerId);});frame.addEventListener('pointerup',e=>{if(start&&Math.abs(e.clientX-start.x)>35&&Math.abs(e.clientX-start.x)>Math.abs(e.clientY-start.y))cycle(e.clientX<start.x?1:-1);start=null;});frame.addEventListener('pointercancel',()=>start=null);
  function cycle(delta){const found=mapPages(all,parent,query);if(!found.length)return;const i=found.findIndex(p=>p.id===selected.id);selected=found[i<0?(delta>0?0:found.length-1):(i+delta+found.length)%found.length];offset=Math.floor(found.indexOf(selected)/5)*5;draw();showPreview(delta);}
  function showPreview(direction=0){
    caption.textContent=pageTitle(selected);open.textContent='Open '+pageTitle(selected);frame.replaceChildren();
    if(!previewMode){const iframe=make('iframe');iframe.title='Preview of '+pageTitle(selected);iframe.tabIndex=-1;iframe.inert=true;iframe.setAttribute('aria-hidden','true');iframe.src='?'+new URLSearchParams({page:selected.id,preview:'1'});iframe.style.width=selected.width+'px';iframe.style.height=selected.height+'px';const scale=Math.min(238/selected.width,126/selected.height);iframe.style.transform=`scale(${scale})`;iframe.style.left=(238-selected.width*scale)/2+'px';iframe.style.top=(126-selected.height*scale)/2+'px';frame.append(iframe);}
    else frame.append(make('span','',pageTitle(selected)));
    if(direction&&!matchMedia('(prefers-reduced-motion: reduce)').matches)frame.animate([{transform:`perspective(600px) rotateY(${direction*65}deg)`,opacity:.4},{transform:'perspective(600px) rotateY(0deg)',opacity:1}],{duration:450});
  }
  function draw(){
    const found=mapPages(all,parent,query);offset=Math.max(0,Math.min(offset,Math.max(0,Math.floor((found.length-1)/5)*5)));
    path.replaceChildren();const up=button('↑',()=>{parent=pages.get(parent)?.parent||'';query='';search.value='';offset=0;draw();});up.disabled=!parent&&!query;up.setAttribute('aria-label','Up one section');path.append(up,make('span','',query?'Search results':parent?pageTitle(pages.get(parent)):'Aura sections'));
    list.replaceChildren();list.style.fontSize=textSize+'px';
    for(const p of found.slice(offset,offset+5)){const row=make('div','site-map-row'),pick=button(pageTitle(p),()=>{selected=p;draw();showPreview();});pick.setAttribute('aria-pressed',String(selected.id===p.id));row.append(pick);const children=all.filter(c=>c.parent===p.id);if(children.length){const branch=button('›',()=>{parent=p.id;query='';search.value='';offset=0;draw();});branch.setAttribute('aria-label','Browse '+pageTitle(p)+' subpages');row.append(branch);}list.append(row);}
    if(!found.length)list.append(make('p','','No matching pages.'));
    paging.replaceChildren();const prev=button('←',()=>{offset-=5;draw();}),next=button('→',()=>{offset+=5;draw();});prev.disabled=offset===0;next.disabled=offset+5>=found.length;prev.setAttribute('aria-label','Previous page names');next.setAttribute('aria-label','Next page names');paging.append(prev,make('span','',found.length?`${offset+1}-${Math.min(offset+5,found.length)} of ${found.length}`:'0 pages'),next);
  }
  search.oninput=()=>{query=search.value;offset=0;draw();};draw();showPreview();
  return {resize(){},dispose(){frame.replaceChildren();}};
}
