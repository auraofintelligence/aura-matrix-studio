import {SHELLS,PRESETS,shellPoint} from './core.js?v=0.4.17';

// A deterministic visual storyboard, not a physical forecast. All dimensions
// and source terms can later be supplied by a versioned event dataset.
const T=globalThis.THREE;
if(!T)throw Error('Three.js is required for this scene.');
const roles=[
  ['Source','Propellant source','An event record identifies what was introduced, where and when.'],
  ['Transport','Neutral transport','The released material expands and moves through the surrounding air.'],
  ['Chemistry','Atmospheric chemistry','Molecules may react differently as altitude, light and background composition change.'],
  ['Particles','Particles and deposition','Condensed material can remain suspended, move between layers or eventually settle.'],
  ['Plasma','Charged particles','Neutral exhaust can interact with ambient ions and alter local electron density.'],
  ['Fields','Electromagnetic response','A changed plasma can affect waves, fields and radio propagation.'],
  ['Evidence','Consequences and evidence','Compare predictions with observations and retain uncertainty and provenance.']
];
const chapters=[
  {at:0,title:'Before ignition',number:'CHAPTER 01 · BACKGROUND',copy:'The background atmosphere and seven linked pattern systems are in view. Press Play or drag the timeline to introduce the event.',alt:'Ground · 0 km',shell:0},
  {at:.10,title:'A source enters the sky',number:'CHAPTER 02 · IGNITION',copy:'A fictional vehicle introduces an exhaust plume. Its source record follows a trajectory rather than becoming a single floating point.',alt:'Ascent · altitude exaggerated',shell:0},
  {at:.26,title:'Through the stratosphere',number:'CHAPTER 03 · CHEMISTRY',copy:'Transport spreads the plume through a chemically distinct region. This visual shows a possible interaction pathway, not a calculated ozone change.',alt:'Stratosphere · schematic band',shell:2},
  {at:.43,title:'Across a thin frontier',number:'CHAPTER 04 · PARTICLES',copy:'Higher up, the same material enters thinner, drier air. Particle behaviour and residence time need species-specific calculations.',alt:'Mesosphere · schematic band',shell:3},
  {at:.60,title:'A plume meets plasma',number:'CHAPTER 05 · IONOSPHERE',copy:'Neutral species enter ionised surroundings. Charge exchange and recombination could change local electron density and instrument readings.',alt:'Ionosphere · overlapping region',shell:4},
  {at:.77,title:'Signals in the wake',number:'CHAPTER 06 · FIELD RESPONSE',copy:'A plasma disturbance may affect fields and radio signals. The glowing arcs are a relationship trace, not measured wave amplitudes.',alt:'Low Earth orbit · schematic',shell:5},
  {at:.91,title:'Compare what remains',number:'CHAPTER 07 · EVIDENCE',copy:'Trace the proposed effect back to its event, reaction and measurement. Compare the event with a no-event baseline before drawing conclusions.',alt:'Observation window · illustrative',shell:6}
];
const $=id=>document.getElementById(id),time=$('time'),play=$('play'),baseline=$('baseline'),fieldButton=$('vector-field');
let progress=0,playing=false,noEvent=false,vectorOn=true,chosen=null,lastFrame=0,dirty=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const colour=i=>new T.Color(SHELLS[i][1]);
const smoother=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const geo=(lat,lon,r)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return new T.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b));};
const route=t=>geo(-25+41*t,150+73*t,3.24+.84*smoother(t));
function material(c,opacity){return new T.MeshBasicMaterial({color:c,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});}
function stars(scene,count,spread,seed){let x=seed;const rand=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};const points=[];for(let i=0;i<count;i++){let p=new T.Vector3((rand()-.5)*spread,(rand()-.5)*spread,(rand()-.5)*spread);if(p.length()<5)p.setLength(5);points.push(p);}const g=new T.BufferGeometry().setFromPoints(points);const m=new T.PointsMaterial({color:0xa9c3d4,size:.018,transparent:true,opacity:.47,depthWrite:false});scene.add(new T.Points(g,m));}
function createView(canvas,background,cameraZ){
  const scene=new T.Scene();scene.background=new T.Color(background);stars(scene,390,38,canvas.id.length*97531);
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
  const camera=new T.PerspectiveCamera(40,1,.1,100);camera.position.set(0,0,cameraZ);camera.lookAt(0,0,0);
  const group=new T.Group();scene.add(group);
  const view={scene,renderer,camera,group,theta:.45,phi:.25,drag:null};
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);view.drag={x:e.clientX,y:e.clientY,theta:view.theta,phi:view.phi};});
  canvas.addEventListener('pointermove',e=>{if(!view.drag)return;view.theta=view.drag.theta+(e.clientX-view.drag.x)*.006;view.phi=Math.max(-1.2,Math.min(1.2,view.drag.phi+(e.clientY-view.drag.y)*.006));dirty=true;});
  const end=()=>view.drag=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  view.resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;};
  new ResizeObserver(view.resize).observe(canvas);view.resize();
  return view;
}
const earth=createView($('earth-scene'),0x07111e,12.5),pattern=createView($('pattern-scene'),0x0b1120,10.9);

