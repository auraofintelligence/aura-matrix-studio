// Camera access starts only after the user presses the menu camera control.
export function mountMenuCamera(screen){
  let stream=null,pending=false,disposed=false;
  const video=document.createElement('video');video.className='menu-camera-feed';video.autoplay=true;video.muted=true;video.playsInline=true;video.hidden=true;screen.prepend(video);
  const controls=[...screen.querySelectorAll('[data-camera-toggle]')];
  const notice=document.createElement('p');notice.className='menu-camera-notice';notice.setAttribute('role','status');notice.hidden=true;screen.append(notice);
  const setState=on=>{screen.classList.toggle('camera-on',on);for(const c of controls){c.setAttribute('aria-pressed',String(on));c.title=on?'Turn camera background off':'Turn camera background on';}};
  function stop(){for(const track of stream?.getTracks()||[])track.stop();stream=null;video.srcObject=null;video.hidden=true;setState(false);}
  async function toggle(){
    if(disposed||pending)return;if(stream){stop();return;}
    pending=true;notice.hidden=false;notice.textContent='Waiting for camera permission…';
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera access is unavailable in this browser.');
      const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      if(disposed||document.hidden){acquired.getTracks().forEach(t=>t.stop());notice.hidden=true;return;}
      stream=acquired;video.srcObject=stream;await video.play();if(disposed)return;video.hidden=false;setState(true);notice.hidden=true;
    }catch(e){stop();if(!disposed){notice.hidden=false;notice.textContent=e.name==='NotAllowedError'?'Camera permission was not granted. The menu still works.':e.message||'The camera could not be opened.';}}
    finally{pending=false;}
  }
  const onHide=()=>{if(document.hidden){stop();notice.hidden=true;}};document.addEventListener('visibilitychange',onHide);
  setState(false);return {toggle,dispose(){disposed=true;stop();document.removeEventListener('visibilitychange',onHide);video.remove();notice.remove();}};
}
