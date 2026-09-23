(function(){
"use strict";

const APP_KEY="ielts100_online";
const LAB_KEY="gkyyy_vocab_lab_v1";
let lab={days:{},cards:{}};
try{lab=Object.assign(lab,JSON.parse(localStorage.getItem(LAB_KEY)||"{}")||{});}catch(e){}
if(!lab.days||typeof lab.days!=="object")lab.days={};
if(!lab.cards||typeof lab.cards!=="object")lab.cards={};

function esc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,m=>m==="&"?"&amp;":m==="<"?"&lt;":m===">"?"&gt;":m==="'"?"&#39;":"&quot;");
}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9' -]/g,"").replace(/\s+/g," ").trim();}
const COMMON_MEANINGS={habit:'thói quen',habits:'thói quen'};
const COMMON_EXAMPLES={habit:'Reading every day is a useful habit.',habits:'Good study habits help me learn English.'};
const COMMON_PHRASES={
  habit:{paraphrases:['routine','regular behaviour'],collocations:['a good habit','develop a habit']},
  habits:{paraphrases:['routines','regular ways of behaving'],collocations:['good habits','study habits']}
};
function offTopic(s){
  s=String(s||'');
  return /bài hát|ca sĩ|đĩa (đơn|mở rộng|đầu tay)|thu âm|phòng thu|stay high|truth serum|queen of the clouds|recorded by|soundtrack|film (released|starring)/i.test(s);
}
function goodMeaning(word,meaning){return offTopic(meaning)||String(meaning||'').length>170?(COMMON_MEANINGS[norm(word)]||''):String(meaning||'').trim();}
window.cleanSavedMeaning=goodMeaning;
window.isOffTopicSavedText=offTopic;
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
function afterDays(days){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+days);return d.getTime();}
function formatDay(k){
  if(k==="legacy")return "Từ đã lưu trước khi bật chia theo ngày";
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
    if(offTopic(x.m)){
      x.previousMeaning=x.m;x.m=goodMeaning(x.w,x.m);
      if(offTopic(x.context))x.context='';
      changed=true;
    }
    if(typeof st!=='undefined'&&st.saved&&st.saved[k]){
      st.saved[k].m=x.m;
      st.saved[k].context=x.context;
    }
    if(!Number(x.savedAt)){x.legacySaved=true;changed=true;}
    if(!("context" in x)){x.context="";changed=true;}
    app.saved[k]=x;
  });
  if(changed)saveApp(app);
  return app;
}
function wordsByDay(){
  const app=migrate(),groups={};
  Object.values(app.saved||{}).filter(x=>x&&x.w).forEach(x=>{
    const context=offTopic(x.context)?'':x.context;
    x={...x,m:(contextChanged(x.w,context)?'':wordCard(x.w).meaningVi)||goodMeaning(x.w,x.m),context};
    if(!x.context&&COMMON_EXAMPLES[norm(x.w)])x.context=COMMON_EXAMPLES[norm(x.w)];
    const k=x.legacySaved&&!Number(x.savedAt)?"legacy":dayKey(x.savedAt);
    (groups[k]||(groups[k]=[])).push(x);
  });
  Object.values(groups).forEach(a=>a.sort((x,y)=>(x.savedAt||0)-(y.savedAt||0)));
  return groups;
}
function dayState(k){
  if(!lab.days[k])lab.days[k]={open:k===dayKey(Date.now()),recall:{},speaking:{},paraphrase:{},collocation:{},family:{},writing:false};
  const d=lab.days[k];
  d.recall=d.recall||{};d.speaking=d.speaking||{};d.paraphrase=d.paraphrase||{};d.collocation=d.collocation||{};d.family=d.family||{};return d;
}
function wordCard(word){
  const key=norm(word),known=COMMON_PHRASES[key]||{paraphrases:[],collocations:[]};
  return lab.cards[key]||(lab.cards[key]={paraphrases:known.paraphrases.slice(),collocations:known.collocations.slice(),rounds:0,reviewAt:0});
}
function phraseNotes(d){
  const result={paraphrases:{},collocations:{}};
  for(const field of ['paraphrases','collocations']){
    for(const x of Array.isArray(d[field])?d[field]:[]){
      if(x&&typeof x==='object'&&x.phrase&&!offTopic(x.phrase))
        result[field][norm(x.phrase)]={meaning:String(x.meaning_vi||'').trim(),example:String(x.example||'').trim()};
    }
  }
  return result;
}
function applySuggestion(word,d){
  if(!word||!d||typeof d!=='object')return false;
  const app=loadApp(),saved=Object.values(app.saved||{}).find(x=>norm(x?.w)===norm(word));
  if(!saved)return false;
  const item=wordCard(word);
  const para=(Array.isArray(d.paraphrases)?d.paraphrases:[]).map(x=>String(x?.phrase||'').trim()).filter(x=>x&&!offTopic(x)).slice(0,5);
  if(!para.length&&d.meaning_en_simple&&!offTopic(d.meaning_en_simple)&&norm(d.meaning_en_simple)!==norm(word))para.push(String(d.meaning_en_simple).trim());
  const coll=(Array.isArray(d.collocations)?d.collocations:[]).map(x=>String(x?.phrase||'').trim()).filter(x=>x&&!offTopic(x)).slice(0,5);
  let changed=false;
  if(para.length&&!item.paraphrases?.length){item.paraphrases=para;changed=true;}
  if(coll.length&&!item.collocations?.length){item.collocations=coll;changed=true;}
  if(d.meaning_vi&&!offTopic(d.meaning_vi)&&!item.meaningVi){item.meaningVi=String(d.meaning_vi).trim();changed=true;}
  if(!item.phraseNotes&&(para.length||coll.length)){item.phraseNotes=phraseNotes(d);changed=true;}
  if(changed){saveLab();if(document.querySelector('.vocabPhraseCard'))render();}
  return changed;
}
window.applyVocabularySuggestion=applySuggestion;
function same(a,b){return norm(a).replace(/[’]/g,"'")===norm(b).replace(/[’]/g,"'");}
function dueCard(card){return !!(card.paraphrases?.length&&card.collocations?.length&&card.rounds<4&&(!card.reviewAt||card.reviewAt<=Date.now()));}
function collocationPrompt(word,phrase){
  const target=String(word).trim(),pieces=String(phrase).trim().split(/\s+/);
  const index=pieces.findIndex(p=>same(p,target));
  if(index>=0&&pieces.length>1){const partner=index>0?index-1:index+1;
    return {cue:pieces.map((p,i)=>i===partner?'_____':p).join(' '),answer:pieces[partner]};}
  return {cue:target+' → _____ (cụm tự nhiên)',answer:phrase};
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
  const d=dayState(k),total=Math.max(1,arr.reduce((n,x)=>n+4+(familyQuestion(x.w).answer?1:0),1));
  let done=0;
  arr.forEach(x=>{const w=norm(x.w);if(d.recall[w])done++;if(d.speaking[w])done++;if(d.paraphrase[w])done++;if(d.collocation[w])done++;if(familyQuestion(x.w).answer&&d.family[w])done++;});
  if(d.writing)done++;
  return {done,total,pct:Math.round(done/total*100)};
}
function wordRow(x,k,selected){
  return '<div class="vocabDayWord '+(selected?'vocabWordSelected':'')+'">'+
    '<button type="button" class="vocabPickWord" data-day="'+esc(k)+'" data-word="'+esc(x.w)+'"><b>'+esc(x.w)+'</b><span>'+esc(x.m||"Chưa có nghĩa rõ — sửa trong thẻ học")+'</span></button>'+ 
    '<button class="vocabSpeakModel" data-word="'+esc(x.w)+'" title="Nghe phát âm">🔊</button>'+
  '</div>';
}
function familyQuestion(word){
  const card=wordCard(word),q=card.familyExercise;
  if(q?.answer&&q?.sentence_with_blank)return {cue:String(q.sentence_with_blank),answer:String(q.answer),hint:String(q.hint_vi||''),why:String(q.explanation_vi||'')};
  const related=(card.wordFamily||[]).find(x=>x.word&&norm(x.word)!==norm(word));
  return related?{cue:'Viết dạng từ phù hợp: '+String(related.part_of_speech||'word form')+' · '+String(related.meaning_vi||'cùng họ với '+word),answer:String(related.word),hint:'Dựa vào từ loại và nghĩa, không chỉ thêm đuôi ngẫu nhiên.',why:''}:{cue:'',answer:''};
}
function contextChanged(word,context){
  const card=wordCard(word);
  return !!(card.aiGeneratedAt&&card.aiContext!==undefined&&card.aiContext!==String(context||''));
}
function studyCardHTML(k,x){
  const card=wordCard(x.w),family=(card.wordFamily||[]).slice(0,6),q=familyQuestion(x.w);
  const stale=contextChanged(x.w,x.context);
  return '<section class="vocabStudyCard">'+
    '<div class="vocabStudyTop"><div><span class="phase">TỪ ĐANG HỌC</span><h3>'+esc(x.w)+'</h3><p>'+esc(stale?x.m:(card.meaningVi||x.m||'Chưa có nghĩa tiếng Việt'))+'</p></div><button type="button" class="btn primary vocabSuggestPhrases" data-word="'+esc(x.w)+'" '+(card.aiGeneratedAt&&!stale?'disabled':'')+'>'+(stale?'✨ Tạo lại cho câu mới':card.aiGeneratedAt?'✓ Bài học AI đã lưu':'✨ Tạo bài học AI cho từ này')+'</button></div>'+
    '<div class="vocabPhraseStatus" aria-live="polite">'+(stale?'Câu đã lưu thay đổi. Gợi ý cũ có thể không đúng ngữ cảnh mới; tạo lại nếu cần.':card.aiGeneratedAt?'Đã lưu bài học; mở lại không tốn thêm lượt AI.':'AI chỉ được gọi khi bạn bấm nút này. Bạn vẫn có thể tự nhập cụm bên dưới.')+'</div>'+
    (x.context?'<div class="vocabStudyContext"><small>CÂU BẠN GẶP TRONG BÀI</small><p>'+highlightContext(x.context,x.w)+'</p>'+(!stale&&card.sentenceTranslation?'<span>→ '+esc(card.sentenceTranslation)+'</span>':'')+(!stale&&card.contextReason?'<p class="vocabStudyWhy"><b>Tại sao dùng nghĩa này?</b> '+esc(card.contextReason)+'</p>':'')+'</div>':'')+
    (!stale&&card.usageExample?'<div class="vocabStudyExample"><small>THỬ NHỚ CÁCH DÙNG</small><p>'+esc(card.usageExample)+'</p></div>':'')+
    (!stale&&card.memoryTip?'<p class="vocabStudyTip"><b>Mẹo nhớ:</b> '+esc(card.memoryTip)+'</p>':'')+
    (family.length?'<div class="vocabStudyFamily"><h4>Word family · đổi từ loại</h4><div class="vocabFamilyRows">'+family.map(f=>'<div><b>'+esc(f.word)+'</b><small>'+esc(f.part_of_speech||'')+'</small><span>'+esc(f.meaning_vi||'')+'</span></div>').join('')+'</div>'+
      (q.answer?'<div class="vocabFamilyQuiz"><label>'+esc(q.cue)+'<input autocomplete="off" placeholder="Gõ dạng từ đúng..."></label><button type="button" class="btn vocabFamilyCheck" data-word="'+esc(x.w)+'" data-day="'+esc(k)+'">Check</button><p class="vocabFamilyFeedback" aria-live="polite"></p></div>':'')+'</div>':'')+
  '</section>';
}
function phraseHTML(k,arr){
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>02</span><div><b>Paraphrase + Collocation</b><small>Viết cách diễn đạt cùng nghĩa và hoàn thành cụm từ tự nhiên.</small></div></div>'+
    '<div class="vocabPhraseList">'+arr.map(x=>{
      const card=wordCard(x.w),stale=contextChanged(x.w,x.context),ready=!!(card.paraphrases?.length&&card.collocations?.length&&!stale);
      const coll=ready?collocationPrompt(x.w,card.collocations[0]):null;
      return '<article class="vocabPhraseCard" data-word="'+esc(x.w)+'">'+
        '<div class="vocabPhraseHead"><div><b>'+esc(x.w)+'</b><small>'+esc(x.m||'Chưa có nghĩa phù hợp — hãy sửa hoặc tạo gợi ý')+'</small></div><span>'+(stale?'Cần cập nhật ngữ cảnh':card.rounds>=4?'✓ Đã qua 4 lượt':dueCard(card)?'Đến lượt ôn':card.reviewAt?'Ôn lại '+new Date(card.reviewAt).toLocaleDateString('vi-VN'):'Chưa có bài')+'</span></div>'+ 
        (ready?'<div class="vocabPhraseQuiz"><label>Paraphrase · diễn đạt cùng nghĩa <input class="vocabParaInput" autocomplete="off" placeholder="Gõ cách nói khác cùng nghĩa"></label><button class="btn vocabParaCheck" data-day="'+k+'" data-word="'+esc(x.w)+'">Check</button><div class="vocabPhraseFeedback" aria-live="polite"></div></div>'+
          '<div class="vocabPhraseQuiz"><label>Collocation · điền từ còn thiếu: <strong>'+esc(coll.cue)+'</strong><input class="vocabCollInput" autocomplete="off" placeholder="Từ/cụm còn thiếu"></label><button class="btn vocabCollCheck" data-day="'+k+'" data-word="'+esc(x.w)+'">Check</button><div class="vocabPhraseFeedback" aria-live="polite"></div></div>':'<p class="muted">'+(stale?'Cụm cũ có thể sai ngữ cảnh mới. Tạo lại bài học hoặc sửa cụm trước khi luyện.':'Tạo gợi ý hoặc thêm cụm của bạn để mở bài luyện.')+'</p>')+
        '<details class="vocabPhraseEdit"><summary>'+(ready?'Xem và sửa nghĩa, các cụm':'Thêm nghĩa, paraphrase & collocation')+'</summary><div class="vocabPhraseFields"><label>Nghĩa tiếng Việt ngắn gọn<input class="vocabMeaningEdit" value="'+esc(x.m||'')+'" placeholder="Ví dụ: thói quen"></label><label>Paraphrase (ngăn cách bằng dấu ;)<input class="vocabParaEdit" value="'+esc((card.paraphrases||[]).join('; '))+'" placeholder="Ví dụ: important; substantial"></label><label>Collocation (ngăn cách bằng dấu ;)<input class="vocabCollEdit" value="'+esc((card.collocations||[]).join('; '))+'" placeholder="Ví dụ: a significant increase"></label></div><div class="vocabPhraseButtons"><button class="btn primary vocabSavePhrases" data-word="'+esc(x.w)+'">Lưu nghĩa & cụm</button></div></details>'+ 
        '</article>';
    }).join('')+'</div></section>';
}
function recallHTML(k,arr){
  const d=dayState(k);
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>01</span><div><b>Meaning → Word</b><small>Nhìn nghĩa tiếng Việt rồi tự gọi lại từ tiếng Anh.</small></div></div>'+
    '<div class="vocabRecallList">'+arr.filter(x=>x.m).map((x,i)=>{
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
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>03</span><div><b>Speaking Sprint</b><small>Nói một câu tự nhiên có dùng từ — không chỉ đọc riêng từ đó.</small></div></div>'+
    '<div class="vocabUseCaseHint"><b>3 tình huống nên thử:</b><span>👤 câu về bản thân</span><span>🎓 câu IELTS/học thuật</span><span>🔗 câu có because / for example / however</span></div>'+
    '<div class="vocabSpeakGrid">'+arr.map(x=>{
      const key=norm(x.w),ok=!!d.speaking[key];
      return '<article class="vocabSpeakCard '+(ok?"passed":"")+'" data-word="'+esc(x.w)+'">'+
        '<div class="vocabSpeakCardTop"><div><b>'+esc(x.w)+'</b><small>'+esc(x.m||"")+'</small></div><button class="vocabSpeakModel" data-word="'+esc(x.w)+'">🔊 Mẫu</button></div>'+
        (x.context?'<p class="vocabSourceContext">Trong bài: '+highlightContext(x.context,x.w)+'</p>':'')+
        '<p class="vocabSpeakCue">'+esc(!contextChanged(x.w,x.context)&&wordCard(x.w).speakingTask||('Nói 1 câu mới có '+x.w+'.'))+(!contextChanged(x.w,x.context)&&wordCard(x.w).collocations?.[0]?' Thử dùng cụm <b>'+esc(wordCard(x.w).collocations[0])+'</b>.':'')+' Cố gắng 6–15 từ.</p>'+
        '<button class="btn primary vocabStartSpeech" data-day="'+k+'" data-word="'+esc(x.w)+'">🎙️ '+(ok?"Nói lại":"Bắt đầu nói")+'</button>'+
        '<div class="vocabSpeechTranscript">'+(ok?"✓ Đã dùng được từ này trong câu nói.":"")+'</div>'+
      '</article>';
    }).join("")+'</div></section>';
}
function writingHTML(k,arr,focus){
  const d=dayState(k),need=Math.min(3,arr.length),targets=arr.slice(0,Math.max(need,1));
  return '<section class="vocabPracticeBlock"><div class="vocabPracticeHead"><span>04</span><div><b>Mini Writing</b><small>Dùng từ trong đoạn ngắn để biến “biết nghĩa” thành “biết dùng”.</small></div></div>'+
    '<div class="vocabWritingTask"><p>'+esc(!contextChanged(focus.w,focus.context)&&wordCard(focus.w).writingTask||'Viết một đoạn ngắn về trải nghiệm học tập hoặc sinh hoạt của bạn.')+' Viết <strong>2–4 câu</strong> (ít nhất 20 từ) và dùng ít nhất <strong>'+need+' từ</strong> trong bộ hôm nay. Thử dùng một collocation đã học.</p>'+
      '<div class="vocabTargetChips">'+targets.map(x=>'<span>'+esc(x.w)+'</span>').join("")+'</div>'+
      '<textarea class="vocabWritingInput" data-day="'+k+'" rows="5" placeholder="Viết một đoạn ngắn về học tập, công nghệ, cuộc sống hằng ngày...">'+esc(d.writingText||"")+'</textarea>'+
      '<div class="vocabWritingBottom"><button class="btn primary vocabCheckWriting" data-day="'+k+'">Check đoạn viết</button><div class="vocabWritingFeedback">'+(d.writing?"✓ Hoàn thành mini writing của ngày này.":"")+'</div></div>'+
    '</div></section>';
}
function renderDay(k,arr){
  const d=dayState(k),p=progressOf(k,arr);
  const focus=arr.find(x=>norm(x.w)===norm(d.focusWord))||arr[0];
  return '<section class="vocabDayCard '+(d.open?"open":"")+'" data-vocab-day="'+k+'">'+
    '<button class="vocabDayHeader" data-toggle-day="'+k+'">'+
      '<div><span class="vocabDatePill">'+formatDay(k)+'</span><h3>'+arr.length+' từ đã lưu</h3><p>'+arr.slice(0,5).map(x=>esc(x.w)).join(" · ")+(arr.length>5?" · …":"")+'</p></div>'+
      '<div class="vocabDayProgress"><b>'+p.pct+'%</b><span>'+p.done+'/'+p.total+' hoạt động</span><i><em style="width:'+p.pct+'%"></em></i></div>'+
    '</button>'+
    '<div class="vocabDayBody">'+
      '<div class="vocabWordShelf">'+arr.map(x=>wordRow(x,k,x===focus)).join("")+'</div>'+
       studyCardHTML(k,focus)+
       '<div class="vocabPracticeIntro"><b>Luyện từ đang chọn: '+esc(focus.w)+'</b><span>Hiểu nghĩa trong câu → paraphrase/collocation → word family → nói. Cuối bộ từ, viết đoạn ngắn áp dụng.</span></div>'+
       recallHTML(k,arr)+phraseHTML(k,[focus])+speakingHTML(k,[focus])+writingHTML(k,arr,focus)+
    '</div>'+
  '</section>';
}
function render(){
  const host=document.getElementById("savedWords");if(!host)return;
  const groups=wordsByDay(),keys=Object.keys(groups).sort((a,b)=>{
    if(a==="legacy")return 1;if(b==="legacy")return -1;return b.localeCompare(a);
  });
  if(!keys.length){
    host.innerHTML='<div class="vocabEmpty"><b>Chưa lưu từ nào.</b><p>Tra từ trong Reading/Listening rồi bấm ⭐ Lưu ôn. Từ mới sẽ tự vào đúng ngày bạn lưu.</p></div>';
    return;
  }
  const total=keys.reduce((n,k)=>n+groups[k].length,0);
  host.innerHTML=
     '<section class="vocabHero"><div><span class="phase">VOCABULARY REVIEW</span><h2>Mỗi lần học kỹ một từ</h2><p>Chọn từ trong ngày, tạo bài học AI khi cần, rồi luyện ngữ cảnh, cụm từ, word family, nói và viết. Nội dung đã tạo được lưu lại.</p></div><div class="vocabHeroStat"><b>'+total+'</b><span>từ đã lưu</span><small>'+keys.length+' ngày học</small></div></section>'+
    '<div class="vocabDayList">'+keys.map(k=>renderDay(k,groups[k])).join("")+'</div>';
  bind();
}
function bind(){
  document.querySelectorAll("[data-toggle-day]").forEach(b=>b.onclick=()=>{
    const d=dayState(b.dataset.toggleDay);d.open=!d.open;saveLab();render();
  });
  document.querySelectorAll('.vocabPickWord').forEach(b=>b.onclick=()=>{
    dayState(b.dataset.day).focusWord=b.dataset.word;saveLab();render();
    document.querySelector('[data-vocab-day="'+CSS.escape(b.dataset.day)+'"] .vocabStudyCard')?.scrollIntoView({block:'nearest'});
  });
  document.querySelectorAll('.vocabFamilyCheck').forEach(b=>b.onclick=()=>checkFamily(b));
  document.querySelectorAll('.vocabFamilyQuiz input').forEach(inp=>inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();inp.closest('.vocabFamilyQuiz')?.querySelector('button')?.click();}
  }));
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
  document.querySelectorAll('.vocabSavePhrases').forEach(b=>b.onclick=()=>{
    const card=b.closest('.vocabPhraseCard'),item=wordCard(b.dataset.word);
    item.meaningVi=card.querySelector('.vocabMeaningEdit').value.trim();
    item.paraphrases=card.querySelector('.vocabParaEdit').value.split(';').map(x=>x.trim()).filter(Boolean).slice(0,5);
    item.collocations=card.querySelector('.vocabCollEdit').value.split(';').map(x=>x.trim()).filter(Boolean).slice(0,5);
    item.manualEdited=true;
    const saved=Object.values(loadApp().saved||{}).find(x=>norm(x.w)===norm(b.dataset.word));
    if(contextChanged(b.dataset.word,saved?.context)){
      item.aiGeneratedAt=0;item.sentenceTranslation='';item.contextReason='';item.usageExample='';
      item.speakingTask='';item.writingTask='';item.memoryTip='';item.familyExercise=null;item.wordFamily=[];
    }
    item.aiContext=String(saved?.context||'');
    item.rounds=0;item.reviewAt=0;item.todayPass={};saveLab();render();
  });
  document.querySelectorAll('.vocabSuggestPhrases').forEach(b=>b.onclick=()=>suggestPhrases(b));
  document.querySelectorAll('.vocabParaCheck,.vocabCollCheck').forEach(b=>b.onclick=()=>checkPhrase(b));
  document.querySelectorAll('.vocabPhraseQuiz input').forEach(inp=>inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();inp.closest('.vocabPhraseQuiz')?.querySelector('button')?.click();}
  }));
  document.querySelectorAll(".vocabStartSpeech").forEach(b=>b.onclick=()=>startSpeech(b));
  document.querySelectorAll(".vocabWritingInput").forEach(t=>t.oninput=()=>{const d=dayState(t.dataset.day);d.writingText=t.value;saveLab();});
  document.querySelectorAll(".vocabCheckWriting").forEach(b=>b.onclick=()=>checkWriting(b));
}
function checkFamily(btn){
  const row=btn.closest('.vocabFamilyQuiz'),q=familyQuestion(btn.dataset.word),value=row.querySelector('input').value.trim();
  const fb=row.querySelector('.vocabFamilyFeedback');
  if(!value){fb.textContent='Gõ dạng từ trước khi kiểm tra.';return;}
  const ok=same(value,q.answer);row.classList.toggle('passed',ok);row.classList.toggle('failed',!ok);
  fb.textContent=ok?'✓ Đúng: '+q.answer+'. '+(q.why||'Để ý từ loại trong câu.'):'Chưa đúng. Đáp án: '+q.answer+'. '+(q.why||q.hint||'Xem bảng word family rồi thử lại.');
  if(ok){dayState(btn.dataset.day).family[norm(btn.dataset.word)]=true;saveLab();updateDayProgress(btn.dataset.day);}
}
async function suggestPhrases(btn){
  const word=btn.dataset.word,card=btn.closest('.vocabStudyCard'),status=card?.querySelector('.vocabPhraseStatus');
  const saved=Object.values(loadApp().saved||{}).find(x=>norm(x.w)===norm(word))||{};
  const item=wordCard(word);
  if(item.aiGeneratedAt&&(item.aiContext===undefined||item.aiContext===String(saved.context||''))){if(status)status.textContent='Bài học này đã được lưu; không gọi AI lại.';return;}
  const endpoint=window.VOCAB_AI_ENDPOINT||window.DICTIONARY_AI_ENDPOINT;
  if(!endpoint){status.textContent='Chưa có dịch vụ gợi ý; bạn vẫn có thể thêm cụm thủ công.';return}
  btn.disabled=true;status.textContent='Đang tạo một bài học cho từ đã lưu…';
  try{
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),30000);
    let r;
    try{r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,
      body:JSON.stringify({mode:'saved-vocab',word,base:word,sentence:saved.context||'',lexical:saved.m||''})});}finally{clearTimeout(timer)}
    const d=await r.json();if(!r.ok||d.error)throw new Error(d.message||'Không tải được gợi ý');
    let para=(Array.isArray(d.paraphrases)?d.paraphrases:[]).map(x=>String(x.phrase||'').trim()).filter(x=>x&&!offTopic(x)).slice(0,5);
    // Earlier backend versions return a short English rewording of the meaning.
    if(!para.length&&d.meaning_en_simple&&!offTopic(d.meaning_en_simple)&&norm(d.meaning_en_simple)!==norm(word))
      para=[String(d.meaning_en_simple).trim()];
    const coll=(Array.isArray(d.collocations)?d.collocations:[]).map(x=>String(x.phrase||'').trim()).filter(x=>x&&!offTopic(x)).slice(0,5);
    const family=(Array.isArray(d.word_family)?d.word_family:[]).filter(x=>x?.word&&!offTopic(x.word)).slice(0,6);
    if(!para.length&&!coll.length&&!family.length&&!d.meaning_vi)throw new Error('AI chưa tạo được nội dung phù hợp. Hãy thử lại sau.');
    if(para.length&&!item.manualEdited)item.paraphrases=para;
    if(coll.length&&!item.manualEdited)item.collocations=coll;
    item.phraseNotes=phraseNotes(d);
    item.wordFamily=family;
    const exercise=d.family_exercise;
    if(exercise?.answer&&exercise?.sentence_with_blank&&family.some(x=>same(x.word,exercise.answer)))item.familyExercise=exercise;
    item.sentenceTranslation=String(d.sentence_translation_vi||'').slice(0,300);
    item.contextReason=String(d.context_reason_vi||'').slice(0,300);
    item.usageExample=String(d.usage_example_en||d.example_sentence||'').slice(0,240);
    item.memoryTip=String(d.memory_tip_vi||'').slice(0,180);
    item.speakingTask=String(d.speaking_task_vi||'').slice(0,220);
    item.writingTask=String(d.writing_task_vi||'').slice(0,220);
    if(d.meaning_vi&&!offTopic(d.meaning_vi))item.meaningVi=String(d.meaning_vi).trim();
    item.aiGeneratedAt=Date.now();
    item.aiContext=String(saved.context||'');
    if(!item.manualEdited){item.rounds=0;item.reviewAt=0;item.todayPass={};}
    saveLab();render();
  }catch(e){status.textContent=e.name==='AbortError'?'Hết thời gian chờ. Thử lại sau.':String(e.message||e)}finally{btn.disabled=false}
}
function checkPhrase(btn){
  const word=btn.dataset.word,k=btn.dataset.day,card=btn.closest('.vocabPhraseCard'),item=wordCard(word);
  const isPara=btn.classList.contains('vocabParaCheck');
  const row=btn.closest('.vocabPhraseQuiz'),value=row.querySelector('input').value;
  const expected=isPara?item.paraphrases:[collocationPrompt(word,item.collocations[0]).answer];
  const ok=!!(value.trim()&&expected.some(x=>same(value,x)));
  const feedback=row.querySelector('.vocabPhraseFeedback'),field=isPara?'paraphrase':'collocation',done=dayState(k);
  row.classList.toggle('passed',ok);row.classList.toggle('failed',!ok);
  const today=dayKey(Date.now());
  const fullPhrase=isPara?expected[0]:item.collocations[0];
  const note=item.phraseNotes?.[isPara?'paraphrases':'collocations']?.[norm(fullPhrase)];
  const explanation=(note?.meaning?' Nghĩa: '+note.meaning+'.':'')+(note?.example?' Ví dụ: '+note.example:'');
  feedback.textContent=ok?(item.todayPass?.[today]?.needsRetest?'✓ Đã sửa được. Ngày mai thử lại từ đầu, không nhìn gợi ý.':'✓ Đúng.'+(explanation?' '+explanation:'')):value.trim()?'Chưa khớp. '+(isPara?'Cách diễn đạt phù hợp: ':'Cụm đúng: ')+fullPhrase+'.'+explanation+' Ngày mai thử lại không nhìn gợi ý.':'Nhập đáp án trước khi kiểm tra.';
  if(!ok){
    if(value.trim()){
      item.todayPass=item.todayPass||{};
      item.todayPass[today]=item.todayPass[today]||{};
      item.todayPass[today].needsRetest=true;saveLab();
    }
    return;
  }
  done[field][norm(word)]=true;
  item.todayPass=item.todayPass||{};
  item.todayPass[today]=item.todayPass[today]||{};item.todayPass[today][field]=true;
  if(item.todayPass[today].paraphrase&&item.todayPass[today].collocation&&dueCard(item)&&!item.todayPass[today].needsRetest){
    item.rounds=Math.min(4,(item.rounds||0)+1);
    item.reviewAt=item.rounds<4?afterDays([1,3,7][item.rounds-1]):0;
  }
  saveLab();updateDayProgress(k);
  const status=card.querySelector('.vocabPhraseHead span');
  if(status&&item.todayPass[today].paraphrase&&item.todayPass[today].collocation)
    status.textContent=item.todayPass[today].needsRetest?'Đã sửa lỗi · mai thử lại không nhìn đáp án':item.rounds>=4?'✓ Đã qua 4 lượt':'✓ Hôm nay · ôn lại '+new Date(item.reviewAt).toLocaleDateString('vi-VN');
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
      if(out)out.textContent=ok?"✓ Đã phát hiện từ “"+word+"” trong câu nói. Bước này chưa chấm ngữ pháp hay cách dùng từ.":used?"Có từ mục tiêu rồi, nhưng hãy nói một câu dài hơn (ít nhất khoảng 5 từ).":"Chưa nghe thấy “"+word+"”. Hãy nói lại một câu có chính từ đó.";
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
    ?"✓ Đã hoàn thành bài viết: "+tokens.length+" từ · "+sentences+" câu · có "+used.length+" từ mục tiêu. Chưa chấm ngữ pháp hoặc cách dùng từ."
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
