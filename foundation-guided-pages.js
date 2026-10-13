/* Guided Foundation screens: level-specific idea planning, writing feedback, and repair. */
(function(){
"use strict";
const host=document.getElementById("foundationRoot");
if(!host)return;
const guides=window.GKFoundationGuides||{};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function info(l){return guides[l.id]||{planFields:[],model:l.produce?.[2]||"",why:l.explain||"",commonError:"",correction:"",transfer:"Use the idea in a different situation."}}
function plan(l,r,m){
 const g=info(l),filled=g.planFields.filter(f=>String(r.planAnswers?.[f.id]||"").trim().length>=2).length;
 return '<div class="gf-activity-header"><h2>Build your ideas before writing</h2><p>'+esc(m.writing)+'</p></div>'+
 '<div class="gf-plan-prompts">'+g.planFields.map((f,i)=>'<label class="gf-plan-row"><span><b>'+(i+1)+'</b>'+esc(f.label)+'</span><input type="text" data-gfg-plan="'+esc(f.id)+'" autocomplete="off" value="'+esc(r.planAnswers?.[f.id]||"")+'" placeholder="One idea (English or Vietnamese)"></label>').join("")+'</div>'+
 '<button type="button" class="gf-btn primary" data-gfg-action="check-plan">✓ Check my plan</button>'+
 (r.planReviewed?'<div class="gf-plan-feedback" role="status"><strong>'+(filled===g.planFields.length?"✓ All ideas included":"Still missing an idea")+'</strong><p>'+(filled===g.planFields.length?"Your plan covers this task. Write these ideas as complete sentences on the next screen.":"Fill in the empty prompt(s) above. Then check again.")+'</p></div>':'')+
 '<details class="gf-reveal"><summary>Need an example? See one possible answer</summary><p lang="en">'+esc(g.model)+'</p><p>'+esc(g.why)+'</p></details>'+
 '<p class="gf-tip">The check above checks whether your plan has all parts. It does not assess English grammar; writing feedback is on the next screen.</p>';
}
function writing(l,r,m){
 const g=info(l),report=window.GKFoundationCoach?.getRecord(l.id)?.writing;
 const matched=!!report?.report&&report.answer?.trim()===r.draft.trim();
 const stale=!!report?.report&&!matched;
 return '<div class="gf-activity-header"><h2>Answer the exact question</h2><p>'+esc(m.writing)+'</p></div>'+
 '<div class="gf-task-criteria">'+m.checklist.map((x,i)=>'<div><b>'+(i+1)+'</b><span>'+esc(x)+'</span></div>').join("")+'</div>'+
 '<label class="gf-label" for="foundationDraft">Your own English answer</label><textarea id="foundationDraft" class="gf-field" data-gf-field="draft" rows="5" placeholder="Write an answer that addresses the question above…">'+esc(r.draft||"")+'</textarea>'+
 '<div class="gf-ai-status">'+(matched?"✓ This exact draft has received OpenAI feedback.":stale?"You edited your draft after the previous assessment. The old feedback is not for this new version.":"No OpenAI assessment yet. You can still practise without paid AI.")+'</div>'+
 '<section class="gf-writing-feedback"><h3>Check → correct → retry</h3><p>OpenAI checks task relevance, word choice and grammar. Press the button only after you have written your own answer.</p>'+
 (window.GKFoundationCoach?'<div class="gf-only-writing">'+window.GKFoundationCoach.render(l)+'</div>':'<p>AI feedback is unavailable. Review the examples and checklist below.</p>')+'</section>'+
 '<details class="gf-reveal"><summary>Need help? Example with explanation</summary><p lang="en"><b>Possible answer:</b> '+esc(g.model)+'</p><p>'+esc(g.why)+'</p></details>'+
 '<details class="gf-reveal"><summary>Spot a common mistake</summary><p lang="en">'+esc(g.commonError)+'</p><p>'+esc(g.correction)+'</p></details>';
}
function review(l,r){
 const g=info(l),previous=window.GKFoundationCoach?.getRecord(l.id)?.writing;
 const current=previous?.report&&previous.answer?.trim()===r.draft.trim();
 const report=previous?.report;
 return '<div class="gf-activity-header"><h2>Fix a mistake and explain it</h2><p>Your goal is a better answer, not merely a higher score.</p></div>'+
 (current?'<div class="gf-priority"><b>'+esc(report.task_status==="off_topic"?"OFF TOPIC":report.task_status==="met"?"TASK RELEVANCE MET":"MOST IMPORTANT IMPROVEMENT")+'</b><p>'+esc(report.priority_fix_vi||report.summary_vi||"Review your task requirements.")+'</p></div>':
 '<div class="gf-plan-feedback"><strong>Your current answer has not been checked by OpenAI</strong><p>You can do the correction exercise below for free, or return to Writing and request personalised feedback.</p><button type="button" data-gfg-action="go-writing" class="gf-btn primary">← Go to Writing & AI correction</button></div>')+
 '<div class="gf-mistake-task"><strong>Correct this lesson-specific error</strong><div class="gf-quote" lang="en">'+esc(g.commonError)+'</div>'+
 '<label class="gf-label">Write a corrected version</label><textarea class="gf-field" data-gfg-correction="1" rows="3" placeholder="Correct the sentence before revealing the example…">'+esc(r.errorFix||"")+'</textarea>'+
 '<details class="gf-reveal"><summary>Show why and one possible correction</summary><p>'+esc(g.correction)+'</p><p lang="en">'+esc(g.model)+'</p></details></div>'+
 '<p class="gf-tip">This exercise compares examples; it does not pretend to grade open-ended writing. Your personal OpenAI correction is on Writing.</p>';
}
function flow(){return window.GKFoundationFlow}
host.addEventListener("input",e=>{
 const p=e.target?.dataset?.gfgPlan,fix=e.target?.dataset?.gfgCorrection;
 if(p===undefined&&fix===undefined)return;
 const f=flow(),id=f?.getLastLessonId?.();if(!id)return;
 const r=f.getState(id);
 if(p!==undefined){r.planAnswers=r.planAnswers||{};r.planAnswers[p]=e.target.value;r.planReviewed=false;}
 if(fix!==undefined){r.errorFix=e.target.value;}
 f.persist?.();
});
host.addEventListener("click",e=>{
 const b=e.target.closest("button[data-gfg-action]");if(!b)return;
 const f=flow(),id=f?.getLastLessonId?.();if(!id)return;
 const action=b.dataset.gfgAction,r=f.getState(id);
 if(action==="check-plan"){
  const req=guides[id]?.planFields||[],missing=req.filter(x=>!String(r.planAnswers?.[x.id]||"").trim());
  r.planReviewed=true;if(!missing.length)r.completed.plan=true;
  f.persist?.();f.render(id);return;
 }
 if(action==="go-writing"){f.goTo?.(8);}
});
window.GKFoundationGuidedPages={plan,writing,review,guide:info};
})();