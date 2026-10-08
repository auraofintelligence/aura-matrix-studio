import {validateFavourites} from './favourites-data.js?v=0.4.26';
export const SHORTCUT_FORMAT='aura-shortcut-map/1';
const keys=(value,allowed)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.includes(k));
export function exportShortcutMenu(favourites,menuId){
 const menu=validateFavourites(favourites).menus.find(m=>m.id===menuId);if(!menu)throw Error('Choose an available menu.');
 return {format:SHORTCUT_FORMAT,menus:[{name:menu.name,slots:menu.slots.map(s=>s?{pageId:s.pageId,icon:s.icon}:null)}]};
}
export function reviewShortcutMap(raw,pageIds,iconFiles){
 if(!keys(raw,['format','menus'])||raw.format!==SHORTCUT_FORMAT||!Array.isArray(raw.menus)||!raw.menus.length||raw.menus.length>20)throw Error('Choose an Aura shortcut-map file. Project backups and encrypted data cannot be imported here.');
 const menus=raw.menus.map((menu,i)=>{
  if(!keys(menu,['name','slots'])||!Array.isArray(menu.slots)||menu.slots.some(s=>s!==null&&!keys(s,['pageId','icon'])))throw Error('A shortcut map contains only menu names, positions, page references and app icons.');
  return {id:'review-'+i,name:menu.name,slots:menu.slots};
 });
 const clean=validateFavourites({activeId:'review-0',menus});
 for(const menu of clean.menus)for(const slot of menu.slots)if(slot){if(!pageIds.has(slot.pageId))throw Error('This map refers to a section unavailable in this Aura version.');if(slot.icon&&!iconFiles.has(slot.icon))throw Error('This map uses an unavailable app icon.');}
 return clean.menus;
}
export function importShortcutMap(favourites,reviewed){
 const next=validateFavourites(favourites);
 const menus=validateFavourites({activeId:reviewed[0]?.id,menus:reviewed}).menus.map(menu=>({...menu,id:crypto.randomUUID()}));
 next.menus.push(...menus);next.activeId=menus[0].id;return validateFavourites(next);
}
