// Native modal dialogs enter the browser top layer, so explicitly copy the
// designed frame's size, scale and rotation rather than using viewport units.
export function fitFrameDialog(dialog,screen){
  const rect=screen.getBoundingClientRect();
  Object.assign(dialog.style,{
    position:'fixed',inset:'auto',margin:'0',left:rect.left+'px',top:rect.top+'px',
    width:screen.offsetWidth+'px',height:screen.offsetHeight+'px',
    maxWidth:'none',maxHeight:'none',transformOrigin:'0 0',
    transform:screen.style.transform||'none'
  });
}
