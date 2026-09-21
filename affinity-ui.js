import {MARKET_PAGES,MARKET_CATEGORIES,filterMarket,mountMarket} from './market-map.js?v=0.4.15';
import {pageIcon} from './page-icons.js?v=0.4.17';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.17';
import {validateProject} from './core.js?v=0.4.17';
export const AFFINITY_HOME='6421758D-777D-4139-8ECE-4183D8677670';
const VISION='8FB85C5E-2F15-442C-943C-21EC70C4B06A',SEARCH='9BF63D63-6482-4050-8630-8D632BB10DDF',RESULTS='C62804F4-68A6-4814-AA4E-CA454CE9CF91',MARKET='9635446B-1F60-4AF2-A62C-E40C90E1806E',LEDGER='B3D6AB82-6839-4427-9C86-6AD29EF7476B',MEMBER='C23C161A-2089-4A2C-AE70-B932874E955D';
export const AFFINITY_PAGES=new Set([AFFINITY_HOME,VISION,SEARCH,RESULTS,LEDGER,MEMBER,...Object.keys(MARKET_PAGES)]);
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn)=>{const b=make('button','',text);b.type='button';b.onclick=fn;return b;};
const descriptions={Vision:'The purpose behind Aura Affinity',Search:'Find people, places and services',Marketplace:'Explore the five original market areas',BlockChain:'Public ledger concepts and local drafts',Membership:'Joining, benefits and responsibilities',
 'Aura Accommodation':'Places to stay and feel at home','Aura Creative Industries':'Art, design and creative work','Aura Event Management':'Gatherings, events and shared experiences','Aura of Health and Wellbeing':'Health, care and wellbeing','Aura Cities and Developments':'Places, spaces and communities',
 'Search by Map':'Explore the places in this category','Search by Name':'Find a particular organisation or place','Search by Service':'Browse services in this area','Search by Size':'Browse developments; size data is not yet available',
 'Joining Process':'Prepare your interests and questions','Member Benefits':'Describe the support you are looking for','Social Responsibility':'Record how you would like to contribute','Review Upgrade Options':'Keep your needs and questions together','Career Opportunities':'Record your skills and opportunities of interest','Tap New Opportunities':'Collect possibilities you would like to explore',
 'Create New Transaction':'Prepare a local draft','View Pending Transaction':'Review your saved drafts','View Passed Transactions':'Public ledger connection is not available','Public Ledger Tutorial':'Understand the proposed record flow'};
