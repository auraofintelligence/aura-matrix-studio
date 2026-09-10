import {AuraView} from './renderer.js?v=0.3.5';
import {SHELLS,PRESETS,blankProject,validateProject} from './core.js?v=0.3.5';
import {target,remember,remembered,selectFacetGroup,targetLabel,recordsAt} from './spatial.js?v=0.3.5';
import {HOME,PROGRAMMER,stageBounds} from './original-routes.js?v=0.3.5';
const KEY='aura-matrix-studio:v4:project',LEGACY='aura-matrix-studio:v3:project';
export function mountLiveMatrix({page,screen,config,go}){
  let {shell,face,shape}=config,project,selection,view,multi=false,disposed=false,readError=false;
  const abort=new AbortController(),make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.onclick=fn;return b;};
  const position=(n,[x,y,w,h])=>Object.assign(n.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  function read(){try{const raw=localStorage.getItem(KEY)??localStorage.getItem(LEGACY)??localStorage.getItem('aura-matrix-studio:v2:project')??localStorage.getItem('aura-matrix-studio:v1:project');project=raw?validateProject(JSON.parse(raw)):blankProject();readError=false;}catch{project=blankProject();readError=true;}}
  read();
  const box=stageBounds(page),stage=make('section','live-stage');position(stage,box);
  stage.setAttribute('aria-label',shape==='flat'?'Live finite matrix':'Live torus');
  // Replace just the original stage artwork, captions and placeholder heading.
  for(const c of page.controls){
    const n=screen.querySelector(`[data-source-control="${c.controlID}"]`);if(!n)continue;
    if(['Image','Gif'].includes(c.controlTypeID)&&+c.w>150&&+c.h>100&&+c.y<240||c.properties.text==='To Hold Interactive Elements'||c.controlTypeID==='TextArea'||c.controlTypeID==='Label'&&!/^(Inside|Outside) View$/.test(c.properties.text||''))n.hidden=true;
  }
  const canvas=make('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive 12 by 24 matrix. Drag to rotate. Select facets, edges or vertices.');
  const grid=make('div','live-numbered-grid');grid.setAttribute('aria-label','12 rows and 24 columns');
  const status=make('div','live-address');status.setAttribute('role','status');stage.append(canvas,grid,status);screen.append(stage);
  const panel=make('section','live-controls');position(panel,[5,Math.max(box[1]+box[3]+2,239),593,Math.min(82,322-Math.max(box[1]+box[3]+2,239))]);
  const row=make('div','live-tools'),description=make('p','live-description');panel.append(row,description);screen.append(panel);
  const kind=make('select');kind.setAttribute('aria-label','Select geometry');
  for(const [value,label] of [['facet','Facets'],['edge-u','Row edges'],['edge-v','Column edges'],['vertex','Vertices'],['volume','Volume']]){const o=make('option','',label);o.value=value;kind.append(o);}
  const rays=make('select');rays.setAttribute('aria-label','Centre rays');
  for(const [value,label] of [['off','Rays off'],['selected','Selected ray'],['vertices','Vertex rays'],['centres','Facet rays']]){const o=make('option','',label);o.value=value;rays.append(o);}
  const multiple=button('▧ Multi',()=>{multi=!multi;multiple.setAttribute('aria-pressed',String(multi));});multiple.setAttribute('aria-pressed','false');
  const cube=button('◇ Cube',()=>{view.showVolume=!view.showVolume;cube.setAttribute('aria-pressed',String(view.showVolume));view.update();});cube.setAttribute('aria-pressed','false');
  const explode=button('≋ Explode',()=>{view.explodeStacks=view.explodeStacks?0:1;explode.setAttribute('aria-pressed',String(!!view.explodeStacks));refresh();});explode.setAttribute('aria-pressed','false');
  const edit=button('☷ Tools',()=>openEditor()),reset=button('↺ Fit',()=>view?.reset());
  row.append(kind,multiple,rays,cube,explode,edit,reset);
  const editor=make('dialog','live-editor'),editorBar=make('header'),editorTitle=make('strong','','Facet tools'),done=button('Done · return to torus',()=>editor.close());
  const frame=make('iframe');frame.title='Matrix records, stacks and program tools';editorBar.append(editorTitle,done);editor.append(editorBar,frame);document.body.append(editor);
  function openEditor(){editorTitle.textContent=selection?targetLabel(selection):`${SHELLS[shell][0]} ${face} tools`;const params=new URLSearchParams({shell:String(shell),face,from:page.id,embedded:'1'});if(selection){for(const [key,value] of Object.entries(selection))params.set(key,String(value));}frame.src='matrix.html?'+params;editor.showModal();}
  editor.addEventListener('close',()=>{frame.src='about:blank';read();refresh();edit.focus();},{signal:abort.signal});
  function persist(){if(readError)return;try{localStorage.setItem(KEY,JSON.stringify(validateProject(project)));}catch{description.textContent='Selection is in this tab only. Open Tools to save a backup.';}}
  function choose(t,event={}){
    // Refresh from storage before changing selection so editor records cannot be overwritten.
    read();if(readError){description.textContent='Stored data could not be read. Open Tools to recover a backup.';return;}
    if(t.kind==='facet'){const result=selectFacetGroup(project.facetSelections,t,multi||event.shiftKey||event.ctrlKey||event.metaKey);project.facetSelections=result.groups;t=result.focused;}
    project.selections=remember(project.selections,t,shell,face);persist();refresh();
  }
  function refresh(){
    if(disposed)return;selection=remembered(project.selections,shell,face);
    document.title=`${SHELLS[shell][0]} ${shape==='flat'?'matrix':'torus'} | Aura of Intelligence`;
    status.textContent=`${selection?targetLabel(selection):SHELLS[shell][0]+' '+face+' · Choose a facet'} · 12 × 24`;
    description.textContent=readError?'Stored data could not be read. Open Tools to recover a backup.':selection?(recordsAt(project.records,selection).map(r=>r.title).join(' · ')||'Selected. Open Tools to attach data, instructions, assets or stack steps.'):'Select a facet here. Multi selects a group. Tools opens records, stacks and programs.';
    if(view){Object.assign(view,{selection,selectedFacets:project.facetSelections[`${shell}/${face}`]||[],records:project.records,links:project.links,vectors:project.vectors,stacks:project.stacks,kind:kind.value});view.set(PRESETS[shape],shell,selection?.index??null,face);}
    const selected=new Set(project.facetSelections[`${shell}/${face}`]||[]);
    for(const b of grid.children){b.setAttribute('aria-pressed',String(selected.has(+b.dataset.cell)));b.style.setProperty('--shell',SHELLS[shell][1]);}
    for(const b of shellButtons)b.setAttribute('aria-pressed',String(+b.dataset.shell===shell));
    for(const b of sideButtons)b.setAttribute('aria-pressed',String(b.dataset.face===face));
  }
  function owner(s,f=face){shell=s;face=f;const url=new URL(location.href);url.searchParams.set('shell',String(shell));url.searchParams.set('face',face);history.replaceState(history.state,'',url);read();refresh();}
  const shellButtons=[],sideButtons=[];
  const badges=page.controls.filter(c=>c.controlTypeID==='AlarmIcon2').sort((a,b)=>+a.y- +b.y);
  badges.forEach((c,i)=>{const n=screen.querySelector(`[data-source-control="${c.controlID}"]`);n.hidden=true;const s=7-i;
    const b=button(i===0?'⌂':SHELLS[s][0][0],()=>i===0?go(HOME):owner(s));b.className='live-shell';position(b,[+c.x-2,+c.y-2,28,28]);
    b.title=i===0?'Aura Menu':SHELLS[s][0]+' torus';b.setAttribute('aria-label',b.title);
    if(i){b.dataset.shell=s;b.style.setProperty('--shell',SHELLS[s][1]);shellButtons.push(b);}screen.append(b);
  });
  for(const c of page.controls.filter(c=>/^(Inside|Outside) View$/.test(c.properties.text||''))){const n=screen.querySelector(`[data-source-control="${c.controlID}"]`);n.hidden=true;const f=c.properties.text.startsWith('Inside')?'I':'O',b=button(c.properties.text,()=>owner(shell,f));b.className='live-side';b.dataset.face=f;position(b,[+c.x-8,+c.y-2,+c.w+24,30]);sideButtons.push(b);screen.append(b);}
  for(let cell=1;cell<=288;cell++){const b=button(String(cell),e=>choose(target(shell,face,'facet',cell),e));b.dataset.cell=cell;b.setAttribute('aria-label','Facet '+cell);grid.append(b);}
  try{view=new AuraView(canvas,choose);}catch{canvas.hidden=true;description.textContent='3D is unavailable. The numbered facets still work.';}
  const useGrid=shape==='flat'||!view;grid.hidden=!useGrid;canvas.hidden=useGrid;
  kind.onchange=()=>{grid.hidden=!!view&&(shape!=='flat'||kind.value!=='facet');canvas.hidden=!grid.hidden;refresh();view?.resize();};
  rays.onchange=()=>{if(view){view.rayMode=rays.value;view.update();}};
  if(!view)for(const b of [kind,rays,cube,explode,reset])b.disabled=true;
  window.addEventListener('storage',e=>{if(e.key===KEY&&!editor.open){read();refresh();}},{signal:abort.signal});
  refresh();view?.resize();
  return {resize:()=>view?.resize(),dispose(){disposed=true;abort.abort();view?.dispose();editor.remove();}};
}