// Earth is a geographic orientation aid. The altitude bands are intentionally
// expanded for legibility; they are not drawn to scale.
const landCanvas=document.createElement('canvas');landCanvas.width=1024;landCanvas.height=512;
const ctx=landCanvas.getContext('2d');ctx.fillStyle='#15354d';ctx.fillRect(0,0,1024,512);
const globe=new T.Mesh(new T.SphereGeometry(3.2,64,40),material('#ffffff',1));
const landTexture=new T.CanvasTexture(landCanvas);landTexture.wrapS=T.RepeatWrapping;landTexture.offset.x=-.25;globe.material.map=landTexture;earth.group.add(globe);
fetch('assets/earth/ne_110m_land.geojson').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(data=>{
  ctx.fillStyle='#648a86';for(const feature of data.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const polygon of polygons){ctx.beginPath();for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*1024,y=(90-lat)/180*512;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.fill('evenodd');}}landTexture.needsUpdate=true;dirty=true;
}).catch(()=>{ctx.strokeStyle='#7aa1ad';ctx.lineWidth=1;for(let x=0;x<1024;x+=85){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}landTexture.needsUpdate=true;dirty=true;});
const atmosphere=new T.Mesh(new T.SphereGeometry(3.33,48,28),material('#82c9eb',.12));earth.group.add(atmosphere);
const bands=[3.43,3.58,3.79,4.06].map((r,i)=>{const m=new T.Mesh(new T.SphereGeometry(r,32,20),material(['#d8ae83','#78b9d4','#b4abea','#71b9e2'][i],.035));m.material.wireframe=true;earth.group.add(m);return m;});
const pathPoints=Array.from({length:101},(_,i)=>route(i/100));
const path=new T.Line(new T.BufferGeometry().setFromPoints(pathPoints),new T.LineBasicMaterial({color:0xe3c493,transparent:true,opacity:.58}));earth.group.add(path);
const vehicle=new T.Mesh(new T.IcosahedronGeometry(.07,1),new T.MeshBasicMaterial({color:0xffdf9c}));earth.group.add(vehicle);
const plumeCount=850,plumeOffsets=[],plumeArray=new Float32Array(plumeCount*3);
let seed=124188;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<plumeCount;i++)plumeOffsets.push(new T.Vector3(rand()*2-1,rand()*2-1,rand()*2-1).normalize().multiplyScalar(Math.pow(rand(),.6)));
const plumeGeo=new T.BufferGeometry();plumeGeo.setAttribute('position',new T.BufferAttribute(plumeArray,3));
const plume=new T.Points(plumeGeo,new T.PointsMaterial({color:0xefd1a7,size:.035,transparent:true,opacity:.75,depthWrite:false}));earth.group.add(plume);
const halo=new T.Mesh(new T.SphereGeometry(.45,22,14),material('#86bff0',.10));earth.group.add(halo);

