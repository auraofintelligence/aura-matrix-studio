import {blankProject,validateProject} from './core.js?v=0.3.3';
import {updateFavourite} from './favourites-data.js?v=0.3.3';
import {canonicalPage} from './original-routes.js?v=0.3.3';
import {mapPages,pageTitle} from './original-sitemap.js?v=0.3.3';
export const FAVOURITES='B47A9839-38E6-49D8-B255-0D9E428E521C';
const KEY='aura-matrix-studio:v4:project';
export function mountFavourites({page,screen,pages,go}){
 const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
 const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
 const all=[...pages.values()],icons=new Map(),pageIcons=new Map(),iconScores=new Map();
 function collect(cs,owner){for(const c of cs){if(c.properties.URL&&+c.w<=200&&+c.h<=200){const file=c.properties.URL,label=c.links[0]?.title||pageTitle(owner);if(!icons.has(file))icons.set(file,label);for(const link of c.links){const id=canonicalPage(link.target);const score=c.controlTypeID==='Image'?2:1;if(pages.has(id)&&score>(iconScores.get(id)||0)){pageIcons.set(id,file);iconScores.set(id,score);}}}collect(c.children,owner);}}all.forEach(p=>collect(p.controls,p));
 let project,editing=false,slotIndex=0,menuId='',chosenPage='',chosenIcon='',stage='pages',query='',resultPage=0,disposed=false;
 function read(){const raw=[KEY,'aura-matrix-studio:v3:project','aura-matrix-studio:v2:project','aura-matrix-studio:v1:project'].map(k=>localStorage.getItem(k)).find(Boolean);project=raw?validateProject(JSON.parse(raw)):blankProject();}
 function change(fn){read();const next=validateProject(fn(structuredClone(project)));localStorage.setItem(KEY,JSON.stringify(next));project=next;draw();}
 const active=()=>project.favourites.menus.find(m=>m.id===project.favourites.activeId);
 read();const sourceSlots=page.controls.filter(c=>c.controlTypeID==='Icon'&&!c.properties.URL&&+c.w===24&&+c.h===24).sort((a,b)=>+a.y-+b.y||+a.x-+b.x);
 if(sourceSlots.length!==25)throw Error('The original favourite slots could not be located.');
 for(const c of page.controls)if(sourceSlots.includes(c)||+c.y===20&&c.controlTypeID==='Icon'||c.controlTypeID==='Image'&&+c.y===426||c.controlTypeID==='Label'&&+c.y===56)screen.querySelector(`[data-source-control="${c.controlID}"]`).hidden=true;
 const title=make('div','favourites-title','Favourite pages'),edit=button('Edit',()=>{editing=!editing;draw();});edit.className='favourites-edit';screen.append(title,edit);
 const hint=make('p','favourites-hint');screen.append(hint);
 const slotButtons=sourceSlots.map((c,i)=>{const b=button('',()=>{read();const slot=active().slots[i];if(slot&&!editing&&pages.has(slot.pageId))go(slot.pageId);else openSlot(i);});b.className='favourite-slot';Object.assign(b.style,{left:(+c.x-10)+'px',top:(+c.y-10)+'px'});screen.append(b);return b;});
 const menuBook=button('',()=>openMenu(false));menuBook.className='favourite-menu-book';menuBook.title='Rename this menu or create another';const prev=button('‹',()=>cycle(-1)),next=button('›',()=>cycle(1));prev.className='favourite-menu-prev';next.className='favourite-menu-next';prev.setAttribute('aria-label','Previous favourite menu');next.setAttribute('aria-label','Next favourite menu');screen.append(menuBook,prev,next);
 const dialog=make('dialog','favourite-dialog'),head=make('header'),heading=make('h2'),close=button('Done',()=>dialog.close()),body=make('div','favourite-dialog-body'),status=make('p','favourite-status');status.setAttribute('role','status');head.append(heading,close);dialog.append(head,body,status);document.body.append(dialog);
 const safe=fn=>{try{fn();}catch(e){status.textContent=e.message;}};
 const image=(file,alt='')=>{const img=make('img');img.src='assets/mockplus/'+file;img.alt=alt;return img;};
 function draw(){
  const menu=active();title.textContent=menu.name;edit.textContent=editing?'Done':'Edit';edit.setAttribute('aria-pressed',String(editing));hint.textContent=editing?'Tap an icon to replace, move or clear it.':'Tap a square to add a favourite.';
  slotButtons.forEach((b,i)=>{const slot=menu.slots[i],target=slot&&pages.get(slot.pageId);b.replaceChildren();b.classList.toggle('is-filled',!!target);b.classList.toggle('is-editing',editing);b.title=target?pageTitle(target):'Add favourite '+(i+1);b.setAttribute('aria-label',(target?(editing?'Edit ':'Open ')+pageTitle(target):'Add favourite')+' · slot '+(i+1));if(target){const file=slot.icon||pageIcons.get(slot.pageId);if(file)b.append(image(file));else b.append(make('span','',pageTitle(target).slice(0,1)));b.append(make('small','',pageTitle(target)));}else b.append(make('span','empty-favourite'));});
  menuBook.replaceChildren(make('strong','',menu.name));const mini=make('span','favourite-mini');menu.slots.forEach(slot=>{const dot=make('span');if(slot){const file=slot.icon||pageIcons.get(slot.pageId);if(file)dot.append(image(file));else dot.textContent='•';}mini.append(dot);});menuBook.append(mini,make('small','','Tap to edit menus'));menuBook.setAttribute('aria-label','Edit favourite menu '+menu.name);prev.disabled=next.disabled=project.favourites.menus.length<2;
 }
 function cycle(delta){safe(()=>{change(p=>{const menus=p.favourites.menus,i=menus.findIndex(m=>m.id===p.favourites.activeId);p.favourites.activeId=menus[(i+delta+menus.length)%menus.length].id;return p;});if(!matchMedia('(prefers-reduced-motion: reduce)').matches)menuBook.animate([{transform:`perspective(600px) rotateY(${delta*70}deg)`},{transform:'perspective(600px) rotateY(0deg)'}],{duration:450});});}
 function openSlot(i){safe(()=>{read();slotIndex=i;menuId=active().id;const slot=active().slots[i];chosenPage=slot?.pageId||'';chosenIcon=slot?.icon||'';stage=chosenPage?'details':'pages';query='';resultPage=0;renderPicker();dialog.showModal();});}
 function field(label,n){const l=make('label');l.append(make('span','',label),n);return l;}
 function renderPicker(){
  heading.textContent='Favourite '+(slotIndex+1);body.replaceChildren();status.textContent='';
  if(stage==='details'){
   const target=pages.get(chosenPage);if(!target){stage='pages';renderPicker();return;}
   const summary=make('div','favourite-choice');if(chosenIcon)summary.append(image(chosenIcon));summary.append(make('strong','',pageTitle(target)));body.append(summary);
   const actions=make('div','favourite-actions');actions.append(button('Change page',()=>{stage='pages';query='';resultPage=0;renderPicker();}),button('Choose icon',()=>{stage='icons';query='';resultPage=0;renderPicker();}));body.append(actions);
   const destination=make('select');destination.setAttribute('aria-label','Position');for(let i=0;i<25;i++){const o=make('option','',`Row ${Math.floor(i/5)+1}, position ${i%5+1}`);o.value=i;destination.append(o);}destination.value=slotIndex;body.append(field('Position (occupied slots swap)',destination));
   body.append(button('Save favourite',()=>safe(()=>{if(chosenIcon&&!icons.has(chosenIcon))throw Error('Choose an icon from the app.');change(p=>{p.favourites=updateFavourite(p.favourites,menuId,slotIndex,{pageId:chosenPage,icon:chosenIcon},+destination.value);return p;});dialog.close();})),button('Clear this slot',()=>safe(()=>{change(p=>{p.favourites=updateFavourite(p.favourites,menuId,slotIndex,null);return p;});dialog.close();})));return;
  }
  const search=make('input');search.type='search';search.placeholder=stage==='icons'?'Find an icon':'Find a page';search.setAttribute('aria-label',search.placeholder);search.value=query;body.append(search);
  const grid=make('div',stage==='icons'?'favourite-icon-picker':'favourite-page-picker'),pager=make('div','favourite-actions');body.append(grid,pager);
  function results(){grid.replaceChildren();pager.replaceChildren();const items=stage==='icons'?[...icons].filter(([file,label])=>label.toLowerCase().includes(query.toLowerCase())):mapPages(all,'all',query).map(p=>[p.id,pageTitle(p)]),size=stage==='icons'?12:6;resultPage=Math.min(resultPage,Math.max(0,Math.ceil(items.length/size)-1));
   for(const [id,label]of items.slice(resultPage*size,resultPage*size+size)){const b=button('',()=>{if(stage==='icons')chosenIcon=id;else{chosenPage=id;chosenIcon=pageIcons.get(id)||'';}stage='details';renderPicker();});b.setAttribute('aria-label',(stage==='icons'?'Use icon ':'Choose ')+label);const file=stage==='icons'?id:pageIcons.get(id);if(file)b.append(image(file));b.append(make('span','',label));grid.append(b);}
   if(!items.length)grid.append(make('p','','No matches.'));const back=button('←',()=>{resultPage--;results();}),forward=button('→',()=>{resultPage++;results();});back.disabled=resultPage===0;forward.disabled=(resultPage+1)*size>=items.length;back.setAttribute('aria-label','Previous choices');forward.setAttribute('aria-label','More choices');pager.append(back,make('span','',`${resultPage+1} / ${Math.max(1,Math.ceil(items.length/size))}`),forward);}
  search.oninput=()=>{query=search.value;resultPage=0;results();};results();if(chosenPage)body.append(button('Back to favourite',()=>{stage='details';renderPicker();}));
 }
 function openMenu(isNew){safe(()=>{read();menuId=active().id;heading.textContent=isNew?'New shortcut menu':'Your shortcut menus';body.replaceChildren();status.textContent='';const name=make('input');name.value=isNew?'':active().name;name.maxLength=80;name.setAttribute('aria-label','Menu name');body.append(field('Menu name',name),button(isNew?'Create menu':'Save name',()=>safe(()=>{if(!name.value.trim())throw Error('Enter a menu name.');change(p=>{if(isNew){const id=crypto.randomUUID();p.favourites.menus.push({id,name:name.value.trim(),slots:Array(25).fill(null)});p.favourites.activeId=id;}else p.favourites.menus.find(m=>m.id===menuId).name=name.value.trim();return p;});dialog.close();})));if(!isNew)body.append(button('New menu',()=>openMenu(true)));if(!dialog.open)dialog.showModal();});}
 dialog.addEventListener('close',()=>{if(!disposed)safe(()=>{read();draw();});});draw();return {resize(){},dispose(){disposed=true;dialog.remove();}};
}
