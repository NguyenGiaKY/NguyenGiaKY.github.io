/* Shared real-audio oral practice for Stage 2 and Stage 3.
 * Only short scored audio clips and feedback metadata are stored. Audio blobs stay local.
 * No text-only pronunciation inference; these are NOT official IELTS band results.
 */
(function(){
"use strict";
const KEY="gk_stage_spoken_v1",MAX_MS=40000;
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=saved.records||{},esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let current="",recorder=null,stream=null,parts=[],timeout=null,blob=null,clipUrl="",busy=false,notice="";
const rec=id=>records[id]||(records[id]={round:0,attempts:[],revision:""});
function save(){try{localStorage.setItem(KEY,JSON.stringify({records}))}catch(e){notice="Could not save spoken feedback. Please back up your work."}}
function stopTracks(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;if(timeout)clearTimeout(timeout);timeout=null}
function dispose(){if(recorder&&recorder.state==="recording")try{recorder.onstop=null;recorder.stop()}catch(e){}stopTracks();recorder=null;parts=[];blob=null;if(clipUrl)try{URL.revokeObjectURL(clipUrl)}catch(e){}clipUrl=""}
function refresh(level){if(level==="Core")window.GKCoreSkills?.render?.();else window.GKStage3Evidence?.refresh?.()}
function promptText(id,level){
 const r=rec(id);
 if(r.round===1){
  const first=r.attempts.find(a=>a.round===0);
  return first?.followup||"Follow-up: What would change if the situation were different?";
 }
 if(level==="Core"){const u=window.GKCoreSkills?.getUnit?.(id);return u?.transfer||"Explain the skill in your own spoken answer."}
 const c=window.GKStage3PracticeData?.cases?.[id];
 return c?.text||window.GKStage3EvidenceData?.challenges?.[id]||"Give your own spoken response to the IELTS practice prompt.";
}
function panel(id,level){
 if(!id||!["Core","IELTS"].includes(level))return"";
 if(current&&current!==level+":"+id){dispose();notice=""}
 current=level+":"+id;
 const r=rec(current),question=promptText(current,level); // corrected below: records store composite keys, prompt lookup uses raw ID
 return body(id,level,r,question);
}
function body(id,level,r,q){
 const c=window.GKStage3PracticeData?.cases?.[id];
 const latest=r.attempts.filter(a=>a.round===r.round).slice(-1)[0];
 const isSpeaking=level==="IELTS";
 let h='<section class="'+(isSpeaking?"s3-panel s3-spoken":"cs-evidence se-core")+'"><h3>🎙 Spoken answer · real microphone</h3>'+
 '<p>Record your OWN answer. This is a short clip (maximum 40 seconds), so it cannot replace a full IELTS Speaking Part 2 or a complete 11–14-minute interview.</p>'+
 '<p><b>'+(r.round?"Follow-up question":"Your speaking task")+':</b> '+esc(q)+'</p>'+
 '<p class="s3-tip">Audio remains on this device temporarily; raw audio is not saved in learning progress or cloud sync. Press Check to send the recording for authorised evaluation. Real microphone permission is required by your browser.</p>';
 if(recorder?.state==="recording")h+='<button type="button" data-se-action="stop" data-se-id="'+esc(id)+'" data-se-level="'+level+'">■ Stop recording</button> <b>Recording (up to 40 seconds)…</b>';
 else h+='<button type="button" data-se-action="record" data-se-id="'+esc(id)+'" data-se-level="'+level+'" '+(busy?"disabled":"")+'>● Record answer</button>'+
 (blob?'<audio controls preload="metadata" src="'+esc(clipUrl)+'" aria-label="Play your recorded answer"></audio>'+
 '<button type="button" data-se-action="check" data-se-id="'+esc(id)+'" data-se-level="'+level+'" '+(busy?"disabled":"")+'>Check</button>':"");
 if(latest){
  h+='<div class="s3-result"><b>Practice feedback from actual audio · '+(latest.score===null?"No score":latest.score+"/5 internal practice score")+'</b>'+
  '<p>'+esc(latest.summary||"")+'</p>'+
  (latest.transcript?'<p><b>Heard:</b> '+esc(latest.transcript)+'</p>':"")+
  (latest.pronunciation?'<p><b>Pronunciation:</b> '+esc(latest.pronunciation)+'</p>':"")+
  (latest.priority?'<p><b>Fix first:</b> '+esc(latest.priority)+'</p>':"")+
  (latest.followup?'<p><b>Next question:</b> '+esc(latest.followup)+'</p>':"")+'</div>';
  if(r.round===0)h+='<button type="button" data-se-action="followup" data-se-level="'+level+'" data-se-id="'+esc(id)+'">Respond to follow-up →</button>';
 }
 if(r.attempts.length)h+='<p class="s3-tip">'+r.attempts.length+' recorded Check attempt(s). Speaking practice reports are NOT official IELTS bands; scores from short clips have limited reliability.</p>';
 if(notice)h+='<p role="status" class="s3-message">'+esc(notice)+'</p>';
 h+='</section>';return h;
}
function getKey(id,level){return level+":"+id}
function updatePanel(id,level){
 const key=getKey(id,level);if(current!==key){dispose();current=key;notice=""}
 const r=rec(key),q=r.round===1?r.attempts.find(a=>a.round===0)?.followup||"How would your view change under a different condition?":
 level==="Core"?(window.GKCoreSkills?.getUnit?.(id)?.transfer||"Explain the idea in spoken English."):
 (window.GKStage3PracticeData?.cases?.[id]?.text||window.GKStage3EvidenceData?.challenges?.[id]||"Answer the question in spoken English.");
 return body(id,level,r,q);
}
async function start(id,level){
 const key=getKey(id,level);
 if(busy||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){notice="Microphone recording is unavailable on this device.";refresh(level);return}
 dispose();current=key;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const formats=["audio/webm;codecs=opus","audio/mp4","audio/webm"];const mime=formats.find(x=>MediaRecorder.isTypeSupported?.(x));
  recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);parts=[];notice="";
  const session=recorder;
  session.ondataavailable=e=>{if(e.data?.size)parts.push(e.data)};
  session.onstop=()=>{
   stopTracks();if(current!==key||recorder!==session)return;
   blob=new Blob(parts,{type:session.mimeType||"audio/webm"});
   if(blob.size<2000){notice="Recording was too short or empty. Try again.";blob=null}
   else{clipUrl=URL.createObjectURL(blob);notice="Recording ready. Replay or press Check."}
   refresh(level);
  };
  session.start();timeout=setTimeout(()=>{if(session.state==="recording")session.stop()},MAX_MS);refresh(level);
 }catch(e){stopTracks();notice="Microphone permission or recording error: "+String(e?.message||"unavailable");refresh(level)}
}
async function check(id,level){
 const key=getKey(id,level);if(current!==key||!blob||busy)return;
 if(!window.GKCloudSync?.getIdToken){notice="Check needs a signed-in account. Your locally recorded clip is still available.";refresh(level);return}
 const convert=window.GKFoundationApplied?.makeWavBase64;
 if(typeof convert!=="function"){notice="Audio conversion is unavailable.";refresh(level);return}
 busy=true;notice="Checking actual audio…";refresh(level);
 const r=rec(key),round=r.round,task=level==="Core"?(window.GKCoreSkills?.getUnit?.(id)?.transfer||id):(window.GKStage3PracticeData?.cases?.[id]?.text||window.GKStage3EvidenceData?.challenges?.[id]||id);
 try{
  const token=await window.GKCloudSync.getIdToken();if(!token)throw Error("Sign in to use Check");
  const wav=await convert(blob);
  const payload={mode:"speaking",level,task:round?r.attempts.find(x=>x.round===0)?.followup||task:task,
   scenario:"Real recorded spoken response; "+(level==="Core"?"Core Skills Lab":"IELTS Academic Speaking practice"),meaningFocus:"Evaluate ONLY actual audible speech, relevance, accuracy, intelligibility and improvement. Short-clip feedback is not an official IELTS band.",
   checklist:["Answer the actual question","Develop clear relevant ideas","Use understandable grammar and vocabulary","Evaluate pronunciation only where audio supports it"],
   format:"wav",audioBase64:wav,revisionOf:r.attempts.slice(-1)[0]?.transcript||""};
  const url=location.hostname.endsWith(".vercel.app")?location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
  const resp=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const val=await resp.json().catch(()=>({}));if(!resp.ok)throw Error(val.error||"Assessment unavailable");
  if(val.source!=="openai-foundation"||val.mode!=="speaking")throw Error("Unexpected audio feedback");
  r.attempts.push({at:Date.now(),round,task:payload.task.slice(0,250),score:Number.isFinite(val.score)?val.score:null,
   status:String(val.task_status||""),summary:String(val.summary_vi||"").slice(0,650),transcript:String(val.transcript||"").slice(0,2000),
   pronunciation:String(val.pronunciation_vi||"").slice(0,550),priority:String(val.priority_fix_vi||"").slice(0,600),
   followup:String(val.revision_question||"").slice(0,360)});
  r.attempts=r.attempts.slice(-20);save();notice="Audio feedback ready. Review the specific correction and answer the follow-up.";
 }catch(e){notice="Check unavailable: "+String(e?.message||"connection error")}
 finally{busy=false;refresh(level)}
}
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-se-action]");if(!b)return;
 const {seAction:action,seId:id,seLevel:level}=b.dataset;
 if(!id||!["Core","IELTS"].includes(level)||current!==getKey(id,level))return;
 if(action==="record"){void start(id,level);return}
 if(action==="stop"){if(recorder?.state==="recording")recorder.stop();return}
 if(action==="check"){void check(id,level);return}
 if(action==="followup"){dispose();rec(getKey(id,level)).round=1;save();notice="Record a fresh spoken response to the follow-up question.";refresh(level)}
});
window.GKSpokenEvidence={panel:updatePanel,getRecord:(id,level)=>rec(getKey(id,level)),dispose};
})();