(function(){
"use strict";

const APP_KEY="ielts100_online";
const LAB_KEY="gkyyy_vocab_lab_v1";
let lab={days:{}};
try{lab=Object.assign(lab,JSON.parse(localStorage.getItem(LAB_KEY)||"{}")||{});}catch(e){}
if(!lab.days||typeof lab.days!=="object")lab.days={};

function esc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,m=>m==="&"?"&amp;":m==="<"?"&lt;":m===">"?"&gt;":m==="'"?"&#39;":"&quot;");
}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9' -]/g,"").replace(/\s+/g," ").trim();}
function reEsc(s){return String(s||"").replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");}
function loadApp(){
  try{return JSON.parse(localStorage.getItem(APP_KEY)||"{}")||{};}catch(e){return{};}
}
function saveApp(x){try{localStorage.setItem(APP_KEY,JSON.stringify(x));}catch(e){}}
function saveLab(){try{localStorage.setItem(LAB_KEY,JSON.stringify(lab));}catch(e){}}
function dayKey(ts){
  const d=new Date(Number(ts)||Date.now());
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+day;
}
function formatDay(k){
  const p=k.split("-").map(Number),d=new Date(p[0],p[1]-1,p[2]);
  const today=dayKey(Date.now());
  const yesterday=dayKey(Date.now()-86400000);
  const label=k===today?"Hôm nay":k===yesterday?"Hôm qua":d.toLocaleDateString("vi-VN",{weekday:"long"});
  return label+" · "+d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
}
function migrate(){
  const app=loadApp();app.saved=app.saved||{};let changed=false;
  Object.keys(app.saved).forEach((k,idx)=>{
    const x=app.saved[k]||{};
    if(!x.w){x.w=k;changed=true;}
    if(!Number(x.savedAt)){x.savedAt=Date.now()+idx;changed=true;}
    if(!("context" in x)){x.context="";changed=true;}
    app.saved[k]=x;
  });
  if(changed)saveApp(app);
  return app;
}
function wordsByDay(){
  const app=migrate(),groups={};
  Object.values(app.saved||{}).filter(x=>x&&x.w).forEach(x=>{
    const k=dayKey(x.savedAt);
    (groups[k]||(groups[k]=[])).push(x);
  });
  Object.values(groups).forEach(a=>a.sort((x,y)=>(x.savedAt||0)-(y.savedAt||0)));
  return groups;
}
function dayState(k){
  if(!lab.days[k])lab.days[k]={open:k===dayKey(Date.now()),recall:{},speaking:{},writing:false};
  const d=lab.days[k];
  d.recall=d.recall||{};d.speaking=d.speaking||{};return d;
}
function speak(text){
  text=String(text||"").trim();if(!text)return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";u.rate=.82;
    const vs=speechSynthesis.getVoices()||[];
    u.voice=vs.find(v=>v.lang==="en-GB")||vs.find(v=>/^en/i.test(v.lang))||null;
    speechSynthesis.speak(u);
  }catch(e){}
}
function highlightContext(sentence,word){
  const s=String(sentence||"").trim();if(!s)return "";
  const i=s.toLowerCase().indexOf(String(word||"").toLowerCase());
  if(i<0)return esc(s);
  return esc(s.slice(0,i))+"<mark>"+esc(s.slice(i,i+word.length))+"</mark>"+esc(s.slice(i+word.length));
}
function progressOf(k,arr){
  const d=dayState(k),total=Math.max(1,arr.length*2+1);
  let done=0;
  arr.forEach(x=>{if(d.recall[norm(x.w)])done++;if(d.speaking[norm(x.w)])done++;});
  if(d.writing)done++;
  return {done,total,pct:Math.round(done/total*100)};
}
function wordRow(x){
  return '<div class="vocabDayWord">'+
    '<div><b>'+esc(x.w)+'</b><span>'+esc(x.m||"")+'</span></div>'+
    '<button class="vocabSpeakModel" data-word="'+esc(x.w)+'" title="Nghe phát âm">🔊</button>'+
  '</div>';
}
function recallHTML(k,arr){
  const d=dayState(k);
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>01</span><div><b>Meaning → Word</b><small>Nhìn nghĩa tiếng Việt rồi tự gọi lại từ tiếng Anh.</small></div></div>'+
    '<div class="vocabRecallList">'+arr.map((x,i)=>{
      const key=norm(x.w),ok=!!d.recall[key];
      return '<div class="vocabRecallItem '+(ok?"passed":"")+'" data-word="'+esc(x.w)+'">'+
        '<div class="vocabRecallPrompt"><small>'+(i+1)+'</small><strong>'+esc(x.m||"Nghĩa đã lưu")+'</strong></div>'+
        '<div class="vocabRecallAction"><input autocomplete="off" placeholder="Gõ từ tiếng Anh..." '+(ok?'value="'+esc(x.w)+'" readonly':'')+'>'+
          '<button class="btn vocabRecallCheck" data-day="'+k+'" data-word="'+esc(x.w)+'">'+(ok?"✓":"Check")+'</button></div>'+
        '<div class="vocabMiniFeedback">'+(ok?"✓ Đã nhớ đúng từ này.":"")+'</div>'+
      '</div>';
    }).join("")+'</div></section>';
}
function speakingHTML(k,arr){
  const d=dayState(k);
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>02</span><div><b>Speaking Sprint</b><small>Nói một câu tự nhiên có dùng từ — không chỉ đọc riêng từ đó.</small></div></div>'+
    '<div class="vocabUseCaseHint"><b>3 tình huống nên thử:</b><span>👤 câu về bản thân</span><span>🎓 câu IELTS/học thuật</span><span>🔗 câu có because / for example / however</span></div>'+
    '<div class="vocabSpeakGrid">'+arr.map(x=>{
      const key=norm(x.w),ok=!!d.speaking[key];
      return '<article class="vocabSpeakCard '+(ok?"passed":"")+'" data-word="'+esc(x.w)+'">'+
        '<div class="vocabSpeakCardTop"><div><b>'+esc(x.w)+'</b><small>'+esc(x.m||"")+'</small></div><button class="vocabSpeakModel" data-word="'+esc(x.w)+'">🔊 Mẫu</button></div>'+
        (x.context?'<p class="vocabSourceContext">Trong bài: '+highlightContext(x.context,x.w)+'</p>':'')+
        '<p class="vocabSpeakCue">Nói 1 câu mới có <strong>'+esc(x.w)+'</strong>. Cố gắng 6–15 từ.</p>'+
        '<button class="btn primary vocabStartSpeech" data-day="'+k+'" data-word="'+esc(x.w)+'">🎙️ '+(ok?"Nói lại":"Bắt đầu nói")+'</button>'+
        '<div class="vocabSpeechTranscript">'+(ok?"✓ Đã dùng được từ này trong câu nói.":"")+'</div>'+
      '</article>';
    }).join("")+'</div></section>';
}
function writingHTML(k,arr){
  const d=dayState(k),need=Math.min(3,arr.length),targets=arr.slice(0,Math.max(need,1));
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>03</span><div><b>Mini Writing</b><small>Dùng từ trong đoạn ngắn để biến “biết nghĩa” thành “biết dùng”.</small></div></div>'+
    '<div class="vocabWritingTask"><p>Viết <strong>2–4 câu</strong> (ít nhất 20 từ) và dùng ít nhất <strong>'+need+' từ</strong> trong bộ hôm nay.</p>'+
      '<div class="vocabTargetChips">'+targets.map(x=>'<span>'+esc(x.w)+'</span>').join("")+'</div>'+
      '<textarea class="vocabWritingInput" data-day="'+k+'" rows="5" placeholder="Viết một đoạn ngắn về học tập, công nghệ, cuộc sống hằng ngày...">'+esc(d.writingText||"")+'</textarea>'+
      '<div class="vocabWritingBottom"><button class="btn primary vocabCheckWriting" data-day="'+k+'">Check đoạn viết</button><div class="vocabWritingFeedback">'+(d.writing?"✓ Hoàn thành mini writing của ngày này.":"")+'</div></div>'+
    '</div></section>';
}
function renderDay(k,arr){
  const d=dayState(k),p=progressOf(k,arr);
  return '<section class="vocabDayCard '+(d.open?"open":"")+'" data-vocab-day="'+k+'">'+
    '<button class="vocabDayHeader" data-toggle-day="'+k+'">'+
      '<div><span class="vocabDatePill">'+formatDay(k)+'</span><h3>'+arr.length+' từ đã lưu</h3><p>'+arr.slice(0,5).map(x=>esc(x.w)).join(" · ")+(arr.length>5?" · …":"")+'</p></div>'+
      '<div class="vocabDayProgress"><b>'+p.pct+'%</b><span>'+p.done+'/'+p.total+' hoạt động</span><i><em style="width:'+p.pct+'%"></em></i></div>'+
    '</button>'+
    '<div class="vocabDayBody">'+
      '<div class="vocabWordShelf">'+arr.map(wordRow).join("")+'</div>'+
      '<div class="vocabPracticeIntro"><b>Ôn bộ từ của ngày này</b><span>Recall từ → nói thành câu → viết đoạn ngắn. Phần luyện này chạy trên trình duyệt, không gọi OpenAI.</span></div>'+
      recallHTML(k,arr)+speakingHTML(k,arr)+writingHTML(k,arr)+
    '</div>'+
  '</section>';
}
function render(){
  const host=document.getElementById("savedWords");if(!host)return;
  const groups=wordsByDay(),keys=Object.keys(groups).sort().reverse();
  if(!keys.length){
    host.innerHTML='<div class="vocabEmpty"><b>Chưa lưu từ nào.</b><p>Tra từ trong Reading/Listening rồi bấm ⭐ Lưu ôn. Từ mới sẽ tự vào đúng ngày bạn lưu.</p></div>';
    return;
  }
  const total=keys.reduce((n,k)=>n+groups[k].length,0);
  host.innerHTML=
    '<section class="vocabHero"><div><span class="phase">VOCABULARY REVIEW</span><h2>Lưu theo ngày → dùng được trong nói & viết</h2><p>Mỗi ngày là một bộ riêng. Từ bạn lưu hôm nay không trộn với ngày mai; mỗi bộ có recall, speaking và mini writing.</p></div><div class="vocabHeroStat"><b>'+total+'</b><span>từ đã lưu</span><small>'+keys.length+' ngày học</small></div></section>'+
    '<div class="vocabDayList">'+keys.map(k=>renderDay(k,groups[k])).join("")+'</div>';
  bind();
}
function bind(){
  document.querySelectorAll("[data-toggle-day]").forEach(b=>b.onclick=()=>{
    const d=dayState(b.dataset.toggleDay);d.open=!d.open;saveLab();render();
  });
  document.querySelectorAll(".vocabSpeakModel").forEach(b=>b.onclick=e=>{e.stopPropagation();speak(b.dataset.word);});
  document.querySelectorAll(".vocabRecallCheck").forEach(b=>b.onclick=()=>{
    const item=b.closest(".vocabRecallItem"),input=item&&item.querySelector("input"),word=b.dataset.word,k=b.dataset.day;
    const ok=norm(input?.value)===norm(word),fb=item&&item.querySelector(".vocabMiniFeedback");
    item?.classList.toggle("passed",ok);item?.classList.toggle("failed",!ok);
    if(fb)fb.textContent=ok?"✓ Chính xác. Bây giờ hãy dùng từ này trong Speaking Sprint.":"Chưa đúng. Nghe phát âm hoặc nhìn lại nghĩa rồi thử lại.";
    if(ok){dayState(k).recall[norm(word)]=true;saveLab();b.textContent="✓";if(input)input.readOnly=true;updateDayProgress(k);}
  });
  document.querySelectorAll(".vocabRecallItem input").forEach(inp=>inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();inp.closest(".vocabRecallItem")?.querySelector(".vocabRecallCheck")?.click();}
  }));
  document.querySelectorAll(".vocabStartSpeech").forEach(b=>b.onclick=()=>startSpeech(b));
  document.querySelectorAll(".vocabWritingInput").forEach(t=>t.oninput=()=>{const d=dayState(t.dataset.day);d.writingText=t.value;saveLab();});
  document.querySelectorAll(".vocabCheckWriting").forEach(b=>b.onclick=()=>checkWriting(b));
}
function updateDayProgress(k){
  const groups=wordsByDay(),arr=groups[k]||[],p=progressOf(k,arr),card=document.querySelector('[data-vocab-day="'+CSS.escape(k)+'"]');
  if(!card)return;
  const box=card.querySelector(".vocabDayProgress");
  if(box)box.innerHTML='<b>'+p.pct+'%</b><span>'+p.done+'/'+p.total+' hoạt động</span><i><em style="width:'+p.pct+'%"></em></i>';
}
function startSpeech(btn){
  const word=btn.dataset.word,k=btn.dataset.day,card=btn.closest(".vocabSpeakCard"),out=card&&card.querySelector(".vocabSpeechTranscript");
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    if(out)out.textContent="Chrome chưa hỗ trợ nhận giọng ở phiên này. Hãy tự nói một câu thành tiếng rồi thử lại sau.";
    speak(word);return;
  }
  try{
    const r=new SR();r.lang="en-GB";r.interimResults=true;r.continuous=false;
    let final="",latest="";btn.disabled=true;btn.textContent="● Đang nghe…";
    r.onresult=e=>{
      let interim="";
      for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript||"";if(e.results[i].isFinal)final+=(final?" ":"")+t;else interim+=t;}
      latest=(final+(interim?" "+interim:"")).trim();
      if(out)out.textContent=latest?"Nghe được: “"+latest+"”":"Đang nghe…";
    };
    r.onend=()=>{
      btn.disabled=false;btn.textContent="🎙️ Nói lại";
      const used=norm(latest).includes(norm(word)),longEnough=latest.split(/\s+/).filter(Boolean).length>=5;
      const ok=used&&longEnough;
      card?.classList.toggle("passed",ok);card?.classList.toggle("failed",!ok);
      if(out)out.textContent=ok?"✓ Tốt. Bạn đã dùng “"+word+"” trong một câu hoàn chỉnh.":used?"Có từ mục tiêu rồi, nhưng hãy nói một câu dài hơn (ít nhất khoảng 5 từ).":"Chưa nghe thấy “"+word+"”. Hãy nói lại một câu có chính từ đó.";
      if(ok){dayState(k).speaking[norm(word)]=true;saveLab();updateDayProgress(k);}
    };
    r.onerror=()=>{btn.disabled=false;btn.textContent="🎙️ Nói lại";if(out)out.textContent="Không nhận rõ giọng. Hãy nói chậm hơn và thử lại.";};
    r.start();
  }catch(e){btn.disabled=false;if(out)out.textContent="Không mở được nhận giọng. Hãy thử lại sau.";}
}
function checkWriting(btn){
  const k=btn.dataset.day,groups=wordsByDay(),arr=groups[k]||[],box=btn.closest(".vocabWritingTask"),ta=box&&box.querySelector(".vocabWritingInput"),fb=box&&box.querySelector(".vocabWritingFeedback");
  const text=String(ta?.value||"").trim(),tokens=text.split(/\s+/).filter(Boolean),need=Math.min(3,arr.length);
  const used=arr.filter(x=>new RegExp("\\b"+reEsc(x.w)+"\\b","i").test(text));
  const sentences=text.split(/[.!?]+/).map(x=>x.trim()).filter(Boolean).length;
  const ok=tokens.length>=20&&sentences>=2&&used.length>=need;
  box?.classList.toggle("passed",ok);box?.classList.toggle("failed",!ok);
  if(fb)fb.textContent=ok
    ?"✓ Đạt: "+tokens.length+" từ · "+sentences+" câu · đã dùng "+used.length+" từ mục tiêu."
    :"Chưa đạt: hiện có "+tokens.length+"/20 từ · "+sentences+"/2 câu · "+used.length+"/"+need+" từ mục tiêu.";
  const d=dayState(k);d.writingText=text;
  if(ok)d.writing=true;saveLab();if(ok)updateDayProgress(k);
}

window.renderSavedVocabulary=render;
document.addEventListener("click",e=>{
  if(e.target.closest('.nav[data-view="vocab"]'))setTimeout(render,0);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);
else render();

})();