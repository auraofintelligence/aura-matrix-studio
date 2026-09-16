import {AVATAR_HOME,avatarValues,fieldsFor,saveAvatar} from './avatar-data.js?v=0.4.14';
import {readPersonalSpace} from './personal-space-data.js?v=0.4.14';
import {readTravelProject,writeTravelProject} from './travel-data.js?v=0.4.14';
import {EYE_POSES,eyePhotos,saveEyePhoto} from './eye-photos.js?v=0.4.14';

// Landmarks are artwork coordinates, not inferred measurements of the user.
const guides={
 'eyes-spacing':{crop:[175,140,280,200],a:[270,226],b:[359,226],femaleA:[272,214],femaleB:[359,214],offset:285,title:'Pupil to pupil',help:'Look straight ahead. Measure the straight distance between the centres of your pupils. Use millimetres.',ends:'Centre of one pupil to the centre of the other pupil.'},
 'eyes-left':{crop:[175,140,280,200],a:[339,226],b:[382,226],femaleA:[337,214],femaleB:[382,214],offset:275,title:'Left eye width',help:'Measure from the inner corner to the outer corner of your left eye. Your left is on the right of this front view.',ends:'Inner corner to outer corner of the person’s left eye.'},
 'eyes-right':{crop:[175,140,280,200],a:[248,226],b:[294,226],femaleA:[249,214],femaleB:[297,214],offset:275,title:'Right eye width',help:'Measure from the inner corner to the outer corner of your right eye. Your right is on the left of this front view.',ends:'Outer corner to inner corner of the person’s right eye.'},
 'body-height':{asset:'side',crop:[210,0,790,1490],a:[445,20],b:[445,1428],femaleA:[445,25],femaleB:[445,1426],offset:260,vertical:true,title:'Standing height',help:'Stand barefoot on a level floor, looking straight ahead. Measure vertically from the floor to the top of your head.',ends:'Floor beneath the feet to the crown of the head.',ground:1428},
 'body-reach':{crop:[145,600,330,630],a:[273,608],b:[273,1201],femaleA:[269,608],femaleB:[269,1201],offset:401,vertical:true,title:'Overhead reach',help:'Stand barefoot and raise both arms comfortably overhead. Measure vertically from the floor to your highest fingertip, without lifting your heels.',ends:'Floor to the tip of the raised middle finger.',ground:1201},
 'body-seated':{crop:[730,630,430,585],a:[875,665],b:[875,1000],femaleA:[875,676],femaleB:[875,1000],offset:760,vertical:true,title:'Seated height',help:'Sit upright on a firm, level seat with feet supported. Measure vertically from the seat surface to the top of your head.',ends:'Seat surface to the crown of the head.',seat:1000},
 'body-shoulder-height':{asset:'side',crop:[210,0,790,1490],a:[348,284],b:[348,1428],femaleA:[365,280],femaleB:[365,1426],offset:250,vertical:true,title:'Shoulder height',help:'Stand upright with your arms out at shoulder height, as shown. Measure vertically from the floor to the top outer point of your shoulder.',ends:'Floor to the top outer point of the shoulder.',ground:1428},
 'body-arm-span':{crop:[640,0,595,605],a:[679,140],b:[1198,140],offset:95,title:'Full arm span',help:'Hold both arms straight out to the sides at shoulder height. Measure in a straight line from one middle fingertip to the other.',ends:'Middle fingertip to middle fingertip, across both outstretched arms.'},
 'body-shoulder-width':{asset:'shoulders',crop:[200,0,850,1110],a:[347,461],b:[875,461],femaleA:[367,443],femaleB:[849,443],offset:355,title:'Shoulder width',help:'Let your arms hang naturally by your sides and relax your shoulders. Measure straight across between the outer bony shoulder points, rather than following the curve of your shirt.',ends:'Outer shoulder point to outer shoulder point, with both arms relaxed by the sides.'}
};
for(const pose of EYE_POSES)guides[pose.id]={...pose,crop:[pose.index%3*418,Math.floor(pose.index/3)*418,418,418],ends:pose.help};
const make=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn,cls='')=>{const n=make('button',cls,text);n.type='button';n.onclick=fn;return n;};
const svgNode=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};

