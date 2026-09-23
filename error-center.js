(function(){
"use strict";
const KEY="gkyyy_error_center_v2";
const DAY=86400000;
const FILTERS=["all","grammar","reading","listening","writing","speaking"];
let state={items:[],filter:"all"};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||"{}")||{});}catch(e){}
if(!Array.isArray(state.items))state.items=[];

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
function skillLabel(s){return ({grammar:"Grammar",reading:"Reading",listening:"Listening",writing:"Writing",speaking:"Speaking"})[s]||s||"Other";}
function skillIcon(s){return ({grammar:"🧠",reading:"📖",listening:"🎧",writing:"✍️",speaking:"🎙️"})[s]||"🧩";}
function memoryTip(it){
  const custom=String(it.memoryTip||"").trim(); if(custom)return custom;
  if(it.skill==="grammar")return "Nhìn dấu hiệu thời gian + chủ ngữ + cấu trúc trước khi chọn dạng từ.";
  if(it.skill==="reading")return "Không chọn vì thấy từ giống câu hỏi. Luôn tìm evidence và paraphrase trước.";
  if(it.skill==="listening")return "Dự đoán loại đáp án trước khi nghe, rồi kiểm tra spelling/number/plural sau khi nghe.";
  if(it.skill==="writing")return "Đọc lỗi → nói quy tắc → viết lại cả câu đúng một lần mà không nhìn đáp án.";
  if(it.skill==="speaking")return "Nói lại bản sửa 2 lần thành tiếng, sau đó dùng cùng cấu trúc trong một câu mới.";
  return "Nhớ theo chuỗi: Sai → Vì sao → Quy tắc → Làm lại.";
}
function nextLabel(ts){
  if(!ts||ts<=Date.now())return "Ôn ngay";
  const d=Math.ceil((ts-Date.now())/DAY);
  return d<=1?"Ôn ngày mai":"Ôn sau "+d+" ngày";
}
function dedupeKey(x){return [x.skill,x.question||x.task,x.userAnswer,x.correctAnswer].map(norm).join("|");}
function record(x){
  x=x||{};
  const now=Date.now();
  const item={
    id:x.id||("e"+now.toString(36)+Math.random().toString(36).slice(2,7)),
    skill:String(x.skill||"other").toLowerCase(),
    task:String(x.task||x.source||"").trim(),
    question:String(x.question||x.prompt||"").trim(),
    userAnswer:String(x.userAnswer||x.wrong||"").trim(),
    correctAnswer:String(x.correctAnswer||x.correct||x.better||"").trim(),
    why:String(x.why||x.explanation||x.reason||"").trim(),
    rule:String(x.rule||x.fix||"").trim(),
    evidence:String(x.evidence||"").trim(),
    errorType:String(x.errorType||x.type||"").trim(),
    memoryTip:String(x.memoryTip||"").trim(),
    createdAt:Number(x.createdAt)||now,
    lastSeenAt:now,
    seenCount:Number(x.seenCount)||1,
    reviewLevel:Number(x.reviewLevel)||0,
    nextReviewAt:Number(x.nextReviewAt)||now,
    drillWins:Number(x.drillWins)||0,
    mastered:!!x.mastered,
    practiceNote:String(x.practiceNote||"")
  };
  if(!item.question&&!item.userAnswer&&!item.correctAnswer)return null;
  const k=dedupeKey(item);
  const old=state.items.find(i=>dedupeKey(i)===k);
  if(old){
    old.lastSeenAt=now;old.seenCount=(old.seenCount||1)+1;old.mastered=false;old.nextReviewAt=now;
    ["why","rule","evidence","errorType","task"].forEach(p=>{if(item[p])old[p]=item[p];});
    save(); if(document.getElementById("errorCenter"))render(); return old;
  }
  state.items.unshift(item);save();if(document.getElementById("errorCenter"))render();return item;
}
window.recordLearningError=record;

function importLegacy(){
  try{
    const legacy=JSON.parse(localStorage.getItem("ielts100_online")||"{}");
    (legacy.mistakes||[]).forEach(m=>record({
      id:"legacy-"+m.id,skill:m.type,task:"Day "+(m.day||"?"),question:m.p,correctAnswer:m.c,
      why:m.e,mastered:!!m.mastered,createdAt:Date.now()-DAY
    }));
  }catch(e){}
}
let imported=false;
function ensureImport(){if(imported)return;imported=true;importLegacy();}

