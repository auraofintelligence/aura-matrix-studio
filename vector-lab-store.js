const NAME='aura-vector-lab';
export async function openLabStore(){
  const db=await new Promise((resolve,reject)=>{const request=indexedDB.open(NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore('state');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const operation=(mode,value)=>new Promise((resolve,reject)=>{const tx=db.transaction('state',mode),store=tx.objectStore('state'),req=mode==='readonly'?store.get('project'):store.put(value,'project');let result;req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage interrupted.'));});
  return {read:()=>operation('readonly'),write:value=>operation('readwrite',value),close:()=>db.close()};
}