function diagram(field,figure){
 const g=guides[field.id],svg=svgNode('svg',{viewBox:g.crop.join(' '),role:'img',tabindex:0,'aria-label':`${figure==='female'?'Female':'Male'} reference: ${g.ends}`,'data-measurement':field.id,'data-figure':figure});
 svg.append(svgNode('title',{},g.ends));
 const defs=svgNode('defs'),clip=svgNode('clipPath',{id:'measurement-crop'});clip.append(svgNode('rect',{x:g.crop[0],y:g.crop[1],width:g.crop[2],height:g.crop[3]}));defs.append(clip);svg.append(defs);
 const source=field.kind==='photo'?`assets/avatar/eyes-${figure}.png`:g.asset==='shoulders'?`assets/avatar/shoulders-${figure}.png`:g.asset==='side'?`assets/avatar/human-${figure==='female'?'female-':''}side.png`:`assets/avatar/measurements-${figure}.png`;
 svg.append(svgNode('image',{href:source,x:0,y:0,width:g.asset==='side'?1024:1254,height:g.asset==='side'?1536:1254,'clip-path':'url(#measurement-crop)'}));
 svg.setAttribute('aria-description','Swipe left or right to browse. Hold to change male or female reference. Keyboard: arrows browse, F selects female, M selects male.');
 if(field.kind==='photo'){
  const x=g.crop[0]+22,y=g.crop[1]+103,w=374,h=30;
  const ruler=svgNode('g',{'data-ruler':'millimetres','aria-label':'30 centimetre ruler. Bottom edge has 1 millimetre divisions, longer 5 millimetre marks and numbered centimetres.'});
  ruler.append(svgNode('rect',{x,y,width:w,height:h,rx:2,fill:'#fff6cf',stroke:'#786846','stroke-width':.8}));
  for(let mm=0;mm<=300;mm++){
   const at=x+4+mm*(w-8)/300,cm=mm%10===0,half=mm%5===0;
   ruler.append(svgNode('line',{x1:at,y1:y+h,x2:at,y2:y+h-(cm?11:half?7:4),stroke:'#493d29','stroke-width':cm?.9:half?.65:.45,'data-mm':mm}));
   if(cm)ruler.append(svgNode('text',{x:at,y:y+16,fill:'#493d29','font-size':8,'font-family':'Arial, sans-serif','text-anchor':mm===0?'start':mm===300?'end':'middle'},String(mm/10)));
  }
  ruler.append(svgNode('text',{x:x+4,y:y+7,fill:'#493d29','font-size':7,'font-family':'Arial, sans-serif'},'cm'),svgNode('text',{x:x+w/2,y:y+7,fill:'#493d29','font-size':7,'font-family':'Arial, sans-serif','text-anchor':'middle'},'1 cm = 10 mm'));
  svg.append(ruler);
  return svg;
 }
 const a=figure==='female'&&g.femaleA?g.femaleA:g.a,b=figure==='female'&&g.femaleB?g.femaleB:g.b;
 const unit=Math.max(g.crop[2],g.crop[3])/340;
 const line=(x1,y1,x2,y2,attrs={})=>svg.append(svgNode('line',{x1,y1,x2,y2,stroke:'#7042b6','stroke-width':2*unit,...attrs}));
 if(g.ground)line(g.crop[0]+12,g.ground,g.crop[0]+g.crop[2]-12,g.ground,{stroke:'#b4aebf','stroke-width':unit});
 if(g.seat)line(752,g.seat,926,g.seat,{stroke:'#b4aebf','stroke-width':unit});
 const p=g.vertical?[g.offset,a[1]]:[a[0],g.offset],q=g.vertical?[g.offset,b[1]]:[b[0],g.offset];
 for(const [origin,end]of [[a,p],[b,q]])line(...origin,...end,{'stroke-dasharray':`${3*unit} ${3*unit}`,'stroke-width':unit});
 line(...p,...q);
 for(const point of [p,q])g.vertical?line(point[0]-5*unit,point[1],point[0]+5*unit,point[1]):line(point[0],point[1]-5*unit,point[0],point[1]+5*unit);
 for(const [cx,cy]of [a,b])svg.append(svgNode('circle',{cx,cy,r:3*unit,fill:'#7042b6',stroke:'white','stroke-width':unit}));
 svg.setAttribute('aria-description','Swipe left or right for the next or previous measurement. Hold to change male or female reference. Keyboard: left and right arrows browse, F selects female, M selects male.');
 return svg;
}

