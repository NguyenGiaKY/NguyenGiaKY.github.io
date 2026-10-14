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

/* Original, accessible IELTS-style visual stimuli; source data stay in tables. */
function visualMarkup(v){
 if(!v)return"";
 let h='<figure class="s3-visual"><figcaption>'+esc(v.title||"Data visual")+' <small>Original fictional practice data</small></figcaption>';
 if(v.kind==="flow"){
  h+='<ol class="s3-flow">'+(v.steps||[]).map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>';
 }else if(v.kind==="maps"){
  for(const [label,layout] of [["Before",v.before],["After",v.after]]){
   h+='<div class="s3-map-group"><b>'+label+'</b><div class="s3-map-grid" aria-label="'+label+' site layout">';
   for(const line of layout||[])for(const cell of line)h+='<div>'+esc(cell)+'</div>';
   h+='</div></div>';
  }
 }else if(Array.isArray(v.headers)&&Array.isArray(v.rows)){
  const data=v.rows,headers=v.headers;
  if(["bar","line"].includes(v.kind)&&data.length>1){
   const nums=data.flatMap(r=>r.slice(1).filter(Number.isFinite)),max=Math.max(1,...nums)*1.1;
   const colours=["#255f9b","#c47732","#5d7f52"],left=65,right=590,top=18,bottom=204;
   const x=i=>left+(data.length===1?0:i*(right-left)/(data.length-1));
   const y=z=>bottom-(Number(z)||0)/max*(bottom-top);
   h+='<svg class="s3-svg-plot" role="img" aria-label="'+esc(v.title||"Graph")+'" viewBox="0 0 640 245">';
   h+='<line x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+bottom+'" stroke="#748ba6"/><line x1="'+left+'" y1="'+bottom+'" x2="'+right+'" y2="'+bottom+'" stroke="#748ba6"/>';
   for(let k=0;k<=4;k++){const level=max*k/4,pos=y(level);h+='<line x1="'+left+'" y1="'+pos+'" x2="'+right+'" y2="'+pos+'" stroke="#e1e9f2"/><text x="'+(left-8)+'" y="'+(pos+4)+'" text-anchor="end" font-size="10" fill="#405575">'+Math.round(level)+'</text>'}
   if(v.kind==="line"){
    for(let j=1;j<headers.length;j++){
     h+='<polyline fill="none" stroke="'+colours[(j-1)%3]+'" stroke-width="3" points="'+data.map((r,i)=>x(i)+","+y(r[j])).join(" ")+'"/>';
     for(let i=0;i<data.length;i++)h+='<circle cx="'+x(i)+'" cy="'+y(data[i][j])+'" r="4" fill="'+colours[(j-1)%3]+'"/>';
    }
   }else{
    const gap=(right-left)/data.length,w=Math.min(22,gap/(headers.length+1));
    for(let i=0;i<data.length;i++)for(let j=1;j<headers.length;j++){
     const px=left+i*gap+gap/2-(headers.length-1)*w/2+(j-1)*w,py=y(data[i][j]);
     h+='<rect x="'+px+'" y="'+py+'" width="'+w+'" height="'+Math.max(0,bottom-py)+'" fill="'+colours[(j-1)%3]+'"/>';
    }
   }
   for(let i=0;i<data.length;i++){
    const xPos=v.kind==="bar"?left+(i+.5)*(right-left)/data.length:x(i);
    h+='<text x="'+xPos+'" y="225" text-anchor="middle" font-size="11" fill="#405575">'+esc(data[i][0])+'</text>';
   }
   h+='</svg><div class="s3-legend">'+headers.slice(1).map((str,i)=>'<span><i style="background:'+colours[i%3]+'"></i>'+esc(str)+'</span>').join("")+'</div>';
  }else if(v.kind==="pie"){
   const total=data.reduce((n,r)=>n+Number(r[1]||0),0)||1,colours=["#245b95","#c36f32","#53866e","#a85984","#9aa44d","#7777b9"];
   let offset=0;h+='<svg class="s3-svg-pie" role="img" aria-label="'+esc(v.title||"Pie chart")+'" viewBox="0 0 250 230"><circle cx="120" cy="110" r="75" fill="#eef3f8"/>';
   for(let i=0;i<data.length;i++){const frac=Math.max(0,Number(data[i][1]||0))/total,part=frac*100;
    h+='<circle cx="120" cy="110" r="75" transform="rotate(-90 120 110)" fill="none" stroke="'+colours[i%colours.length]+'" stroke-width="150" stroke-dasharray="'+part+' '+(100-part)+'" stroke-dashoffset="'+(-offset)+'" pathLength="100"/>';
    offset+=part;
   }
   h+='</svg><div class="s3-legend">'+data.map((r,i)=>'<span><i style="background:'+colours[i%colours.length]+'"></i>'+esc(r[0])+' ('+esc(r[1])+'%)</span>').join("")+'</div>';
  }
  h+='<table class="s3-data-table"><caption>Exact source values</caption><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+
    data.map(r=>'<tr>'+r.map((x,i)=>i===0?'<th scope="row">'+esc(x)+'</th>':'<td>'+esc(x)+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
  if(v.kind==="mixed")h+='<p class="s3-tip">These data use different units. Do not compare 65% with 2,400 students on a single numerical scale.</p>';
 }
 return h+'</figure>';
}

function render(id){
 const c=cases[id];if(!c)return"";
 const r=get(id),checked=r.checked;
 let h='<section class="s3-panel s3-micro"><h3>03 · Original microclinic (new questions)</h3><p>'+esc(c.intro)+'</p>';
 if(c.dialog){
  h+='<p><button type="button" class="s3-primary" data-micro-action="play" data-micro-id="'+id+'">▶ Listen (synthetic practice voice)</button></p>';
  h+=checked?'<details><summary>Transcript · unlocked after Check</summary>'+c.dialog.map(t=>'<p><b>'+esc(t.speaker)+':</b> '+esc(t.text)+'</p>').join("")+'</details>':'<p class="s3-tip">Transcript is hidden until Check. This is a synthetic recording, not natural IELTS audio.</p>';
 }else h+='<div class="s3-stimulus" lang="en">'+esc(c.text||"")+'</div>'+visualMarkup(c.visual);
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
 const first=r.attempts.length===0;
 if(first&&typeof window.recordLearningError==="function"){
  for(let i=0;i<c.questions.length;i++){
   const q=c.questions[i],answer=r.answers[i];
   if(correct(q,answer))continue;
   const label=a=>Array.isArray(a)?a.map(j=>q.options[j]).join("; "):q.options[a]||"(no valid answer)";
   window.recordLearningError({skill:c.mode,task:"Stage 3 microclinic / "+id,question:q.prompt,
    userAnswer:label(answer),correctAnswer:label(q.correct),why:q.why,
    rule:"Use the source evidence and exclude alternatives that are not supported.",errorType:c.mode==="listening"?"distractor":c.mode==="reading"?"evidence":"task"});
  }
 }
 const report={at:Date.now(),score:score(id),total:c.questions.length,first,objectiveMicroclinic:true};
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