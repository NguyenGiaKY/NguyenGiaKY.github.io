(function(){
"use strict";

const KEY="gkyyy_error_center_v2";
const DAY=86400000;
const FILTERS=["all","due","grammar","reading","listening","writing","speaking","mastered"];
let state={items:[],filter:"all"};
let imported=false;

try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||"{}")||{});}catch(e){}
if(!Array.isArray(state.items))state.items=[];

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
function skillLabel(s){return ({all:"Tất cả",due:"Cần ôn",mastered:"Đã nhớ",grammar:"Grammar",reading:"Reading",listening:"Listening",writing:"Writing",speaking:"Speaking"})[s]||s||"Other";}
function skillIcon(s){return ({grammar:"🧠",reading:"📖",listening:"🎧",writing:"✍️",speaking:"🎙️"})[s]||"🧩";}
function nextLabel(ts){
  if(!ts||ts<=Date.now())return "Ôn ngay";
  const d=Math.ceil((ts-Date.now())/DAY);
  return d<=1?"Ôn ngày mai":"Ôn sau "+d+" ngày";
}
function dedupeKey(x){return [x.skill,x.question||x.task,x.userAnswer,x.correctAnswer].map(norm).join("|");}
function baseTip(it){
  if(it.memoryTip)return it.memoryTip;
  if(it.skill==="grammar")return "Khoanh tín hiệu ngữ pháp trước khi chọn dạng từ.";
  if(it.skill==="reading")return "Evidence trước, đáp án sau. Đừng chọn vì thấy keyword giống.";
  if(it.skill==="listening")return "Dự đoán loại từ → nghe target → kiểm tra spelling/plural.";
  if(it.skill==="writing")return "Sửa cả cụm/cấu trúc, không vá một từ riêng lẻ.";
  if(it.skill==="speaking")return "Ưu tiên câu đúng và tự nhiên; sau đó mới nâng cấp từ.";
  return "So chỗ sai với chỗ đúng rồi luyện đúng điểm khác nhau.";
}

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
    repairPack:x.repairPack||null,
    repairProgress:x.repairProgress||{},
    packOpen:false
  };
  if(!item.question&&!item.userAnswer&&!item.correctAnswer)return null;
  const k=dedupeKey(item),old=state.items.find(i=>dedupeKey(i)===k);
  if(old){
    old.lastSeenAt=now;
    old.seenCount=(old.seenCount||1)+1;
    old.mastered=false;
    old.nextReviewAt=now;
    old.repairProgress={};
    old._roundCounted=false;
    old.drillWins=0;
    old.reviewLevel=0;
    ["why","rule","evidence","errorType","task","memoryTip"].forEach(p=>{if(item[p])old[p]=item[p];});
    save();renderIfMounted();return old;
  }
  state.items.unshift(item);save();renderIfMounted();return item;
}
window.recordLearningError=record;

