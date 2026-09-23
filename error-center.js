(function(){
"use strict";
const KEY="gkyyy_error_center_v2";
const DAY=86400000;
const FILTERS=["all","due","grammar","reading","listening","writing","speaking","mastered"];
let state={items:[],filter:"all"};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||"{}")||{});}catch(e){}
if(!Array.isArray(state.items))state.items=[];

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
function skillLabel(s){return ({all:"Tất cả",due:"Cần ôn",mastered:"Đã nhớ",grammar:"Grammar",reading:"Reading",listening:"Listening",writing:"Writing",speaking:"Speaking"})[s]||s||"Other";}
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
  if(state.filter==="due")a=a.filter(isDue);
  else if(state.filter==="mastered")a=a.filter(i=>i.mastered);
  else if(state.filter!=="all")a=a.filter(i=>i.skill===state.filter&&!i.mastered);
  return a.sort((a,b)=>(Number(isDue(b))-Number(isDue(a)))||(b.lastSeenAt-a.lastSeenAt));
}
function similarity(a,b){
  a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;
  const A=new Set(a.split(/\s+/)),B=new Set(b.split(/\s+/));let hit=0;A.forEach(x=>{if(B.has(x))hit++;});
  return hit/Math.max(A.size,B.size);
}
function tokenDiff(wrong,correct){
  const W=String(wrong||"").trim().split(/\s+/).filter(Boolean);
  const C=String(correct||"").trim().split(/\s+/).filter(Boolean);
  let p=0;while(p<W.length&&p<C.length&&norm(W[p])===norm(C[p]))p++;
  let sw=W.length-1,sc=C.length-1;
  while(sw>=p&&sc>=p&&norm(W[sw])===norm(C[sc])){sw--;sc--;}
  let wrongChunk=W.slice(p,sw+1).join(" "),correctChunk=C.slice(p,sc+1).join(" ");
  if(!correctChunk)correctChunk=String(correct||"").trim();
  if(!wrongChunk)wrongChunk=String(wrong||"").trim();
  return {
    before:C.slice(0,p).join(" "),
    after:C.slice(sc+1).join(" "),
    wrongChunk,correctChunk
  };
}
function diffLineHTML(it){
  const d=tokenDiff(it.userAnswer,it.correctAnswer);
  const before=d.before?esc(d.before)+" ":"",after=d.after?" "+esc(d.after):"";
  return '<div class="errDiffBox">'+
    '<div><small>Chỗ gây lỗi</small><p>'+before+'<mark class="errOldChunk">'+esc(d.wrongChunk||"—")+'</mark>'+after+'</p></div>'+
    '<div><small>Cần đổi thành</small><p>'+before+'<mark class="errNewChunk">'+esc(d.correctChunk||it.correctAnswer||"—")+'</mark>'+after+'</p></div>'+
  '</div>';
}
function deterministicSwap(id){
  return String(id||"").split("").reduce((n,ch)=>n+ch.charCodeAt(0),0)%2===0;
}
function optionPair(it){
  const right=String(it.correctAnswer||"").trim(),wrong=String(it.userAnswer||"").trim();
  if(!wrong||norm(wrong)===norm(right))return [right,"Không có thay đổi"];
  return deterministicSwap(it.id)?[right,wrong]:[wrong,right];
}
function preventionOptions(it){
  let right=String(it.rule||"").trim();
  const defaults={
    grammar:"Xác định dấu hiệu ngữ pháp + chủ ngữ trước, rồi mới chọn dạng đúng.",
    reading:"Tìm evidence trong passage và đối chiếu paraphrase trước khi chọn.",
    listening:"Dự đoán loại đáp án, nghe đúng từ khóa rồi kiểm tra spelling / plural / number.",
    writing:"Sửa theo cả cấu trúc câu và collocation, không chỉ thay một từ riêng lẻ.",
    speaking:"Ưu tiên câu rõ và đúng trước; sau đó mới mở rộng và nâng cấp từ vựng."
  };
  if(!right)right=defaults[it.skill]||"Đối chiếu đúng yêu cầu rồi kiểm tra lại điểm vừa sai.";
  const traps={
    grammar:["Chọn theo từ đứng gần chỗ trống nhất.","Dịch từ tiếng Việt sang rồi chọn dạng nghe có vẻ đúng."],
    reading:["Chọn đáp án có nhiều từ giống câu hỏi nhất.","Dùng kiến thức bên ngoài bài để đoán đáp án."],
    listening:["Viết ngay từ đầu tiên nghe thấy và không cần kiểm tra lại.","Chỉ nghe nghĩa chung; spelling và số nhiều không quan trọng."],
    writing:["Cứ dùng từ khó hơn thì band sẽ tăng dù collocation chưa đúng.","Chỉ sửa từ bị sai, không cần xem cấu trúc cả câu."],
    speaking:["Cố nói câu thật dài dù grammar không chắc.","Chỉ cần thay từ vựng khó hơn, không cần sửa cách diễn đạt."]
  };
  let arr=[right].concat(traps[it.skill]||["Đoán theo cảm giác.","Nhìn đáp án rồi học thuộc nguyên câu."]);
  if(deterministicSwap(it.id))arr=[arr[1],arr[0],arr[2]];
  else arr=[arr[2],arr[1],arr[0]];
  return {right,options:arr};
}
function targetedDrillHTML(it){
  const d=tokenDiff(it.userAnswer,it.correctAnswer);
  if(it.skill==="listening"){
    return '<div class="errTargetPrompt"><b>🎧 Dictation repair</b><p>Nghe đúng từ/cụm này rồi gõ lại chính xác. Mục tiêu: sửa lỗi nghe + spelling.</p>'+
      '<button class="btn errPlayTarget" data-id="'+esc(it.id)+'">🔊 Nghe</button>'+
      '<input class="errTargetInput" autocomplete="off" placeholder="Gõ chính xác từ/cụm vừa nghe..."></div>';
  }
  if(it.skill==="reading"){
    return '<div class="errTargetPrompt"><b>🔎 Evidence-first drill</b>'+
      '<p class="errEvidenceMini">'+esc(it.evidence||it.why||"Đọc lại evidence/giải thích rồi chọn đáp án được hỗ trợ trực tiếp.")+'</p>'+
      '<div class="errChoiceGrid">'+optionPair(it).map(x=>'<button class="errChoice errTargetChoice" data-id="'+esc(it.id)+'" data-value="'+esc(x)+'">'+esc(x)+'</button>').join("")+'</div></div>';
  }
  const before=d.before?esc(d.before)+" ":"",after=d.after?" "+esc(d.after):"";
  return '<div class="errTargetPrompt"><b>🧩 Micro-cloze đúng chỗ sai</b><p>'+before+'<span class="errBlank">_____</span>'+after+'</p>'+
    '<small>Chỉ gõ phần cần thay, không phải viết lại cả câu.</small>'+
    '<input class="errTargetInput" autocomplete="off" placeholder="Phần đúng là..."></div>';
}
function speakTarget(it){
  const text=String(it.correctAnswer||"").trim();if(!text)return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";u.rate=.82;speechSynthesis.speak(u);
  }catch(e){}
}
function markStage(card,n,ok,msg){
  const stage=card.querySelector('[data-stage="'+n+'"]');
  const fb=stage&&stage.querySelector(".errStageFeedback");
  if(stage)stage.dataset.pass=ok?"1":"0";
  if(stage)stage.classList.toggle("passed",!!ok);
  if(stage)stage.classList.toggle("failed",!ok);
  if(fb){fb.className="errStageFeedback "+(ok?"good":"bad");fb.textContent=msg;}
}
function maybeCompleteRound(card,it){
  const stages=[...card.querySelectorAll(".errRepairStage")];
  if(stages.length<3||!stages.every(s=>s.dataset.pass==="1")||card.dataset.roundSaved==="1")return;
  card.dataset.roundSaved="1";
  it.drillWins=(it.drillWins||0)+1;
  it.reviewLevel=Math.min(5,(it.reviewLevel||0)+1);
  const days=[1,3,7,14,30][Math.max(0,it.reviewLevel-1)]||30;
  it.nextReviewAt=Date.now()+days*DAY;
  if(it.drillWins>=3)it.mastered=true;
  save();
  const done=card.querySelector(".errRepairDone");
  if(done){
    done.classList.remove("hidden");
    done.innerHTML='<b>✓ Một vòng sửa lỗi hoàn tất.</b><span>'+(it.mastered?'Bạn đã vượt lỗi này 3 lần. Đã chuyển sang “Đã nhớ”.':'Web sẽ hỏi lại lỗi này '+nextLabel(it.nextReviewAt).toLowerCase()+'.')+'</span>';
  }
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
  const opts=optionPair(i);
  const prev=preventionOptions(i);
  return '<article class="errCard '+(i.mastered?"mastered":"")+'" data-err="'+idx+'" data-id="'+esc(i.id)+'">'+
    '<div class="errCardTop"><div><span class="errSkill '+esc(i.skill)+'">'+skillIcon(i.skill)+' '+esc(skillLabel(i.skill))+'</span>'+
      (i.errorType?'<span class="errType">'+esc(i.errorType)+'</span>':'')+
      (i.seenCount>1?'<span class="errRepeat">Lặp '+i.seenCount+'×</span>':'')+
    '</div><span class="errDue '+(due?"now":"")+'">'+(i.mastered?"✓ Đã nhớ":esc(nextLabel(i.nextReviewAt)))+'</span></div>'+
    '<h3>'+esc(i.question||i.task||"Lỗi cần sửa")+'</h3>'+
    (i.task?'<div class="errSource">'+esc(i.task)+'</div>':'')+
    '<div class="errCompare"><div><small>Bạn làm / nói / viết</small><strong class="wrong">'+esc(wrong)+'</strong></div><div><small>Đúng / nên dùng</small><strong class="right">'+esc(correct)+'</strong></div></div>'+
    diffLineHTML(i)+
    '<div class="errExplain">'+
      '<p><b>Vì sao sai:</b> '+esc(i.why||"Lỗi này cần được đối chiếu lại với yêu cầu câu hỏi và đáp án đúng.")+'</p>'+
      (i.rule?'<p><b>Điểm cần nhớ:</b> '+esc(i.rule)+'</p>':'')+
      (i.evidence?'<p><b>Evidence:</b> '+esc(i.evidence)+'</p>':'')+
      '<p class="errMemory"><b>⚡ Mẹo 10 giây:</b> '+esc(memoryTip(i))+'</p>'+
    '</div>'+
    '<div class="errActions">'+
      '<button class="btn primary errPractice" data-id="'+esc(i.id)+'">🎯 Luyện ngay · 3 bài nhỏ</button>'+
      '<button class="btn errMaster" data-id="'+esc(i.id)+'">'+(i.mastered?"↩ Học lại":"✓ Đã nhớ")+'</button>'+
    '</div>'+
    '<div class="errDrill hidden" id="drill-'+esc(i.id)+'">'+
      '<div class="errDrillHead"><div><b>Repair Test</b><span>Không viết giải thích dài. Làm 3 micro-drill đúng vào lỗi vừa mắc.</span></div><em>'+(i.drillWins||0)+'/3 vòng</em></div>'+
      '<section class="errRepairStage" data-stage="1">'+
        '<div class="errStageTitle"><b>1. Nhận diện bẫy</b><span>5–10 giây</span></div>'+
        '<p>Trong hai lựa chọn dưới đây, cái nào đúng trong task này?</p>'+
        '<div class="errChoiceGrid">'+opts.map(x=>'<button class="errChoice errTrapChoice" data-id="'+esc(i.id)+'" data-value="'+esc(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
        '<div class="errStageFeedback"></div>'+
      '</section>'+
      '<section class="errRepairStage" data-stage="2">'+
        '<div class="errStageTitle"><b>2. Luyện đúng điểm yếu</b><span>'+esc(skillLabel(i.skill))+'</span></div>'+
        targetedDrillHTML(i)+
        (i.skill==="reading"?'' : '<button class="btn primary errCheckTarget" data-id="'+esc(i.id)+'">Check</button>')+
        '<div class="errStageFeedback"></div>'+
      '</section>'+
      '<section class="errRepairStage" data-stage="3">'+
        '<div class="errStageTitle"><b>3. Anti-repeat test</b><span>Chặn lỗi lặp lại</span></div>'+
        '<p>Lần sau gặp dạng tương tự, bạn nên làm gì?</p>'+
        '<div class="errRuleChoices">'+prev.options.map(x=>'<button class="errRuleChoice" data-id="'+esc(i.id)+'" data-value="'+esc(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
        '<div class="errStageFeedback"></div>'+
      '</section>'+
      '<div class="errRepairDone hidden"></div>'+
    '</div>'+
  '</article>';
}
function render(){
  ensureImport();
  const root=document.getElementById("errorCenter");if(!root)return;
  const list=filtered();
  const dueCount=state.items.filter(isDue).length;
  root.innerHTML=
    '<section class="errHero"><div><span class="phase">ERROR LAB</span><h2>Lỗi sai → hiểu → luyện lại → nhớ lâu</h2><p>Mọi lỗi từ Grammar, Reading, Listening, Writing và Speaking sẽ tự vào đây. Mỗi lỗi có giải thích, mẹo nhớ và Repair Test đúng vào chỗ bạn vừa sai.</p></div>'+
      '<div class="errHeroActions"><div class="errCycle"><b>1</b> Sai <i>→</i><b>2</b> Hiểu <i>→</i><b>3</b> Luyện <i>→</i><b>4</b> Ôn lại</div>'+
      '<button id="errStartDue" class="btn primary" '+(dueCount?'':'disabled')+'>🎯 Luyện lỗi hôm nay'+(dueCount?' · '+dueCount:'')+'</button></div></section>'+
    statHTML()+
    '<section class="errMethodRow">'+
      '<div><b>🪤 Nhận diện bẫy</b><span>Chọn lại giữa đáp án đúng và lỗi cũ.</span></div>'+
      '<div><b>🧩 Luyện đúng điểm yếu</b><span>Micro-cloze, dictation hoặc evidence-first theo từng kỹ năng.</span></div>'+
      '<div><b>🛡 Anti-repeat</b><span>Chọn chiến lược để không mắc lại lỗi tương tự.</span></div>'+
      '<div><b>⚡ Mẹo 10 giây</b><span>Rule ngắn, dễ nhớ ngay trên mỗi lỗi.</span></div>'+
    '</section>'+
    '<div class="errToolbar"><div class="errFilters">'+FILTERS.map(f=>'<button data-err-filter="'+f+'" class="'+(state.filter===f?"active":"")+'">'+skillLabel(f)+'</button>').join("")+'</div>'+
      '<span>'+list.length+' lỗi đang hiển thị</span></div>'+
    (list.length?'<div class="errList">'+list.map(cardHTML).join("")+'</div>':
      '<div class="errEmpty"><b>Chưa có lỗi trong mục này.</b><p>Làm task và bấm chấm bài. Những câu sai sẽ tự được lưu vào Error Lab và tạo bài luyện riêng.</p></div>');
  bind();
}
window.renderErrorCenter=render;

function byId(id){return state.items.find(i=>i.id===id);}
function bind(){
  document.querySelectorAll("[data-err-filter]").forEach(b=>b.onclick=()=>{state.filter=b.dataset.errFilter;save();render();});
  const startDue=document.getElementById("errStartDue");
  if(startDue)startDue.onclick=()=>{
    const first=state.items.filter(isDue).sort((a,b)=>(b.seenCount||1)-(a.seenCount||1))[0];
    if(!first)return;
    state.filter="due";save();render();
    setTimeout(()=>{
      const btn=document.querySelector('.errPractice[data-id="'+CSS.escape(first.id)+'"]');
      if(btn){btn.click();btn.closest(".errCard")?.scrollIntoView({behavior:"smooth",block:"start"});}
    },30);
  };
  document.querySelectorAll(".errPractice").forEach(b=>b.onclick=()=>{
    const drill=document.getElementById("drill-"+b.dataset.id);if(!drill)return;
    drill.classList.toggle("hidden");
    if(!drill.classList.contains("hidden"))setTimeout(()=>drill.scrollIntoView({behavior:"smooth",block:"nearest"}),40);
  });
  document.querySelectorAll(".errMaster").forEach(b=>b.onclick=()=>{
    const i=byId(b.dataset.id);if(!i)return;
    i.mastered=!i.mastered;
    if(!i.mastered)i.nextReviewAt=Date.now();
    save();render();
  });
  document.querySelectorAll(".errTrapChoice").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),i=byId(b.dataset.id);if(!i)return;
    card.querySelectorAll(".errTrapChoice").forEach(x=>x.classList.remove("picked","right","wrong"));
    const ok=norm(b.dataset.value)===norm(i.correctAnswer);
    b.classList.add("picked",ok?"right":"wrong");
    markStage(card,1,ok,ok?"✓ Đúng. Bạn đã phân biệt được đáp án đúng với bẫy cũ.":"Chưa đúng — đây chính là bẫy cũ. Nhìn phần “Chỗ gây lỗi” phía trên rồi chọn lại.");
    maybeCompleteRound(card,i);
  });
  document.querySelectorAll(".errPlayTarget").forEach(b=>b.onclick=()=>{const i=byId(b.dataset.id);if(i)speakTarget(i);});
  document.querySelectorAll(".errCheckTarget").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),i=byId(b.dataset.id);if(!i)return;
    const input=card.querySelector(".errTargetInput"),d=tokenDiff(i.userAnswer,i.correctAnswer);
    let expected=i.skill==="listening"?i.correctAnswer:d.correctChunk;
    let ok=similarity(input?.value||"",expected)>=.84;
    markStage(card,2,ok,ok?"✓ Chính xác. Bạn đã sửa đúng phần yếu thay vì học thuộc cả câu.":"Chưa đúng. Gợi ý: phần cần sửa bắt đầu bằng “"+String(expected||"").slice(0,Math.max(1,Math.ceil(String(expected||"").length*.25)))+"…”");
    maybeCompleteRound(card,i);
  });
  document.querySelectorAll(".errTargetChoice").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),i=byId(b.dataset.id);if(!i)return;
    card.querySelectorAll(".errTargetChoice").forEach(x=>x.classList.remove("picked","right","wrong"));
    const ok=norm(b.dataset.value)===norm(i.correctAnswer);
    b.classList.add("picked",ok?"right":"wrong");
    markStage(card,2,ok,ok?"✓ Evidence hỗ trợ đáp án này.":"Chưa đúng. Đừng dựa vào từ giống câu hỏi; đọc evidence rồi đối chiếu nghĩa.");
    maybeCompleteRound(card,i);
  });
  document.querySelectorAll(".errRuleChoice").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),i=byId(b.dataset.id);if(!i)return;
    const p=preventionOptions(i);
    card.querySelectorAll(".errRuleChoice").forEach(x=>x.classList.remove("picked","right","wrong"));
    const ok=norm(b.dataset.value)===norm(p.right);
    b.classList.add("picked",ok?"right":"wrong");
    markStage(card,3,ok,ok?"✓ Đây là chiến lược giúp chặn lỗi này lặp lại.":"Đó là một thói quen dễ làm bạn lặp lại lỗi. Chọn cách kiểm tra có rule/evidence rõ.");
    maybeCompleteRound(card,i);
  });
  document.querySelectorAll(".errTargetInput").forEach(input=>input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();input.closest(".errRepairStage")?.querySelector(".errCheckTarget")?.click();}
  }));
}
document.addEventListener("click",e=>{
  const nav=e.target.closest('.nav[data-view="errors"]');
  if(nav)setTimeout(render,0);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("view-errors")?.classList.contains("active"))render();});
else if(document.getElementById("view-errors")?.classList.contains("active"))render();
})();