function isDue(i){return !i.mastered && (!i.nextReviewAt||i.nextReviewAt<=Date.now());}
function filtered(){
  let a=state.items.slice();
  if(state.filter!=="all")a=a.filter(i=>i.skill===state.filter);
  return a.sort((a,b)=>(Number(isDue(b))-Number(isDue(a)))||(b.lastSeenAt-a.lastSeenAt));
}
function similarity(a,b){
  a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;
  const A=new Set(a.split(/\s+/)),B=new Set(b.split(/\s+/));let hit=0;A.forEach(x=>{if(B.has(x))hit++;});
  return hit/Math.max(A.size,B.size);
}
function statHTML(){
  const active=state.items.filter(i=>!i.mastered),due=active.filter(isDue),mastered=state.items.filter(i=>i.mastered);
  const counts={};active.forEach(i=>counts[i.skill]=(counts[i.skill]||0)+1);
  const weak=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
  return '<div class="errStats">'+
    '<div><span>Cần ôn</span><b>'+due.length+'</b><small>hôm nay</small></div>'+
    '<div><span>Đang học</span><b>'+active.length+'</b><small>lỗi chưa chắc</small></div>'+
    '<div><span>Đã nhớ</span><b>'+mastered.length+'</b><small>đã xử lý</small></div>'+
    '<div><span>Ưu tiên</span><b class="textStat">'+(weak?skillLabel(weak):"—")+'</b><small>'+(weak?(counts[weak]+" lỗi"):"chưa có dữ liệu")+'</small></div>'+
  '</div>';
}
function cardHTML(i){
  const idx=state.items.indexOf(i);
  const wrong=i.userAnswer||"Chưa lưu đáp án của bạn";
  const correct=i.correctAnswer||"Xem lại đáp án trong task";
  const due=isDue(i);
  return '<article class="errCard '+(i.mastered?"mastered":"")+'" data-err="'+idx+'">'+
    '<div class="errCardTop"><div><span class="errSkill '+esc(i.skill)+'">'+skillIcon(i.skill)+' '+esc(skillLabel(i.skill))+'</span>'+
      (i.errorType?'<span class="errType">'+esc(i.errorType)+'</span>':'')+
      (i.seenCount>1?'<span class="errRepeat">Lặp '+i.seenCount+'×</span>':'')+
    '</div><span class="errDue '+(due?"now":"")+'">'+(i.mastered?"✓ Đã nhớ":esc(nextLabel(i.nextReviewAt)))+'</span></div>'+
    '<h3>'+esc(i.question||i.task||"Lỗi cần sửa")+'</h3>'+
    (i.task?'<div class="errSource">'+esc(i.task)+'</div>':'')+
    '<div class="errCompare"><div><small>Bạn làm / nói / viết</small><strong class="wrong">'+esc(wrong)+'</strong></div><div><small>Đúng / nên dùng</small><strong class="right">'+esc(correct)+'</strong></div></div>'+
    '<div class="errExplain">'+
      '<p><b>Vì sao sai:</b> '+esc(i.why||"Lỗi này cần được đối chiếu lại với yêu cầu câu hỏi và đáp án đúng.")+'</p>'+
      (i.rule?'<p><b>Quy tắc / cách sửa:</b> '+esc(i.rule)+'</p>':'')+
      (i.evidence?'<p><b>Evidence:</b> '+esc(i.evidence)+'</p>':'')+
      '<p class="errMemory"><b>🧠 Cách nhớ:</b> '+esc(memoryTip(i))+'</p>'+
    '</div>'+
    '<div class="errActions">'+
      '<button class="btn errPractice" data-id="'+esc(i.id)+'">🎯 Luyện lại 3 bước</button>'+
      '<button class="btn errMaster" data-id="'+esc(i.id)+'">'+(i.mastered?"↩ Học lại":"✓ Tôi đã nhớ")+'</button>'+
    '</div>'+
    '<div class="errDrill hidden" id="drill-'+esc(i.id)+'">'+
      '<div class="errDrillHead"><b>Bài cải thiện 3 bước</b><span>Recall → Explain → Transfer</span></div>'+
      '<label><span>1. Không nhìn đáp án, gõ lại câu/đáp án đúng</span><input class="errRecall" autocomplete="off" placeholder="Gõ đáp án đúng..."></label>'+
      '<button class="btn primary errCheckRecall" data-id="'+esc(i.id)+'">Check</button><div class="errRecallFeedback"></div>'+
      '<label><span>2. Tự giải thích: tại sao đáp án cũ sai?</span><textarea class="errExplainInput" placeholder="Nói lại quy tắc bằng lời của bạn..."></textarea></label>'+
      '<label><span>3. Transfer: tự tạo một ví dụ/câu mới dùng đúng quy tắc này</span><textarea class="errTransfer" placeholder="Viết ví dụ mới...">'+esc(i.practiceNote||"")+'</textarea></label>'+
      '<button class="btn errSavePractice" data-id="'+esc(i.id)+'">💾 Lưu phần luyện</button>'+
    '</div>'+
  '</article>';
}
function render(){
  ensureImport();
  const root=document.getElementById("errorCenter");if(!root)return;
  const list=filtered();
  root.innerHTML=
    '<section class="errHero"><div><span class="phase">ERROR LAB</span><h2>Lỗi sai → hiểu → luyện lại → nhớ lâu</h2><p>Mọi lỗi từ Grammar, Reading, Listening, Writing và Speaking sẽ tự vào đây. Mục tiêu không chỉ lưu lỗi, mà biến mỗi lỗi thành một bài sửa ngắn có lịch ôn lại.</p></div>'+
      '<div class="errCycle"><b>1</b> Sai <i>→</i><b>2</b> Hiểu <i>→</i><b>3</b> Luyện <i>→</i><b>4</b> Ôn lại</div></section>'+
    statHTML()+
    '<div class="errToolbar"><div class="errFilters">'+FILTERS.map(f=>'<button data-err-filter="'+f+'" class="'+(state.filter===f?"active":"")+'">'+(f==="all"?"Tất cả":skillLabel(f))+'</button>').join("")+'</div>'+
      '<span>'+list.length+' lỗi đang hiển thị</span></div>'+
    (list.length?'<div class="errList">'+list.map(cardHTML).join("")+'</div>':
      '<div class="errEmpty"><b>Chưa có lỗi trong mục này.</b><p>Làm task và bấm chấm bài. Những câu sai sẽ tự được lưu vào Error Lab.</p></div>');
  bind();
}
window.renderErrorCenter=render;

