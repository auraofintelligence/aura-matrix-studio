import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {navigationTree,treeSearch,layoutTree,TREE_ROOT} from '../navigation-tree.js';
import {pageTitle} from '../original-sitemap.js';
import {HOME,CROWN,PROGRAMMER} from '../original-routes.js';
const pages=JSON.parse(readFileSync(new URL('../assets/mockplus/pages.json',import.meta.url),'utf8')).pages;
test('name tree retains every canonical page and skips camera intermediaries',()=>{
 const tree=navigationTree(pages);assert.equal(tree.size,142);
 assert.equal(tree.get(PROGRAMMER).parent,HOME);
 assert.equal(tree.get('04D7A1CD-024B-4CC1-8116-37139DF95A29').parent,CROWN);
 assert.ok([...tree.values()].every(n=>!n.page?.name.endsWith(' CK')));
 const layout=layoutTree(tree,new Set(tree.keys()));assert.equal(layout.nodes.length,tree.size);
 const cells=new Set(layout.nodes.map(p=>`${p.x}/${p.y}`));assert.equal(cells.size,tree.size);
 assert.equal(layout.edges.length,tree.size-1);
});
test('search exposes matching pages in their actual parent branch',()=>{
 const tree=navigationTree(pages),birth=pages.find(p=>p.name==='Birthdays'),timing=pages.find(p=>p.name==='Timelines');
 const result=treeSearch(tree,'birthday',pageTitle);assert.ok(result.matches.has(birth.id));assert.ok(result.visible.has(timing.id));assert.ok(result.visible.has(HOME));
 assert.ok(layoutTree(tree,new Set(),result.visible).nodes.some(n=>n.id===birth.id));
 assert.equal(treeSearch(tree,'missing destination xyz',pageTitle).matches.size,0);
});
test('new descendants, missing parents and cycles stay reachable without hand-maintained lists',()=>{
 const added=[{id:'new',name:'New page',parent:HOME},{id:'orphan',name:'Orphan',parent:'missing'},{id:'a',name:'A',parent:'b'},{id:'b',name:'B',parent:'a'}];
 const tree=navigationTree([...pages,...added]);assert.ok(tree.get(HOME).children.includes('new'));
 assert.equal(tree.get('orphan').parent,TREE_ROOT);assert.equal(layoutTree(tree,new Set(tree.keys())).nodes.length,tree.size);
});
