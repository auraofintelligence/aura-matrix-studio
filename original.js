import {mountTravel,mountTravelTimeline} from './travel-ui.js?v=0.3.4';
import {TRAVEL,TIMELINES,CELESTIAL} from './travel-data.js?v=0.3.4';
import {mountCelestial} from './celestial-clock.js?v=0.3.4';
import {mountMarket,MARKET_PAGES} from './market-map.js?v=0.3.4';
import {mountFavourites,FAVOURITES} from './original-favourites.js?v=0.3.4';
import {mountMenuCamera} from './menu-camera.js?v=0.3.4';
import {mountQuickStart,QUICKSTART} from './quickstart.js?v=0.3.4';
import {mountSiteMap,SITEMAP} from './original-sitemap.js?v=0.3.4';
import {livePage,parentPage,HOME,PROGRAMMER,canonicalPage,CAMERA_VARIANTS} from './original-routes.js?v=0.3.4';
import {mountLiveMatrix} from './original-live.js?v=0.3.4';
const $=id=>document.getElementById(id);
export const MATRIX_PAGES={
  '1FE14FC9-F981-4E27-B038-BDF3FF404838':'O',
  '61CEB74B-9978-49D9-8514-E5D0F0E1E989':'I',
  'BCB57A67-242E-4B77-9AC3-9B760D7181DD':'O',
  '1773263D-945B-4087-ACEF-8C088C29FB47':'O',
  'F8799D0F-5FC9-4A10-83A4-5D491C1DE094':'I',
  'A6C23855-5F57-4601-8F6A-02749BA0895E':'O'
};
export const colour=value=>{const n=Number(value)>>>0;return `rgba(${n>>>16&255},${n>>>8&255},${n&255},${(n>>>24)/255})`;};
export function bounds(control){return ['x','y','w','h'].map(k=>Number(control[k]));}
export function linkBounds(area,control){
  const coordinates=(area?.coords||'').match(/-?\d+(?:\.\d+)?/g)?.map(Number);
  return coordinates?.length===4?[coordinates[0],coordinates[1],coordinates[2]-coordinates[0],coordinates[3]-coordinates[1]]:[0,0,+control.w,+control.h];
}
export function fitOriginal(width,height,availableWidth,availableHeight){return Math.max(.01,Math.min(availableWidth/width,availableHeight/height));}

