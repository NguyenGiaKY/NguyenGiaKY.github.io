
(function(){
const FLEX_KEY='ielts_flexible_skill_v1';
let fs={};
try{fs=JSON.parse(localStorage.getItem(FLEX_KEY)||'{}')}catch(e){}
fs.done=fs.done||{};
fs.queue=fs.queue||[];
fs.queueSize=[2,4,6].includes(Number(fs.queueSize))?Number(fs.queueSize):4;
fs.scores=fs.scores||{listening:[],reading:[],writing:[],speaking:[]};
fs.phase=fs.phase||'foundation';
const saveFlex=()=>localStorage.setItem(FLEX_KEY,JSON.stringify(fs));

const modules={
 listening:[
  {id:'L1',title:'Decode English sounds',goal:'Nghe ra từ thật trước khi nghĩ tới đáp án.',tasks:[
   ['L1a','Names, numbers & spelling','Luyện tên riêng, số, ngày tháng và spelling.',1,2],
   ['L1b','Weak forms & connected speech','Tập nhận âm yếu, nối âm và từ bị nuốt.',3,2],
   ['L1c','Transcript repair','Nghe → đối chiếu transcript → nghe lại đúng đoạn sai.',6,2]
  ]},
  {id:'L2',title:'Section 1 accuracy',goal:'Form/note completion: không mất điểm vì spelling hoặc giới hạn từ.',tasks:[
   ['L2a','Form completion','Predict answer type trước khi nghe.',8,2],
   ['L2b','Dates, prices, addresses','Drill chi tiết dễ mất điểm.',10,2],
   ['L2c','Section 1 correction loop','Làm lại chỉ những câu từng sai.',13,2]
  ]},
  {id:'L3',title:'Section 2 maps & MCQ',goal:'Theo dõi vị trí và paraphrase mà không bị distractor.',tasks:[
   ['L3a','Map / plan language','left/right/opposite/beyond/next to.',15,2],
   ['L3b','MCQ distractors','Nghe thay đổi ý và đáp án bị loại.',17,2],
   ['L3c','Section 2 repair','Transcript evidence + replay.',20,2]
  ]},
  {id:'L4',title:'Section 3 conversations',goal:'Theo được nhiều người nói, opinion và matching.',tasks:[
   ['L4a','Speaker opinions','Phân biệt ai nói gì.',22,2],
   ['L4b','Matching & distractors','Track paraphrases across speakers.',24,2],
   ['L4c','Section 3 repair','Ghi nguyên nhân sai: sound / vocab / attention.',27,2]
  ]},
  {id:'L5',title:'Section 4 academic listening',goal:'Theo lecture dài và note completion.',tasks:[
   ['L5a','Signposting','first, however, in contrast, finally...',29,2],
   ['L5b','Academic note completion','Predict noun/verb/number before listening.',31,2],
   ['L5c','Lecture replay','Nghe lại theo chunk, không nghe cả bài vô thức.',34,2]
  ]},
  {id:'L6',title:'Band 8 consolidation',goal:'Ổn định accuracy cao ở full Listening tests.',tasks:[
   ['L6a','Full test checkpoint','Làm full Listening như thi, ghi score /40.','checkpoint','listening'],
   ['L6b','Deep correction','Mỗi lỗi phải có transcript evidence.',36,7],
   ['L6c','Redo wrong questions','Làm lại sau khi không nhìn đáp án.',39,6]
  ]}
 ],
 reading:[
  {id:'R1',title:'Skimming & scanning',goal:'Tìm vị trí thông tin nhanh mà không đọc từng chữ.',tasks:[
   ['R1a','Skim main idea','Đọc topic sentence và cấu trúc passage.',1,1],
   ['R1b','Scan names, dates, keywords','Tìm evidence trước khi đọc sâu.',2,1],
   ['R1c','Paraphrase spotting','Nối question wording với passage wording.',4,1]
  ]},
  {id:'R2',title:'True / False / Not Given',goal:'Phân biệt contradiction với thiếu thông tin.',tasks:[
   ['R2a','TFNG logic','True = same meaning; False = contradiction; NG = insufficient.',7,1],
   ['R2b','Evidence discipline','Mỗi câu phải chỉ ra dòng evidence.',9,1],
   ['R2c','TFNG repair','Phân tích vì sao mình suy diễn quá mức.',12,1]
  ]},
  {id:'R3',title:'Headings & Matching Information',goal:'Nhìn chức năng đoạn văn thay vì săn keyword.',tasks:[
   ['R3a','Matching Headings','Main idea ≠ one detail.',14,1],
   ['R3b','Matching Information','Locate unusual details efficiently.',16,1],
   ['R3c','Paragraph map','Viết 3–5 từ tóm ý mỗi đoạn.',19,1]
  ]},
  {id:'R4',title:'MCQ & Completion',goal:'Loại distractor và kiểm word limit.',tasks:[
   ['R4a','Multiple Choice','Evidence + eliminate 3 distractors.',21,1],
   ['R4b','Sentence completion','Grammar slot + word limit.',23,1],
   ['R4c','Summary / table completion','Predict word class before locating.',26,1]
  ]},
  {id:'R5',title:'Academic paraphrase',goal:'Tăng tốc bằng synonyms, word families và collocations.',tasks:[
   ['R5a','Paraphrase notebook','Question phrase → passage phrase.',28,1],
   ['R5b','Word families in context','noun/verb/adjective/adverb theo câu.',30,1],
   ['R5c','Unknown-word strategy','Đoán từ theo context trước khi dùng dictionary.',33,1]
  ]},
  {id:'R6',title:'Band 8 consolidation',goal:'Ổn định Reading full test với evidence-based correction.',tasks:[
   ['R6a','Full test checkpoint','Làm full Academic Reading, ghi score /40.','checkpoint','reading'],
   ['R6b','Timing repair','Xác định passage/dạng câu làm bạn mất thời gian.',35,7],
   ['R6c','Redo wrong questions','Làm lại không nhìn key.',38,6]
  ]}
 ],
 writing:[
  {id:'W1',title:'Sentence accuracy',goal:'Giảm lỗi cơ bản để không kéo Grammar band xuống.',tasks:[
   ['W1a','Tense & S-V agreement','Viết câu đúng trước khi viết câu phức.',1,0],
   ['W1b','Articles, plurals, word forms','Target những lỗi lặp.',4,0],
   ['W1c','Complex sentence control','Although/while/relative clauses chính xác.',15,0]
  ]},
  {id:'W2',title:'Paragraph development',goal:'Main idea → explain → example → link.',tasks:[
   ['W2a','Topic sentence','Một paragraph = một central idea.',2,4],
   ['W2b','Explain ideas','Trả lời “why/how?” sau main idea.',5,4],
   ['W2c','Relevant examples','Ví dụ phải chứng minh đúng ý.',8,4]
  ]},
  {id:'W3',title:'Task 1 core',goal:'Overview rõ + chọn data quan trọng + so sánh.',tasks:[
   ['W3a','Overview','Không liệt kê số; nêu 2–3 features lớn.',11,4],
   ['W3b','Comparisons','higher/lower, whereas, respectively.',14,4],
   ['W3c','Data accuracy','by/to/from/at + numbers.',17,4]
  ]},
  {id:'W4',title:'Task 2 core',goal:'Hiểu question type và giữ position nhất quán.',tasks:[
   ['W4a','Question analysis','Opinion / discussion / problem-solution / two-part.',20,4],
   ['W4b','Thesis & outline','Position trước khi viết.',23,4],
   ['W4c','Essay organisation','Intro → Body 1 → Body 2 → conclusion.',26,4]
  ]},
  {id:'W5',title:'Coherence & vocabulary',goal:'Dùng linking tự nhiên và vocabulary chính xác.',tasks:[
   ['W5a','Cohesion without overlinking','Không nhồi however/moreover.',29,4],
   ['W5b','Collocations','Ưu tiên cụm đúng hơn “từ khó”.',32,4],
   ['W5c','Rewrite weak sentences','Biến lỗi thật thành câu tốt hơn.',35,4]
  ]},
  {id:'W6',title:'6.5 consolidation',goal:'Viết timed + self-check + rewrite ổn định.',tasks:[
   ['W6a','Writing checkpoint','Làm một task hoàn chỉnh và ghi band ước lượng.','checkpoint','writing'],
   ['W6b','Self-check by criterion','TR/TA • CC • LR • GRA.',38,4],
   ['W6c','Rewrite after feedback','Không chỉ đọc feedback; phải viết lại.',41,4]
  ]}
 ],
 speaking:[
  {id:'S1',title:'Part 1 fluency',goal:'Trả lời tự nhiên 2–4 câu, không học thuộc.',tasks:[
   ['S1a','Answer + reason','Không trả lời một câu cụt.',1,5],
   ['S1b','Add a small example','Example cá nhân giúp fluency tự nhiên.',4,5],
   ['S1c','Repair fillers','Giảm “uh…”, silence dài và restart.',7,5]
  ]},
  {id:'S2',title:'Part 2 structure',goal:'Nói gần 2 phút có flow rõ.',tasks:[
   ['S2a','1-minute notes','Keyword, không viết script.',10,5],
   ['S2b','Story structure','Context → details → feeling/result.',13,5],
   ['S2c','Keep talking','Dùng expansion questions khi bí ý.',16,5]
  ]},
  {id:'S3',title:'Part 3 development',goal:'Opinion → reason → example → consequence.',tasks:[
   ['S3a','Develop abstract ideas','Why / how / who is affected?',19,5],
   ['S3b','Compare perspectives','individual vs society / now vs past.',22,5],
   ['S3c','Speculation','may/might/could + cautious language.',25,5]
  ]},
  {id:'S4',title:'Pronunciation',goal:'Dễ hiểu, stress và chunking tốt hơn.',tasks:[
   ['S4a','Sentence stress','Nhấn content words.',28,5],
   ['S4b','Chunking','Ngắt theo meaning groups.',31,5],
   ['S4c','Record & replay','Nghe lại chính mình và sửa 3 điểm.',34,5]
  ]},
  {id:'S5',title:'Grammar & lexical control',goal:'Range vừa đủ nhưng chính xác.',tasks:[
   ['S5a','Tense flexibility','past/present/future theo câu hỏi.',37,5],
   ['S5b','Natural collocations','Không ép idiom.',40,5],
   ['S5c','Self-correction','Sửa nhanh nhưng không restart cả câu.',43,5]
  ]},
  {id:'S6',title:'6.5 consolidation',goal:'Full mock Part 1–2–3 ổn định.',tasks:[
   ['S6a','Speaking checkpoint','Làm full mock và ghi band ước lượng.','checkpoint','speaking'],
   ['S6b','5-error repair','Chỉ chọn 5 lỗi lặp quan trọng.',46,5],
   ['S6c','Record again','Nói lại sau khi sửa.',49,5]
  ]}
 ],
 support:[
  {id:'G1',title:'Grammar repair',goal:'Chỉ học grammar có tác động tới Writing/Speaking.',tasks:[
   ['G1a','Tenses','Present/Past/Perfect/Continuous.',1,0],
   ['G1b','Articles & plurals','a/an/the/zero + countability.',4,0],
   ['G1c','S-V & complex sentences','Accuracy before complexity.',5,0]
  ]},
  {id:'V1',title:'Vocabulary in context',goal:'Học từ gặp trong Reading/Listening/Writing, không học list rời.',tasks:[
   ['V1a','12 useful collocations','Meaning + example + production.',1,3],
   ['V1b','Word families','noun/verb/adjective/adverb thật sự tồn tại.',3,3],
   ['V1c','Saved-word review','Chỉ ôn từ bạn đã lưu.',6,3]
  ]},
  {id:'E1',title:'Error repair',goal:'Một lỗi chỉ thật sự xong khi bạn làm lại đúng.',tasks:[
   ['E1a','Review 1–3–7','Làm lại lỗi đến hạn.',1,6],
   ['E1b','Wrong → Why → Rule → Correct','Viết nguyên nhân sai.',1,7],
   ['E1c','Mixed weak-skill drill','Luyện chính lỗi lặp.',1,8]
  ]}
 ]
};

const skillMeta={
 listening:{label:'Listening',target:'8+',metric:'/40',goal:35},
 reading:{label:'Reading',target:'8+',metric:'/40',goal:35},
 writing:{label:'Writing',target:'6.5+',metric:'band',goal:6.5},
 speaking:{label:'Speaking',target:'6.5+',metric:'band',goal:6.5},
 support:{label:'Grammar & Vocabulary',target:'support',metric:'',goal:null}
};

const allTasks=()=>Object.entries(modules).flatMap(([skill,ms])=>ms.flatMap(m=>m.tasks.map(t=>({skill,module:m.id,moduleTitle:m.title,id:t[0],title:t[1],desc:t[2],day:t[3],index:t[4]}))));
const taskById=id=>allTasks().find(t=>t.id===id);
const doneCountSkill=skill=>allTasks().filter(t=>t.skill===skill&&fs.done[t.id]).length;
const totalSkill=skill=>allTasks().filter(t=>t.skill===skill).length;
const pctSkill=skill=>Math.round(doneCountSkill(skill)/Math.max(1,totalSkill(skill))*100);

function latestScore(skill){
 const a=fs.scores[skill]||[];return a.length?a[a.length-1]:null;
}
function scoreStatus(skill){
 const v=latestScore(skill),m=skillMeta[skill];
 if(v===null)return 'Chưa có checkpoint';
 return v>=m.goal?'Đạt vùng mục tiêu luyện tập':'Chưa đạt mục tiêu — tiếp tục module';
}
function overallProgress(){
 let tasks=allTasks(),done=tasks.filter(t=>fs.done[t.id]).length;
 return Math.round(done/tasks.length*100);
}
function updateHero(){
 const p=overallProgress(),pct=document.getElementById('pct'),bar=document.getElementById('bar'),txt=document.getElementById('progressText');
 if(pct)pct.textContent=p;if(bar)bar.style.width=p+'%';if(txt)txt.textContent=Object.keys(fs.done).filter(k=>fs.done[k]).length+'/'+allTasks().length+' task đã hoàn thành';
}
window.progress=updateHero;

function phaseInfo(){
 const lrReady=['listening','reading'].every(s=>(fs.scores[s]||[]).slice(-3).length>=3&&(fs.scores[s]||[]).slice(-3).every(x=>x>=35));
 const wsReady=['writing','speaking'].every(s=>(fs.scores[s]||[]).slice(-3).length>=3&&(fs.scores[s]||[]).slice(-3).every(x=>x>=6.5));
 if(lrReady&&wsReady)return ['Exam Readiness','Bạn đã có dữ liệu ổn định ở vùng mục tiêu. Tập mock, sửa lỗi cuối và giữ phong độ.'];
 if(pctSkill('listening')>=60&&pctSkill('reading')>=60)return ['Band Target Consolidation','Tập trung full-test checkpoints, deep correction và ổn định L/R 8+, W/S 6.5+.'];
 if(pctSkill('listening')>=25||pctSkill('reading')>=25)return ['Skill Building','Tiếp tục xây từng dạng câu hỏi. Không cần chạy theo số ngày.'];
 return ['Foundation & Diagnosis','Xây nền và tìm chính xác lỗi đang làm mất điểm.'];
}

function chooseQueue(n=4,reset=false){
 let tasks=allTasks(),existing=(fs.queue||[]).map(taskById).filter(Boolean).filter(t=>!fs.done[t.id]);
 if(!reset&&existing.length){fs.queue=existing.map(t=>t.id);saveFlex();return existing;}
 let chosen=[];
 const pick=skill=>{
   let t=tasks.find(x=>x.skill===skill&&!fs.done[x.id]&&!chosen.some(y=>y.id===x.id));
   if(t)chosen.push(t);
 };
 const pattern=['listening','reading','listening','reading','writing','speaking','support','reading','listening'];
 for(const s of pattern){if(chosen.length>=n)break;pick(s);}
 if(chosen.length<n){
  tasks.filter(t=>!fs.done[t.id]&&!chosen.some(y=>y.id===t.id)).slice(0,n-chosen.length).forEach(t=>chosen.push(t));
 }
 fs.queue=chosen.map(t=>t.id);saveFlex();return chosen;
}

function taskCard(t,queue=false){
 return '<div class="flexTask '+(fs.done[t.id]?'done':'')+'">'+
   '<div><span class="skillPill '+t.skill+'">'+skillMeta[t.skill].label+'</span> <small>'+t.module+'</small><h4>'+t.title+'</h4><p>'+t.desc+'</p></div>'+
   '<div class="flexTaskActions">'+
    '<button class="btn primary" data-open="'+t.id+'">Mở bài</button>'+
    '<button class="btn '+(fs.done[t.id]?'green':'')+'" data-done="'+t.id+'">'+(fs.done[t.id]?'✓ Đã xong':'Đánh dấu hoàn thành')+'</button>'+
   '</div></div>';
}

function bindTaskButtons(root=document){
 root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openFlexTask(taskById(b.dataset.open)));
 root.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>toggleDone(b.dataset.done));
}
function toggleDone(id){
 fs.done[id]=!fs.done[id];
 if(fs.done[id])fs.queue=(fs.queue||[]).filter(x=>x!==id);
 saveFlex();renderFlexHome();renderAllModules();renderCarry();updateHero();
}
function openFlexTask(t){
 if(!t)return;
 if(t.day==='checkpoint'){openCheckpoint(t);return;}
 if(typeof window.openLesson==='function'){
  window.openLesson(t.day,t.index);
  setTimeout(()=>{
   const finish=document.getElementById('finish');
   if(finish){
    const oldFinish=finish.onclick;
    finish.onclick=function(e){
     if(oldFinish)oldFinish.call(this,e);
     fs.done[t.id]=true;fs.queue=(fs.queue||[]).filter(x=>x!==t.id);saveFlex();
     this.textContent='✓ Đã hoàn thành';
     updateHero();
    };
   }
  },0);
 }
}
function openCheckpoint(t){
 const skill=t.index,meta=skillMeta[skill],overlay=document.getElementById('lessonOverlay');
 document.getElementById('lessonTitle').innerHTML='<div class="phase">'+meta.label.toUpperCase()+' CHECKPOINT</div><h2>'+t.title+'</h2>';
 let instruction=(skill==='listening'||skill==='reading')
  ?'Làm một full '+meta.label+' test trong điều kiện thi. Không pause, không tra từ trong lúc làm. Sau khi chấm, nhập score /40 bên dưới và chữa từng lỗi.'
  :'Làm một full '+meta.label+' mock/task. Sau khi tự chấm hoặc nhận feedback, nhập band ước lượng. Quan trọng nhất là ghi 3 lỗi lặp và rewrite/re-record.';
 document.getElementById('lessonBody').innerHTML='<div class="learnBox"><h3>Mục tiêu</h3><p>'+instruction+'</p><div class="rule">Do → Score → Correct → Explain → Redo</div></div>'+
 '<div class="writeBox"><h3>Deep correction</h3><textarea class="prod" id="checkpointNotes" placeholder="Lỗi chính / evidence / điều cần sửa..."></textarea></div>'+
 '<div class="lessonActions"><button class="btn primary" id="goScoreView">Nhập kết quả</button><button class="btn green" id="checkpointDone">✓ Hoàn thành checkpoint</button></div>';
 overlay.classList.add('open');document.body.style.overflow='hidden';
 document.getElementById('goScoreView').onclick=()=>{overlay.classList.remove('open');document.body.style.overflow='';if(typeof window.show==='function')window.show(skill);document.getElementById(skill+'ScoreInput')?.focus()};
 document.getElementById('checkpointDone').onclick=()=>{fs.done[t.id]=true;fs.queue=fs.queue.filter(x=>x!==t.id);saveFlex();document.getElementById('checkpointDone').textContent='✓ Đã hoàn thành';updateHero()};
}

