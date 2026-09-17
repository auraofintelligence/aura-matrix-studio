import {SPACE_LAYERS,readPersonalSpace,changeSpaceRadius,spaceDiagram,personalTorusPoint,savePersonalSpace} from './personal-space-data.js?v=0.4.15';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.15';
import {AVATAR_HOME} from './avatar-data.js?v=0.4.15';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn,cls='')=>{const b=make('button',cls,text);b.type='button';b.onclick=fn;return b;};
const svgNode=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};
export function mountPersonalSpace({screen,go}){
 for(const child of screen.children)child.hidden=true;
 const panel=make('section','avatar-panel personal-space');screen.append(panel);let state;
 try{state=readPersonalSpace(readTravelProject());}catch(e){panel.append(make('p','',e.message),button('Back',()=>go(AVATAR_HOME)));return {resize(){},dispose(){}};}
 let selected=0,view='side',framing='person',zoom=1,mist=true,dirty=false,maxRadius=Math.max(200,Math.ceil(state.radii[6]/100)*100),maxHeight=Math.max(250,Math.ceil(state.height/10)*10);
 const status=make('p','space-status');status.setAttribute('role','status');
 const head=make('header','avatar-header');head.append(button('‹',()=>go(AVATAR_HOME),'avatar-back'),make('h1','','Personal space'));head.firstChild.setAttribute('aria-label','Back to avatar setup');panel.append(head);
 const figure=make('figure','space-figure'),svg=svgNode('svg',{viewBox:'0 0 336 218',role:'img','aria-label':'Person surrounded by seven personal-space Aura shells'}),caption=make('figcaption');
 caption.textContent='Pinch to zoom · drag to move · double-tap to reset. Tap person to turn · hold to change figure.';
 svg.setAttribute('tabindex','0');svg.setAttribute('aria-description','Pinch or mouse wheel to zoom. Drag to move. Double tap resets. Tap the person to switch top and side; hold the person to switch male and female. Keyboard: plus or minus zooms, arrows move, zero resets, V turns, F selects female, M selects male, S toggles mist.');
 figure.append(svg,caption);panel.append(figure);
 let pan={x:0,y:0},holdTimer,tapTimer,lastTap=null,disposed=false;
 const pointers=new Map();let gesture=null;
 const locate=e=>{const matrix=svg.getScreenCTM();return new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());};
 const origin=()=>({x:Math.max(260,svg.clientWidth||336)/2,y:(Math.max(180,svg.clientHeight||300)-36)/2});
 const resetView=()=>{zoom=1;pan={x:0,y:0};framing='person';render();};
 const zoomAt=(factor,point)=>{const old=zoom;zoom=Math.max(.1,Math.min(8,zoom*factor));const ratio=zoom/old,o=origin();pan={x:point.x-o.x-ratio*(point.x-o.x-pan.x),y:point.y-o.y-ratio*(point.y-o.y-pan.y)};};
 const changeFigure=()=>{state.figure=state.figure==='female'?'male':'female';changed();render();};
 const turn=()=>{view=view==='side'?'top':'side';pan={x:0,y:0};render();};
 svg.onpointerdown=e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();svg.focus({preventScroll:true});svg.setPointerCapture(e.pointerId);
  const p=locate(e),human=!!e.target.closest('[data-human-view]');pointers.set(e.pointerId,p);
  if(pointers.size===1){gesture={start:p,time:Date.now(),moved:false,multi:false,held:false,human};clearTimeout(holdTimer);holdTimer=setTimeout(()=>{if(!disposed&&gesture&&!gesture.moved&&!gesture.multi){gesture.held=true;clearTimeout(tapTimer);lastTap=null;if(human)changeFigure();else{mist=!mist;render();}}},600);}
  else{gesture.multi=true;clearTimeout(holdTimer);clearTimeout(tapTimer);lastTap=null;}
 };
 svg.onpointermove=e=>{
  if(!pointers.has(e.pointerId))return;e.preventDefault();const previous=[...pointers.values()],old=pointers.get(e.pointerId),p=locate(e);pointers.set(e.pointerId,p);
  if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>5){gesture.moved=true;clearTimeout(holdTimer);}
  const next=[...pointers.values()];
  if(next.length===2){const a=previous[0],b=previous[1],c=next[0],d=next[1],before=Math.hypot(b.x-a.x,b.y-a.y),after=Math.hypot(d.x-c.x,d.y-c.y),centre={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(before>0)zoomAt(after/before,centre);pan.x+=(c.x+d.x)/2-centre.x;pan.y+=(c.y+d.y)/2-centre.y;}
  else if(next.length===1){pan.x+=p.x-old.x;pan.y+=p.y-old.y;}
  render();
 };
 const release=e=>{
  if(!pointers.has(e.pointerId))return;const p=locate(e),g=gesture;pointers.delete(e.pointerId);clearTimeout(holdTimer);
  if(e.type!=='pointercancel'&&!g.multi&&!g.held&&!g.moved&&Date.now()-g.time<550){
   const now=Date.now();if(lastTap&&now-lastTap.time<320&&Math.hypot(p.x-lastTap.point.x,p.y-lastTap.point.y)<24){clearTimeout(tapTimer);lastTap=null;resetView();}
   else{clearTimeout(tapTimer);lastTap={time:now,point:p};tapTimer=setTimeout(()=>{if(!disposed&&g.human)turn();lastTap=null;},320);}
  }
  if(!pointers.size)gesture=null;
 };
 svg.onpointerup=release;svg.onpointercancel=release;svg.oncontextmenu=e=>e.preventDefault();
 svg.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*.002),locate(e));render();},{passive:false});
 svg.onkeydown=e=>{let handled=true;if(e.key==='+'||e.key==='='){zoomAt(1.2,origin());render();}else if(e.key==='-'){zoomAt(1/1.2,origin());render();}else if(e.key==='0')resetView();else if(e.key.toLowerCase()==='v')turn();else if(['f','m'].includes(e.key.toLowerCase())){state.figure=e.key.toLowerCase()==='f'?'female':'male';changed();render();}else if(e.key.toLowerCase()==='s'){mist=!mist;render();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){pan.x+=e.key==='ArrowLeft'?-15:e.key==='ArrowRight'?15:0;pan.y+=e.key==='ArrowUp'?-15:e.key==='ArrowDown'?15:0;render();}else handled=false;if(handled)e.preventDefault();};

 const colours=make('nav','space-colours');colours.setAttribute('aria-label','Choose an Aura layer');const choices=SPACE_LAYERS.map((l,i)=>{const b=button(String(i+1),()=>{selected=i;render();});b.style.setProperty('--layer-colour',l.colour);b.setAttribute('aria-label',l.colourName+' layer');colours.append(b);return b;});panel.append(colours);
 const distanceBlock=make('div','space-slider'),distanceLine=make('label','space-slider-line'),distanceLabel=make('strong'),distanceNumber=make('input'),distance=make('input');distanceNumber.type='number';distanceNumber.min='1';distanceNumber.step='1';distanceNumber.inputMode='decimal';distanceNumber.setAttribute('aria-label','Selected layer distance in centimetres');distanceLine.append(distanceLabel,distanceNumber,make('span','','cm'));distance.type='range';distance.min='1';distance.step='1';distance.setAttribute('aria-label','Selected layer distance');distanceBlock.append(distanceLine,distance);panel.append(distanceBlock);
 const heightBlock=make('div','space-slider'),heightLine=make('label','space-slider-line'),heightNumber=make('input'),height=make('input');heightNumber.type='number';heightNumber.min='1';heightNumber.step='1';heightNumber.inputMode='decimal';heightNumber.setAttribute('aria-label','Person height in centimetres');heightLine.append(make('strong','','Person height'),heightNumber,make('span','','cm'));height.type='range';height.min='40';height.step='1';height.setAttribute('aria-label','Person height');heightBlock.append(heightLine,height);panel.append(heightBlock,status);
 function changed(){dirty=true;state.example=false;state.adjusted=false;status.textContent='Unsaved changes';}
 function radiusChange(v){try{const before=[...state.radii];state.radii=changeSpaceRadius(state.radii,selected,Number(v));maxRadius=Math.max(maxRadius,Math.ceil(state.radii[6]/100)*100);changed();render();const moved=state.radii.filter((r,i)=>i!==selected&&r!==before[i]).length;if(moved)status.textContent=`Unsaved. ${moved} adjoining ${moved===1?'layer':'layers'} moved to stay nested.`;}catch(e){status.textContent=e.message;}}
 distance.oninput=()=>radiusChange(distance.value);distanceNumber.oninput=()=>{if(distanceNumber.value!=='')radiusChange(distanceNumber.value);};distanceNumber.onblur=()=>{if(Number(distanceNumber.value)>0)render();};
 function heightChange(v){const n=Number(v);if(!Number.isFinite(n)||n<=0){status.textContent='Enter a height greater than zero.';return;}state.height=n;maxHeight=Math.max(maxHeight,Math.ceil(n/10)*10);changed();render();}
 height.oninput=()=>heightChange(height.value);heightNumber.oninput=()=>{if(heightNumber.value!=='')heightChange(heightNumber.value);};heightNumber.onblur=()=>{if(Number(heightNumber.value)>0)render();};
 const foot=make('footer','avatar-footer');foot.append(button('Meaning & notes',notes),button('Save layers',()=>{try{if(!distanceNumber.value||Number(distanceNumber.value)<=0||!heightNumber.value||Number(heightNumber.value)<=0)throw Error('Enter positive height and distance values before saving.');writeTravelProject(p=>savePersonalSpace(p,state.height,state.radii,state.meanings,state.notes,state.figure));dirty=false;state.example=false;state.adjusted=false;render();status.textContent='Seven shells and person height saved.';}catch(e){status.textContent=e.message;}},'avatar-primary'));panel.append(foot);
 function render(){
  const w=Math.max(260,svg.clientWidth||336),h=Math.max(180,svg.clientHeight||300);
  const diagram=spaceDiagram(state.height,state.radii,view,framing==='layer'?selected:null,{width:w,height:h},framing,zoom),shells=diagram.shells,l=shells[selected];choices.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));distanceLabel.textContent=l.name+' radius from centre';if(document.activeElement!==distanceNumber)distanceNumber.value=String(l.radius);distance.max=String(maxRadius);distance.min=String(selected+1);distance.value=String(l.radius);distance.setAttribute('aria-valuetext',`${l.name}, radius from centre ${l.radius} centimetres, diameter ${l.diameter} centimetres`);distanceBlock.style.setProperty('--layer-colour',l.colour);if(document.activeElement!==heightNumber)heightNumber.value=String(state.height);height.max=String(maxHeight);height.min=String(Math.min(40,state.height));height.value=String(state.height);
  const female=state.figure==='female',sideCrown=female?25:20,sideSoles=female?1426:1428,bodyPixels=sideSoles-sideCrown;
  svg.replaceChildren();const scale=diagram.scale,cx=w/2,cy=(h-36)/2;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('data-pixels-per-cm',String(scale));svg.setAttribute('data-view',view);svg.setAttribute('data-zoom',String(zoom));
  svg.setAttribute('aria-label',view==='top'?'Overhead human surrounded by seven Aura torus shells':'Human inside seven stretched horn torus bubbles');
  const defs=svgNode('defs');
  // Remove the near-white image backdrop when compositing; retain opaque human colours.
  const cutout=svgNode('filter',{id:'space-human-cutout',x:0,y:0,width:1,height:1,'color-interpolation-filters':'sRGB'});
  cutout.append(svgNode('feColorMatrix',{type:'matrix',values:'1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -0.2126 -0.7152 -0.0722 0 1'}));
  const alpha=svgNode('feComponentTransfer');alpha.append(svgNode('feFuncA',{type:'linear',slope:60,intercept:-.9}));cutout.append(alpha);defs.append(cutout);svg.append(defs);const scene=svgNode('g',{transform:`translate(${pan.x} ${pan.y})`,'data-space-scene':'true'});svg.append(scene);
  const curve=points=>points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')+'Z';
  for(const i of [...shells.keys()].reverse().filter(i=>i!==selected).concat(selected)){const shell=shells[i],r=shell.radiusPx,b=diagram.personHeight/2,R=r/2,id=`space-mist-${i}`;
   const gradient=svgNode('radialGradient',{id});
   for(const [offset,opacity]of [['0%',.24],['45%',.34],['100%',.34]])gradient.append(svgNode('stop',{offset,'stop-color':shell.colour,'stop-opacity':opacity}));defs.append(gradient);
   const group=svgNode('g',{'data-space-layer':shell.id,'data-radius-cm':shell.radius,'data-diameter-px':shell.diameterPx,'data-torus-height-cm':state.height,'data-selected-field':String(i===selected),'data-fog-visible':String(mist&&i===selected)});
   if(view==='top'){
    group.append(svgNode('circle',{cx,cy,r,fill:mist&&i===selected?`url(#${id})`:'none',stroke:shell.colour,'stroke-opacity':i===selected?.9:.5,'stroke-width':i===selected?2:1}));
   }else{
    const outline=`M${cx-R} ${cy-b}H${cx+R}A${R} ${b} 0 0 1 ${cx+R} ${cy+b}H${cx-R}A${R} ${b} 0 0 1 ${cx-R} ${cy-b}Z`;
    group.append(svgNode('path',{d:outline,fill:mist&&i===selected?`url(#${id})`:'none',stroke:shell.colour,'stroke-opacity':i===selected?.9:.3,'stroke-width':i===selected?1.7:.8,'data-torus-envelope':'true'}));
    for(const u of (i===selected?[0,Math.PI/6,Math.PI/3,Math.PI*2/3,Math.PI*5/6,Math.PI]:[0,Math.PI/3,Math.PI*2/3,Math.PI])){
     const points=Array.from({length:65},(_,j)=>{const p=personalTorusPoint(shell.radius,state.height,u,j*Math.PI/32);return [cx+p[0]*scale,cy-p[1]*scale];});
     group.append(svgNode('path',{d:curve(points),fill:'none',stroke:shell.colour,'stroke-opacity':i===selected?.48:.07,'stroke-width':.8,'data-torus-meridian':'true'}));
    }
   }
   scene.append(group);
  }
  if(view==='top'){
   const unit=diagram.personHeight/2135;
   scene.append(svgNode('image',{href:female?'assets/avatar/human-female-top.png':'assets/avatar/human-top.png',x:cx-380*unit,y:cy-380*unit,width:1254*unit,height:1254*unit,filter:'url(#space-human-cutout)','data-human-view':'top','data-reference-figure':state.figure}));
  }else{
   const ground=cy+diagram.personHeight/2,top=cy-diagram.personHeight/2,hx=cx-diagram.personHeight*.13-8;
   scene.append(svgNode('path',{d:`M8 ${ground}H${w-8}`,stroke:'#b5afbe','stroke-width':.8}));
   const unit=diagram.personHeight/bodyPixels;
   scene.append(svgNode('image',{href:female?'assets/avatar/human-female-side.png':'assets/avatar/human-side.png',x:cx-430*unit,y:ground-sideSoles*unit,width:1024*unit,height:1536*unit,filter:'url(#space-human-cutout)','data-human-view':'side','data-reference-figure':state.figure,'data-person-height-cm':state.height,'data-person-height-px':diagram.personHeight}));
   scene.append(svgNode('path',{d:`M${hx} ${top}V${ground}M${hx-3} ${top}H${hx+3}M${hx-3} ${ground}H${hx+3}`,stroke:'#304557','stroke-width':.8,fill:'none'}),svgNode('text',{x:cx+10,y:Math.max(12,top-5),fill:'#42374f','font-size':10},`${state.height} cm`));
   for(let i=6;i>=0;i--){const shell=shells[i],y=ground+4+i*2,x1=cx-shell.radiusPx,x2=cx+shell.radiusPx;scene.append(svgNode('path',{d:`M${x1} ${y}H${x2}`,stroke:shell.colour,'stroke-width':i===selected?1.5:.7,fill:'none','data-distance-guide':shell.id}));}
  }
  svg.append(svgNode('rect',{x:0,y:h-24,width:w,height:24,fill:'#fff','fill-opacity':.88}),svgNode('text',{x:cx,y:h-8,'text-anchor':'middle',fill:'#42374f','font-size':11},`Radius ${l.radius} cm · diameter ${l.diameter} cm`));
  status.textContent=dirty?'Unsaved changes':state.adjusted?'Overlapping saved distances fitted into nested layers. Save to keep.':state.example?'Example sizes until saved. Choose a colour and adjust.':'Saved layers. Choose a colour and adjust.';
 }
 function notes(){
  for(const child of panel.children)child.inert=true;
  const sheet=make('section','space-notes'),head=make('header','avatar-header');head.append(make('h2','',SPACE_LAYERS[selected].name+' layer'),button('Done',()=>{sheet.remove();for(const child of panel.children)child.inert=false;render();}));sheet.append(head);const fields=[['meaning','Meaning of this layer'],['space-context','Where or with whom?'],['space-contact','Touch and greeting preferences'],['space-adjustments','What helps you feel comfortable?']];
  for(const [key,title]of fields){const label=make('label','avatar-field'),input=make('textarea');label.append(make('span','',title),input);input.setAttribute('aria-label',title);input.maxLength=2000;input.value=key==='meaning'?state.meanings[selected]:state.notes[key];input.oninput=()=>{if(key==='meaning')state.meanings[selected]=input.value;else state.notes[key]=input.value;changed();};sheet.append(label);}sheet.append(make('p','avatar-help','Done returns to the diagram. Save layers keeps your changes.'));panel.append(sheet);
 }
 render();const observer=new ResizeObserver(()=>render());observer.observe(svg);return {resize(){render();},dispose(){disposed=true;clearTimeout(holdTimer);clearTimeout(tapTimer);observer.disconnect();pointers.clear();}};
}
