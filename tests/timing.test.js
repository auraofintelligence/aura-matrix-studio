import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankProject,validateProject} from '../core.js';
import {saveQuickEntry} from '../quickstart.js';
import {timingEntries,saveTiming,nextOccurrences,conditionResult,timingRule} from '../timing-data.js';
const catalogue=JSON.parse(readFileSync(new URL('../assets/dataset-catalogue.json',import.meta.url)));
const dataset=id=>catalogue.datasets.find(d=>d.id===id);
test('QuickStart answers appear in the matching timing pages and edits preserve row identity and unrelated data',()=>{
 let p=saveQuickEntry(blankProject(),dataset('life-events'),{Title:'My birthday',Date:'2000-02-29',Meaning:'Keep this'},'my-birthday');
 p=saveQuickEntry(p,dataset('life-events'),{Title:'Start my course',Date:'2027-03-01'},'course');
 p=saveQuickEntry(p,dataset('schedules'),{Title:'Water plants',Date:'2027-01-01',Time:'08:00'},'plants');
 p=saveQuickEntry(p,dataset('learning'),{Title:'Drawing',Practice:'Weekly sketch'},'drawing');
 p=saveQuickEntry(p,dataset('goals'),{Title:'Learn to draw','Next action':'Sketch a tree'},'goal');
 assert.equal(timingEntries(p,'birthdays').length,1);assert.equal(timingEntries(p,'milestones').length,2);assert.equal(timingEntries(p,'learning')[0].Practice,'Weekly sketch');assert.equal(timingEntries(p,'reminders').length,2);
 const row=timingEntries(p,'birthdays')[0],next=saveTiming(p,'birthdays',{Title:row.Title,Date:row.Date,Repeat:'Yearly','Reminder minutes':'1440'},row);
 assert.equal(next.tables.length,p.tables.length);assert.equal(timingEntries(next,'birthdays')[0].id,'my-birthday');assert.equal(timingEntries(next,'birthdays')[0].Meaning,'Keep this');assert.equal(next.tables[0].rows.length,2);
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(next))),next);
});
test('calendar repeats handle leap birthdays, month ends, large date gaps and reminder offsets',()=>{
 const birthday={Title:'Birthday',id:'my-birthday',Date:'2000-02-29',Time:'09:00'};
 assert.deepEqual(nextOccurrences(birthday,new Date(2027,0,1),2).map(x=>x.date),['2027-02-28','2028-02-29']);
 const month={id:'m',Date:'2027-01-31',Repeat:'Monthly',Time:'09:00'};
 assert.deepEqual(nextOccurrences(month,new Date(2027,1,1),3).map(x=>x.date),['2027-02-28','2027-03-31','2027-04-30']);
 const daily={id:'d',Date:'2000-01-01',Repeat:'Daily',Time:'09:00','Reminder minutes':'1440'};
 const result=nextOccurrences(daily,new Date(2050,0,1,10),1)[0];assert.equal(result.date,'2050-01-03');assert.equal(new Date(result.remindAt).getDate(),2);
 assert.equal(nextOccurrences({...month,'End date':'2027-02-28'},new Date(2027,1,1),3).length,1);
 assert.equal(nextOccurrences({...month,Status:'Paused'}).length,0);
});
test('conditions use the current referenced row, fail closed when missing and export linked actions',()=>{
 let p=saveTiming(blankProject(),'counters',{Title:'Practice sessions',Value:'2',Target:'5'}),counter=timingEntries(p,'counters')[0];
 const condition=JSON.stringify({tableId:counter.tableId,rowId:counter.id,column:'Value',operator:'>=',value:5});
 p=saveTiming(p,'schedules',{Title:'Celebrate practice','Signal condition':condition,Instructions:'Review my progress','Required data':'{"topic":"drawing"}'});let signal=timingEntries(p,'schedules')[0];
 assert.equal(conditionResult(p,signal).pass,false);p=saveTiming(p,'counters',{Title:counter.Title,Value:'5'},counter);assert.equal(conditionResult(p,signal).pass,true);
 const rule=timingRule(p,signal);assert.equal(rule.action.data.topic,'drawing');assert.equal(rule.source.rowId,signal.id);assert.equal(rule.condition.rowId,counter.id);
 p.tables=p.tables.filter(t=>t.id!==counter.tableId);assert.equal(conditionResult(p,signal).pass,false);
 assert.throws(()=>saveTiming(p,'schedules',{Title:'Broken','Required data':'{bad'}));
 assert.throws(()=>saveTiming(p,'schedules',{Title:'Broken',Interval:'0'}));assert.throws(()=>saveTiming(p,'schedules',{Title:'Broken',Date:'2027-02-30'}));
});
test('goal dates update the original column and linked program steps remain in the exported rule',()=>{
 let p=saveQuickEntry(blankProject(),dataset('goals'),{Title:'Complete a course','Target date':'2027-02-01'},'course-goal');
 const goal=timingEntries(p,'milestones')[0];p.programs.push({id:'sequence',name:'Review progress',loop:false,steps:[]});
 p=saveTiming(p,'milestones',{Title:goal.Title,Date:'2027-03-01','Program ID':'sequence'},goal);
 const result=timingEntries(p,'milestones')[0];assert.equal(result['Target date'],'2027-03-01');assert.equal(result.Date,undefined);assert.equal(timingRule(p,result).action.program.name,'Review progress');
});