function importLegacy(){
  try{
    const legacy=JSON.parse(localStorage.getItem("ielts100_online")||"{}");
    (legacy.mistakes||[]).forEach(m=>{if(state.items.some(i=>i.id==="legacy-"+m.id))return;record({
      id:"legacy-"+m.id,skill:m.type,task:"Day "+(m.day||"?"),question:m.p,correctAnswer:m.c,
      why:m.e,mastered:!!m.mastered,createdAt:Date.now()-DAY
    });});
  }catch(e){}
}
function ensureImport(){if(imported)return;imported=true;if(!state.legacyImported){importLegacy();state.legacyImported=true;save();}}
function isDue(i){return !i.mastered&&(!i.nextReviewAt||i.nextReviewAt<=Date.now());}
function startDueRound(it){
  if(it._roundCounted&&isDue(it)){
    it._roundCounted=false;
    it.repairProgress={};
    save();
  }
}
function filtered(){
  let a=state.items.slice();
  if(state.filter==="due")a=a.filter(isDue);
  else if(state.filter==="mastered")a=a.filter(i=>i.mastered);
  else if(state.filter!=="all")a=a.filter(i=>i.skill===state.filter&&!i.mastered);
  return a.sort((a,b)=>(Number(isDue(b))-Number(isDue(a)))||(b.lastSeenAt-a.lastSeenAt));
}
function byId(id){return state.items.find(i=>i.id===id);}
function answerKey(s){return norm(s).replace(/[’‘]/g,"'").replace(/[.,!?;:]+$/g,"").trim();}
function answerMatches(input,expected){
  const key=answerKey(input);
  return !!key&&String(expected||"").split("|").some(option=>key===answerKey(option));
}
function validPack(pack){
  const stages=[...(Array.isArray(pack?.drills)?pack.drills:[]),pack?.final_retry];
  return stages.length===4&&stages.every(d=>{
    if(!d||!["mcq","fill","listen_type"].includes(d.type)||!String(d.prompt||"").trim()||!String(d.answer||"").trim())return false;
    return d.type!=="mcq"||(Array.isArray(d.options)&&d.options.length>=2&&d.options.some(o=>answerMatches(o,d.answer)));
  });
}
function tokenDiff(wrong,correct){
  const W=String(wrong||"").trim().split(/\s+/).filter(Boolean);
  const C=String(correct||"").trim().split(/\s+/).filter(Boolean);
  let p=0;while(p<W.length&&p<C.length&&norm(W[p])===norm(C[p]))p++;
  let sw=W.length-1,sc=C.length-1;
  while(sw>=p&&sc>=p&&norm(W[sw])===norm(C[sc])){sw--;sc--;}
  return {
    before:C.slice(0,p).join(" "),
    wrongChunk:W.slice(p,sw+1).join(" ")||String(wrong||"").trim(),
    correctChunk:C.slice(p,sc+1).join(" ")||String(correct||"").trim(),
    after:C.slice(sc+1).join(" ")
  };
}
function diffHTML(it){
  const d=tokenDiff(it.userAnswer,it.correctAnswer);
  const before=d.before?esc(d.before)+" ":"",after=d.after?" "+esc(d.after):"";
  return '<div class="errDiffBox">'+
    '<div><small>Chỗ gây lỗi</small><p>'+before+'<mark class="errOldChunk">'+esc(d.wrongChunk||"—")+'</mark>'+after+'</p></div>'+
    '<div><small>Cần đổi thành</small><p>'+before+'<mark class="errNewChunk">'+esc(d.correctChunk||"—")+'</mark>'+after+'</p></div>'+
  '</div>';
}
function statHTML(){
  const active=state.items.filter(i=>!i.mastered),due=active.filter(isDue),mastered=state.items.filter(i=>i.mastered);
  const counts={};active.forEach(i=>counts[i.skill]=(counts[i.skill]||0)+1);
  const weak=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
  return '<div class="errStats">'+
    '<div><span>Cần luyện</span><b>'+due.length+'</b><small>đến hạn hôm nay</small></div>'+
    '<div><span>Đang sửa</span><b>'+active.length+'</b><small>lỗi chưa ổn định</small></div>'+
    '<div><span>Đã qua</span><b>'+mastered.length+'</b><small>đã vượt 3 vòng</small></div>'+
    '<div><span>Điểm yếu</span><b class="textStat">'+(weak?skillLabel(weak):"—")+'</b><small>'+(weak?(counts[weak]+" lỗi"):"chưa có dữ liệu")+'</small></div>'+
  '</div>';
}

