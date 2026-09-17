export const NAV_ARROW_FILES=new Map([
 ['D95E480717200F895E41DB6E5B869596.svg','Back'],
 ['2A66AD5F70E931FBDD63345060494B7C.svg','Back'],
 ['84E43FD667F4EA128EEFBAD7B03B51F5.svg','Next'],
 ['F8B7AE3554E89970A191B251BACE6CD0.svg','Next'],
 ['2293BC4F9F6AFF17F7D8D83951DF0304.svg','Previous']
]);
// Preserve each control's existing action; only its navigation presentation changes.
export function enhanceNavigation(root=document.body){
 const update=()=>{for(const b of root.querySelectorAll('button,a')){
   if(b.matches('.site-tree-expand,[data-camera-toggle]'))continue;
   const text=b.textContent.trim(),aria=b.getAttribute('aria-label')||'';
   let direction=/^(?:←|‹|Back|Previous(?:\s|$))/.test(text)||/^(?:Back|Previous)(?:\s|$)/.test(aria)?'back':/^(?:→|›|Next(?:\s|$))/.test(text)||/^Next(?:\s|$)/.test(aria)?'next':null;
   if(!direction)continue;
   b.classList.add('ethereal-nav');b.dataset.navDirection=direction;
   if(/^[←‹→›]$/.test(text))b.textContent=direction==='back'?(/Previous/.test(aria)?'Previous':'Back'):'Next';
 }};
 update();let queued=false;
 const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;update();});}});observer.observe(root,{childList:true,subtree:true,characterData:true});return ()=>observer.disconnect();
}
