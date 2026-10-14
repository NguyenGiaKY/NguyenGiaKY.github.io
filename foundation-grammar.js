/* English Foundation A1/A2 Grammar Reasoning Studio. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),topics=window.GKFoundationGrammarData?.topics||[];
if(!root||!topics.length)return;
const index=Object.fromEntries(topics.map(t=>[t.id,t])),KEY="gk_foundation_grammar_v1";
let store={};try{store=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=store.records&&typeof store.records==="object"?store.records:{};
let current="",page=0,choice=null,loading=false,message="";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(action,label,primary=false,disabled=false)=>'<button type="button" data-fg-action="'+action+'" class="fa-btn '+(primary?"fa-primary":"")+'" '+(disabled?"disabled":"")+'>'+label+'</button>';
function row(id){if(!records[id])records[id]={draft:"",quiz:null,feedback:null};return records[id]}
function save(){try{localStorage.setItem(KEY,JSON.stringify({records,last:current}))}catch(e){message="Unable to save this learning progress."}}
function homePanel(){
 const tried=topics.filter(t=>records[t.id]&&(records[t.id].quiz||String(records[t.id].draft||"").trim())).length;
 return '<section class="fa-home fa-grammar-intro"><div class="fa-home-heading"><div><small>A1–A2 · GRAMMAR REASONING</small><h3>Giải thích vì sao một câu tiếng Anh đúng</h3><p>'+topics.length+' chủ điểm: chức năng của từ, khác biệt về nghĩa, lỗi thường gặp và tự tạo câu mới. Học hiểu trước khi học thuộc mẫu.</p></div><div class="fa-count">'+tried+'/'+topics.length+'<small>đã thực hành</small></div></div><div class="fa-home-actions">'+
 '<button type="button" data-f-action="grammar" class="f-btn primary">Mở Grammar Reasoning →</button>'+
 '<span class="fa-home-meta">Không tính 1 câu trắc nghiệm đúng là thành thạo.</span></div></section>';
}
function open(id){
 if(!index[id])return;current=id;page=0;choice=row(id).quiz?.choice??null;message="";render();root.scrollIntoView?.({block:"start",behavior:"smooth"});
}
function list(){
 current="";page=0;message="";
 const parts=["A1","A2"].map(level=>'<section class="fa-level"><h2>'+level+' · Why English works</h2><div class="fa-cards">'+topics.filter(t=>t.level===level).map(t=>{
  const r=row(t.id);return '<button type="button" class="fa-unit" data-fg-id="'+t.id+'"><small>'+level+' · '+(r.quiz?"1 check recorded":r.draft?"Own sentence written":"Not started")+'</small><strong>'+esc(t.title)+'</strong><span>'+esc(t.scenario)+'</span><em>Explore →</em></button>';
 }).join("")+'</div></section>').join("");
 root.innerHTML='<div class="fa-shell"><div class="fa-top">'+btn("home","← Foundation home")+'<h1>Grammar Reasoning A1–A2</h1><p>Không nhồi công thức. Mỗi bài: hiểu tình huống → so sánh sự thay đổi nghĩa → Check → tự tạo câu.</p><p class="fa-tip">Nguồn đối chiếu bên ngoài: <a target="_blank" rel="noopener noreferrer" href="https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2">British Council A1–A2 Grammar ↗</a>. Các chủ điểm tại đây là nội dung thực hành của website, không phải bài kiểm tra CEFR chính thức.</p></div>'+parts+'</div>';
}
function feedback(r){
 if(!r.feedback?.report)return"";
 if(r.feedback.answer!==String(r.draft||"").trim())return'<p class="fa-tip">Bạn đã sửa câu trả lời; phản hồi cũ không còn áp dụng.</p>';
 const x=r.feedback.report;
 return '<div class="fa-ai-report"><small>Automated practice feedback, not CEFR certification</small><p>'+esc(x.summary_vi||"")+'</p>'+
 (x.priority_fix_vi?'<p class="fa-priority"><b>Fix this first:</b> '+esc(x.priority_fix_vi)+'</p>':"")+
 (x.task_checks||[]).slice(0,3).map(a=>'<p><b>'+esc(a.criterion)+'</b> · '+esc(a.status)+" — "+esc(a.fix_vi||"")+'</p>').join("")+'</div>';
}
function render(){
 if(!current)return list();
 const t=index[current],r=row(current);
 let body="";
 if(page===0)body='<div class="fa-situation"><small>UNDERSTAND THE CONTEXT</small><h3>'+esc(t.scenario)+'</h3></div>'+
 '<div class="fa-contrast"><h3>Why it works</h3><p>'+esc(t.why)+'</p></div>'+
 '<div class="fa-example good"><small>Natural use</small><p lang="en">'+esc(t.good)+'</p></div>'+
 '<div class="fa-example bad"><small>Common problem</small><p lang="en">'+esc(t.bad)+'</p><p class="fa-tip">'+esc(t.contrast)+'</p></div>'+
 btn("hear","▶ Listen to the correct sentence");
 if(page===1)body='<h3>Check the meaning, not just the label</h3><p>'+esc(t.question)+'</p>'+
 '<fieldset class="fa-question"><legend>Choose one meaningful answer</legend>'+
 t.options.map((o,i)=>'<button type="button" class="fa-option '+(r.quiz?(i===t.correct?"correct":i===choice?"wrong":""):"")+'" data-fg-opt="'+i+'" aria-pressed="'+(i===choice)+'" '+(r.quiz?"disabled":"")+'><b>'+String.fromCharCode(65+i)+'</b> '+esc(o)+'</button>').join("")+'</fieldset>'+
 (r.quiz?'<div class="fa-feedback"><b>'+(r.quiz.correct?"Correct":"Review this rule")+'</b> · '+esc(t.reason)+'</div>'+
 '<p class="fa-tip">Bài này chỉ có một câu kiểm tra nhận biết. Muốn kiểm chứng khả năng dùng phải tự viết/nói, làm đề mới và ôn sau một thời gian.</p>'+btn("retry","Practise this question again"):
 btn("quiz","Check",true,choice===null));
 if(page===2)body='<h3>Use it independently</h3><p class="fa-transfer">'+esc(t.transfer)+'</p><p class="fa-tip">Tự tạo nội dung có ý nghĩa; đừng chép nguyên câu mẫu. Bạn có thể so sánh với giải thích ở màn đầu.</p>'+
 '<label for="fg-draft"><b>Your answer in English</b></label><textarea class="fa-grammar-draft" id="fg-draft" data-fg-field="draft" maxlength="4000" rows="6" placeholder="Write an original English answer…">'+esc(r.draft||"")+'</textarea>'+
 btn("writing","Check",true,loading||String(r.draft||"").trim().length<10)+feedback(r)+
 '<p class="fa-tip">Không cần hoàn tất chấm AI để lưu câu của bạn; phản hồi được gửi khi bấm Check. Nếu Check không hoạt động, bạn vẫn có thể xem quy tắc và luyện với giáo viên.</p>';
 root.innerHTML='<div class="fa-shell"><header class="fa-top"><div class="fa-nav">'+btn("list","← All grammar topics")+'<span>'+esc(t.level)+' · '+esc(t.title)+'</span></div><h1>'+(page===0?"Understand":page===1?"Think & Check":"Transfer & Fix")+'</h1><p>'+esc(t.title)+'</p><div class="fa-bar"><span style="width:'+Math.round((page+1)/3*100)+'%"></span></div><small>Activity '+(page+1)+' / 3 · Navigation is not mastery</small></header><main class="fa-main fa-grammar-main">'+body+(message?'<p class="fa-status" role="status">'+esc(message)+'</p>':"")+'</main><footer class="fa-nav fa-footer">'+btn("prev","← Previous",false,page===0)+(page===2?btn("list","Save & return",true):btn("next","Next →",true))+'</footer></div>';
}
function evaluate(){
 const t=index[current],r=row(current);if(r.quiz||!Number.isInteger(choice))return;
 r.quiz={choice,correct:choice===t.correct,at:new Date().toISOString()};save();render();
}
async function writingCheck(){
 if(loading||!current)return;
 const id=current,t=index[id],r=row(id),answer=String(r.draft||"").trim();
 if(answer.length<10)return;
 if(r.feedback?.answer===answer){message="Revise your answer before repeating Check.";render();return}
 if(!window.GKCloudSync?.getIdToken){message="Check requires authorised Google sign-in. Your draft stays saved.";render();return}
 loading=true;message="Checking…";render();
 try{
  const token=await window.GKCloudSync.getIdToken();if(!token)throw Error("Sign in to use Check");
  const payload={mode:"writing",level:t.level,goal:"Use the grammar contrast accurately in a meaningful, relevant original answer",scenario:t.scenario,
  task:t.transfer,meaningFocus:t.why+" "+t.contrast,checklist:["Sentence is relevant to the task","Grammar communicates the intended meaning","Original example is understandable"],example:t.good,answer,revisionOf:r.feedback?.answer||""};
  const url=location.hostname.endsWith(".vercel.app")?location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
  const resp=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const data=await resp.json().catch(()=>({}));if(!resp.ok)throw Error(data.error||"Check unavailable");
  if(data.source!=="openai-foundation")throw Error("Unexpected response");
  r.feedback={answer,report:{task_status:data.task_status,summary_vi:String(data.summary_vi||"").slice(0,900),priority_fix_vi:String(data.priority_fix_vi||"").slice(0,550),task_checks:(data.task_checks||[]).slice(0,3).map(x=>({criterion:String(x.criterion||"").slice(0,120),status:String(x.status||""),fix_vi:String(x.fix_vi||x.why_vi||"").slice(0,240)}))},at:new Date().toISOString()};
  save();message="Practice feedback ready. Correct the main error before trying again.";
 }catch(e){message="Check unavailable: "+String(e?.message||"connection error")}
 finally{loading=false;if(current===id)render()}
}
function hear(){
 const t=index[current];
 if(window.GKYVoice?.playConversation){const out=window.GKYVoice.playConversation([{speaker:"Tutor",text:t.good}],{locale:"en-NZ",rate:.88});if(!out?.ok){message="Browser voice unavailable.";render()}}
 else{message="Audio playback unavailable.";render()}
}
root.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b||!root.contains(b))return;
 if(b.dataset.fgId){open(b.dataset.fgId);return}
 if(!current&&b.dataset.fgAction!=="home")return;
 const opt=b.dataset.fgOpt;if(opt!==undefined){if(!row(current).quiz){choice=Number(opt);render()}return}
 const a=b.dataset.fgAction;if(!a)return;
 if(a==="home"){current="";window.GKFoundationOpenHome?.();return}
 if(a==="list"){list();return}
 if(a==="prev"){page=Math.max(0,page-1);message="";render();return}
 if(a==="next"){page=Math.min(2,page+1);message="";render();return}
 if(a==="quiz"){evaluate();return}
 if(a==="retry"){row(current).quiz=null;choice=null;save();message="This repeats a known question and is not a new assessment.";render();return}
 if(a==="writing"){void writingCheck();return}
 if(a==="hear"){hear();return}
});
root.addEventListener("input",e=>{if(!current||e.target.dataset?.fgField!=="draft")return;row(current).draft=e.target.value.slice(0,4000);save()});
window.GKFoundationGrammar={render,open,list,homePanel,topics,record:row};
})();