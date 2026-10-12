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
let current=null,loading=false,error="",rec=null,clip=null,url="",elapsed=0,timer=null;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const row=id=>records[id]||(records[id]={writing:null,speaking:null});
function persist(){try{localStorage.setItem(KEY,JSON.stringify({records}));}catch(e){error="Unable to save this feedback on your browser.";}}
function clearAudio(){if(url)URL.revokeObjectURL(url);url="";clip=null;}
function fields(title,report){
 if(!report)return'<p class="fc-no-result">No AI assessment yet. Submit your answer to receive corrections.</p>';
 const corrections=Array.isArray(report.mistakes)?report.mistakes:[];
 let h='<div class="fc-report"><div class="fc-result-head"><strong>'+esc(title)+'</strong>'+
 '<span>'+(Number.isInteger(report.score)?report.score+'/5 practice':'Practice result')+'</span></div>'+
 '<p class="fc-report-summary">'+esc(report.summary_vi)+'</p>';
 if(report.transcript)h+='<div class="fc-part"><h5>Heard from your recording</h5><p lang="en">'+esc(report.transcript)+'</p></div>';
 if(report.task_feedback_vi)h+='<div class="fc-part"><h5>Task feedback</h5><p>'+esc(report.task_feedback_vi)+'</p></div>';
 if(report.strengths_vi?.length)h+='<div class="fc-part"><h5>What you did well</h5><ul>'+report.strengths_vi.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>';
 h+='<div class="fc-part"><h5>Errors and fixes</h5>';
 if(!corrections.length)h+='<p>No clear language mistakes identified in this response.</p>';
 else corrections.forEach((m,i)=>{h+='<div class="fc-fix"><span>Correction '+(i+1)+'</span><p class="fc-wrong">'+esc(m.original)+'</p><p class="fc-correct">→ '+esc(m.correction)+'</p><p>'+esc(m.reason_vi)+'</p>'+(m.rule_vi?'<small>Rule: '+esc(m.rule_vi)+'</small>':'')+'</div>'});
 h+='</div>';
 if(report.corrected_answer)h+='<div class="fc-part"><h5>Corrected version (your ideas)</h5><p lang="en">'+esc(report.corrected_answer)+'</p></div>';
 if(report.model_answer)h+='<div class="fc-part"><h5>Model answer at this level</h5><p lang="en">'+esc(report.model_answer)+'</p></div>';
 if(report.pronunciation_vi)h+='<div class="fc-part"><h5>Pronunciation from audio</h5><p>'+esc(report.pronunciation_vi)+'</p></div>';
 if(report.rhythm_vi)h+='<div class="fc-part"><h5>Rhythm and pace</h5><p>'+esc(report.rhythm_vi)+'</p></div>';
 if(report.next_practice?.length)h+='<div class="fc-part"><h5>Fix it next</h5><ol>'+report.next_practice.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></div>';
 return h+'</div>';
}
function render(lesson){
 if(!lesson||!prompts[lesson.id])return"";
 current=lesson.id;
 const r=row(lesson.id);
 return'<section class="fc-coach" id="foundationCoach" aria-label="Writing and speaking correction">'+
 '<div class="fc-heading"><div><span class="fc-kicker">WRITING + SPEAKING • OPENAI CORRECTION</span><h3>Get specific feedback, then try again</h3>'+
 '<p>One correction at a time: understand the mistake, fix your sentence, and practise speaking it.</p></div><span class="fc-level">'+esc(lesson.level)+'</span></div>'+
 '<div class="fc-grid"><div class="fc-column"><h4>✍️ Writing correction</h4><p>Write your answer in the text box above, then ask AI to assess it against this lesson.</p>'+
 '<button type="button" class="fc-primary" data-fc="writing" '+(loading?'disabled':'')+'>'+(loading?'Checking…':'Check my writing with OpenAI')+'</button>'+
 '<div id="fc-writing-result">'+fields("Writing",r.writing?.report)+'</div></div>'+
 '<div class="fc-column"><h4>🎙️ Speaking practice</h4><p class="fc-speaking-task" lang="en">'+esc(prompts[lesson.id])+'</p>'+
 '<div class="fc-microphone"><button type="button" class="fc-primary" data-fc="'+(rec?'stop':'record')+'" '+(loading?'disabled':'')+'>'+(rec?'■ Stop recording':'● Record my answer')+'</button>'+
 '<span id="fc-mic-status" role="status">'+(rec?'Recording '+elapsed+'s / 45s':clip?'Recording ready':'No recording yet')+'</span></div>'+
 (clip?'<audio controls preload="none" src="'+esc(url)+'" aria-label="Review your recorded answer"></audio><button type="button" class="fc-primary" data-fc="speaking" '+(loading?'disabled':'')+'>Send recording for OpenAI feedback</button><button type="button" class="fc-link" data-fc="discard">Discard recording</button>':'')+
 '<div id="fc-speaking-result">'+fields("Speaking",r.speaking?.report)+'</div></div></div>'+
 '<p class="fc-disclosure">Practice scores /5 are not IELTS bands. OpenAI API usage may incur charges. Written answers or voice recordings are sent to the OpenAI service <strong>only when you press the assessment button</strong>. Feedback, written answers and transcripts are saved for cross-device review; raw audio is not saved.</p>'+
 '<p id="fc-message" role="status" class="fc-message">'+esc(error)+'</p></section>';
}
function refresh(){
 const node=root.querySelector("#foundationCoach");if(node&&current&&pack.lessons.find(x=>x.id===current)){const lesson=pack.lessons.find(x=>x.id===current);node.outerHTML=render(lesson);}
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
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw Error("Audio recording is not supported");
  const ctx=new AudioContext(),source=ctx.createMediaStreamSource(stream),processor=ctx.createScriptProcessor(4096,1,1),chunks=[];
  processor.onaudioprocess=e=>{chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));e.outputBuffer.getChannelData(0).fill(0);};
  source.connect(processor);processor.connect(ctx.destination);
  rec={stream,ctx,source,processor,chunks,start:Date.now(),sampleRate:ctx.sampleRate};
  elapsed=0;timer=setInterval(()=>{if(!rec)return;elapsed=Math.floor((Date.now()-rec.start)/1000);const m=root.querySelector("#fc-mic-status");if(m)m.textContent="Recording "+elapsed+"s / 45s";if(elapsed>=45)stop(false);},400);
  refresh();
 }catch(e){error="Microphone unavailable: "+(e?.message||"Please allow mic access.");refresh();}
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
 const id=current,lesson=pack.lessons.find(x=>x.id===id);if(!lesson)return;
 const answer=String(root.querySelector("#foundationDraft")?.value||"");
 if(mode==="writing"&&answer.trim().length<5){error="Write at least a short English sentence before grading.";refresh();return;}
 if(!window.GKCloudSync?.getIdToken){error="Sign in with Google using Save across devices to use AI corrections.";refresh();return;}
 const msg=mode==="speaking"?"Your audio will be sent to OpenAI for transcription, corrections and pronunciation feedback. OpenAI API usage can cost money. Continue?":"Your writing will be sent to OpenAI for feedback. OpenAI API usage can cost money. Continue?";
 if(!window.confirm(msg))return;
 loading=true;error="Sending "+mode+" to OpenAI…";refresh();
 try{
  const token=await window.GKCloudSync.getIdToken();
  const payload={mode,level:lesson.level,task:mode==="writing"?lesson.produce[0]:prompts[id],goal:lesson.goal,example:lesson.produce[2]};
  if(mode==="writing")payload.answer=answer;
  else{payload.audioBase64=base64(await clip.arrayBuffer());payload.format="wav";}
  const response=await fetch(EP,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||"OpenAI assessment unavailable ("+response.status+")");
  if(!data||data.source!=="openai-foundation")throw Error("Invalid assessment response");
  row(id)[mode]={at:new Date().toISOString(),answer:mode==="writing"?answer:data.transcript||"",prompt:payload.task,report:data};
  persist();
  error="Assessment saved. Read the corrections, revise your answer, then practise again.";
  if(mode==="speaking")clearAudio();
 }catch(e){error="Assessment unavailable: "+String(e?.message||"Network error");}
 finally{loading=false;refresh();}
}
root.addEventListener("click",e=>{
 const button=e.target.closest("button[data-fc]");if(!button)return;
 const action=button.dataset.fc;
 if(action==="record")void record();
 else if(action==="stop")stop(false);
 else if(action==="discard"){clearAudio();refresh();}
 else if(action==="writing"||action==="speaking")void evaluate(action);
});
window.GKFoundationCoach={render,leave,getRecord:id=>row(id)};
})();
