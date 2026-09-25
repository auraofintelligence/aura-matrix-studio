import {visitHistory} from './visit-history.js?v=0.4.17';
import {addExtraPages} from './extra-pages.js?v=0.4.19';
import {mountVectorLab,mountProgrammerTools,VECTOR_LAB} from './vector-lab-ui.js?v=0.4.19';
import {mountDataTransfer,DATA_TRANSFER} from './data-transfer-ui.js?v=0.4.17';
import {mountMerch,MERCH} from './merch-ui.js?v=0.4.17';
import {NAV_ARROW_FILES,enhanceNavigation} from './navigation-ui.js?v=0.4.15';
import {mountChakra,CHAKRA_PAGES} from './chakra-workspace.js?v=0.4.18';
import {mountAffinity,AFFINITY_PAGES} from './affinity-ui.js?v=0.4.17';
import {mountPreferences,underPage,PREFERENCES} from './preferences-ui.js?v=0.4.17';
import {PALACE_PAGES} from './palace-ui.js?v=0.4.17';
import {mountPalaceCapture} from './palace-capture-ui.js?v=0.4.17';
import {mountSocial,isSocialPage,addSocialPages} from './social-ui.js?v=0.4.17';
import {AVATAR_HOME,AVATAR_CREATION,AVATAR_PAGES} from './avatar-data.js?v=0.4.17';
import {LIFE_PAGES,SOCIAL_HOME} from './life-data.js?v=0.4.17';
import {mountLife} from './life-ui.js?v=0.4.17';
import {mountAvatar} from './avatar-ui.js?v=0.4.17';
import {mountEarth} from './earth-map.js?v=0.4.17';
import {EARTH,EARTH_WIDE} from './earth-data.js?v=0.4.17';
import {mountTiming,mountTimingHome} from './timing-ui.js?v=0.4.17';
import {mountMatrixSymbols} from './chakra-art.js?v=0.4.15';
import {TIMING_PAGES} from './timing-data.js?v=0.4.17';
import {mountTravel} from './travel-ui.js?v=0.4.17';
import {TRAVEL,TIMELINES,CELESTIAL} from './travel-data.js?v=0.4.17';
import {mountCelestial} from './celestial-clock.js?v=0.4.17';
import {mountMarket,MARKET_PAGES} from './market-map.js?v=0.4.15';
import {mountFavourites,FAVOURITES} from './original-favourites.js?v=0.4.17';
import {mountMenuCamera} from './menu-camera.js?v=0.4.15';
import {mountQuickStart,QUICKSTART} from './quickstart.js?v=0.4.17';
import {mountSiteMap,SITEMAP} from './original-sitemap.js?v=0.4.17';
import {livePage,parentPage,HOME,PROGRAMMER,canonicalPage,CAMERA_VARIANTS} from './original-routes.js?v=0.4.15';
import {mountLiveMatrix} from './original-live.js?v=0.4.18';
import {frameOrientation} from './frame-display.js?v=0.4.15';
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
export function openingPage(id,pages){return pages.has(canonicalPage(id))?canonicalPage(id):QUICKSTART;}
export function screenLayout(page,availableWidth,availableHeight){
  const phoneViewport=Math.min(availableWidth,availableHeight)<=600;
  const rotated=phoneViewport&&(page.width>page.height)!==(availableWidth>availableHeight)&&page.width!==page.height;
  const scale=fitOriginal(page.width,page.height,rotated?availableHeight:availableWidth,rotated?availableWidth:availableHeight);
  return {rotated,scale,width:(rotated?page.height:page.width)*scale,height:(rotated?page.width:page.height)*scale,
    transform:rotated?`translateX(${page.height*scale}px) rotate(90deg) scale(${scale})`:`scale(${scale})`};
}

