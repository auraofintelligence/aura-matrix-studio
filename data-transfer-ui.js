import {make,button,panelFor,header,hero,download} from './local-tools.js?v=0.4.17';
import {readTravelProject} from './travel-data.js?v=0.4.17';
import {exportAura,parseBackup,restoreBackup,backupSummary} from './backup-data.js?v=0.4.17';
export const DATA_TRANSFER='aura-data-transfer';
export function mountDataTransfer({screen,go}){
 const panel=panelFor(screen,'data-transfer-panel');header(panel,'Your Aura data',()=>go('command:back'));
 hero(panel,'Take your Aura with you','Export your saved inputs and uploaded files. Import them on another device or restore a backup.','⇅');
 const count=make('p','tool-help'),status=make('p','tool-status');status.setAttribute('role','status');
 function counts(){const s=backupSummary(readTravelProject());count.textContent=`${s.tables} tables · ${s.rows} entries · ${s.records} facet records`;}
 try{counts();}catch(e){count.textContent=e.message;}
 const actions=make('div','transfer-actions'),out=button('Export all data',async()=>{out.disabled=true;status.textContent='Preparing your backup, including uploaded files…';try{const archive=await exportAura();download('aura-backup-'+new Date().toISOString().slice(0,10)+'.json',archive);status.textContent=`Backup prepared with ${archive.media.length} uploaded files. Keep the downloaded file somewhere safe.`;}catch(e){status.textContent=e.message;}finally{out.disabled=false;}},'tool-primary');
 const file=make('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.setAttribute('aria-label','Choose an Aura backup');
 const input=button('Import a backup',()=>file.click()),review=make('section','transfer-review');review.hidden=true;actions.append(out,input);panel.append(count,actions,file,review,make('p','tool-help','Includes saved answers, photographs, tables, favourites, map pins, facets, stacks, skins, programs and mind-palace uploads. External links stay as links. Your file may contain private information.'),status);
 file.onchange=async()=>{review.hidden=true;review.replaceChildren();const selected=file.files[0];if(!selected)return;input.disabled=true;status.textContent='Checking backup…';try{
  const prepared=parseBackup(JSON.parse(await selected.text())),s=prepared.summary;
  review.append(make('h2','','Restore this Aura?'),make('p','',`${s.tables} tables · ${s.rows} entries · ${s.records} facet records · ${s.files} files`),make('p','',prepared.complete?'This replaces the saved Aura in this browser. Export your current data first if you want to keep both.':'This older backup contains project data only. Uploaded mind-palace files are not included. It will replace the saved Aura in this browser.'));
  const restore=button('Replace with this backup',async()=>{restore.disabled=true;input.disabled=true;out.disabled=true;cancel.disabled=true;status.textContent='Restoring…';try{await restoreBackup(prepared);review.hidden=true;counts();status.textContent='Restored. Open an Aura page to use your imported data. Reload any other open Aura tabs.';}catch(e){status.textContent=e.message;}finally{restore.disabled=false;input.disabled=false;out.disabled=false;cancel.disabled=false;}}),cancel=button('Cancel',()=>{review.hidden=true;file.value='';status.textContent='Import cancelled. Your data is unchanged.';});
  review.append(restore,cancel);review.hidden=false;status.textContent='Backup checked. Nothing changed yet.';
 }catch(e){status.textContent='Could not import: '+e.message;}finally{input.disabled=false;file.value='';}};
 return {resize(){},dispose(){}};
}
