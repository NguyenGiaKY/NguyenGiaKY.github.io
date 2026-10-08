/* Stable, preference-aware browser voice selection.
   No network calls, tokens or artificial audio enhancement claims. */
(function(){
"use strict";
const KEY="gky_voice_preferences_v2";
let preferred="auto";
try{preferred=localStorage.getItem(KEY)||"auto"}catch(e){}
let onVoices=new Set();
const cache={};
function voices(){
 try{return (window.speechSynthesis?.getVoices()||[]).filter(v=>/^en([-_]|$)/i.test(v.lang||"")||/^English/i.test(v.name||""))}catch(e){return[]}
}
function score(v,locale){
 const n=(v.name||"").toLowerCase(), l=(v.lang||"").toLowerCase(),want=(locale||"en-GB").toLowerCase();
 let s=0;
 if(l===want)s+=20;else if(l.startsWith("en"))s+=8;
 if(/neural|natural|premium|enhanced|high quality|online/.test(n))s+=62;
 if(/google.*english|microsoft.*(sonia|jenny|ryan|aria|guy)|siri/.test(n))s+=48;
 if(/daniel|serena|kate|samantha|alex|ava|victoria|karen|moira|oliver/.test(n))s+=22;
 if(/compact|legacy|espeak|novelty|whisper|bells|boing|zarvox|bad news|good news|bubbles|organ|cellos|trinoids|junior|grandma|grandpa/.test(n))s-=140;
 if(v.localService===false)s+=8;
 return s;
}
function sorted(locale){return voices().sort((a,b)=>score(b,locale)-score(a,locale)||a.name.localeCompare(b.name))}
function genderHint(name){
 const n=(name||"").toLowerCase();
 if(/emma|maya|priya|mia|female|woman|customer|student|receptionist/.test(n))return "F";
 if(/leo|daniel|male|man|clerk|guide|host|lecturer|agent/.test(n))return "M";
 return "";
}
function voiceGender(v){
 const n=(v.name||"").toLowerCase();
 if(/female|sonia|jenny|aria|samantha|victoria|serena|kate|ava|karen|moira|emma|olivia|susan|tessa|allison/.test(n))return "F";
 if(/male|ryan|guy|daniel|alex|oliver|tom|aaron|fred|reed|arthur/.test(n))return "M";
 return "";
}
function pick(pref,speaker,defaultLocale){
 const chosen=pref||preferred,locale=defaultLocale||"en-GB",list=sorted(locale);
 if(!list.length)return null;
 if(chosen&&chosen!=="auto"){
  const explicit=list.find(v=>v.voiceURI===chosen||v.name===chosen||v.name+"|"+v.lang===chosen);
  if(explicit)return explicit;
 }
 const best=list[0],hint=genderHint(speaker);
 if(!hint)return best;
 const matched=list.filter(v=>voiceGender(v)===hint);
 if(matched.length&&score(matched[0],locale)>=score(best,locale)-25)return matched[0];
 return best; // sound quality takes precedence over simulated character genders
}
function setPreferred(key){
 preferred=key||"auto";
 try{localStorage.setItem(KEY,preferred)}catch(e){}
}
function getPreferred(){return preferred}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function options(){
 const all=sorted("en-GB"),val=preferred;
 let out='<option value="auto">⭐ Tự chọn giọng tốt nhất có sẵn</option>';
 const seen=new Set();
 for(const v of all){
  const key=v.voiceURI||v.name;
  if(seen.has(key))continue;seen.add(key);
  const recommendation=score(v,"en-GB")>=38?" ★":"";
  out+='<option value="'+esc(key)+'"'+(key===val?' selected':'')+'>'+esc(v.name+' · '+v.lang+recommendation)+'</option>';
 }
 return out;
}
function preview(pref){
 const engine=window.speechSynthesis;
 if(!engine||typeof SpeechSynthesisUtterance==="undefined")return false;
 try{
  engine.cancel();
  const u=new SpeechSynthesisUtterance("The library was chosen because it is easier to reach by public transport.");
  const v=pick(pref||preferred,"Lecturer");
  if(v){u.voice=v;u.lang=v.lang||"en-GB"}else{u.lang="en-GB"}
  u.rate=1;u.pitch=1;u.volume=1;engine.speak(u);
  return true;
 }catch(e){return false}
}
function notify(){onVoices.forEach(cb=>{try{cb()}catch(e){}})}
try{window.speechSynthesis?.addEventListener("voiceschanged",notify)}catch(e){}
window.GKYVoice={voices,score,sorted,pick,options,preview,setPreferred,getPreferred,onVoices(cb){onVoices.add(cb);return()=>onVoices.delete(cb)}};
})();