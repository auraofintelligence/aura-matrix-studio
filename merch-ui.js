import {make,panelFor,header} from './local-tools.js?v=0.4.17';
export const MERCH='aura-merch-store';
export function mountMerch({screen,go}){
 const panel=panelFor(screen,'merch-panel');header(panel,'Merch',()=>go('command:back'));
 const placeholder=make('div','merch-empty'),icon=make('img');icon.src='assets/mockplus/aura-merch.svg';icon.alt='';
 placeholder.append(icon,make('h2','','Aura merch'),make('p','','A place for Aura merchandise. Coming later.'));panel.append(placeholder);
 return {resize(){},dispose(){}};
}
