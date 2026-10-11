/* Four-way word-class relationship lab. No AI API; browser-local learning data. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),data=window.GKRelationsData;
if(!root||!data||!data.cases||!data.roles)return;
const key="gk_foundation_relations_v1",stored=(()=>{try{return JSON.parse(localStorage.getItem(key)||"{}")||{}}catch(e){return{}}})();
const state={records:stored.records||{},drafts:stored.drafts||{}};
const cases=data.cases,byId=Object.fromEntries(cases.map(x=>[x.id,x])),roles=Object.fromEntries(data.roles.map(x=>[x.id,x]));
const names={noun:"Danh từ",verb:"Động từ",adj:"Tính từ",adv:"Trạng từ",det:"Từ hạn định",pron:"Đại từ",link:"Động từ nối",aux:"Trợ động từ"};
const filterMap={noun:["subject","object","adj-before","transform"],verb:["subject","object","adv-manner","adv-frequency","be-aux","transform"],adj:["adj-before","linking","adv-adj","transform"],adv:["adv-manner","adv-frequency","adv-adj","adv-adv","transform"]};
const ui={id:null,filter:"all",tab:"learn",example:0,selected:null,buildOrder:[],buildBank:[],buildChecked:false,buildCorrect:false,questionOptions:[],answer:null,graded:false,showModel:false,reflectionConfirmed:false};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function shuffle(a){const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function store(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}}
function date(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function plus(s,n){const p=s.split("-").map(Number),d=new Date(p[0],p[1]-1,p[2]+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function record(id){return state.records[id]||{checks:[]};}
function checkDates(id){return [...new Set(record(id).checks||[])].sort();}
function status(id){const n=checkDates(id).length;return n>=2?"reviewed":n===1?"once":"new";}
function due(id){const p=checkDates(id);return p.length===1&&plus(p[0],1)<=date();}
function badge(id){const s=status(id);return '<span class="fr-badge '+s+'">'+(s==="reviewed"?"✓ Đã ôn 2 ngày":s==="once"?"↻ Cần ôn lại":"Chưa học")+'</span>';}
function button(action,label,cls){return '<button type="button" class="fr-btn '+(cls||"")+'" data-r-action="'+esc(action)+'">'+label+'</button>';}
function sectionHeader(n,t,p){return '<div class="fr-step-heading"><span>'+n+'</span><div><h3>'+t+'</h3><p>'+p+'</p></div></div>';}
function open(id){if(!byId[id])return;const x=byId[id];ui.id=id;ui.tab="learn";ui.example=0;ui.selected=null;ui.buildOrder=[];ui.buildChecked=false;ui.buildCorrect=false;ui.buildBank=shuffle(x.build.map((word,i)=>({word,i})));ui.questionOptions=shuffle(x.check.options.map((t,i)=>({t,i})));ui.answer=null;ui.graded=false;ui.showModel=false;ui.reflectionConfirmed=false;render(root);}
function label(kind){return names[kind]||"Thành phần khác";}
function chips(exam,idx){
let h='<div class="fr-sentence-chips" aria-label="Nhấn vào từ để xem chức năng của nó">';
exam.parts.forEach((p,i)=>{
const active=ui.selected===i&&ui.example===idx,linked=i===exam.source||i===exam.target;
h+='<button type="button" data-r-token="'+i+'" class="fr-word fr-'+esc(p.kind)+(linked?" fr-linked":"")+(active?" fr-active":"")+'" title="'+esc(label(p.kind))+'" aria-label="'+esc(p.t)+', '+esc(label(p.kind))+'">'+esc(p.t)+'</button>';
});
const punct=exam.sentence.trim().slice(-1);if(/[.!?]/.test(punct))h+='<span class="fr-punctuation">'+esc(punct)+'</span>';
return h+'</div>';
}
function explainWord(exam,i){
if(i==null)return '<div class="fr-word-explain"><b>Chạm vào một từ trong câu</b><p>Hiểu loại từ, nhiệm vụ của nó và từ/cụm mà nó liên hệ. Những từ có đường viền đậm cho thấy quan hệ đang được phân tích.</p></div>';
const p=exam.parts[i];if(!p)return "";
const rel=p.related?'<p><strong>Liên hệ với:</strong> '+esc(p.related)+'</p>':"";
return '<div class="fr-word-explain"><span class="fr-type fr-'+esc(p.kind)+'">'+esc(label(p.kind))+'</span><h4>'+esc(p.t)+'</h4><p><strong>Vai trò trong câu:</strong> '+esc(p.job)+'</p><p><strong>Tại sao?</strong> '+esc(p.why)+'</p>'+rel+'</div>';
}
function homepage(){
const learned=cases.filter(x=>checkDates(x.id).length).length,done=cases.filter(x=>status(x.id)==="reviewed").length;
const filtered=cases.filter(c=>ui.filter==="all"||filterMap[ui.filter].includes(c.id));
let h='<div class="fr-wrap"><button class="fr-return" type="button" data-r-action="foundation">← English Foundation</button>'+
'<div class="fr-hero"><span>WORD CONNECTIONS · HỌC TƯ DUY QUA QUAN HỆ CỦA TỪ</span><h2>Bốn loại từ kết nối với nhau như thế nào?</h2>'+
'<p>Danh từ gọi tên, động từ nói điều diễn ra, tính từ mô tả, trạng từ bổ sung cách thức hoặc mức độ. Chúng không đứng ngẫu nhiên: hãy tìm <b>từ nào đang nói về từ nào</b>.</p>'+
'<div class="fr-progress"><span>Đã luyện '+learned+'/'+cases.length+' quan hệ</span><span>Đã ôn ít nhất hai ngày: '+done+'</span></div></div>'+
'<div class="fr-roles-heading"><h3>Bấm vào một nhóm từ để nhìn các quan hệ</h3><p>Đây là bản đồ khái quát. Vị trí từ còn phụ thuộc vào nhiệm vụ cụ thể trong từng câu.</p></div>'+
'<div class="fr-four" role="group" aria-label="Bốn loại từ chính">';
data.roles.forEach(r=>{
h+='<button type="button" class="fr-role-card fr-'+r.id+(ui.filter===r.id?" selected":"")+'" data-r-filter="'+r.id+'" aria-pressed="'+(ui.filter===r.id)+'"><span>'+esc(r.label)+'</span><strong>'+esc(r.vi)+'</strong><small>'+esc(r.metaphor)+'</small><p>'+esc(r.purpose)+'</p></button>';
});
h+='</div><div class="fr-connections"><div class="fr-connection-title"><strong>Mạng lưới bổ nghĩa và quan hệ câu</strong><button type="button" data-r-filter="all">Xem tất cả</button></div>'+
'<div class="fr-connect-grid">'+
'<div><b class="fr-noun">NOUN</b><span>làm chủ ngữ hoặc tân ngữ</span><b class="fr-verb">VERB</b></div>'+
'<div><b class="fr-adj">ADJECTIVE</b><span>mô tả danh từ; hoặc mô tả chủ ngữ qua be</span><b class="fr-noun">NOUN</b></div>'+
'<div><b class="fr-adv">ADVERB</b><span>nêu cách/tần suất hành động</span><b class="fr-verb">VERB</b></div>'+
'<div><b class="fr-adv">ADVERB</b><span>chỉ mức độ</span><b class="fr-adj">ADJECTIVE</b></div>'+
'<div><b class="fr-adv">ADVERB</b><span>chỉ mức độ</span><b class="fr-adv">ADVERB</b></div>'+
'</div><p class="fr-fine">To be là một động từ: có thể nối chủ ngữ với tính chất, hoặc làm trợ động từ trong thì tiếp diễn. Các mũi quan hệ chỉ là mô hình tư duy, không phải công thức vị trí cố định.</p></div>';
if(ui.filter!=="all"){
const r=roles[ui.filter];h+='<div class="fr-role-focus"><div><strong>'+esc(r.vi)+' giúp hiểu điều gì?</strong><p>'+esc(r.question)+' '+esc(r.note)+'</p></div>'+button("clearFilter","Xem cả 4 nhóm","secondary")+'</div>';
}
h+='<div class="fr-list-head"><div><h3>Khám phá các quan hệ trong câu</h3><p>Mỗi quan hệ có ví dụ đối chiếu, bấm từng từ, tự xếp câu và giải thích vì sao.</p></div><span>'+filtered.length+' chủ đề</span></div><div class="fr-case-grid">';
filtered.forEach((c,i)=>{h+='<button type="button" class="fr-case" data-r-open="'+esc(c.id)+'"><span class="fr-case-group">'+esc(c.group)+'</span><strong>'+esc(c.title)+'</strong><small>'+esc(c.question)+'</small><span class="fr-case-foot">'+badge(c.id)+(due(c.id)?'<span class="fr-due">Đến lượt ôn</span>':'')+'<b>→</b></span></button>';});
h+='</div><div class="fr-note"><b>Cách ghi nhận tiến bộ</b><p>Chỉ ghi nhận một ngày ôn khi tự ghép đúng câu, hiểu câu hỏi quan hệ và viết giải thích của chính mình. Ôn lại vào ngày khác mới có trạng thái “Đã ôn 2 ngày”. Đây không phải chứng nhận thành thạo ngữ pháp.</p></div></div>';
return h;
}
function detail(){
const c=byId[ui.id],ex=c.examples[ui.example];
let h='<div class="fr-wrap"><button class="fr-return" type="button" data-r-action="hub">← Bản đồ bốn loại từ</button>'+
'<div class="fr-detail-header"><span>'+esc(c.group)+' · '+(cases.indexOf(c)+1)+'/'+cases.length+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.question)+'</p>'+badge(c.id)+'</div>'+
'<div class="fr-tabs" role="group" aria-label="Ba bước tư duy"><button data-r-tab="learn" aria-pressed="'+(ui.tab==="learn")+'" class="'+(ui.tab==="learn"?"on":"")+'">1. Xem quan hệ</button><button data-r-tab="build" aria-pressed="'+(ui.tab==="build")+'" class="'+(ui.tab==="build"?"on":"")+'">2. Tự xây câu</button><button data-r-tab="explain" aria-pressed="'+(ui.tab==="explain")+'" class="'+(ui.tab==="explain"?"on":"")+'">3. Giải thích vì sao</button></div><section class="fr-panel">';
if(ui.tab==="learn"){
h+=sectionHeader("01","Học quan hệ, không học vị trí máy móc","Tìm từ nào mang ý chính và từ nào bổ sung ý nghĩa cho nó.")+
'<div class="fr-principle"><strong>Vì sao các từ kết nối?</strong><p>'+esc(c.principle)+'</p></div>'+
'<div class="fr-warning"><strong>Đừng hiểu sai thành công thức cố định</strong><p>'+esc(c.exception)+'</p></div>'+
'<div class="fr-selector"><span>So sánh hai câu:</span>'+c.examples.map((e,i)=>'<button data-r-example="'+i+'" aria-pressed="'+(ui.example===i)+'" class="'+(ui.example===i?"selected":"")+'">Ví dụ '+(i+1)+'</button>').join("")+'</div>'+
'<div class="fr-example">'+chips(ex,ui.example)+'<div class="fr-relation"><strong>'+esc(ex.parts[ex.source].t)+'</strong><span>→ '+esc(c.link)+' →</span><strong>'+esc(ex.parts[ex.target].t)+'</strong></div><p>'+esc(ex.vi)+'</p><div class="fr-takeaway">'+esc(ex.point)+'</div></div>'+
'<div id="frWordExplanation" aria-live="polite">'+explainWord(ex,ui.selected)+'</div>'+
'<div class="fr-next">'+button("build","Tiếp → tự xây câu","primary")+'</div>';
}
if(ui.tab==="build"){
h+=sectionHeader("02","Lắp câu theo ý nghĩa","Đặt chủ ngữ, động từ và phần bổ sung dựa vào quan hệ; không chỉ nhắm mắt nhớ thứ tự.")+
'<div class="fr-task">Dùng các thẻ bên dưới dựng lại câu có nghĩa. Bấm từ trong câu để trả về kho từ.</div>'+
'<div class="fr-selected" aria-label="Các từ đã xếp">';
if(!ui.buildOrder.length)h+='<span class="fr-placeholder">Bấm các từ để xây câu...</span>';
ui.buildOrder.forEach((i,pos)=>h+='<button type="button" data-r-remove="'+pos+'">'+esc(c.build[i])+' <span>×</span></button>');
h+='</div><div class="fr-bank" aria-label="Kho từ">';
ui.buildBank.forEach(x=>{if(!ui.buildOrder.includes(x.i))h+='<button type="button" data-r-add="'+x.i+'">'+esc(x.word)+'</button>';});
h+='</div><div class="fr-actions">'+button("resetBuild","Làm lại","secondary")+'<button type="button" class="fr-btn primary" data-r-action="checkBuild" '+(ui.buildOrder.length!==c.build.length?"disabled":"")+'>Kiểm tra quan hệ →</button></div>';
if(ui.buildChecked)h+='<div class="fr-feedback '+(ui.buildCorrect?"good":"bad")+'"><strong>'+esc(ui.buildCorrect?"Đúng cấu trúc ví dụ!":"Cần xem lại quan hệ các từ.")+'</strong><p>'+esc(ui.buildCorrect?"Hãy nói được vì sao mỗi từ đứng ở chỗ đó. Đây là một câu mẫu; không phải mọi câu tiếng Anh chỉ có một trật tự hợp lệ.":"Gợi ý: "+c.principle)+'</p></div>';
h+='<div class="fr-next">'+button("explain","Tiếp → lý giải cách dùng →","primary")+'</div>';
}
if(ui.tab==="explain"){
const correct=ui.graded&&ui.answer===c.check.correct,words=(state.drafts[c.id]||"").trim();
h+=sectionHeader("03","Chứng minh mày hiểu, không chỉ đoán đúng","Trả lời một câu hỏi mới và tự giải thích ý nghĩa. Sau đó so sánh với gợi ý.")+
'<div class="fr-question"><strong>'+esc(c.check.question)+'</strong><div class="fr-choices">';
ui.questionOptions.forEach((x,i)=>{h+='<button type="button" data-r-choice="'+i+'" aria-pressed="'+(ui.answer===x.i)+'" '+(ui.graded?"disabled":"")+' class="'+(ui.answer===x.i?"chosen ":"")+(ui.graded?(x.i===c.check.correct?"right":ui.answer===x.i?"wrong":""):"")+'">'+esc(x.t)+'</button>';});
h+='</div>';
if(ui.graded)h+='<div class="fr-feedback '+(correct?"good":"bad")+'"><strong>'+(correct?"✓ Đúng, nhưng cần giải thích được.":"✗ Chưa đúng.")+'</strong><p>'+esc(c.check.why)+'</p></div>';
h+='</div><div class="fr-actions"><button type="button" data-r-action="grade" class="fr-btn secondary" '+(ui.answer===null||ui.graded?"disabled":"")+'>Chấm câu trả lời</button>'+ (ui.graded&&!correct?button("retry","Thử câu hỏi lại","secondary"):"")+'</div>'+
'<div class="fr-reflect"><label for="frDraft"><strong>Viết bằng lời của mày: Vì sao hai từ này liên hệ với nhau?</strong></label>'+
'<p>Ví dụ: Tại sao một từ là tính từ thay vì trạng từ? Nó đang nói về người/vật, hành động, hay mức độ? Viết tiếng Việt trước cũng được.</p>'+
'<textarea id="frDraft" rows="4" placeholder="Tao hiểu rằng...">'+esc(words)+'</textarea><small>Tự lưu trên trình duyệt này, không gọi API AI và chưa được tự động chấm ngữ pháp.</small>'+
'<div class="fr-actions">'+button("reveal",ui.showModel?"Ẩn giải thích mẫu":"So sánh với giải thích mẫu","secondary")+'</div>';
if(ui.showModel){
h+='<div class="fr-sample"><strong>Gợi ý giải thích</strong><p>'+esc(c.principle)+'</p><p><strong>Trường hợp dễ nhầm:</strong> '+esc(c.exception)+'</p></div>'+
'<label class="fr-honesty"><input id="frConfirm" type="checkbox" '+(ui.reflectionConfirmed?"checked":"")+'/> Tao đã tự giải thích và đối chiếu ý của mình với phần phân tích.</label>';
}
const complete=ui.buildCorrect&&correct&&words.length>=20&&ui.showModel&&ui.reflectionConfirmed;
h+='<div class="fr-next"><button type="button" data-r-action="complete" class="fr-btn primary" '+(!complete?"disabled":"")+'>Ghi nhận lượt thực hành →</button></div>';
h+='</div>';
}
h+='</section><div class="fr-under"><p>Hãy học chậm và tự giải thích. Mỗi khi quên, quay về ví dụ đối chiếu thay vì học thuộc vị trí máy móc.</p>'+button("next","Quan hệ tiếp theo →","secondary")+'</div></div>';
return h;
}
function render(el){el.innerHTML=ui.id?detail():homepage();}
function openHub(){ui.id=null;ui.filter="all";render(root);}
function publicOpen(id){if(id)open(id);else openHub();}
function preview(){
return '<div class="fr-inline-preview"><div><span>THỰC HÀNH TƯ DUY 4 LOẠI TỪ</span><strong>Noun – Verb – Adjective – Adverb</strong><p>Không chỉ nhìn từ đứng ở đâu: hiểu nó đang miêu tả danh từ, động từ, tính từ hay trạng từ khác.</p></div><button type="button" class="fr-btn primary" data-f-action="relations">Mở bản đồ 4 loại từ →</button></div>';
}
function confirm(){
if(!ui.id)return;const id=ui.id,c=byId[id],draft=(state.drafts[id]||"").trim(),correct=ui.graded&&ui.answer===c.check.correct;
if(!ui.buildCorrect||!correct||draft.length<20||!ui.showModel||!ui.reflectionConfirmed)return;
if(!state.records[id])state.records[id]={checks:[]};
if(!state.records[id].checks.includes(date()))state.records[id].checks.push(date());store();
ui.id=null;render(root);
}
root.addEventListener("click",function(e){
const b=e.target.closest("button");if(!b||!root.contains(b))return;
if(b.dataset.rFilter){ui.filter=b.dataset.rFilter;render(root);return;}
if(b.dataset.rOpen){open(b.dataset.rOpen);root.scrollIntoView({block:"start",behavior:"smooth"});return;}
if(b.dataset.rTab){ui.tab=b.dataset.rTab;render(root);return;}
if(b.dataset.rExample!==undefined){ui.example=Number(b.dataset.rExample);ui.selected=null;render(root);return;}
if(b.dataset.rToken!==undefined){ui.selected=Number(b.dataset.rToken);const area=root.querySelector("#frWordExplanation");if(area)area.innerHTML=explainWord(byId[ui.id].examples[ui.example],ui.selected);return;}
if(b.dataset.rAdd!==undefined){const i=Number(b.dataset.rAdd);if(!ui.buildOrder.includes(i)){ui.buildOrder.push(i);ui.buildChecked=false;ui.buildCorrect=false;render(root);}return;}
if(b.dataset.rRemove!==undefined){ui.buildOrder.splice(Number(b.dataset.rRemove),1);ui.buildChecked=false;ui.buildCorrect=false;render(root);return;}
if(b.dataset.rChoice!==undefined&&!ui.graded){ui.answer=ui.questionOptions[Number(b.dataset.rChoice)].i;render(root);return;}
const a=b.dataset.rAction;
if(a==="hub")openHub();
else if(a==="foundation"){const target=root.ownerDocument?.querySelector('.nav[data-view="foundation"]')||document.querySelector('.nav[data-view="foundation"]');if(target)target.click();ui.id=null;}
else if(a==="clearFilter"){ui.filter="all";render(root);}
else if(a==="learn"||a==="build"||a==="explain"){ui.tab=a;render(root);}
else if(a==="resetBuild"){ui.buildOrder=[];ui.buildChecked=false;ui.buildCorrect=false;render(root);}
else if(a==="checkBuild"){const c=byId[ui.id];ui.buildChecked=true;ui.buildCorrect=ui.buildOrder.length===c.build.length&&ui.buildOrder.every((n,i)=>n===i);render(root);}
else if(a==="grade"){if(ui.answer===null)return;ui.graded=true;render(root);}
else if(a==="retry"){ui.graded=false;ui.answer=null;ui.questionOptions=shuffle(byId[ui.id].check.options.map((t,i)=>({t,i})));render(root);}
else if(a==="reveal"){ui.showModel=!ui.showModel;ui.reflectionConfirmed=false;render(root);}
else if(a==="complete")confirm();
else if(a==="next"){const n=cases.findIndex(x=>x.id===ui.id);open(cases[(n+1)%cases.length].id);}
});
root.addEventListener("input",function(e){if(e.target.id==="frDraft"&&ui.id){state.drafts[ui.id]=e.target.value;store();const b=root.querySelector('[data-r-action="complete"]');if(b){const correct=ui.graded&&ui.answer===byId[ui.id].check.correct;b.disabled=!(ui.buildCorrect&&correct&&ui.showModel&&ui.reflectionConfirmed&&e.target.value.trim().length>=20);}}});
root.addEventListener("change",function(e){if(e.target.id==="frConfirm"){ui.reflectionConfirmed=e.target.checked;const b=root.querySelector('[data-r-action="complete"]');if(b){const correct=ui.graded&&ui.answer===byId[ui.id].check.correct;b.disabled=!(ui.buildCorrect&&correct&&ui.showModel&&ui.reflectionConfirmed&&(state.drafts[ui.id]||"").trim().length>=20);}}});
window.GKRelationsLab={render,open:publicOpen,preview,cases};
})();