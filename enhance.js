
(function(){
'use strict';

var baseOpenLesson = window.openLesson;
if(typeof baseOpenLesson!=='function') return;

var listeningState = {
  playing:false, paused:false, stopped:true,
  segments:[], segIndex:0, localStart:0, globalChar:0, totalChars:1,
  rate:1, voiceMode:'auto-uk', utterance:null, dragging:false, seekWasActive:false
};

function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]});
}
function englishVoices(){
  try{return (speechSynthesis.getVoices()||[]).filter(function(v){return /^en[-_]/i.test(v.lang||'')||/^English/i.test(v.name||'')})}catch(e){return[]}
}
function voiceScore(v,accent,gender){
  var n=(v.name||'').toLowerCase(),lang=(v.lang||'').toLowerCase(),score=0,want=accent==='US'?'en-us':'en-gb';
  if(lang===want)score+=30; else if(lang.indexOf('en')===0)score+=10;
  if(/google/.test(n))score+=15;
  if(/premium|enhanced|natural|neural/.test(n))score+=20;
  if(/compact|novelty|whisper|zarvox|bells|boing/.test(n))score-=35;
  var male=/daniel|alex|fred|tom|oliver|aaron|jamie|ralph|bruce|lee|gordon|arthur|reed/i.test(v.name||'');
  var female=/samantha|victoria|karen|moira|tessa|ava|allison|serena|fiona|kate|zoe|susan|sandy|shelley/i.test(v.name||'');
  if(gender==='M'){if(male)score+=25;if(female)score-=8}
  if(gender==='F'){if(female)score+=25;if(male)score-=8}
  return score;
}
function chooseVoice(mode,speaker){
  var vs=englishVoices(); if(!vs.length) return null;
  var accent=mode==='auto-us'?'US':'UK';
  if(mode&&mode.indexOf('voice:')===0&&speaker!=='M'&&speaker!=='F'){
    var wanted=decodeURIComponent(mode.slice(6));
    for(var i=0;i<vs.length;i++) if(vs[i].name===wanted) return vs[i];
  }
  vs.sort(function(a,b){return voiceScore(b,accent,speaker)-voiceScore(a,accent,speaker)});
  return vs[0]||null;
}
function fillVoiceSelect(){
  var sel=document.getElementById('listenVoice'); if(!sel) return;
  var current=sel.value||'auto-uk',vs=englishVoices(),seen={},html='<option value="auto-uk">Tự nhiên • UK</option><option value="auto-us">Tự nhiên • US</option>';
  vs.sort(function(a,b){return voiceScore(b,'UK','')-voiceScore(a,'UK','')}).forEach(function(v){
    if(seen[v.name]) return; seen[v.name]=1;
    html+='<option value="voice:'+encodeURIComponent(v.name)+'">'+esc(v.name)+' • '+esc(v.lang||'English')+'</option>';
  });
  sel.innerHTML=html;
  for(var i=0;i<sel.options.length;i++) if(sel.options[i].value===current){sel.value=current;break}
}
function getListeningSegments(d,script){
  if(d%2===0 && /library will close/i.test(script)){
    return [
      {speaker:'F',text:'Hi. I heard the library is closing early this Friday. What time will it close?'},
      {speaker:'M',text:'It will close at five o clock because of electrical maintenance.'},
      {speaker:'F',text:'Is there anywhere students can work later than that?'},
      {speaker:'M',text:'Yes. Room 204 in the science building will stay open until nine p.m. Books can still be returned through the outside return box, but laptop loans will finish at four thirty.'},
      {speaker:'F',text:'What about the quiet study area?'},
      {speaker:'M',text:'That area on the second floor is unavailable all day. Students who need silent study should use the language centre instead.'},
      {speaker:'F',text:'And when will normal hours start again?'},
      {speaker:'M',text:'Normal opening hours resume on Saturday morning at nine.'}
    ];
  }
  return [{speaker:'N',text:script}];
}
function prepareSegments(segs){
  var cursor=0;
  return segs.map(function(x,i){
    var t=String(x.text||'').trim(),o={speaker:x.speaker||'N',text:t,start:cursor,end:cursor+t.length};
    cursor=o.end+(i<segs.length-1?1:0); return o;
  });
}
function wordCount(){
  var n=0; listeningState.segments.forEach(function(s){n+=(s.text.match(/\b[\w'-]+\b/g)||[]).length}); return n;
}
function totalSeconds(){return Math.max(1,(wordCount()/155)*60/Math.max(.65,listeningState.rate||1))}
function fmt(sec){sec=Math.max(0,Math.round(sec||0));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
function timeForChar(ch){return totalSeconds()*Math.max(0,Math.min(1,ch/Math.max(1,listeningState.totalChars)))}
function nearestWord(text,i){i=Math.max(0,Math.min(text.length,Math.floor(i||0)));while(i>0&&/[A-Za-z0-9'-]/.test(text[i-1]))i--;return i}
function locateChar(ch){
  var s=listeningState;ch=Math.max(0,Math.min(s.totalChars-1,Math.floor(ch||0)));
  for(var i=0;i<s.segments.length;i++){var seg=s.segments[i];if(ch<=seg.end)return {i:i,local:nearestWord(seg.text,ch-seg.start)}}
  return {i:Math.max(0,s.segments.length-1),local:0};
}
function updateSeek(force){
  var s=listeningState,bar=document.getElementById('listenSeek');if(!bar)return;
  var ratio=Math.max(0,Math.min(1,s.globalChar/Math.max(1,s.totalChars)));
  if(!s.dragging||force)bar.value=Math.round(ratio*1000);
  var a=document.getElementById('listenCurrentTime'),b=document.getElementById('listenTotalTime');
  if(a)a.textContent=fmt(timeForChar(s.globalChar));if(b)b.textContent=fmt(totalSeconds());
}
function setStatus(t){var e=document.getElementById('listenStatusText');if(e)e.textContent=t;updateSeek(false)}
function stopListening(reset){
  try{speechSynthesis.cancel()}catch(e){}
  var s=listeningState;s.playing=false;s.paused=false;s.stopped=true;s.utterance=null;
  if(reset){s.segIndex=0;s.localStart=0;s.globalChar=0}
  setStatus('Đã dừng');updateSeek(true);
}
function speakCurrent(){
  var s=listeningState,seg=s.segments[s.segIndex];
  if(s.stopped||!seg)return;
  var start=nearestWord(seg.text,s.localStart||0),raw=seg.text.slice(start),spoken=raw.trimStart(),trim=raw.length-spoken.length;start+=trim;
  if(!spoken){s.segIndex++;s.localStart=0;if(s.segIndex>=s.segments.length){s.stopped=true;s.playing=false;s.globalChar=s.totalChars;setStatus('Đã phát xong');updateSeek(true);return}speakCurrent();return}
  var u=new SpeechSynthesisUtterance(spoken),mode=s.voiceMode||'auto-uk',voice=chooseVoice(mode,seg.speaker);
  u.lang=mode==='auto-us'?'en-US':'en-GB';if(voice){u.voice=voice;u.lang=voice.lang||u.lang}
  u.rate=s.rate||1;u.pitch=seg.speaker==='M'?0.92:(seg.speaker==='F'?1.05:1);u.volume=1;
  u.onstart=function(){s.playing=true;s.paused=false;s.stopped=false;s.globalChar=seg.start+start;setStatus('Đang phát')};
  u.onboundary=function(e){if(typeof e.charIndex==='number'){s.localStart=start+e.charIndex;s.globalChar=seg.start+s.localStart;updateSeek(false)}};
  u.onend=function(){
    if(s.stopped)return;s.globalChar=seg.end;s.segIndex++;s.localStart=0;
    if(s.segIndex>=s.segments.length){s.playing=false;s.paused=false;s.stopped=true;s.globalChar=s.totalChars;var pb=document.getElementById('playAudio');if(pb)pb.textContent='▶ Phát';setStatus('Đã phát xong');updateSeek(true);return}
    setTimeout(speakCurrent,25);
  };
  u.onerror=function(){if(s.stopped)return;s.segIndex++;s.localStart=0;setTimeout(speakCurrent,25)};
  s.utterance=u;try{speechSynthesis.speak(u)}catch(e){setStatus('Không thể phát audio')}
}
function startListening(){
  var s=listeningState;try{speechSynthesis.cancel()}catch(e){}
  var rate=document.getElementById('listenRate'),voice=document.getElementById('listenVoice');
  if(rate)s.rate=parseFloat(rate.value)||1;if(voice)s.voiceMode=voice.value||'auto-uk';
  if(s.globalChar>=s.totalChars-1){s.segIndex=0;s.localStart=0;s.globalChar=0}
  s.stopped=false;s.paused=false;s.playing=true;var b=document.getElementById('playAudio');if(b)b.textContent='⏸ Tạm dừng';speakCurrent();
}
function pauseListening(){
  var s=listeningState;if(!s.playing&&!s.paused)return;
  try{
    var b=document.getElementById('pauseAudio');
    if(s.paused){speechSynthesis.resume();s.paused=false;s.playing=true;if(b)b.textContent='⏸ Tạm dừng';setStatus('Đang phát')}
    else{speechSynthesis.pause();s.paused=true;s.playing=false;if(b)b.textContent='▶ Tiếp tục';setStatus('Đã tạm dừng')}
  }catch(e){}
}

function toggleListeningPlayback(){
  var s=listeningState,btn=document.getElementById('playAudio');
  if(s.paused){
    try{speechSynthesis.resume()}catch(e){}
    s.paused=false;s.playing=true;s.stopped=false;
    if(btn)btn.textContent='⏸ Tạm dừng';
    setStatus('Đang phát');
    return;
  }
  if(s.playing){
    try{speechSynthesis.pause()}catch(e){}
    s.paused=true;s.playing=false;
    if(btn)btn.textContent='▶ Tiếp tục';
    setStatus('Đã tạm dừng');
    return;
  }
  startListening();
  if(btn)btn.textContent='⏸ Tạm dừng';
}

function seekRatio(ratio,auto){
  var s=listeningState,loc=locateChar(Math.round(Math.max(0,Math.min(1,ratio))*s.totalChars));
  try{speechSynthesis.cancel()}catch(e){}
  s.segIndex=loc.i;s.localStart=loc.local;s.globalChar=s.segments[loc.i].start+loc.local;s.paused=false;
  if(auto){s.stopped=false;s.playing=true;setTimeout(speakCurrent,30)}
  else{s.stopped=true;s.playing=false;setStatus('Đã tua tới '+fmt(timeForChar(s.globalChar)))}
  updateSeek(true);
}

function initListeningEnhancement(d){
  var old=document.querySelector('.listenPlayer'),scriptEl=document.getElementById('script');
  if(!old||!scriptEl)return;
  var script=(scriptEl.textContent||'').trim(),segments=prepareSegments(getListeningSegments(d,script));
  listeningState.segments=segments;listeningState.segIndex=0;listeningState.localStart=0;listeningState.globalChar=0;
  listeningState.totalChars=segments.length?segments[segments.length-1].end+1:1;listeningState.rate=1;listeningState.stopped=true;listeningState.playing=false;listeningState.paused=false;listeningState.dragging=false;listeningState.seekWasActive=false;
  old.innerHTML=
   '<div class="listenSeekRow"><span id="listenCurrentTime">0:00</span><input id="listenSeek" class="listenSeek" type="range" min="0" max="1000" step="1" value="0"><span id="listenTotalTime">0:00</span></div>'+
   '<div class="listenPlayerMain"><button id="playAudio" class="btn primary listenMainPlay">▶ Phát</button><button id="showScript" class="btn">Transcript</button></div>'+
   '<div class="listenSettings"><label><span>Tốc độ</span><input id="listenRate" type="range" min="0.65" max="1.25" step="0.05" value="1"><b id="listenRateLabel">1.00×</b></label><label><span>Giọng</span><select id="listenVoice"><option value="auto-uk">Tự nhiên • UK</option><option value="auto-us">Tự nhiên • US</option></select></label></div>'+
   '<div class="listenStatus"><span id="listenStatusText">Sẵn sàng</span></div>';
  scriptEl.classList.add('hidden');scriptEl.style.display='none';
  fillVoiceSelect();if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=fillVoiceSelect;
  document.getElementById('playAudio').onclick=toggleListeningPlayback;
  document.getElementById('showScript').onclick=function(){var hidden=scriptEl.classList.contains('hidden');scriptEl.classList.toggle('hidden');scriptEl.style.display=hidden?'block':'none';this.textContent=hidden?'Ẩn Transcript':'Transcript'};
  var rate=document.getElementById('listenRate'),label=document.getElementById('listenRateLabel');
  rate.oninput=function(){listeningState.rate=parseFloat(this.value)||1;label.textContent=Number(this.value).toFixed(2)+'×';updateSeek(true)};
  rate.onchange=function(){var active=listeningState.playing||listeningState.paused;if(active){try{speechSynthesis.cancel()}catch(e){}listeningState.stopped=false;listeningState.playing=true;listeningState.paused=false;var pb=document.getElementById('playAudio');if(pb)pb.textContent='⏸ Tạm dừng';setTimeout(speakCurrent,30)}};
  document.getElementById('listenVoice').onchange=function(){listeningState.voiceMode=this.value;var active=listeningState.playing||listeningState.paused;if(active){try{speechSynthesis.cancel()}catch(e){}listeningState.stopped=false;listeningState.playing=true;listeningState.paused=false;var pb=document.getElementById('playAudio');if(pb)pb.textContent='⏸ Tạm dừng';setTimeout(speakCurrent,30)}};

  var seek=document.getElementById('listenSeek'),dragCommitted=false;
  function commitSeek(){
    if(dragCommitted)return;
    dragCommitted=true;
    var ratio=Number(seek.value)/1000,auto=listeningState.seekWasActive;
    listeningState.dragging=false;
    seekRatio(ratio,auto);
    var pb=document.getElementById('playAudio');
    if(pb)pb.textContent=auto?'⏸ Tạm dừng':'▶ Phát';
    setTimeout(function(){dragCommitted=false},60);
  }
  seek.onpointerdown=function(){
    listeningState.dragging=true;
    listeningState.seekWasActive=listeningState.playing||listeningState.paused;
    try{speechSynthesis.cancel()}catch(e){}
    listeningState.playing=false;listeningState.paused=false;listeningState.stopped=true;
  };
  seek.oninput=function(){
    listeningState.dragging=true;
    var ratio=Number(this.value)/1000;
    var a=document.getElementById('listenCurrentTime');if(a)a.textContent=fmt(totalSeconds()*ratio);
  };
  seek.onpointerup=commitSeek;
  seek.onchange=commitSeek;
  seek.onkeydown=function(e){
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Home'||e.key==='End'){
      listeningState.seekWasActive=listeningState.playing||listeningState.paused;
      setTimeout(function(){dragCommitted=false;commitSeek()},0);
    }
  };
  updateSeek(true);
}


/* Speaking recorder + Chrome on-device AI */
var speakingState={stream:null,recorder:null,chunks:[],blob:null,url:null,start:0,timer:null,recognition:null,finalText:'',interimText:''};
function partPrompt(p){
  if(String(p)==='2')return 'Describe a skill you would like to improve. Say what it is, why, how you will practise it and how it may help you.';
  if(String(p)==='3')return 'Why do some people struggle to study consistently? How has technology changed learning? Should schools teach time management?';
  return 'What do you usually do after school? How often do you read in English? Do you prefer studying alone or with others?';
}
function speakingTimer(){var e=document.getElementById('speakingTimer');if(!e)return;var s=Math.floor((Date.now()-speakingState.start)/1000);e.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function startRecognition(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;
  try{
    var r=new SR();speakingState.recognition=r;r.lang='en-NZ';r.continuous=true;r.interimResults=true;speakingState.finalText='';speakingState.interimText='';
    r.onresult=function(ev){var f='',it='';for(var i=0;i<ev.results.length;i++){var t=ev.results[i][0]?ev.results[i][0].transcript:'';if(ev.results[i].isFinal)f+=t+' ';else it+=t}speakingState.finalText=f.trim();speakingState.interimText=it.trim();var ta=document.getElementById('speakingTranscript');if(ta)ta.value=(f+' '+it).trim()};
    r.onerror=function(){};r.start();
  }catch(e){}
}
async function startRecording(){
  var status=document.getElementById('speakingAIStatus');
  try{
    var stream=await navigator.mediaDevices.getUserMedia({audio:true});speakingState.stream=stream;speakingState.chunks=[];speakingState.blob=null;
    var opt={};if(window.MediaRecorder&&MediaRecorder.isTypeSupported('audio/webm;codecs=opus'))opt.mimeType='audio/webm;codecs=opus';
    var rec=new MediaRecorder(stream,opt);speakingState.recorder=rec;
    rec.ondataavailable=function(e){if(e.data&&e.data.size)speakingState.chunks.push(e.data)};
    rec.onstop=function(){
      speakingState.blob=new Blob(speakingState.chunks,{type:rec.mimeType||'audio/webm'});
      if(speakingState.url)URL.revokeObjectURL(speakingState.url);speakingState.url=URL.createObjectURL(speakingState.blob);
      var a=document.getElementById('speakingPlayback');if(a){a.src=speakingState.url;a.classList.remove('hidden');a.style.display='block'}
      var ai=document.getElementById('speakingAI');if(ai)ai.disabled=false;
      if(speakingState.stream)speakingState.stream.getTracks().forEach(function(t){t.stop()});speakingState.stream=null;
    };
    rec.start(250);speakingState.start=Date.now();clearInterval(speakingState.timer);speakingState.timer=setInterval(speakingTimer,250);speakingTimer();startRecognition();
    document.getElementById('speakingRecord').disabled=true;document.getElementById('speakingStop').disabled=false;if(status)status.textContent='Đang ghi âm… nói tự nhiên như trong IELTS.';
  }catch(e){if(status)status.textContent='Không mở được microphone. Hãy cho phép quyền Microphone trong Chrome.'}
}
function stopRecording(){
  if(speakingState.recorder&&speakingState.recorder.state!=='inactive')speakingState.recorder.stop();
  try{if(speakingState.recognition)speakingState.recognition.stop()}catch(e){}
  clearInterval(speakingState.timer);speakingState.timer=null;
  var a=document.getElementById('speakingRecord'),b=document.getElementById('speakingStop');if(a)a.disabled=false;if(b)b.disabled=true;
  var st=document.getElementById('speakingAIStatus');if(st)st.textContent='Đã ghi xong. Nghe lại hoặc bấm “AI chấm & sửa”.';
}
async function toAudioBuffer(blob){var C=window.AudioContext||window.webkitAudioContext,ctx=new C(),ab=await blob.arrayBuffer();return await ctx.decodeAudioData(ab.slice(0))}
function parseAI(raw){
  var t=String(raw||'').trim(),ticks=String.fromCharCode(96)+String.fromCharCode(96)+String.fromCharCode(96);
  if(t.indexOf(ticks)===0){t=t.slice(3);if(t.toLowerCase().indexOf('json')===0)t=t.slice(4);var p=t.lastIndexOf(ticks);if(p>=0)t=t.slice(0,p);t=t.trim()}
  try{return JSON.parse(t)}catch(e){var a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(x){}}return null}
}
function renderAI(d,raw){
  var el=document.getElementById('speakingAIResult');if(!el)return;
  if(!d){el.innerHTML='<div class="notice"><b>AI feedback</b><p>'+esc(raw||'Không đọc được kết quả AI.')+'</p></div>';return}
  var cs=Array.isArray(d.corrections)?d.corrections:[];
  el.innerHTML='<div class="aiSpeakingResult"><div class="aiBand"><span>Estimated practice band</span><strong>'+esc(d.estimated_band==null?'—':d.estimated_band)+'</strong><small>Không phải điểm IELTS chính thức</small></div>'+
  '<div class="grid2"><div class="grammarCard"><h3>Fluency & Coherence</h3><p>'+esc(d.fluency||'')+'</p></div><div class="grammarCard"><h3>Lexical Resource</h3><p>'+esc(d.lexical_resource||'')+'</p></div><div class="grammarCard"><h3>Grammar</h3><p>'+esc(d.grammar||'')+'</p></div><div class="grammarCard"><h3>Pronunciation</h3><p>'+esc(d.pronunciation||'')+'</p></div></div>'+
  (d.transcript?'<div class="production"><b>AI transcript</b><p>'+esc(d.transcript)+'</p></div>':'')+
  (cs.length?'<h3>Corrections</h3>'+cs.slice(0,5).map(function(x){return '<div class="usageExample"><b>'+esc(x.heard||x.original||'')+'</b><br>→ '+esc(x.better||x.correction||'')+'</div>'}).join(''):'')+
  (d.next_step?'<div class="memoryTip"><b>Lần nói tiếp theo:</b> '+esc(d.next_step)+'</div>':'')+'</div>';
}
function localFeedback(){
  var ta=document.getElementById('speakingTranscript'),text=(ta?ta.value:'').trim(),words=text?text.split(/\s+/).filter(Boolean):[],unique={};
  words.forEach(function(w){unique[w.toLowerCase().replace(/[^a-z']/g,'')]=1});
  var sec=Math.max(1,Math.floor((Date.now()-speakingState.start)/1000)),wpm=Math.round(words.length/(sec/60)),fill=(text.match(/\b(um|uh|like|you know)\b/gi)||[]).length;
  return {estimated_band:'Practice only',fluency:'About '+wpm+' words/min. '+(fill?'Detected '+fill+' common filler(s).':'Few obvious fillers in the transcript.'),lexical_resource:'About '+Object.keys(unique).length+' different word forms in '+words.length+' words.',grammar:'Check tense consistency, articles, plurals and sentence boundaries.',pronunciation:'Audio pronunciation scoring needs Chrome built-in AI on this device.',transcript:text,corrections:[],next_step:'Record the same answer again and improve one weakness at a time.'};
}
async function runAI(){
  var status=document.getElementById('speakingAIStatus'),btn=document.getElementById('speakingAI');if(!speakingState.blob){if(status)status.textContent='Hãy ghi âm trước.';return}btn.disabled=true;
  try{
    if(!window.LanguageModel){if(status)status.textContent='Chrome AI chưa khả dụng. Đang dùng phân tích cục bộ.';renderAI(localFeedback());return}
    var opts={expectedInputs:[{type:'text',languages:['en']},{type:'audio'}],expectedOutputs:[{type:'text',languages:['en']}]};
    var av=await window.LanguageModel.availability(opts);
    if(av==='unavailable'){if(status)status.textContent='Gemini Nano không khả dụng trên thiết bị này. Đang dùng phân tích cục bộ.';renderAI(localFeedback());return}
    if(status)status.textContent=av==='available'?'AI đang nghe và chấm…':'Đang chuẩn bị mô hình AI trên Chrome…';
    var session=await window.LanguageModel.create(Object.assign({},opts,{monitor:function(m){m.addEventListener('downloadprogress',function(e){if(status)status.textContent='Đang tải AI trên thiết bị: '+Math.round((e.loaded||0)*100)+'%'})}}));
    var audio=await toAudioBuffer(speakingState.blob),part=document.getElementById('speakingPart').value,q=partPrompt(part),typed=document.getElementById('speakingTranscript').value.trim();
    var instruction='You are an IELTS Speaking practice coach. Evaluate ONLY the learner audio using IELTS-style Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. This is practice feedback, not an official IELTS score. Question: '+q+'. Browser transcript may contain recognition errors: '+typed+'. Return VALID JSON ONLY: {"estimated_band":6.5,"transcript":"what you hear","fluency":"specific evidence and one fix","lexical_resource":"specific evidence and one fix","grammar":"specific evidence and one fix","pronunciation":"specific evidence and one fix","corrections":[{"heard":"learner wording","better":"natural corrected wording"}],"next_step":"one concrete thing to practise next"}. Be concise and do not invent errors.';
    var raw=await session.prompt([{role:'user',content:[{type:'text',value:instruction},{type:'audio',value:audio}]}]),data=parseAI(raw);renderAI(data,raw);
    if(data&&data.transcript&&!typed)document.getElementById('speakingTranscript').value=data.transcript;
    if(status)status.textContent='AI đã chấm xong. Sửa 1–3 lỗi quan trọng rồi ghi lại.';
    if(session.destroy)session.destroy();
  }catch(e){if(status)status.textContent='AI chưa chạy được trên thiết bị này. Đang dùng phân tích cục bộ.';renderAI(localFeedback())}
  finally{btn.disabled=false}
}

/* ---------- Pronunciation Flashcards ---------- */
var pronunciationDeck=[
 {w:'environment',ipa:'/ɪnˈvaɪrənmənt/',vi:'môi trường'},
 {w:'education',ipa:'/ˌedʒuˈkeɪʃən/',vi:'giáo dục'},
 {w:'technology',ipa:'/tekˈnɒlədʒi/',vi:'công nghệ'},
 {w:'sustainable',ipa:'/səˈsteɪnəbəl/',vi:'bền vững'},
 {w:'significant',ipa:'/sɪɡˈnɪfɪkənt/',vi:'đáng kể, quan trọng'},
 {w:'communication',ipa:'/kəˌmjuːnɪˈkeɪʃən/',vi:'giao tiếp'},
 {w:'opportunity',ipa:'/ˌɒpəˈtjuːnəti/',vi:'cơ hội'},
 {w:'challenge',ipa:'/ˈtʃælɪndʒ/',vi:'thử thách'},
 {w:'improve',ipa:'/ɪmˈpruːv/',vi:'cải thiện'},
 {w:'develop',ipa:'/dɪˈveləp/',vi:'phát triển'},
 {w:'government',ipa:'/ˈɡʌvənmənt/',vi:'chính phủ'},
 {w:'society',ipa:'/səˈsaɪəti/',vi:'xã hội'},
 {w:'available',ipa:'/əˈveɪləbəl/',vi:'có sẵn'},
 {w:'experience',ipa:'/ɪkˈspɪəriəns/',vi:'kinh nghiệm, trải nghiệm'},
 {w:'comfortable',ipa:'/ˈkʌmftəbəl/',vi:'thoải mái'},
 {w:'responsibility',ipa:'/rɪˌspɒnsəˈbɪləti/',vi:'trách nhiệm'},
 {w:'advantage',ipa:'/ədˈvɑːntɪdʒ/',vi:'lợi thế'},
 {w:'disadvantage',ipa:'/ˌdɪsədˈvɑːntɪdʒ/',vi:'bất lợi'},
 {w:'although',ipa:'/ɔːlˈðəʊ/',vi:'mặc dù'},
 {w:'particularly',ipa:'/pəˈtɪkjələli/',vi:'đặc biệt là'},
 {w:'employer',ipa:'/ɪmˈplɔɪə/',vi:'chủ lao động'},
 {w:'employee',ipa:'/ɪmˈplɔɪiː/',vi:'nhân viên'}
];
var pronState={index:0,stream:null,recorder:null,chunks:[],url:null,recognition:null,recognized:'',confidence:0,speechStart:0,speechEnd:0,recordStart:0,recording:false};

function normSpeech(s){return String(s||'').toLowerCase().replace(/[^a-z0-9' ]/g,'').replace(/\s+/g,' ').trim()}
function levDist(a,b){
 a=normSpeech(a);b=normSpeech(b);var m=a.length,n=b.length,dp=[];
 for(var i=0;i<=m;i++){dp[i]=[i];for(var j=1;j<=n;j++)dp[i][j]=i?0:j}
 for(i=1;i<=m;i++)for(j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 return dp[m][n];
}
function speechSimilarity(a,b){a=normSpeech(a);b=normSpeech(b);var max=Math.max(1,a.length,b.length);return Math.max(0,1-levDist(a,b)/max)}
function scorePronunciation(target,heard,confidence,duration){
 var sim=speechSimilarity(target,heard),conf=Math.max(0,Math.min(1,Number(confidence)||0));
 var accuracy=Math.round(Math.min(100,(sim*72)+(conf*28)));
 var completion=Math.round(Math.min(100,sim*100));
 var idealMin=.35,idealMax=1.9,fluency=100;
 if(duration<idealMin)fluency=Math.max(45,Math.round(100-(idealMin-duration)*90));
 if(duration>idealMax)fluency=Math.max(45,Math.round(100-(duration-idealMax)*24));
 if(!heard){accuracy=0;completion=0;fluency=Math.min(fluency,60)}
 var overall=Math.round(accuracy*.55+fluency*.2+completion*.25);
 return {overall:overall,accuracy:accuracy,fluency:fluency,completion:completion};
}
function currentPronItem(){return pronunciationDeck[pronState.index%pronunciationDeck.length]}
function renderPronCard(){
 var host=document.getElementById('pronunciationLab');if(!host)return;
 var x=currentPronItem(),pct=Math.round(((pronState.index+1)/pronunciationDeck.length)*100);
 host.innerHTML=
 '<div class="pronTop"><div><span class="phase">SPEAKING • PRONUNCIATION</span><h3>Flashcard & Phát âm</h3></div><b>'+(pronState.index+1)+' / '+pronunciationDeck.length+'</b></div>'+
 '<div class="pronProgress"><i style="width:'+pct+'%"></i></div>'+
 '<div class="pronCard">'+
   '<div class="pronInstruction">Hãy nói từ sau</div>'+
   '<div class="pronWord">'+esc(x.w)+'</div>'+
   '<div class="pronIPA">'+esc(x.ipa)+'</div>'+
   '<div class="pronMeaning">'+esc(x.vi)+'</div>'+
   '<div id="pronResult"></div>'+
   '<div class="pronActions" id="pronActions">'+
     '<button id="pronRecord" class="btn primary">🎙️ Nói từ này</button>'+
     '<button id="pronModel" class="btn">🔊 AI phát âm</button>'+
   '</div>'+
 '</div>';
 document.getElementById('pronRecord').onclick=togglePronRecording;
 document.getElementById('pronModel').onclick=playPronModel;
}
function playPronModel(){
 var x=currentPronItem(),u=new SpeechSynthesisUtterance(x.w),v=chooseVoice('auto-uk','F');
 u.lang='en-GB';u.rate=.82;u.pitch=1;if(v)u.voice=v;
 try{speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}
}
function startPronRecognition(){
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;
 try{
  var r=new SR();pronState.recognition=r;r.lang='en-GB';r.interimResults=false;r.continuous=false;r.maxAlternatives=3;
  r.onspeechstart=function(){pronState.speechStart=performance.now()};
  r.onspeechend=function(){pronState.speechEnd=performance.now()};
  r.onresult=function(e){
    var best=e.results&&e.results[0]&&e.results[0][0];if(best){pronState.recognized=best.transcript||'';pronState.confidence=best.confidence||0}
  };
  r.onerror=function(){};r.start();
 }catch(e){}
}
async function startPronRecording(){
 var status=document.getElementById('pronRecord');
 try{
  pronState.stream=await navigator.mediaDevices.getUserMedia({audio:true});pronState.chunks=[];pronState.recognized='';pronState.confidence=0;pronState.speechStart=0;pronState.speechEnd=0;pronState.recordStart=performance.now();
  var opt={};if(window.MediaRecorder&&MediaRecorder.isTypeSupported('audio/webm;codecs=opus'))opt.mimeType='audio/webm;codecs=opus';
  var rec=new MediaRecorder(pronState.stream,opt);pronState.recorder=rec;pronState.recording=true;
  rec.ondataavailable=function(e){if(e.data&&e.data.size)pronState.chunks.push(e.data)};
  rec.onstop=function(){
    var blob=new Blob(pronState.chunks,{type:rec.mimeType||'audio/webm'});if(pronState.url)URL.revokeObjectURL(pronState.url);pronState.url=URL.createObjectURL(blob);
    if(pronState.stream)pronState.stream.getTracks().forEach(function(t){t.stop()});pronState.stream=null;
    setTimeout(finishPronScore,220);
  };
  rec.start(150);startPronRecognition();
  if(status){status.textContent='⏹ Dừng & chấm';status.classList.add('recording')}
  setTimeout(function(){if(pronState.recording)stopPronRecording()},4500);
 }catch(e){
  var res=document.getElementById('pronResult');if(res)res.innerHTML='<div class="notice">Không mở được microphone. Hãy cho phép Microphone trong Chrome.</div>';
 }
}
function stopPronRecording(){
 if(!pronState.recording)return;pronState.recording=false;
 try{if(pronState.recorder&&pronState.recorder.state!=='inactive')pronState.recorder.stop()}catch(e){}
 try{if(pronState.recognition)pronState.recognition.stop()}catch(e){}
 var b=document.getElementById('pronRecord');if(b){b.textContent='🎙️ Nói từ này';b.classList.remove('recording')}
}
function togglePronRecording(){if(pronState.recording)stopPronRecording();else startPronRecording()}
function finishPronScore(){
 var x=currentPronItem();
 var end=pronState.speechEnd||performance.now(),start=pronState.speechStart||pronState.recordStart,dur=Math.max(.15,(end-start)/1000);
 var sc=scorePronunciation(x.w,pronState.recognized,pronState.confidence,dur);
 var res=document.getElementById('pronResult');if(!res)return;
 res.innerHTML=
 '<div class="pronScorePanel">'+
   '<div class="pronScoreMain"><span>✓</span><strong>'+sc.overall+'%</strong></div>'+
   '<div class="pronVoiceRow"><button id="pronMine" class="pronVoiceBtn">🎙️ Bạn nói</button><button id="pronModel2" class="pronVoiceBtn">🔊 AI phát âm</button></div>'+
   '<div class="pronMetrics">'+
     metricHTML('Độ chính xác',sc.accuracy)+metricHTML('Độ lưu loát',sc.fluency)+metricHTML('Độ hoàn thiện',sc.completion)+
   '</div>'+
 '</div>'+
 '<div class="pronAnalysis"><b>Phân tích từ:</b><div class="pronToken">▼ '+esc(x.w)+' <strong>'+sc.accuracy+'</strong></div>'+
 '<div class="pronHeard">Bạn nói: <b>'+esc(pronState.recognized||'Không nhận được rõ')+'</b> · '+esc(x.ipa)+'</div></div>'+
 '<div class="pronBottom"><button id="pronRetry" class="btn">↻ Thử lại</button><button id="pronNext" class="btn primary">Tiếp tục →</button></div>';
 document.getElementById('pronMine').onclick=function(){if(pronState.url){var a=new Audio(pronState.url);a.play()}};
 document.getElementById('pronModel2').onclick=playPronModel;
 document.getElementById('pronRetry').onclick=function(){renderPronCard()};
 document.getElementById('pronNext').onclick=function(){pronState.index=(pronState.index+1)%pronunciationDeck.length;renderPronCard()};
}
function metricHTML(label,val){return '<div class="pronMetric"><div><span>'+label+'</span><b>'+val+'</b></div><div class="pronMetricBar"><i style="width:'+val+'%"></i></div></div>'}

function initSpeakingEnhancement(){
  var body=document.getElementById('lessonBody');if(!body)return;
  var actions=body.querySelector('.lessonActions');
  if(!document.getElementById('pronunciationLab')){
    var lab=document.createElement('div');lab.id='pronunciationLab';lab.className='pronunciationLab';
    if(actions)body.insertBefore(lab,actions);else body.appendChild(lab);
    renderPronCard();
  }
  if(document.getElementById('speakingCoach'))return;
  var box=document.createElement('div');box.id='speakingCoach';box.className='speakingCoach';
  box.innerHTML='<div class="coachHeader"><div><span class="phase">IELTS ANSWER PRACTICE</span><h3>🤖 Speaking AI Coach</h3></div><small>Phần này chấm câu trả lời dài, khác với flashcard phát âm ở trên.</small></div>'+
  '<div class="speakingCoachTop"><label><b>Phần luyện</b> <select id="speakingPart"><option value="1">Part 1</option><option value="2">Part 2</option><option value="3">Part 3</option></select></label><strong id="speakingTimer">0:00</strong></div>'+
  '<div class="checkRow"><button id="speakingRecord" class="btn primary">🎙️ Bắt đầu ghi</button><button id="speakingStop" class="btn" disabled>⏹ Dừng</button><button id="speakingAI" class="btn" disabled>🤖 AI chấm & sửa</button></div>'+
  '<audio id="speakingPlayback" controls class="hidden"></audio><div class="production"><b>Transcript</b><textarea id="speakingTranscript" placeholder="Transcript sẽ hiện ở đây; bạn có thể sửa nếu nhận giọng sai."></textarea></div>'+
  '<div id="speakingAIStatus" class="muted">AI chạy trực tiếp trên Chrome nếu Gemini Nano khả dụng. Điểm là ước lượng luyện tập, không phải điểm IELTS chính thức.</div><div id="speakingAIResult"></div>';
  if(actions)body.insertBefore(box,actions);else body.appendChild(box);
  document.getElementById('speakingRecord').onclick=startRecording;document.getElementById('speakingStop').onclick=stopRecording;document.getElementById('speakingAI').onclick=runAI;
}


window.openLesson=function(d,i){
  baseOpenLesson(d,i);
  setTimeout(function(){
    if(document.getElementById('playAudio')) initListeningEnhancement(d);
    var title=(document.getElementById('lessonTitle')?document.getElementById('lessonTitle').textContent:'').toUpperCase();
    if(title.indexOf('SPEAKING')>=0) initSpeakingEnhancement();
  },0);
};

var close=document.getElementById('lessonClose');
if(close)close.addEventListener('click',function(){
  stopListening(true);
  try{if(speakingState.recorder&&speakingState.recorder.state!=='inactive')speakingState.recorder.stop();if(speakingState.stream)speakingState.stream.getTracks().forEach(function(t){t.stop()});if(speakingState.recognition)speakingState.recognition.stop()}catch(e){}
  try{if(pronState.recorder&&pronState.recorder.state!=='inactive')pronState.recorder.stop();if(pronState.stream)pronState.stream.getTracks().forEach(function(t){t.stop()});if(pronState.recognition)pronState.recognition.stop()}catch(e){}
});
})();