export async function startOriginal(){
  if(new URLSearchParams(location.search).has('inspect'))document.body.dataset.inspect='true';
  const [response,catalogueResponse]=await Promise.all([fetch('assets/mockplus/pages.json'),fetch('assets/dataset-catalogue.json')]);if(!response.ok)throw Error('Original layouts could not be loaded.');
  const catalogue=await catalogueResponse.json(),source=addExtraPages(addSocialPages(await response.json())),pages=new Map(source.pages.map(p=>[p.id,p]));let current,live,menuCamera;
  const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const warn=text=>{$('original-status').textContent=text;};
  const visits=visitHistory(history,location.href,{previousDocument:!!document.referrer&&new URL(document.referrer).origin===location.origin&&new URL(document.referrer).pathname.startsWith(new URL('.',location.href).pathname)});
  function go(id,extra={}){
    if(id==='command:back'){if(visits.back())return;if(current?.id===HOME)return;const homeURL=new URL(location.href);homeURL.search='?page='+HOME;history.replaceState(history.state,'',homeURL);show(HOME);return;}
    if(CAMERA_VARIANTS[id]===current.id){menuCamera?.toggle();return;}id=canonicalPage(id);
    if(!pages.has(id)){warn('This control has no destination in the original Mockplus file.');return;}
    if(id===current.id)return;
    const query=new URLSearchParams({page:id,...extra});if(document.body.dataset.inspect)query.set('inspect','1');
    visits.push(`?${query}`);show(id);
  }
  function position(node,box){Object.assign(node.style,{left:box[0]+'px',top:box[1]+'px',width:box[2]+'px',height:box[3]+'px'});}
  function textStyle(node,c){
    const p=c.properties,font=c.font,size=Number(p.textSize)||current.fontSize;
    Object.assign(node.style,{fontFamily:`"${font.family||'Segoe UI'}",sans-serif`,fontSize:size+'px',fontWeight:p.textStyles?.includes('fsBold')||font.isBold==='True'?'700':font.weight||'400',fontStyle:font.isItalic==='True'?'italic':'normal',color:p.textColor?colour(p.textColor):'#000',textAlign:({HaCenter:'center',HaRight:'right'})[p.textAlign]||'left'});
  }
  function draw(c,parent){
    if(c.controlTypeID==='StatusBar(Android)')return;
    const p=c.properties,type=c.controlTypeID,node=make('div','original-control '+type.replace(/[^a-z0-9]/gi,'-'));
    node.dataset.sourceControl=c.controlID;position(node,bounds(c));node.style.zIndex=c.zOrder||0;textStyle(node,c);
    if(p.isVisible==='False'||p.visible==='False')node.hidden=true;
    if(p.color)node.style.backgroundColor=colour(p.color);
    if(p.URL){
      const lifeDestination=LIFE_PAGES[c.links[0]?.target],img=make('img');img.src='assets/mockplus/'+(lifeDestination?.image||p.URL);img.alt=CAMERA_VARIANTS[c.links[0]?.target]?'Camera background':c.links[0]?.title||'';img.draggable=false;node.append(img);if(current.id===SOCIAL_HOME&&lifeDestination)node.append(make('span','life-source-caption',lifeDestination.title));
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
        const a=make('a','original-link');a.href=link.target==='command:back'?'#back':'?page='+canonicalPage(link.target);a.title=CAMERA_VARIANTS[link.target]?'Camera background':destinationTitle||LIFE_PAGES[link.target]?.title||link.title||pages.get(link.target)?.name||'Back';a.setAttribute('aria-label',a.title);position(a,box);if(CAMERA_VARIANTS[link.target]){a.dataset.cameraToggle='true';a.setAttribute('role','button');}
        a.onclick=e=>{e.preventDefault();e.stopPropagation();go(link.target);};node.append(a);
      }
    }
    const navLabel=c.links.some(link=>link.target==='command:back')?'Back':NAV_ARROW_FILES.get(p.URL);
    if(navLabel&&c.links.length){
      const originalTarget=c.links[0].target,destination=originalTarget==='command:back'?parentPage(current,pages):canonicalPage(originalTarget),name=pages.get(destination)?.name||'Aura';
      node.replaceChildren();node.classList.add('original-nav-control');
      const width=navLabel==='Previous'?82:70;position(node,[Math.max(4,Math.min(current.width-width-4,+c.x+(+c.w-width)/2)),+c.y+(+c.h-34)/2,width,34]);
      if(livePage(current.id)&&navLabel==='Back')position(node,[8,324,70,30]);
      const a=make('a','original-link ethereal-nav',navLabel);a.dataset.navDirection=navLabel==='Next'?'next':'back';a.href='?page='+destination;a.title=navLabel+' to '+name;a.setAttribute('aria-label',a.title);position(a,[0,0,width,34]);if(navLabel==='Back'){a.href='#back';a.title='Back';a.setAttribute('aria-label','Back');}a.onclick=e=>{e.preventDefault();go(navLabel==='Back'?'command:back':originalTarget);};node.append(a);
    }
  }

  function show(id){
    live?.dispose();live=null;menuCamera?.dispose();menuCamera=null;if(canonicalPage(id)!==id){id=canonicalPage(id);const u=new URL(location.href);u.searchParams.set('page',id);history.replaceState(history.state,'',u);}current=pages.get(openingPage(id,pages));document.title=(LIFE_PAGES[current.id]?.title||current.name)+' | Aura of Intelligence';$('original-screen').replaceChildren();$('original-screen').style.backgroundColor=colour(current.background);
    Object.assign($('original-screen').style,{width:current.width+'px',height:current.height+'px'});
    for(const control of current.controls)draw(control,$('original-screen'));
    mountMatrixSymbols(current,$('original-screen'));
    $('page-name').textContent=current.name;$('original-page').value=current.id;
    $('live-matrix').href=`matrix.html?face=${MATRIX_PAGES[current.id]||'O'}&shell=0&kind=facet&index=1&from=${current.id}`;
    const advanced=/\d+ by \d+ Torus/.test(current.name);
    warn(advanced?'Original screen artwork. The working model stays 12 × 24.':'Original screen layouts and links. Live tools are available in the matrix.');
    const config=livePage(current.id,new URLSearchParams(location.search));if(config)live=mountLiveMatrix({page:current,screen:$('original-screen'),config,go});
    if(AFFINITY_PAGES.has(current.id))live=mountAffinity({page:current,screen:$('original-screen'),go});
    if(underPage(current,pages,PREFERENCES)&&!underPage(current,pages,'7059638E-B7C3-4EC9-85CE-21FDD8A5E87A'))live=mountPreferences({page:current,screen:$('original-screen'),pages,go});
    if(PALACE_PAGES.has(current.id))live=mountPalaceCapture({page:current,screen:$('original-screen'),pages,go});
    if(isSocialPage(current))live=mountSocial({page:current,screen:$('original-screen'),pages,go});
    if(current.id===TRAVEL)live=mountTravel({page:current,screen:$('original-screen'),go});
    if(LIFE_PAGES[current.id])live=mountLife({screen:$('original-screen'),section:LIFE_PAGES[current.id],go});
    if(current.id===TIMELINES){live=mountTimingHome({screen:$('original-screen'),go});document.title='Timing and Signals | Aura of Intelligence';}
    if(current.id===AVATAR_HOME||current.id===AVATAR_CREATION||AVATAR_PAGES[current.id])live=mountAvatar({page:current,screen:$('original-screen'),go});
    if(TIMING_PAGES[current.id])live=mountTiming({page:current,screen:$('original-screen'),go});
    if([EARTH,EARTH_WIDE].includes(current.id)){live=mountEarth({page:current,screen:$('original-screen'),go});document.title='Earth map | Aura of Intelligence';}
    if(current.id===CELESTIAL)live=mountCelestial({page:current,screen:$('original-screen'),go});
    if(current.id===QUICKSTART)live=mountQuickStart({page:current,screen:$('original-screen'),catalogue,go});
    if(current.id===FAVOURITES)live=mountFavourites({page:current,screen:$('original-screen'),pages,go});
    if(CHAKRA_PAGES.includes(current.id))live=mountChakra({page:current,screen:$('original-screen'),go});
    if(current.id===SITEMAP)live=mountSiteMap({page:current,screen:$('original-screen'),pages,go});
    if([HOME,PROGRAMMER].includes(current.id))menuCamera=mountMenuCamera($('original-screen'));
    if(current.id===DATA_TRANSFER)live=mountDataTransfer({screen:$('original-screen'),go});
    if(current.id===MERCH)live=mountMerch({screen:$('original-screen'),go});
    if(current.id===PROGRAMMER)live=mountProgrammerTools({page:current,screen:$('original-screen'),go});
    if(current.id===VECTOR_LAB)live=mountVectorLab({screen:$('original-screen'),go});
    fit();
  }
  function fit(){if(!current)return;const rect=$('original-viewport').getBoundingClientRect(),layout=screenLayout(current,rect.width,rect.height);$('original-screen').dataset.frameRotated=String(layout.rotated);$('original-screen').dataset.frameOrientation=frameOrientation(current);$('original-screen').style.transform=layout.transform;Object.assign($('original-frame').style,{width:layout.width+'px',height:layout.height+'px'});live?.resize();$('rotate-note').hidden=true;}
  for(const page of source.pages){const option=make('option',null,(page.parent?'  ':'')+page.name);option.value=page.id;$('original-page').append(option);}
  $('original-page').onchange=()=>go($('original-page').value);$('original-back').onclick=()=>go('command:back');$('original-home').onclick=()=>go(source.home);
  $('original-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{warn('Fullscreen is unavailable in this browser.');}};
  window.addEventListener('popstate',()=>show(new URLSearchParams(location.search).get('page')));new ResizeObserver(fit).observe($('original-viewport'));
  document.addEventListener('click',event=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=event.target.closest('a[href]');if(!a||a.target||a.download)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname!==location.pathname||!u.searchParams.has('page'))return;event.preventDefault();const extra=Object.fromEntries(u.searchParams);const id=extra.page;delete extra.page;go(id,extra);});
  enhanceNavigation();show(new URLSearchParams(location.search).get('page'));
}
if(typeof document!=='undefined'&&document.body.dataset.page==='original')startOriginal().catch(error=>{document.body.dataset.inspect='true';$('original-status').textContent=error.message;});
