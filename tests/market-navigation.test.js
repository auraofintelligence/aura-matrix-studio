import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {mapPages} from '../original-sitemap.js';
import {pageIcon,favouriteIcon} from '../page-icons.js';
import {MARKET_PAGES,filterMarket} from '../market-map.js';
const pages=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url),'utf8')).pages;
const data=JSON.parse(readFileSync(new URL('../assets/market-data.json',import.meta.url),'utf8'));
test('every public destination has explicit artwork and legacy arrow favourites recover their page icon',()=>{
 const destinations=mapPages(pages,'all');assert.equal(destinations.length,141);
 const arrows=['F8B7AE3554E89970A191B251BACE6CD0.svg','D95E480717200F895E41DB6E5B869596.svg','84E43FD667F4EA128EEFBAD7B03B51F5.svg','2293BC4F9F6AFF17F7D8D83951DF0304.svg'];
 for(const p of destinations){const icon=pageIcon(p.id);assert.ok(icon,p.name);assert.ok(!arrows.includes(icon),p.name);assert.ok(existsSync(new URL('../assets/mockplus/'+icon,import.meta.url)));}
 const accommodation=pages.find(p=>p.name==='Aura Accommodation');
 assert.equal(pageIcon(accommodation.id),'7B763900231880F6A03595E80F5DFA08.png');
 for(const icon of [...arrows,''])assert.equal(favouriteIcon({pageId:accommodation.id,icon}),pageIcon(accommodation.id));
});
test('each market category routes to relevant data with source and name filters composed',()=>{
 for(const p of pages.filter(p=>p.name.startsWith('Aura ')&&p.controls.some(c=>c.properties.text==='Search by Map'))){assert.ok(MARKET_PAGES[p.id],p.name);const rows=filterMarket(data.records,{category:MARKET_PAGES[p.id]});assert.ok(rows.length,p.name);assert.ok(rows.every(r=>r.category===MARKET_PAGES[p.id]));}
 const found=filterMarket(data.records,{category:'accommodation',source:'alliance',query:'Flinders'});assert.equal(found.length,1);assert.equal(found[0].name,'Aura on Flinders Serviced Apartments');
 assert.equal(filterMarket(data.records,{query:'El Aurassi'}).length,0);
 assert.ok(filterMarket(data.records,{source:'alliance'}).length===316);
 assert.ok(filterMarket(data.records,{source:'affinity'}).length===10528);
});
test('map snapshot retains provenance and valid coordinates without reviews or contact details',()=>{
 assert.equal(data.sources.length,2);assert.equal(data.held.affinity.nameDoesNotMatch,9108);const ids=new Set();
 for(const r of data.records){assert.ok(!ids.has(r.id));ids.add(r.id);assert.ok(Number.isFinite(r.lat)&&Math.abs(r.lat)<=90);assert.ok(Number.isFinite(r.lng)&&Math.abs(r.lng)<=180);assert.ok(r.categoryBasis);assert.ok(!('phone'in r||'email'in r||'description'in r));assert.ok(data.sources.some(s=>s.id===r.source));}
});
