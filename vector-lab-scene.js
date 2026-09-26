import {shellPoint,PRESETS,SHELLS} from './core.js?v=0.4.17';
import {framePoint} from './frame-display.js?v=0.4.15';
import {targetPoint} from './spatial.js?v=0.4.17';
export const geoPoint=(lat,lon,radius=4.35)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return [radius*Math.cos(a)*Math.cos(b),radius*Math.sin(a),-radius*Math.cos(a)*Math.sin(b)];};
export const geoCoordinates=p=>{const r=Math.hypot(...p);return {lat:Math.asin(Math.max(-1,Math.min(1,p[1]/r)))*180/Math.PI,lon:Math.atan2(-p[2],p[0])*180/Math.PI};};
// Illustrative positions only. These never enter the record store or analysis.
export function demonstrationCloud(count=1800){
  const halton=(n,base)=>{let value=0,f=1;while(n){f/=base;value+=f*(n%base);n=Math.floor(n/base);}return value;};
  return Array.from({length:count},(_,i)=>[2,3,5].map(base=>(halton(i+11,base)-.5)*8.2));
}
// Curve each original facet onto the sphere without renumbering saved addresses.
export function roundGeosphere(base,radius,steps=8){
  const positions=[],edges=[],centres=[],unit=p=>{const n=Math.hypot(...p);return p.map(x=>x*radius/n);};
  for(let f=0;f<base.length;f+=9){
    const a=Array.from(base.slice(f,f+3)),b=Array.from(base.slice(f+3,f+6)),c=Array.from(base.slice(f+6,f+9));
    const point=(i,j)=>unit(a.map((x,k)=>x+(b[k]-x)*i/steps+(c[k]-x)*j/steps));
    centres.push(unit(a.map((x,k)=>(x+b[k]+c[k])/3)));
    for(let i=0;i<steps;i++)for(let j=0;j<steps-i;j++){
      positions.push(...point(i,j),...point(i+1,j),...point(i,j+1));
      if(i+j<steps-1)positions.push(...point(i+1,j),...point(i+1,j+1),...point(i,j+1));
    }
    for(const [p,q]of [[a,b],[b,c],[c,a]])for(let i=0;i<steps*2;i++){
      const at=t=>unit(p.map((x,k)=>x+(q[k]-x)*t));edges.push(at(i/(steps*2)),at((i+1)/(steps*2)));
    }
  }
  return {positions,edges,centres,trianglesPerFacet:steps*steps};
}
export class VectorLabScene{
  constructor(canvas,onPick){
    const T=globalThis.THREE;this.T=T;this.canvas=canvas;this.onPick=onPick;this.theta=.7;this.phi=.35;this.zoom=1;this.inside=false;this.target='memories';this.selected=null;this.records=[];this.rays=false;this.playing=false;this.disposed=false;
    this.scene=new T.Scene();this.scene.background=new T.Color('#101723');this.camera=new T.PerspectiveCamera(42,1,.025,100);
    this.renderer=new T.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.group=new T.Group();this.scene.add(this.group);this.shells=[];this.shellLines=[];this.shellVisibility=Array(7).fill(true);
    for(let s=0;s<7;s++){
      const positions=[],edges=[];
      for(let r=0;r<12;r++)for(let c=0;c<24;c++){
        const corners=[[c/24,r/12],[(c+1)/24,r/12],[(c+1)/24,(r+1)/12],[c/24,(r+1)/12]].map(([u,v])=>shellPoint(u,v,PRESETS.nested,s));
        for(const i of [0,1,2,0,2,3])positions.push(...corners[i]);
        for(let i=0;i<4;i++)edges.push(corners[i],corners[(i+1)%4]);
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
      const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:SHELLS[s][1],transparent:true,opacity:.025,side:T.DoubleSide,depthWrite:false}));mesh.userData.shell=s;this.scene.add(mesh);this.shells.push(mesh);
      this.shellLines.push(this.lines(edges,SHELLS[s][1],.20,this.scene));
    }
    const baseSphere=new T.IcosahedronGeometry(4.35,1);this.globe=roundGeosphere(baseSphere.attributes.position.array,4.35);baseSphere.dispose();
    const globeGeometry=new T.BufferGeometry();globeGeometry.setAttribute('position',new T.Float32BufferAttribute(this.globe.positions,3));globeGeometry.computeVertexNormals();
    const uv=[];for(let i=0;i<this.globe.positions.length;i+=9){const tri=[];for(let j=0;j<9;j+=3){const {lat,lon}=geoCoordinates(this.globe.positions.slice(i+j,i+j+3));tri.push([(lon+180)/360,(lat+90)/180]);}if(Math.max(...tri.map(p=>p[0]))-Math.min(...tri.map(p=>p[0]))>.5)for(const p of tri)if(p[0]<.5)p[0]++;uv.push(...tri.flat());}
    globeGeometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    this.sphere=new T.Mesh(globeGeometry,new T.MeshBasicMaterial({color:'#567f9e',side:T.DoubleSide,transparent:true,opacity:.08,depthWrite:false}));this.scene.add(this.sphere);
    const grid=[];for(let lat=-75;lat<=75;lat+=15)for(let lon=-180;lon<180;lon+=3)grid.push(geoPoint(lat,lon,4.355),geoPoint(lat,lon+3,4.355));
    for(let lon=-180;lon<180;lon+=30)for(let lat=-90;lat<90;lat+=3)grid.push(geoPoint(lat,lon,4.355),geoPoint(lat+3,lon,4.355));
    this.graticule=this.lines(grid,'#9ec5db',.24,this.scene);
    this.mapReady=false;this.mapFailed=false;
    fetch('assets/earth/ne_110m_land.geojson?v=0.4.21').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(data=>{
      if(this.disposed)return;const image=document.createElement('canvas');image.width=2048;image.height=1024;const ctx=image.getContext('2d');ctx.fillStyle='#163850';ctx.fillRect(0,0,2048,1024);ctx.fillStyle='#739b88';
      for(const feature of data.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const polygon of polygons){ctx.beginPath();for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*2048,y=(90-lat)/180*1024;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.fill('evenodd');}}
      this.mapTexture=new T.CanvasTexture(image);this.mapTexture.wrapS=T.RepeatWrapping;this.sphere.material.map=this.mapTexture;this.sphere.material.color.set('#ffffff');this.sphere.material.needsUpdate=true;this.mapReady=true;this.render();
    }).catch(()=>{this.mapFailed=true;this.canvas.dispatchEvent(new CustomEvent('map-error'));});
    this.scene.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(9,9,9)),new T.LineBasicMaterial({color:'#76949c',transparent:true,opacity:.14})));
    this.demoPositions=demonstrationCloud();this.demoTarget=new T.Vector3();
    const demoGeometry=new T.BufferGeometry();demoGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(this.demoPositions.length*18),3).setUsage(T.DynamicDrawUsage));
    this.demoArrows=new T.LineSegments(demoGeometry,new T.LineBasicMaterial({color:'#b8c4d1',transparent:true,opacity:.54,depthWrite:false}));this.demoArrows.frustumCulled=false;this.scene.add(this.demoArrows);
    const ns='http://www.w3.org/2000/svg';this.axisSvg=document.createElementNS(ns,'svg');this.axisSvg.setAttribute('viewBox','0 0 84 84');this.axisSvg.setAttribute('class','vl-orientation');this.axisSvg.setAttribute('role','img');this.axisSvg.setAttribute('aria-label','3D orientation: X red, Y green and vertical, Z blue');canvas.parentElement.append(this.axisSvg);
    this.axisNodes=[];for(const [name,colour,v]of [['X','#ee8585',[1,0,0]],['Y','#9edc94',[0,1,0]],['Z','#86bafa',[0,0,1]]])for(const sign of [-1,1]){
      const g=document.createElementNS(ns,'g'),line=document.createElementNS(ns,'line'),circle=document.createElementNS(ns,'circle'),label=document.createElementNS(ns,'text');line.setAttribute('stroke',colour);line.setAttribute('stroke-width','2');circle.setAttribute('r',sign>0?'9':'5');circle.setAttribute('fill',sign>0?colour:'#263243');circle.setAttribute('stroke',colour);label.textContent=sign>0?name:'';label.setAttribute('text-anchor','middle');label.setAttribute('dy','.35em');label.setAttribute('fill','#172330');label.setAttribute('font-size','10');label.setAttribute('font-weight','700');g.append(line,circle,label);this.axisSvg.append(g);this.axisNodes.push({g,line,circle,label,vector:new T.Vector3(...v).multiplyScalar(sign)});
    }
    this.raycaster=new T.Raycaster();this.raycaster.params.Points.threshold=.19;
    this.events=new AbortController();const listen=(n,fn)=>canvas.addEventListener(n,fn,{signal:this.events.signal});this.pointers=new Map();
    listen('pointerdown',e=>{const p=framePoint(canvas,e);this.pointers.set(e.pointerId,p);canvas.setPointerCapture(e.pointerId);this.drag={...p,theta:this.theta,phi:this.phi,moved:false};if(this.pointers.size===2){this.drag.moved=true;this.distance=this.pinch();this.midpoint=this.pointerCentre();}else this.followField(e);});
    listen('pointermove',e=>{
      if(!this.pointers.has(e.pointerId)){this.followField(e);return;}
      const p=framePoint(canvas,e);this.pointers.set(e.pointerId,p);
      if(this.pointers.size===2){const d=this.pinch(),centre=this.pointerCentre();this.zoom=Math.max(.45,Math.min(5,this.zoom*d/(this.distance||d)));this.distance=d;if(this.midpoint){this.theta-=(centre.x-this.midpoint.x)*.009;this.phi=Math.max(-1.45,Math.min(1.45,this.phi+(centre.y-this.midpoint.y)*.009));}this.midpoint=centre;this.drag.moved=true;}
      else if(this.drag){const dx=p.x-this.drag.x,dy=p.y-this.drag.y;if(Math.hypot(dx,dy)>4)this.drag.moved=true;if(e.pointerType!=='touch'||!this.fieldInteractive()){this.theta=this.drag.theta-dx*.009;this.phi=Math.max(-1.45,Math.min(1.45,this.drag.phi+dy*.009));}this.followField(e);}
      this.render();
    });
    const release=e=>{const click=this.drag&&!this.drag.moved&&this.pointers.size===1;this.pointers.delete(e.pointerId);this.midpoint=null;const remaining=[...this.pointers.values()][0];this.drag=remaining?{...remaining,theta:this.theta,phi:this.phi,moved:true}:null;if(click&&e.type==='pointerup')this.pick(e);};
    listen('pointerup',release);listen('pointercancel',release);
    canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.45,Math.min(5,this.zoom*Math.exp(-e.deltaY*.001)));this.render();},{passive:false,signal:this.events.signal});
    listen('dblclick',()=>{this.zoom=1;this.theta=.7;this.phi=.35;this.render();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(this.frame);else this.render();},{signal:this.events.signal});
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
  }
  pointerCentre(){const [a,b]=[...this.pointers.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
  pinch(){const [a,b]=[...this.pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);}
  lines(points,colour,opacity=.5,parent=this.group){const T=this.T,g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),o=new T.LineSegments(g,new T.LineBasicMaterial({color:colour,transparent:true,opacity,depthWrite:false}));parent.add(o);return o;}
  anchorPoint(a){if(a.kind==='geosphere')return Number.isFinite(a.lat)&&Number.isFinite(a.lon)?geoPoint(a.lat,a.lon):this.globe.centres[a.index-1];return targetPoint({...a,face:a.side},PRESETS.nested);}
  clearGroup(){this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.clear();}
  update(records,selected,related=[]){
    this.records=records;this.selected=selected;this.hasVectors=records.some(r=>r.values.length);this.clearGroup();const T=this.T;
    // Rendering budget only. Every record remains available in the searchable inspector.
    this.visible=records.filter(r=>r.values.length).slice(0,600);if(selected?.values.length&&!this.visible.some(r=>r.id===selected.id))this.visible.push(selected);
    const positions=this.visible.flatMap(r=>r.position.map(x=>x*4.1)),colours=this.visible.flatMap(r=>new T.Color(r.colour).toArray()),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colours,3));
    this.points=new T.Points(g,new T.PointsMaterial({size:.16,vertexColors:true,transparent:true,opacity:.92,depthTest:false}));this.group.add(this.points);
    if(selected?.values.length){const pos=selected.position.map(x=>x*4.1),sphere=new T.Mesh(new T.SphereGeometry(.12,12,8),new T.MeshBasicMaterial({color:selected.colour,wireframe:true,depthTest:false}));sphere.position.fromArray(pos);this.group.add(sphere);this.marker=sphere;
      for(const a of selected.anchors)this.lines([pos,this.anchorPoint(a)],'#f8de98',.95);
      for(const {record:r} of related)this.lines([pos,r.position.map(x=>x*4.1)],'#a1e3db',.5);
      const v=new T.Vector3(...selected.direction);if(v.length()>0){const arrow=new T.ArrowHelper(v.normalize(),new T.Vector3(...pos),.4+Math.abs(selected.charge)*1.2,selected.colour,.18,.09);this.group.add(arrow);}
      if(this.rays){this.lines([[0,0,0],pos],selected.colour,.8);for(const a of selected.anchors)this.lines([[0,0,0],this.anchorPoint(a)],'#f8de98',.6);}
    }else this.marker=null;
    if(this.address){const pos=this.anchorPoint(this.address),m=new T.Mesh(new T.SphereGeometry(.10,10,8),new T.MeshBasicMaterial({color:'#fff3b0',depthTest:false}));m.position.fromArray(pos);this.group.add(m);}
    this.render();
  }
  resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.render();}
  render(){
    if(this.disposed)return;cancelAnimationFrame(this.frame);const radius=this.inside?1.3/this.zoom:15/this.zoom;
    const mapView=this.target==='geosphere';this.sphere.material.opacity=mapView?1:.10;this.sphere.material.depthWrite=mapView;this.graticule.material.opacity=mapView?.48:.24;
    this.demoArrows.visible=!this.hasVectors&&!mapView;this.demoArrows.material.opacity=this.target==='memories'?.54:.16;
    this.shells.forEach((mesh,i)=>{mesh.visible=this.shellVisibility[i];this.shellLines[i].visible=mesh.visible;this.shellLines[i].material.opacity=this.target===String(i)?.72:.20;});
    this.camera.position.set(radius*Math.sin(this.theta)*Math.cos(this.phi),radius*Math.sin(this.phi),radius*Math.cos(this.theta)*Math.cos(this.phi));
    if(this.inside){const d=this.camera.position.clone().normalize();this.camera.lookAt(this.camera.position.clone().add(d));}else this.camera.lookAt(0,0,0);
    const inverse=this.camera.quaternion.clone().invert();for(const a of this.axisNodes){const p=a.vector.clone().applyQuaternion(inverse);a.depth=p.z;const x=42+p.x*27,y=42-p.y*27;a.line.setAttribute('x1','42');a.line.setAttribute('y1','42');a.line.setAttribute('x2',x);a.line.setAttribute('y2',y);a.circle.setAttribute('cx',x);a.circle.setAttribute('cy',y);a.label.setAttribute('x',x);a.label.setAttribute('y',y);a.g.setAttribute('opacity',p.z<0?'.5':'1');}for(const a of [...this.axisNodes].sort((a,b)=>a.depth-b.depth))this.axisSvg.append(a.g);
    if(this.marker){const hz=this.selected?.frequency||0,t=performance.now()/1000,pulse=this.playing&&hz&&!matchMedia('(prefers-reduced-motion: reduce)').matches?1+.35*Math.sin(t*2*Math.PI*hz):1;this.marker.scale.setScalar(pulse);}
    if(this.demoArrows.visible)this.updateField();
    this.renderer.render(this.scene,this.camera);
    if(this.playing&&!document.hidden&&this.selected?.frequency&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.frame=requestAnimationFrame(()=>this.render());
  }
  pick(e){const T=this.T,p=framePoint(this.canvas,e);this.raycaster.setFromCamera(new T.Vector2(p.u*2-1,1-p.v*2),this.camera);
    if(this.target==='memories'){if(this.demoArrows.visible){this.followField(e);return;}const hit=this.points&&this.raycaster.intersectObject(this.points)[0];if(hit)this.onPick({record:this.visible[hit.index].id});}
    else{const globe=this.target==='geosphere',mesh=globe?this.sphere:this.shells[Number(this.target)],hit=mesh.visible&&this.raycaster.intersectObject(mesh)[0];if(hit)this.onPick({address:globe?{kind:'geosphere',index:Math.floor(hit.faceIndex/this.globe.trianglesPerFacet)+1,side:this.inside?'I':'O',body:'Earth',...geoCoordinates(hit.point.toArray())}:{kind:'facet',shell:Number(this.target),index:Math.floor(hit.faceIndex/2)+1,side:this.inside?'I':'O'}});}
  }
  setShellVisible(index,visible){if(!Number.isInteger(index)||index<0||index>6)return;this.shellVisibility[index]=Boolean(visible);this.render();}
  fieldInteractive(){return this.demoArrows.visible&&this.target==='memories';}
  followField(e){
    if(!this.fieldInteractive())return;const T=this.T,p=framePoint(this.canvas,e);
    this.camera.updateMatrixWorld();this.raycaster.setFromCamera(new T.Vector2(p.u*2-1,1-p.v*2),this.camera);
    // Touch and mouse both target the camera-facing plane through the cubic volume.
    const normal=this.camera.getWorldDirection(new T.Vector3()),plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,new T.Vector3()),hit=new T.Vector3();
    if(this.raycaster.ray.intersectPlane(plane,hit)){this.demoTarget.copy(hit).clampScalar(-4.1,4.1);this.render();}
  }
  updateField(){
    const T=this.T,buffer=this.demoArrows.geometry.attributes.position,normal=this.camera.getWorldDirection(new T.Vector3()),direction=new T.Vector3(),wing=new T.Vector3(),tip=new T.Vector3(),tail=new T.Vector3(),head=new T.Vector3();let offset=0;
    const write=v=>{buffer.array[offset++]=v.x;buffer.array[offset++]=v.y;buffer.array[offset++]=v.z;};
    for(const position of this.demoPositions){
      tail.fromArray(position);direction.copy(this.demoTarget).sub(tail);if(direction.lengthSq()<1e-8)direction.set(0,1,0);direction.normalize();
      wing.crossVectors(direction,normal);if(wing.lengthSq()<1e-8)wing.crossVectors(direction,new T.Vector3(0,1,0));if(wing.lengthSq()<1e-8)wing.set(1,0,0);wing.normalize();
      tip.copy(tail).addScaledVector(direction,.24);write(tail);write(tip);
      for(const sign of [-1,1]){head.copy(tip).addScaledVector(direction,-.085).addScaledVector(wing,sign*.055);write(tip);write(head);}
    }
    buffer.needsUpdate=true;
  }
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.events.abort();this.observer.disconnect();this.axisSvg.remove();this.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.mapTexture?.dispose();this.renderer.dispose();this.renderer.forceContextLoss();}
}
