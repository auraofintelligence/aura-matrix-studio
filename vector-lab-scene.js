import {shellPoint,PRESETS,SHELLS} from './core.js?v=0.4.17';
import {framePoint} from './frame-display.js?v=0.4.15';
import {targetPoint} from './spatial.js?v=0.4.17';
export class VectorLabScene{
  constructor(canvas,onPick){
    const T=globalThis.THREE;this.T=T;this.canvas=canvas;this.onPick=onPick;this.theta=.7;this.phi=.35;this.zoom=1;this.inside=false;this.target='memories';this.selected=null;this.records=[];this.rays=false;this.playing=false;this.disposed=false;
    this.scene=new T.Scene();this.scene.background=new T.Color('#101723');this.camera=new T.PerspectiveCamera(42,1,.025,100);
    this.renderer=new T.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.group=new T.Group();this.scene.add(this.group);this.shells=[];
    for(let s=0;s<7;s++){
      const positions=[],edges=[];
      for(let r=0;r<12;r++)for(let c=0;c<24;c++){
        const corners=[[c/24,r/12],[(c+1)/24,r/12],[(c+1)/24,(r+1)/12],[c/24,(r+1)/12]].map(([u,v])=>shellPoint(u,v,PRESETS.nested,s));
        for(const i of [0,1,2,0,2,3])positions.push(...corners[i]);
        for(let i=0;i<4;i++)edges.push(corners[i],corners[(i+1)%4]);
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
      const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:SHELLS[s][1],transparent:true,opacity:.025,side:T.DoubleSide,depthWrite:false}));mesh.userData.shell=s;this.scene.add(mesh);this.shells.push(mesh);
      this.lines(edges,SHELLS[s][1],.20,this.scene);
    }
    this.sphere=new T.Mesh(new T.IcosahedronGeometry(4.35,1),new T.MeshBasicMaterial({color:'#c9dbeb',side:T.DoubleSide,transparent:true,opacity:.018,depthWrite:false}));this.scene.add(this.sphere);
    this.scene.add(new T.LineSegments(new T.WireframeGeometry(this.sphere.geometry),new T.LineBasicMaterial({color:'#9eb4cd',transparent:true,opacity:.18})));
    this.scene.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(9,9,9)),new T.LineBasicMaterial({color:'#76949c',transparent:true,opacity:.14})));
    this.raycaster=new T.Raycaster();this.raycaster.params.Points.threshold=.19;
    this.events=new AbortController();const listen=(n,fn)=>canvas.addEventListener(n,fn,{signal:this.events.signal});this.pointers=new Map();
    listen('pointerdown',e=>{const p=framePoint(canvas,e);this.pointers.set(e.pointerId,p);canvas.setPointerCapture(e.pointerId);this.drag={...p,theta:this.theta,phi:this.phi,moved:false};if(this.pointers.size===2){this.drag.moved=true;this.distance=this.pinch();}});
    listen('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const p=framePoint(canvas,e);this.pointers.set(e.pointerId,p);if(this.pointers.size===2){const d=this.pinch();this.zoom=Math.max(.45,Math.min(5,this.zoom*d/(this.distance||d)));this.distance=d;this.drag.moved=true;}else if(this.drag){const dx=p.x-this.drag.x,dy=p.y-this.drag.y;if(Math.hypot(dx,dy)>4)this.drag.moved=true;this.theta=this.drag.theta-dx*.009;this.phi=Math.max(-1.45,Math.min(1.45,this.drag.phi+dy*.009));}this.render();});
    listen('pointerup',e=>{const click=this.drag&&!this.drag.moved&&this.pointers.size===1;this.pointers.delete(e.pointerId);this.drag=null;if(click)this.pick(e);});listen('pointercancel',e=>{this.pointers.delete(e.pointerId);this.drag=null;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.45,Math.min(5,this.zoom*Math.exp(-e.deltaY*.001)));this.render();},{passive:false,signal:this.events.signal});
    listen('dblclick',()=>{this.zoom=1;this.theta=.7;this.phi=.35;this.render();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(this.frame);else this.render();},{signal:this.events.signal});
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
  }
  pinch(){const [a,b]=[...this.pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);}
  lines(points,colour,opacity=.5,parent=this.group){const T=this.T,g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),o=new T.LineSegments(g,new T.LineBasicMaterial({color:colour,transparent:true,opacity,depthWrite:false}));parent.add(o);return o;}
  anchorPoint(a){if(a.kind==='geosphere'){const p=this.sphere.geometry.attributes.position,i=(a.index-1)*3;return [0,1,2].map(k=>(p.array[i*3+k]+p.array[(i+1)*3+k]+p.array[(i+2)*3+k])/3);}return targetPoint({...a,face:a.side},PRESETS.nested);}
  clearGroup(){this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.clear();}
  update(records,selected,related=[]){
    this.records=records;this.selected=selected;this.clearGroup();const T=this.T;
    // Rendering budget only. Every record remains available in the searchable inspector.
    this.visible=records.slice(0,600);if(selected&&!this.visible.some(r=>r.id===selected.id))this.visible.push(selected);
    const positions=this.visible.flatMap(r=>r.position.map(x=>x*4.1)),colours=this.visible.flatMap(r=>new T.Color(r.colour).toArray()),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colours,3));
    this.points=new T.Points(g,new T.PointsMaterial({size:.16,vertexColors:true,transparent:true,opacity:.92,depthTest:false}));this.group.add(this.points);
    if(selected){const pos=selected.position.map(x=>x*4.1),sphere=new T.Mesh(new T.SphereGeometry(.12,12,8),new T.MeshBasicMaterial({color:selected.colour,wireframe:true,depthTest:false}));sphere.position.fromArray(pos);this.group.add(sphere);this.marker=sphere;
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
    this.camera.position.set(radius*Math.sin(this.theta)*Math.cos(this.phi),radius*Math.sin(this.phi),radius*Math.cos(this.theta)*Math.cos(this.phi));
    if(this.inside){const d=this.camera.position.clone().normalize();this.camera.lookAt(this.camera.position.clone().add(d));}else this.camera.lookAt(0,0,0);
    if(this.marker){const hz=this.selected?.frequency||0,t=performance.now()/1000,pulse=this.playing&&hz&&!matchMedia('(prefers-reduced-motion: reduce)').matches?1+.35*Math.sin(t*2*Math.PI*hz):1;this.marker.scale.setScalar(pulse);}
    this.renderer.render(this.scene,this.camera);
    if(this.playing&&!document.hidden&&this.selected?.frequency&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.frame=requestAnimationFrame(()=>this.render());
  }
  pick(e){const T=this.T,p=framePoint(this.canvas,e);this.raycaster.setFromCamera(new T.Vector2(p.u*2-1,1-p.v*2),this.camera);
    if(this.target==='memories'){const hit=this.points&&this.raycaster.intersectObject(this.points)[0];if(hit)this.onPick({record:this.visible[hit.index].id});}
    else{const globe=this.target==='geosphere',mesh=globe?this.sphere:this.shells[Number(this.target)],hit=this.raycaster.intersectObject(mesh)[0];if(hit)this.onPick({address:globe?{kind:'geosphere',index:hit.faceIndex+1,side:this.inside?'I':'O'}:{kind:'facet',shell:Number(this.target),index:Math.floor(hit.faceIndex/2)+1,side:this.inside?'I':'O'}});}
  }
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.events.abort();this.observer.disconnect();this.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.renderer.dispose();this.renderer.forceContextLoss();}
}
