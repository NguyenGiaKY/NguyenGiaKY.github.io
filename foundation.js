/* English Foundation: accessible A0 -> IELTS bridge with independent local progress. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot");
const data=window.GKFoundationData;
if(!root||!data||!Array.isArray(data.lessons))return;
const KEY="gk_foundation_v1";
let stored={};
try{stored=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const state={records:stored.records||{},drafts:stored.drafts||{}};
const ui={page:"home",filter:"all",id:null,tab:"learn",questions:[],answers:{},graded:false,score:0,transcript:false,model:false,placementAnswers:{},placementResult:null,diagnosticQuestions:[]};
const index=Object.fromEntries(data.lessons.map(x=>[x.id,x]));
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){notice("Không lưu được dữ liệu trên thiết bị này. Hãy kiểm tra chế độ riêng tư hoặc bộ nhớ trình duyệt.");}}
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function daysAfter(s,n){const p=s.split("-").map(Number);const d=new Date(p[0],p[1]-1,p[2]+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function entry(id){return state.records[id]||{attempts:[],selfChecked:false};}
function passDates(id){const distinct=new Set((entry(id).attempts||[]).filter(x=>x.score>=3).map(x=>x.day));return [...distinct].sort();}
function levelStatus(id){const e=entry(id),p=passDates(id);return p.length>=2&&e.selfChecked?"mastered":p.length&&e.selfChecked?"review":"new";}
function dueDate(id){const p=passDates(id);return p.length?daysAfter(p[p.length-1],[1,3,7,14][Math.min(p.length-1,3)]):null;}
function isDue(id){const d=dueDate(id);return d&&d<=today();}
function tag(id){const l=levelStatus(id);return l==="mastered"?'<span class="f-tag good">✓ Đã củng cố</span>':l==="review"?'<span class="f-tag ongoing">↻ Đang ôn</span>':'<span class="f-tag">Chưa học</span>';}
function button(action,label,style){return '<button type="button" data-f-action="'+esc(action)+'" class="f-btn '+(style||"")+'">'+label+'</button>';}
function shuffled(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[b[i],b[k]]=[b[k],b[i]];}return b;}
function generate(l){return shuffled(l.quiz.map(q=>({prompt:q[0],correct:q[1],options:shuffled(q.slice(1,4)),reason:q[4]})));}
function notice(x){const n=root.querySelector("#foundationNotice");if(n){n.hidden=false;n.textContent=x;}}
function scrollInto(){root.scrollIntoView({block:"start",behavior:"smooth"});}
function render(){if((ui.page!=="lesson"||!["apply","thinking"].includes(ui.tab))&&window.GKFoundationCoach)window.GKFoundationCoach.leave();if(ui.page==="home")home();else if(ui.page==="lesson")lesson();else if(ui.page==="wordpacks")root.innerHTML='<div id="foundationWordPacks">'+(window.GKFoundationThinking?window.GKFoundationThinking.packPage():"Vocabulary packs unavailable")+'</div>';else if(ui.page==="syntax"&&window.GKSentenceLab)window.GKSentenceLab.render(root);else if(ui.page==="relations"&&window.GKRelationsLab)window.GKRelationsLab.render(root);else diagnostic();}
function home(){
const started=data.lessons.filter(l=>(entry(l.id).attempts||[]).length||state.drafts[l.id]).length;
const mastered=data.lessons.filter(l=>levelStatus(l.id)==="mastered").length;
const due=data.lessons.filter(l=>isDue(l.id));
const next=data.lessons.find(l=>levelStatus(l.id)!=="mastered")||data.lessons[0];
const pct=Math.round(started/data.lessons.length*100);
const filtered=data.lessons.filter(l=>ui.filter==="all"||ui.filter===l.level);
let h='<div class="f-wrap"><div class="f-cover"><div><div class="f-kicker">ENGLISH FOUNDATION · A0 → A2 → IELTS</div>'+
'<h2>English that makes sense</h2><p>Understand the message. Discover word relationships, paraphrase ideas and learn to express yourself in natural English.</p>'+
'<div class="f-actions">'+button("continue","Học bài tiếp theo →","primary")+button("diagnostic","Kiểm tra điểm bắt đầu","secondary")+'</div></div>'+
'<div class="f-cover-progress"><div class="f-circle" style="--value:'+pct+'%"><strong>'+pct+'%</strong><small>Đã thực hành</small></div><span>Không đánh dấu Mastered chỉ vì bấm hoàn thành.</span></div></div>'+
'<div id="foundationNotice" hidden role="status"></div>'+
'<div class="f-statbar"><div><small>Đã làm bài</small><strong>'+started+' / '+data.lessons.length+'</strong></div><div><small>Đã củng cố</small><strong>'+mastered+'</strong></div><div><small>Cần ôn</small><strong>'+due.length+'</strong></div></div>'+
(window.GKFoundationThinking?window.GKFoundationThinking.homePanel():'')+'<details class="f-deep-dives"><summary><b>Extra interactive explainers</b><span>Sentence Thinking · Word Relationships ↓</span></summary><div class="f-guide"><b>Observe → Explain → Paraphrase → Use → Review</b><p>Understand the idea, identify word roles, transform a sentence, and use it in speaking/writing.</p></div>'+(window.GKFoundationVisual?window.GKFoundationVisual.preview():'')+
'<section class="f-syntax-intro"><div class="f-syntax-symbol">Aa</div><div><span class="f-syntax-label">HỌC NGỮ PHÁP BẰNG TƯ DUY</span><h3>Giải mã câu: danh từ, tính từ, động từ, trạng từ & to be</h3><p>12 bài chuyên sâu: chạm vào từng từ để biết nó làm nhiệm vụ gì, vì sao đứng đó, tự sắp xếp câu và giải thích lỗi sai. Nên học song song từ bài A0.</p></div>'+button("syntax","Học tư duy cấu trúc câu →","primary")+'</section>'+
'<section class="f-syntax-intro"><div class="f-syntax-symbol">↗</div><div><span class="f-syntax-label">BẢN ĐỒ 4 LOẠI TỪ · TƯ DUY TRỰC QUAN</span><h3>Danh từ – Động từ – Tính từ – Trạng từ kết nối như thế nào?</h3><p>Khám phá 10 quan hệ qua 20 câu đối chiếu. Bấm một từ để thấy nó bổ nghĩa cho từ nào, tự xây câu và lý giải cách dùng — không học mẹo vị trí cứng nhắc.</p></div>'+button("relations","Mở bản đồ quan hệ →","primary")+'</section></details>';
if(due.length){h+='<section class="f-due"><h3>↻ Đến lượt ôn lại</h3><div class="f-due-row">';due.slice(0,5).forEach(l=>h+='<button type="button" data-f-id="'+esc(l.id)+'" class="f-review-link">'+esc(l.title)+' <span>Ôn →</span></button>');h+='</div></section>';}
h+='<div class="f-section-title"><div><h3>Lộ trình 4 chặng</h3><p>24 bài nhỏ, học từ dễ đến khó. Các bài khác vẫn có thể xem trước.</p></div></div>'+
'<div class="f-levels"><button type="button" data-f-filter="all" class="'+(ui.filter==="all"?"on":"")+'" aria-pressed="'+(ui.filter==="all")+'">Tất cả<small>24 bài</small></button>';
data.levels.forEach(g=>{const n=data.lessons.filter(l=>l.level===g.id).length;h+='<button type="button" data-f-filter="'+esc(g.id)+'" class="'+(ui.filter===g.id?"on":"")+'" aria-pressed="'+(ui.filter===g.id)+'"><span>'+esc(g.id)+'</span><strong>'+esc(g.title)+'</strong><small>'+esc(g.weeks)+' · '+n+' bài</small></button>';});
h+='</div><div class="f-lesson-list">';
filtered.forEach(l=>{const seq=data.lessons.indexOf(l)+1;h+='<button class="f-lesson-row" type="button" data-f-id="'+esc(l.id)+'"><span class="f-number">'+String(seq).padStart(2,"0")+'</span><span class="f-row-center"><small>'+esc(l.level)+' · '+esc(l.skill)+' · '+l.minutes+' phút</small><strong>'+esc(l.title)+'</strong><span>'+esc(l.goal)+'</span></span><span class="f-row-end">'+(isDue(l.id)?'<span class="f-tag due">Cần ôn</span>':tag(l.id))+'<b>→</b></span></button>';});
h+='</div><div class="f-bridge"><div><h3>Sau Foundation là 81 IELTS Tasks</h3><p>Đây là chương trình khởi động, không phải chứng nhận đạt A2. Khi đã hiểu câu cơ bản, nghe được ý chính và tự diễn đạt, hãy chuyển dần sang các IELTS tasks phù hợp.</p></div>'+button("ielts","Mở Study Queue →","secondary")+'</div></div>';
root.innerHTML=h;
}
function open(id){if(!index[id])return;window.GKFoundationCoach?.leave();ui.page="lesson";ui.id=id;ui.tab="learn";ui.questions=generate(index[id]);ui.answers={};ui.graded=false;ui.score=0;ui.transcript=false;ui.model=false;render();scrollInto();}
function step(n,title,subtitle){return '<div class="f-step"><span>'+n+'</span><div><h3>'+title+'</h3><p>'+subtitle+'</p></div></div>';}
function lesson(){
const l=index[ui.id],p=passDates(l.id);
let h='<div class="f-wrap f-lesson-view"><button class="f-back" type="button" data-f-action="home">← Quay lại chương trình</button>'+
'<div class="f-lesson-header"><span>'+esc(l.level)+' · '+esc(l.skill)+' · '+l.minutes+' phút</span><h2>'+esc(l.title)+'</h2><p>'+esc(l.goal)+'</p><div>'+tag(l.id)+'<small>'+(p.length?"Đạt bài kiểm tra vào "+p.length+" ngày khác nhau":"Chưa có lượt kiểm tra đạt")+'</small></div></div>'+
'<div class="f-tabs" role="group" aria-label="Learning path"><button type="button" data-f-tab="learn" aria-pressed="'+(ui.tab==="learn")+'" class="'+(ui.tab==="learn"?"on":"")+'">01 · Explore & Listen</button><button type="button" data-f-tab="thinking" aria-pressed="'+(ui.tab==="thinking")+'" class="'+(ui.tab==="thinking"?"on":"")+'">02 · Think & Paraphrase</button><button type="button" data-f-tab="apply" aria-pressed="'+(ui.tab==="apply")+'" class="'+(ui.tab==="apply"?"on":"")+'">03 · Speak & Write</button><button type="button" data-f-tab="quiz" aria-pressed="'+(ui.tab==="quiz")+'" class="'+(ui.tab==="quiz"?"on":"")+'">04 · Check & Fix</button><button type="button" data-f-tab="structure" aria-pressed="'+(ui.tab==="structure")+'" class="'+(ui.tab==="structure"?"on":"")+'">05 · Deep Dive</button></div><div class="f-content">';
if(ui.tab==="learn"){
 h+=(window.GKFoundationMissions?window.GKFoundationMissions.intro(l):"")+step("01","Understand why English works","Read the situation first. Notice how changing a word changes what people understand.")+'<details class="fm-extra-explain"><summary>Explanation in Vietnamese · Vì sao câu dùng như vậy?</summary><p>'+esc(l.explain)+'</p></details>'+ (l.level==="A0"&&window.GKFoundationVisual?'<div id="foundationVisualPanel">'+window.GKFoundationVisual.render(l.id)+'</div>':'') +'<div class="f-rules">';
 l.rules.forEach(x=>h+='<div><span>✓</span><p>'+esc(x)+'</p></div>');
 h+='</div>'+step("02","Nghe rồi nhắc lại","Nghe lần đầu, tự nhắc lại, nghe tiếp với tốc độ chậm nếu cần.")+
 '<div class="f-player"><div><strong>🔊 Listening practice</strong><small>Giọng đọc có sẵn trên thiết bị, không phải audio gốc IELTS.</small></div><div>'+button("play","▶ Nghe","primary")+button("slow","🐢 Chậm","secondary")+'</div></div><p id="foundationSpeechStatus" class="f-hint" role="status"></p><div class="f-examples">';
 l.examples.forEach((e,i)=>h+='<div><div><strong>'+esc(e[0])+'</strong><span>'+esc(e[1])+'</span></div><button type="button" data-f-speak="'+i+'" aria-label="Nghe câu ví dụ '+(i+1)+'">🔊</button></div>');
 h+='</div>'+step("03","Từ vựng đi cùng ngữ cảnh","Nói một câu mới với mỗi từ thay vì chỉ học thuộc nghĩa.")+'<div class="f-vocabulary">';
 l.words.forEach(w=>h+='<div><b>'+esc(w[0])+'</b><span>'+esc(w[1])+'</span></div>');
 h+='</div><div class="f-transcript">'+button("transcript",ui.transcript?"Ẩn transcript ↑":"Xem transcript ↓","secondary")+(ui.transcript?'<p>'+esc(l.audio)+'</p>':'<p class="f-hint">Thử nghe 2 lượt trước khi xem chữ.</p>')+'</div><div class="f-next">'+button("thinking","Understand meaning & paraphrase →","primary")+'</div>';
}
if(ui.tab==="thinking")h+=window.GKFoundationThinking?'<div id="foundationThinkingPanel">'+window.GKFoundationThinking.render(l.id)+'</div>':'<p>The Thinking Studio could not load. Please refresh.</p>';
if(ui.tab==="quiz"){
h+=(window.GKFoundationMissions?window.GKFoundationMissions.detective(l):"")+step("04","Check your understanding","Explain why one sentence changes meaning, then answer four short questions.")+'<p class="f-hint">Các câu được đảo thứ tự khi thử lại. Đừng nhìn ví dụ phía trên trong lúc làm.</p>';
ui.questions.forEach((q,i)=>{
h+='<fieldset class="f-question"><legend><span>Câu '+(i+1)+'</span> '+esc(q.prompt)+'</legend><div class="f-options">';
q.options.forEach((o,j)=>{const chosen=ui.answers[i]===o;h+='<button type="button" data-f-q="'+i+'" data-f-opt="'+j+'" aria-pressed="'+chosen+'" '+(ui.graded?"disabled":"")+' class="f-option '+(chosen?"selected ":"")+(ui.graded?(o===q.correct?"right":chosen?"wrong":""):"")+'"><span>'+String.fromCharCode(65+j)+'</span>'+esc(o)+'</button>';});
h+='</div>'+(ui.graded?'<p class="f-explain">'+(ui.answers[i]===q.correct?"✓ Đúng. ":"✗ Đáp án: "+esc(q.correct)+". ")+esc(q.reason)+'</p>':'')+'</fieldset>';
});
if(ui.graded)h+='<div class="f-result '+(ui.score>=3?"pass":"retry")+'"><strong>'+ui.score+'/4 câu đúng</strong><p>'+(ui.score>=3?"Đạt lượt kiểm tra. Viết câu của mày và quay lại ôn ngày khác để củng cố.":"Chưa đạt 3/4. Xem giải thích, học lại điểm sai rồi thử lại.")+'</p></div><div class="f-next">'+button("retry","Làm lại","secondary")+button(ui.score>=3?"apply":"learn",ui.score>=3?"Tiếp tục vận dụng →":"Xem bài học →","primary")+'</div>';
else h+='<div class="f-next"><span class="f-hint">Đã chọn '+Object.keys(ui.answers).length+'/'+ui.questions.length+'</span><button type="button" class="f-btn primary" data-f-action="grade" '+(Object.keys(ui.answers).length!==ui.questions.length?"disabled":"")+'>Chấm & giải thích →</button></div>';
}
if(ui.tab==="structure"){
h+=window.GKSentenceLab?window.GKSentenceLab.lessonContent(l):'<p>Chưa tải được phần phân tích cấu trúc câu.</p>';
if(window.GKRelationsLab)h+=window.GKRelationsLab.preview();
}
if(ui.tab==="apply"){
const draft=state.drafts[l.id]||"";
h+=(window.GKFoundationMissions?window.GKFoundationMissions.apply(l):"")+'<div class="fm-writing-editor"><label class="f-draft-label" for="foundationDraft">Your own answer (English)</label><textarea id="foundationDraft" rows="4" placeholder="Write your answer in your own words. Focus on the situation above…">'+esc(draft)+'</textarea><small>Autosaved on this device. AI feedback is optional and is sent only when you request it.</small></div>'+
(window.GKFoundationCoach?window.GKFoundationCoach.render(l):'')+'<div class="f-next">'+button("model",ui.model?"Ẩn câu mẫu":"So sánh với câu mẫu","secondary")+'</div>';
if(ui.model){
h+='<div class="f-model"><strong>Câu mẫu tham khảo</strong><p>'+esc(l.produce[2])+'</p><small>Đừng bắt buộc viết giống hệt; hãy kiểm tra ngữ pháp, ý nghĩa, cách dùng từ.</small></div>';
h+='<label class="f-selfcheck"><input id="foundationSelfCheck" type="checkbox" '+(entry(l.id).selfChecked?"checked":"")+'/> Tôi đã tự viết, so sánh câu mẫu và sửa các lỗi nhận ra.</label>';
if(ui.score>=3||passDates(l.id).length)h+='<p class="f-hint">Đã có lượt kiểm tra đạt. Để được đánh dấu củng cố cần ôn đạt ở ít nhất 2 ngày khác nhau và tự kiểm tra phần viết.</p>';
else h+='<p class="f-hint">Hãy làm bài trắc nghiệm đạt 3/4 trước khi tính tiến độ củng cố.</p>';
}
h+='<div class="f-next">'+button("quiz","Ôn câu hỏi","secondary")+button("next","Bài tiếp theo →","primary")+'</div>';
}
h+='</div><div class="f-foot">'+button("home","← Danh sách bài học","text")+'<span>Tiến độ Foundation tách biệt hoàn toàn với 81 IELTS tasks.</span></div></div>';
root.innerHTML=h;
}
function diagnostic(){
const sample=[data.lessons[1],data.lessons[2],data.lessons[4],data.lessons[6],data.lessons[8],data.lessons[12],data.lessons[15],data.lessons[19]];
const questions=ui.diagnosticQuestions;
let h='<div class="f-wrap"><button class="f-back" type="button" data-f-action="home">← Quay lại</button><div class="f-lesson-header"><span>STARTING POINT · SELF CHECK</span><h2>Kiểm tra điểm bắt đầu</h2><p>8 câu ngắn định hướng nên học từ đâu. Không phải bài kiểm tra CEFR hay IELTS chính thức. Nếu chưa biết, cứ chọn câu mình nghĩ đúng.</p></div>';
questions.forEach((q,i)=>{
h+='<fieldset class="f-question"><legend><span>Câu '+(i+1)+'</span> '+esc(q.prompt)+'</legend><div class="f-options">';
q.options.forEach((o,j)=>h+='<button type="button" data-f-diag="'+i+'" data-f-opt="'+j+'" '+(ui.placementResult?"disabled":"")+' aria-pressed="'+(ui.placementAnswers[i]===o)+'" class="f-option '+(ui.placementAnswers[i]===o?"selected":"")+'"><span>'+String.fromCharCode(65+j)+'</span>'+esc(o)+'</button>');
h+='</div></fieldset>';
});
if(ui.placementResult){const r=ui.placementResult;h+='<div class="f-result pass"><strong>'+r.correct+'/8 câu đúng</strong><p>Khuyến nghị bắt đầu từ chặng <b>'+esc(r.level)+'</b>. Đây chỉ là kiểm tra nhanh về ngữ pháp; để xác định trình độ thực tế cần thêm nghe, đọc, viết và nói.</p>'+button("startLevel","Học từ chặng "+esc(r.level)+" →","primary")+'</div>';}
else h+='<div class="f-next"><button type="button" data-f-action="checkDiagnostic" class="f-btn primary" '+(Object.keys(ui.placementAnswers).length!==8?"disabled":"")+'>Xem gợi ý điểm bắt đầu →</button></div>';
h+='</div>';root.innerHTML=h;
}
function speak(text,slow){
const status=root.querySelector("#foundationSpeechStatus");
if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){if(status)status.textContent="Trình duyệt này không hỗ trợ đọc. Hãy luyện theo câu mẫu và transcript.";return;}
try{
window.speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(text);u.lang="en-NZ";u.rate=slow?.78:.96;u.pitch=1;u.volume=1;
const voices=window.speechSynthesis.getVoices();
const voice=voices.find(v=>/^en-(NZ|AU|GB)/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));if(voice)u.voice=voice;
if(status)status.textContent=slow?"Đang đọc chậm...":"Đang đọc...";
u.onend=()=>{if(status)status.textContent="Đã phát xong.";};
u.onerror=()=>{if(status)status.textContent="Không đọc được trên trình duyệt này. Thử lại hoặc dùng câu mẫu."};
window.speechSynthesis.speak(u);
}catch(e){if(status)status.textContent="Không thể phát giọng đọc trên thiết bị này.";}
}
root.addEventListener("click",function(e){
const b=e.target.closest("button");if(!b||!root.contains(b))return;
if(b.hasAttribute("data-f-filter")){ui.filter=b.dataset.fFilter;render();return;}
if(b.hasAttribute("data-f-id")){open(b.dataset.fId);return;}
if(b.hasAttribute("data-f-tab")){ui.tab=b.dataset.fTab;render();return;}
if(b.hasAttribute("data-f-speak")){speak(index[ui.id].examples[Number(b.dataset.fSpeak)][0],false);return;}
if(b.hasAttribute("data-f-q")&&!ui.graded){const q=ui.questions[Number(b.dataset.fQ)];ui.answers[Number(b.dataset.fQ)]=q.options[Number(b.dataset.fOpt)];render();return;}
if(b.hasAttribute("data-f-diag")&&!ui.placementResult){ui.placementAnswers[Number(b.dataset.fDiag)]=ui.diagnosticQuestions[Number(b.dataset.fDiag)].options[Number(b.dataset.fOpt)];render();return;}
const a=b.dataset.fAction;
if(!a)return;
if(a==="home"){ui.page="home";render();scrollInto();}
else if(a==="wordPacks"){ui.page="wordpacks";render();scrollInto();}
else if(a==="continue"){open((data.lessons.find(l=>isDue(l.id))||data.lessons.find(l=>levelStatus(l.id)!=="mastered")||data.lessons[0]).id);}
else if(a==="diagnostic"){ui.page="placement";ui.placementAnswers={};ui.placementResult=null;ui.diagnosticQuestions=[data.lessons[1],data.lessons[2],data.lessons[4],data.lessons[6],data.lessons[8],data.lessons[12],data.lessons[15],data.lessons[19]].map(l=>({prompt:l.quiz[0][0],options:shuffled(l.quiz[0].slice(1,4)),correct:l.quiz[0][1]}));render();scrollInto();}
else if(a==="checkDiagnostic"){const n=ui.diagnosticQuestions.reduce((sum,q,i)=>sum+(ui.placementAnswers[i]===q.correct?1:0),0);ui.placementResult={correct:n,level:n<=3?"A0":n<=5?"A1":"A2"};render();}
else if(a==="startLevel"){ui.page="home";ui.filter=ui.placementResult.level;render();scrollInto();}
else if(a==="syntax"||a==="syntaxTopic"){if(!window.GKSentenceLab)return;window.GKSentenceLab.select(a==="syntaxTopic"?b.dataset.fSyntaxId:null);ui.page="syntax";render();scrollInto();}
else if(a==="relations"){if(!window.GKRelationsLab)return;window.GKRelationsLab.open(null);ui.page="relations";render();scrollInto();}
else if(a==="relationsBack"){ui.page="home";render();scrollInto();}
else if(a==="ielts"){const target=document.querySelector('.nav[data-view="today"]');if(target)target.click();else location.hash="#view-today";}
else if(a==="learn"||a==="quiz"||a==="apply"||a==="thinking"){ui.tab=a;render();}
else if(a==="transcript"){ui.transcript=!ui.transcript;render();}
else if(a==="play"||a==="slow"){speak(index[ui.id].audio,a==="slow");}
else if(a==="retry"){ui.questions=generate(index[ui.id]);ui.answers={};ui.graded=false;ui.score=0;render();}
else if(a==="grade"){
 if(Object.keys(ui.answers).length!==ui.questions.length)return;
 ui.score=ui.questions.reduce((n,q,i)=>n+(ui.answers[i]===q.correct?1:0),0);
 ui.graded=true;
 const id=ui.id;
 if(!state.records[id])state.records[id]={attempts:[],selfChecked:false};
 state.records[id].attempts.push({day:today(),score:ui.score});
 state.records[id].attempts=state.records[id].attempts.slice(-50);
 save();render();
}
else if(a==="model"){ui.model=!ui.model;render();}
else if(a==="next"){const i=data.lessons.findIndex(l=>l.id===ui.id);open(data.lessons[(i+1)%data.lessons.length].id);}
});
root.addEventListener("input",function(e){
if(e.target&&e.target.id==="foundationDraft"){state.drafts[ui.id]=e.target.value;save();}
});
root.addEventListener("change",function(e){
if(e.target&&e.target.id==="foundationSelfCheck"){if(!state.records[ui.id])state.records[ui.id]={attempts:[],selfChecked:false};state.records[ui.id].selfChecked=e.target.checked;save();}
});
window.GKFoundationOpenLesson=open;
document.querySelectorAll('.nav[data-view="foundation"]').forEach(b=>b.addEventListener("click",()=>{if(ui.page==="home")render();}));
render();
})();