function drillControlHTML(drill,idx,it,isFinal){
  if(!drill)return "";
  const type=String(drill.type||"fill");
  const title=isFinal?"Retry câu gốc":(drill.title_vi||("Bài "+(idx+1)));
  let body="";
  const locked=idx>0&&!it.repairProgress?.[idx-1];
  const disabled=locked?' disabled aria-disabled="true"':'';
  if(type==="mcq"&&Array.isArray(drill.options)){
    body='<div class="errSmartChoices">'+drill.options.slice(0,4).map(o=>
      '<button type="button" class="errSmartChoice" data-pack-choice="'+idx+'" data-id="'+esc(it.id)+'" data-value="'+esc(o)+'"'+disabled+'>'+esc(o)+'</button>'
    ).join("")+'</div>';
  }else if(type==="listen_type"){
    body='<div class="errListenRow"><button type="button" class="btn errPackListen" data-id="'+esc(it.id)+'" data-pack-listen="'+idx+'"'+disabled+'>🔊 Nghe</button>'+ 
      '<span>Nghe rồi gõ chính xác — không nhìn đáp án.</span></div>'+
       '<div class="errSmartInputRow"><input class="errPackInput" data-pack-input="'+idx+'" autocomplete="off" placeholder="Gõ đáp án bạn nghe..."'+disabled+'>'+
       '<button type="button" class="btn primary errPackCheck" data-id="'+esc(it.id)+'" data-pack-check="'+idx+'"'+disabled+'>Check</button></div>';
  }else{
    body='<div class="errSmartInputRow"><input class="errPackInput" data-pack-input="'+idx+'" autocomplete="off" placeholder="Nhập đáp án..."'+disabled+'>'+
       '<button type="button" class="btn primary errPackCheck" data-id="'+esc(it.id)+'" data-pack-check="'+idx+'"'+disabled+'>Check</button></div>';
  }
  const passed=!!(it.repairProgress&&it.repairProgress[idx]);
  return '<section class="errSmartDrill '+(passed?"passed":"")+'" data-smart-stage="'+idx+'">'+
    '<div class="errSmartDrillHead"><span>'+(isFinal?"FINAL":("0"+(idx+1)).slice(-2))+'</span><div><b>'+esc(title)+'</b>'+
     (isFinal?'<small>Làm lại kiểu exam — không hiện đáp án trước</small>':'<small>'+(idx===0?"Đánh đúng vào lỗi vừa mắc":idx===1?"Đổi ngữ cảnh để tránh học thuộc":"Gần dạng IELTS thật hơn")+'</small>')+
    '</div></div>'+
    '<p class="errSmartPrompt">'+esc(drill.prompt||"")+'</p>'+body+
    '<div class="errStageFeedback '+(passed?"good":"")+'">'+(passed?"✓ Đã vượt bài này.":"")+'</div>'+
  '</section>';
}

function repairPackHTML(it){
  if(!it.repairPack){
    return '<div class="errPackStart">'+
      '<div><b>🧪 Fix Pack cá nhân hóa</b><p>Web sẽ tạo <strong>3 bài tập thật</strong> dựa đúng vào lỗi này, rồi cho bạn làm lại một câu cuối giống kiểu thi. Không có “tự giải thích” hay “tự nghĩ ví dụ”.</p></div>'+
      '<button type="button" class="btn primary errGeneratePack" data-id="'+esc(it.id)+'">✨ Tạo 3 bài luyện</button>'+
      '<small>Mỗi lỗi chỉ tạo một lần rồi được lưu lại để luyện tiếp.</small>'+
    '</div>';
  }
  const p=it.repairPack,drills=Array.isArray(p.drills)?p.drills.slice(0,3):[];
  return '<div class="errSmartIntro">'+
      '<div class="errPattern"><span>MẪU LỖI</span><b>'+esc(p.pattern_vi||it.rule||"Xem chỗ sai và chỗ đúng để nhận ra pattern.")+'</b></div>'+
      '<div class="errMemoryHook"><span>⚡ Mẹo 10 giây</span><b>'+esc(p.memory_tip_vi||baseTip(it))+'</b></div>'+
      (p.diagnosis_vi?'<p><b>Chẩn đoán:</b> '+esc(p.diagnosis_vi)+'</p>':'')+
    '</div>'+
    '<div class="errSmartDrills">'+
      drills.map((d,i)=>drillControlHTML(d,i,it,false)).join("")+
      drillControlHTML(p.final_retry||{},3,it,true)+
    '</div>'+
    '<div class="errPackDone '+(it.repairProgress&&[0,1,2,3].every(n=>it.repairProgress[n])?"":"hidden")+'">'+
      '<b>✓ Hoàn tất một Fix Pack.</b><span>'+(it.mastered?"Lỗi này đã ổn định và chuyển sang Đã nhớ.":"Web sẽ hỏi lại theo lịch spaced review.")+'</span>'+
    '</div>';
}

