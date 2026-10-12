/* Screen-based Foundation flow: one activity per page, previous/next, autosave and cross-device progress. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot");
const lessons=window.GKFoundationData?.lessons||[];
const missions=window.GKFoundationMissionData?.missions||{};
const thoughts=window.GKFoundationThinkingData?.cases||{};
const wordContexts=window.GKFoundationWordContextData||{};
const API_ENDPOINT=window.location.hostname.endsWith(".vercel.app")?window.location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
if(!root||!lessons.length)return;
const lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));
const KEY="gk_foundation_flow_v1",PREV="gk_foundation_v1";
const steps=[
 ["scene",0,"A meaningful situation"],["meaning",0,"Understand the message"],["listen",0,"Listen and repeat"],
 ["vocab",1,"A word in context"],["family",1,"How word families work"],["paraphrase",1,"Paraphrase the meaning"],["ownWords",1,"Explain in your own words"],
 ["plan",2,"Plan your answer"],["write",2,"Write your answer"],["speak",2,"Practise speaking"],
 ["ai",3,"AI correction (optional)"],["detective",3,"Find a meaning error"],["retry",3,"Fix and try again"],
 ["deep",4,"Explain why it works"],["summary",4,"Transfer to a new situation"]
];
const phases=["Explore & Listen","Think & Paraphrase","Speak & Write","Check & Fix","Deep Dive"];
let loaded={};try{loaded=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(err){}
const rows=loaded.lessons||{};let lastLessonId=loaded.lastLessonId||"";
let current="",message="",checkingWord=false;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function state(id){
 if(!rows[id])rows[id]={page:0,completed:{},meaning:null,para:null,word:0,wordSentences:{},draft:"",rewrite:"",outline:"",detective:"",revision:"",explanation:"",transfer:"",finished:false};
 const r=rows[id];
 if(!r.wordFeedback||typeof r.wordFeedback!=="object")r.wordFeedback={};
 if(!r.draft){try{r.draft=JSON.parse(localStorage.getItem(PREV)||"{}")?.drafts?.[id]||""}catch(err){}}
 return r;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({lessons:rows,lastLessonId}))}catch(err){message="Could not save progress. Check browser storage."}}
function legacyDraft(id,val){try{const old=JSON.parse(localStorage.getItem(PREV)||"{}")||{};old.drafts=old.drafts||{};old.drafts[id]=val;localStorage.setItem(PREV,JSON.stringify(old))}catch(err){}}
function b(name,text,style="outline",disabled=false){return '<button type="button" data-gf-action="'+name+'" class="gf-btn '+style+'" '+(disabled?"disabled":"")+'>'+text+'</button>'}
function field(id,value,placeholder){return '<textarea data-gf-field="'+id+'" rows="4" class="gf-field" placeholder="'+esc(placeholder)+'">'+esc(value||"")+'</textarea>'}
function header(title,description){return '<div class="gf-activity-header"><h2>'+esc(title)+'</h2><p>'+esc(description)+'</p></div>'}
function quote(text){return '<div class="gf-quote" lang="en">'+esc(text)+'</div>'}
function reveal(label,text){return '<details class="gf-reveal"><summary>'+esc(label)+'</summary><p>'+esc(text)+'</p></details>'}
function choice(question,options,answer,correct,event,why){
 let html=header(question,"Choose by meaning, not by matching keywords.")+'<div class="gf-choices">';
 options.forEach((x,i)=>{const state=answer===null?"":i===correct?"correct":i===answer?"wrong":"";html+='<button type="button" data-gf-action="'+event+'" data-gf-option="'+i+'" class="'+state+'" '+(answer!==null?"disabled":"")+'><b>'+String.fromCharCode(65+i)+'</b>'+esc(x)+'</button>'});
 html+='</div>';
 if(answer!==null)html+='<div class="gf-feedback" role="status"><strong>'+(answer===correct?"✓ Meaning preserved":"The meaning has changed")+'</strong><p>'+esc(why)+'</p>'+b("try-again","Try again")+'</div>';
 return html;
}
function coach(lesson,r,kind){
 if(!window.GKFoundationCoach)return '<p>Optional AI coaching is unavailable right now. Your work remains saved.</p>';
 const widget=window.GKFoundationCoach.render(lesson);
 if(kind==="speak")return header("Say the idea to someone","Record only if you choose. Listen back before submitting to OpenAI.")+'<div class="gf-only-speech">'+widget+'</div>';
 return header("Find the most important mistake","Task relevance matters first. AI feedback may use paid API credits.")+
 '<label class="gf-label" for="foundationDraft">Your answer for checking</label><textarea id="foundationDraft" class="gf-field" data-gf-field="draft" rows="4">'+esc(r.draft)+'</textarea><div class="gf-only-writing">'+widget+'</div>';
}
function wordResult(record,answer){
 if(!record)return '<div class="gf-word-hint"><b>What gets checked?</b><p>Did you use the target word naturally? Does your sentence make sense? Is the grammar correct for your meaning?</p></div>';
 const report=record.report||{};
 const same=record.answer?.trim()===answer.trim();
 if(!same)return '<p class="gf-stale" role="status">You changed your sentence. The feedback below applies to the earlier version. Check the new version when ready.</p>'+
 '<details class="gf-reveal"><summary>Earlier AI feedback</summary><p>'+esc(report.summary_vi||report.task_feedback_vi||"Feedback available")+'</p></details>';
 const checks=Array.isArray(report.task_checks)?report.task_checks:[];
 const errors=Array.isArray(report.mistakes)?report.mistakes:[];
 let out='<section class="gf-word-report" aria-label="Sentence correction"><div class="gf-word-report-top"><span>AI PRACTICE FEEDBACK · NOT AN IELTS SCORE</span><strong>'+(report.score??"—")+'/5</strong></div>'+
 '<h3>'+esc(report.task_status==="off_topic"?"The target meaning is missing":report.task_status==="met"?"The sentence fits the task":"Review how the word is used")+'</h3>'+
 '<p>'+esc(report.summary_vi||report.task_feedback_vi||"Read the comments below and revise.")+'</p>';
 if(checks.length)out+='<div class="gf-word-criteria">'+checks.slice(0,3).map(c=>'<div><b class="'+esc(c.status||"missing")+'">'+(c.status==="met"?"✓":c.status==="partial"?"~":"!")+'</b><span>'+esc(c.criterion||"Task check")+'</span><small>'+esc(c.fix_vi||c.why_vi||"")+'</small></div>').join("")+'</div>';
 if(report.priority_fix_vi)out+='<div class="gf-word-priority"><b>FIX THIS FIRST</b><p>'+esc(report.priority_fix_vi)+'</p></div>';
 if(errors.length)out+='<details class="gf-reveal"><summary>Specific language corrections ('+errors.length+')</summary>'+errors.slice(0,4).map(x=>'<p><b>'+esc(x.original)+' → '+esc(x.correction)+'</b><span> '+esc(x.reason_vi||"")+'</span></p>').join("")+'</details>';
 if(report.corrected_answer)out+='<details class="gf-reveal"><summary>See a corrected version of YOUR sentence</summary><p lang="en">'+esc(report.corrected_answer)+'</p></details>';
 if(report.revision_question)out+='<p class="gf-word-action">'+esc(report.revision_question)+'</p>';
 out+='<p class="gf-word-action"><b>Next:</b> Edit your sentence above using the feedback, then check the changed version if you need another assessment.</p></section>';
 return out;
}
function content(lesson,r){
 const m=missions[lesson.id],t=thoughts[lesson.id],type=steps[r.page][0];if(!m||!t)return "<p>Lesson content unavailable. Refresh this page.</p>";
 if(type==="scene")return header("What is happening here?",m.scene)+quote(m.dialog)+b("hear-scene","▶ Hear the conversation","primary")+'<p class="gf-tip">First understand the purpose, not the grammar formula.</p>';
 if(type==="meaning")return choice(m.question,m.choices,r.meaning,m.correct,"answer-meaning",m.focus);
 if(type==="listen")return header("Repeat without reading","Listen once. Say the sentence from memory.")+quote(lesson.examples[0]?.[0]||m.dialog)+
 '<div class="gf-buttons">'+b("hear-example","▶ Listen","primary")+b("slow-example","🐢 Slower")+'</div>'+b("spoke","I repeated it aloud");
 if(type==="vocab"){
  const n=Math.max(0,Math.min(3,r.word||0)),w=lesson.words[n],saved=window.GKFoundationThinking?.getRecord(lesson.id)?.savedWords?.includes(w[0]);
  const example=wordContexts[lesson.id]?.[n],model=example?.[0]||t.usage[n],why=example?.[1]||t.principle;
  const answer=r.wordSentences?.[w[0]]||"",checked=r.wordFeedback?.[w[0]],currentCheck=checked?.answer?.trim()===answer.trim();
  return header("What job does this word do?","Understand the meaning, see a real example, then create and check your own sentence.")+
  '<div class="gf-vocab"><small>'+esc(t.roles[n])+'</small><h3>'+esc(w[0])+'</h3><p>'+esc(w[1])+'</p><strong lang="en">'+esc(t.usage[n])+'</strong></div>'+
  '<div class="gf-word-example"><span class="gf-kicker">EXAMPLE IN A REAL SENTENCE</span><p lang="en">'+esc(model)+'</p><button type="button" data-gf-action="hear-example-word">▶ Listen to example</button></div>'+
  '<details class="gf-reveal gf-word-why"><summary>Why is it used this way? · Giải thích cách dùng</summary><p>'+esc(why)+'</p><p><b>Word role:</b> '+esc(t.roles[n])+' · <b>Natural combination:</b> '+esc(t.usage[n])+'</p></details>'+
  '<div class="gf-buttons">'+b("hear-word","▶ Hear phrase")+b("toggle-word",saved?"✓ Saved · Remove":"☆ Save to lesson")+'</div>'+
  '<label class="gf-label">Your turn — use this word or expression in a new sentence</label>'+
  '<textarea class="gf-field" data-gf-field="wordSentence" id="gf-word-sentence" rows="3" placeholder="Write a DIFFERENT sentence about your life…">'+esc(answer)+'</textarea>'+
  '<div class="gf-word-check">'+b("check-word",checkingWord?"Checking with AI…":"✓ Check my sentence with OpenAI","primary",checkingWord)+
  '<small>Checks meaning, word choice, collocation and grammar. Requires Google sign-in; OpenAI API may cost money.</small></div>'+
  wordResult(checked,answer)+
  '<div class="gf-word-pagination">'+b("word-back","←", "outline",n===0)+'<span>Word '+(n+1)+' of 4</span>'+b("word-forward","→","outline",n===3)+'</div>';
 }
 if(type==="family"){const f=t.family;return header("Why do the word forms change?","The sentence needs different grammatical functions.")+
  '<div class="gf-pair"><div><small>'+esc(f.fromRole)+'</small><h3>'+esc(f.from)+'</h3><p>'+esc(f.fromSentence)+'</p></div><div><small>'+esc(f.toRole)+'</small><h3>'+esc(f.to)+'</h3><p>'+esc(f.toSentence)+'</p></div></div>'+reveal("Understand the reasoning",f.why);}
 if(type==="paraphrase"){const p=t.pairs[0],opts=(lesson.id.length%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent];return quote(p.source)+choice("Which sentence means the same?",opts,r.para,opts.indexOf(p.equivalent),"answer-para",p.why)}
 if(type==="ownWords")return header("Change the words, keep the idea","The time, number, people and meaning must remain the same.")+quote(t.pairs[0].source)+field("rewrite",r.rewrite,"Try a different way to say it…")+reveal("One example",t.pairs[0].equivalent);
 if(type==="plan")return header("Plan one focused answer",m.writing)+'<div class="gf-criteria">'+m.checklist.map((c,i)=>'<p><b>'+(i+1)+'</b>'+esc(c)+'</p>').join("")+'</div>'+field("outline",r.outline,"Main point, reason and example…");
 if(type==="write")return header("Write an answer of your own",m.writing)+'<label class="gf-label">Your written answer</label>'+field("draft",r.draft,"Write your answer in English…")+'<p class="gf-tip">Your draft saves automatically. You choose whether to ask AI for feedback.</p>';
 if(type==="speak"||type==="ai")return coach(lesson,r,type);
 if(type==="detective"){const p=t.pairs[1];return header("What detail changed?","Find the altered time, fact, person, quantity or logic.")+'<div class="gf-pair"><div><small>ORIGINAL</small><p>'+esc(p.source)+'</p></div><div><small>CHANGED</small><p>'+esc(p.wrong)+'</p></div></div>'+field("detective",r.detective,"The meaning changes because…")+reveal("See reasoning",p.why)}
 if(type==="retry"){
  const report=window.GKFoundationCoach?.getRecord(lesson.id)?.writing?.report;
  return header("Fix the most important problem","Rewrite using your own words. A second AI request is optional.")+
  '<div class="gf-priority"><b>PRIORITY</b><p>'+esc(report?.priority_fix_vi||"Check whether your answer meets the task and preserves meaning.")+'</p></div>'+
  field("revision",r.revision||r.draft,"Improve the answer…")+b("use-revision","Use revision and return to feedback","primary")+
  reveal("Review your original answer",r.draft);
 }
 if(type==="deep")return header("Explain the word relationship",t.principle)+quote(lesson.examples[0]?.[0]||t.pairs[0].source)+field("explanation",r.explanation,"Which word names, describes or connects something?")+reveal("See why",lesson.explain);
 if(type==="summary"){
  const ready=r.meaning===m.correct&&r.para!==null&&r.draft.trim().length>0&&r.transfer.trim().length>0;
  return header("Transfer this idea somewhere new","Show understanding with a different situation.")+quote(t.pairs[1].source)+field("transfer",r.transfer,"My own new example…")+
  '<div class="gf-final"><b>'+(ready?"Core practice ready":"More practice needed")+'</b><p>'+(ready?"Speaking and AI checking are optional.":"To finish, answer the meaning question, attempt paraphrasing, write an answer and make a final example.")+'</p></div>'+
  (ready?b("finish","Finish & return to Foundation","primary"):"")+
  '<details class="gf-reveal"><summary>Older examples and four-question quizzes</summary><p>These remain available if you need more practice.</p><button type="button" class="gf-btn outline" data-f-action="classic">Open classic lesson</button></details>';
 }
 return "";
}
function render(lesson){
 const l=typeof lesson==="string"?lessonById[lesson]:lesson;if(!l)return;
 current=l.id;lastLessonId=current;const r=state(current);r.page=Math.max(0,Math.min(steps.length-1,Number(r.page)||0));
 const phase=steps[r.page][1],percent=Math.round((r.page+1)/steps.length*100);
 const parts=phases.map((p,i)=>'<button type="button" data-gf-phase="'+i+'" class="'+(i===phase?"selected":"")+'">'+String(i+1).padStart(2,"0")+' · '+esc(p)+'</button>').join("");
 root.innerHTML='<div class="gf-shell"><header class="gf-top">'+b("exit","← Foundation lessons","text")+'<div class="gf-title"><small>'+esc(l.level)+' · '+esc(l.skill)+'</small><h1>'+esc(l.title)+'</h1></div>'+
 '<div class="gf-count"><span>'+esc(phases[phase])+'</span><strong>Page '+(r.page+1)+' of '+steps.length+'</strong></div>'+
 '<div class="gf-progress" role="progressbar" aria-label="Screens visited" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+(r.page+1)+'"><span style="width:'+percent+'%"></span></div>'+
 '<div class="gf-phases" role="group" aria-label="Five learning phases">'+parts+'</div></header>'+
 '<section class="gf-focus"><div class="gf-small"><span>ACTIVITY '+String(r.page+1).padStart(2,"0")+'</span><span>'+esc(phases[phase])+'</span></div>'+
 '<h2 tabindex="-1" class="gf-screen-heading">'+esc(steps[r.page][2])+'</h2><div class="gf-task-body">'+content(l,r)+'</div>'+
 (message?'<p class="gf-notice" role="status">'+esc(message)+'</p>':"")+'</section>'+
 '<footer class="gf-footer"><div class="gf-nav">'+b("previous","← Previous","outline",r.page===0)+b("next","Next →","primary",r.page===steps.length-1)+'</div><div class="gf-footnote"><span>'+Object.keys(r.completed).length+' activities practised · clicking Next never means mastered</span>'+b("exit","Save & Exit","text")+'</div></footer></div>';
 save();
}
async function checkWord(){
 if(checkingWord||!current)return;
 const id=current,r=state(id),lesson=lessonById[id],idx=Math.max(0,Math.min(3,r.word||0)),word=lesson.words[idx]?.[0];
 const answer=String(r.wordSentences?.[word]||"").trim(),detail=wordContexts[id]?.[idx],role=thoughts[id]?.roles[idx],phrase=thoughts[id]?.usage[idx];
 if(answer.length<8){message="Write one meaningful English sentence before checking.";render(lesson);return;}
 const prev=r.wordFeedback[word];
 if(prev?.answer?.trim()===answer){message="This version has already been checked. Edit it before spending another OpenAI request.";render(lesson);return;}
 if(!window.GKCloudSync?.getIdToken){message="Sign in with Google using Save across devices to get OpenAI corrections.";render(lesson);return;}
 if(!window.confirm("Send this sentence to OpenAI for contextual corrections? Each request may incur separate OpenAI API charges."))return;
 checkingWord=true;message="Checking your sentence…";render(lesson);
 try{
  const token=await window.GKCloudSync.getIdToken();
  const request={
   mode:"writing",level:lesson.level,task:'Write ONE new meaningful English sentence using the target vocabulary "'+word+'" correctly for its role and context.',
   goal:"Check whether the chosen word or appropriate inflected form is used with the intended meaning, grammar and natural collocation. Do not reward a grammatical sentence that fails to use the target expression.",
   scenario:"This lesson is "+lesson.title+". Target word: "+word+". Grammatical job: "+role+". Natural collocation: "+phrase+".",
   example:detail?.[0]||phrase,
   meaningFocus:detail?.[1]||thoughts[id]?.principle||"",
   checklist:["Uses the target word or a valid inflected form with correct meaning","Uses natural grammar and word combinations","Forms a complete, meaningful original English sentence"],
   answer,revisionOf:prev?.answer||""
  };
  const response=await fetch(API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(request)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"AI correction unavailable (HTTP "+response.status+")");
  if(data.source!=="openai-foundation")throw new Error("Invalid response from the grading service");
  // Keep feedback for the submitted word even when the learner switches words while awaiting a response.
  r.wordFeedback[word]={answer,report:data,at:new Date().toISOString()};
  r.completed.vocab=true;save();
  message="Correction ready. Revise your sentence and check again only when needed.";
 }catch(error){message="Sentence checking failed: "+String(error?.message||"Network error");}
 finally{checkingWord=false;if(current===id&&steps[state(id).page][0]==="vocab")render(lesson);}
}
function move(to){
 if(!current)return;const r=state(current),index=Math.min(steps.length-1,Math.max(0,to));if(index===r.page)return;
 if(["speak","ai"].includes(steps[r.page][0]))window.GKFoundationCoach?.leave();
 r.page=index;message="";save();render(lessonById[current]);try{root.scrollIntoView({block:"start",behavior:"smooth"})}catch(err){}
}
function speak(text,slow){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){message="Audio playback is unavailable.";return}
 try{window.speechSynthesis.cancel();const u=new window.SpeechSynthesisUtterance(text);u.lang="en-NZ";u.rate=slow?.77:.9;window.speechSynthesis.speak(u)}catch(err){message="Could not play audio."}
}
root.addEventListener("click",ev=>{
 const node=ev.target.closest("button");if(!node||!root.contains(node)||!current)return;
 if(node.dataset.gfPhase!==undefined){const i=Number(node.dataset.gfPhase);const first=steps.findIndex(x=>x[1]===i);if(first>=0)move(first);return}
 const act=node.dataset.gfAction;if(!act)return;
 const r=state(current),l=lessonById[current],m=missions[current],t=thoughts[current],type=steps[r.page][0];
 if(act==="next"){move(r.page+1);return}if(act==="previous"){move(r.page-1);return}
 if(act==="exit"){window.GKFoundationCoach?.leave();window.GKFoundationOpenHome?.();return}
 if(act==="hear-scene"){speak(m.dialog);r.completed.scene=true;save();return}
 if(act==="hear-example"||act==="slow-example"){speak(l.examples[0]?.[0]||m.dialog,act==="slow-example");r.completed.listen=true;save();return}
 if(act==="spoke"){r.completed.listen=true;save();render(l);return}
 if(act==="try-again"){if(type==="meaning")r.meaning=null;else r.para=null;save();render(l);return}
 if(act==="answer-meaning"&&r.meaning===null){r.meaning=Number(node.dataset.gfOption);if(r.meaning===m.correct)r.completed.meaning=true;save();render(l);return}
 if(act==="answer-para"&&r.para===null){r.para=Number(node.dataset.gfOption);const p=t.pairs[0],opts=(l.id.length%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent];if(opts[r.para]===p.equivalent)r.completed.paraphrase=true;save();render(l);return}
 if(act==="word-back"||act==="word-forward"){r.word=Math.max(0,Math.min(3,r.word+(act==="word-forward"?1:-1)));save();render(l);return}
 if(act==="hear-word"){speak(t.usage[r.word]);r.completed.vocab=true;save();return}
 if(act==="hear-example-word"){speak(wordContexts[current]?.[r.word]?.[0]||t.usage[r.word]);return}
 if(act==="check-word"){void checkWord();return}
 if(act==="toggle-word"){window.GKFoundationThinking?.toggleWord?.(current,l.words[r.word][0]);r.completed.vocab=true;save();render(l);return}
 if(act==="use-revision"){if(!r.revision.trim()){message="Write a revision before submitting again.";render(l);return}r.draft=r.revision;legacyDraft(current,r.draft);r.completed.retry=true;save();move(10);return}
 if(act==="finish"){if(r.meaning!==m.correct||r.para===null||!r.draft.trim()||!r.transfer.trim())return;r.finished=true;r.completed.summary=true;save();window.GKFoundationOpenHome?.();return}
});
root.addEventListener("input",ev=>{
 if(!current||!ev.target?.dataset)return;const r=state(current),key=ev.target.dataset.gfField;
 if(key==="wordSentence"){const w=lessonById[current].words[r.word][0];r.wordSentences[w]=ev.target.value;if(ev.target.value.trim())r.completed.vocab=true;save();return}
 if(["rewrite","outline","draft","detective","revision","explanation","transfer"].includes(key)){
 r[key]=ev.target.value;if(key==="draft")legacyDraft(current,r.draft);
 if(r[key].trim())r.completed[steps[r.page][0]]=true;save();
 }
 if(ev.target.id==="foundationDraft"){r.draft=ev.target.value;legacyDraft(current,r.draft);save()}
});
window.GKFoundationFlow={render,open:render,getState:state,getLastLessonId:()=>lastLessonId,screenCount:steps.length};
})();