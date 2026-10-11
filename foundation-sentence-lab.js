/* Interactive syntax lab: understand why each word is in its position. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),d=window.GKSentenceData;
if(!root||!d||!Array.isArray(d.units))return;
const KEY="gk_foundation_sentence_v1";
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const state={records:saved.records||{}},units=d.units,byId=Object.fromEntries(units.map(x=>[x.id,x]));
const map={
"a0-01":"sentence","a0-02":"nouns","a0-03":"tobe","a0-04":"determiners","a0-05":"verbs","a0-06":"helpers",
"a1-01":"time","a1-02":"adverbs","a1-03":"verbs","a1-04":"helpers","a1-05":"preps","a1-06":"determiners",
"a2-01":"verbs","a2-02":"adjectives","a2-03":"time","a2-04":"connect","a2-05":"adverbs","a2-06":"sentence",
"bridge-01":"transfer","bridge-02":"sentence","bridge-03":"connect","bridge-04":"connect","bridge-05":"connect","bridge-06":"transfer"
};
let ui={id:null,tab:"inspect",example:0,chosen:null,order:[],bank:[],checked:false,orderGood:false,quiz:[],answers:{},graded:false,score:null,msg:"",hintVisible:false};
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function shuffle(a){let b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){ui.msg="Không thể lưu bài học trên trình duyệt này.";}}
function stamp(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function later(day,n){let p=day.split("-").map(Number),d=new Date(p[0],p[1]-1,p[2]+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function rec(id){return state.records[id]||{attempts:[],builds:[]};}
function days(id){const r=rec(id);return [...new Set((r.attempts||[]).filter(x=>x.score===3&&(r.builds||[]).includes(x.day)).map(x=>x.day))].sort();}
function stage(id){const n=days(id).length;return n>=2?"mastered":n===1?"review":"new";}
function due(id){const daysPassed=days(id);return daysPassed.length===1&&later(daysPassed[0],1)<=stamp();}
function status(id){const s=stage(id);return s==="mastered"?'<span class="fs-state mastered">✓ Đã củng cố</span>':s==="review"?'<span class="fs-state reviewing">↻ Đã hiểu lượt đầu</span>':'<span class="fs-state">Chưa luyện</span>';}
function helper(action,label,cls){return '<button type="button" class="fs-btn '+(cls||"")+'" data-s-action="'+esc(action)+'">'+label+'</button>';}
function reset(id){
const u=byId[id];ui.id=id;ui.tab="inspect";ui.example=0;ui.chosen=null;ui.order=[];ui.bank=shuffle(u.build.tokens.map((word,i)=>({word,index:i})));ui.checked=false;ui.orderGood=false;ui.quiz=shuffle(u.questions.map(q=>({...q,options:shuffle(q.options)})));ui.answers={};ui.graded=false;ui.score=null;ui.msg="";ui.hintVisible=false;
}
function select(id){if(id&&byId[id])reset(id);else ui.id=null;}
function render(rootEl){if(rootEl)rootEl.innerHTML=ui.id?unitPage():homePage();}
function sentenceExample(ex,id,index,mini){
let h='<div class="fs-sentence"><div class="fs-chips" aria-label="Các từ trong câu">';
ex.parts.forEach((p,i)=>{const role=d.roles[p.role]||["Khác",""];h+='<button type="button" class="fs-chip fs-'+esc(p.role)+'" data-s-token="'+i+'" data-s-ex="'+index+'" data-s-unit="'+esc(id)+'" title="'+esc(role[0])+'" aria-label="'+esc(p.text)+": "+esc(role[0])+'">'+esc(p.text)+'</button>';});
const punctuation=String(ex.sentence||"").trim().slice(-1);
if(/[.!?]/.test(punctuation))h+='<span class="fs-punctuation" aria-hidden="true">'+esc(punctuation)+'</span>';
h+='</div><p class="fs-translation">'+esc(ex.vi)+'</p><p class="fs-takeaway">'+esc(ex.meaning)+'</p></div>';
return h;
}
function tokenDetails(ex,i){
if(i==null||!ex.parts[i])return '<div class="fs-detail-empty"><strong>Chạm vào một từ ở trên</strong><span>Để thấy loại từ, nhiệm vụ của nó trong câu, và vì sao ở vị trí đó.</span></div>';
const p=ex.parts[i],role=d.roles[p.role]||["Từ",""];
return '<div class="fs-detail"><div class="fs-detail-top"><b>'+esc(p.text)+'</b><span class="fs-role fs-'+esc(p.role)+'">'+esc(role[0])+'</span></div><p><strong>Chức năng chung:</strong> '+esc(role[1])+'</p><p><strong>Trong câu này:</strong> '+esc(p.why)+'</p></div>';
}
function homePage(){
const p=units.filter(u=>stage(u.id)!=="new").length,m=units.filter(u=>stage(u.id)==="mastered").length;
let h='<div class="fs-wrap"><button class="fs-back" type="button" data-f-action="home">← English Foundation</button>'+
'<div class="fs-hero"><span class="fs-eyebrow">SENTENCE THINKING LAB · TƯ DUY NGỮ PHÁP</span><h2>Hiểu vì sao câu tiếng Anh hoạt động</h2><p>Không chỉ học “S + V”. Học cách một từ làm nhiệm vụ gì, liên hệ với từ nào, đứng ở đâu và điều gì thay đổi nếu chuyển vị trí.</p><div class="fs-hero-foot"><span>'+p+'/12 chủ đề đã luyện</span><span>'+m+' đã củng cố qua hai ngày</span></div></div>'+
'<div class="fs-first"><strong>Quy tắc tư duy quan trọng nhất</strong><p><b>Word class</b> = từ thuộc loại gì (noun/adjective/verb...). <b>Sentence function</b> = nó đang làm gì trong câu (chủ ngữ/tân ngữ/bổ ngữ...). Đây là hai thứ khác nhau.</p>'+
'<p>Ví dụ: Trong <b>She reads books</b>, <b>She</b> là đại từ làm chủ ngữ; <b>books</b> là danh từ làm tân ngữ.</p></div>'+
'<div class="fr-inline-preview"><div><span>BẢN ĐỒ 4 LOẠI TỪ</span><strong>Quan hệ Noun – Verb – Adjective – Adverb</strong><p>Nhận ra một từ đang bổ nghĩa cho từ nào; so sánh câu, tự sắp xếp và giải thích.</p></div><button type="button" class="fr-btn primary" data-f-action="relations">Mở bản đồ quan hệ →</button></div>'+ 
'<div class="fs-legend">'+Object.keys(d.roles).filter(k=>["det","pron","noun","adj","adv","verb","link","aux","prep","conj"].includes(k)).map(k=>'<span class="fs-legend-tag fs-'+k+'">'+esc(d.roles[k][0])+'</span>').join("")+'</div>'+
'<div class="fs-section-head"><h3>12 bài giải mã câu</h3><p>Nên học theo thứ tự, nhưng có thể mở bất kỳ bài nào để tra cứu.</p></div><div class="fs-grid">';
units.forEach((u,i)=>{h+='<button type="button" class="fs-unit-card" data-s-open="'+esc(u.id)+'"><span class="fs-unit-count">'+String(i+1).padStart(2,"0")+'</span><strong>'+esc(u.title)+'</strong><small>'+esc(u.short)+'</small><span class="fs-unit-footer">'+status(u.id)+(due(u.id)?'<span class="fs-due">Cần ôn</span>':'')+'<b>→</b></span></button>';});
h+='</div><div class="fs-bottom-note"><strong>Mục tiêu là giải thích được, không phải nhận mặt công thức.</strong><p>Một chủ đề chỉ được đánh dấu “đã củng cố” sau khi người học sắp xếp đúng câu và trả lời đúng toàn bộ 3 câu hỏi trong ít nhất hai ngày khác nhau.</p></div></div>';
return h;
}
function unitPage(){
const u=byId[ui.id],ex=u.examples[ui.example];
let h='<div class="fs-wrap"><button type="button" class="fs-back" data-s-action="hub">← 12 chủ đề tư duy câu</button>'+
'<div class="fs-topic-header"><span>BÀI '+(units.indexOf(u)+1)+' / '+units.length+' · TƯ DUY CHỨ KHÔNG CHỈ CÔNG THỨC</span><h2>'+esc(u.title)+'</h2><p>'+esc(u.goal)+'</p>'+status(u.id)+'</div>'+
'<div class="fs-tabs"><button type="button" data-s-tab="inspect" class="'+(ui.tab==="inspect"?"active":"")+'" aria-pressed="'+(ui.tab==="inspect")+'">1. Hiểu & phân tích</button><button type="button" data-s-tab="build" class="'+(ui.tab==="build"?"active":"")+'" aria-pressed="'+(ui.tab==="build")+'">2. Xây câu</button><button type="button" data-s-tab="reason" class="'+(ui.tab==="reason"?"active":"")+'" aria-pressed="'+(ui.tab==="reason")+'">3. Giải thích vì sao</button></div>'+
'<div class="fs-topic-content">';
if(ui.tab==="inspect"){
h+='<div class="fs-idea"><span>Ý NGHĨA CỐT LÕI</span><p>'+esc(u.idea)+'</p></div>'+
'<h3>Học cách suy luận</h3><div class="fs-thinking">';
u.steps.forEach((s,i)=>h+='<div class="fs-thinking-row"><span>'+(i+1)+'</span><p>'+esc(s)+'</p></div>');
h+='</div><div class="fs-trap"><strong>⚠️ Hiểu nhầm thường gặp</strong><p>'+esc(u.trap)+'</p></div>'+
'<h3>Thử giải mã câu</h3><p class="fs-muted">Chọn ví dụ, rồi chạm vào từng từ. Cùng một loại từ có thể đảm nhiệm vai trò khác nhau ở mỗi câu.</p><div class="fs-example-tabs">';
u.examples.forEach((v,i)=>h+='<button type="button" data-s-example="'+i+'" class="'+(i===ui.example?"chosen":"")+'" aria-pressed="'+(i===ui.example)+'">Ví dụ '+(i+1)+'</button>');
h+='</div>'+sentenceExample(ex,u.id,ui.example,false)+
'<div id="sentenceTokenDetails" aria-live="polite">'+tokenDetails(ex,ui.chosen)+'</div>'+
'<div class="fs-next">'+helper("build","Tự xây câu →","primary")+'</div>';
}
if(ui.tab==="build"){
h+='<h3>Ghép câu theo ý nghĩa</h3><p class="fs-muted">Bấm các từ theo thứ tự tự nhiên của tiếng Anh. Bấm từ trong dòng đã chọn để đưa trở lại. Không bắt buộc học thuộc câu mẫu trước.</p>'+
'<div class="fs-task"><strong>Cần dựng câu:</strong><p>'+esc(u.build.hint)+'</p></div>'+
'<div class="fs-built" aria-label="Câu đang được xây">';
if(!ui.order.length)h+='<span class="fs-placeholder">Câu của bạn sẽ xuất hiện ở đây...</span>';
ui.order.forEach((n,i)=>h+='<button type="button" data-s-remove="'+i+'" class="fs-word selected" title="Bấm để bỏ từ khỏi câu">'+esc(u.build.tokens[n])+' <span>×</span></button>');
h+='</div><div class="fs-word-bank" aria-label="Các từ để sắp xếp">';
ui.bank.forEach(o=>{if(!ui.order.includes(o.index))h+='<button type="button" data-s-add="'+o.index+'" class="fs-word">'+esc(o.word)+'</button>';});
h+='</div><div class="fs-controls">'+helper("clear","Làm lại","secondary")+
'<button type="button" class="fs-btn primary" data-s-action="checkOrder" '+(ui.order.length!==u.build.tokens.length?"disabled":"")+'>Kiểm tra cấu trúc →</button></div>';
if(ui.checked)h+='<div class="fs-feedback '+(ui.orderGood?"success":"error")+'" role="status"><strong>'+(ui.orderGood?"✓ Đúng cấu trúc!":"Chưa đúng — tìm quan hệ giữa các từ")+'</strong><p>'+esc(ui.orderGood?u.build.reason:u.build.hint)+'</p>'+(ui.orderGood?'<small>Hãy đọc câu thành tiếng và giải thích vì sao tính từ/trạng từ/to be đứng ở vị trí đó.</small>':'')+'</div>';
h+='<div class="fs-next">'+helper("reason","Tiếp tục kiểm tra tư duy →","primary")+'</div>';
}
if(ui.tab==="reason"){
h+='<h3>Giải thích thay vì nhớ công thức</h3><p class="fs-muted">Ba câu hỏi tập trung vào lý do dùng từ và vị trí của nó; chỉ đạt khi đúng cả 3.</p>';
ui.quiz.forEach((q,i)=>{
h+='<fieldset class="fs-question"><legend><span>Câu '+(i+1)+'</span> '+esc(q.question)+'</legend><div class="fs-options">';
q.options.forEach((o,j)=>{const checked=ui.answers[i]===o;h+='<button type="button" data-s-answer="'+i+'" data-s-opt="'+j+'" aria-pressed="'+checked+'" '+(ui.graded?"disabled":"")+' class="fs-option '+(checked?"selected ":"")+(ui.graded?(o===q.correct?"correct":checked?"incorrect":""):"")+'">'+esc(o)+'</button>';});
h+='</div>'+(ui.graded?'<p class="fs-explanation">'+(ui.answers[i]===q.correct?"✓ Đúng. ":"✗ Đáp án đúng: "+esc(q.correct)+". ")+esc(q.reason)+'</p>':'')+'</fieldset>';
});
if(ui.graded){
h+='<div class="fs-feedback '+(ui.score===3?"success":"error")+'"><strong>'+ui.score+'/3 câu đúng</strong><p>'+esc(ui.score===3?"Tốt. Hãy bảo đảm đã ghép đúng câu ở bước 2. Ôn lại vào ngày khác để kiểm chứng việc nhớ lâu.":"Xem giải thích của câu sai, thử phân tích ví dụ rồi trả lời lại.")+'</p></div>'+
'<div class="fs-controls">'+helper("retryQuiz","Làm lại câu hỏi","secondary")+helper(ui.score===3?"build":"inspect",ui.score===3?"Kiểm tra phần xây câu →":"Xem lại phân tích →","primary")+'</div>';
}else h+='<div class="fs-controls"><span class="fs-muted">Đã chọn '+Object.keys(ui.answers).length+'/3</span>'+
'<button type="button" data-s-action="grade" class="fs-btn primary" '+(Object.keys(ui.answers).length!==3?"disabled":"")+'>Chấm & giải thích</button></div>';
}
h+='</div><div class="fs-topic-bottom">'+helper("next","Chủ đề tiếp theo →","secondary")+'<p>'+esc(days(u.id).length===0?"Tiến độ sẽ ghi nhận khi bạn hoàn thành cả hai bài tập: ghép câu đúng và 3/3 câu hỏi trong cùng một ngày.":days(u.id).length===1?"Đã đạt một ngày. Quay lại vào ngày khác và làm lại để củng cố.":"Đã củng cố ở ít nhất hai ngày khác nhau.")+'</p></div></div>';
return h;
}
function lessonContent(lesson){
const id=map[lesson.id]||"sentence",u=byId[id];
return '<div class="fs-inlesson">'+
'<div class="fs-idea"><span>GIẢI MÃ CẤU TRÚC CÂU</span><h3>'+esc(u.title)+'</h3><p>'+esc(u.idea)+'</p></div>'+
'<p class="fs-muted">Chạm vào một từ để hiểu vai trò của nó. Phần này gắn trực tiếp với bài đang học.</p>'+
u.examples.map((e,i)=>'<div class="fs-mini-example"><h4>Ví dụ '+(i+1)+' — '+(i===0?"Xác định vai trò":"So sánh cách dùng")+'</h4>'+sentenceExample(e,id,i,true)+'</div>').join("")+'<div id="sentenceTokenDetails" aria-live="polite">'+tokenDetails(u.examples[0],null)+'</div>'+
'<div class="fs-trap"><strong>Hiểu nhầm cần tránh</strong><p>'+esc(u.trap)+'</p></div>'+
'<div class="fs-next"><button class="fs-btn primary" type="button" data-f-action="syntaxTopic" data-f-syntax-id="'+esc(id)+'">Luyện suy luận & tự xây câu →</button></div></div>';
}
function afterProgress(){
const n=days(ui.id).length;
ui.msg=n===2?"Đã củng cố ở 2 ngày khác nhau.":n===1?"Đã đạt lượt đầu; hãy ôn lại vào ngày khác.":"Tiếp tục làm đúng cả ghép câu và 3/3 câu hỏi.";
}
function renderFresh(){render(root);}
root.addEventListener("click",function(event){
const btn=event.target.closest("button");if(!btn||!root.contains(btn))return;
if(btn.dataset.sOpen){reset(btn.dataset.sOpen);renderFresh();root.scrollIntoView({block:"start",behavior:"smooth"});return;}
if(btn.dataset.sTab){ui.tab=btn.dataset.sTab;renderFresh();return;}
if(btn.dataset.sExample!==undefined){ui.example=Number(btn.dataset.sExample);ui.chosen=null;renderFresh();return;}
if(btn.dataset.sToken!==undefined){
const id=btn.dataset.sUnit,unit=byId[id],ex=unit&&unit.examples[Number(btn.dataset.sEx)],n=Number(btn.dataset.sToken);
const detail=root.querySelector("#sentenceTokenDetails");
if(detail&&ex)detail.innerHTML=tokenDetails(ex,n);
return;
}
if(btn.dataset.sAdd!==undefined){const i=Number(btn.dataset.sAdd);if(!ui.order.includes(i)){ui.order.push(i);ui.checked=false;renderFresh();}return;}
if(btn.dataset.sRemove!==undefined){ui.order.splice(Number(btn.dataset.sRemove),1);ui.checked=false;renderFresh();return;}
if(btn.dataset.sAnswer!==undefined&&!ui.graded){const q=ui.quiz[Number(btn.dataset.sAnswer)],o=q.options[Number(btn.dataset.sOpt)];ui.answers[Number(btn.dataset.sAnswer)]=o;renderFresh();return;}
const a=btn.dataset.sAction;if(!a)return;
if(a==="hub"){ui.id=null;renderFresh();}
else if(a==="inspect"||a==="build"||a==="reason"){ui.tab=a;renderFresh();}
else if(a==="next"){const i=units.findIndex(u=>u.id===ui.id);reset(units[(i+1)%units.length].id);renderFresh();}
else if(a==="clear"){ui.order=[];ui.checked=false;ui.orderGood=false;renderFresh();}
else if(a==="checkOrder"){
const u=byId[ui.id];ui.checked=true;ui.orderGood=ui.order.length===u.build.tokens.length&&ui.order.every((v,i)=>v===i);
if(ui.orderGood){if(!state.records[ui.id])state.records[ui.id]={attempts:[],builds:[]};const r=state.records[ui.id];if(!r.builds.includes(stamp()))r.builds.push(stamp());save();afterProgress();}
renderFresh();
}
else if(a==="grade"){
if(Object.keys(ui.answers).length!==ui.quiz.length)return;
ui.score=ui.quiz.reduce((n,q,i)=>n+(ui.answers[i]===q.correct?1:0),0);ui.graded=true;
if(!state.records[ui.id])state.records[ui.id]={attempts:[],builds:[]};
state.records[ui.id].attempts.push({day:stamp(),score:ui.score});
state.records[ui.id].attempts=state.records[ui.id].attempts.slice(-60);
save();afterProgress();renderFresh();
}
else if(a==="retryQuiz"){ui.quiz=shuffle(byId[ui.id].questions.map(q=>({...q,options:shuffle(q.options)})));ui.answers={};ui.graded=false;ui.score=null;renderFresh();}
});
window.GKSentenceLab={select,render,lessonContent,map,units};
})();