export function mountMeasurements({screen,go,section}){
 for(const child of screen.children)child.hidden=true;
 const panel=make('section','avatar-panel measurement-panel');screen.append(panel);
 let project,values,figure,index=0,dirty=false,holdTimer,pointer,disposed=false,photos={},pendingPhoto=false;
 try{project=readTravelProject();values=avatarValues(project,section);figure=readPersonalSpace(project).figure;}catch(e){panel.append(make('p','',e.message),button('Back',()=>go(AVATAR_HOME)));return {resize(){},dispose(){}};}
 photos=eyePhotos(project);
 const fields=[...(section.key==='eyes'?EYE_POSES:[]),...fieldsFor(section)],status=make('p','avatar-status');status.setAttribute('role','status');
 const move=delta=>{const next=Math.max(0,Math.min(fields.length-1,index+delta));if(next!==index){index=next;draw();}};
 function draw(){
  clearTimeout(holdTimer);pointer=null;panel.replaceChildren();const field=fields[index],guide=guides[field.id];
  const head=make('header','avatar-header'),back=button('‹',()=>go(AVATAR_HOME),'avatar-back');back.setAttribute('aria-label','Back to avatar setup');head.append(back,make('h1','',section.title));panel.append(head);
  const progress=make('nav','measurement-progress');progress.setAttribute('aria-label','Measurements');
  if(section.key==='eyes'){
   const jump=button(field.kind==='photo'?'Measurements':'Look positions',()=>{index=field.kind==='photo'?9:0;draw();},'measurement-jump');progress.append(jump,make('span','',field.kind==='photo'?`Photo ${index+1} / 9`:`Measurement ${index-8} / 3`));
  }else{fields.forEach((f,i)=>{const b=button(String(i+1),()=>{index=i;draw();});b.setAttribute('aria-label',guides[f.id].title);b.setAttribute('aria-current',i===index?'step':'false');progress.append(b);});progress.append(make('span','',`${index+1} / ${fields.length}`));}panel.append(progress);
  const form=make('form','measurement-form');form.id='measurement-form';form.append(make('h2','',guide.title));
  const visual=make('figure','measurement-visual'),svg=diagram(field,figure),caption=make('figcaption','','Swipe to browse · hold figure to change male/female');visual.append(svg,caption);form.append(visual);
  svg.oncontextmenu=e=>e.preventDefault();
  const point=e=>{const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.getScreenCTM().inverse());};
  svg.onpointerdown=e=>{if(pointer||e.button>0)return;svg.setPointerCapture(e.pointerId);const p=point(e);pointer={id:e.pointerId,x:p.x,y:p.y,held:false};holdTimer=setTimeout(()=>{if(!pointer||disposed)return;pointer.held=true;figure=figure==='male'?'female':'male';draw();status.textContent=`${figure==='female'?'Female':'Male'} reference. Your measurements stay unchanged.`;},600);};
  svg.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;const p=point(e);if(Math.hypot(p.x-pointer.x,p.y-pointer.y)>10)clearTimeout(holdTimer);};
  svg.onpointerup=e=>{clearTimeout(holdTimer);if(!pointer||pointer.id!==e.pointerId)return;const p=point(e),dx=p.x-pointer.x,dy=p.y-pointer.y;const held=pointer.held;pointer=null;if(!held&&Math.abs(dx)>guide.crop[2]*.15&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);};
  svg.onpointercancel=()=>{clearTimeout(holdTimer);pointer=null;};
  svg.onkeydown=e=>{if(['ArrowLeft','ArrowRight','f','F','m','M','Enter',' '].includes(e.key)){e.preventDefault();if(e.key.startsWith('Arrow'))move(e.key==='ArrowRight'?1:-1);else{figure=e.key.toLowerCase()==='f'?'female':e.key.toLowerCase()==='m'?'male':figure==='male'?'female':'male';draw();panel.querySelector('svg')?.focus();}}};
  const help=make('p','measurement-help',guide.help);form.append(help);
  if(field.kind==='photo'){
   form.append(make('p','measurement-setup','Have someone photograph you with a 30 cm ruler held across your forehead. Keep the camera and ruler in the same position for all nine photos.'));
   const row=make('div','measurement-photo-row'),file=make('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.hidden=true;file.setAttribute('aria-label',`Add photo: ${guide.title}`);
   const pick=button(photos[field.id]?.Asset?'Replace photo':'Add photo',()=>file.click());pick.disabled=pendingPhoto;
   row.append(pick,file);if(photos[field.id]?.Asset){const thumb=make('img');thumb.src=photos[field.id].Asset;thumb.alt=`Your photo: ${guide.title}`;const remove=button('×',()=>{photos[field.id]={Asset:'',Filename:''};dirty=true;draw();});remove.setAttribute('aria-label','Remove this photo');row.append(thumb,make('span','',photos[field.id].Filename),remove);}
   file.onchange=async()=>{const chosen=file.files?.[0];if(!chosen)return;pendingPhoto=true;pick.disabled=true;status.textContent='Preparing a local photo copy…';try{const asset=await localPhoto(chosen);if(disposed)return;photos[field.id]={Asset:asset,Filename:chosen.name};dirty=true;}catch(e){status.textContent=e.message;return;}finally{pendingPhoto=false;pick.disabled=false;}draw();};
   form.append(row);
  }else{
   const label=make('label','avatar-field'),captionText=make('span','','Your measurement'),row=make('span','measurement-input'),input=make('input');input.type='number';input.min='0';input.step='any';input.inputMode='decimal';input.placeholder='Not entered';input.value=values[field.id]||'';input.setAttribute('aria-label',`${field.label} (${field.unit})`);input.oninput=()=>{values[field.id]=input.value;dirty=true;status.textContent='Unsaved changes';};row.append(input,make('span','',field.unit));label.append(captionText,row);form.append(label);
  }panel.append(form);
  status.textContent=dirty?'Unsaved changes':field.kind==='photo'?'Optional photos stay in this browser and your Aura backup.':'Use your own measurement, or leave blank.';panel.append(status);
  const foot=make('footer','avatar-footer'),previous=button('Previous',()=>move(-1)),save=make('button','avatar-primary',index===fields.length-1?'Save measurements':'Save & next');previous.disabled=index===0;save.type='submit';save.setAttribute('form',form.id);foot.append(previous,save);panel.append(foot);
  form.onsubmit=e=>{e.preventDefault();if(pendingPhoto){status.textContent='Wait for the photo to finish preparing.';return;}try{project=writeTravelProject(p=>{let next=saveAvatar(p,section,values);for(const pose of EYE_POSES)if(photos[pose.id])next=saveEyePhoto(next,pose.id,photos[pose.id]);return next;});dirty=false;if(index<fields.length-1)index++;draw();status.textContent='Saved in your Aura tables.';}catch(e){status.textContent=e.message;}};
 }
 draw();return {resize(){},dispose(){disposed=true;clearTimeout(holdTimer);pointer=null;}};
}

async function localPhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG or WebP photo.');
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');let size=960;
  while(size>=320){const scale=Math.min(1,size/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext('2d');context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);const asset=canvas.toDataURL('image/jpeg',.82);if(asset.length<=90000)return asset;size=Math.floor(size*.8);}
  throw Error('Choose a smaller photo.');
 }finally{URL.revokeObjectURL(url);}
}
