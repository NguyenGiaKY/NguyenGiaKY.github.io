/* Foundation Writing + Speaking AI Coach; all 24 original lessons.
 * Grading requires signed-in Firebase account, explicit sending and server-side OpenAI key.
 * Raw microphone recordings stay in memory until learner chooses Send; audio is never persisted.
 */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),pack=window.GKFoundationData;
if(!root||!pack)return;
const KEY="gk_foundation_feedback_v1",EP=window.location.hostname.endsWith(".vercel.app")?window.location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
const prompts={
"a0-01":"Introduce yourself. Say your name and one thing you can see near you.",
"a0-02":"Tell me three short sentences using I, she or he, and they.",
"a0-03":"Say one sentence with am, one with is, and one with are.",
"a0-04":"Describe two things near you. Use a, an, the, or a plural noun.",
"a0-05":"What do you do every day? Tell me three routines.",
"a0-06":"Ask two Yes/No questions and one question using Where, When or What. Answer one.",
"a1-01":"What are you doing now? How is it different from what you usually do?",
"a1-02":"Describe your morning routine. Use always, usually, or sometimes.",
"a1-03":"What did you do yesterday? Say three sentences in the past.",
"a1-04":"What are you going to do tomorrow? Say two plans and one prediction.",
"a1-05":"Describe your room. Use there is, there are, and location words.",
"a1-06":"What food and drinks do you have at home? Use some and any.",
"a2-01":"Give three useful pieces of advice for learning English. Use can, should and must.",
"a2-02":"Compare two school subjects or two places. Use comparative and superlative forms.",
"a2-03":"Describe three experiences you have had. Use have or has plus a past participle.",
"a2-04":"Why is learning English useful? Include because and although.",
"a2-05":"Listen to the lesson announcement. Summarise the main point in two sentences.",
"a2-06":"Summarise the main idea of the lesson passage in your own words.",
"bridge-01":"Talk about your study habits. Use two collocations and one word family.",
"bridge-02":"Explain the main idea and one specific detail from the reading passage.",
"bridge-03":"Tell me the key times or prices from the lesson audio using different words.",
"bridge-04":"Do you enjoy learning English? Give an answer, a reason and an example.",
"bridge-05":"Why is reading useful for students? Explain your main point and give an example.",
"bridge-06":"Do you prefer online or classroom learning? Give reasons and one example."
};
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=stored.records&&typeof stored.records==="object"?stored.records:{};
const customLessons={};
const getLesson=id=>pack.lessons.find(x=>x.id===id)||customLessons[id];
let current=null,loading=false,error="",rec=null,clip=null,url="",elapsed=0,timer=null;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const row=id=>records[id]||(records[id]={writing:null,speaking:null});
function persist(){try{localStorage.setItem(KEY,JSON.stringify({records}));}catch(e){error="Unable to save this feedback on your browser.";}}
function clearAudio(){if(url)URL.revokeObjectURL(url);url="";clip=null;}
function fields(mode,record){
 const report=record?.report;
 if(!report)return'<div class="fc-awaiting"><strong>No assessment yet</strong><p>First try the task yourself. OpenAI checking is optional and requires your Google sign-in and a configured API.</p></div>';
 const errors=Array.isArray(report.mistakes)?report.mistakes:[];
 const checks=Array.isArray(report.task_checks)?report.task_checks:[];
 const status=report.task_status||"unclear",descriptions={met:"Answered the task",partial:"Some task requirements missing",off_topic:"Off topic — the question was not answered",unclear:"Task fit needs checking"};
 let h='<section class="fc-report" aria-label="AI correction result"><header class="fc-report-hero"><div><span class="fc-kicker">DIAGNOSTIC FEEDBACK · '+(mode==="writing"?"WRITING":"SPEAKING")+'</span><h4>'+esc(descriptions[status])+'</h4></div><strong>'+ (report.score===null||report.score===undefined?"—":esc(report.score))+'/5 <small>practice</small></strong></header>'+
 '<p class="fc-report-summary">'+esc(report.summary_vi||report.task_feedback_vi)+'</p>';
 if(record?.at)h+='<p class="fc-result-date">Checked '+esc(new Date(record.at).toLocaleString())+'</p>';
 const previous=row(current).history?.[mode]||[];
 if(previous.length)h+='<details class="fc-previous"><summary>Compare with '+previous.length+' earlier attempt'+(previous.length>1?'s':'')+'</summary>'+
 previous.slice().reverse().map(v=>'<div><strong>'+esc((v.score??"—")+'/5')+'</strong><span>'+esc(v.task_status||"")+'</span><p lang="en">'+esc(v.answer||"")+'</p></div>').join("")+'</details>';

 if(report.transcript)h+='<div class="fc-part"><h5>What I heard (audio transcript)</h5><p lang="en">'+esc(report.transcript)+'</p></div>';
 if(checks.length){h+='<div class="fc-part"><h5>Did you answer the actual question?</h5><div class="fc-criteria">';
  for(const c of checks)h+='<div class="fc-criterion"><div><span class="fc-criterion-label '+esc(c.status)+'">'+(c.status==="met"?"✓":c.status==="partial"?"~":"!")+' '+esc(c.status)+'</span><strong>'+esc(c.criterion)+'</strong></div>'+
  (c.evidence?'<p><b>Evidence:</b> '+esc(c.evidence)+'</p>':'')+(c.why_vi?'<p>'+esc(c.why_vi)+'</p>':'')+(c.fix_vi?'<p class="fc-criterion-fix">Next: '+esc(c.fix_vi)+'</p>':'')+'</div>';
  h+='</div></div>';
 }else if(report.task_feedback_vi)h+='<div class="fc-part"><h5>Task fit</h5><p>'+esc(report.task_feedback_vi)+'</p></div>';
 if(report.priority_fix_vi)h+='<div class="fc-priority"><span>FIX THIS FIRST</span><strong>'+esc(report.priority_fix_vi)+'</strong></div>';
 if(errors.length){
  h+='<div class="fc-part"><h5>Fix the actual mistakes</h5><p class="fc-hint">Read what you wrote. Try correcting it before expanding the explanation.</p>';
  errors.forEach((c,i)=>{h+='<details class="fc-error-item"><summary><span>'+esc(c.original||"Sentence "+(i+1))+'</span><b>How to fix ↓</b></summary>'+
  '<div><p class="fc-correct" lang="en">'+esc(c.correction)+'</p><p>'+esc(c.reason_vi)+'</p>'+(c.rule_vi?'<small>'+esc(c.rule_vi)+'</small>':'')+'</div></details>';});
  h+='</div>';
 }else h+='<div class="fc-part"><h5>Language corrections</h5><p>No definite errors identified in this answer. Check task fit and development above before moving on.</p></div>';
 if(report.pronunciation_vi)h+='<div class="fc-part"><h5>Pronunciation — from the recording</h5><p>'+esc(report.pronunciation_vi)+'</p></div>';
 if(report.rhythm_vi)h+='<div class="fc-part"><h5>Rhythm and pace</h5><p>'+esc(report.rhythm_vi)+'</p></div>';
 if(report.revision_feedback_vi)h+='<div class="fc-part"><h5>Compared with your previous attempt</h5><p>'+esc(report.revision_feedback_vi)+'</p></div>';
 if(report.strengths_vi?.length)h+='<div class="fc-part"><h5>What worked</h5><ul>'+report.strengths_vi.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>';
 if(mode==="writing"){
  h+='<div class="fc-revision"><span class="fc-kicker">REWRITE → RECHECK</span><h5>Now revise your own answer</h5><p>Use the corrections above. Do not just copy the model. Submitting a new draft to AI requires another request and may incur a charge.</p>'+
  (report.revision_question?'<p class="fc-revision-task">'+esc(report.revision_question)+'</p>':'')+
  '<textarea id="fc-revision-draft" rows="4" placeholder="Rewrite your answer with the correct meaning and clearer English…">'+esc(row(current).revisionDraft||"")+'</textarea>'+
  '<div class="fc-revision-actions"><button type="button" data-fc="useRevision" class="fc-primary">Put this revision into my answer</button></div></div>';
 }
 if(report.corrected_answer)h+='<details class="fc-model"><summary>See minimal corrections to your original wording</summary><p lang="en">'+esc(report.corrected_answer)+'</p></details>';
 if(report.model_answer)h+='<details class="fc-model"><summary>See a possible on-topic answer (not for copying)</summary><p lang="en">'+esc(report.model_answer)+'</p></details>';
 if(report.next_practice?.length)h+='<details class="fc-model"><summary>Optional extra practice</summary><ol>'+report.next_practice.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></details>';
 return h+'</section>';
}
function render(lesson){
 if(!lesson||(!prompts[lesson.id]&&!lesson.speakingPrompt))return"";
 if(current&&current!==lesson.id)leave();
 if(lesson.speakingPrompt)customLessons[lesson.id]=lesson;
 current=lesson.id;
 const r=row(lesson.id),mission=window.GKFoundationMissions?.mission(lesson.id),talk=lesson.speakingPrompt||mission?.speaking||prompts[lesson.id];
 const shortIntro=!!mission;
 return'<section class="fc-coach" id="foundationCoach" aria-label="Practice, correct and retry">'+
 '<div class="fc-heading"><div><span class="fc-kicker">LEARN → TRY → FIX → RETRY</span><h3>Make your own answer stronger</h3>'+
 '<p>Understand the question first. AI marks the task, identifies actual errors and guides your next attempt.</p></div></div>'+
 '<div class="fc-grid"><div class="fc-column"><h4>01 · Check my writing</h4>'+
 (shortIntro?'<p>Use your answer from the box above. Check that it answers the exact writing mission.</p>':'<p>'+esc(lesson.produce[0])+'</p><textarea id="fc-custom-answer" rows="4" placeholder="Write an original English response…">'+esc(r.draft||"")+'</textarea>')+
 '<div class="fc-action-area"><button type="button" class="fc-primary" data-fc="writing" '+(loading?'disabled':'')+'>'+(loading?'Checking…':'Analyse my answer with OpenAI')+'</button>'+
 '<span>Task fit · grammar · vocabulary · meaning</span></div>'+
 fields("writing",r.writing)+'</div>'+
 '<div class="fc-column"><h4>02 · Speak for a real purpose</h4><p class="fc-speaking-task" lang="en">'+esc(talk)+'</p>'+
 (mission?'<p>Build the idea before recording: <b>'+esc(mission.focus)+'</b></p>':'')+
 '<div class="fc-microphone"><button type="button" class="fc-primary" data-fc="'+(rec?'stop':'record')+'" '+(loading?'disabled':'')+'>'+(rec?'■ Stop':'● Record answer')+'</button>'+
 '<span id="fc-mic-status" role="status">'+(rec?'Recording '+elapsed+'s / 45s':clip?'Ready to review':'No audio recorded')+'</span></div>'+
 (clip?'<audio controls preload="none" src="'+esc(url)+'" aria-label="Review your recording"></audio><button type="button" class="fc-primary" data-fc="speaking" '+(loading?'disabled':'')+'>Assess recording with OpenAI</button><button type="button" class="fc-link" data-fc="discard">Discard and try again</button>':'')+
 fields("speaking",r.speaking)+'</div></div>'+
 '<p class="fc-disclosure">AI diagnostic scores /5 are not IELTS bands. OpenAI API use is billed separately. Text or audio is sent only after you press Assess and confirm. Text, transcripts and feedback can sync with your Google account; microphone recordings are not retained in your learning history.</p>'+
 '<p id="fc-message" role="status" class="fc-message">'+esc(error)+'</p></section>';
}
function refresh(){
 const node=root.querySelector("#foundationCoach");if(node&&current){const lesson=getLesson(current);if(lesson)node.outerHTML=render(lesson);}
}
function leave(){if(rec)stop(true);clearAudio();error="";current=null;}
function base64(buffer){const bytes=new Uint8Array(buffer);let str="";const step=16384;for(let i=0;i<bytes.length;i+=step)str+=String.fromCharCode(...bytes.subarray(i,i+step));return btoa(str);}
function wav(chunks,sampleRate){
 const len=chunks.reduce((n,a)=>n+a.length,0),raw=new Float32Array(len);let n=0;for(const a of chunks){raw.set(a,n);n+=a.length;}
 const toRate=16000,count=Math.floor(len*toRate/sampleRate),buf=new ArrayBuffer(44+count*2),v=new DataView(buf);
 function word(offset,t){for(let i=0;i<t.length;i++)v.setUint8(offset+i,t.charCodeAt(i));}
 word(0,"RIFF");v.setUint32(4,36+count*2,true);word(8,"WAVE");word(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,toRate,true);v.setUint32(28,toRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,"data");v.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const at=i*sampleRate/toRate,j=Math.floor(at),fr=at-j;const value=(raw[j]||0)*(1-fr)+(raw[j+1]||0)*fr;v.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(value*32767))),true);}
 return new Blob([buf],{type:"audio/wav"});
}
async function record(){
 if(rec||loading)return;
 clearAudio();error="";
 if(!navigator.mediaDevices?.getUserMedia){error="Microphone recording requires HTTPS and a supported browser.";refresh();return;}
 let stream=null;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw Error("Audio recording is not supported");
  const ctx=new AudioContext(),source=ctx.createMediaStreamSource(stream),processor=ctx.createScriptProcessor(4096,1,1),chunks=[];
  processor.onaudioprocess=e=>{chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));e.outputBuffer.getChannelData(0).fill(0);};
  source.connect(processor);processor.connect(ctx.destination);
  rec={stream,ctx,source,processor,chunks,start:Date.now(),sampleRate:ctx.sampleRate};
  elapsed=0;timer=setInterval(()=>{if(!rec)return;elapsed=Math.floor((Date.now()-rec.start)/1000);const m=root.querySelector("#fc-mic-status");if(m)m.textContent="Recording "+elapsed+"s / 45s";if(elapsed>=45)stop(false);},400);
  refresh();
 }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());error="Microphone unavailable: "+(e?.message||"Please allow mic access.");refresh();}
}
function stop(cancel){
 if(!rec)return;
 const r=rec;rec=null;clearInterval(timer);timer=null;
 try{r.processor.disconnect();r.source.disconnect();r.stream.getTracks().forEach(t=>t.stop());r.ctx.close();}catch(e){}
 if(!cancel&&r.chunks.length>3){
  clearAudio();clip=wav(r.chunks,r.sampleRate);url=URL.createObjectURL(clip);
 }else if(!cancel){error="Recording too short. Speak for a few seconds and try again.";}
 refresh();
}
async function evaluate(mode){
 if(loading||!current)return;
 if(mode==="speaking"&&!clip){error="Record an answer first.";refresh();return;}
 const id=current,lesson=getLesson(id);if(!lesson)return;
 const answer=String(root.querySelector(lesson.speakingPrompt?"#fc-custom-answer":"#foundationDraft")?.value||"");
 const previous=row(id)[mode];
 if(mode==="writing"&&previous?.answer?.trim()===answer.trim()){error="This exact version has already been checked. Revise at least one meaningful part before spending another OpenAI request.";refresh();return;}
 if(mode==="writing"&&answer.trim().length<5){error="Write at least a short English sentence before grading.";refresh();return;}
 if(!window.GKCloudSync?.getIdToken){error="Sign in with Google using Save across devices to use AI corrections.";refresh();return;}
 const msg=mode==="speaking"?"Your audio will be sent to OpenAI for transcription, corrections and pronunciation feedback. OpenAI API usage can cost money. Continue?":"Your writing will be sent to OpenAI for feedback. OpenAI API usage can cost money. Continue?";
 if(!window.confirm(msg))return;
 loading=true;error="Sending "+mode+" to OpenAI…";refresh();
 try{
  const token=await window.GKCloudSync.getIdToken();
  const mission=window.GKFoundationMissions?.mission(id)||window.GKFoundationMissionData?.missions?.[id];
  const payload={mode,level:lesson.level,task:mode==="writing"?(mission?.writing||lesson.produce[0]):(lesson.speakingPrompt||mission?.speaking||prompts[id]),goal:lesson.goal,example:lesson.produce[2],
    scenario:mission?.scene||"",checklist:mission?.checklist||[],meaningFocus:mission?.focus||"",
    revisionOf:mode==="writing"&&previous?.answer?previous.answer:""};
  if(mode==="writing")payload.answer=answer;
  else{payload.audioBase64=base64(await clip.arrayBuffer());payload.format="wav";}
  const response=await fetch(EP,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||"OpenAI assessment unavailable ("+response.status+")");
  if(!data||data.source!=="openai-foundation")throw Error("Invalid assessment response");
  const currentRecord=row(id);
  if(currentRecord[mode]){
   currentRecord.history=currentRecord.history||{writing:[],speaking:[]};
   currentRecord.history[mode]=(currentRecord.history[mode]||[]).concat([{at:currentRecord[mode].at,score:currentRecord[mode].report?.score,task_status:currentRecord[mode].report?.task_status,answer:currentRecord[mode].answer}]).slice(-4);
  }
  currentRecord[mode]={at:new Date().toISOString(),answer:mode==="writing"?answer:data.transcript||"",prompt:payload.task,report:data};
  if(mode==="writing")currentRecord.revisionDraft="";
  persist();
  error="Assessment saved. Read the corrections, revise your answer, then practise again.";
  if(mode==="speaking")clearAudio();
 }catch(e){error="Assessment unavailable: "+String(e?.message||"Network error");}
 finally{loading=false;refresh();}
}
root.addEventListener("input",e=>{
 if(e.target?.id==="fc-custom-answer"&&current&&customLessons[current]){row(current).draft=e.target.value;persist();}
 if(e.target?.id==="fc-revision-draft"&&current){row(current).revisionDraft=e.target.value;persist();}
});
root.addEventListener("click",e=>{
 const button=e.target.closest("button[data-fc]");if(!button)return;
 const action=button.dataset.fc;
 if(action==="record")void record();
 else if(action==="stop")stop(false);
 else if(action==="discard"){clearAudio();refresh();}
 else if(action==="useRevision"){
  if(!current)return;
  const text=String(root.querySelector("#fc-revision-draft")?.value||"").trim();
  if(text.length<5){error="Write your corrected answer before transferring it.";refresh();return;}
  const lesson=getLesson(current),draft=root.querySelector(lesson.speakingPrompt?"#fc-custom-answer":"#foundationDraft");
  if(!draft){error="Please open the Writing task to revise your answer.";refresh();return;}
  draft.value=text;
  draft.dispatchEvent(new Event("input",{bubbles:true}));
  error="Revision transferred. Read it again; to ask AI to recheck, press Analyse my answer (another API request).";refresh();
 }
 else if(action==="writing"||action==="speaking")void evaluate(action);
});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&rec)stop(true);});
window.GKFoundationCoach={render,leave,getRecord:id=>row(id)};
})();
