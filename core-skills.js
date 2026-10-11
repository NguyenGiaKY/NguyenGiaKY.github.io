/* Core Skills Lab — practice before the 81 IELTS tasks, independent question-count progress. */
(function(){
"use strict";
const root=document.getElementById("coreSkillsRoot"),pack=window.GKCoreSkillsData;
if(!root||!pack)return;
const KEY="gk_core_skills_v1",index=Object.fromEntries(pack.units.map(x=>[x.id,x]));
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const state={units:saved.units||{}};
const ui={area:"all",id:null,tab:"learn",showSample:false,feedback:false};
const escape=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const get=id=>state.units[id]||(state.units[id]={answers:{},draft:"",history:[],reflection:false});
const nowDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function answered(id){const r=get(id);return Object.keys(r.answers||{}).filter(k=>r.answers[k]!==null&&r.answers[k]!==undefined&&r.answers[k]!=="").length}
function total(id){return index[id].questions.length}
function percent(n,d){return d>0?Math.max(0,Math.min(100,n/d*100)):0}
function pct(n,d){const x=percent(n,d);return x===0?"0%":x<1?x.toFixed(2)+"%":Number.isInteger(x)?x+"%":x.toFixed(1)+"%"}
function completed(id){const r=get(id),days=[...new Set((r.history||[]).filter(x=>x.correct===total(id)&&x.answered===total(id)).map(x=>x.day))];return days.length>=2&&r.reflection}
function snapshot(){const tasks=pack.units.map(u=>{const r=get(u.id),n=answered(u.id),history=(r.history||[]),recent=history[history.length-1],fullDays=[...new Set(history.filter(x=>x.answered===total(u.id)&&x.correct===total(u.id)).map(x=>x.day))];return{id:u.id,area:u.area,answered:n,total:total(u.id),coverage:percent(n,total(u.id)),correct:recent?.correct??null,accuracy:recent&&recent.answered?percent(recent.correct,recent.answered):null,practiceDays:fullDays.length,reflection:!!r.reflection,mastered:completed(u.id)};});
return{total:tasks.length,answered:tasks.reduce((n,x)=>n+x.answered,0),questions:tasks.reduce((n,x)=>n+x.total,0),mastered:tasks.filter(x=>x.mastered).length,started:tasks.filter(x=>x.answered>0||get(x.id).draft.trim()).length,tasks};}
function btn(action,label,cls){return '<button type="button" class="cs-btn '+(cls||"")+'" data-cs-action="'+escape(action)+'">'+label+'</button>';}
function status(id){const t=snapshot().tasks.find(t=>t.id===id);return t.mastered?'<span class="cs-status mastered">✓ Ôn đạt nhiều ngày</span>':t.answered===t.total?'<span class="cs-status learning">Đã trả lời '+t.answered+'/'+t.total+'</span>':t.answered?'<span class="cs-status learning">'+t.answered+'/'+t.total+' câu</span>':'<span class="cs-status">Chưa học</span>';}
function render(){root.innerHTML=ui.id?lesson():home();}
function home(){
const s=snapshot(),list=pack.units.filter(u=>ui.area==="all"||u.area===ui.area),pr=pct(s.answered,s.questions);
let h='<div class="cs-layout"><div class="cs-hero"><div><span class="cs-kicker">STAGE 2 • PRE-IELTS</span><h2>Core Skills Lab</h2>'+
'<p>Học cách nghe hiểu, đọc tìm bằng chứng, xây câu, phát triển ý và phản xạ nói trước khi luyện 81 IELTS Tasks. Không học mẹo trả lời khi chưa hiểu vì sao.</p>'+
'<div class="cs-hero-actions">'+btn("continue","Học bài tiếp theo →","primary")+btn("journey","Xem lộ trình 3 giai đoạn","outline")+'</div></div>'+
'<div class="cs-hero-progress"><strong>'+pr+'</strong><span>Tiến độ câu hỏi</span><div class="cs-track"><i style="width:'+percent(s.answered,s.questions)+'%"></i></div><small>'+s.answered+'/'+s.questions+' câu đã trả lời · '+s.mastered+'/'+s.total+' bài ôn đạt</small></div></div>'+
'<div class="cs-method"><b>Cách học 5 bước</b><p>Hiểu chiến thuật → quan sát ví dụ và bẫy → trả lời câu hỏi → tự vận dụng → ôn lại. Thanh tiến độ là số câu đã trả lời, KHÔNG phải band hay điểm chính xác.</p></div>'+
'<div class="cs-group-head"><h3>5 nhóm kỹ năng</h3><p>30 bài thiết kế để học trước 81 Tasks, nhưng người học có thể mở bất kỳ bài nào.</p></div>'+
'<div class="cs-group-grid"><button class="cs-group '+(ui.area==="all"?"active":"")+'" data-cs-area="all" aria-pressed="'+(ui.area==="all")+'"><strong>Tất cả</strong><span>'+s.total+' bài</span></button>';
pack.areas.forEach(a=>{const tasks=s.tasks.filter(x=>x.area===a.id),n=tasks.reduce((x,t)=>x+t.answered,0),d=tasks.reduce((x,t)=>x+t.total,0);h+='<button class="cs-group '+(ui.area===a.id?"active":"")+'" data-cs-area="'+a.id+'" aria-pressed="'+(ui.area===a.id)+'"><strong>'+escape(a.icon+" "+a.label)+'</strong><span>'+n+'/'+d+' câu · '+pct(n,d)+'</span></button>';});h+='</div>';
h+='<div class="cs-group-head"><h3>Bài học</h3><p>Tiến độ được tính theo số câu thực tế đã trả lời, không theo số lần bấm hoặc thời gian mở trang.</p></div><div class="cs-lessons">';
list.forEach((u,i)=>{const n=answered(u.id),t=total(u.id);h+='<button type="button" class="cs-lesson" data-cs-open="'+u.id+'"><span class="cs-number">'+escape(u.id)+'</span><span class="cs-lesson-main"><small>'+escape(pack.areas.find(a=>a.id===u.area)?.label||u.area)+'</small><strong>'+escape(u.title)+'</strong><em>'+escape(u.principle)+'</em></span><span class="cs-lesson-end">'+status(u.id)+'<span>'+pct(n,t)+'</span><span class="cs-tiny-track"><i style="width:'+percent(n,t)+'%"></i></span></span></button>';});
h+='</div><div class="cs-bridge"><div><h3>Chuyển sang Stage 3</h3><p>Các IELTS tasks vẫn mở, nhưng nên học vững kỹ năng tương ứng. Nếu gặp lỗi, quay lại Core Skills để luyện đúng điểm yếu thay vì làm lại toàn bộ đề.</p></div>'+btn("ielts","81 IELTS Tasks →","outline")+'</div></div>';
return h;
}
function lesson(){
const u=index[ui.id],r=get(u.id),n=answered(u.id),t=total(u.id);
let h='<div class="cs-layout"><button class="cs-back" type="button" data-cs-action="home">← Core Skills Lab</button>'+
'<div class="cs-lesson-header"><span>STAGE 2 · '+escape(pack.areas.find(a=>a.id===u.area)?.label||u.area)+' · '+escape(u.id)+'</span><h2>'+escape(u.title)+'</h2><p>'+escape(u.principle)+'</p><div class="cs-inline-progress"><span>'+n+'/'+t+' câu · '+pct(n,t)+' tiến độ</span><div class="cs-track"><i style="width:'+percent(n,t)+'%"></i></div>'+status(u.id)+'</div></div>'+
'<div class="cs-tabs"><button data-cs-tab="learn" aria-pressed="'+(ui.tab==="learn")+'" class="'+(ui.tab==="learn"?"on":"")+'">1. Hiểu & xem ví dụ</button><button data-cs-tab="practice" aria-pressed="'+(ui.tab==="practice")+'" class="'+(ui.tab==="practice"?"on":"")+'">2. Kiểm tra ('+n+'/'+t+')</button><button data-cs-tab="transfer" aria-pressed="'+(ui.tab==="transfer")+'" class="'+(ui.tab==="transfer"?"on":"")+'">3. Vận dụng</button></div><div class="cs-panel">';
if(ui.tab==="learn"){
h+='<div class="cs-step-head"><span>01</span><div><h3>Bản chất kỹ năng</h3><p>Hiểu vì sao một phương pháp hiệu quả và khi nào nên dùng.</p></div></div>'+
'<div class="cs-concept">'+escape(u.text)+'</div><div class="cs-step-head"><span>02</span><div><h3>Nhìn cách dùng trong ngữ cảnh</h3><p>Câu ví dụ gắn với kỹ năng, không chỉ là công thức.</p></div></div>'+
'<div class="cs-example"><strong>'+escape(u.example)+'</strong><button type="button" data-cs-action="speak" aria-label="Nghe ví dụ bằng giọng tổng hợp trên thiết bị">🔊 Nghe mẫu</button></div>'+
'<div class="cs-note"><strong>Điểm dễ hiểu nhầm</strong><p>'+escape(u.misconception)+'</p></div><div class="cs-actions">'+btn("practice","Làm bài kiểm tra →","primary")+'</div>';
}
if(ui.tab==="practice"){
h+='<div class="cs-step-head"><span>03</span><div><h3>Chọn bằng lý do, không đoán keyword</h3><p>Từng câu được ghi tiến độ riêng. Chọn 1/2 câu thì thanh chỉ tăng 50%, không phải tự động hoàn thành bài.</p></div></div>';
u.questions.forEach((q,i)=>{
const selected=r.answers[i],correct=selected===q.correct;
h+='<fieldset class="cs-question"><legend>Câu '+(i+1)+': '+escape(q.prompt)+'</legend><div class="cs-options">';
q.options.forEach((o,j)=>{h+='<button type="button" data-cs-q="'+i+'" data-cs-o="'+j+'" aria-pressed="'+(selected===o)+'" class="cs-option '+(selected===o?"selected ":"")+(ui.feedback&&selected!==undefined?(o===q.correct?"correct":selected===o?"wrong":""):"")+'">'+escape(o)+'</button>';});h+='</div>';
if(ui.feedback&&selected!==undefined)h+='<p class="cs-explain">'+(correct?"✓ Đúng. ":"✗ Đáp án phù hợp: "+escape(q.correct)+". ")+escape(q.why)+'</p>';
h+='</fieldset>';
});
h+='<div class="cs-actions"><span class="cs-subdued">Đã trả lời '+n+'/'+t+' · '+pct(n,t)+'</span>'+btn("feedback",ui.feedback?"Ẩn giải thích":"Chấm & giải thích","outline")+btn("transfer","Vận dụng →","primary")+'</div>';
}
if(ui.tab==="transfer"){
h+='<div class="cs-step-head"><span>04</span><div><h3>Tự chuyển kỹ năng sang tình huống mới</h3><p>Không chỉ chọn A/B/C; tự viết/nói giải thích và đối chiếu với bài mẫu.</p></div></div>'+
'<div class="cs-assignment"><strong>Yêu cầu</strong><p>'+escape(u.transfer)+'</p></div><label for="csDraft" class="cs-draft-label">Bài làm của mày</label>'+
'<textarea id="csDraft" rows="5" placeholder="Viết câu trả lời hoặc ghi chú luyện nói...">'+escape(r.draft||"")+'</textarea><small class="cs-subdued">Tự lưu trên trình duyệt. Website chưa tự chấm độ chính xác của bài nói/viết.</small>'+
'<div class="cs-actions">'+btn("sample",ui.showSample?"Ẩn ví dụ mẫu":"So sánh với mẫu","outline")+'</div>';
if(ui.showSample){h+='<div class="cs-sample"><strong>Ví dụ tham khảo</strong><p>'+escape(u.sample)+'</p><small>Không cần giống hệt; phải biết giải thích vì sao cách dùng đó phù hợp.</small></div>'+
'<label class="cs-check"><input id="csReflection" type="checkbox" '+(r.reflection?"checked":"")+'/> Tao đã tự làm, đối chiếu và sửa lỗi mà mình nhận ra.</label>';}
const attempts=(r.history||[]).filter(x=>x.answered===t&&x.correct===t);
h+='<div class="cs-skill-links"><strong>Áp dụng sang IELTS tasks</strong><div class="cs-related-buttons">'+u.related.map(id=>'<button type="button" data-cs-ielts="'+escape(id)+'">'+escape(id)+' ↗</button>').join("")+'</div><small>Chỉ mở task tương ứng; không tự đánh dấu đã học.</small></div>'+
'<p class="cs-subdued">Đạt 2/'+t+' ở ít nhất hai ngày khác nhau cùng phần tự kiểm tra sẽ được ghi nhận là đã luyện qua hai ngày (không phải band IELTS).</p>'+
'<div class="cs-actions">'+btn("home","Danh sách bài →","outline")+btn("next","Bài tiếp theo →","primary")+'</div>';
}
h+='</div></div>';return h;
}
function open(id){if(!index[id])return;ui.id=id;ui.tab="learn";ui.showSample=false;ui.feedback=false;render();root.scrollIntoView({behavior:"smooth",block:"start"});}
function answer(id,i,o){const u=index[id];if(!u||!u.questions[i]||!u.questions[i].options.includes(o))return;const r=get(id);r.answers[i]=o;persist();render();}
root.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b||!root.contains(b))return;
if(b.dataset.csArea){ui.area=b.dataset.csArea;render();return;}
if(b.dataset.csOpen){open(b.dataset.csOpen);return;}
if(b.dataset.csTab){ui.tab=b.dataset.csTab;render();return;}
if(b.dataset.csIelts){if(window.GKOpenIELTSTask)window.GKOpenIELTSTask(b.dataset.csIelts);return;}
if(b.dataset.csQ!==undefined){const q=index[ui.id].questions[Number(b.dataset.csQ)],o=q.options[Number(b.dataset.csO)];answer(ui.id,Number(b.dataset.csQ),o);return;}
const a=b.dataset.csAction;
if(a==="continue"){const n=pack.units.find(u=>!completed(u.id))||pack.units[0];open(n.id);}
else if(a==="home"){ui.id=null;ui.area="all";render();}
else if(a==="practice"||a==="transfer"){ui.tab=a;render();}
else if(a==="feedback"){
const r=get(ui.id),u=index[ui.id],n=answered(ui.id);
if(!ui.feedback){
const correct=u.questions.reduce((acc,q,i)=>acc+(r.answers[i]===q.correct?1:0),0);
r.history.push({day:nowDay(),answered:n,correct,total:u.questions.length,at:Date.now()});r.history=r.history.slice(-50);persist();
}
ui.feedback=!ui.feedback;render();
}
else if(a==="sample"){ui.showSample=!ui.showSample;render();}
else if(a==="next"){const i=pack.units.findIndex(u=>u.id===ui.id);open(pack.units[(i+1)%pack.units.length].id);}
else if(a==="journey"){document.querySelector('.nav[data-view="journey"]')?.click();}
else if(a==="ielts"){document.querySelector('.nav[data-view="today"]')?.click();}
else if(a==="speak"){
if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined")return;
try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(index[ui.id].example);u.lang="en-NZ";u.rate=.9;speechSynthesis.speak(u);}catch(e){}
}
});
root.addEventListener("input",e=>{if(e.target.id==="csDraft"&&ui.id){get(ui.id).draft=e.target.value;persist();}});
root.addEventListener("change",e=>{if(e.target.id==="csReflection"&&ui.id){get(ui.id).reflection=e.target.checked;persist();}});
window.GKCoreSkills={snapshot,render,open,getUnit:id=>index[id],getState:id=>get(id),forTask:(id,skill)=>pack.units.find(u=>u.related.includes(id)&&u.area===skill)||pack.units.find(u=>u.related.includes(id))||null};
render();
})();