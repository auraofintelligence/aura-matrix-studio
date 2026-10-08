import {validateProject} from './core.js?v=0.4.26';
export const AVATAR_PHOTOS='FFF3392C-C4CD-452E-9121-EC51530743CD';
export const PROFILE_PHOTO_TABLE='avatar-profile-photos';
export const MAX_PROFILE_PHOTOS=10;
export const AVATAR_PHOTO_VIEWS=[
 {id:'face-front',title:'Face · front',help:'Look straight at the camera. Include your head and shoulders.',asset:'measurements',crop:[0,0,627,600]},
 {id:'body-three-quarter-length',title:'Body · three-quarter length',help:'Frame yourself from your head to around your knees, like a wider selfie.',asset:'measurements',crop:[627,0,627,465]},
 {id:'reach-left',title:'Reach · left side',help:'Hold both arms out at shoulder height. Include your head, feet and both fingertips.',asset:'side',crop:[0,0,1024,1536],mirror:true},
 {id:'reach-right',title:'Reach · right side',help:'Show the same pose from the other side. Keep both hands and your feet in frame.',asset:'side',crop:[0,0,1024,1536]},
 {id:'body-front',title:'Arm span · front',help:'Extend both arms at shoulder height. Include both fingertips and your feet.',asset:'measurements',crop:[627,0,627,627]},
 {id:'body-upper',title:'Body · upper body',help:'Include your head, shoulders and torso. Let your arms rest naturally.',asset:'shoulders',crop:[0,0,1254,1254]},
 {id:'body-side',title:'Body · side',help:'Stand side-on. Include your full height and outline.',asset:'side',crop:[0,0,1024,1536]},
 {id:'body-other-side',title:'Body · other side',help:'Turn to the other side. Include your full height and outline.',asset:'side',crop:[0,0,1024,1536],mirror:true},
 {id:'arms-raised',title:'Pose · arms raised',help:'Raise your arms comfortably. Include fingertips and feet.',asset:'measurements',crop:[0,600,627,654]},
 {id:'seated',title:'Pose · seated',help:'Sit upright, feet flat and hands resting on your thighs.',asset:'measurements',crop:[627,627,627,627]}
];
export function profilePhotos(project){const table=project.tables.find(t=>t.id===PROFILE_PHOTO_TABLE);return (table?.rows||[]).map(row=>({id:row.id,...Object.fromEntries(table.columns.map((c,i)=>[c,row.values[i]]))})).filter(photo=>photo.Asset).sort((a,b)=>Number(a.Position)-Number(b.Position));}
export function saveProfilePhoto(project,position,data){
 if(!Number.isInteger(position)||position<1||position>MAX_PROFILE_PHOTOS)throw Error('Use one of the ten profile photo positions.');
 if(typeof data.Asset!=='string'||data.Asset.length>90000||data.Asset&&!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+=*$/.test(data.Asset))throw Error('Use a supported local photo copy.');
 if(typeof data.Filename!=='string'||data.Filename.length>500)throw Error('Photo filename is too long.');
 const next=structuredClone(project);let table=next.tables.find(t=>t.id===PROFILE_PHOTO_TABLE),id='avatar-profile-photo-'+position;
 if(!data.Asset){if(table)table.rows=table.rows.filter(row=>row.id!==id);return validateProject(next);}
 if(!table){table={id:PROFILE_PHOTO_TABLE,name:'Avatar profile photographs',recommendation:'body',category:'self',chakraTags:[0,5],columns:['Title','Position','Asset','Filename'],rows:[]};next.tables.push(table);}
 for(const key of ['Title','Position','Asset','Filename','View'])if(!table.columns.includes(key)){table.columns.push(key);for(const row of table.rows)row.values.push('');}
 let row=table.rows.find(row=>row.id===id);if(!row){row={id,values:table.columns.map(()=> '')};table.rows.push(row);}
 const view=AVATAR_PHOTO_VIEWS[position-1];for(const [key,value]of Object.entries({Title:view.title,Position:String(position),Asset:data.Asset,Filename:data.Filename,View:view.id}))row.values[table.columns.indexOf(key)]=value;
 return validateProject(next);
}
