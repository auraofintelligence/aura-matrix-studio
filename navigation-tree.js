import {canonicalPage,CAMERA_VARIANTS,PAGE_ALIASES,PAGE_PARENTS} from './original-routes.js?v=0.4.15';

export const TREE_ROOT='aura-site';
// Page registration and parent overrides own the hierarchy. New pages appear automatically.
export function navigationTree(pages){
  const nodes=new Map([[TREE_ROOT,{id:TREE_ROOT,page:null,parent:null,children:[]}]]);
  for(const page of pages)if(page.name!=='Page'&&!CAMERA_VARIANTS[page.id]&&!PAGE_ALIASES[page.id])nodes.set(page.id,{id:page.id,page,parent:TREE_ROOT,children:[]});
  for(const node of nodes.values())if(node.page){const parent=canonicalPage(PAGE_PARENTS[node.id]||node.page.parent);if(parent!==node.id&&nodes.has(parent))node.parent=parent;}
  // An invalid future parent must not hide a page or make navigation recurse forever.
  for(const node of nodes.values())if(node.page){const seen=new Set([node.id]);let parent=node.parent;while(parent!==TREE_ROOT){if(seen.has(parent)){node.parent=TREE_ROOT;break;}seen.add(parent);parent=nodes.get(parent).parent;}}
  for(const node of nodes.values())if(node.parent)nodes.get(node.parent).children.push(node.id);
  return nodes;
}

export function treeSearch(nodes,query,title){
  const matches=new Set(),visible=new Set([TREE_ROOT]),q=query.trim().toLocaleLowerCase();
  if(!q)return {matches,visible:null};
  for(const node of nodes.values())if(node.page&&(title(node.page)+' '+node.page.name).toLocaleLowerCase().includes(q)){
    matches.add(node.id);let current=node;
    while(current){visible.add(current.id);current=nodes.get(current.parent);}
  }
  return {matches,visible};
}

export function layoutTree(nodes,expanded,visible=null){
  const placed=[],edges=[];let row=0;
  function visit(id,depth,branch){
    const node=nodes.get(id),position={id,x:12+depth*166,y:12+row*84,branch};placed.push(position);
    const children=node.children.filter(child=>!visible||visible.has(child));
    if((expanded.has(id)||visible)&&children.length){children.forEach((child,i)=>{if(i)row++;const next=visit(child,depth+1,depth===0?i:branch);edges.push({from:position,to:next});});}
    return position;
  }
  visit(TREE_ROOT,0,0);
  return {nodes:placed,edges,width:Math.max(...placed.map(p=>p.x))+156,height:Math.max(...placed.map(p=>p.y))+92};
}
