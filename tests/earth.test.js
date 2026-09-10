import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {earthRows,filterEarth,importEarthPoints,saveEarthPoints,personalEarthRows,clusterEarth} from '../earth-data.js';
const manifest=JSON.parse(readFileSync(new URL('../assets/earth/manifest.json',import.meta.url)));
test('Earth retains every published Horn Torus layer and point with source metadata',()=>{
 assert.equal(manifest.layers.length,8);let total=0;for(const layer of manifest.layers){const data=JSON.parse(readFileSync(new URL('../'+layer.data,import.meta.url)));assert.equal(data.length,layer.mappedCount);total+=data.length;assert.ok(layer.publishedSource.startsWith(manifest.source));assert.ok(layer.snapshotSha256);for(const r of data){assert.ok(r[1]>=-90&&r[1]<=90&&r[2]>=-180&&r[2]<=180);}}
 assert.equal(total,91552);assert.equal(total,manifest.total);
});
test('Earth filters compose without applying the Affinity name rule to unrelated layers',()=>{
 const rows=[...earthRows({id:'world-cities'},[['Brisbane',-27,153,'Australia']]),...earthRows({id:'aura-affinity'},[['Yoga House',-27,153],['Unrelated business',-27,153]])],layers=new Set(['world-cities','aura-affinity']);
 assert.equal(filterEarth(rows,{layers}).length,2);assert.equal(filterEarth(rows,{layers,filterAffinity:false}).length,3);assert.equal(filterEarth(rows,{layers,query:'Brisbane'})[0].layer,'world-cities');
 assert.equal(clusterEarth(rows,()=>({x:10,y:10}))[0].count,3);
});
test('point imports and dropped pins survive Aura backup and reject malformed geometry atomically',()=>{
 const csv='name,latitude,longitude,notes\n"A, place",-27.5,153.2,hello';const points=importEarthPoints(csv,'points.csv');assert.equal(points[0].name,'A, place');
 const geo=JSON.stringify({type:'FeatureCollection',features:[{type:'Feature',properties:{name:'Island'},geometry:{type:'Point',coordinates:[150,-20]}}]});
 let p=saveEarthPoints(blankProject(),[...points,...importEarthPoints(geo,'places.geojson')]);assert.equal(personalEarthRows(p).length,2);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
 assert.throws(()=>saveEarthPoints(p,[{name:'Bad',lat:99,lng:150}]));assert.equal(personalEarthRows(p).length,2);
 assert.throws(()=>importEarthPoints('{"type":"Feature","geometry":{"type":"LineString","coordinates":[]}}','path.geojson'));
 assert.throws(()=>importEarthPoints('name,latitude,longitude\nBlank,,1','bad.csv'));
});
