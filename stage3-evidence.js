/* IELTS Academic Stage 3 task-specific evidence studio.
 * Evidence recorded != answer verified != official band.
 */
(function(){
"use strict";
const catalog=window.GKStage3EvidenceData;if(!catalog)return;
const KEY="gk_stage3_evidence_v1";
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=stored.records||{},esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let current="",info=null,busy=false,message="",overlay=null;
const row=id=>records[id]||(records[id]={source:"",evidence:"",answer:"",repair:"",feedback:null,checks:[],attempts:[],reviewAt:null,reviewHistory:[]});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({records}))}catch(e){message="Không thể lưu dữ liệu trên thiết bị."}};
const allowed=id=>!!catalog.challenges[id];
const rubrics=skill=>catalog.rubrics[skill]||catalog.rubrics.support;
const official="https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test";
function timeLabel(t){if(!t)return"Not scheduled";return new Date(t).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}
function status(id){
 const a=records[id];if(!a)return"Chưa lưu bằng chứng";
 if(a.attempts?.length)return"Đã ghi hồ sơ thực hành (chưa chứng minh đúng)";
 if(a.answer||a.evidence)return"Đang ghi bằng chứng";
 return"Chưa lưu bằng chứng";
}
function summary(){
 const ids=Object.keys(catalog.challenges);
 return{tasks:ids.length,ielts:ids.filter(id=>!catalog.unscoredSupport.includes(id)).length,support:catalog.unscoredSupport.length,
 attempted:ids.filter(id=>records[id]?.answer||records[id]?.evidence).length,documented:ids.filter(id=>records[id]?.attempts?.length>0).length,
 due:ids.filter(id=>records[id]?.reviewAt&&Date.now()>=records[id].reviewAt).length};
}
function homePanel(){
 const s=summary();
 return '<section class="s3-home"><h3>Independent IELTS Task Evidence</h3><p>'+s.ielts+' IELTS Academic practice tasks + '+s.support+' support/repair tasks. '+s.documented+' hồ sơ thực hành đã ghi; '+s.due+' đến lượt tự kiểm tra lại. Đây là các bản ghi việc học, KHÔNG phải số câu đúng hay band.</p>'+
 '<p>IELTS Listening cần audio người thật; Reading cần passages gốc; Writing và Speaking cần đánh giá bài làm thực tế. Một task có checklist không tự chứng minh đạt mục tiêu.</p></section>';
}
function createOverlay(){
 if(overlay)return overlay;
 overlay=document.createElement("div");overlay.id="stage3EvidenceOverlay";overlay.className="s3-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label","IELTS Practice Evidence");
 document.body.appendChild(overlay);
 return overlay;
}
function open(t){
 if(typeof t==="string")t={id:t,title:t,skill:/^L/.test(t)?"listening":/^R/.test(t)?"reading":/^W/.test(t)?"writing":/^S/.test(t)?"speaking":"support"};
 if(!t||!allowed(t.id))return false;
 current=t.id;info=t;message="";createOverlay();render();return true;
}
function close(){current="";info=null;if(overlay){overlay.remove();overlay=null}message=""}
function sourceLink(skill){
 if(skill==="listening")return official+"#listening";
 if(skill==="reading")return official+"#academic-reading";
 if(skill==="writing")return official+"#academic-writing";
 return official+"#speaking";
}
function checkStatus(r){
 const missing=[];
 if(r.source.trim().length<6)missing.push("Tên đề/audio/passage và nguồn luyện");
 if(r.evidence.trim().length<16)missing.push("Bằng chứng cụ thể từ nguồn hoặc bài làm");
 if(r.answer.trim().length<20)missing.push("Bài làm hoặc phần giải thích tự viết");
 if(r.repair.trim().length<15)missing.push("Phần sửa lỗi / hướng luyện tiếp");
 return missing;
}
function render(){
 if(!current)return;const id=current,t=info,r=row(id),kind=t.skill,challenge=catalog.challenges[id],source=sourceLink(kind),missing=checkStatus(r);
 const hasScore=!!(window.GKIELTSProgress?.()?.rows||[]).find(x=>x.id===id&&x.latest?.score!==undefined);
 const guidance=kind==="listening"?"Bạn cần nghe bản ghi thật TRƯỚC khi đọc transcript. Ghi đoạn thời gian và đối chiếu sau khi thử. Giọng TTS trên trang không thay audio thi.":
 kind==="reading"?"Dùng đoạn đọc mới. Chỉ ra bằng chứng trong văn bản; không chọn câu vì trùng keyword hoặc suy diễn.":
 kind==="speaking"?"Bắt buộc luyện bằng giọng nói thực, nhận câu hỏi follow-up và nghe lại. Ghi chú chữ không chấm được phát âm, độ trôi chảy hay phản xạ.":
 kind==="writing"?"Viết bài mới theo đề thật, đúng yêu cầu, thời gian và loại bài; không lấy số từ làm band. Review bằng các tiêu chí IELTS tương ứng.":
 "Dựa vào lỗi thật từ bài đã học; tránh tạo điểm IELTS từ một bài sửa ngữ pháp.";
 let h='<div class="s3-backdrop" data-s3-action="close"></div><div class="s3-dialog"><header class="s3-header"><div><small>STAGE 3 · '+esc(kind.toUpperCase())+' · '+esc(id)+'</small><h2>'+esc(t.title||id)+'</h2><p>'+esc(t.desc||"")+'</p></div><button type="button" data-s3-action="close" aria-label="Close">✕</button></header>'+
 '<div class="s3-content"><section class="s3-panel"><h3>01 · Goal and misconception</h3><p>'+esc(challenge)+'</p><p class="s3-tip">'+esc(guidance)+'</p>'+
 '<p><a href="'+source+'" target="_blank" rel="noopener noreferrer">Official IELTS Academic practice and test format ↗</a></p></section>'+
 '<section class="s3-panel"><h3>02 · What evidence is necessary?</h3><ol>'+rubrics(kind).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
 '<p class="s3-tip">Lưu ý: phiên bản hiện có chỉ kiểm tra bạn đã ghi đủ thông tin; nó KHÔNG tự chấm đúng/sai của audio, passage hoặc phát âm.</p></section>'+
 '<section class="s3-panel"><h3>03 · Perform → Explain → Fix</h3>'+
 '<label for="s3Source">Source / test ID (recording, passage, cue card, chart)</label><input id="s3Source" data-s3-field="source" maxlength="220" value="'+esc(r.source)+'" placeholder="e.g. IELTS Academic sample, Listening Part 2, question 14">'+
 '<label for="s3Evidence">Specific evidence (e.g., timestamp, passage phrase, data point, feedback)</label><textarea id="s3Evidence" data-s3-field="evidence" rows="3" maxlength="2800" placeholder="Point to the actual relevant evidence…">'+esc(r.evidence)+'</textarea>'+
 '<label for="s3Answer">Your own answer / reasoning or short excerpt from your own draft</label><textarea id="s3Answer" data-s3-field="answer" rows="5" maxlength="4000" placeholder="Your own original response…">'+esc(r.answer)+'</textarea>'+
 '<label for="s3Repair">Correction and next independent practice</label><textarea id="s3Repair" data-s3-field="repair" rows="4" maxlength="2400" placeholder="What was wrong or uncertain? What will you do differently in a NEW task?">'+esc(r.repair)+'</textarea>'+
 '<button type="button" data-s3-action="check" class="s3-primary">Check</button>'+
 (missing.length?'<p class="s3-tip">Chưa đủ dữ liệu: '+missing.map(esc).join("; ")+'.</p>':
 '<p class="s3-tip">Đã đủ các trường thông tin để kiểm tra cấu trúc hồ sơ. Chưa xác minh độ chính xác.</p>')+
 '</section>';
 if(kind==="writing"){
  h+='<section class="s3-panel"><h3>04 · Optional writing feedback</h3><p>Chỉ đánh giá phần tiếng Anh bạn tự nhập và yêu cầu đã ghi, không thể xem biểu đồ/đề gốc chỉ từ tên nguồn. Đây không phải giám khảo IELTS.</p>'+
  '<button type="button" data-s3-action="writing" class="s3-primary" '+(busy||r.answer.trim().length<25?"disabled":"")+'>Check</button>'+
  (r.feedback?.answer===r.answer.trim()?'<div class="s3-result"><b>Automated practice feedback</b><p>'+esc(r.feedback.report.summary_vi||"")+'</p><p>'+esc(r.feedback.report.priority_fix_vi||"")+'</p></div>':r.feedback?'<p>Feedback cũ không áp dụng sau khi sửa bài.</p>':"")+'</section>';
 }
 const attempts=r.attempts||[];
 h+='<section class="s3-panel"><h3>Review · Evidence over time</h3><p>'+attempts.length+' hồ sơ đã ghi; ngày ôn kế tiếp: '+esc(timeLabel(r.reviewAt))+'.</p>'+
 '<p>Check chỉ xác nhận có thông tin trong từng phần. Để kết luận học đúng, hãy đối chiếu nguồn chính thức hoặc được giáo viên đánh giá, rồi thử một đề khác sau vài ngày.</p>'+
 (r.reviewAt&&Date.now()>=r.reviewAt?'<button type="button" data-s3-action="review" class="s3-primary">Mark review attempted</button>':"")+
 '<p class="s3-tip">Bài lặp lại không được tính là đề unseen mới. Các checkpoint /40 hoặc speaking/writing chỉ có giá trị luyện tập theo nguồn thực tế và rubric tương ứng.</p></section>'+
 (message?'<p class="s3-message" role="status">'+esc(message)+'</p>':"")+
 '</div><footer class="s3-footer"><span>'+esc(status(id))+'</span><button type="button" data-s3-action="close">Save & close</button></footer></div>';
 overlay.innerHTML=h;
}
function check(){
 const r=row(current),missing=checkStatus(r);
 if(missing.length){message="Chưa đủ hồ sơ: "+missing.join("; ")+". Chưa được coi là đã kiểm tra độ chính xác.";render();return}
 const at=Date.now();r.attempts=r.attempts||[];
 r.attempts.push({at,kind:"evidence-log",source:r.source.slice(0,160),accuracyVerified:false});
 r.attempts=r.attempts.slice(-20);
 r.reviewAt=at+86400000;save();message="Đã lưu hồ sơ luyện tập. Đây KHÔNG phải điểm hay bằng chứng bài làm đúng.";render();
}
async function writing(){
 const id=current,t=info,r=row(id),answer=r.answer.trim();if(busy||answer.length<25)return;
 if(!window.GKCloudSync?.getIdToken){message="Check cần đăng nhập hợp lệ; bản nháp đã lưu.";render();return}
 busy=true;message="Checking…";render();
 try{
  const token=await window.GKCloudSync.getIdToken();if(!token)throw Error("Sign in to use Check");
  const payload={mode:"writing",level:"IELTS",goal:catalog.challenges[id],scenario:"Skill: "+t.skill+"; Task: "+t.title+"; Source supplied by learner: "+r.source,
  task:catalog.challenges[id],checklist:rubrics(t.skill),meaningFocus:"Judge ONLY the submitted written excerpt. Do not invent facts about an unseen chart or unprovided source. This cannot establish an IELTS band.",
  answer,revisionOf:r.feedback?.answer||""};
  const url=location.hostname.endsWith(".vercel.app")?location.origin+"/api/foundation-grade":"https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade";
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||"Check unavailable");if(data.source!=="openai-foundation")throw Error("Unexpected feedback");
  r.feedback={answer,at:Date.now(),report:{task_status:data.task_status,summary_vi:String(data.summary_vi||"").slice(0,1200),priority_fix_vi:String(data.priority_fix_vi||"").slice(0,700)}};save();message="Đã có phản hồi luyện tập cho phần văn bản; không phải band IELTS.";
 }catch(e){message="Check unavailable: "+String(e?.message||"network error")}
 finally{busy=false;if(current===id)render()}
}
function review(){
 const r=row(current);if(!r.reviewAt||Date.now()<r.reviewAt)return;
 r.reviewHistory=r.reviewHistory||[];r.reviewHistory.push({at:Date.now(),accuracyVerified:false});r.reviewHistory=r.reviewHistory.slice(-15);
 const n=r.reviewHistory.length,delay=[1,3,7,14][Math.min(n,3)];
 r.reviewAt=Date.now()+delay*86400000;save();message="Đã ghi thời điểm ôn. Việc kiểm tra chính xác vẫn cần bằng chứng từ đề hoặc giáo viên.";render();
}
function handleClick(e){
 if(!overlay||!current)return;const node=e.target.closest?.("[data-s3-action]");
 if(!node||!overlay.contains(node))return;
 const act=node.dataset.s3Action;
 if(act==="close"){close();return}
 if(act==="check"){check();return}
 if(act==="writing"){void writing();return}
 if(act==="review"){review();return}
}
document.addEventListener("click",handleClick);
document.addEventListener("input",e=>{
 if(!overlay||!current)return;const field=e.target.dataset?.s3Field;
 if(!["source","evidence","answer","repair"].includes(field))return;
 const max={source:220,evidence:2800,answer:4000,repair:2400}[field];
 row(current)[field]=e.target.value.slice(0,max);save();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&current)close()});
window.GKStage3Evidence={open,close,status,summary,homePanel,getRecord:row,extras:catalog.extras};
window.flexRenderHome?.();
})();