/* Situation-first Foundation lessons: comprehension, meaningful output, correction and reflection.
   Old quiz mastery is untouched; new practice records are stored separately and synced. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),source=window.GKFoundationMissionData?.missions;
if(!root||!source)return;
const KEY="gk_foundation_missions_v2",lessonMap=Object.fromEntries((window.GKFoundationData?.lessons||[]).map(l=>[l.id,l]));
let old={};try{old=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const records=old.records||{};
const state=id=>records[id]||(records[id]={answer:null,attempts:0,reflections:{},review:false});
const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({records}));}catch(e){}};
let active="",status="";
function choiceCard(id){
 const m=source[id],s=state(id);let h='<div class="fm-check-card"><span class="fm-eyebrow">INTERPRET THE MESSAGE</span><h4>'+esc(m.question)+'</h4><div class="fm-options">';
 m.choices.forEach((choice,i)=>{const done=s.answer!==null;h+='<button type="button" data-fm-answer="'+i+'" '+(done?'disabled':'')+' class="'+(done?(i===m.correct?'is-correct':i===s.answer?'is-wrong':''):'')+'" aria-pressed="'+(s.answer===i)+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(choice)+'</button>';});
 h+='</div>';
 if(s.answer!==null)h+='<div class="fm-analysis"><b>'+(s.answer===m.correct?'Correct: you understood the message.':'Not quite: look at the meaning, not just one word.')+'</b><p>'+esc(m.focus)+'</p><button type="button" data-fm-retry="1">Try again</button></div>';
 return h+'</div>';
}
function intro(lesson){
 lesson=lessonMap[lesson.id]||lesson;
 const m=source[lesson.id];if(!m)return"";
 active=lesson.id;
 return'<div class="fm-scene" id="foundationMissionIntro"><div class="fm-scene-header"><div><span class="fm-eyebrow">REAL-LIFE ENGLISH · '+esc(lesson.level)+'</span><h3>First, understand the situation</h3><p>'+esc(m.scene)+'</p></div><button type="button" data-fm-listen="1" class="fm-audio">▶ Listen to the scene</button></div>'+
 '<blockquote lang="en">'+esc(m.dialog)+'</blockquote>'+choiceCard(lesson.id)+
 '<p class="fm-caption">Meaning matters first. After you understand this situation, notice how the words create that meaning in the examples below.</p></div>';
}
function apply(lesson){
 const m=source[lesson.id];if(!m)return"";
 active=lesson.id;const s=state(lesson.id);
 return'<section class="fm-task" id="foundationMissionApply"><div class="fm-task-head"><span class="fm-eyebrow">03 · YOUR REAL-LIFE CHALLENGE</span><h3>Use the meaning in your own life</h3><p>Write from your experience. The AI will check whether you answered this exact task, not whether you copied a model.</p></div>'+
 '<div class="fm-task-grid"><div><small>WRITING MISSION</small><h4>'+esc(m.writing)+'</h4><p>'+esc(m.why)+'</p></div>'+
 '<div><small>SPEAKING MISSION</small><h4>'+esc(m.speaking)+'</h4><p>Say your own answer, record it, listen back, then decide whether you want OpenAI feedback.</p></div></div>'+
 '<details class="fm-scaffold"><summary>Need help getting started? <span>Reveal a useful idea ↓</span></summary><p>'+esc(m.focus)+'</p><p><strong>Model for understanding (not to memorise):</strong> '+esc(m.dialog)+'</p></details>'+
 '<div class="fm-checklist"><strong>Check the meaning before submitting:</strong><div>'+
 m.checklist.map((item,i)=>'<label><input type="checkbox" data-fm-check="'+i+'" '+(s.reflections?.[i]?'checked':'')+'><span>'+esc(item)+'</span></label>').join("")+
 '</div><p>These checks help you review your response; they do not automatically award a pass.</p></div></section>';
}
function detective(lesson){
 const m=source[lesson.id],t=window.GKFoundationThinkingData?.cases?.[lesson.id],s=state(lesson.id);
 if(!m||!t)return"";const c=t.pairs[1];return'<section class="fm-detective"><span class="fm-eyebrow">MEANING DETECTIVE · TRANSFER</span><h3>Spot the hidden meaning change</h3><p>Two sentences can share vocabulary and still mean different things. Explain the difference before revealing the analysis.</p>'+
 '<div class="fm-difference"><div><small>ORIGINAL</small><p>'+esc(c.source)+'</p></div><div><small>NOT THE SAME MEANING</small><p>'+esc(c.wrong)+'</p></div></div>'+
 '<label for="fmDetectiveResponse">What changed? (time, person, quantity, opinion, or logic?)</label>'+
 '<textarea id="fmDetectiveResponse" data-fm-detect="'+esc(lesson.id)+'" rows="2" placeholder="I think the meaning changes because…">'+esc(s.detective||"")+'</textarea>'+
 '<button type="button" class="fm-reveal" data-fm-reveal="1">'+(s.review?'Hide the reasoning':'Reveal the explanation')+'</button>'+
 (s.review?'<div class="fm-analysis"><strong>Reasoning</strong><p>'+esc(c.why)+'</p><p><b>Matching meaning:</b> '+esc(c.equivalent)+'</p></div>':'')+'</section>';
}
function speakScene(id){
 const m=source[id];if(!m)return;
 const scene=window.GKFoundationScenes?.[id];
 if(window.GKYVoice?.playConversation&&scene){
  const result=window.GKYVoice.playConversation(scene,{locale:"en-NZ",rate:.9});
  if(!result.ok)status="Audio playback unavailable on this browser.";return;
 }
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){status="Audio playback unavailable.";return;}
 try{window.speechSynthesis.cancel();const u=new window.SpeechSynthesisUtterance(m.dialog);
  const narrator=window.GKYVoice?.inferSpeaker?.(m.dialog,"Narrator")||"Narrator";
  const v=window.GKYVoice?.pick?.("auto",narrator,"en-NZ");
  u.lang=v?.lang||"en-NZ";if(v)u.voice=v;u.rate=.9;window.speechSynthesis.speak(u);
 }catch(e){status="Audio playback failed.";}
}
function refreshPart(selector,renderFn){
 const node=root.querySelector(selector);
 if(node&&active)node.outerHTML=renderFn({id:active});
}
root.addEventListener("click",ev=>{
 const b=ev.target.closest("button");if(!b||!root.contains(b))return;
 if(b.dataset.fmAnswer!==undefined){const id=active;if(!source[id])return;state(id).answer=Number(b.dataset.fmAnswer);state(id).attempts++;save();refreshPart("#foundationMissionIntro",intro);return;}
 if(b.dataset.fmRetry){state(active).answer=null;save();refreshPart("#foundationMissionIntro",intro);return;}
 if(b.dataset.fmListen){speakScene(active);return;}
 if(b.dataset.fmReveal){state(active).review=!state(active).review;save();refreshPart(".fm-detective",detective);}
});
root.addEventListener("input",ev=>{const id=ev.target?.dataset?.fmDetect;if(id&&source[id]){state(id).detective=ev.target.value;save();}});
root.addEventListener("change",ev=>{if(ev.target?.dataset?.fmCheck!==undefined&&source[active]){state(active).reflections[ev.target.dataset.fmCheck]=!!ev.target.checked;save();}});
window.GKFoundationMissions={intro,apply,detective,mission:id=>source[id],getState:state};
})();