function cardHTML(it){
  const due=isDue(it),wrong=it.userAnswer||"Chưa lưu đáp án của bạn",correct=it.correctAnswer||"Xem lại trong task";
  return '<article class="errCard errCardV3 '+(it.mastered?"mastered":"")+'" data-id="'+esc(it.id)+'">'+
    '<div class="errCardTop"><div><span class="errSkill '+esc(it.skill)+'">'+skillIcon(it.skill)+' '+esc(skillLabel(it.skill))+'</span>'+
      (it.errorType?'<span class="errType">'+esc(it.errorType)+'</span>':'')+
      (it.seenCount>1?'<span class="errRepeat">Lặp '+it.seenCount+'×</span>':'')+
    '</div><span class="errDue '+(due?"now":"")+'">'+(it.mastered?"✓ Đã nhớ":esc(nextLabel(it.nextReviewAt)))+'</span></div>'+
    '<h3>'+esc(it.question||it.task||"Lỗi cần sửa")+'</h3>'+
    (it.task?'<div class="errSource">'+esc(it.task)+'</div>':'')+
    '<div class="errCompare"><div><small>Bạn làm / nói / viết</small><strong class="wrong">'+esc(wrong)+'</strong></div>'+
      '<div><small>Đúng / nên dùng</small><strong class="right">'+esc(correct)+'</strong></div></div>'+
    diffHTML(it)+
    '<div class="errExplain">'+
      '<p><b>Vì sao sai:</b> '+esc(it.why||"Đáp án/cách dùng chưa khớp với yêu cầu của task.")+'</p>'+
      (it.rule?'<p><b>Cách tránh lần sau:</b> '+esc(it.rule)+'</p>':'')+
      (it.evidence?'<p><b>Evidence:</b> '+esc(it.evidence)+'</p>':'')+
    '</div>'+
    '<div class="errActions">'+
      '<button type="button" class="btn primary errOpenPack" data-id="'+esc(it.id)+'">'+(it.repairPack?"🎯 Luyện Fix Pack":"✨ Tạo bài luyện")+'</button>'+
       (it.mastered?'<button type="button" class="btn errMaster" data-id="'+esc(it.id)+'">↩ Học lại</button>':'')+
    '</div>'+
    '<div class="errDrill errDrillV3 '+(it.packOpen?"":"hidden")+'" id="drill-'+esc(it.id)+'">'+repairPackHTML(it)+'</div>'+
  '</article>';
}

function render(){
  ensureImport();
  const root=document.getElementById("errorCenter");if(!root)return;
  const list=filtered(),dueCount=state.items.filter(isDue).length;
  root.innerHTML=
    '<section class="errHero errHeroV3"><div><span class="phase">ERROR LAB</span><h2>Sai ở task → luyện đúng điểm yếu → làm lại kiểu thi</h2>'+
      '<p>Error Lab không bắt bạn viết giải thích dài hay tự nghĩ ví dụ nữa. Mỗi lỗi được biến thành <b>Fix Pack: 3 bài luyện có đáp án + 1 retry cuối</b>, rồi ôn lại theo lịch.</p></div>'+
      '<div class="errHeroActions"><div class="errCycle"><b>1</b> Sai <i>→</i><b>2</b> Fix Pack <i>→</i><b>3</b> Retry <i>→</i><b>4</b> Ôn lại</div>'+
      '<button id="errStartDue" class="btn primary" '+(dueCount?"":"disabled")+'>🎯 Luyện lỗi hôm nay'+(dueCount?" · "+dueCount:"")+'</button></div></section>'+
    statHTML()+
    '<section class="errMethodRow errMethodV3">'+
      '<div><b>🎯 Bài 1 · Fix đúng chỗ sai</b><span>Không viết lại cả câu nếu chỉ sai một cụm.</span></div>'+
      '<div><b>🔁 Bài 2 · Đổi ngữ cảnh</b><span>Cùng rule nhưng câu mới để tránh học thuộc.</span></div>'+
      '<div><b>🧪 Bài 3 · IELTS-style</b><span>Dạng luyện sát Reading/Listening/Writing/Speaking.</span></div>'+
      '<div><b>🏁 Final · Retry</b><span>Làm lại mà không nhìn đáp án. Đây mới là bước quyết định.</span></div>'+
    '</section>'+
    '<div class="errToolbar"><div class="errFilters">'+FILTERS.map(f=>'<button data-err-filter="'+f+'" class="'+(state.filter===f?"active":"")+'">'+skillLabel(f)+'</button>').join("")+'</div>'+
      '<span>'+list.length+' lỗi đang hiển thị</span></div>'+
    (list.length?'<div class="errList">'+list.map(cardHTML).join("")+'</div>':
      '<div class="errEmpty"><b>Chưa có lỗi trong mục này.</b><p>Làm task và bấm chấm. Lỗi sai sẽ tự vào đây để tạo Fix Pack.</p></div>');
  bind();
}
window.renderErrorCenter=render;
function renderIfMounted(){if(document.getElementById("errorCenter"))render();}

