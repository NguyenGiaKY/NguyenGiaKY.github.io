/* Screen-based Foundation flow: one activity per page, previous/next, autosave and cross-device progress. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot");
const lessons=window.GKFoundationData?.lessons||[];
const missions=window.GKFoundationMissionData?.missions||{};
const voiceScenes=window.GKFoundationScenes||{};
const thoughts=window.GKFoundationThinkingData?.cases||{};
const wordContexts=window.GKFoundationWordContextData||{};
const API_ENDPOINT=window.location.hostname.endsWith(".vercel.app")?window.location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
if(!root||!lessons.length)return;
const lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));
const KEY="gk_foundation_flow_v1",PREV="gk_foundation_v1";
const WORD_REPORT_KEYS={A0:"gk_foundation_word_feedback_a0_v1",A1:"gk_foundation_word_feedback_a1_v1",A2:"gk_foundation_word_feedback_a2_v1",Bridge:"gk_foundation_word_feedback_bridge_v1"};
const wordReports={};
for(const [level,key] of Object.entries(WORD_REPORT_KEYS)){try{wordReports[level]=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(err){wordReports[level]={};}}
const steps=[
 ["scene",0,"A meaningful situation"],["meaning",0,"Understand the message"],["listen",0,"Listen and repeat"],
 ["vocab",1,"A word in context"],["family",1,"How word families work"],["paraphrase",1,"Paraphrase the meaning"],["ownWords",1,"Explain in your own words"],
 ["plan",2,"Plan your answer"],["write",2,"Write your answer"],["speak",2,"Practise speaking"],
 ["ai",3,"Understand and fix the mistake"],["detective",3,"Find a meaning error"],["retry",3,"Fix and try again"],
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
 const level=lessonById[id]?.level;
 if(level&&wordReports[level]){
  if(!wordReports[level][id]&&r.wordFeedback&&typeof r.wordFeedback==="object")wordReports[level][id]=r.wordFeedback;
  if(!wordReports[level][id])wordReports[level][id]={};
  r.wordFeedback=wordReports[level][id];
 }else if(!r.wordFeedback||typeof r.wordFeedback!=="object")r.wordFeedback={};
 if(!r.draft){try{r.draft=JSON.parse(localStorage.getItem(PREV)||"{}")?.drafts?.[id]||""}catch(err){}}
 return r;
}
function save(){try{
  // Keep short learner progress separate from per-word AI feedback, so each Firebase document stays well below the 45 KB security limit.
  const lean={};for(const [id,r] of Object.entries(rows)){const {wordFeedback,...rest}=r;lean[id]=rest;}
  localStorage.setItem(KEY,JSON.stringify({lessons:lean,lastLessonId}));
  for(const [level,key] of Object.entries(WORD_REPORT_KEYS)){
   const reports=wordReports[level]||{};
   if(Object.keys(reports).length)localStorage.setItem(key,JSON.stringify(reports));
  }
 }catch(err){message="Could not save progress. Check browser storage."}}
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
function wordResult(record,answer,kind="vocabulary"){
 if(!record)return '<div class="gf-word-hint"><b>What gets checked?</b><p>Did you use the target word naturally? Does your sentence make sense? Is the grammar correct for your meaning?</p></div>';
 const report=record.report||{};
 const same=record.answer?.trim()===answer.trim();
 const meaningTask=kind!=="vocabulary";
 if(!same)return '<p class="gf-stale" role="status">You changed your sentence. The feedback below applies to the earlier version. Check the new version when ready.</p>'+
 '<details class="gf-reveal"><summary>Earlier AI feedback</summary><p>'+esc(report.summary_vi||report.task_feedback_vi||"Feedback available")+'</p></details>';
 const checks=Array.isArray(report.task_checks)?report.task_checks:[];
 const errors=Array.isArray(report.mistakes)?report.mistakes:[];
 let out='<section class="gf-word-report" aria-label="Sentence correction"><div class="gf-word-report-top"><span>AI PRACTICE FEEDBACK · NOT AN IELTS SCORE</span><strong>'+(report.score??"—")+'/5</strong></div>'+
 '<h3>'+esc(report.task_status==="off_topic"?(meaningTask?"The explanation misses the task":"The target meaning is missing"):report.task_status==="met"?(meaningTask?"The explanation addresses the task":"The sentence fits the task"):(meaningTask?"Review your reasoning":"Review how the word is used"))+'</h3>'+
 '<p>'+esc(report.summary_vi||report.task_feedback_vi||"Read the comments below and revise.")+'</p>';
 if(checks.length)out+='<details class="gf-reveal"><summary>Review '+checks.length+' task criteria</summary><div class="gf-word-criteria">'+checks.slice(0,3).map(c=>'<div><b class="'+esc(c.status||"missing")+'">'+(c.status==="met"?"✓":c.status==="partial"?"~":"!")+'</b><span>'+esc(c.criterion||"Task check")+'</span><small>'+esc(c.fix_vi||c.why_vi||"")+'</small></div>').join("")+'</div></details>';
 if(report.priority_fix_vi)out+='<div class="gf-word-priority"><b>FIX THIS FIRST</b><p>'+esc(report.priority_fix_vi)+'</p></div>';
 if(errors.length)out+='<details class="gf-reveal"><summary>Specific language corrections ('+errors.length+')</summary>'+errors.slice(0,4).map(x=>'<p><b>'+esc(x.original)+' → '+esc(x.correction)+'</b><span> '+esc(x.reason_vi||"")+'</span></p>').join("")+'</details>';
 if(report.corrected_answer)out+='<details class="gf-reveal"><summary>See a corrected version of YOUR sentence</summary><p lang="en">'+esc(report.corrected_answer)+'</p></details>';
 if(report.revision_question)out+='<p class="gf-word-action">'+esc(report.revision_question)+'</p>';
 out+='<p class="gf-word-action"><b>Next:</b> Edit your sentence above using the feedback, then check the changed version if you need another assessment.</p></section>';
 return out;
}
const FREE_RESPONSE_KEYS={detective:"__detective__",explanation:"__explanation__",transfer:"__transfer__",errorFix:"__errorFix__"};
function freeCheckPanel(r,kind,help){
 const feedback=r.wordFeedback?.[FREE_RESPONSE_KEYS[kind]];
 const answer=String(r[kind]||"");
 return '<div class="gf-word-check">'+b("check-"+kind,checkingWord?"Checking…":"Check","primary",checkingWord)+
 '<small>'+esc(help||"")+' AI checks are requested only when you press Check.</small></div>'+
 (feedback?wordResult(feedback,answer,kind):'<div class="gf-word-hint"><b>Not checked yet</b><p>Write your explanation, then press Check for a personal response. Revealing the example is not grading.</p></div>');
}
function responseRubric(id,kind){
 const l=lessonById[id],t=thoughts[id],m=missions[id],g=window.GKFoundationGuides?.[id]||{},sample=l.examples?.[0]?.[0]||t.pairs[0].source;
 if(kind==="detective"){
  const pair=t.pairs[1];
  return {task:"Explain what changed in meaning between these two sentences. ORIGINAL: "+pair.source+" CHANGED: "+pair.wrong,
   goal:"This is a meaning comprehension question, not an English grammar test. Accept clear correct explanations in Vietnamese OR English. Check exact meaning changed: quantity, time, people, negation or fact. Distinguish changed detail from merely rephrasing the sentences.",
   meaningFocus:pair.why,example:pair.equivalent,
   checklist:["Names the exact detail changed","Explains the original and altered meanings accurately","Explains why the two sentences are not equivalent"]};
 }
 if(kind==="explanation")return {task:"Explain why the key English word or relationship works in this example: "+sample,
  goal:"Assess understanding of grammatical function and meaning in the example. Accept Vietnamese or English. Do not require grammar terminology if their reasoning correctly describes the function.",
  meaningFocus:t.principle+" "+l.explain,example:sample,
  checklist:["Identifies the relevant word or relationship","Explains its role correctly","Links the explanation to this actual sentence"]};
 if(kind==="errorFix")return {task:"Correct the error in this sentence: "+g.commonError,
  goal:"Judge whether the corrected sentence fixes the specific mistake, preserving meaning. A0 can use very short correct sentences. Answer should be an English correction, not just a description of grammar.",
  meaningFocus:g.correction,example:g.model,
  checklist:["Corrects the specific target mistake","Preserves the intended meaning","Produces a complete correct English sentence"]};
 if(kind==="transfer"&&id==="a0-01")return {
  task:"You meet a NEW student: introduce your own name and a different object you are carrying in TWO English sentences.",
  goal:"Assess accurate communication for a beginning learner. Require both self-introduction and pointing to an object. A very short grammatically correct answer is enough; do not assess pronunciation from text.",
  meaningFocus:"Use I'm/My name is for a person, and This is my/a/an for an object.",
  example:"I'm Lin. This is my pencil.",
  checklist:["Introduces the speaker","Names a new object","Forms two meaningful basic English sentences"]
 };
 return {task:"Create a NEW English example to demonstrate this concept: "+t.principle+". Learner has already seen: "+t.pairs[1].source,
  goal:"Check that the student's NEW example applies the lesson concept meaningfully. Do not demand copying the original sentence. Require English for this production task.",
  meaningFocus:g.transfer||t.contrast,example:g.model||t.pairs[0].equivalent,
  checklist:["Applies the target concept accurately","Creates a meaningful original English example","Uses understandable vocabulary and grammatical form"]};
}
async function checkFreeResponse(kind){
 if(checkingWord||!current||!FREE_RESPONSE_KEYS[kind])return;
 const id=current,l=lessonById[id],r=state(id),answer=String(r[kind]||"").trim(),key=FREE_RESPONSE_KEYS[kind];
 if(answer.length<5){message="Write a short explanation first, then press Check.";render(l);return;}
 if(answer.length>360){message="Keep this explanation under 360 characters, then Check.";render(l);return;}
 const prev=r.wordFeedback[key];
 if(prev?.answer===answer){message="This exact answer has already been checked. Change your answer to request another check.";render(l);return;}
 if(!window.GKCloudSync?.getIdToken){message="Sign in to save progress and use personal corrections.";render(l);return;}
 const criteria=responseRubric(id,kind);
 checkingWord=true;message="Checking your answer…";render(l);
 try{
  const token=await window.GKCloudSync.getIdToken();
  const request={mode:"writing",level:l.level,scenario:"Foundation "+l.title+", activity "+kind,
   task:criteria.task,goal:criteria.goal,meaningFocus:criteria.meaningFocus,example:criteria.example,
   checklist:criteria.checklist,answer,revisionOf:prev?.answer||""};
  const response=await fetch(API_ENDPOINT,{method:"POST",
   headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(request)});
  const report=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(report.error||"Checking is temporarily unavailable (HTTP "+response.status+")");
  if(report.source!=="openai-foundation")throw Error("Invalid grading response");
  r.wordFeedback[key]={answer:answer.slice(0,360),report:compactWordReport(report),at:new Date().toISOString()};
  // A typed answer is an attempt. A checked response is graded; a successful result is marked separately.
  r.verified=r.verified||{};
  r.verified[kind]={status:report.task_status||"unclear",score:report.score??null,at:new Date().toISOString()};
  save();message="Checked. Read the specific correction, revise and try again.";
 }catch(error){message="Could not check your answer: "+String(error?.message||error);}
 finally{checkingWord=false;if(current===id&&["detective","deep","summary","ai"].includes(steps[state(id).page][0]))render(l);}
}

const a001Checks=[
 [
  {question:"At a new school, someone asks your name. What can you say?",answers:["This is a desk.","I'm Lin.","My book is blue."],correct:1,why:"I'm plus a name introduces the speaker.",fix:"Review the example I'm ... on the first lesson screen."},
  {question:"You show a pencil to your teacher. Which sentence identifies it?",answers:["This is my pencil.","My name is pencil.","I'm pencil."],correct:0,why:"This is my ... introduces an object, not a person.",fix:"Point to a real object and practise This is my ... ."}
 ],
 [
  {question:"A librarian asks 'What's your name?' Which answer fits?",answers:["This is my bag.","My name is Mai.","Hello, I have a bag."],correct:1,why:"My name is ... tells the listener your name.",fix:"Practise a short exchange introducing your name."},
  {question:"Someone asks 'What's this?' while pointing to your water bottle. What fits?",answers:["I'm a water bottle.","My name water.","This is my water bottle."],correct:2,why:"This is my ... identifies the object.",fix:"Return to the lesson's This is my ... pattern, then change the object."}
 ]
];
function a001Checkpoint(r){
 const c=r.checkpoint||(r.checkpoint={variant:0,answers:[null,null],checked:false,passed:false,attempts:0});
 const qs=a001Checks[c.variant||0],a=Array.isArray(c.answers)?c.answers:[null,null];
 let h=header("Independent practice: a new school situation","Answer two new meaning questions. This checks understanding in these examples, not an A1/A2 level or your pronunciation.");
 qs.forEach((q,i)=>{
  h+='<div class="gf-task-criteria"><p><strong>'+(i+1)+'. '+esc(q.question)+'</strong></p><div class="gf-choices">';
  q.answers.forEach((opt,j)=>{
   const cls=c.checked?(j===q.correct?"correct":a[i]===j?"wrong":""):"";
   h+='<button type="button" data-gf-action="pilot-answer" data-gf-question="'+i+'" data-gf-option="'+j+'" class="'+cls+'" '+(c.checked?"disabled":"")+' aria-pressed="'+(a[i]===j)+'><b>'+String.fromCharCode(65+j)+'</b>'+esc(opt)+'</button>';
  });
  h+='</div>';
  if(c.checked)h+='<p class="gf-feedback"><b>'+(a[i]===q.correct?"Correct.":"Review needed.")+'</b> '+esc(q.why)+(a[i]===q.correct?"":' '+esc(q.fix))+'</p>';
  h+='</div>';
 });
 if(!c.checked)h+=b("pilot-check","Check","primary",a.some(v=>v===null));
 else if(!c.passed)h+=b("pilot-retry","Review and try a different situation","outline");
 else h+='<p class="gf-feedback">2/2 meaning questions correct. This is recognition practice, not a language proficiency certificate.</p>';
 h+=header("Write your own introduction","A new student asks who you are and what item you are carrying. Write two short sentences. Change the name and object from the model.")+
 field("transfer",r.transfer,"I'm ... . This is my ... .")+
 freeCheckPanel(r,"transfer","Check looks at your TWO sentences and the new situation. Audio pronunciation is not assessed here.");
 const reply=String(r.transfer||"").trim();
 const record=r.wordFeedback?.__transfer__;
 const verified=record?.answer?.trim()===reply&&record?.report?.task_status==="met";
 const ready=!!c.passed&&r.meaning===missions["a0-01"].correct&&String(r.draft||"").trim().length>=8&&reply.length>=15;
 h+='<div class="gf-final"><b>'+(ready?"Practice attempted — not automatically mastered":"Finish the evidence tasks")+'</b><p>'+
 (ready?"You answered the contextual choices and wrote an independent response. "+(verified?"Your current response also met the automated rubric.":"The open response is not yet verified; review and correct it when possible.")+" Spoken ability is not certified.":
 "Answer both questions correctly, complete the earlier meaning task, and write the lesson response plus two independent sentences. Clicking through pages alone is not enough.")+'</p></div>';
 if(ready)h+=b("finish","Save practice & return","primary");
 return h;
}

function content(lesson,r){
 const m=missions[lesson.id],t=thoughts[lesson.id],type=steps[r.page][0];if(!m||!t)return "<p>Lesson content unavailable. Refresh this page.</p>";
 if(type==="scene"){
  const turns=voiceScenes[lesson.id]||[{speaker:window.GKYVoice?.inferSpeaker(m.dialog,"Narrator")||"Narrator",text:m.dialog}];
  const people=[...new Set(turns.map(x=>x.speaker))],multi=people.length>1;
  const cast=multi?window.GKYVoice?.planSpeakers?.(turns,"en-NZ"):null;
  return header("Listen for the meaning",m.scene)+
    '<div class="gf-scene-turns">'+turns.map((turn,i)=>'<div class="gf-scene-turn '+(i%2?'alt':'')+'"><span class="gf-character">'+esc(turn.speaker)+'</span><p lang="en">'+esc(turn.text)+'</p></div>').join("")+'</div>'+
    b("hear-scene","▶ "+(multi?"Play the conversation":"Listen to the speaker"),"primary")+
    (multi?'<details class="gf-cast-settings"><summary>🎙️ Change or preview character voices</summary>'+
    '<p>Available voices depend on your computer or phone. Listen first, then choose two voices that are genuinely easy to distinguish.</p>'+
    '<div class="gf-cast-grid"><label>Anna / Mia / Emma<select data-gf-character="F">'+(window.GKYVoice?.castOptions?.("F")||'<option>Default English voice</option>')+'</select></label>'+
    b("preview-female","▶ Preview Anna")+
    '<label>Leo / Daniel<select data-gf-character="M">'+(window.GKYVoice?.castOptions?.("M")||'<option>Default English voice</option>')+'</select></label>'+
    b("preview-male","▶ Preview Leo")+'</div></details>':'')+
    '<p class="gf-tip">'+(multi?(cast?.genderCoverage&&cast?.distinct?"Characters have separate, matching voices.":"If the voices still sound alike, open the voice picker and listen to both before studying."):"This is one person speaking; no extra speaker is added.")+' Focus on the meaning, not just individual words.</p>';
}
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
  '<div class="gf-word-check">'+b("check-word",checkingWord?"Checking…":"Check","primary",checkingWord)+
  '<small>Checks meaning, word choice, collocation and grammar. Requires Google sign-in; OpenAI API may cost money.</small></div>'+
  wordResult(checked,answer)+
  '<div class="gf-word-pagination">'+b("word-back","←", "outline",n===0)+'<span>Word '+(n+1)+' of 4</span>'+b("word-forward","→","outline",n===3)+'</div>';
 }
 if(type==="family"){
  const f=t.family,order=lessons.findIndex(x=>x.id===lesson.id)%2===0?[f.fromRole,f.toRole]:[f.toRole,f.fromRole];
  const chosen=r.familyChoice??null;
  return header("What job is this word doing?","Look at the real sentence before choosing its grammatical role.")+
  quote(f.fromSentence)+
  '<p class="gf-label">In this sentence, the word "'+esc(f.from)+'" functions as a…</p>'+
  '<div class="gf-choices">'+order.map((opt,i)=>'<button type="button" data-gf-action="answer-family" data-gf-option="'+i+'" '+(chosen!==null?'disabled':'')+' class="'+(chosen!==null?(opt===f.fromRole?'correct':chosen===i?'wrong':''):'')+'><b>'+String.fromCharCode(65+i)+'</b>'+esc(opt)+'</button>').join("")+'</div>'+
  (chosen!==null?'<div class="gf-feedback" role="status"><strong>'+(order[chosen]===f.fromRole?'✓ Correct — role identified.':'Try again — focus on the word in this sentence.')+'</strong><p>'+esc(f.why)+'</p>'+b("try-again","Try again")+'</div>':'')+
  '<details class="gf-reveal"><summary>Compare the other word form</summary><p lang="en">'+esc(f.toSentence)+'</p><p>Here '+esc(f.to)+' works as a '+esc(f.toRole)+'.</p></details>';
}
 if(type==="paraphrase"){const p=t.pairs[0],opts=(lesson.id.length%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent];return quote(p.source)+choice("Which sentence means the same?",opts,r.para,opts.indexOf(p.equivalent),"answer-para",p.why)}
 if(type==="ownWords"){
 const prev=r.wordFeedback?.__paraphrase__,valid=prev?.answer?.trim()===r.rewrite.trim();
 return header("Rephrase without changing the meaning","Keep the speaker, time, quantities and original claim unchanged.")+quote(t.pairs[0].source)+
 '<label class="gf-label">My paraphrase</label>'+field("rewrite",r.rewrite,"Write the same idea in your own English…")+
 '<div class="gf-word-check">'+b("check-rewrite",checkingWord?"Checking…":"Check","primary",checkingWord)+
 '<small>Checks whether the original meaning is preserved. Sign-in is required; a check can use API credits.</small></div>'+
 (prev?wordResult(prev,r.rewrite):'<p class="gf-tip">No AI evaluation yet. You can also check the comparison example below for free.</p>')+
 reveal("One possible meaning-preserving paraphrase",t.pairs[0].equivalent+" — "+t.pairs[0].why);
}
 if(type==="plan")return window.GKFoundationGuidedPages?.plan(lesson,r,m)||header("Plan your answer",m.writing);
 if(type==="write")return window.GKFoundationGuidedPages?.writing(lesson,r,m)||header("Write your answer",m.writing);
 if(type==="speak")return coach(lesson,r,"speak");
 if(type==="ai")return window.GKFoundationGuidedPages?.review(lesson,r)||header("Fix and review","Return to writing to get feedback.");
 if(type==="detective"){
 const p=t.pairs[1];
 return header("What detail changed?","Compare the two statements. Explain WHAT changed and WHY the meaning is different. Vietnamese explanations are accepted here.")+
 '<div class="gf-pair"><div><small>ORIGINAL</small><p lang="en">'+esc(p.source)+'</p></div><div><small>CHANGED</small><p lang="en">'+esc(p.wrong)+'</p></div></div>'+
 '<label class="gf-label">Explain the difference in your own words</label>'+
 field("detective",r.detective,"The meaning changes because… / Câu thứ hai thay đổi…")+
 freeCheckPanel(r,"detective","Checks the fact that changed, your explanation and how to correct it.")+
 reveal("See one possible explanation",p.why);
}
 if(type==="retry"){
  const report=window.GKFoundationCoach?.getRecord(lesson.id)?.writing?.report;
  return header("Fix the most important problem","Rewrite using your own words. A second AI request is optional.")+
  '<div class="gf-priority"><b>PRIORITY</b><p>'+esc(report?.priority_fix_vi||"Check whether your answer meets the task and preserves meaning.")+'</p></div>'+
  field("revision",r.revision||r.draft,"Improve the answer…")+b("use-revision","Use revision and return to feedback","primary")+
  reveal("Review your original answer",r.draft);
 }
 if(type==="deep")return header("Explain the word relationship",t.principle)+quote(lesson.examples[0]?.[0]||t.pairs[0].source)+
 '<label class="gf-label">Explain the function and evidence</label>'+
 field("explanation",r.explanation,"Which word names, describes or connects something? Why?")+
 freeCheckPanel(r,"explanation","Checks your reasoning, not how long your answer is. Vietnamese is accepted for explanations.")+
 reveal("See another explanation",lesson.explain);
 if(type==="summary"&&lesson.id==="a0-01")return a001Checkpoint(r);
 if(type==="summary"){
  const pair=t.pairs[0],options=(lesson.id.length%2)?[pair.equivalent,pair.wrong]:[pair.wrong,pair.equivalent];
  const ready=r.meaning===m.correct&&options[r.para]===pair.equivalent&&r.draft.trim().length>=8&&r.transfer.trim().length>=8;
  const checked=Object.keys(r.verified||{}).filter(k=>r.verified[k]?.status==="met").length;
  return header("Transfer this idea somewhere new","Show understanding with a different situation.")+quote(t.pairs[1].source)+field("transfer",r.transfer,"My own new example…")+
  freeCheckPanel(r,"transfer","Checks whether your new example uses the lesson's idea accurately, not just whether you typed something.")+
  '<div class="gf-final"><b>'+(ready?"Practice attempted — mastery not assumed":"More practice needed")+'</b><p>'+(ready?"You attempted the core tasks. "+checked+" open-ended explanation(s) were marked as meeting the task. Try checking and revising any unassessed answers.":"Answer the meaning question correctly, choose the meaning-preserving paraphrase, write your response, and create a final example. Written answers aren't automatically graded just because you typed them.")+'</p></div>'+
  (ready?b("finish","Finish & return to Foundation","primary"):"")+
  '<details class="gf-reveal"><summary>Older examples and four-question quizzes</summary><p>These remain available if you need more practice.</p><button type="button" class="gf-btn outline" data-f-action="classic">Open classic lesson</button></details>';
 }
 return "";
}
function render(lesson){
 const l=typeof lesson==="string"?lessonById[lesson]:lesson;if(!l)return;
 current=l.id;lastLessonId=current;const r=state(current);r.page=Math.max(0,Math.min(steps.length-1,Number(r.page)||0));
 const phase=steps[r.page][1],percent=Math.round((r.page+1)/steps.length*100);
 const coachStatus=window.GKFoundationCoach?.getRecord?.(l.id)||{};
 const checksDone=Object.keys(r.verified||{}).length+Object.values(r.wordFeedback||{}).filter(v=>v&&v.report).length+Number(!!coachStatus.writing?.report)+Number(!!coachStatus.speaking?.report);
 const parts=phases.map((p,i)=>'<button type="button" data-gf-phase="'+i+'" class="'+(i===phase?"selected":"")+'">'+String(i+1).padStart(2,"0")+' · '+esc(p)+'</button>').join("");
 root.innerHTML='<div class="gf-shell"><header class="gf-top">'+b("exit","← Foundation lessons","text")+'<div class="gf-title"><small>'+esc(l.level)+' · '+esc(l.skill)+'</small><h1>'+esc(l.title)+'</h1></div>'+
 '<div class="gf-count"><span>'+esc(phases[phase])+'</span><strong>Page '+(r.page+1)+' of '+steps.length+'</strong></div>'+
 '<div class="gf-progress" role="progressbar" aria-label="Screens visited" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+(r.page+1)+'"><span style="width:'+percent+'%"></span></div>'+
 '<div class="gf-phases" role="group" aria-label="Five learning phases">'+parts+'</div></header>'+
 '<section class="gf-focus"><div class="gf-small"><span>ACTIVITY '+String(r.page+1).padStart(2,"0")+'</span><span>'+esc(phases[phase])+'</span></div>'+
 '<h2 tabindex="-1" class="gf-screen-heading">'+esc(steps[r.page][2])+'</h2><div class="gf-task-body">'+content(l,r)+'</div>'+
 (message?'<p class="gf-notice" role="status">'+esc(message)+'</p>':"")+'</section>'+
 '<footer class="gf-footer"><div class="gf-nav">'+b("previous","← Previous","outline",r.page===0)+b("next","Next →","primary",r.page===steps.length-1)+'</div><div class="gf-footnote"><span>'+Object.keys(r.completed).length+' activities attempted · '+checksDone+' checks recorded · Next is not mastery</span>'+b("exit","Save & Exit","text")+'</div></footer></div>';
 save();
}
function compactWordReport(data){
 const trim=(x,max)=>String(x??"").slice(0,max);
 return{
  source:"openai-foundation",score:data.score??null,task_status:trim(data.task_status,30),
  summary_vi:trim(data.summary_vi||data.task_feedback_vi,330),
  task_checks:(data.task_checks||[]).slice(0,3).map(x=>({criterion:trim(x.criterion,115),status:trim(x.status,15),fix_vi:trim(x.fix_vi||x.why_vi,175)})),
  priority_fix_vi:trim(data.priority_fix_vi,250),
  mistakes:(data.mistakes||[]).slice(0,2).map(x=>({original:trim(x.original,100),correction:trim(x.correction,130),reason_vi:trim(x.reason_vi,170)})),
  corrected_answer:trim(data.corrected_answer,340),
  revision_question:trim(data.revision_question,240)
 };
}
async function checkRephrase(){
 if(checkingWord||!current)return;
 const id=current,lesson=lessonById[id],r=state(id),source=thoughts[id]?.pairs[0],answer=String(r.rewrite||"").trim();
 if(answer.length<8){message="Write a complete English sentence to compare with the original.";render(lesson);return;}
 if(answer.length>360){message="Keep your paraphrase under 360 characters.";render(lesson);return;}
 const prior=r.wordFeedback?.__paraphrase__;
 if(prior?.answer?.trim()===answer){message="Already checked. Rewrite it meaningfully before requesting another API assessment.";render(lesson);return;}
 if(!window.GKCloudSync?.getIdToken){message="Sign in using Save across devices before requesting OpenAI feedback.";render(lesson);return;}
 checkingWord=true;message="Checking meaning preservation…";render(lesson);
 try{
  const token=await window.GKCloudSync.getIdToken();
  const req={mode:"writing",level:lesson.level,
   task:"Paraphrase the ORIGINAL sentence without changing meaning. Original: "+source.source,
   goal:"Prioritise semantic equivalence: people, number, negation, timing, factual precision and tone. A grammatical but semantically changed sentence is off-topic.",
   scenario:"Foundation paraphrasing exercise: "+lesson.title,
   example:source.equivalent,
   meaningFocus:source.why,
   checklist:["Preserves the original speaker, quantity and time","Preserves original truth conditions and negation","Expresses the message naturally in different English words"],
   answer,revisionOf:prior?.answer||""};
  const res=await fetch(API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(req)});
  const feedback=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(feedback.error||"Assessment API unavailable (HTTP "+res.status+")");
  if(feedback.source!=="openai-foundation")throw new Error("Invalid grading response");
  r.wordFeedback.__paraphrase__={answer:answer.slice(0,360),report:compactWordReport(feedback),at:new Date().toISOString()};
  save();message="Paraphrase feedback ready. Revise your sentence using the main correction.";
 }catch(err){message="Paraphrase assessment unavailable: "+String(err?.message||"Network error");}
 finally{checkingWord=false;if(current===id&&steps[state(id).page][0]==="ownWords")render(lesson);}
}
async function checkWord(){
 if(checkingWord||!current)return;
 const id=current,r=state(id),lesson=lessonById[id],idx=Math.max(0,Math.min(3,r.word||0)),word=lesson.words[idx]?.[0];
 const answer=String(r.wordSentences?.[word]||"").trim(),detail=wordContexts[id]?.[idx],role=thoughts[id]?.roles[idx],phrase=thoughts[id]?.usage[idx];
 const normalize=x=>String(x||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
 if(normalize(answer)===normalize(detail?.[0])){message="That is the example sentence. Try an original sentence of your own before requesting AI checking.";render(lesson);return;}
 if(answer.length<8){message="Write one meaningful English sentence before checking.";render(lesson);return;}
 if(answer.length>360){message="Use a shorter example sentence (up to 360 characters).";render(lesson);return;}
 const prev=r.wordFeedback[word];
 if(prev?.answer?.trim()===answer){message="This version has already been checked. Edit it before spending another OpenAI request.";render(lesson);return;}
 if(!window.GKCloudSync?.getIdToken){message="Sign in with Google using Save across devices to get OpenAI corrections.";render(lesson);return;}
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
  r.wordFeedback[word]={answer:answer.slice(0,360),report:compactWordReport(data),at:new Date().toISOString()};
  r.completed.vocab=true;save();
  message="Correction ready. Revise your sentence and check again only when needed.";
 }catch(error){message="Sentence checking failed: "+String(error?.message||"Network error");}
 finally{checkingWord=false;if(current===id&&steps[state(id).page][0]==="vocab")render(lesson);}
}
function move(to){
 if(!current)return;const r=state(current),index=Math.min(steps.length-1,Math.max(0,to));if(index===r.page)return;
 if(["speak","write"].includes(steps[r.page][0]))window.GKFoundationCoach?.leave();
 window.GKYVoice?.stopConversation?.();
 r.page=index;message="";save();render(lessonById[current]);try{root.scrollIntoView({block:"start",behavior:"smooth"})}catch(err){}
}
function speak(text,slow){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){message="Audio playback is unavailable.";return;}
 try{
  window.GKYVoice?.stopConversation?.();
  window.speechSynthesis.cancel();
  const u=new window.SpeechSynthesisUtterance(text);
  const who=window.GKYVoice?.inferSpeaker?.(text,"Narrator")||"Narrator";
  const v=window.GKYVoice?.pick?.("auto",who,"en-NZ");
  u.lang=v?.lang||"en-NZ";if(v)u.voice=v;
  u.rate=slow?.77:.92;u.pitch=1;
  window.speechSynthesis.speak(u);
 }catch(err){message="Could not play audio.";}
}
root.addEventListener("click",ev=>{
 const node=ev.target.closest("button");if(!node||!root.contains(node)||!current)return;
 if(node.dataset.gfPhase!==undefined){const i=Number(node.dataset.gfPhase);const first=steps.findIndex(x=>x[1]===i);if(first>=0)move(first);return}
 const act=node.dataset.gfAction;if(!act)return;
 const r=state(current),l=lessonById[current],m=missions[current],t=thoughts[current],type=steps[r.page][0];
 if(act==="pilot-answer"&&current==="a0-01"&&type==="summary"){
  const c=r.checkpoint||(r.checkpoint={variant:0,answers:[null,null],checked:false,passed:false,attempts:0});
  if(c.checked)return;
  const i=Number(node.dataset.gfQuestion),j=Number(node.dataset.gfOption),q=a001Checks[c.variant||0]?.[i];
  if(!q||!Number.isInteger(j)||j<0||j>=q.answers.length)return;
  c.answers[i]=j;save();render(l);return;
 }
 if(act==="pilot-check"&&current==="a0-01"&&type==="summary"){
  const c=r.checkpoint;
  if(!c||c.checked||!Array.isArray(c.answers)||c.answers.length!==2||c.answers.some(x=>!Number.isInteger(x)))return;
  c.checked=true;c.attempts=(c.attempts||0)+1;c.passed=a001Checks[c.variant||0].every((q,i)=>q.correct===c.answers[i]);
  if(c.passed)r.completed.checkpoint=true;
  save();render(l);return;
 }
 if(act==="pilot-retry"&&current==="a0-01"&&type==="summary"){
  const c=r.checkpoint;
  if(!c||!c.checked||c.passed)return;
  c.variant=((c.variant||0)+1)%a001Checks.length;c.checked=false;c.answers=[null,null];
  save();render(l);return;
 }
 if(act==="next"){move(r.page+1);return}if(act==="previous"){move(r.page-1);return}
 if(act==="exit"){window.GKYVoice?.stopConversation?.();window.GKFoundationCoach?.leave();window.GKFoundationOpenHome?.();return}
 if(act==="preview-female"||act==="preview-male"){window.GKYVoice?.previewCharacter?.(act==="preview-female"?"F":"M");return;}
 if(act==="hear-scene"){
 const turns=voiceScenes[current]||[{speaker:window.GKYVoice?.inferSpeaker(m.dialog,"Narrator")||"Narrator",text:m.dialog}];
 if(window.GKYVoice?.playConversation){
  const playback=window.GKYVoice.playConversation(turns,{locale:"en-NZ",rate:.94,onError:()=>{message="Playback failed. Check your device voice settings.";render(l);}});
  if(!playback.ok){message=playback.reason||"Audio unavailable.";render(l);return;}
 }else{speak(m.dialog);}
 r.completed.scene=true;save();return;
}
 if(act==="hear-example"||act==="slow-example"){speak(l.examples[0]?.[0]||m.dialog,act==="slow-example");r.completed.listen=true;save();return}
 if(act==="spoke"){r.completed.listen=true;save();render(l);return}
 if(act==="try-again"){if(type==="meaning")r.meaning=null;else if(type==="family")r.familyChoice=null;else if(type==="paraphrase")r.para=null;save();render(l);return}
 if(act==="answer-meaning"&&r.meaning===null){r.meaning=Number(node.dataset.gfOption);if(r.meaning===m.correct)r.completed.meaning=true;save();render(l);return}
 if(act==="answer-family"&&(r.familyChoice===undefined||r.familyChoice===null)){r.familyChoice=Number(node.dataset.gfOption);const opts=lessons.findIndex(x=>x.id===l.id)%2===0?[t.family.fromRole,t.family.toRole]:[t.family.toRole,t.family.fromRole];if(opts[r.familyChoice]===t.family.fromRole)r.completed.family=true;save();render(l);return}
 if(act==="answer-para"&&r.para===null){r.para=Number(node.dataset.gfOption);const p=t.pairs[0],opts=(l.id.length%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent];if(opts[r.para]===p.equivalent)r.completed.paraphrase=true;save();render(l);return}
 if(act==="word-back"||act==="word-forward"){r.word=Math.max(0,Math.min(3,r.word+(act==="word-forward"?1:-1)));save();render(l);return}
 if(act==="hear-word"){speak(t.usage[r.word]);r.completed.vocab=true;save();return}
 if(act==="hear-example-word"){speak(wordContexts[current]?.[r.word]?.[0]||t.usage[r.word]);return}
 if(act==="check-word"){void checkWord();return}
 if(act==="check-detective"){void checkFreeResponse("detective");return}
 if(act==="check-explanation"){void checkFreeResponse("explanation");return}
 if(act==="check-transfer"){void checkFreeResponse("transfer");return}
 if(act==="check-errorFix"){void checkFreeResponse("errorFix");return}
 if(act==="check-rewrite"){void checkRephrase();return}
 if(act==="toggle-word"){window.GKFoundationThinking?.toggleWord?.(current,l.words[r.word][0]);r.completed.vocab=true;save();render(l);return}
 if(act==="use-revision"){if(!r.revision.trim()){message="Write a revision before submitting again.";render(l);return}r.draft=r.revision;legacyDraft(current,r.draft);r.completed.retry=true;save();move(10);return}
 if(act==="finish"){
 if(current==="a0-01"){
  if(!r.checkpoint?.passed||r.meaning!==m.correct||String(r.draft||"").trim().length<8||String(r.transfer||"").trim().length<15)return;
 }else{
  const p=t.pairs[0],opts=(l.id.length%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent];
  if(r.meaning!==m.correct||opts[r.para]!==p.equivalent||r.draft.trim().length<8||r.transfer.trim().length<8)return;
 }
 r.finished=true;r.completed.summary=true;save();window.GKFoundationOpenHome?.();return;
}
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
root.addEventListener("change",event=>{
 const role=event.target?.dataset?.gfCharacter;
 if(role&&window.GKYVoice?.setCharacterVoice){window.GKYVoice.setCharacterVoice(role,event.target.value);}
});
window.GKYVoice?.onVoices?.(()=>{
 const lists=root.querySelectorAll?.("select[data-gf-character]")||[];
 for(const sel of lists){const existing=sel.value;sel.innerHTML=window.GKYVoice.castOptions(sel.dataset.gfCharacter);if([...sel.options].some(x=>x.value===existing))sel.value=existing;}
});
window.GKFoundationFlow={render,open:render,getState:state,getLastLessonId:()=>lastLessonId,goTo:move,persist:save,checkFreeResponse,freeCheckPanel,screenCount:steps.length};
})();