// A directional diagram with no physical units. The toggle hides both field
// layers while preserving the event, trajectory and Aura shell selection.
function vectorLayer(parent,count,tint,place,initialSeed){
  let state=initialSeed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
  const origins=Array.from({length:count},()=>place(random));
  const array=new Float32Array(count*18),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(array,3));
  const lines=new T.LineSegments(geometry,new T.LineBasicMaterial({color:tint,transparent:true,opacity:.50,depthWrite:false}));parent.add(lines);
  const up=new T.Vector3(0,1,0),wing=new T.Vector3(),tip=new T.Vector3(),back=new T.Vector3();
  return {lines,update(direction){let n=0;const put=p=>{array[n++]=p.x;array[n++]=p.y;array[n++]=p.z;};
    for(const origin of origins){const dir=direction(origin).normalize();wing.crossVectors(dir,up);if(wing.lengthSq()<.001)wing.set(1,0,0);wing.normalize();
      tip.copy(origin).addScaledVector(dir,.18);back.copy(tip).addScaledVector(dir,-.065);
      put(origin);put(tip);put(tip);put(back.clone().addScaledVector(wing,.043));put(tip);put(back.clone().addScaledVector(wing,-.043));
    }geometry.attributes.position.needsUpdate=true;
  }};
}
const earthVectors=vectorLayer(earth.group,175,0x96c9d9,random=>{
  const y=random()*2-1,a=random()*Math.PI*2,r=3.43+random()*.7,v=Math.sqrt(1-y*y);
  return new T.Vector3(r*v*Math.cos(a),r*y,r*v*Math.sin(a));
},31583);
const patternVectors=vectorLayer(pattern.group,220,0xd6c498,random=>new T.Vector3((random()-.5)*5.8,(random()-.5)*5.8,(random()-.5)*5.8),78211);