function renderFlexHome(){
 const card=document.getElementById('todayCard');if(!card)return;
 let [phase,desc]=phaseInfo(),q=chooseQueue(fs.queueSize,false);
 const qBtn=n=>'<button class="btn '+(fs.queueSize===n?'primary':'')+'" data-qsize="'+n+'">'+(n===2?'Nhẹ':n===4?'Vừa':'Nhiều')+' • '+n+' task</button>';
 card.innerHTML='<div class="flexHeroLine"><div><span class="phase">'+phase+'</span><h2>Study Queue linh hoạt</h2><p class="muted">'+desc+'</p></div></div>'+
 '<div class="noPressure"><b>Không có “trễ lịch”.</b> Task chưa xong hôm nay sẽ ở lại queue cho lần học tiếp theo. Bạn có thể học ít hôm nay và bù vào ngày khác mà không làm hỏng lộ trình.</div>'+
 '<div class="queueControls"><span>Chọn lượng học phù hợp hôm nay:</span>'+qBtn(2)+qBtn(4)+qBtn(6)+'<button class="btn" id="newQueue">Đổi gợi ý</button></div>'+
 '<div class="flexQueue">'+q.map(t=>taskCard(t,true)).join('')+'</div>'+
 '<div class="skillSnapshot">'+['listening','reading','writing','speaking'].map(s=>{
   let v=latestScore(s),m=skillMeta[s];
   return '<div class="snapshotCard"><b>'+m.label+' '+m.target+'</b><strong>'+pctSkill(s)+'%</strong><span>'+(v===null?'Chưa nhập checkpoint':'Gần nhất: '+v+(m.metric==='/40'?'/40':' band'))+'</span></div>';
 }).join('')+'</div>';
 bindTaskButtons(card);
 card.querySelectorAll('[data-qsize]').forEach(b=>b.onclick=()=>{
   let n=+b.dataset.qsize;
   fs.queueSize=n;
   fs.queue=[];
   saveFlex();
   let nq=chooseQueue(n,true);
   fs.queue=nq.map(x=>x.id);
   saveFlex();
   renderFlexHome();
 });
 document.getElementById('newQueue').onclick=()=>{
   fs.queue=[];
   chooseQueue(fs.queueSize,true);
   renderFlexHome();
 };
}

