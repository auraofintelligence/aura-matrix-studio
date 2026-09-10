const text=(s,label,max=100000)=>{if(typeof s!=='string'||s.length>max)throw Error('Invalid '+label);return s;};
export function validateTables(raw=[]){
  if(!Array.isArray(raw))throw Error('Dataset tables must be a list.');const ids=new Set();
  return raw.map(t=>{
    const id=text(t.id,'table ID',200);if(!id||ids.has(id))throw Error('Table IDs must be unique.');ids.add(id);
    const name=text(t.name,'table name',500).trim();if(!name)throw Error('Give the table a name.');
    if(!Array.isArray(t.columns)||!t.columns.length)throw Error('A table needs columns.');
    const columns=t.columns.map(c=>text(c,'column',500).trim());
    if(columns.some(c=>!c||['__proto__','constructor','prototype'].includes(c))||new Set(columns).size!==columns.length)throw Error('Use unique, non-empty column names.');
    if(!Array.isArray(t.rows))throw Error('Table rows must be a list.');const rowIds=new Set();
    const rows=t.rows.map(r=>{const rowId=text(r.id,'row ID',200);if(!rowId||rowIds.has(rowId))throw Error('Row IDs must be unique within a table.');rowIds.add(rowId);if(!Array.isArray(r.values)||r.values.length!==columns.length)throw Error('Each row must match the columns.');return {id:rowId,values:r.values.map(v=>text(v,'table value'))};});
    const chakraTags=t.chakraTags||[];if(!Array.isArray(chakraTags)||chakraTags.some(n=>!Number.isInteger(n)||n<0||n>6)||new Set(chakraTags).size!==chakraTags.length)throw Error('Choose chakra tags from the seven shells.');
    return {id,name,category:text(t.category||'assets','category',200),recommendation:text(t.recommendation||'imports','recommendation',200),columns,rows,chakraTags:[...chakraTags]};
  });
}
export function validateQuickStart(raw={step:0}){
  if(!raw||!Number.isInteger(raw.step)||raw.step<0||raw.step>9)throw Error('Invalid QuickStart page.');return {step:raw.step};
}