async function generatePack(it,btn){
  const endpoint=String(window.ERROR_DRILL_AI_ENDPOINT||"").trim();
  if(!endpoint){btn.textContent="AI chưa được cấu hình";return;}
  const old=btn.textContent;btn.disabled=true;btn.textContent="Đang tạo bài luyện…";
  try{
    const ctl=typeof AbortController!=="undefined"?new AbortController():null;
    const timer=ctl?setTimeout(()=>ctl.abort(),30000):null;
    let r;
    try{
      r=await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        signal:ctl?ctl.signal:undefined,
        body:JSON.stringify({
          skill:it.skill,task:it.task,question:it.question,userAnswer:it.userAnswer,
          correctAnswer:it.correctAnswer,why:it.why,rule:it.rule,evidence:it.evidence,errorType:it.errorType
        })
      });
    }finally{if(timer)clearTimeout(timer);}
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.error)throw new Error(d.message||d.error||("HTTP "+r.status));
    if(!validPack(d))throw new Error("Bài luyện tạo ra chưa đủ 3 câu và câu cuối có đáp án hợp lệ. Hãy thử tạo lại.");
    it.repairPack=d;
    it.repairProgress={};
    it.packOpen=true;
    save();render();
    setTimeout(()=>document.querySelector('.errCard[data-id="'+CSS.escape(it.id)+'"]')?.scrollIntoView({behavior:"smooth",block:"start"}),30);
  }catch(e){
    btn.disabled=false;btn.textContent=old;
    const box=btn.closest(".errPackStart");
    if(box){
      let msg=box.querySelector(".errPackError");
      if(!msg){msg=document.createElement("p");msg.className="errPackError";box.appendChild(msg);}
      msg.textContent="Không tạo được Fix Pack: "+String(e&&e.message?e.message:e);
    }
  }
}
function getPackDrill(it,idx){
  if(!it||!it.repairPack)return null;
  if(idx===3)return it.repairPack.final_retry||null;
  return Array.isArray(it.repairPack.drills)?it.repairPack.drills[idx]:null;
}
function markPackStage(card,it,idx,ok,msg){
  const stage=card.querySelector('[data-smart-stage="'+idx+'"]');
  if(stage){stage.classList.toggle("passed",ok);stage.classList.toggle("failed",!ok);}
  const fb=stage?.querySelector(".errStageFeedback");
  if(fb){fb.className="errStageFeedback "+(ok?"good":"bad");fb.textContent=msg;}
  if(ok){
    it.repairProgress=it.repairProgress||{};
    it.repairProgress[idx]=true;
    save();
    const next=card.querySelector('[data-smart-stage="'+(idx+1)+'"]');
    next?.querySelectorAll('button:disabled,input:disabled').forEach(el=>{el.disabled=false;el.removeAttribute('aria-disabled');});
    maybeFinishPack(card,it);
  }
}
function maybeFinishPack(card,it){
  const p=it.repairProgress||{};
  if(![0,1,2,3].every(n=>p[n]))return;
  if(!it._roundCounted){
    it.drillWins=(it.drillWins||0)+1;
    it.reviewLevel=Math.min(5,(it.reviewLevel||0)+1);
    const days=[1,3,7,14,30][Math.max(0,it.reviewLevel-1)]||30;
    const next=new Date();next.setHours(0,0,0,0);next.setDate(next.getDate()+days);
    it.nextReviewAt=next.getTime();
     it.mastered=it.drillWins>=3;
    it._roundCounted=true;
    save();
  }
  const done=card.querySelector(".errPackDone");
  if(done){
    done.classList.remove("hidden");
    done.innerHTML='<b>✓ Fix Pack hoàn tất.</b><span>'+(it.mastered?"Bạn đã vượt lỗi này 3 vòng — chuyển sang Đã nhớ.":"Lần ôn tiếp: "+nextLabel(it.nextReviewAt).toLowerCase()+".")+'</span>';
  }
}
function speak(text){
  text=String(text||"").trim();if(!text)return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";u.rate=.82;speechSynthesis.speak(u);}catch(e){}
}

