// Reuse the existing editors and their event handlers in a fixed working surface.
export function mountWorkspace(){
  const $=id=>document.getElementById(id),q=s=>document.querySelector(s);
  const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
  const root=q('.workspace'),model=root.firstElementChild,record=q('.record-panel'),matrix=q('.matrix-panel'),stack=q('.stack-panel'),spatial=q('.spatial-panels'),select=q('.spatial-controls');
  const vector=spatial.children[0],sequence=spatial.children[1];
  document.body.classList.add('compact-studio');model.classList.add('model-column');
  const rail=make('nav','tool-rail');rail.setAttribute('aria-label','Workspace tools');
  const dock=make('aside','tool-dock'),head=make('div','tool-dock-head'),title=make('h2',null,'Select'),close=make('button','tool-close','×');
  close.type='button';close.title='Collapse tools';close.setAttribute('aria-label','Collapse tool panel');head.append(title,close);dock.append(head);
  const files=make('section','panel file-panel');files.append(q('.page-title .actions'),q('.bottom-bar .actions'));files.append(make('p','hint','Backups include your records, facet groups and programs.'));
  const tools=[['select','Select','M4 3l15 10-7 1-3 7z',select],['records','Records','M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h7',record],['stacks','Stacks','M3 7l9-4 9 4-9 4z M3 12l9 4 9-4 M3 17l9 4 9-4',stack],['matrix','Map','M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18',matrix],['vectors','Vectors','M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10',vector],['sequences','Sequence','M3 5h5v5H3z M16 14h5v5h-5z M8 7h10v7 M5 10v7h11',sequence],['files','Files','M3 6h7l2 3h9v12H3z M3 6V3h7l2 3',files]];
  const buttons=new Map();
  function openTool(key,focus=false){
    const entry=tools.find(t=>t[0]===key);dock.hidden=!entry;root.dataset.tool=entry?key:'';
    for(const [id,, ,panel]of tools){panel.hidden=id!==key;buttons.get(id).setAttribute('aria-pressed',String(id===key));}
    if(entry){title.textContent=entry[1];if(focus)close.focus();}
  }
  for(const [key,label,path,panel]of tools){
    panel.id=panel.id||'tool-'+key;panel.classList.add('tool-content');
    const b=make('button','tool-button');b.type='button';b.title=label;b.setAttribute('aria-controls',panel.id);
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span>${label}</span>`;
    b.onclick=()=>openTool(root.dataset.tool===key?null:key);buttons.set(key,b);rail.append(b);dock.append(panel);
  }
  spatial.remove();root.replaceChildren(rail,model,dock);
  close.onclick=()=>{const current=root.dataset.tool;openTool(null);buttons.get(current)?.focus();};
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close.click();}});
  q('.page-title').hidden=true;
  q('.bottom-bar').classList.add('workspace-status');
  q('footer').hidden=true;
  q('.brand span').textContent='Matrix Studio';
  const names={matrix:'Workspace',inventory:'Inventory',story:'Explainer',guide:'Help'};
  document.querySelectorAll('.main-nav a').forEach(a=>a.textContent=names[a.dataset.page]||a.textContent);
  // The shape chooser stays beside the view, without a row of long buttons.
  const shapeSelect=make('select','shape-choice');shapeSelect.setAttribute('aria-label','Aura shape');
  for(const b of $('shapes').children){const option=make('option',null,b.textContent);option.value=b.dataset.shape;option.selected=b.getAttribute('aria-pressed')==='true';shapeSelect.append(option);}
  shapeSelect.onchange=()=>document.querySelector(`[data-shape="${shapeSelect.value}"]`).click();
  $('shapes').hidden=true;const bar=q('.secondary-controls');bar.prepend(shapeSelect);q('.stage-toolbar').hidden=true;
  $('reset-view').textContent='Reset';$('reset-view').title='Fit the Aura and its stacks in view';$('save-png').textContent='PNG';$('save-png').title='Save this view as an image';
  document.querySelectorAll('[data-face]').forEach(b=>b.textContent=b.dataset.face==='I'?'Inside':'Outside');
  // Selection and rays share the same compact tool, on separate pages.
  const selectTabs=make('nav','editor-tabs');select.prepend(selectTabs);
  const selectionPage=make('div','editor-page'),raysPage=make('div','editor-page');
  selectionPage.append($('multi-facets').closest('.actions'),$('facet-selection-status'),$('pick-kind').parentElement,$('address-jump'),$('clear-selection'));
  raysPage.append($('ray-mode').parentElement,$('show-volume').closest('label'),$('camera-state'),$('pick-help'));
  select.append(selectionPage,raysPage);pageButtons(selectTabs,[['Select',selectionPage],['Rays and space',raysPage]]);
  // Stack creation and individual step editing stay a tap apart.
  const stackTabs=make('nav','editor-tabs');stack.prepend(stackTabs);
  const stackSetup=make('div','editor-page'),stackSteps=make('div','editor-page');
  stackSetup.append($('stack-owner'),$('stack-form'),$('explode-stacks').closest('.explode-control'),$('stack-colour'),$('stack-program'));
  stackSteps.append($('stack-jump'),$('stack-base'),$('stack-cards'),$('stack-render-status'));
  stack.append(stackSetup,stackSteps);pageButtons(stackTabs,[['Stack',stackSetup],['Steps',stackSteps]]);
  // Phone map windows retain the full 12 by 24 address system.
  const mapNav=make('div','map-pages'),mapLabel=make('span','hint'),previous=make('button',null,'Previous'),next=make('button',null,'Next');
  mapNav.append(previous,mapLabel,next);matrix.prepend(mapNav);
  const small=matchMedia('(max-width:700px)');let mapPage=0;
  function drawMap(){
    mapNav.hidden=!small.matches;const rowStart=Math.floor(mapPage/3)*6,colStart=(mapPage%3)*8;
    for(const b of $('matrix-grid').children){const n=+b.dataset.cell-1,row=Math.floor(n/24),col=n%24;b.hidden=small.matches&&(row<rowStart||row>=rowStart+6||col<colStart||col>=colStart+8);}
    mapLabel.textContent=`Rows ${rowStart+1}-${rowStart+6}, columns ${colStart+1}-${colStart+8}`;
    previous.disabled=mapPage===0;next.disabled=mapPage===5;
  }
  function revealCell(cell){if(!cell)return;mapPage=Math.floor(Math.floor((cell-1)/24)/6)*3+Math.floor(((cell-1)%24)/8);drawMap();}
  previous.onclick=()=>{mapPage=Math.max(0,mapPage-1);drawMap();};next.onclick=()=>{mapPage=Math.min(5,mapPage+1);drawMap();};small.addEventListener('change',drawMap);
  document.addEventListener('aura-selection-change',e=>{if(e.detail&&e.detail.kind!=='volume')revealCell(e.detail.index);});
  $('matrix-grid').addEventListener('keydown',e=>{const n=+e.target.dataset.cell;if(!n)return;const r=Math.floor((n-1)/24),c=(n-1)%24,neighbour={ArrowUp:((r+11)%12)*24+c+1,ArrowDown:((r+1)%12)*24+c+1,ArrowLeft:r*24+(c+23)%24+1,ArrowRight:r*24+(c+1)%24+1}[e.key];if(neighbour)revealCell(neighbour);},true);
  matrix.querySelector('.matrix-help').textContent='Same 12 × 24 matrix. Tap cells to select; use the Select tool to build a group.';drawMap();
  // Short field pages keep records editable next to the model.
  const recordForm=$('record-form'),recordTabs=make('nav','editor-tabs');recordTabs.setAttribute('aria-label','Record fields');recordForm.before(recordTabs);
  const recordGroups=[['Meaning',[$('record-note').closest('.field')]],['Instructions',[$('record-instructions').closest('.field')]],['Data',[$('record-asset').closest('.field'),$('record-data').closest('.field')]],['Links',[$('record-fields'),$('connections-editor')]]];
  const recordPages=recordGroups.map(([label,nodes])=>{const page=make('div','editor-page');for(const n of nodes)page.append(n);if(label==='Links')recordForm.after(page);else recordForm.querySelector('.actions').before(page);return [label,page];});
  pageButtons(recordTabs,recordPages);
  const privacy=record.querySelector('.divider:not(#connections-editor)');if(privacy)privacy.hidden=true;
  // Sequence editing, its ordered steps and playback have their own short pages.
  const seqTabs=make('nav','editor-tabs');seqTabs.setAttribute('aria-label','Sequence tools');sequence.prepend(seqTabs);
  sequence.querySelector('h2').hidden=true;sequence.querySelector(':scope > p.hint').hidden=true;
  const choiceLabel=sequence.querySelector('label[for="program-choice"]');
  const seqGroups=[['Build',[choiceLabel,$('program-choice'),$('program-form'),$('program-loop').closest('label'),$('step-action').closest('.two-fields'),$('append-step')]],['Steps',[$('program-steps')]],['Run',[$('run-program').closest('.actions'),$('program-status'),$('program-trace')]],['Export',[$('export-agent').closest('.actions')]]];
  const seqPages=seqGroups.map(([label,nodes])=>{const page=make('div','editor-page');page.append(...nodes);sequence.append(page);return [label,page];});pageButtons(seqTabs,seqPages);
  // Switch pages without rebuilding fields or discarding an unfinished edit.
  function pageButtons(nav,pages){
    const controls=[];const show=index=>pages.forEach(([,page],i)=>{page.hidden=i!==index;controls[i].setAttribute('aria-pressed',String(i===index));});
    pages.forEach(([label],i)=>{const b=make('button',null,label);b.type='button';b.onclick=()=>show(i);nav.append(b);controls.push(b);});show(0);
  }
  // Other workflows can reveal their editor without scrolling the document.
  document.addEventListener('aura-open-tool',e=>openTool(e.detail));
  openTool(null);
}