// Actual 12 x 24 horn-torus geometry from Aura core: identities survive the
// cinematic rendering. Facet 137 is highlighted on each shell as a shared key.
const meshes=[],markers=[],threads=[];
for(let s=0;s<7;s++){
  const positions=[];for(let r=0;r<12;r++)for(let c=0;c<24;c++){
    const corners=[[c/24,r/12],[(c+1)/24,r/12],[(c+1)/24,(r+1)/12],[c/24,(r+1)/12]].map(([u,v])=>shellPoint(u,v,PRESETS.nested,s));
    for(const n of [0,1,2,0,2,3])positions.push(...corners[n]);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  const mesh=new T.Mesh(g,material(SHELLS[s][1],.045));pattern.group.add(mesh);meshes.push(mesh);
  const c=16,r=5,p=shellPoint((c+.5)/24,(r+.5)/12,PRESETS.nested,s);
  const marker=new T.Mesh(new T.SphereGeometry(.065,12,8),new T.MeshBasicMaterial({color:SHELLS[s][1],transparent:true,opacity:.5,depthTest:false}));marker.position.set(...p);pattern.group.add(marker);markers.push(marker);
  if(s){const line=new T.Line(new T.BufferGeometry().setFromPoints([markers[s-1].position,marker.position]),new T.LineBasicMaterial({color:0xe2c49d,transparent:true,opacity:.12,depthTest:false}));pattern.group.add(line);threads.push(line);}
}
const centreGlow=new T.Mesh(new T.SphereGeometry(.075,16,12),material('#f6dea8',.7));pattern.group.add(centreGlow);

const nav=$('shell-nav');roles.forEach(([name],s)=>{const b=document.createElement('button');b.type='button';b.style.setProperty('--shell',SHELLS[s][1]);b.innerHTML=`<span>${SHELLS[s][0]}</span><small>${name}</small>`;b.setAttribute('aria-label',`Inspect ${SHELLS[s][0]}: ${name}`);b.addEventListener('click',()=>{chosen=s;updateText();dirty=true;});nav.append(b);});
function chapterAt(p){let current=chapters[0];for(const c of chapters){if(p>=c.at)current=c;}return current;}
function updateText(){
  const c=chapterAt(progress),s=chosen??c.shell;
  $('stage-number').textContent=c.number;$('stage-title').textContent=noEvent?'Background without the event':c.title;
  $('stage-copy').textContent=noEvent?'The event source is removed in this comparison view. The background atmosphere remains; the coloured plume and event connections disappear. This is a visual baseline, not a computed counterfactual.':c.copy;
  $('altitude').textContent=c.alt;$('address').textContent=`${SHELLS[s][0]} · O137`;
  $('selected-title').textContent=roles[s][1];$('selected-copy').textContent=roles[s][2];$('selected-address').textContent=`${SHELLS[s][0]} O137`;
  $('selected-evidence').textContent='Illustrative storyboard';
  for(const [i,b]of [...nav.children].entries())b.setAttribute('aria-pressed',String(i===s));
  const seconds=Math.round(progress*100);$('time-label').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} / 01:40`;
  time.value=String(Math.round(progress*1000));
}
function draw(){
  const c=chapterAt(progress),active=chosen??c.shell,phase=smoother(Math.max(0,(progress-.08)/.79));
  vehicle.position.copy(route(phase));vehicle.visible=!noEvent&&progress>=.08;
  plume.visible=!noEvent&&progress>=.09;
  if(plume.visible){
    const centre=route(Math.max(0,phase-.035));const radial=centre.clone().normalize(),age=Math.min(1,(progress-.09)*1.45),spread=.04+age*.58;
    for(let i=0;i<plumeCount;i++){const o=plumeOffsets[i],trail=(i%31)/31*.34*age;const p=centre.clone().addScaledVector(o,spread*(.3+.7*((i%17)/17))).addScaledVector(radial,-trail);plumeArray[3*i]=p.x;plumeArray[3*i+1]=p.y;plumeArray[3*i+2]=p.z;}
    plumeGeo.attributes.position.needsUpdate=true;halo.position.copy(centre);halo.scale.setScalar(1+age*1.7);
  }
  halo.visible=plume.visible&&progress>=.60;
  earthVectors.lines.visible=vectorOn;patternVectors.lines.visible=vectorOn;
  if(vectorOn){const plumeCentre=route(phase),target=markers[active].position;
    earthVectors.update(origin=>{const tangent=new T.Vector3(-origin.z,.14,origin.x).normalize();const pull=plumeCentre.clone().sub(origin),distance=pull.length();return tangent.addScaledVector(pull.normalize(),noEvent?0:Math.max(0,1-distance/2)*1.8);});
    patternVectors.update(origin=>{const swirl=new T.Vector3(-origin.z,.08,origin.x).multiplyScalar(.5);return target.clone().sub(origin).add(swirl);});
  }
  bands.forEach((b,i)=>b.material.opacity=(progress>.18+i*.15&&!noEvent)?.07:.022);
  meshes.forEach((m,i)=>{const passed=progress>=chapters[Math.min(i,6)].at+.08;m.material.opacity=noEvent?.018:i===active?.16:passed?.08:.035;markers[i].material.opacity=noEvent?.12:i===active?1:passed?.7:.25;markers[i].scale.setScalar(i===active?1.6:1);});
  threads.forEach((l,i)=>l.material.opacity=noEvent?.035:progress>=chapters[Math.min(i+1,6)].at?.54:.10);
  earth.group.rotation.set(earth.phi*.25,earth.theta,0);pattern.group.rotation.set(pattern.phi*.5,pattern.theta,0);
  earth.renderer.render(earth.scene,earth.camera);pattern.renderer.render(pattern.scene,pattern.camera);dirty=false;
}
function tick(now){const dt=Math.min(.06,(now-lastFrame)/1000||0);lastFrame=now;if(playing){progress=Math.min(1,progress+dt/100);if(progress>=1){playing=false;play.innerHTML='▶ <span>Replay journey</span>';play.setAttribute('aria-label','Replay sequence');}updateText();}if(playing||dirty)draw();requestAnimationFrame(tick);}
play.addEventListener('click',()=>{if(progress>=1)progress=0;playing=!playing;play.innerHTML=playing?'Ⅱ <span>Pause journey</span>':'▶ <span>Play journey</span>';play.setAttribute('aria-label',playing?'Pause sequence':'Play sequence');updateText();});
time.addEventListener('input',()=>{progress=Number(time.value)/1000;chosen=null;updateText();dirty=true;});
baseline.addEventListener('click',()=>{noEvent=!noEvent;baseline.setAttribute('aria-pressed',String(noEvent));baseline.textContent=noEvent?'Show event':'Without event';updateText();dirty=true;});
fieldButton.addEventListener('click',()=>{vectorOn=!vectorOn;fieldButton.setAttribute('aria-pressed',String(vectorOn));fieldButton.textContent=`Vector field: ${vectorOn?'on':'off'}`;dirty=true;});
reduce.addEventListener('change',()=>{if(reduce.matches&&playing){playing=false;play.innerHTML='▶ <span>Play journey</span>';}});
updateText();requestAnimationFrame(tick);