function scoreBox(skill){
 const m=skillMeta[skill],arr=fs.scores[skill]||[],max=skill==='listening'||skill==='reading'?40:9,step=max===40?1:.5;
 return '<div class="scoreBox"><div><h3>Checkpoint</h3><p class="muted">Không theo ngày. Khi bạn làm một full test/mock, nhập kết quả để website biết lúc nào nên chuyển mức.</p></div>'+
 '<div class="scoreEntry"><input id="'+skill+'ScoreInput" type="number" min="0" max="'+max+'" step="'+step+'" placeholder="'+(max===40?'Score /40':'Band')+'"><button class="btn primary" data-score="'+skill+'">Lưu</button></div>'+
 '<div class="scoreHistory">'+(arr.length?'5 kết quả gần nhất: '+arr.slice(-5).join(max===40?'/40 • ':' • ') +(max===40?'/40':''):'Chưa có kết quả')+'<br><b>'+scoreStatus(skill)+'</b></div></div>';
}

function renderSkill(skill){
 const el=document.getElementById(skill+'Modules');if(!el)return;
 const m=skillMeta[skill],ms=modules[skill];
 el.innerHTML='<div class="skillHead"><div><span class="phase">TARGET '+m.target+'</span><h2>'+m.label+'</h2><p class="muted">Hoàn thành theo năng lực, không theo ngày. Có thể dừng ở bất kỳ module nào và quay lại tiếp.</p></div><strong>'+pctSkill(skill)+'%</strong></div>'+
 (skill!=='support'?scoreBox(skill):'')+
 '<div class="moduleStack">'+ms.map(mod=>{
   let done=mod.tasks.filter(t=>fs.done[t[0]]).length;
   return '<div class="moduleCard"><div class="moduleHead"><div><span class="moduleId">'+mod.id+'</span><h3>'+mod.title+'</h3><p>'+mod.goal+'</p></div><b>'+done+'/'+mod.tasks.length+'</b></div>'+
    '<div>'+mod.tasks.map(t=>taskCard({skill,module:mod.id,moduleTitle:mod.title,id:t[0],title:t[1],desc:t[2],day:t[3],index:t[4]})).join('')+'</div></div>';
 }).join('')+'</div>';
 bindTaskButtons(el);
 el.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>saveScore(b.dataset.score));
}
function saveScore(skill){
 const input=document.getElementById(skill+'ScoreInput'),v=parseFloat(input.value),max=(skill==='listening'||skill==='reading')?40:9;
 if(Number.isNaN(v)||v<0||v>max)return;
 fs.scores[skill].push(v);if(fs.scores[skill].length>12)fs.scores[skill]=fs.scores[skill].slice(-12);saveFlex();renderSkill(skill);renderFlexHome();
}
function renderAllModules(){['listening','reading','writing','speaking','support'].forEach(renderSkill)}

