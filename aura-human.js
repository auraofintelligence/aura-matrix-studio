let ids=0;
export const svgNode=(tag,attrs={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,String(value));if(text!==undefined)n.textContent=text;return n;};
export function humanReference(figure='male',view='front',cx=168,ground=260,height=185){
 const group=svgNode('g',{'data-human-reference':figure,'data-human-view':view}),defs=svgNode('defs'),id='aura-human-'+(++ids);
 const cutout=svgNode('filter',{id,x:0,y:0,width:1,height:1,'color-interpolation-filters':'sRGB'});
 cutout.append(svgNode('feColorMatrix',{type:'matrix',values:'1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -0.2126 -0.7152 -0.0722 0 1'}));
 const alpha=svgNode('feComponentTransfer');alpha.append(svgNode('feFuncA',{type:'linear',slope:60,intercept:-.9}));cutout.append(alpha);defs.append(cutout);group.append(defs);
 if(view==='front'){
  const unit=height/552,clip=svgNode('clipPath',{id:id+'-crop'});clip.append(svgNode('rect',{x:cx-313.5*unit,y:ground-575*unit,width:627*unit,height:627*unit}));defs.append(clip);
  group.append(svgNode('image',{href:`assets/avatar/measurements-${figure}.png`,x:cx-940.5*unit,y:ground-575*unit,width:1254*unit,height:1254*unit,filter:`url(#${id})`,'clip-path':`url(#${id}-crop)`}));
 }else if(view==='top'){
  const unit=height/2135;group.append(svgNode('image',{href:figure==='female'?'assets/avatar/human-female-top.png':'assets/avatar/human-top.png',x:cx-380*unit,y:ground-380*unit,width:1254*unit,height:1254*unit,filter:`url(#${id})`}));
 }else{
  const soles=figure==='female'?1426:1428,crown=figure==='female'?25:20,unit=height/(soles-crown);
  group.append(svgNode('image',{href:figure==='female'?'assets/avatar/human-female-side.png':'assets/avatar/human-side.png',x:cx-430*unit,y:ground-soles*unit,width:1024*unit,height:1536*unit,filter:`url(#${id})`}));
 }
 return group;
}
