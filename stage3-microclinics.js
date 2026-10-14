/* 12 first-party microclinics for additional IELTS skill drills, not official test simulation. */
(function(){
"use strict";
const cases=window.GKStage3PracticeData?.cases||{};
const KEY="gk_stage3_micro_v1";let old={};
try{old=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=old.records||{};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const get=id=>records[id]||(records[id]={answers:{},checked:false,attempts:[],firstScore:null});
let info="";
function save(){try{localStorage.setItem(KEY,JSON.stringify({records}))}catch(e){info="Could not save microclinic progress."}}
function count(id){
 const c=cases[id],r=get(id);
 return c.questions.filter((q,i)=>Array.isArray(q.correct)?Array.isArray(r.answers[i])&&r.answers[i].length===q.correct.length:Number.isInteger(r.answers[i])).length;
}
function correct(q,a){return Array.isArray(q.correct)?Array.isArray(a)&&q.correct.length===a.length&&q.correct.every(j=>a.includes(j)):a===q.correct}
function score(id){const r=get(id);return cases[id].questions.reduce((sum,q,i)=>sum+(correct(q,r.answers[i])?1:0),0)}
function render(id){
 const c=cases[id];if(!c)return"";
 const r=get(id),checked=r.checked;
 let h='<section class="s3-panel s3-micro"><h3>03 · Original microclinic (new questions)</h3><p>'+esc(c.intro)+'</p>';
 if(c.dialog){
  h+='<p><button type="button" class="s3-primary" data-micro-action="play" data-micro-id="'+id+'">▶ Listen (synthetic practice voice)</button></p>';
  h+=checked?'<details><summary>Transcript · unlocked after Check</summary>'+c.dialog.map(t=>'<p><b>'+esc(t.speaker)+':</b> '+esc(t.text)+'</p>').join("")+'</details>':'<p class="s3-tip">Transcript is hidden until Check. This is a synthetic recording, not natural IELTS audio.</p>';
 }else h+='<div class="s3-stimulus" lang="en">'+esc(c.text||"")+'</div>';
 for(let i=0;i<c.questions.length;i++){
  const q=c.questions[i],answer=r.answers[i],multi=Array.isArray(q.correct);
  h+='<fieldset class="s3-mq"><legend>'+(i+1)+'. '+esc(q.prompt)+(multi?" (Choose TWO)":"")+'</legend>';
  for(let j=0;j<q.options.length;j++){
   const chosen=multi?Array.isArray(answer)&&answer.includes(j):answer===j;
   const good=multi?q.correct.includes(j):q.correct===j;
   h+='<button type="button" data-micro-id="'+id+'" data-micro-q="'+i+'" data-micro-option="'+j+'" '+(checked?"disabled":"")+' aria-pressed="'+chosen+'" class="s3-choice '+(chosen?"selected ":"")+(checked?(good?"correct":chosen?"wrong":""):"")+'">'+String.fromCharCode(65+j)+'. '+esc(q.options[j])+'</button>';
  }
  if(checked)h+='<p class="s3-explanation">'+(correct(q,answer)?"Correct. ":"Review. ")+esc(q.why)+'</p>';
  h+='</fieldset>';
 }
 if(!checked)h+='<button type="button" data-micro-action="check" data-micro-id="'+id+'" class="s3-primary" '+(count(id)!==c.questions.length?"disabled":"")+'>Check</button>';
 else h+='<p class="s3-explanation"><b>Practice: '+score(id)+'/'+c.questions.length+'</b> · '+(r.attempts.length===1?"First-attempt evidence saved.":"Repeated answers are familiar; the first attempt stays saved.")+'</p>'+
 '<button type="button" data-micro-action="retry" data-micro-id="'+id+'" class="s3-primary">Practise known questions again</button>';
 if(info)h+='<p class="s3-message">'+esc(info)+'</p>';
 h+='<p class="s3-tip">These are short technique checks. They do not measure full IELTS performance, response timing, pronunciation, or natural listening.</p></section>';
 return h;
}
function refresh(){window.GKStage3Evidence?.refresh?.();}
function onOption(id,i,j){
 const c=cases[id],r=get(id),q=c?.questions[i];if(!q||r.checked||!q.options[j])return;
 const current=r.answers[i];
 if(Array.isArray(q.correct)){
  const a=Array.isArray(current)?current.slice():[];
  if(a.includes(j))r.answers[i]=a.filter(k=>k!==j);else if(a.length<q.correct.length)r.answers[i]=[...a,j];
 }else r.answers[i]=j;
 save();refresh();
}
function submit(id){
 const c=cases[id],r=get(id);if(r.checked||count(id)!==c.questions.length)return;
 r.checked=true;
 const report={at:Date.now(),score:score(id),total:c.questions.length,first:r.attempts.length===0,objectiveMicroclinic:true};
 r.attempts.push(report);r.attempts=r.attempts.slice(-25);
 if(r.firstScore===null)r.firstScore=report.score;
 save();info="Check complete; explanations unlocked.";refresh();
}
function play(id){
 const c=cases[id];if(!c?.dialog)return;
 const r=window.GKYVoice?.playConversation?.(c.dialog,{locale:"en-NZ",rate:.92});
 if(!r?.ok){info="Browser voice unavailable; use an official recording for listening practice.";refresh();}
}
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-micro-id]");if(!b||!cases[b.dataset.microId])return;
 const id=b.dataset.microId;
 if(b.dataset.microOption!==undefined){onOption(id,Number(b.dataset.microQ),Number(b.dataset.microOption));return}
 if(b.dataset.microAction==="check"){submit(id);return}
 if(b.dataset.microAction==="play"){play(id);return}
 if(b.dataset.microAction==="retry"){get(id).answers={};get(id).checked=false;save();info="The original first-attempt score remains unchanged.";refresh();return}
});
window.GKStage3Micro={render,getRecord:get,score,cases};
})();