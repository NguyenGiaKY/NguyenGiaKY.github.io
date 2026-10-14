/* IELTS Question Types Hub — Stage 3 connector, not a fourth course.
   Short examples are diagnostic only, never IELTS marks or mastery claims. */
(function(){
"use strict";
const root=document.getElementById("questionTypesRoot"),pack=window.GKQuestionTypesData;
if(!root||!pack||!Array.isArray(pack.types))return;
const KEY="gk_question_types_v1",byId=Object.fromEntries(pack.types.map(x=>[x.id,x]));
let previous={};try{previous=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const state={records:previous.records||{}};
const ui={skill:"all",group:"all",query:"",id:null,choice:null,graded:false,tag:"",note:"",model:false,coreFilter:null,taskFilter:null};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const per=id=>state.records[id]||(state.records[id]={attempts:[],draft:"",checks:{},errors:[],reflected:false});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){notice("Không lưu được dữ liệu ở chế độ trình duyệt hiện tại.");}};
const formatPct=(a,b)=>b>0?(a===0?"0%":(a/b*100<1?(a/b*100).toFixed(2):(a/b*100).toFixed(1)).replace(/\.0$/,"")+"%"):"—";
const errorsBySkill={listening:[["sound","Sound / connected speech"],["paraphrase","Paraphrase"],["distractor","Distractor / correction"],["attention","Attention / sequence"],["spelling","Spelling / word limit"]],reading:[["evidence","Missed evidence"],["paraphrase","Paraphrase"],["logic","Logic / NG"],["vocabulary","Vocabulary"],["time","Time management"]],writing:[["task","Task response / coverage"],["ideas","Idea development"],["structure","Organisation / cohesion"],["grammar","Grammar / word forms"],["vocabulary","Vocabulary / collocations"]],speaking:[["focus","Answer relevance"],["fluency","Fluency"],["pronunciation","Pronunciation"],["grammar","Grammar / tense"],["ideas","Extending ideas"]]};
const groupLabels={listening:"Listening",reading:"Reading",writing:"Writing",speaking:"Speaking"};
function notice(t){const el=root.querySelector("#qtNotice");if(el){el.hidden=false;el.textContent=t;}}
function button(action,label,cls){return '<button class="qt-btn '+(cls||"")+'" type="button" data-qt-action="'+action+'">'+label+'</button>';}
function stateTag(t){const r=per(t.id),a=r.attempts.length;if(t.practice.kind==="production")return r.draft.trim().length?'<span class="qt-state working">Đã viết thử · chưa chấm</span>':'<span class="qt-state">Chưa thử</span>';return a?'<span class="qt-state working">Đã thử '+a+' lần</span>':'<span class="qt-state">Chưa thử</span>';}
function coreProgress(t){
 const data=window.GKCoreSkills?.snapshot?.();
 return t.core.map(id=>{
  const unit=window.GKCoreSkills?.getUnit?.(id);
  const record=data?.tasks?.find(x=>x.id===id);
  const label=unit?.title||id;
  return '<button type="button" class="qt-skill-link" data-qt-core="'+esc(id)+'"><span>'+esc(label)+'</span><small>'+esc(id)+' · '+(record?record.answered+"/"+record.total+" câu đã trả lời"+(record.mastered?" · đã ôn đạt":""):"Chưa có dữ liệu")+'</small><b>↗</b></button>';
 }).join("");
}
function menuNav(v){const button=document.querySelector('.nav[data-view="'+v+'"]');if(button)button.click();}
function returnToHome(){ui.id=null;ui.choice=null;ui.graded=false;ui.model=false;ui.tag="";ui.note="";render();}
function open(id){if(!byId[id])return;ui.id=id;ui.choice=null;ui.graded=false;ui.model=false;ui.tag="";ui.note="";render();try{root.scrollIntoView({block:"start",behavior:"smooth"});}catch(e){}}
function hub(){
 const list=pack.types.filter(x=>ui.skill==="all"||x.skill===ui.skill).filter(x=>ui.group==="all"||x.group===ui.group).filter(x=>!ui.coreFilter||x.core.includes(ui.coreFilter)).filter(x=>!ui.taskFilter||x.tasks.includes(ui.taskFilter));
 const counts=pack.groups.map(g=>({skill:g.id,count:pack.types.filter(t=>t.skill===g.id).length}));
 let html='<div class="qt-wrap"><div class="qt-hero"><span>STAGE 3 · QUESTION TYPES → CORE SKILLS → IELTS TASKS</span><h2>IELTS Question Types Hub</h2>'+
 '<p>Đây là <strong>bản đồ cách làm từng dạng bài</strong>, không phải Stage 4. Chọn dạng → xem Core Skills cần dùng → hiểu chiến thuật → luyện thử → ghi lỗi → mở đúng IELTS Task.</p></div>'+
 '<div class="qt-insight"><strong>Tiến độ không được tính ảo</strong><p>Một câu ví dụ chỉ cho biết kết quả của <b>một câu ví dụ</b>, không đại diện năng lực cả dạng. Chỉ số kỹ năng lấy trực tiếp từ Core Skills; điểm IELTS chỉ lấy từ task/test được chấm. Không tăng thanh IELTS Tasks khi đọc hướng dẫn ở đây.</p></div>'+
 '<div id="qtNotice" role="status" hidden></div><div class="qt-filters" role="group" aria-label="Lọc kỹ năng"><button type="button" data-qt-skill="all" aria-pressed="'+(ui.skill==="all")+'" class="'+(ui.skill==="all"?"selected":"")+'">Tất cả <small>'+pack.types.length+'</small></button>';
 for(const g of pack.groups){html+='<button type="button" data-qt-skill="'+g.id+'" aria-pressed="'+(ui.skill===g.id)+'" class="'+(ui.skill===g.id?"selected":"")+'">'+g.title+' <small>'+g.count+'</small></button>';}
 html+='</div><div class="qt-search"><label for="qtSearch">Tìm dạng bài</label><input id="qtSearch" type="search" placeholder="Ví dụ: TFNG, map, essay, matching..." value="'+esc(ui.query)+'" aria-label="Tìm dạng bài IELTS"></div>';
 if(ui.coreFilter||ui.taskFilter)html+='<div class="qt-active-filter"><strong>Đang lọc theo '+(ui.coreFilter?'Core Skill '+esc(ui.coreFilter):'IELTS Task '+esc(ui.taskFilter))+'</strong>'+button("clearLinks","Xóa bộ lọc liên kết","outline")+'</div>';
 if(ui.skill==="writing"){html+='<div class="qt-subfilters"><button data-qt-group="all" aria-pressed="'+(ui.group==="all")+'" class="'+(ui.group==="all"?"on":"")+'">Tất cả Writing</button>';for(const g of ["Academic Task 1","General Training Task 1","Task 2 Essay"])html+='<button data-qt-group="'+esc(g)+'" aria-pressed="'+(ui.group===g)+'" class="'+(ui.group===g?"on":"")+'">'+esc(g)+'</button>';html+='</div>';}
 if(ui.skill==="speaking"){html+='<div class="qt-themes"><strong>Nhóm câu hỏi Speaking để áp dụng trong Part 1–3</strong><div>'+pack.speakingThemes.map(s=>'<span>'+esc(s)+'</span>').join("")+'</div><p>Đây là nhóm chủ đề/câu hỏi thường luyện, không phải 12 phần thi riêng.</p></div>';}
 html+='<div class="qt-list-head"><div><h3>Chọn một dạng bài</h3><p>Mỗi dạng kết nối tới bài Stage 2 và task Stage 3 liên quan.</p></div><span id="qtCount">'+list.length+' dạng</span></div><div class="qt-type-list">';
 for(const t of list){
 const query=(t.title+" "+t.aim+" "+t.group).toLocaleLowerCase();
 const hidden=ui.query&&!query.includes(ui.query.toLocaleLowerCase());
 html+='<button type="button" data-qt-open="'+esc(t.id)+'" class="qt-type" data-qt-searchtext="'+esc(query)+'"'+(hidden?' hidden':'')+'><span class="qt-type-label"><small>'+esc(t.group)+'</small><strong>'+esc(t.title)+'</strong><em>'+esc(t.aim)+'</em></span><span class="qt-type-aux">'+stateTag(t)+'<small>'+t.core.length+' Core Skills · '+t.tasks.length+' IELTS Tasks gần nhất</small><b>→</b></span></button>';
 }
 html+='</div><div class="qt-footer-note">Đối với IELTS Academic, Writing Task 1 gồm biểu đồ, sơ đồ và bản đồ. General Training Task 1 là thư, được giữ chỉ để tham khảo ngoài lộ trình Academic. Writing Task 2 và Speaking được chia theo nhiệm vụ đề thi. Số nhóm ở đây là cách tổ chức học tập, không phải số dạng chính thức bắt buộc.</div></div>';
 return html;
}
function detail(){
 const t=byId[ui.id],r=per(t.id),p=t.practice;
 let html='<div class="qt-wrap qt-detail"><button type="button" data-qt-action="back" class="qt-back">← Question Types Hub</button>'+
 '<div class="qt-heading"><span>'+esc(t.skill.toUpperCase())+' · '+esc(t.group)+'</span><h2>'+esc(t.title)+'</h2><p>'+esc(t.aim)+'</p>'+stateTag(t)+'</div>'+
 '<div id="qtNotice" role="status" hidden></div><div class="qt-columns"><div class="qt-primary"><section class="qt-panel"><div class="qt-step"><span>1</span><div><h3>Hiểu cách xử lý dạng bài</h3><p>Học chiến thuật từ mục tiêu của câu hỏi thay vì nhớ một công thức cứng.</p></div></div><ol class="qt-strategy">'+t.steps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><div class="qt-trap"><strong>Lỗi thường gặp</strong><p>'+esc(t.trap)+'</p></div></section>'+
 '<section class="qt-panel"><div class="qt-step"><span>2</span><div><h3>Thử một ví dụ ngắn</h3><p>Đây là bài tập minh họa thao tác, không phải một phần thi IELTS hoàn chỉnh.</p></div></div>';
 if(p.kind==="choice")html+=choicePractice(t,r);
 else html+=productionPractice(t,r);
 html+='</section><section class="qt-panel"><div class="qt-step"><span>3</span><div><h3>Error Analysis → Skill Repair</h3><p>Ghi nguyên nhân sai, rồi quay về kỹ năng nền cần cải thiện.</p></div></div>'+errorPanel(t,r)+'</section></div>'+
 '<aside class="qt-sidebar"><section class="qt-side-card"><h3>Required Core Skills</h3><p>Nhấn vào một kỹ năng để học hoặc ôn trong Stage 2. Số câu ghi từ kết quả thực tế ở Core Skills.</p><div class="qt-skills">'+coreProgress(t)+'</div></section>'+
 '<section class="qt-side-card"><h3>Áp dụng vào IELTS Academic Tasks</h3><p>Đây là các tasks <b>gần nhất về kỹ năng</b> trong chương trình hiện tại; không khẳng định mọi dạng đều đã có bài riêng.</p><div class="qt-task-links">'+t.tasks.map(id=>'<button type="button" data-qt-task="'+esc(id)+'">'+esc(id)+' <span>Open Task ↗</span></button>').join("")+'</div></section>'+
 '<section class="qt-side-card"><h3>Ghi nhận thực tế</h3><div class="qt-stat-line"><span>Lượt thử ví dụ</span><strong>'+r.attempts.length+'</strong></div>'+
 (p.kind==="choice"&&r.attempts.length?'<div class="qt-stat-line"><span>Đúng / lượt thử đã chấm</span><strong>'+r.attempts.filter(x=>x.correct).length+'/'+r.attempts.length+'</strong></div>':'')+
 '<div class="qt-stat-line"><span>Lỗi đã ghi</span><strong>'+r.errors.length+'</strong></div><small>Một câu ví dụ đúng không chứng minh đã thành thạo dạng IELTS này.</small></section></aside></div></div>';
 return html;
}
function choicePractice(t,r){
 const p=t.practice;
 let html='<div class="qt-mini-label">'+(t.skill==="listening"?'Listening mini-demo · giọng đọc tổng hợp, không phải audio IELTS thật':'Reading mini-demo · đoạn văn minh họa')+'</div>';
 if(t.skill==="listening"){html+='<div class="qt-audio"><div><strong>🔊 Nghe đoạn ngắn</strong><small>Nghe 1–2 lần rồi trả lời; transcript mở sau khi chấm.</small></div><button type="button" data-qt-action="listen" class="qt-btn primary">▶ Phát audio</button></div>';}
 else html+='<div class="qt-passage">'+esc(p.stimulus)+'</div>';
 html+='<fieldset class="qt-question"><legend>'+esc(p.question)+'</legend><div class="qt-choices">';
 for(const a of p.options){
 const chosen=ui.choice===a;
 const graded=ui.graded;
 html+='<button type="button" data-qt-choice="'+esc(a)+'" '+(graded?"disabled":"")+' aria-pressed="'+chosen+'" class="'+(chosen?"selected ":"")+(graded?(a===p.correct?"right":chosen?"wrong":""):"")+'">'+esc(a)+'</button>';
 }
 html+='</div></fieldset>';
 if(ui.graded)html+='<div class="qt-feedback '+(ui.choice===p.correct?"right":"wrong")+'"><strong>'+(ui.choice===p.correct?"✓ Đúng câu ví dụ":"✗ Cần ôn cách xử lý")+'</strong><p>'+esc(p.why)+'</p>'+(t.skill==="listening"?'<div class="qt-transcript"><b>Transcript:</b> '+esc(p.stimulus)+'</div>':'')+'</div>';
 html+='<div class="qt-actions">'+(ui.graded?button("reset","Thử lại ví dụ","outline"):('<button class="qt-btn primary" type="button" data-qt-action="grade" '+(ui.choice===null?"disabled":"")+'>Chấm & xem bằng chứng</button>'))+'</div>';
 return html;
}
function productionPractice(t,r){
 const p=t.practice;
 let html='<div class="qt-passage"><strong>Yêu cầu luyện tập</strong><p>'+esc(p.prompt)+'</p></div><p class="qt-info">'+(t.skill==="speaking"?'Hãy nói thành tiếng trước; có thể viết ghi chú phản tư bên dưới. Website chưa đánh giá chất lượng phát âm.':'Đây là bài luyện phân tích đề, lập dàn ý và diễn đạt; không có biểu đồ dữ liệu hoàn chỉnh nên không thể chấm Task 1 như đề thật.')+'</p>'+
 '<label for="qtDraft" class="qt-draft-label">Bài nháp / kế hoạch / tự đánh giá</label><textarea id="qtDraft" rows="6" placeholder="Viết ý chính, giải thích, hoặc lỗi cần sửa...">'+esc(r.draft)+'</textarea>'+
 '<p class="qt-info">Lưu tự động trên trình duyệt. Việc nhập bài không tự cho điểm hoặc tăng tiến độ IELTS Tasks.</p>'+
 '<div class="qt-checklist"><strong>Checklist tự kiểm tra (không phải chấm band)</strong>'+p.checks.map((x,i)=>'<label><input type="checkbox" data-qt-check="'+i+'" '+(r.checks[i]?"checked":"")+' /> '+esc(x)+'</label>').join("")+'</div>'+
 '<div class="qt-actions">'+button("model",ui.model?"Ẩn gợi ý":"Xem hướng phát triển mẫu","outline")+'</div>';
 if(ui.model)html+='<div class="qt-feedback"><strong>Gợi ý định hướng</strong><p>'+esc(p.model)+'</p></div>';
 return html;
}
function errorPanel(t,r){
 const options=errorsBySkill[t.skill];
 let h='<div class="qt-error-options" role="group" aria-label="Nhãn lỗi thường gặp">';
 options.forEach(([id,label])=>h+='<button type="button" data-qt-tag="'+id+'" aria-pressed="'+(ui.tag===id)+'" class="'+(ui.tag===id?"active":"")+'">'+esc(label)+'</button>');
 h+='</div><label for="qtNote" class="qt-draft-label">Giải thích vì sao sai / cần sửa</label><textarea id="qtNote" rows="3" placeholder="Ví dụ: tao chọn False vì suy luận, nhưng bài không đủ chứng cứ...">'+esc(ui.note)+'</textarea><div class="qt-actions">'+button("saveError","Lưu lỗi & xem kỹ năng cần ôn","outline")+'</div>';
 if(r.errors.length){h+='<div class="qt-history"><strong>Lỗi đã lưu</strong>';r.errors.slice(-4).reverse().forEach(e=>{const meta=options.find(x=>x[0]===e.tag);h+='<p><b>'+esc(meta?.[1]||e.tag)+'</b> · '+esc(e.note||"Chưa ghi giải thích")+'</p>';});h+='</div>';}
 return h;
}
function render(){root.innerHTML=ui.id?detail():hub();}
function openForTask(id){const related=pack.types.filter(x=>x.tasks.includes(id));if(!related.length)return false;ui.skill="all";ui.group="all";ui.coreFilter=null;ui.taskFilter=id;ui.query="";ui.id=null;menuNav("question-types");render();return true;}
function openForCore(id){const related=pack.types.filter(x=>x.core.includes(id));if(!related.length)return false;ui.skill="all";ui.group="all";ui.taskFilter=null;ui.coreFilter=id;ui.query="";ui.id=null;menuNav("question-types");render();return true;}
root.addEventListener("click",function(e){
 const b=e.target.closest("button");if(!b||!root.contains(b))return;
 if(b.dataset.qtSkill){ui.skill=b.dataset.qtSkill;ui.group="all";ui.coreFilter=null;ui.taskFilter=null;ui.query="";returnToHome();return;}
 if(b.dataset.qtGroup){ui.group=b.dataset.qtGroup;ui.query="";returnToHome();return;}
 if(b.dataset.qtOpen){open(b.dataset.qtOpen);return;}
 if(b.dataset.qtCore){menuNav("core");window.GKCoreSkills?.open?.(b.dataset.qtCore);return;}
 if(b.dataset.qtTask){if(typeof window.GKOpenIELTSTask==="function")window.GKOpenIELTSTask(b.dataset.qtTask);return;}
 if(b.dataset.qtChoice!==undefined){if(!ui.graded){ui.choice=b.dataset.qtChoice;render();}return;}
 if(b.dataset.qtTag){ui.tag=b.dataset.qtTag;render();return;}
 const a=b.dataset.qtAction;if(!a)return;
 if(a==="back"){returnToHome();return;}
 if(a==="clearLinks"){ui.coreFilter=null;ui.taskFilter=null;ui.query="";returnToHome();return;}
 if(a==="grade"){const t=byId[ui.id];if(ui.choice===null)return;ui.graded=true;per(t.id).attempts.push({at:Date.now(),selected:ui.choice,correct:ui.choice===t.practice.correct});per(t.id).attempts=per(t.id).attempts.slice(-60);save();render();return;}
 if(a==="reset"){ui.choice=null;ui.graded=false;render();return;}
 if(a==="listen"){const t=byId[ui.id];if(!t||t.skill!=="listening")return;
  const synth=window.speechSynthesis;if(!synth||typeof window.SpeechSynthesisUtterance!=="function"){notice("Trình duyệt không hỗ trợ đọc tự động. Hãy dùng transcript sau khi chấm.");return;}
  try{synth.cancel();const talk=new window.SpeechSynthesisUtterance(t.practice.stimulus);talk.lang="en-NZ";talk.rate=.85;const v=window.GKYVoice?.pick?.("auto","Lecturer","en-NZ");if(v){talk.voice=v;talk.lang=v.lang;}synth.speak(talk);}catch(e){notice("Không thể phát giọng đọc trên thiết bị này.");}return;}
 if(a==="model"){ui.model=!ui.model;render();return;}
 if(a==="saveError"){const note=root.querySelector("#qtNote")?.value?.trim()||"";if(!ui.tag){notice("Hãy chọn một nhãn lỗi trước khi lưu.");return;}if(!note){notice("Viết ngắn nguyên nhân lỗi trước khi lưu.");return;}per(ui.id).errors.push({tag:ui.tag,note,at:Date.now()});save();ui.tag="";ui.note="";render();return;}
});
root.addEventListener("input",function(e){
 if(e.target.id==="qtNote"){ui.note=e.target.value;return;}
 if(e.target.id==="qtSearch"){ui.query=e.target.value;const term=ui.query.toLocaleLowerCase();let n=0;root.querySelectorAll(".qt-type").forEach(el=>{el.hidden=!el.dataset.qtSearchtext.includes(term);if(!el.hidden)n++;});const count=root.querySelector("#qtCount");if(count)count.textContent=n+" dạng";return;}
 if(e.target.id==="qtDraft"&&ui.id){per(ui.id).draft=e.target.value;save();}
});
root.addEventListener("change",function(e){
 if(e.target.dataset.qtCheck!==undefined&&ui.id){per(ui.id).checks[e.target.dataset.qtCheck]=!!e.target.checked;save();}
});
document.querySelector('.nav[data-view="question-types"]')?.addEventListener("click",render);
window.GKQuestionTypes={render,open,openForTask,openForCore,getTypes:()=>pack.types,getRecord:id=>per(id)};
render();
})();