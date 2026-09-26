import {make,button} from './local-tools.js?v=0.4.17';
export const DEMO_GUIDE='aura-demo-guide';
const HOME='72917D84-7C55-42C9-A552-27AC4CB15FE7',QUICK='D203ACAB-C2D1-4433-8EE2-3522C47CC3D0';
export function mountGuideEntry({screen,page,go}){
  const entry=make('section',page.id===HOME?'demo-home-entry':'demo-quick-entry');
  if(page.id===HOME){for(const n of screen.querySelectorAll('.original-control.TextArea'))n.hidden=true;entry.append(make('h1','','Explore your Aura'),make('p','','Bring your people, plans and ideas together. Start with one QuickStart answer, or explore the icons around you.'));}
  const b=button('How the demo works',()=>go(DEMO_GUIDE),'demo-guide-link');const icon=make('img');icon.src='assets/mockplus/aura-guide.svg';icon.alt='';b.prepend(icon);entry.append(b);screen.append(entry);
}
export function mountDemoGuide({screen,go}){
  for(const n of screen.children)n.hidden=true;
  const panel=make('section','demo-guide'),head=make('header'),back=button('Back',()=>go('command:back'),'ethereal-nav');head.append(back,make('h1','','How the demo works'));panel.append(head);
  const body=make('div','demo-guide-body');panel.append(body);screen.append(panel);
  body.append(make('p','demo-guide-intro','Aura brings everyday information into one personal interface. This demo lets you enter information, revisit it and explore how it could live in a spatial Aura. Start small; you can return to any area.'));
  const link=(parent,label,id)=>parent.append(button(label,()=>go(id),'demo-guide-action'));
  const step=(number,title,copy,label,id)=>{const section=make('section','demo-guide-step'),heading=make('h2');heading.append(make('span','demo-step-number',number),document.createTextNode(title));section.append(heading,make('p','',copy));link(section,label,id);body.append(section);};
  step('1','Add one thing','Open a QuickStart card, enter an answer and save it. Swipe through the steps or skip ahead. Your answers remain editable in the relevant pages.','Open QuickStart',QUICK);
  step('2','Make it useful','Explore your avatar, family, friendships, goals and travel plans. Timing & signals brings saved dates and reminders together with suggestions you can adapt.','Open the main menu',HOME);
  step('3','Give information a place','Enter the Matrix, choose a chakra and switch Inside / Outside. Tap a facet, then use Data, Stacks or Style. Drag to turn the torus and pinch to zoom.','Enter the Matrix','BDBC5806-9DB0-4CB2-901E-31E2E973173B');
  step('4','Keep a copy','Use Your Aura data to export your saved inputs and uploaded files. Import a backup to restore them. The separate Vector Space lab needs its own export.','Your Aura data','aura-data-transfer');
  const section=(title,copy)=>{const d=make('details'),s=make('summary','',title);d.append(s,make('p','',copy));body.append(d);return d;};
  const nav=section('Finding your way','Back returns to the page you visited. Favourites keeps your chosen shortcuts; the site map shows the branches of the app. Frames keep their designed orientation, so landscape pages may turn when viewed on a portrait phone.');link(nav,'Favourites','B47A9839-38E6-49D8-B255-0D9E428E521C');link(nav,'Site map','E3222692-1B76-4EAF-9517-C5E94323947C');
  const vector=section('Exploring Vector Space','The neutral cloud is a demonstration, not an actual embedding vector field. Hover or tap its points; drag to orbit and pinch to zoom. The corner axes show orientation. Try example, then Analyse, calculates word-pattern vectors from labelled text. These use shared words, not a neural model understanding their meaning.');link(vector,'Open Vector Space','aura-vector-space');vector.append(make('p','','Inspect a memory to edit its colour, direction, charge or pulse, and link it to geometry. Earth map shows latitude and longitude. Save / restore exports this lab separately.'));
  const limits=section('What works, and what is still a proposal','Saved forms, tables, facets, stacks, local imports and backups work. Vector Space is an isolated experiment. Mind Palaces can collect source media, but AI reconstruction is not connected. Autonomous agents, live device control and enforced sharing permissions are still planned. Some original pages remain design placeholders.');
  limits.append(make('p','','Information is stored in this browser. Inside / Outside changes the surface you are editing; it does not encrypt or publish your data. Clearing browser data can remove it. Map tiles and external links may use the internet.'));
  const advanced=section('Detailed matrix instructions','The original Guide covers addresses, records, stacking, sequences and exports. The Explainer demonstrates the geometry transforms.');for(const [label,href]of [['Matrix guide','guide.html'],['Animated explainer','explainer.html']]){const a=make('a','demo-guide-action',label);a.href=href;advanced.append(a);}
  const top=button('Back to top',()=>body.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}),'demo-guide-action');body.append(top);
  return {resize(){},dispose(){panel.remove();}};
}
