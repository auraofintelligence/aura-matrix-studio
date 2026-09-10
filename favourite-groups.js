import {canonicalPage,PAGE_PARENTS} from './original-routes.js?v=0.3.6';
export const FAVOURITE_GROUPS=[
 ['start','Start & shortcuts',['QuickStart Aura','Aura Menu','Quick Navigation','SiteMap']],
 ['people','People & family',['We Are Family','Birthdays','Milestones','Social Proximity','Nearby Friends','Social Web']],
 ['time','Time & routines',['Timelines','Schedules','Reminders','Counters','Ceremonies','Home Automation']],
 ['goals','Goals & learning',['Public Life Goals','Private Wish Lists','Public Wish Lists','Bucket List','Learning','Work','Favorites Lists']],
 ['travel','Travel & places',['Travel Plans','Multi-Stop Journey Planner','Navigation Pathfinder','Weather','Nearby Opportunities','Mind Palace']],
 ['aura','Aura & self',['Chakras','Crown','Celestial','Avatar','Virtual Reality Mode']],
 ['matrix','Matrix & tools',['Matrix Programmer','Tool Inventory']],
 ['community','Markets & community',['Marketplace','The Aura Affinity','GAJRA.Earth','Community','Advertising Options']],
 ['settings','Settings & devices',['System Preferences']]
];
export function favouriteGroups(pages,available){
 const byId=new Map(pages.map(p=>[p.id,p])),groups=FAVOURITE_GROUPS.map(([id,label,names])=>({id,label,names,pages:[]}));
 for(const page of available){let current=page,group,seen=new Set();
  while(current&&!seen.has(current.id)){seen.add(current.id);group=groups.find(g=>g.names.includes(current.name));if(group)break;current=byId.get(canonicalPage(PAGE_PARENTS[current.id]||current.parent));}
  (group||groups.at(-1)).pages.push(page);
 }
 // Start each group with its useful entry pages, then preserve the original
 // related branch order rather than sorting names alphabetically.
 for(const group of groups){const order=new Map(group.names.map((name,i)=>[name,i]));group.pages.sort((a,b)=>(order.get(a.name)??999)-(order.get(b.name)??999)||pages.indexOf(a)-pages.indexOf(b));}
 return groups.filter(g=>g.pages.length);
}