export async function startOriginal(){
  if(new URLSearchParams(location.search).has('inspect'))document.body.dataset.inspect='true';
  const [response,catalogueResponse]=await Promise.all([fetch('assets/mockplus/pages.json'),fetch('assets/dataset-catalogue.json')]);if(!response.ok)throw Error('Original layouts could not be loaded.');
  const catalogue=await catalogueResponse.json(),source=await response.json(),pages=new Map(source.pages.map(p=>[p.id,p]));let current,live,menuCamera;
  const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const warn=text=>{$('original-status').textContent=text;};
  function go(id,extra={}){
    if(id==='command:back')id=parentPage(current,pages);
    if(CAMERA_VARIANTS[id]===current.id){menuCamera?.toggle();return;}id=canonicalPage(id);
    if(!pages.has(id)){warn('This control has no destination in the original Mockplus file.');return;}
    if(id===current.id)return;
    const query=new URLSearchParams({page:id,...extra});if(document.body.dataset.inspect)query.set('inspect','1');
    history.pushState({auraOriginal:true},'',`?${query}`);show(id);
  }
  function position(node,box){Object.assign(node.style,{left:box[0]+'px',top:box[1]+'px',width:box[2]+'px',height:box[3]+'px'});}
  function textStyle(node,c){
    const p=c.properties,font=c.font,size=Number(p.textSize)||current.fontSize;
    Object.assign(node.style,{fontFamily:`"${font.family||'Segoe UI'}",sans-serif`,fontSize:size+'px',fontWeight:p.textStyles?.includes('fsBold')||font.isBold==='True'?'700':font.weight||'400',fontStyle:font.isItalic==='True'?'italic':'normal',color:p.textColor?colour(p.textColor):'#000',textAlign:({HaCenter:'center',HaRight:'right'})[p.textAlign]||'left'});
  }
  function draw(c,parent){
    const p=c.properties,type=c.controlTypeID,node=make('div','original-control '+type.replace(/[^a-z0-9]/gi,'-'));
    node.dataset.sourceControl=c.controlID;position(node,bounds(c));node.style.zIndex=c.zOrder||0;textStyle(node,c);
    if(p.isVisible==='False'||p.visible==='False')node.hidden=true;
    if(p.color)node.style.backgroundColor=colour(p.color);
    if(type==='StatusBar(Android)'){
      node.classList.add('original-phone-status');node.append(make('span',null,'◉ ▰  02:18 PM'));
    }else if(p.URL){
      const img=make('img');img.src='assets/mockplus/'+p.URL;img.alt=CAMERA_VARIANTS[c.links[0]?.target]?'Camera background':c.links[0]?.title||'';img.draggable=false;node.append(img);
    }else if(type==='AlarmIcon2'){
      node.classList.add('original-alarm');const alarm=c.children.find(child=>child.properties.alias==='alarm');
      if(alarm){const badge=make('span','original-count',alarm.properties.text);position(badge,bounds(alarm));badge.style.background=colour(alarm.properties.color);badge.style.color=colour(alarm.properties.textColor||4294967295);badge.style.fontSize=(Number(alarm.properties.textSize)||7)+'px';node.append(badge);}
    }else if(type==='CoverFlow'){
      node.hidden=true;node.classList.add('original-coverflow');for(const name of ['far-left','near-left','centre','near-right','far-right'])node.append(make('span',name));
    }else if(c.children.length){
      for(const child of c.children)if(!(child.properties.alias==='label'&&child.properties.text==='Label'))draw(child,node);
    }else if(['TextInput','LabelTextInput','Search'].includes(type)){
      const field=make('input');field.value=p.text||'';field.setAttribute('aria-label',p.text||type);node.append(field);
      field.addEventListener('change',()=>warn('This is an original design field. Use the live matrix to save records.'));
    }else if(type==='HSlider'){
      const range=make('input');range.type='range';range.setAttribute('aria-label',p.text||'Original slider');node.append(range);
    }else if(type==='CheckBox'||type==='CheckBoxGroup'){
      for(const label of (p.text||'').split(/\r?\n/)){const row=make('label'),box=make('input');box.type='checkbox';row.append(box,document.createTextNode(label));node.append(row);}
    }else if(['List','TableView'].includes(type)){
      for(const line of (p.text||'').split(/\r?\n/))node.append(make('div','original-list-row',line));
    }else if(type==='Button'||type==='PointyButton'||type==='Shape'){
      node.classList.add('original-shape');if(p.borderVisible==='False')node.style.border='none';if(p.radius)node.style.borderRadius=p.radius+(p.radiusIsPercent==='True'?'%':'px');node.append(make('span','original-text',p.text||''));
    }else if(type==='Icon'){
      node.classList.add('original-empty-icon');
    }else if(p.text){
      node.append(make('span','original-text',p.text));
    }else if(!['Timer','Border','Panel','ScrollViewContentPanel'].includes(type)){
      node.classList.add('original-widget');node.setAttribute('aria-label',type+' from the original design');
      // Native Mockplus widgets without supplied artwork remain labelled design components.
      node.append(make('span','original-widget-name',type));
    }
    if(type==='Label'&&p.color)node.style.backgroundColor=colour(p.color);
    parent.append(node);
    for(const link of c.links){
      for(const area of link.areas.length?link.areas:[null]){
        const box=linkBounds(area,c);if(box[2]<=0||box[3]<=0)continue;
        const destination=livePage(canonicalPage(link.target)),destinationTitle=destination?(destination.shape==='flat'?'Finite map':['Red','Orange','Yellow','Green','Blue','Indigo','Violet'][destination.shell]+' torus'):null;
        const a=make('a','original-link');a.href=link.target==='command:back'?'#back':'?page='+canonicalPage(link.target);a.title=CAMERA_VARIANTS[link.target]?'Camera background':destinationTitle||link.title||pages.get(link.target)?.name||'Back';a.setAttribute('aria-label',a.title);position(a,box);if(CAMERA_VARIANTS[link.target]){a.dataset.cameraToggle='true';a.setAttribute('role','button');}
        a.onclick=e=>{e.preventDefault();e.stopPropagation();go(link.target);};node.append(a);
      }
    }
    if(c.links.some(link=>link.target==='command:back')){
      const destination=parentPage(current,pages),name=destination===HOME?'Aura Menu':destination===PROGRAMMER?'Maps':pages.get(destination)?.name||'Back';
      node.replaceChildren();node.classList.add('original-back-control');
      if(livePage(current.id))position(node,[8,324,88,30]);
      const a=make('a','original-link',livePage(current.id)?'← '+name:'←');a.href='?page='+destination;a.title='Back to '+name;a.setAttribute('aria-label',a.title);position(a,[0,0,livePage(current.id)?88:32,30]);a.onclick=e=>{e.preventDefault();go(destination);};node.append(a);
    }
  }

  function show(id){
    live?.dispose();live=null;menuCamera?.dispose();menuCamera=null;if(canonicalPage(id)!==id){id=canonicalPage(id);const u=new URL(location.href);u.searchParams.set('page',id);history.replaceState(history.state,'',u);}current=pages.get(id)||pages.get(source.home);document.title=current.name+' | Aura of Intelligence';$('original-screen').replaceChildren();$('original-screen').style.backgroundColor=colour(current.background);
    Object.assign($('original-screen').style,{width:current.width+'px',height:current.height+'px'});
    for(const control of current.controls)draw(control,$('original-screen'));
    $('page-name').textContent=current.name;$('original-page').value=current.id;
    $('live-matrix').href=`matrix.html?face=${MATRIX_PAGES[current.id]||'O'}&shell=0&kind=facet&index=1&from=${current.id}`;
    const advanced=/\d+ by \d+ Torus/.test(current.name);
    warn(advanced?'Original screen artwork. The working model stays 12 × 24.':'Original screen layouts and links. Live tools are available in the matrix.');
    const config=livePage(current.id,new URLSearchParams(location.search));if(config)live=mountLiveMatrix({page:current,screen:$('original-screen'),config,go});
    if(MARKET_PAGES[current.id])live=mountMarket({page:current,screen:$('original-screen')});
    if(current.id===TRAVEL)live=mountTravel({page:current,screen:$('original-screen'),go});
    if(current.id===TIMELINES)live=mountTravelTimeline({screen:$('original-screen'),go});
    if(current.id===CELESTIAL)live=mountCelestial({page:current,screen:$('original-screen'),go});
    if(current.id===QUICKSTART)live=mountQuickStart({page:current,screen:$('original-screen'),catalogue});
    if(current.id===FAVOURITES)live=mountFavourites({page:current,screen:$('original-screen'),pages,go});
    if(current.id===SITEMAP)live=mountSiteMap({page:current,screen:$('original-screen'),pages,go,previewMode:new URLSearchParams(location.search).has('preview')});
    if([HOME,PROGRAMMER].includes(current.id))menuCamera=mountMenuCamera($('original-screen'));
    fit();
  }
  function fit(){if(!current)return;const rect=$('original-viewport').getBoundingClientRect(),scale=fitOriginal(current.width,current.height,rect.width,rect.height);$('original-screen').style.transform=`scale(${scale})`;Object.assign($('original-frame').style,{width:current.width*scale+'px',height:current.height*scale+'px'});live?.resize();$('rotate-note').hidden=!(current.width>current.height&&rect.height>rect.width);}
  for(const page of source.pages){const option=make('option',null,(page.parent?'  ':'')+page.name);option.value=page.id;$('original-page').append(option);}
  $('original-page').onchange=()=>go($('original-page').value);$('original-back').onclick=()=>go('command:back');$('original-home').onclick=()=>go(source.home);
  $('original-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{warn('Fullscreen is unavailable in this browser.');}};
  window.addEventListener('popstate',()=>show(new URLSearchParams(location.search).get('page')));new ResizeObserver(fit).observe($('original-viewport'));
  show(new URLSearchParams(location.search).get('page'));
}
if(typeof document!=='undefined'&&document.body.dataset.page==='original')startOriginal().catch(error=>{document.body.dataset.inspect='true';$('original-status').textContent=error.message;});
