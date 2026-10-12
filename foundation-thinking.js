/* Foundation Thinking Studio: contextual word roles, paraphrase decisions, and lesson word packs. */
(function(){
"use strict";
const root=document.getElementById("foundationRoot"),data=window.GKFoundationData,atlas=window.GKFoundationThinkingData;
if(!root||!data||!atlas)return;
const KEY="gk_foundation_thinking_v1",lessons=Object.fromEntries(data.lessons.map(l=>[l.id,l]));
let parsed={};try{parsed=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const progress=parsed.records||{};
let active="",focus={},visible={},revealed={},showTranslation={};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const row=id=>progress[id]||(progress[id]={savedWords:[],answers:{},draft:""});
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({records:progress}));}catch(e){}};
const cnt=id=>new Set(row(id).savedWords||[]).size;
const stats=()=>({words:data.lessons.reduce((n,l)=>n+cnt(l.id),0),packs:data.lessons.filter(l=>cnt(l.id)).length});
const labels={noun:"Names a person, thing or idea",verb:"Action, process or state",adjective:"Describes a noun or subject",adverb:"Describes how, when or how often",conjunction:"Connects ideas",interjection:"Social expression",preposition:"Describes a relation"};
const describe=role=>labels[role]||"Function in this phrase: "+role;
function concepts(id){
 const d=atlas.cases[id];
 return '<section class="ft-hero"><span class="ft-eyebrow">MEANING FIRST · THINKING STUDIO</span><h2>Learn the idea, not a formula</h2><p>'+esc(d.principle)+'</p><div class="ft-big-idea"><div><small>ASK YOURSELF</small><strong>What is the speaker really saying?</strong></div><p>'+esc(d.contrast)+'</p></div><div class="ft-same"><div><small>ORIGINAL</small><strong lang="en">'+esc(d.pairs[0].source)+'</strong></div><span>⇄</span><div><small>SAME IDEA · NEW WORDING</small><strong lang="en">'+esc(d.pairs[0].equivalent)+'</strong></div></div></section>';
}
function words(id){
 const lesson=lessons[id],d=atlas.cases[id],r=row(id),n=focus[id]??0,w=lesson.words[n],saved=(r.savedWords||[]).includes(w[0]);
 let html='<section class="ft-section"><header><span class="ft-eyebrow">01 · WORD JOBS & CONTEXT</span><h3>What does each word do?</h3><p>In a sentence, find what names a thing, expresses an action, or describes another word. Word class comes from its function in context.</p></header>'+
 '<div class="ft-roles"><div><strong>NOUN</strong><span>person / thing / idea</span></div><div><strong>VERB</strong><span>action / state</span></div><div><strong>ADJECTIVE</strong><span>describes noun</span></div><div><strong>ADVERB</strong><span>how / when / how often</span></div></div>'+
 '<div class="ft-example-note"><b>a careful driver</b> → careful describes driver (noun) · <b>drives carefully</b> → carefully describes drives (verb)</div>'+
 '<div class="ft-word-list">';
 lesson.words.forEach((x,i)=>{html+='<button type="button" data-ft-word="'+i+'" aria-pressed="'+(i===n)+'" class="'+(i===n?"selected":"")+'"><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span><small>'+esc(d.roles[i])+'</small></button>';});
 html+='</div><div class="ft-word-detail"><div><span class="ft-eyebrow">FUNCTION IN CONTEXT</span><h4>'+esc(w[0])+'</h4><p><b>'+esc(d.roles[n])+'</b> — '+esc(describe(d.roles[n]))+'</p></div>'+
 '<div class="ft-collocation"><small>NATURAL COLLOCATION / USE</small><strong lang="en">'+esc(d.usage[n])+'</strong><p>Why do these words fit together? How could you use this phrase to speak about your own life?</p></div>'+
 '<div class="ft-actions"><button type="button" class="ft-primary" data-ft-say="'+n+'">▶ Hear phrase</button><button type="button" class="ft-secondary" data-ft-save="'+n+'">'+(saved?'✓ Saved · Unsave':'☆ Save to this lesson')+'</button></div>'+
 '<div class="ft-make-sentence"><label for="ft-word-draft">Now use it naturally</label><p><b>Speaking:</b> say a new sentence using <em>'+esc(d.usage[n])+'</em>. <b>Writing:</b> type the same idea, but make it about your own situation.</p><textarea id="ft-word-draft" data-ft-word-draft="'+esc(id)+'|'+n+'" rows="2" placeholder="My own sentence using this phrase…">'+esc(row(id).sentences?.[w[0]]||"")+'</textarea></div></div></section>';
 return html;
}
function family(id){
 const f=atlas.cases[id]?.family;if(!f)return"";
 return '<section class="ft-section ft-family"><header><span class="ft-eyebrow">WORD FAMILY · FUNCTION CHANGES</span><h3>Same idea, different job</h3><p>Instead of memorising word endings, ask why the sentence needs a noun, verb, adjective or adverb.</p></header>'+
 '<div class="ft-family-comparison"><div><span>'+esc(f.fromRole)+'</span><h4>'+esc(f.from)+'</h4><p lang="en">'+esc(f.fromSentence)+'</p></div><span aria-hidden="true">→</span><div><span>'+esc(f.toRole)+'</span><h4>'+esc(f.to)+'</h4><p lang="en">'+esc(f.toSentence)+'</p></div></div>'+
 '<details class="ft-family-reason"><summary>Why does the form or function change? <b>Show reasoning ↓</b></summary><p>'+esc(f.why)+'</p>'+
 '<p class="ft-hint">Try changing the example into a sentence about your own situation. Say it aloud and notice whether you need to name an idea or describe an action.</p></details></section>';
}
function meaning(id){
 const d=atlas.cases[id],r=row(id);
 let html='<section class="ft-section"><header><span class="ft-eyebrow">02 · PARAPHRASE & LOGIC</span><h3>Different words. Same meaning?</h3><p>Check the speaker, event, timing, quantity and logical relationship. One wrong detail can reverse the meaning.</p></header>';
 d.pairs.forEach((p,i)=>{
  const opts=((id.length+i)%2)?[p.equivalent,p.wrong]:[p.wrong,p.equivalent],ans=r.answers?.[i],done=ans!==undefined;
  html+='<div class="ft-question"><small>MEANING CHECK '+(i+1)+'</small><h4 lang="en">'+esc(p.source)+'</h4><p>Which sentence preserves the original meaning?</p><div class="ft-choice-list">';
  opts.forEach((x,j)=>html+='<button type="button" data-ft-option="'+i+'" data-ft-choice="'+j+'" '+(done?'disabled':'')+' class="'+(done?(x===p.equivalent?'right':ans===j?'wrong':''):'')+'"><b>'+String.fromCharCode(65+j)+'</b>'+esc(x)+'</button>');
  html+='</div>';
  if(done)html+='<div class="ft-feedback"><strong>'+(opts[ans]===p.equivalent?'✓ Correct: meaning preserved':'Not quite: important meaning changed')+'</strong><p>'+esc(p.why)+'</p><p><b>Meaning-preserving:</b> '+esc(p.equivalent)+'</p><button type="button" data-ft-retry="'+i+'">Try this again</button></div>';
  html+='</div>';
 });
 html+='</section><section class="ft-section ft-transfer"><header><span class="ft-eyebrow">03 · PRODUCE, DON’T COPY</span><h3>Now express it yourself</h3><p>Rewrite the first sentence using different words. Compare your idea, then try explaining it aloud.</p></header>'+
 '<label for="ftDraft">My own paraphrase</label><textarea id="ftDraft" data-ft-draft="'+esc(id)+'" rows="3" placeholder="Try a natural sentence that keeps the same meaning…">'+esc(r.draft||"")+'</textarea>'+
 '<div class="ft-actions"><button type="button" class="ft-secondary" data-ft-show="'+esc(id)+'">'+(revealed[id]?'Hide example':'See an example')+'</button><button type="button" class="ft-primary" data-ft-apply="1">Continue to Speak & Write →</button></div>'+
 (revealed[id]?'<div class="ft-feedback"><b>Possible rewrite:</b> '+esc(d.pairs[0].equivalent)+'<p>There can be other correct answers. Exact words are less important than preserving meaning.</p></div>':'')+'</section>';
 return html;
}
function coach(id){
 const l=lessons[id],d=atlas.cases[id];if(!window.GKFoundationCoach)return'';
 const model={
 id:"thinking-"+id,level:l.level,goal:"Preserve meaning while using suitable word forms and collocations. "+d.principle,
 produce:["Paraphrase these sentences, preserving all facts and meaning: "+d.pairs.map(p=>p.source).join(" | "), "Change language, not numbers, time, people, or logic.",d.pairs.map(p=>p.equivalent).join(" / ")],
 speakingPrompt:"Read and explain this sentence in your own English: "+d.pairs[0].source+" Now say one more sentence using a phrase from this lesson."
 };
 return'<details class="ft-ai"><summary><span><b>Speak & Write with feedback</b><small>Optional audio recording + detailed OpenAI corrections</small></span><span>Open practice ↓</span></summary>'+window.GKFoundationCoach.render(model)+'</details>';
}
function render(id){
 if(!lessons[id]||!atlas.cases[id])return"";
 active=id;
 return'<div class="ft-studio">'+concepts(id)+words(id)+family(id)+meaning(id)+coach(id)+
 '<footer class="ft-footer"><p>Understanding is demonstrated when you can explain an idea and use it in a new situation—not by memorising an answer.</p><button type="button" class="ft-primary" data-ft-apply="1">Practice speaking and writing →</button></footer></div>';
}
function homePanel(){
 const st=stats();
 return'<section class="ft-home"><div><span class="ft-eyebrow">YOUR FOUNDATION THINKING CENTER</span><h3>Meaning → Word roles → Paraphrase → Real use</h3><p>One connected lesson: understand what a sentence communicates, see how words work together, rephrase it, then speak or write something original.</p></div>'+
 '<button type="button" class="ft-pack-button" data-f-action="wordPacks">My lesson word packs <b>'+st.words+' words · '+st.packs+' lessons</b> →</button>'+
 '<div class="ft-missions"><span><b>01</b> Understand meaning</span><span><b>02</b> Explain word roles</span><span><b>03</b> Paraphrase</span><span><b>04</b> Speak + revise</span></div></section>';
}
function packPage(){
 const idList=data.lessons.map(l=>l.id).filter(id=>cnt(id)),st=stats();
 let html='<div class="ft-pack-page"><button type="button" class="ft-back" data-f-action="home">← Foundation</button><div class="ft-pack-hero"><span class="ft-eyebrow">YOUR WORDS · YOUR READING CONTEXT</span><h2>Vocabulary by lesson</h2><p>Words you save from a Foundation lesson stay together with its topic, word roles and example phrases.</p><strong>'+st.words+' saved words · '+st.packs+' lesson packs</strong></div>';
 if(!idList.length)return html+'<div class="ft-empty"><b>No words saved yet.</b><p>Open a Foundation lesson, choose Think & Paraphrase, and tap ☆ Save.</p><button type="button" data-f-action="continue">Start learning →</button></div></div>';
 idList.forEach(id=>{
  const l=lessons[id],d=atlas.cases[id],r=row(id);
  html+='<section class="ft-pack"><header><div><small>'+esc(l.level)+' · '+esc(l.skill)+'</small><h3>'+esc(l.title)+'</h3><span>'+cnt(id)+' words</span></div><button type="button" data-f-id="'+esc(id)+'">Open lesson →</button></header><div class="ft-review-cards">';
  r.savedWords.forEach(word=>{
   const n=l.words.findIndex(x=>x[0]===word);if(n<0)return;
   const show=!!visible[id+"|"+word];
   html+='<div class="ft-review-card"><strong>'+esc(word)+'</strong><small>'+esc(d.roles[n])+'</small><button type="button" data-ft-toggle="'+esc(id)+'|'+esc(word)+'">'+(show?'Hide explanation':'Reveal meaning')+'</button>';
   if(show)html+='<p>'+esc(l.words[n][1])+'</p><b lang="en">'+esc(d.usage[n])+'</b>'+
 '<label for="ft-use-'+esc(id)+'-'+n+'">My own example sentence</label><textarea id="ft-use-'+esc(id)+'-'+n+'" rows="2" data-ft-word-draft="'+esc(id)+'|'+n+'" placeholder="Write a sentence with this phrase…">'+esc(r.sentences?.[word]||"")+'</textarea>'+
 '<div class="ft-actions"><button type="button" data-ft-say="'+n+'" data-ft-lesson="'+esc(id)+'">▶ Listen</button><button type="button" data-ft-remove="'+esc(id)+'|'+esc(word)+'">Unsave</button></div>';
   html+='</div>';
  });
  html+='</div></section>';
 });
 return html+'</div>';
}
function refresh(){
 const p=root.querySelector("#foundationThinkingPanel");if(p&&active)p.innerHTML=render(active);
 const packs=root.querySelector("#foundationWordPacks");if(packs)packs.innerHTML=packPage();
}
function speak(id,i){
 const phrase=atlas.cases[id]?.usage?.[i];if(!phrase||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
 try{window.speechSynthesis.cancel();const u=new window.SpeechSynthesisUtterance(phrase);u.lang="en-NZ";u.rate=.88;const vs=window.speechSynthesis.getVoices()||[];u.voice=vs.find(x=>/^en-(NZ|AU|GB)/i.test(x.lang))||vs.find(x=>/^en/i.test(x.lang))||null;window.speechSynthesis.speak(u);}catch(e){}
}
root.addEventListener("click",evt=>{
 const b=evt.target.closest("button");if(!b||!root.contains(b))return;
 if(b.dataset.ftWord!==undefined){focus[active]=Number(b.dataset.ftWord);refresh();return;}
 if(b.dataset.ftSave!==undefined){const id=active,w=lessons[id]?.words?.[Number(b.dataset.ftSave)]?.[0];if(!w)return;const words=new Set(row(id).savedWords);words.has(w)?words.delete(w):words.add(w);row(id).savedWords=[...words];persist();refresh();return;}
 if(b.dataset.ftOption!==undefined){const id=active,i=Number(b.dataset.ftOption);if(row(id).answers[i]!==undefined)return;row(id).answers[i]=Number(b.dataset.ftChoice);persist();refresh();return;}
 if(b.dataset.ftRetry!==undefined){delete row(active).answers[Number(b.dataset.ftRetry)];persist();refresh();return;}
 if(b.dataset.ftShow!==undefined){revealed[active]=!revealed[active];refresh();return;}
 if(b.dataset.ftToggle){visible[b.dataset.ftToggle]=!visible[b.dataset.ftToggle];refresh();return;}
 if(b.dataset.ftRemove){const [id,...rest]=b.dataset.ftRemove.split("|"),word=rest.join("|");if(!lessons[id])return;row(id).savedWords=row(id).savedWords.filter(x=>x!==word);persist();refresh();return;}
 if(b.dataset.ftSay!==undefined){speak(b.dataset.ftLesson||active,Number(b.dataset.ftSay));return;}
 if(b.dataset.ftApply){const button=root.querySelector('[data-f-tab="apply"]');if(button)button.click();return;}
});
root.addEventListener("input",evt=>{const parts=evt.target?.dataset?.ftWordDraft;if(parts){const [id,pos]=parts.split("|"),word=lessons[id]?.words[Number(pos)]?.[0];if(word){const r=row(id);r.sentences={...(r.sentences||{}),[word]:evt.target.value};persist();}return;}const id=evt.target?.dataset?.ftDraft;if(id&&lessons[id]){row(id).draft=evt.target.value;persist();}});
window.GKFoundationThinking={render,homePanel,packPage,stats,getRecord:id=>row(id)};
})();