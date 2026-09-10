// All positions use one fixed J2000 ecliptic frame, in astronomical units.
export const PLANETS=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const COLOURS=['#bbb4a9','#ead193','#58b8ef','#ef8f6a','#d9b493','#ead6a0','#9cddd8','#7099f0'];
const DAY=86400000;
export function solarSystemState(A,date){
 const rotation=A.Rotation_EQJ_ECL(),vector=body=>A.RotateVector(rotation,A.HelioVector(body,date));
 const planets=PLANETS.map((name,i)=>{const v=vector(name);return {name,colour:COLOURS[i],x:v.x,y:v.y,z:v.z,distance:Math.hypot(v.x,v.y,v.z)};});
 const m=A.RotateVector(rotation,A.GeoMoon(date)),earth=planets[2];
 return {date:date.toISOString(),planets,moon:{name:'Moon',colour:'#e4e6ed',x:earth.x+m.x,y:earth.y+m.y,z:earth.z+m.z,relative:{x:m.x,y:m.y,z:m.z},distance:Math.hypot(m.x,m.y,m.z)},frame:'J2000 ecliptic',unit:'AU'};
}
export function orbitTracks(A,date){
 const rotation=A.Rotation_EQJ_ECL();
 return PLANETS.map(name=>({name,points:Array.from({length:97},(_,i)=>{const d=new Date(date.getTime()+A.PlanetOrbitalPeriod(name)*DAY*(i/96-.5)),v=A.RotateVector(rotation,A.HelioVector(name,d));return {x:v.x,y:v.y};})}));
}
export function mapPoint(v,mode='compact'){
 const radius=Math.hypot(v.x,v.y),scale=mode==='compact'?(radius?78*Math.log1p(radius)/Math.log(33)/radius:0):78/(mode==='inner'?1.8:32);
 return {x:108+v.x*scale,y:87-v.y*scale};
}
export function solarSystemSvg(state,tracks,mode='compact',selected='Earth'){
 const planets=mode==='inner'?state.planets.slice(0,4):state.planets;
 const path=points=>points.map((v,i)=>{const p=mapPoint(v,mode);return `${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
 const markers=planets.map(p=>{const pos=mapPoint(p,mode);return `<circle cx="${pos.x}" cy="${pos.y}" r="${p.name===selected?5:3}" fill="${p.colour}" stroke="${p.name===selected?'white':'#101c32'}"><title>${p.name}: ${p.distance.toFixed(3)} AU from Sun</title></circle>`;}).join('');
 const earth=mapPoint(state.planets[2],mode),mr=state.moon.relative,a=Math.atan2(mr.y,mr.x);
 const moon=`<line x1="${earth.x}" y1="${earth.y}" x2="${earth.x+10*Math.cos(a)}" y2="${earth.y-10*Math.sin(a)}" stroke="#cbd3df"/><circle cx="${earth.x+10*Math.cos(a)}" cy="${earth.y-10*Math.sin(a)}" r="2" fill="white"><title>Earth's Moon: separation enlarged</title></circle>`;
 const body=state.planets.find(p=>p.name===selected),caption=selected==='Moon'?`${Math.round(state.moon.distance*149597870.7).toLocaleString('en-AU')} km from Earth`:`${body.distance.toFixed(3)} AU from Sun`;
 const legend=state.planets.map((p,i)=>`<circle cx="225" cy="${17+i*14}" r="3" fill="${p.colour}"/><text x="235" y="${20+i*14}" font-size="11" fill="${p.name===selected?'#fff':'#b9c8dc'}" font-weight="${p.name===selected?'bold':'normal'}">${p.name}</text>`).join('');
 return `<svg viewBox="0 0 336 180" role="img" aria-label="Solar system at ${state.date}: Sun, eight planets and Earth's Moon; viewed from above the north ecliptic pole"><rect width="336" height="180" rx="7" fill="#101c32"/>${tracks.filter(t=>planets.some(p=>p.name===t.name)).map(t=>`<path d="${path(t.points)}" fill="none" stroke="${t.name===selected?'#7b9dbd':'#31415b'}" stroke-width=".7"/>`).join('')}<circle cx="108" cy="87" r="6" fill="#ffd567"/><text x="108" y="104" text-anchor="middle" font-size="9" fill="#ffd567">Sun</text>${moon}${markers}${legend}<circle cx="225" cy="129" r="2" fill="white"/><text x="235" y="133" font-size="10" fill="white">Moon (enlarged)</text><text x="220" y="150" font-size="10" fill="white">${selected}</text><text x="220" y="163" font-size="9" fill="#b9c8dc">${caption}</text><text x="108" y="175" text-anchor="middle" font-size="8" fill="#b9c8dc">${mode==='compact'?'Distances compressed logarithmically':'Projected distances to scale'} · markers enlarged</text></svg>`;
}
