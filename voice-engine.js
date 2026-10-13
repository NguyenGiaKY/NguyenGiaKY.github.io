/* Shared browser voice selection for Reading, Foundation and Listening.
   A character must keep the same voice across turns; dialogue characters should
   use distinct available voices. Browser SpeechSynthesis has no reliable gender
   metadata: explicit character hints and known names are best-effort only. */
(function(){
"use strict";
const KEY="gky_voice_preferences_v2";
let preferred="auto";try{preferred=localStorage.getItem(KEY)||"auto";}catch(e){}
const listeners=new Set();
const CAST_KEY="gky_character_voice_pref_v1";
let castPref={F:"auto",M:"auto"};
try{castPref={...castPref,...JSON.parse(localStorage.getItem(CAST_KEY)||"{}")}}catch(e){}
function setCharacterVoice(role,key){
 const which=role==="M"?"M":"F";
 castPref[which]=key||"auto";try{localStorage.setItem(CAST_KEY,JSON.stringify(castPref))}catch(e){}
 notify();
}
function getCharacterVoice(role){return castPref[role==="M"?"M":"F"]||"auto"}
const F=/(female|woman|emma|mia|maya|anna|priya|jenny|sonia|aria|samantha|victoria|serena|kate|ava|karen|moira|olivia|susan|tessa|allison|zira|hazel|fiona|siri female|google uk english female)/i;
const M=/(male|man|leo|daniel|ryan|guy|alex|oliver|tom|aaron|fred|reed|arthur|david|mark|george|james|siri male|google uk english male)/i;
const narratorNames={Mia:"F",Anna:"F",Emma:"F",Maya:"F",Priya:"F",Lina:"F",Daniel:"M",Leo:"M",Tom:"M"};
function gender(v){const s=typeof v==="string"?v:v?.name||"";if(F.test(s))return"F";if(M.test(s))return"M";return"";}
function voices(){try{return (window.speechSynthesis?.getVoices()||[]).filter(v=>/^en([_-]|$)/i.test(v.lang||"")||/^English/i.test(v.name||""));}catch(e){return[]}}
function score(v,locale){
 const n=(v.name||"").toLowerCase(),lang=(v.lang||"").toLowerCase(),want=(locale||"en-GB").toLowerCase();
 let result=0;if(lang===want)result+=24;else if(lang.startsWith("en"))result+=8;
 if(/neural|natural|premium|enhanced|high quality|online/.test(n))result+=42;
 if(/google.*english|microsoft|siri/.test(n))result+=25;
 if(/daniel|serena|kate|samantha|alex|ava|victoria|karen|moira|oliver|sonia|jenny|ryan|aria/.test(n))result+=13;
 if(/compact|legacy|espeak|novelty|whisper|bells|boing|zarvox|bad news|good news|bubbles|organ|cellos|trinoids|junior/.test(n))result-=180;
 if(v.localService===false)result+=6;
 return result;
}
function sorted(locale){return voices().sort((a,b)=>score(b,locale)-score(a,locale)||String(a.name).localeCompare(String(b.name)))}
function getPreferred(){return preferred;}
function setPreferred(key){preferred=key||"auto";try{localStorage.setItem(KEY,preferred);}catch(e){}}
function speakerGender(name){
 const s=String(name||"").trim();
 if(narratorNames[s])return narratorNames[s];
 if(F.test(s))return"F";if(M.test(s))return"M";
 return"";
}
function selectedVoice(key,list){return list.find(v=>v.voiceURI===key||v.name===key||v.name+"|"+v.lang===key)||null;}
function pick(pref,speaker,locale){
 const list=sorted(locale||"en-GB");if(!list.length)return null;
 const explicit=(pref||preferred)!=="auto"?selectedVoice(pref||preferred,list):null;
 if(explicit)return explicit;
 const hint=speakerGender(speaker),named=list.filter(v=>gender(v)===hint);
 return hint&&named.length?named[0]:list[0];
}
function normSpeaker(s){return String(s||"Narrator").trim()||"Narrator"}
function planSpeakers(segments,locale){
 const options=sorted(locale||"en-GB"),speakers=[];
 for(const item of segments||[]){const name=normSpeaker(typeof item==="string"?item:item?.speaker);if(!speakers.includes(name))speakers.push(name);}
 const settings={},used=new Set(),namedUsed={};
 const roles=speakers.map((name,i)=>{
  const spoken=(segments||[]).filter(x=>x&&typeof x!=="string"&&x.speaker===name).map(x=>x.text||"").join(" ");
  const selfName=inferSpeaker(spoken,"");
  return {name,gender:speakerGender(name)||(selfName?speakerGender(selfName):""),i};
 });
 if(roles.length===2){
  if(roles[0].gender&&!roles[1].gender)roles[1].gender=roles[0].gender==="F"?"M":"F";
  else if(!roles[0].gender&&roles[1].gender)roles[0].gender=roles[1].gender==="F"?"M":"F";
 }
 for(const role of roles){if(!role.gender)role.gender=role.i%2?"M":"F";}
 for(const role of roles){
  // A dialogue's roles, unlike a single-voice lecture, are never pinned to the
  // user's one preferred voice. Use distinct voiceURI identities if available.
  let candidates=options.filter(v=>!used.has(v.voiceURI||v.name));
  if(!candidates.length)candidates=options.slice();
  const matching=role.gender?candidates.filter(v=>gender(v)===role.gender):[];
  const explicitly=getCharacterVoice(role.gender);
  const configured=explicitly==="auto"?null:selectedVoice(explicitly,candidates);
  const chosen=(configured||matching[0]||candidates[0]||null);
  if(chosen)used.add(chosen.voiceURI||chosen.name);
  // Pitch is a subtle differentiator when the browser exposes one voice only.
  // It is NOT a claim that we generated a true female/male voice.
  const fallbackPitch=role.gender==="F"?1.13:role.gender==="M"?.90:1;
  settings[role.name]={voice:chosen,lang:chosen?.lang||locale||"en-GB",
    pitch:chosen&&gender(chosen)===role.gender?1:fallbackPitch,
    rate:role.i%2?0.985:1,character:role.name,genderHint:role.gender||"",
    distinctVoice:!!chosen};
  namedUsed[role.name]=chosen?.name||"Browser default";
 }
 return {settings,speakers,distinct:speakers.length<=1||new Set(Object.values(namedUsed)).size===speakers.length,
  available:options.length,labels:namedUsed};
}
function forSpeaker(plan,speaker){return plan?.settings?.[normSpeaker(speaker)]||{voice:null,lang:"en-GB",rate:1,pitch:1}}
function inferSpeaker(text,defaultSpeaker="Narrator"){
 const source=String(text||"");
 const intro=source.match(/\b(?:I am|I'm|my name is)\s+(Mia|Anna|Emma|Maya|Priya|Lina|Leo|Daniel|Tom)\b/i);
 if(intro){const name=Object.keys(narratorNames).find(x=>x.toLowerCase()===intro[1].toLowerCase());return name||defaultSpeaker;}
 return defaultSpeaker;
}
let playbackToken=0;
function stopConversation(){
 playbackToken++;
 try{window.speechSynthesis?.cancel()}catch(e){}
}
function playConversation(lines,{locale="en-GB",rate=0.94,onFinish,onError,onTurn}={}){
 stopConversation();const token=playbackToken;
 const engine=window.speechSynthesis,Ctor=window.SpeechSynthesisUtterance;
 if(!engine||!Ctor)return {ok:false,reason:"Speech synthesis unavailable",cancel:stopConversation};
 const entries=(lines||[]).filter(l=>l&&String(l.text||"").trim());
 const plan=planSpeakers(entries,locale);let n=0;
 const next=()=>{
  if(token!==playbackToken)return;
  if(n>=entries.length){onFinish?.();return;}
  const line=entries[n++],role=forSpeaker(plan,line.speaker);
  const u=new Ctor(String(line.text));u.lang=role.lang||locale;
  if(role.voice)u.voice=role.voice;
  u.rate=Math.max(.65,Math.min(1.35,rate*(role.rate||1)));
  u.pitch=role.pitch||1;u.volume=1;
  u.onstart=()=>{if(token===playbackToken)onTurn?.(line.speaker,n)};
  u.onend=()=>{if(token===playbackToken)setTimeout(next,125)};
  u.onerror=event=>{if(token===playbackToken)onError?.(event?.error||"speech error")};
  try{engine.speak(u)}catch(e){onError?.(String(e))}
 };
 next();return {ok:true,plan,cancel:()=>{if(token===playbackToken)stopConversation()}};
}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function castOptions(role){
 const vals=sorted("en-GB"),selected=getCharacterVoice(role);
 let out='<option value="auto">Auto · try to match this role</option>',seen=new Set();
 for(const v of vals){const key=v.voiceURI||v.name;if(seen.has(key))continue;seen.add(key);
  out+='<option value="'+esc(key)+'"'+(selected===key?" selected":"")+'>'+esc(v.name+" · "+v.lang)+'</option>';
 }return out;
}
function previewCharacter(role){
 const speaker=role==="M"?"Leo":"Anna";
 const greeting=role==="M"?"Hi, I'm Leo. Nice to meet you.":"Hi, I'm Anna. Nice to meet you.";
 const plan=planSpeakers([{speaker,text:greeting}],"en-GB");
 const setting=forSpeaker(plan,speaker);
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return false;
 try{stopConversation();const u=new SpeechSynthesisUtterance(greeting);
 u.lang=setting.lang||"en-GB";if(setting.voice)u.voice=setting.voice;
 u.pitch=setting.pitch||1;u.rate=.94;window.speechSynthesis.speak(u);return true;
 }catch(e){return false;}
}
function options(){const list=sorted("en-GB");let out='<option value="auto">Auto · best available English voice</option>',seen=new Set();for(const v of list){const key=v.voiceURI||v.name;if(seen.has(key))continue;seen.add(key);out+='<option value="'+esc(key)+'"'+(key===preferred?" selected":"")+'>'+esc(v.name+" · "+v.lang)+'</option>';}return out;}
function preview(pref){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return false;
 try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("The library is easier to reach by public transport.");const v=pick(pref||preferred,"Lecturer","en-GB");u.lang=v?.lang||"en-GB";if(v)u.voice=v;u.rate=1;u.pitch=1;window.speechSynthesis.speak(u);return true;}catch(e){return false;}
}
function notify(){for(const fn of listeners)try{fn()}catch(e){}}
try{window.speechSynthesis?.addEventListener("voiceschanged",notify)}catch(e){}
window.GKYVoice={voices,score,sorted,pick,options,preview,setPreferred,getPreferred,
 voiceGender:gender,speakerGender,planSpeakers,forSpeaker,inferSpeaker,playConversation,stopConversation,castOptions,setCharacterVoice,getCharacterVoice,previewCharacter,
 onVoices(fn){listeners.add(fn);return()=>listeners.delete(fn)}};
})();