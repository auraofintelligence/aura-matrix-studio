import {SHELLS,ROWS,COLS,shellPoint,PRESETS,address} from './core.js';
const T=globalThis.THREE;
export class AuraView {
  constructor(canvas,onSelect){
    this.canvas=canvas;this.onSelect=onSelect;this.pose={...PRESETS.horn};this.shell=0;this.cell=97;this.face='I';this.records=[];this.links=[];this.showLabels=false;
    this.theta=.55;this.phi=.4;this.zoom=1;this.scene=new T.Scene();this.scene.background=new T.Color('#fafaf7');
    this.camera=new T.PerspectiveCamera(36,1,.1,300);
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.scene.add(new T.HemisphereLight(0xffffff,0x949aa9,1.1));const light=new T.DirectionalLight(0xffffff,.55);light.position.set(4,7,12);this.scene.add(light);
    this.meshes=[];this.wires=[];this.parameters=[];
    // Triangles only draw the surface. Their cell mapping is fixed and independent of shape.
    for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++)for(let y=0;y<3;y++)for(let x=0;x<3;x++){
      const u=(col+x/3)/COLS,v=(row+y/3)/ROWS,du=1/(3*COLS),dv=1/(3*ROWS),cell=row*COLS+col+1;
      for(const [a,b] of [[u,v],[u+du,v],[u+du,v+dv],[u,v],[u+du,v+dv],[u,v+dv]])this.parameters.push([a,b,cell]);
    }
    this.lineParameters=[];
    for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS*3;c++)this.lineParameters.push([c/(COLS*3),r/ROWS],[(c+1)/(COLS*3),r/ROWS]);
    for(let c=0;c<=COLS;c++)for(let r=0;r<ROWS*3;r++)this.lineParameters.push([c/COLS,r/(ROWS*3)],[c/COLS,(r+1)/(ROWS*3)]);
    for(let s=0;s<7;s++){
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(this.parameters.length*3),3));geometry.setAttribute('color',new T.BufferAttribute(new Float32Array(this.parameters.length*3),3));
      const mesh=new T.Mesh(geometry,new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,transparent:true,opacity:.82,shininess:22,depthWrite:true}));mesh.userData.shell=s;this.scene.add(mesh);this.meshes.push(mesh);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(this.lineParameters.length*3),3));
      const wire=new T.LineSegments(g,new T.LineBasicMaterial({color:'#272e35',transparent:true,opacity:.35,depthWrite:false}));this.scene.add(wire);this.wires.push(wire);
    }
    this.connect=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#11232d',transparent:true,opacity:.9,depthTest:false}));this.connect.renderOrder=3;this.scene.add(this.connect);
    this.marker=new T.Mesh(new T.SphereGeometry(.1,12,8),new T.MeshBasicMaterial({color:0x101b24,depthTest:false}));this.marker.renderOrder=4;this.scene.add(this.marker);
    this.raycaster=new T.Raycaster();this.drag=null;
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.drag={x:e.clientX,y:e.clientY,theta:this.theta,phi:this.phi,moved:false};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!this.drag||this.locked)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.hypot(dx,dy)>5)this.drag.moved=true;this.theta=this.drag.theta-dx*.006;this.phi=Math.max(-1.5,Math.min(1.5,this.drag.phi+dy*.006));this.render();});
    canvas.addEventListener('pointerup',e=>{if(this.drag&&!this.drag.moved&&!this.locked)this.pick(e);this.drag=null;});
    canvas.addEventListener('pointercancel',()=>this.drag=null);
    canvas.addEventListener('wheel',e=>{if(this.locked)return;e.preventDefault();this.zoom=Math.max(.5,Math.min(3,this.zoom*Math.exp(-e.deltaY*.001)));this.render();},{passive:false});
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);this.update();
  }
  resize(){const {width,height}=this.canvas.getBoundingClientRect();if(width&&height){this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.render();}}
  set(pose,shell=this.shell,cell=this.cell,face=this.face){this.pose=pose;this.shell=shell;this.cell=cell;this.face=face;if(pose.camera){[this.theta,this.phi]=pose.camera;this.zoom=1;}this.update();}
  centre(record){return shellPoint(((record.cell-1)%24+.5)/24,(Math.floor((record.cell-1)/24)+.5)/12,this.pose,record.shell,this.shell);}
  update(){
    const p=this.pose,occupied=new Set(this.records.filter(r=>r.face===this.face).map(r=>`${r.shell}/${r.cell}`));
    for(let s=0;s<7;s++){
      const mesh=this.meshes[s],wire=this.wires[s];mesh.visible=wire.visible=(p.nest>.001||s===this.shell);if(!mesh.visible)continue;
      mesh.material.opacity=p.nest>.001?(s===this.shell?.56:.13):.83;mesh.material.depthWrite=p.nest<.001;wire.material.opacity=p.nest>.001?.23:.38;
      const positions=mesh.geometry.attributes.position.array,colors=mesh.geometry.attributes.color.array;
      const base=new T.Color(SHELLS[s][1]),active=new T.Color('#ffe59a'),filled=new T.Color('#214f5a');
      for(let i=0;i<this.parameters.length;i++){
        const [u,v,c]=this.parameters[i],xyz=shellPoint(u,v,p,s,this.shell);positions.set(xyz,i*3);
        const colour=s===this.shell&&c===this.cell?active:occupied.has(`${s}/${c}`)?filled:base;colors.set([colour.r,colour.g,colour.b],i*3);
      }
      mesh.geometry.attributes.position.needsUpdate=mesh.geometry.attributes.color.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
      const lines=wire.geometry.attributes.position.array;this.lineParameters.forEach(([u,v],i)=>lines.set(shellPoint(u,v,p,s,this.shell),i*3));wire.geometry.attributes.position.needsUpdate=true;wire.geometry.computeBoundingSphere();
    }
    this.marker.position.fromArray(this.centre({shell:this.shell,cell:this.cell}));
    const points=[],byId=new Map(this.records.filter(r=>r.face===this.face).map(r=>[r.id,r]));
    for(const l of this.links){const a=byId.get(l.from),b=byId.get(l.to);if(a&&b&&(p.nest>.001||(a.shell===this.shell&&b.shell===this.shell)))points.push(...this.centre(a),...this.centre(b));}
    this.connect.geometry.dispose();this.connect.geometry=new T.BufferGeometry();this.connect.geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));
    this.render();
  }
  render(){
    if(!this.renderer)return;const p=this.pose;
    const size=Math.max(9,24*(1-p.ring)+13*p.ring,20*p.arrange);const aspect=this.camera.aspect||1;
    const distance=Math.max(size/Math.min(aspect,1.65)*1.85,31*p.arrange)/this.zoom;
    this.camera.position.set(Math.sin(this.theta)*Math.cos(this.phi)*distance,Math.sin(this.phi)*distance,Math.cos(this.theta)*Math.cos(this.phi)*distance);this.camera.lookAt(0,0,0);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);
  }
  pick(e){const b=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2),this.camera);const hit=this.raycaster.intersectObjects(this.meshes.filter(m=>m.visible))[0];if(hit)this.onSelect(hit.object.userData.shell,Math.floor(hit.faceIndex/18)+1);}
  reset(){this.theta=this.pose.ring>.1?.55:0;this.phi=this.pose.ring>.1?.4:0;this.zoom=1;this.render();}
  project(record){return new T.Vector3(...this.centre(record)).project(this.camera);}
  paintExport(ctx,width,height,caption,labels=false){
    const savedSize=this.renderer.getSize(new T.Vector2()),pixelRatio=this.renderer.getPixelRatio(),aspect=this.camera.aspect;
    try{this.renderer.setPixelRatio(1);this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.render();ctx.drawImage(this.canvas,0,0,width,height);
      if(labels){ctx.font='16px Arial';ctx.textAlign='left';for(const r of this.records.filter(r=>r.face===this.face&&(this.pose.nest>.001||r.shell===this.shell))){const p=this.project(r);if(Math.abs(p.x)>1||Math.abs(p.y)>1)continue;const x=(p.x+1)*width/2,y=(1-p.y)*height/2;ctx.fillStyle='#fff';ctx.fillRect(x-4,y-19,Math.min(ctx.measureText(r.title).width+10,380),25);ctx.fillStyle='#132127';ctx.fillText(r.title,x,y,370);}}
      ctx.fillStyle='rgba(250,250,247,.96)';ctx.fillRect(0,0,width,68);ctx.fillRect(0,height-130,width,130);ctx.fillStyle='#18292d';ctx.font='bold 25px Arial';ctx.fillText('AURA  /  Matrix Studio',36,43);ctx.font='17px Arial';ctx.textAlign='right';ctx.fillText('12 × 24  ·  288 cells per shell',width-36,42);ctx.textAlign='left';ctx.font='24px Arial';
      const words=caption.split(/\s+/);let line='',y=height-88;for(const w of words){if(ctx.measureText(line+w).width>width-72){ctx.fillText(line,36,y);line='';y+=31;}line+=w+' ';}ctx.fillText(line,36,y);ctx.font='15px Arial';ctx.fillStyle='#526368';ctx.fillText(`Luke Nathan Hayes / Aura of Intelligence     |     ${address(this.shell,this.cell,this.face)}`,36,height-19);
    }finally{this.renderer.setPixelRatio(pixelRatio);this.renderer.setSize(savedSize.x,savedSize.y,false);this.camera.aspect=aspect;this.render();}
  }
}