const glyphs={Vision:'◉',Search:'⌕',Marketplace:'▦',BlockChain:'⛓',Membership:'♡','Search by Map':'◎','Search by Name':'⌕','Search by Service':'✧','Search by Size':'↔','Joining Process':'+','Member Benefits':'☆','Social Responsibility':'♡','Review Upgrade Options':'↑','Career Opportunities':'↗','Tap New Opportunities':'✧','Create New Transaction':'+','View Pending Transaction':'◷','View Passed Transactions':'✓','Public Ledger Tutorial':'▤'};
export function saveAffinityNote(project,pageId,topic,fields){
 if(!AFFINITY_PAGES.has(pageId))throw Error('Unknown Affinity section.');
 const p=structuredClone(project);let t=p.tables.find(t=>t.id==='affinity-notes');
 if(!t){t={id:'affinity-notes',name:'Aura Affinity plans and questions',category:'people',recommendation:'community',chakraTags:[2,3,4],columns:['Title','Section','Topic','Interest','Contribution','Questions','Next action','Status'],rows:[]};p.tables.push(t);}
 const id=pageId+':'+topic;let r=t.rows.find(r=>r.id===id);if(!r){r={id,values:t.columns.map(()=> '')};t.rows.push(r);}
 const values={Title:topic,Section:pageId,Topic:topic,...fields,Status:'Draft'};
 for(const [key,value]of Object.entries(values)){if(!t.columns.includes(key))throw Error('Unknown note field.');r.values[t.columns.indexOf(key)]=String(value||'');}
 return validateProject(p);
}
export function mountAffinity({page,screen,go}){
 for(const c of screen.children)c.hidden=true;
 const panel=make('section','affinity-panel');screen.append(panel);let mapTools=null,disposed=false,data=null,query='',category=MARKET_PAGES[page.id]||'all',offset=0;
 const art=file=>{const img=make('img');img.src='assets/mockplus/'+file;img.alt='';return img;};
 function head(title,back=()=>go('command:back')){panel.replaceChildren();const h=make('header','affinity-header'),b=button('‹',back);b.setAttribute('aria-label','Back');h.append(b,make('h1','',title));panel.append(h);}
 function hero(title,subtitle,file=pageIcon(page.id)){const h=make('div','affinity-hero');if(file)h.append(art(file));const copy=make('div');copy.append(make('strong','',title),make('p','',subtitle));h.append(copy);panel.append(h);}
 function card(label,subtitle,fn,file=null){const b=button('',fn);b.className='affinity-card';b.append(file?art(file):make('span','affinity-symbol',glyphs[label]||'✧'));const c=make('span');c.append(make('strong','',label),make('small','',subtitle));b.append(c,make('span','affinity-chevron','›'));return b;}
 function map(filters={}){if(!mapTools)mapTools=mountMarket({page,screen,headless:true});mapTools.open('Map',{category,...filters});}
 function footer(){const f=make('footer','affinity-footer');if(page.id!==AFFINITY_HOME)f.append(button('Aura Affinity',()=>go(AFFINITY_HOME)));f.append(button('QuickStart',()=>go('D203ACAB-C2D1-4433-8EE2-3522C47CC3D0')));panel.append(f);}
 function home(){
  if([SEARCH,RESULTS].includes(page.id)){search();return;}
  const title=page.id===AFFINITY_HOME?'Aura Affinity':page.id===VISION?'Our vision':page.id===LEDGER?'Public ledger':page.name;
  head(title);const image=page.controls.find(c=>c.controlTypeID==='Image'&&!c.links.length)?.properties.URL;
  hero(page.id===AFFINITY_HOME?'An Internet of Good Things':page.id===MARKET?'Explore the marketplace':title,page.id===AFFINITY_HOME?'Members, customers, partners and supporters.':page.id===MARKET?'Choose an area, then search within it.':page.id===MEMBER?'Explore participation and keep your own plans.':page.id===LEDGER?'A proposed ledger. No blockchain or transaction service is connected.':'Explore the original Aura Affinity pathways.',image);
  if(page.id===VISION){const mission=page.controls.find(c=>c.controlTypeID==='TextArea')?.properties.text||'';panel.append(make('blockquote','affinity-mission',mission));const roles=make('div','affinity-roles');for(const word of ['Members','Customers','Partners','Supporters'])roles.append(make('span','',word));panel.append(roles,card('Search','Explore discovery listings',()=>go(SEARCH),pageIcon(SEARCH)),card('Membership','Explore ways to participate',()=>go(MEMBER),pageIcon(MEMBER)));footer();return;}
  const menu=make('nav','affinity-menu');for(const c of page.controls.filter(c=>c.controlTypeID==='Button').sort((a,b)=>+a.y-+b.y)){const label=c.properties.text,link=c.links[0];menu.append(card(label,descriptions[label]||'Explore this part of Aura Affinity',()=>link?go(link.target):action(label),link?pageIcon(link.target):null));}if(page.id===MARKET)menu.append(card('Merch','Aura merchandise · Coming later',()=>go('aura-merch-store'),'aura-merch.svg'));panel.append(menu);footer();
 }
 function action(label){
  if(label==='Search by Map'){map();return;}
  if(/^Search by /.test(label)){query='';offset=0;search();return;}
  if(label==='View Pending Transaction'){notesList();return;}
  if(label==='View Passed Transactions'||label==='Public Ledger Tutorial'){
   head(label,home);hero('Proposed public ledger',label==='View Passed Transactions'?'There are no confirmed transactions to show.':'Draft → review → connected service → confirmed record');panel.append(make('p','affinity-copy','Aura currently stores local planning notes only. A public ledger would need a connected service and a confirmed submission. Saving a draft here does not send or sign a transaction.'));footer();return;
  }
  note(label);
 }
 function note(topic){
  head(topic,home);hero(topic,descriptions[topic]||'Keep a local plan.');const saved=readTravelProject().tables.find(t=>t.id==='affinity-notes'),row=saved?.rows.find(r=>r.id===page.id+':'+topic),values=row?Object.fromEntries(saved.columns.map((c,i)=>[c,row.values[i]])):{};
  const form=make('form','affinity-note'),message=make('p','affinity-small');message.setAttribute('role','status');
  for(const [key,label]of [['Interest',topic==='Create New Transaction'?'What would this proposed exchange record?':'What interests you?'],['Contribution','Skills, resources or contribution'],['Questions','Questions or details to clarify'],['Next action','Your next step']]){const wrap=make('label','',label),input=make(key==='Questions'?'textarea':'input');input.value=values[key]||'';input.setAttribute('aria-label',label);input.oninput=()=>values[key]=input.value;wrap.append(input);form.append(wrap);}
  const save=make('button','affinity-primary','Save my notes');save.type='submit';form.append(save);form.onsubmit=e=>{e.preventDefault();try{writeTravelProject(p=>saveAffinityNote(p,page.id,topic,Object.fromEntries(['Interest','Contribution','Questions','Next action'].map(k=>[k,values[k]||'']))));message.textContent='Saved in your Aura community table.';}catch(e){message.textContent=e.message;}};
  panel.append(form,message,make('p','affinity-small','Private notes in this browser. This does not join a membership, apply for a role, buy an upgrade or submit a transaction.'));
 }
 function notesList(){head('Local ledger drafts',home);const t=readTravelProject().tables.find(t=>t.id==='affinity-notes'),rows=t?.rows.filter(r=>r.values[t.columns.indexOf('Section')]===page.id)||[];const list=make('div','affinity-menu');for(const r of rows){const topic=r.values[t.columns.indexOf('Topic')];list.append(card(topic,'Local draft',()=>note(topic)));}if(!rows.length)list.append(make('p','affinity-copy','No local drafts yet. Start with Create New Transaction to record an idea.'));panel.append(list);footer();}
 async function search(){
  head('Search Aura Affinity',()=>[SEARCH,RESULTS].includes(page.id)?go(AFFINITY_HOME):home());hero('Places & connections','Discovery listings, not confirmed members.',pageIcon(SEARCH));const filters=make('div','affinity-filters'),input=make('input');input.type='search';input.placeholder='Find a name, place or service';input.setAttribute('aria-label',input.placeholder);input.value=query;
  const select=make('select');select.setAttribute('aria-label','Category');for(const [key,label]of Object.entries(MARKET_CATEGORIES)){const o=make('option','',label);o.value=key;select.append(o);}select.value=category;filters.append(input,select);panel.append(filters);const status=make('p','affinity-small','Loading discovery listings…');status.setAttribute('role','status');const results=make('div','affinity-results');results.tabIndex=0;results.setAttribute('aria-label','Discovery listings. Scroll to browse.');panel.append(status,results);footer();
  let found=[],loaded=0;
  function more(){for(const r of found.slice(loaded,loaded+40)){const b=card(r.name,r.place,()=>detail(r));b.querySelector('.affinity-symbol').textContent=r.source==='alliance'?'◉':'✧';results.append(b);}loaded=Math.min(loaded+40,found.length);}
  results.onscroll=()=>{if(results.scrollTop+results.clientHeight>=results.scrollHeight-120)more();};
  function draw(){if(!data)return;found=filterMarket(data.records,{category,query});loaded=0;results.replaceChildren();results.scrollTop=0;more();if(!found.length)results.append(make('p','affinity-copy','No matches. Try another name or category.'));status.textContent=`${found.length.toLocaleString()} discovery listings · scroll to browse`;}
  input.oninput=()=>{query=input.value;offset=0;draw();};select.onchange=()=>{category=select.value;offset=0;draw();};
  try{if(!data){const response=await fetch('assets/market-data.json?v=0.4.15');if(!response.ok)throw Error('Listings could not load. Open Search to retry.');data=await response.json();}if(!disposed&&panel.contains(results))draw();}catch(e){status.textContent=e.message;}
 }
 function detail(r){head(r.name,search);hero(MARKET_CATEGORIES[r.category],r.source==='alliance'?'Original Alliance list':'Filtered Affinity discovery',pageIcon(SEARCH));panel.append(make('p','affinity-copy',r.place),make('p','affinity-copy',r.categoryBasis),make('p','affinity-small','A discovery lead, not a verified membership or endorsement.'));const actions=make('div','affinity-menu');actions.append(card('Search by Map','See this place on the map',()=>map({category:'all',source:r.source,query:r.name})));if(r.url&&/^https?:\/\//.test(r.url)){const a=make('a','affinity-card','Visit source website ↗');a.href=r.url;a.target='_blank';a.rel='noopener';actions.append(a);}panel.append(actions);footer();}
 home();return {resize(){mapTools?.resize();},dispose(){disposed=true;mapTools?.dispose();}};
}