function byId(id){return state.items.find(i=>i.id===id);}
function bind(){
  document.querySelectorAll("[data-err-filter]").forEach(b=>b.onclick=()=>{state.filter=b.dataset.errFilter;save();render();});
  document.querySelectorAll(".errPractice").forEach(b=>b.onclick=()=>document.getElementById("drill-"+b.dataset.id)?.classList.toggle("hidden"));
  document.querySelectorAll(".errMaster").forEach(b=>b.onclick=()=>{
    const i=byId(b.dataset.id);if(!i)return;i.mastered=!i.mastered;
    if(!i.mastered)i.nextReviewAt=Date.now();save();render();
  });
  document.querySelectorAll(".errCheckRecall").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),input=card.querySelector(".errRecall"),fb=card.querySelector(".errRecallFeedback"),i=byId(b.dataset.id);if(!i)return;
    const score=similarity(input.value,i.correctAnswer);
    if(score>=.72){
      i.drillWins=(i.drillWins||0)+1;i.reviewLevel=Math.min(5,(i.reviewLevel||0)+1);
      const days=[1,3,7,14,30][Math.max(0,i.reviewLevel-1)]||30;i.nextReviewAt=Date.now()+days*DAY;
      if(i.drillWins>=3)i.mastered=true;
      fb.className="errRecallFeedback good";fb.textContent="✓ Đúng. Lần ôn tiếp theo: "+nextLabel(i.nextReviewAt)+".";
      save();
    }else{
      i.reviewLevel=Math.max(0,(i.reviewLevel||0)-1);i.nextReviewAt=Date.now();
      fb.className="errRecallFeedback bad";fb.innerHTML="Chưa đúng. Gợi ý: <b>"+esc(i.correctAnswer.slice(0,Math.max(3,Math.ceil(i.correctAnswer.length*.35))))+"…</b>";
      save();
    }
  });
  document.querySelectorAll(".errSavePractice").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),i=byId(b.dataset.id);if(!i)return;
    const ex=card.querySelector(".errExplainInput").value.trim(),tr=card.querySelector(".errTransfer").value.trim();
    i.practiceNote=tr;if(ex)i.selfExplanation=ex;
    if(tr&&ex){i.reviewLevel=Math.max(1,i.reviewLevel||0);if(!i.nextReviewAt||i.nextReviewAt<=Date.now())i.nextReviewAt=Date.now()+DAY;}
    save();b.textContent="✓ Đã lưu";setTimeout(()=>b.textContent="💾 Lưu phần luyện",1000);
  });
}
document.addEventListener("click",e=>{
  const nav=e.target.closest('.nav[data-view="errors"]');
  if(nav)setTimeout(render,0);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("view-errors")?.classList.contains("active"))render();});
else if(document.getElementById("view-errors")?.classList.contains("active"))render();
})();