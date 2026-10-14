/* English Foundation: applied A1/A2. Evidence-first practice, never CEFR certification. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),units=[...(window.GKFoundationAppliedData?.units||[]),...(window.GKFoundationAppliedExtraData?.units||[])];
if(!root||!units.length)return;
const KEY="gk_foundation_applied_v1",unitMap=Object.fromEntries(units.map(u=>[u.id,u]));
const steps=[["understand","Understand"],["listening","Listen"],["reading","Read"],["language","Think & use"],["writing","Write & fix"],["speaking","Speak & respond"],["transfer","Transfer"]];
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=saved.records&&typeof saved.records==="object"?saved.records:{};
let current="",busy=false,status="",recorder=null,stream=null,chunks=[],clip=null,clipUrl="",recordStarted=0,cutoff=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b=(action,label,primary=false,disabled=false)=>'<button type="button" class="fa-btn '+(primary?"fa-primary":"")+'" data-fa-action="'+action+'" '+(disabled?"disabled":"")+'>'+label+'</button>';
function row(id){
 if(!records[id])records[id]={page:0,selections:{},checked:{},draft:"",speakingNotes:"",transfer:"",reports:{},attempts:0,lastPractised:"",firstPractised:"",history:[]};
 const r=records[id];r.selections=r.selections||{};r.checked=r.checked||{};r.reports=r.reports||{};r.history=Array.isArray(r.history)?r.history:[];return r;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({records,lastUnitId:current||saved.lastUnitId||""}))}catch(e){status="Không lưu được tiến độ trên thiết bị này."}}
function count(r){const t=["listening","reading","language"].reduce((sum,key)=>sum+(r.checked[key]?.correct||0),0);return{correct:t,total:6,checked:["listening","reading","language"].filter(k=>r.checked[k]).length,write:r.reports.writing?.task_status==="met",transfer:r.reports.transfer?.task_status==="met",speak:r.reports.speaking?.task_status==="met"}}
function studied(r){return!!(r.checked.listening||r.checked.reading||r.checked.language||r.draft||r.speakingNotes||r.transfer||r.reports.writing)}
function due(r){if(!r.lastPractised)return false;const next=Date.parse(r.lastPractised)+3*86400000;return Date.now()>=next}
function homePanel(){
 const a1=units.filter(u=>u.level==="A1"),a2=units.filter(u=>u.level==="A2"),worked=units.filter(u=>studied(row(u.id))).length;
 return '<section class="fa-home" aria-label="A1 and A2 real-world practice"><div class="fa-home-heading"><div><small>FOUNDATION · A1 / A2 REAL-LIFE PRACTICE</small><h3>Học qua tình huống, chứng minh bằng cách sử dụng</h3><p>'+units.length+' bài liên kỹ năng: nghe → đọc → chọn cách diễn đạt → viết → nói → áp dụng trong tình huống mới. Tất cả kết quả là bằng chứng luyện tập, không phải điểm CEFR.</p></div><div class="fa-count">'+worked+'/'+units.length+'<small>đã bắt đầu</small></div></div>'+
 '<div class="fa-home-actions">'+
 '<button type="button" data-f-action="applied" class="f-btn primary">Mở bài thực hành A1–A2 →</button>'+
 '<span class="fa-home-meta">'+a1.length+' bài A1 · '+a2.length+' bài A2 · Không xóa bài Foundation cũ</span></div></section>';
}
function stopAll(){
 try{window.GKYVoice?.stopConversation?.();window.speechSynthesis?.cancel()}catch(e){}
 if(recorder&&recorder.state!=="inactive")try{recorder.stop()}catch(e){}
 if(stream)stream.getTracks().forEach(track=>track.stop());stream=null;
 if(cutoff)clearTimeout(cutoff);cutoff=null;
 if(clipUrl)try{URL.revokeObjectURL(clipUrl)}catch(e){}
 clipUrl="";clip=null;recorder=null;chunks=[];
}
function open(id){
 if(!unitMap[id])return;stopAll();current=id;status="";render();
}
function list(){
 stopAll();current="";status="";
 const sections=["A1","A2"].map(level=>{
  const filtered=units.filter(u=>u.level===level);
  return '<section class="fa-level"><h2>'+level+' · Communication practice</h2><div class="fa-cards">'+filtered.map(u=>{
   const r=row(u.id),c=count(r),started=studied(r);
   return '<button type="button" class="fa-unit" data-fa-id="'+u.id+'"><small>'+u.level+' · '+(started?c.checked+' / 3 question sets checked':'Not started')+(due(r)?" · Review due":"")+'</small><strong>'+esc(u.title)+'</strong><span>'+esc(u.goal)+'</span><em>'+ (started?"Continue →":"Begin →")+'</em></button>';
  }).join("")+'</div></section>';
 }).join("");
 root.innerHTML='<div class="fa-shell"><div class="fa-top">'+b("exit","← Foundation home")+'<h1>Real-world English · A1 and A2</h1><p>Đây là phần thực hành mở rộng, không phải chứng nhận trình độ. Mỗi bài kiểm tra nghe, đọc, cấu trúc, viết và nói qua một bối cảnh khác nhau.</p></div>'+sections+'</div>';
}
function setPage(n){
 if(!current)return;
 if(steps[row(current).page][0]==="listening")try{window.GKYVoice?.stopConversation?.()}catch(e){}
 const r=row(current);r.page=Math.min(steps.length-1,Math.max(0,n));save();status="";render();
 try{root.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){}
}
function choices(u,r,key,arr){
 const previous=r.checked[key],sel=r.selections[key]||[null,null],checked=!!previous;
 let out='<div class="fa-questions">';
 arr.forEach((q,i)=>{
  out+='<fieldset class="fa-question"><legend>'+(i+1)+'. '+esc(q.prompt)+'</legend>';
  q.options.forEach((x,j)=>{
   const selected=sel[i]===j;
   out+='<button class="fa-option '+(checked?(j===q.correct?"correct":selected?"wrong":""):"")+'" type="button" data-fa-q="'+key+'" data-fa-n="'+i+'" data-fa-option="'+j+'" aria-pressed="'+selected+'" '+(checked?"disabled":"")+'><b>'+String.fromCharCode(65+j)+'</b>'+esc(x)+'</button>';
  });
  if(checked)out+='<p class="fa-feedback"><b>'+(sel[i]===q.correct?"Correct.":"Review this.")+'</b> '+esc(q.why||q.evidence)+'</p>';
  out+='</fieldset>';
 });
 if(!checked)out+=b("check-"+key,"Check",true,sel.length!==arr.length||sel.some(v=>v===null||v===undefined));
 else out+='<p class="fa-result">'+previous.correct+'/2 correct · '+(previous.correct<2?"Read the explanation. You can practise again, but repeating known questions is not a new test.":"You understood these questions; the next activity uses a different skill.")+'</p>'+b("retry-"+key,"Practise these questions again");
 return out+'</div>';
}
function explain(u){return '<div class="fa-contrast"><h3>What changes the meaning?</h3><p>'+esc(u.concept)+'</p><p lang="en">'+esc(u.contrast)+'</p></div>'}
function reportHtml(r,key,answer){
 const item=r.reports[key];if(!item)return'<p class="fa-tip">Chưa có đánh giá bài viết này. Check chỉ gửi yêu cầu khi bạn nhấn nút.</p>';
 if(item.answer!==answer.trim())return'<p class="fa-tip">Bạn đã sửa câu trả lời. Phản hồi trước chỉ áp dụng cho phiên bản cũ.</p>';
 const rep=item.report||{};
 let html='<div class="fa-ai-report"><small>Automated practice feedback · not an IELTS/CEFR score</small><h3>'+esc(rep.task_status==="met"?"Response addresses the task":rep.task_status==="off_topic"?"Answer does not match the task":"Review and improve your answer")+'</h3><p>'+esc(rep.summary_vi||"Read the correction, then revise.")+'</p>';
 if(rep.priority_fix_vi)html+='<p class="fa-priority"><strong>Fix this first:</strong> '+esc(rep.priority_fix_vi)+'</p>';
 if(rep.task_checks?.length)html+='<div class="fa-criteria">'+rep.task_checks.slice(0,4).map(x=>'<p><strong>'+esc(x.criterion)+': '+esc(x.status)+'</strong> '+esc(x.fix_vi||x.why_vi||"")+'</p>').join("")+'</div>';
 if(rep.mistakes?.length)html+='<details><summary>Corrections ('+rep.mistakes.length+')</summary>'+rep.mistakes.slice(0,3).map(x=>'<p>'+esc(x.original)+' → '+esc(x.correction)+' — '+esc(x.reason_vi)+'</p>').join("")+'</details>';
 if(rep.revision_question)html+='<p>'+esc(rep.revision_question)+'</p>';
 html+='</div>';return html;
}
function writingPanel(u,r,key){
 const task=u[key],value=String(r[key==="writing"?"draft":"transfer"]||"");
 const label=key==="writing"?"Your answer":"Your NEW situation answer";
 return '<div class="fa-work"><h3>'+esc(task.prompt)+'</h3><p class="fa-tip">Write your own English. The example is optional, not the answer key.</p><div class="fa-criteria">'+task.criteria.map((x,i)=>'<p>'+(i+1)+'. '+esc(x)+'</p>').join("")+'</div>'+
 '<label for="fa-'+key+'">'+label+'</label><textarea id="fa-'+key+'" data-fa-field="'+key+'" rows="6" placeholder="Write your answer in English…">'+esc(value)+'</textarea>'+
 b("check-"+key,"Check",true,busy||value.trim().length<10)+
 reportHtml(r,key,value)+
 (task.example?'<details><summary>Compare with one possible answer</summary><p lang="en">'+esc(task.example)+'</p><small>Do not simply copy this sentence.</small></details>':"")+'</div>';
}
function speakPanel(u,r){
 const report=r.reports.speaking?.report;
 return '<div class="fa-work"><h3>'+esc(u.speaking.prompt)+'</h3><p><b>Follow-up:</b> '+esc(u.speaking.followup)+'</p>'+
 '<p class="fa-tip">Record for up to 40 seconds. Your audio stays on this device unless you press Check. Checking sends it to the grading service; no audio recording is saved with your learning progress.</p>'+
 '<div class="fa-buttons">'+(recorder?.state==="recording"?b("stop","Stop recording",true):b("record","● Record",true))+'</div>'+
 (clipUrl?'<audio controls src="'+esc(clipUrl)+'"></audio>'+b("check-speaking","Check",true,busy):"")+
 '<label for="fa-speaking-notes">What did you want to say? (optional notes)</label><textarea id="fa-speaking-notes" data-fa-field="speakingNotes" rows="3" placeholder="Notes for yourself, not a speaking score">'+esc(r.speakingNotes||"")+'</textarea>'+
 (report?'<div class="fa-ai-report"><small>Spoken response: automated practice feedback, not IELTS/CEFR</small><p>'+esc(report.summary_vi||"")+'</p>'+(report.pronunciation_vi?'<p><b>Pronunciation observations:</b> '+esc(report.pronunciation_vi)+'</p>':"")+(report.priority_fix_vi?'<p><b>Improve:</b> '+esc(report.priority_fix_vi)+'</p>':"")+'</div>':
 '<p class="fa-tip">If your browser does not support recording, practise out loud with a partner or record locally using your device. No speaking score is claimed without audio evidence.</p>')+'</div>';
}
function render(){
 const u=unitMap[current];if(!u)return list();
 const r=row(current);r.page=Math.max(0,Math.min(steps.length-1,Number(r.page)||0));
 const currentStep=steps[r.page],type=currentStep[0],c=count(r);
 let body="";
 if(type==="understand")body='<div class="fa-situation"><small>REAL COMMUNICATIVE SITUATION</small><p>'+esc(u.scene)+'</p><h3>Your can-do goal</h3><p>'+esc(u.goal)+'</p></div>'+explain(u)+
 '<p class="fa-tip">Think: who is speaking, to whom, and what do they need? The meaning comes before the grammar label.</p>';
 if(type==="listening")body='<h3>Listen first. Keep the transcript closed.</h3><p>Listen to a conversation between '+esc([...new Set(u.dialog.map(x=>x.speaker))].join(" and "))+'. Answer based on what you hear. Audio uses synthetic voices installed on your device and is not authentic test audio.</p>'+
 b("play","▶ Play conversation",true)+
 choices(u,r,"listening",u.listening)+
 (r.checked.listening?'<details><summary>Read the transcript AFTER checking</summary><div class="fa-dialog">'+u.dialog.map(t=>'<p><b>'+esc(t.speaker)+':</b> '+esc(t.text)+'</p>').join("")+'</div></details>':
 '<p class="fa-tip">The transcript will unlock after you press Check.</p>');
 if(type==="reading")body='<h3>Read for meaning and evidence</h3><div class="fa-reading" lang="en">'+esc(u.reading)+'</div>'+
 '<p class="fa-tip">Find the sentence that proves each answer; avoid keyword matching alone.</p>'+choices(u,r,"reading",u.readingQuestions);
 if(type==="language")body=explain(u)+
 '<div class="fa-words"><h3>Six useful words and combinations</h3>'+u.words.map(w=>'<div><strong>'+esc(w[0])+'</strong><span>'+esc(w[1])+'</span><small>'+esc(w[2]||"")+'</small></div>').join("")+'</div>'+
 '<h3>Which expression communicates the correct meaning?</h3>'+choices(u,r,"language",u.language);
 if(type==="writing")body=writingPanel(u,r,"writing");
 if(type==="speaking")body=speakPanel(u,r);
 if(type==="transfer")body='<div class="fa-transfer"><h3>New situation — can you use the idea independently?</h3><p>This context differs from the worked examples. Explain your answer rather than copying a model.</p></div>'+writingPanel(u,r,"transfer")+
 '<div class="fa-evidence"><h3>What is actually demonstrated?</h3><p>Listening: '+(r.checked.listening?r.checked.listening.correct+"/2 checked":"not checked")+
 ' · Reading: '+(r.checked.reading?r.checked.reading.correct+"/2 checked":"not checked")+
 ' · Language use: '+(r.checked.language?r.checked.language.correct+"/2 checked":"not checked")+'</p>'+
 '<p>Writing: '+(c.write?"automated rubric met":r.draft?"attempted (not yet verified)":"not attempted")+
 ' · Speaking: '+(c.speak?"automated audio rubric met":r.speakingNotes?"practised (not verified)":"not verified")+
 ' · Transfer: '+(c.transfer?"automated rubric met":r.transfer?"attempted (not yet verified)":"not attempted")+'</p>'+
 '<p>This is a training record. A CEFR A1/A2 conclusion requires independent, varied assessment across skills.</p></div>'+
 b("review-later","Save & return to lessons",true);
 const ratio=Math.round(((r.page+1)/steps.length)*100);
 root.innerHTML='<div class="fa-shell"><div class="fa-top fa-lesson-head"><div class="fa-nav">'+b("list","← All A1/A2 lessons")+'<span>'+esc(u.level)+' · '+esc(u.title)+'</span></div><h1>'+esc(currentStep[1])+'</h1><p>'+esc(u.goal)+'</p><div class="fa-bar"><span style="width:'+ratio+'%"></span></div><small>Activity '+(r.page+1)+' / '+steps.length+' · This bar shows navigation, not proficiency</small></div>'+
 '<section class="fa-main">'+body+(status?'<p class="fa-status" role="status">'+esc(status)+'</p>':"")+'</section>'+
 '<footer class="fa-nav fa-footer">'+b("previous","← Previous",false,r.page===0)+b("next","Next →",true,r.page>=steps.length-1)+'</footer></div>';
 save();
}
function performCheck(key){
 const u=unitMap[current],r=row(current),qs=key==="listening"?u.listening:key==="reading"?u.readingQuestions:u.language;
 const sel=r.selections[key]||[];
 if(r.checked[key]||sel.length!==2||sel.some(v=>!Number.isInteger(v)))return;
 const correct=qs.reduce((n,q,i)=>n+(q.correct===sel[i]?1:0),0);
 r.checked[key]={correct,at:new Date().toISOString(),round:(r.checked[key]?.round||0)+1};
 const now=new Date().toISOString();r.lastPractised=now;if(!r.firstPractised)r.firstPractised=now;
 r.history.push({task:key,score:correct,at:now});r.history=r.history.slice(-40);save();render();
}
function changeAnswer(key,n,v){
 const r=row(current),qs=key==="listening"?unitMap[current].listening:key==="reading"?unitMap[current].readingQuestions:unitMap[current].language;
 if(r.checked[key]||!qs[n]||v<0||v>=qs[n].options.length)return;
 const a=r.selections[key]||[null,null];a[n]=v;r.selections[key]=a;save();render();
}
function compact(data){
 const slice=(s,n)=>String(s||"").slice(0,n);
 return {source:data.source,score:data.score,task_status:data.task_status,
 summary_vi:slice(data.summary_vi||data.task_feedback_vi,900),priority_fix_vi:slice(data.priority_fix_vi,600),
 revision_question:slice(data.revision_question,500),
 pronunciation_vi:slice(data.pronunciation_vi,600),
 task_checks:(data.task_checks||[]).slice(0,4).map(x=>({criterion:slice(x.criterion,130),status:x.status,fix_vi:slice(x.fix_vi||x.why_vi,250)})),
 mistakes:(data.mistakes||[]).slice(0,3).map(x=>({original:slice(x.original,150),correction:slice(x.correction,150),reason_vi:slice(x.reason_vi,220)}))};
}
async function sendCheck(key,audio){
 if(busy||!current)return;
 const id=current,u=unitMap[id],r=row(id),isAudio=key==="speaking";
 const val=isAudio?"":String(r[key==="writing"?"draft":"transfer"]||"").trim();
 if(!isAudio&&val.length<10){status="Write a meaningful answer first.";render();return}
 if(!isAudio&&r.reports[key]?.answer===val){status="This exact answer was already checked. Revise it before checking again.";render();return}
 if(isAudio&&!clip){status="Record an answer first.";render();return}
 if(!window.GKCloudSync?.getIdToken){status="Check is unavailable until Google sign-in is configured. Your answer stays saved.";render();return}
 busy=true;status="Checking…";render();
 try{
  const token=await window.GKCloudSync.getIdToken();
  if(!token)throw Error("Sign in to use Check. Your practice is saved.");
  const task=isAudio?u.speaking:key==="writing"?u.writing:u.transfer;
  const criteria=isAudio?["Answer the speaking question","Address the follow-up","Speak intelligibly at this level"]:task.criteria;
  const payload={mode:isAudio?"speaking":"writing",level:u.level,
   scenario:u.scene,task:task.prompt+(isAudio?" Follow-up: "+task.followup:""),goal:u.goal,
   checklist:criteria,meaningFocus:u.concept,example:key==="writing"?u.writing.example:"",revisionOf:r.reports[key]?.answer||""};
  if(isAudio){payload.format="wav";payload.audioBase64=await makeWavBase64(clip);}
  else payload.answer=val;
  const ep=location.hostname.endsWith(".vercel.app")?location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
  const response=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||"Check unavailable (HTTP "+response.status+")");
  if(data.source!=="openai-foundation")throw Error("Invalid feedback");
  r.reports[key]={answer:isAudio?"audio checked":val,report:compact(data),task_status:data.task_status,at:new Date().toISOString()};
  r.lastPractised=new Date().toISOString();
  r.history.push({task:key,check:data.task_status,at:r.lastPractised});
  r.history=r.history.slice(-40);
  save();status="Checked. Fix the main issue and try a new answer.";
 }catch(e){status="Check unavailable: "+String(e?.message||"connection error");}
 finally{busy=false;if(current===id)render();}
}
async function makeWavBase64(blob){
 const ab=await blob.arrayBuffer(),AudioCtx=window.AudioContext||window.webkitAudioContext;
 if(!AudioCtx)throw Error("Your browser cannot process recorded audio.");
 const context=new AudioCtx();
 try{
  const original=await context.decodeAudioData(ab.slice(0)),rate=16000,frames=Math.floor(original.duration*rate);
  if(frames<rate)return Promise.reject(Error("Record at least 1 second of speech."));
  if(frames>rate*45)throw Error("Keep your answer under 45 seconds.");
  const offline=new OfflineAudioContext(1,frames,rate);
  const buffer=offline.createBuffer(1,original.length,original.sampleRate);
  const chan=buffer.getChannelData(0);
  for(let i=0;i<original.length;i++){let x=0;for(let n=0;n<original.numberOfChannels;n++)x+=original.getChannelData(n)[i];chan[i]=x/original.numberOfChannels;}
  const src=offline.createBufferSource();src.buffer=buffer;src.connect(offline.destination);src.start();
  const rendered=await offline.startRendering(),samples=rendered.getChannelData(0),raw=new ArrayBuffer(44+samples.length*2),v=new DataView(raw);
  const wr=(offset,s)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};
  wr(0,"RIFF");v.setUint32(4,36+samples.length*2,true);wr(8,"WAVE");wr(12,"fmt ");
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);
  wr(36,"data");v.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++){const x=Math.max(-1,Math.min(1,samples[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true);}
  const bytes=new Uint8Array(raw),parts=[];for(let i=0;i<bytes.length;i+=16384)parts.push(String.fromCharCode(...bytes.subarray(i,i+16384)));
  return btoa(parts.join(""));
 }finally{await context.close().catch(()=>{});}
}
async function record(){
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){status="Recording is not supported on this device.";render();return}
 try{
  stopAll();stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const types=["audio/webm;codecs=opus","audio/mp4","audio/webm"],mime=types.find(t=>MediaRecorder.isTypeSupported(t));
  recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);chunks=[];recordStarted=Date.now();
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onstop=()=>{
   if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;
   if(cutoff)clearTimeout(cutoff);cutoff=null;
   if(chunks.length){clip=new Blob(chunks,{type:recorder?.mimeType||"audio/webm"});clipUrl=URL.createObjectURL(clip);status="Audio recorded locally. Replay it or press Check."}
   else status="The recording was empty. Try again.";
   render();
  };
  recorder.start();status="Recording… speak for up to 40 seconds.";render();
  cutoff=setTimeout(()=>{if(recorder?.state==="recording")recorder.stop()},40000);
 }catch(e){status="Microphone unavailable: "+String(e?.message||"permission denied");if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;render()}
}
function play(){
 const u=unitMap[current],lines=u.dialog;
 if(window.GKYVoice?.playConversation){
  const r=window.GKYVoice.playConversation(lines,{locale:"en-NZ",rate:.92,onError:()=>{status="The voice system could not play audio. Check your browser voices.";render()}});
  if(!r?.ok){status=r?.reason||"Audio playback unavailable.";render()}
 }else{status="Audio playback is unavailable on this device.";render()}
}
root.addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button||!root.contains(button))return;
 const id=button.dataset.faId;if(id){open(id);return}
 if(!current&&button.dataset.faAction!=="exit")return;
 const a=button.dataset.faAction,u=unitMap[current],r=current?row(current):null;
 if(button.dataset.faQ){changeAnswer(button.dataset.faQ,Number(button.dataset.faN),Number(button.dataset.faOption));return}
 if(a==="exit"){stopAll();current="";window.GKFoundationOpenHome?.();return}
 if(a==="list"){list();return}
 if(a==="previous"){setPage(r.page-1);return}
 if(a==="next"){setPage(r.page+1);return}
 if(a==="play"){play();return}
 if(a==="record"){void record();return}
 if(a==="stop"){if(recorder?.state==="recording")recorder.stop();return}
 if(a?.startsWith("check-")){
  const key=a.slice(6);
  if(["listening","reading","language"].includes(key))performCheck(key);
  else if(["writing","transfer","speaking"].includes(key))void sendCheck(key);
  return;
 }
 if(a?.startsWith("retry-")){
  const key=a.slice(6);if(["listening","reading","language"].includes(key)){r.checked[key]=null;r.selections[key]=[null,null];status="This repeats known questions; it is practice, not a new assessment.";save();render()}
  return;
 }
 if(a==="review-later"){r.lastPractised=new Date().toISOString();save();list();}
});
root.addEventListener("input",event=>{
 if(!current)return;
 const key=event.target.dataset?.faField,r=row(current);
 if(key==="writing")r.draft=event.target.value;
 if(key==="transfer")r.transfer=event.target.value;
 if(key==="speakingNotes")r.speakingNotes=event.target.value;
 if(["writing","transfer","speakingNotes"].includes(key)){const now=new Date().toISOString();if(!r.firstPractised)r.firstPractised=now;r.lastPractised=now;save()}
});
window.GKFoundationApplied={open,render,list,homePanel,getRecord:row,units,steps};
})();