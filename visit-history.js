// The browser owns the trail, including Forward and reloads.
export function visitHistory(history,initialURL,{previousDocument=false}={}){
 if(!Number.isInteger(history.state?.auraDepth))history.replaceState({...history.state,auraDepth:0,auraPreviousDocument:previousDocument},'',initialURL);
 return {
  push(url){history.pushState({auraOriginal:true,auraDepth:(history.state?.auraDepth||0)+1,auraPreviousDocument:history.state?.auraPreviousDocument||false},'',url);},
  back(){if((history.state?.auraDepth||0)>0||history.state?.auraPreviousDocument){history.back();return true;}return false;}
 };
}
