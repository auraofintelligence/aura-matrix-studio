import {LIFE_PAGES} from './life-data.js?v=0.4.15';
import {navigationTree,treeSearch,layoutTree,TREE_ROOT} from './navigation-tree.js?v=0.4.15';
import {pageIcon} from './page-icons.js?v=0.4.15';
import {HOME,livePage,canonicalPage,CAMERA_VARIANTS,PAGE_ALIASES,PAGE_PARENTS} from './original-routes.js?v=0.4.15';
export const SITEMAP='E3222692-1B76-4EAF-9517-C5E94323947C';
const LABELS={'Aura Menu':'Main menu','QuickStart Aura':'QuickStart','We Are Family':'Family','Schedules':'Calendar','Public Life Goals':'Goals','Favorites Lists':'Favourites','Learning':'Skills & learning','Timelines':'Timing & signals','Private Wish Lists':'Hopes & wishes','Matrix Programmer':'Enter the matrix','System Preferences':'Settings','SiteMap':'Find your way'};
export const SECTIONS=[['daily','Everyday'],['people','People'],['aura','Aura'],['places','Places'],['tools','Tools'],['all','All']];
const SHORTCUTS=['We Are Family','Birthdays','Schedules','Reminders','Public Life Goals','Favorites Lists','Learning','Private Wish Lists','Avatar','Timelines','QuickStart Aura','Matrix Programmer'];
const ROOTS={people:['Social Web'],aura:['Chakras','Avatar','Matrix Programmer','Mind Palace'],places:['Travel Plans','Crown','Mind Palace','Nearby Opportunities','GAJRA.Earth','The Aura Affinity'],tools:['System Preferences','Tool Inventory']};
const SYMBOLS={'We Are Family':'♡','Birthdays':'🎂','Schedules':'▦','Reminders':'♧','Public Life Goals':'◎','Favorites Lists':'☆','Learning':'📚','Private Wish Lists':'✧','Avatar':'♙','Timelines':'◷','QuickStart Aura':'▷','Matrix Programmer':'◉'};
export function pageTitle(page){if(LIFE_PAGES[page.id])return LIFE_PAGES[page.id].title;const id=canonicalPage(page.id),live=livePage(id),name=page.name.replace(/ CK$/,'');if(['1D740128-8621-43EE-8D85-E81F0241A569','7E5774BE-BCC6-4684-8A88-0F8D2A26B1F0'].includes(page.parent))return name+' · '+(page.parent==='1D740128-8621-43EE-8D85-E81F0241A569'?'connect':'import');if(['Vision','Membership'].includes(name))return name+' · '+(page.parent==='2DB77618-AB8D-4FDA-84DF-032AEE78FF3E'?'GAJRA':'Affinity');return live?(live.shape==='flat'?'Finite map':['Red','Orange','Yellow','Green','Blue','Indigo','Violet'][live.shell]+' torus')+' · '+(live.face==='I'?'inside':'outside'):LABELS[name]||name;}
export function mapPages(pages,section='daily',query=''){
  const clean=pages.filter(p=>!CAMERA_VARIANTS[p.id]&&!PAGE_ALIASES[p.id]&&p.name!=='Page'),q=query.trim().toLowerCase();
  if(q)return clean.filter(p=>(pageTitle(p)+' '+p.name+(p.id===HOME?' camera background':'')).toLowerCase().includes(q));
  if(section==='daily')return SHORTCUTS.map(n=>clean.find(p=>p.name===n)).filter(Boolean);
  if(section==='all')return [...clean].sort((a,b)=>pageTitle(a).localeCompare(pageTitle(b)));
  const byId=new Map(pages.map(p=>[p.id,p]));return clean.filter(p=>{let current=p;const seen=new Set();while(current&&!seen.has(current.id)){seen.add(current.id);if(ROOTS[section]?.includes(current.name))return true;current=byId.get(PAGE_PARENTS[current.id]||current.parent);}return false;});
}
export function mountSiteMap({page,screen,pages,go}){
  const nodes=navigationTree([...pages.values()]),expanded=new Set([TREE_ROOT]);
  const colours=['#926d27','#7555a2','#ac3b68','#307c81','#486aa4','#518244','#b86c31'];
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
  for(const c of page.controls)screen.querySelector(`[data-source-control="${c.controlID}"]`)?.setAttribute('hidden','');
  const panel=make('section','site-tree-panel'),header=make('header'),back=button('‹',()=>go('command:back'));
  back.setAttribute('aria-label','Back');header.append(back,make('h1','','Site map'));
  const reset=button('⌂',()=>{expanded.clear();expanded.add(TREE_ROOT);search.value='';draw();viewport.scrollTo(0,0);});reset.setAttribute('aria-label','Reset tree to main branches');reset.title='Main branches';header.append(reset);
  const search=make('input','site-tree-search');search.type='search';search.placeholder='Find a page in the tree';search.setAttribute('aria-label',search.placeholder);
  const hint=make('p','site-tree-hint','Tap an icon to open. Tap + to unfold a branch.');
  const viewport=make('div','site-tree-viewport');viewport.tabIndex=0;viewport.setAttribute('aria-label','Connected page tree. Scroll across and down to explore.');
  const canvas=make('div','site-tree-canvas');viewport.append(canvas);
  const status=make('p','site-tree-status');status.setAttribute('role','status');panel.append(header,search,hint,viewport,status);screen.append(panel);
  function draw(focusId){
    const before=focusId&&canvas.querySelector(`[data-tree-id="${focusId}"]`),oldY=before?.offsetTop;
    const found=treeSearch(nodes,search.value,pageTitle),layout=layoutTree(nodes,expanded,found.visible);
    canvas.replaceChildren();canvas.style.width=layout.width+'px';canvas.style.height=layout.height+'px';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',layout.width);svg.setAttribute('height',layout.height);svg.setAttribute('aria-hidden','true');
    for(const {from,to}of layout.edges){const line=document.createElementNS(svg.namespaceURI,'path'),x=from.x+142,y=from.y+32;line.setAttribute('d',`M${x},${y} C${x+12},${y} ${to.x-14},${to.y+32} ${to.x},${to.y+32}`);line.setAttribute('stroke',colours[to.branch%colours.length]);svg.append(line);}canvas.append(svg);
    for(const position of layout.nodes){
      const node=nodes.get(position.id),title=node.page?pageTitle(node.page):'Aura',entry=make('div','site-tree-node');entry.dataset.treeId=node.id;entry.style.left=position.x+'px';entry.style.top=position.y+'px';entry.style.setProperty('--branch',colours[position.branch%colours.length]);
      if(found.matches.has(node.id))entry.classList.add('is-match');
      const link=make(node.page?'a':'div','site-tree-page');if(node.page){link.href='?page='+node.id;link.setAttribute('aria-label','Open '+title);link.onclick=e=>{e.preventDefault();go(node.id);};}
      const icon=pageIcon(node.page?.id||HOME);if(icon){const img=make('img');img.src='assets/mockplus/'+icon;img.alt='';img.draggable=false;link.append(img);}else link.append(make('span','site-tree-fallback',title.slice(0,1)));
      link.append(make('span','',title));entry.append(link);
      if(node.children.length){const open=found.visible?true:expanded.has(node.id),toggle=button(open?'−':'+',()=>{expanded.has(node.id)?expanded.delete(node.id):expanded.add(node.id);draw(node.id);});toggle.className='site-tree-expand';toggle.dataset.toggleId=node.id;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',(open?'Fold ':'Unfold ')+title+' branch');toggle.title=node.children.length+' pages in this branch';toggle.disabled=Boolean(found.visible);entry.append(toggle,make('small','site-tree-count',node.children.length+' pages'));}
      canvas.append(entry);
    }
    status.textContent=found.visible?(found.matches.size?`${found.matches.size} matching pages shown with their parent branches`:'No matching pages. Try another name.'):`${nodes.size-1} pages connected. Scroll across and down.`;
    if(focusId){const after=canvas.querySelector(`[data-tree-id="${focusId}"]`);if(after&&oldY!==undefined)viewport.scrollTop+=after.offsetTop-oldY;canvas.querySelector(`[data-toggle-id="${focusId}"]`)?.focus({preventScroll:true});}
  }
  search.oninput=()=>{draw();viewport.scrollTo(0,0);};draw();return {resize(){},dispose(){}};
}
