/* Stage 2: new-context checks + own production. No inferred speaking grade from notes. */
(function(){
"use strict";
const root=document.getElementById("coreSkillsRoot"),pack=window.GKStage2EvidenceData?.entries;
if(!root||!pack)return;
const KEY="gk_stage2_evidence_v1";
let old={};try{old=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=old.records||{},esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let pending="",notice="";
const rec=id=>records[id]||(records[id]={chosen:null,check:null,draft:"",feedback:null,reflection:"",revision:""});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({records}))}catch(e){notice="Unable to save practice evidence."}};
function label(id){const r=rec(id);if(r.feedback?.report?.task_status==="met")return"Corrected & checked (automated)";if(r.draft.trim())return"Own response saved";if(r.check)return"Meaning checked";return"Unseen check available";}
function homePanel(){
 const tried=Object.keys(pack).filter(id=>records[id]&&(records[id].check||records[id].draft)).length;
 return '<div class="cs-method"><b>Independent Skill Evidence · '+tried+'/30 bài có bài làm</b><p>Mỗi kỹ năng có câu kiểm tra tình huống mới, một bài tự vận dụng và phản hồi sửa lỗi tùy chọn. Hai câu hỏi trắc nghiệm cũ không được coi là đạt kỹ năng. Chỉ nội dung mới được kiểm tra là bằng chứng độc lập ban đầu; làm lại cùng câu là ôn.</p></div>';
}
function renderEvidence(id){
 const d=pack[id];if(!d)return"";
 const r=rec(id),checked=!!r.check,correct=checked&&r.check.correct;
 let h='<section class="cs-evidence"><h3>05 · Independent application checkpoint</h3>'+
 '<p class="cs-subdued">Bài mới, không trùng với hai câu trắc nghiệm ở phần trước. Sau khi Check, đáp án sẽ được mở; câu đã nhìn thấy không còn là đề độc lập ở lần sau.</p>'+
 '<p><b>Context:</b> '+esc(d.context)+'</p><fieldset class="cs-question"><legend>'+esc(d.question)+'</legend><div class="cs-options">'+
 d.options.map((opt,i)=>'<button type="button" class="cs-option '+(checked?(i===d.correct?"correct":i===r.chosen?"wrong":""):"")+'" data-s2-opt="'+i+'" data-s2-id="'+id+'" '+(checked?"disabled":"")+' aria-pressed="'+(r.chosen===i)+'>'+esc(opt)+'</button>').join("")+'</div></fieldset>';
 if(checked)h+='<div class="cs-explain"><b>'+(correct?"Correct.":"Fix the misconception.")+'</b> '+esc(d.why)+'</div>';
 else h+='<button class="cs-btn primary" type="button" data-s2-action="check" data-s2-id="'+id+'" '+(!Number.isInteger(r.chosen)?"disabled":"")+'>Check</button>';
 h+='<div class="cs-assignment"><strong>06 · Unseen transfer task</strong><p>'+esc(d.challenge)+'</p><small>Expected evidence: '+d.criteria.map(esc).join("; ")+'.</small></div>'+
 '<label for="s2Draft">Your independent answer (English; this field does not assess oral delivery)</label><textarea id="s2Draft" data-s2-input="'+id+'" rows="5" maxlength="4000">'+esc(r.draft)+'</textarea>'+
 '<div class="cs-actions"><button class="cs-btn primary" type="button" data-s2-action="feedback" data-s2-id="'+id+'" '+(pending||r.draft.trim().length<12?"disabled":"")+'>Check</button></div>';
 if(r.feedback){
  if(r.feedback.answer!==r.draft.trim())h+='<p class="cs-subdued">Your response changed. Old feedback is now out of date.</p>';
  else if(r.feedback.report){
   const f=r.feedback.report;
   h+='<div class="cs-explain"><b>Automated feedback — not IELTS band</b><p>'+esc(f.summary_vi||"")+'</p>'+
   (f.priority_fix_vi?'<p><b>Fix:</b> '+esc(f.priority_fix_vi)+'</p>':"")+
   (f.task_checks||[]).map(x=>'<p>'+esc(x.criterion)+': '+esc(x.status)+' — '+esc(x.fix_vi||"")+'</p>').join("")+'</div>';
  }
 }
 h+='<label for="s2Revision">Revision: what exactly did you change?</label><textarea id="s2Revision" data-s2-revision="'+id+'" rows="3" maxlength="1000">'+esc(r.revision)+'</textarea>'+
 '<p class="cs-subdued">For Listening, this text does not measure real listening. For Speaking, a written plan does not measure pronunciation/interaction. Use actual recordings and a conversation with follow-up for those outcomes.</p>'+
 (notice?'<p class="cs-explain" role="status">'+esc(notice)+'</p>':"")+'</section>';
 return h;
}
async function checkProduction(id){
 const d=pack[id],r=rec(id),answer=r.draft.trim();
 if(pending||answer.length<12)return;
 if(r.feedback?.answer===answer){notice="Revise your answer before submitting the same text again.";window.GKCoreSkills?.render();return}
 if(!window.GKCloudSync?.getIdToken){notice="Check requires sign-in. Your draft is still saved.";window.GKCoreSkills?.render();return}
 pending=id;notice="Checking…";window.GKCoreSkills?.render();
 try{
  const token=await window.GKCloudSync.getIdToken();if(!token)throw Error("Sign in to use Check");
  const payload={mode:"writing",level:"Pre-IELTS",goal:"Explain and transfer the identified language skill in a new situation",scenario:d.context,task:d.challenge,checklist:d.criteria,
  meaningFocus:"Follow the task exactly; independent English, adequate evidence, accurate meaning. Written evidence is NOT speech performance.",
  answer,revisionOf:r.feedback?.answer||""};
  const url=location.hostname.endsWith(".vercel.app")?location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
  const resp=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const val=await resp.json().catch(()=>({}));if(!resp.ok)throw Error(val.error||"Check unavailable");if(val.source!=="openai-foundation")throw Error("Unexpected response");
  r.feedback={answer,at:Date.now(),report:{task_status:val.task_status,summary_vi:String(val.summary_vi||"").slice(0,800),priority_fix_vi:String(val.priority_fix_vi||"").slice(0,500),task_checks:(val.task_checks||[]).slice(0,3).map(x=>({criterion:String(x.criterion||"").slice(0,120),status:x.status,fix_vi:String(x.fix_vi||"").slice(0,270)}))}};save();notice="Review the correction, revise, then transfer again.";
 }catch(e){notice="Check unavailable: "+String(e?.message||"network issue")}finally{pending="";window.GKCoreSkills?.render()}
}
root.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b||!root.contains(b))return;
 const id=b.dataset.s2Id;if(!id||!pack[id])return;const r=rec(id);
 if(b.dataset.s2Opt!==undefined&&!r.check){r.chosen=Number(b.dataset.s2Opt);save();window.GKCoreSkills?.render();return}
 if(b.dataset.s2Action==="check"&&!r.check&&Number.isInteger(r.chosen)){r.check={correct:r.chosen===pack[id].correct,at:Date.now(),first:true};save();notice="Explanation available. The same item is now practice, not unseen assessment.";window.GKCoreSkills?.render();return}
 if(b.dataset.s2Action==="feedback"){void checkProduction(id);return}
});
root.addEventListener("input",e=>{
 const id=e.target.dataset?.s2Input,revision=e.target.dataset?.s2Revision;if(id&&pack[id]){rec(id).draft=e.target.value.slice(0,4000);save();root.querySelector('button[data-s2-action="feedback"][data-s2-id="'+id+'"]')?.removeAttribute("disabled")}
 if(revision&&pack[revision]){rec(revision).revision=e.target.value.slice(0,1000);save()}
});
window.GKStage2Evidence={homePanel,renderEvidence,getRecord:rec,label};
})();