function renderCarry(){
 const panel=document.querySelector('#view-review .panel');if(!panel)return;
 let carry=(fs.queue||[]).map(taskById).filter(Boolean).filter(t=>!fs.done[t.id]);
 panel.innerHTML='<h2>Review & Carry-over</h2><div class="noPressure"><b>Carry-over tự động:</b> những task chưa hoàn thành không biến thành “nợ”. Chúng chỉ nằm đây để bạn tiếp tục khi có thời gian.</div>'+
 '<h3>Task đang mang sang lần học tiếp theo</h3><div id="carryList">'+(carry.length?carry.map(t=>taskCard(t,true)).join(''):'<p class="muted">Không có task đang carry-over.</p>')+'</div>'+
 '<h3>Review lỗi 1–3–7</h3><p class="muted">Các lỗi từ bài luyện cũ vẫn có thể quay lại ở đây.</p><div id="reviewList"></div>';
 bindTaskButtons(panel);
 if(typeof window.renderReview==='function')window.renderReview();
}

function renderSavedFlex(){
 if(typeof window.renderSaved==='function')window.renderSaved();
}

function overrideSearch(){
 const s=document.getElementById('search');if(!s)return;
 s.oninput=e=>{
  let q=e.target.value.trim().toLowerCase();if(!q)return;
  let t=allTasks().find(x=>(x.title+' '+x.desc+' '+x.moduleTitle+' '+x.skill).toLowerCase().includes(q));
  if(t){if(typeof window.show==='function')window.show(t.skill==='support'?'support':t.skill);setTimeout(()=>{let el=document.querySelector('[data-open="'+t.id+'"]');el?.scrollIntoView({behavior:'smooth',block:'center'})},60)}
 };
}

function cleanOldLabels(){
 document.title='IELTS Flexible Skill Builder';
 const badge=document.querySelector('.hero .badge');if(badge)badge.textContent='IELTS Academic • Flexible Skill System';
}
window.renderToday=renderFlexHome;
window.renderRoadmap=function(){};
window.flexRenderHome=renderFlexHome;

renderFlexHome();
renderAllModules();
renderCarry();
renderSavedFlex();
overrideSearch();
updateHero();
cleanOldLabels();

// When returning from a legacy lesson overlay, repaint the flexible home.
const close=document.getElementById('lessonClose');
if(close){
 const old=close.onclick;
 close.onclick=function(e){if(old)old.call(this,e);setTimeout(()=>{renderFlexHome();renderAllModules();renderCarry();updateHero()},0)};
}
})();
