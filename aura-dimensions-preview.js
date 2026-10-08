import {SPACE_LAYERS,spaceShells} from './personal-space-data.js?v=0.4.26';
import {humanReference,svgNode} from './aura-human.js?v=0.4.26';
export const shellEnvelopeHeight=(height,radius)=>height+radius*.5;
export function mountDimensionsPreview(host,initial){
 let state=initial,view='front',zoom=1,pan={x:0,y:0},fit=false,disposed=false;const pointers=new Map();
 const wrap=document.createElement('div');wrap.className='aura-dimensions-scene';const svg=svgNode('svg',{viewBox:'0 0 336 320',role:'img','aria-label':'Human avatar surrounded by seven Aura layers',tabindex:0}),tabs=document.createElement('nav');tabs.className='aura-view-tabs';tabs.setAttribute('aria-label','Avatar view');
 for(const [id,label]of [['front','Front'],['side','Side'],['top','Overhead']]){const b=document.createElement('button');b.className='quick-secondary';b.type='button';b.textContent=label;b.onclick=()=>{view=id;zoom=1;pan={x:0,y:0};draw();};b.dataset.view=id;tabs.append(b);}
 const frame=document.createElement('button');frame.type='button';frame.className='aura-frame-view quick-secondary';frame.textContent='View all';frame.onclick=()=>{fit=!fit;zoom=1;pan={x:0,y:0};draw();};wrap.append(svg,frame);host.append(wrap,tabs);
 function draw(){
  if(disposed)return;let shells;try{shells=spaceShells(state.height,state.radii);}catch{return;}
  const outer=state.radii[6],scale=(fit?Math.min(146/outer,260/shellEnvelopeHeight(state.height,outer)):Math.min(205/state.height,270/shellEnvelopeHeight(state.height,outer)))*zoom,cx=168,cy=160,personHeight=state.height*scale;
  svg.replaceChildren();svg.dataset.personHeightPx=String(personHeight);svg.dataset.pixelsPerCm=String(scale);
  const defs=svgNode('defs'),scene=svgNode('g',{transform:`translate(${pan.x} ${pan.y})`});svg.append(defs,scene);
  for(let i=6;i>=0;i--){const r=state.radii[i]*scale,h=shellEnvelopeHeight(state.height,state.radii[i])*scale/2,id='dimension-mist-'+i,gradient=svgNode('radialGradient',{id});gradient.append(svgNode('stop',{offset:'45%','stop-color':SPACE_LAYERS[i].colour,'stop-opacity':0}),svgNode('stop',{offset:'100%','stop-color':SPACE_LAYERS[i].colour,'stop-opacity':.095}));defs.append(gradient);
   const group=svgNode('g',{'data-aura-layer':i,'data-radius-cm':state.radii[i],'data-envelope-height-cm':shellEnvelopeHeight(state.height,state.radii[i])});
   group.append(svgNode('ellipse',{cx,cy,rx:r,ry:view==='top'?r:h,fill:`url(#${id})`,stroke:SPACE_LAYERS[i].colour,'stroke-width':1.35,'stroke-opacity':.65}));
   if(view!=='top')for(const fraction of [.35,.7])group.append(svgNode('ellipse',{cx,cy,rx:r*fraction,ry:h,fill:'none',stroke:SPACE_LAYERS[i].colour,'stroke-width':.7,'stroke-opacity':.12}));scene.append(group);
  }
  scene.append(humanReference(state.figure,view,cx,view==='top'?cy:cy+personHeight/2,personHeight));
  for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.view===view));frame.textContent=fit?'Closer':'View all';
 }
 svg.onwheel=e=>{e.preventDefault();zoom=Math.min(4,Math.max(.2,zoom*Math.exp(-e.deltaY*.002)));draw();};
 svg.onpointerdown=e=>{svg.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});};
 svg.onpointermove=e=>{if(!pointers.has(e.pointerId))return;const before=[...pointers.values()],old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const after=[...pointers.values()];if(after.length===2){const a=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),b=Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y);if(a>0)zoom=Math.min(4,Math.max(.2,zoom*b/a));}else{const ratio=336/svg.clientWidth;pan.x+=(e.clientX-old.x)*ratio;pan.y+=(e.clientY-old.y)*ratio;}draw();};
 const release=e=>pointers.delete(e.pointerId);svg.onpointerup=svg.onpointercancel=release;svg.ondblclick=()=>{zoom=1;pan={x:0,y:0};draw();};
 svg.onkeydown=e=>{if(['+','=','-','0'].includes(e.key)){e.preventDefault();zoom=e.key==='0'?1:Math.min(4,Math.max(.2,zoom*(e.key==='-'?.8:1.2)));if(e.key==='0')pan={x:0,y:0};draw();}};
 draw();return {update(next){state=next;draw();},resize:draw,dispose(){disposed=true;pointers.clear();}};
}
