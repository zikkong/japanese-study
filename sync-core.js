/* Pure state/merge logic; also used by automated tests. */
(function(root){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function normalize(x){
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('학습 기록 형식이 올바르지 않아요.');
 const out={completed:{},wrong:{},history:{},started:typeof x.started==='string'?x.started.slice(0,10):new Date().toISOString().slice(0,10)};
 for(const section of ['completed','wrong','history']){
  const data=x[section]||{};
  if(typeof data!=='object'||Array.isArray(data)||data===null)throw Error('기록 형식 오류: '+section);
  for(const [k,v] of Object.entries(data)){
   if(section==='completed'&&/^(?:[1-9]|[12]\d|30)$/.test(k)&&typeof v==='string')out.completed[k]=v;
   if(section==='history'&&/^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(v))out.history[k]=[...new Set(v.filter(n=>Number.isInteger(n)&&n>=1&&n<=30))].sort((a,b)=>a-b);
   if(section==='wrong'&&/^(?:[1-9]|[12]\d|30)-(?:char-[0-2]|word)$/.test(k)&&v&&typeof v==='object'&&typeof v.q==='string'&&typeof v.correct==='string'&&typeof v.ex==='string'&&Number.isInteger(v.lesson)&&v.lesson>=1&&v.lesson<=30)out.wrong[k]={id:k,q:v.q.slice(0,500),a:Array.isArray(v.a)?v.a.filter(a=>typeof a==='string').map(a=>a.slice(0,500)).slice(0,10):[],correct:v.correct.slice(0,500),ex:v.ex.slice(0,500),lesson:v.lesson};
  }
 }
 return out;
}
// Three-way field merge. Deletions remain deletions; divergent edits require a choice.
function merge(base,local,remote){
 const result={completed:{},wrong:{},history:{},started:remote.started||local.started},conflicts=[];
 for(const section of ['completed','wrong','history']){
  for(const key of new Set([...Object.keys(base[section]),...Object.keys(local[section]),...Object.keys(remote[section])])){
   const b=base[section][key],l=local[section][key],r=remote[section][key]; let value;
   if(eq(l,r)||eq(r,b))value=l;
   else if(eq(l,b))value=r;
   else if(section==='history'&&Array.isArray(l)&&Array.isArray(r)&&(!b||b.every(n=>l.includes(n)&&r.includes(n))))value=[...new Set([...l,...r])].sort((a,b)=>a-b);
   else{conflicts.push(section+'.'+key);value=l;}
   if(value!==undefined)result[section][key]=copy(value);
  }
 }
 return {state:result,conflicts};
}
root.StudyCore={copy,eq,normalize,merge};
})(typeof globalThis!=='undefined'?globalThis:this);