function bind(){
  document.querySelectorAll("[data-err-filter]").forEach(b=>b.onclick=()=>{state.filter=b.dataset.errFilter;save();render();});
  const startDue=document.getElementById("errStartDue");
  if(startDue)startDue.onclick=()=>{
    const first=state.items.filter(isDue).sort((a,b)=>(b.seenCount||1)-(a.seenCount||1))[0];
    if(!first)return;
     state.filter="due";startDueRound(first);first.packOpen=true;save();render();
    setTimeout(()=>document.querySelector('.errCard[data-id="'+CSS.escape(first.id)+'"]')?.scrollIntoView({behavior:"smooth",block:"start"}),30);
  };

  document.querySelectorAll(".errOpenPack").forEach(b=>b.onclick=()=>{
    const it=byId(b.dataset.id);if(!it)return;
    if(!it.packOpen)startDueRound(it);
    it.packOpen=!it.packOpen;save();render();
    if(it.packOpen)setTimeout(()=>document.querySelector('.errCard[data-id="'+CSS.escape(it.id)+'"]')?.scrollIntoView({behavior:"smooth",block:"nearest"}),30);
  });
  document.querySelectorAll(".errGeneratePack").forEach(b=>b.onclick=()=>{const it=byId(b.dataset.id);if(it)generatePack(it,b);});
  document.querySelectorAll(".errMaster").forEach(b=>b.onclick=()=>{
    const it=byId(b.dataset.id);if(!it)return;
    if(!it.mastered)return;
    it.mastered=false;it.drillWins=0;it.reviewLevel=0;
    it.nextReviewAt=Date.now();it.repairProgress={};it._roundCounted=false;
    save();render();
  });

  document.querySelectorAll(".errSmartChoice").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),it=byId(b.dataset.id),idx=Number(b.dataset.packChoice),d=getPackDrill(it,idx);
    if(!it||!d)return;
    card.querySelectorAll('[data-pack-choice="'+idx+'"]').forEach(x=>x.classList.remove("right","wrong"));
    const ok=answerMatches(b.dataset.value,d.answer);
    b.classList.add(ok?"right":"wrong");
    markPackStage(card,it,idx,ok,ok?"✓ Đúng. "+(d.explanation_vi||""):("Chưa đúng. "+(d.explanation_vi||"Thử đối chiếu lại pattern phía trên.")));
  });
  document.querySelectorAll(".errPackCheck").forEach(b=>b.onclick=()=>{
    const card=b.closest(".errCard"),it=byId(b.dataset.id),idx=Number(b.dataset.packCheck),d=getPackDrill(it,idx);
    if(!it||!d)return;
    const input=card.querySelector('[data-pack-input="'+idx+'"]');
    const val=input?input.value:"";
    const ok=answerMatches(val,d.answer);
    markPackStage(card,it,idx,ok,ok?"✓ Chính xác. "+(d.explanation_vi||""):("Chưa đúng. "+(d.explanation_vi||"Thử lại mà không nhìn đáp án.")));
  });
  document.querySelectorAll(".errPackListen").forEach(b=>b.onclick=()=>{
    const it=byId(b.dataset.id),idx=Number(b.dataset.packListen),d=getPackDrill(it,idx);
    if(d)speak(d.speak_text||d.answer||"");
  });
  document.querySelectorAll(".errPackInput").forEach(inp=>inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();inp.closest(".errSmartDrill")?.querySelector(".errPackCheck")?.click();}
  }));
}

document.addEventListener("click",e=>{
  const nav=e.target.closest('.nav[data-view="errors"]');
  if(nav)setTimeout(render,0);
});
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("view-errors")?.classList.contains("active"))render();});
}else if(document.getElementById("view-errors")?.classList.contains("active"))render();

})();
