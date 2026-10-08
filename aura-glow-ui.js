import {GLOW_PATTERNS,glowPoint,validateAuraGlow} from './aura-glow-data.js?v=0.4.26';
import {readPersonalSpace,SPACE_LAYERS} from './personal-space-data.js?v=0.4.26';
import {humanReference,svgNode} from './aura-human.js?v=0.4.26';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.26';
export const GLOW_UP='aura-glow-up';
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function mountAuraGlow({screen,go,onContinue=null,compact=false}){
 if(!compact)for(const child of screen.children)child.hidden=true;
 const panel=make('section',compact?'quick-glow-up':'avatar-panel aura-glow-page'),project=readTravelProject(),space=readPersonalSpace(project);let config={...project.auraGlow},disposed=false,visible=true,animation=0,last=0,time=0,angle=.25,drag=null,paused=false;
 if(!config.enabled){config.seed=crypto.getRandomValues(new Uint32Array(1))[0];config.enabled=true;writeTravelProject(p=>({...p,auraGlow:config}));}
 const button=(label,fn,cls='quick-secondary')=>{const b=make('button',cls,label);b.type='button';b.onclick=fn;return b;};
 if(!compact){const head=make('header','avatar-header');head.append(button('Back',()=>go('command:back')),make('h1','','Aura Glow-Up'));panel.append(head,make('p','quick-intro','Shape a living field around your avatar.'));}
 const scene=make('div','aura-glow-scene'),canvas=make('canvas'),human=svgNode('svg',{viewBox:'0 0 336 340','aria-label':'Avatar reference',role:'img'});canvas.setAttribute('aria-label','Evolving ornate Aura. Drag to turn the field.');canvas.setAttribute('role','img');canvas.tabIndex=0;human.append(humanReference(space.figure,'front',168,252,176));scene.append(canvas,human);
 const toolbar=make('div','aura-glow-toolbar'),pause=button('Pause',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';draw();}),variation=button('New variation',()=>{config.seed=crypto.getRandomValues(new Uint32Array(1))[0];save();draw();});toolbar.append(pause,variation);scene.append(toolbar);panel.append(scene);
 const form=make('form','quick-welcome glow-controls'),patterns=make('div','quick-answer-choices glow-patterns');patterns.setAttribute('role','group');patterns.setAttribute('aria-label','Aura form');
 for(const [id,label]of GLOW_PATTERNS){const b=button(label,()=>{config.pattern=id;save();sync();draw();});b.dataset.pattern=id;patterns.append(b);}form.append(patterns);
 const controls=[];for(const [key,label]of [['detail','Detail'],['glow','Radiance'],['flow','Flow']]){const wrap=make('label','glow-slider'),line=make('span'),output=make('output'),input=make('input');input.type='range';input.min=0;input.max=100;input.step=5;input.value=Math.round(config[key]*100);input.setAttribute('aria-label','Aura '+label.toLowerCase());line.append(document.createTextNode(label),output);wrap.append(line,input);input.oninput=()=>{config[key]=Number(input.value)/100;output.textContent=input.value+'%';save();draw();};output.textContent=input.value+'%';form.append(wrap);controls.push(input);}
 const status=make('p','quick-message');status.setAttribute('role','status');
 const submit=make('button','quick-primary',onContinue?'Save & continue':'Save Aura');submit.type='submit';form.append(submit);form.onsubmit=e=>{e.preventDefault();try{save();if(onContinue)onContinue();else status.textContent='Aura saved.';}catch(error){status.textContent=error.message;}};panel.append(form,status);screen.append(panel);
 if(!compact)panel.append(button('Open matrix',()=>go('1773263D-945B-4087-ACEF-8C088C29FB47')));
 function save(){config=validateAuraGlow({...config,enabled:true});writeTravelProject(p=>({...p,auraGlow:config}));}
 function sync(){for(const b of patterns.children)b.setAttribute('aria-pressed',String(b.dataset.pattern===config.pattern));}sync();
 const ctx=canvas.getContext('2d');
 function projectPoint(p,w,h){const c=Math.cos(angle),s=Math.sin(angle),x=p[0]*c-p[2]*s,z=p[0]*s+p[2]*c,perspective=1/(1-z*.18);return [w/2+x*w*.38*perspective,h*.5-p[1]*h*.4*perspective];}
 function draw(timestamp=performance.now()){
  if(disposed||!ctx)return;cancelAnimationFrame(animation);animation=0;
  const w=Math.max(240,scene.clientWidth||336),h=Math.max(300,scene.clientHeight||340),ratio=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);
  if(last&&visible&&!document.hidden&&!paused)time+=Math.min((timestamp-last)/1000,.05);last=timestamp;
  const bg=ctx.createRadialGradient(w/2,h/2,8,w/2,h/2,h*.7);bg.addColorStop(0,'#172844');bg.addColorStop(.65,'#10172b');bg.addColorStop(1,'#080d1a');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='lighter';
  for(let shell=6;shell>=0;shell--){
   const colour=SPACE_LAYERS[shell].colour,count=Math.round(10+config.detail*20),steps=72;ctx.strokeStyle=colour;ctx.lineWidth=config.pattern==='mist'?1.8:config.pattern==='petals'?.9:.65;
   ctx.shadowColor=colour;ctx.shadowBlur=config.pattern==='mist'?14:3+config.glow*7;ctx.globalAlpha=(config.pattern==='mist'?.09:.13)+config.glow*.15;
   for(let i=0;i<count;i++){
    const u=i/count*Math.PI*2;ctx.beginPath();for(let j=0;j<=steps;j++){const v=j/steps*Math.PI*2,point=glowPoint(config,space,shell,u,v,time),[x,y]=projectPoint(point,w,h);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
   }
   if(config.pattern!=='mist'){ctx.globalAlpha=.055+config.detail*.04;ctx.shadowBlur=2;for(let i=0;i<12;i++){const v=(i+.5)/12*Math.PI*2;ctx.beginPath();for(let j=0;j<=72;j++){const point=glowPoint(config,space,shell,j/72*Math.PI*2,v,time),[x,y]=projectPoint(point,w,h);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}
   ctx.shadowBlur=5;ctx.fillStyle='#e5eeff';ctx.globalAlpha=.2+config.glow*.4;
   for(let i=0;i<Math.round(5+config.detail*9);i++){const u=(i*2.399+config.seed%31),v=(i*.91+time*.13+shell*.7)%(Math.PI*2),[x,y]=projectPoint(glowPoint(config,space,shell,u,v,time),w,h);ctx.beginPath();ctx.arc(x,y,.55+config.glow*.7,0,Math.PI*2);ctx.fill();}
  }
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';canvas.dataset.pattern=config.pattern;canvas.dataset.seed=String(config.seed);canvas.dataset.time=time.toFixed(3);
  if(visible&&!document.hidden&&!paused&&config.flow>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches)animation=requestAnimationFrame(draw);
 }
 canvas.onpointerdown=e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(drag===null)return;angle+=(e.clientX-drag)*.007;drag=e.clientX;draw();};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
 canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' ')pause.click();else{angle+=e.key==='ArrowLeft'?-.15:.15;draw();}}};
 const observer=new ResizeObserver(()=>draw());observer.observe(scene);const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;draw();});intersection.observe(scene);const onVisibility=()=>{last=0;draw();};document.addEventListener('visibilitychange',onVisibility);draw();
 return {resize:draw,dispose(){disposed=true;cancelAnimationFrame(animation);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',onVisibility);panel.remove();}};
}
