
(function () {
  "use strict";

  var previousOpenLesson = window.openLesson;
  if (typeof previousOpenLesson !== "function") return;

  var questions = [
    {part:1,q:"What do you usually do after school?",word:"routine",pos:"noun",ipa:"/ruːˈtiːn/",vi:"thói quen",hint:"Answer directly, give one reason, then add a small example.",idea:"Studying, relaxing, gaming, exercising, or spending time with family.",def:"routine = the usual way you regularly do things."},
    {part:1,q:"Do you prefer studying alone or with other people?",word:"concentrate",pos:"verb",ipa:"/ˈkɒnsəntreɪt/",vi:"tập trung",hint:"Choose one side first and explain why it helps you learn better.",idea:"Concentration, motivation, asking questions, or distractions.",def:"concentrate = to give all your attention to something."},
    {part:1,q:"How often do you read in English?",word:"exposure",pos:"noun",ipa:"/ɪkˈspəʊʒə/",vi:"sự tiếp xúc",hint:"Give a frequency, what you read, and how it helps.",idea:"News, school texts, websites, subtitles, or short articles.",def:"exposure = the experience of being in contact with something."},
    {part:2,q:"Describe a skill you would like to improve.",word:"progress",pos:"noun",ipa:"/ˈprəʊɡres/",vi:"sự tiến bộ",hint:"Say what it is, why you want it, how you practise, and how it may help you.",idea:"English speaking, writing, cooking, coding, drawing, or another skill.",def:"progress = improvement or movement toward a better level."},
    {part:2,q:"Describe a place where you like to study.",word:"productive",pos:"adjective",ipa:"/prəˈdʌktɪv/",vi:"năng suất",hint:"Describe the place and explain why you can study well there.",idea:"Bedroom, library, school, café, or another quiet place.",def:"productive = achieving a useful amount of work."},
    {part:3,q:"To what extent do you think family members tend to have similar personality traits?",word:"resemblance",pos:"noun",ipa:"/rɪˈzembləns/",vi:"sự giống nhau",hint:"State your position, explain genetics and environment, then give an example.",idea:"Compare genetic influence with different life experiences.",def:"resemblance = similarity between two people or things."},
    {part:3,q:"Why do some people struggle to study consistently?",word:"discipline",pos:"noun",ipa:"/ˈdɪsəplɪn/",vi:"tính kỷ luật",hint:"Give two causes and explain how each affects study habits.",idea:"Poor routine, distractions, stress, unclear goals, or lack of sleep.",def:"discipline = the ability to control yourself and follow a plan."},
    {part:3,q:"How has technology changed the way people learn?",word:"accessibility",pos:"noun",ipa:"/əkˌsesəˈbɪləti/",vi:"khả năng tiếp cận",hint:"Discuss one benefit and one drawback.",idea:"Online courses, AI, instant information, distraction, or misinformation.",def:"accessibility = how easy something is to reach, use, or obtain."}
  ];

  var st = {
    index:0, stream:null, recorder:null, chunks:[], blob:null, url:null,
    recognition:null, transcript:"", finalTranscript:"", interimTranscript:"", confidence:0,
    recognitionEnded:true, recognitionWaiters:[], recognitionError:"",
    startedAt:0, timer:null, audioCtx:null, analyser:null, source:null, raf:null,
    finishHandler:null, recording:false
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];
    });
  }

  function current() { return questions[st.index % questions.length]; }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
  }
  function clamp(n,a,b) { return Math.max(a, Math.min(b,n)); }
  function wordList(t) { return String(t || "").trim().split(/\s+/).filter(Boolean); }

  function renderQuestion() {
    var body = document.getElementById("lessonBody");
    if (!body) return;
    var q = current();

    body.innerHTML =
      '<div class="spkApp">' +
        '<div class="spkTopbar">' +
          '<button id="spkChange" class="spkGhost">⟳ Đổi câu hỏi</button>' +
          '<span class="spkPart">IELTS Part ' + q.part + '</span>' +
          '<span class="spkCount">Câu hỏi: ' + (st.index + 1) + ' / ' + questions.length + '</span>' +
        '</div>' +
        '<div class="spkQuestionCard">' +
          '<h2>' + esc(q.q) + '</h2>' +
          '<p class="spkTarget">Hãy thử dùng <b>' + esc(q.word) + '</b> <span>(' + esc(q.pos) + ') · ' + esc(q.ipa) + '</span> trong câu trả lời</p>' +
          '<div class="spkMiniActions">' +
            '<button class="spkLinkBtn" data-help="hint">Xem gợi ý</button>' +
            '<button class="spkLinkBtn" data-help="idea">Bí ý tưởng?</button>' +
            '<button class="spkLinkBtn" data-help="def">Xem định nghĩa</button>' +
          '</div>' +
          '<div id="spkHelp" class="spkHelpBox hidden"></div>' +
          '<div class="spkLanguage">Đang nói: <b>English</b></div>' +
          '<div class="spkStartRow">' +
            '<button id="spkStart" class="spkStartBtn">🎙️ Bắt đầu nói</button>' +
            '<button id="spkType" class="spkTypeBtn">⌨ Nhập</button>' +
          '</div>' +
          '<div id="spkTypedWrap" class="spkTypedWrap hidden"><textarea id="spkTyped" placeholder="Nhập câu trả lời..."></textarea><button id="spkTypedSend" class="btn primary">Chấm câu trả lời</button></div>' +
        '</div>' +
        '<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>' +
      '</div>';

    document.getElementById("spkChange").onclick = function () {
      st.index = (st.index + 1) % questions.length;
      renderQuestion();
    };

    document.querySelectorAll("[data-help]").forEach(function (btn) {
      btn.onclick = function () {
        var type = btn.getAttribute("data-help");
        var text = type === "hint" ? q.hint : (type === "idea" ? q.idea : q.def);
        var box = document.getElementById("spkHelp");
        box.textContent = text;
        box.classList.remove("hidden");
      };
    });

    document.getElementById("spkStart").onclick = openRecorder;
    document.getElementById("spkType").onclick = function () {
      document.getElementById("spkTypedWrap").classList.toggle("hidden");
    };
    document.getElementById("spkTypedSend").onclick = function () {
      var text = document.getElementById("spkTyped").value.trim();
      if (!text) return;
      st.transcript = text;
      st.startedAt = Date.now() - Math.max(5000, wordList(text).length * 450);
      showResult(false);
    };

    var finish = document.getElementById("finish");
    if (finish && st.finishHandler) finish.onclick = st.finishHandler;
  }

  function openRecorder() {
    var q = current();
    var modal = document.createElement("div");
    modal.id = "spkRecordModal";
    modal.className = "spkModal";
    modal.innerHTML =
      '<div class="spkModalBackdrop"></div>' +
      '<div class="spkModalCard">' +
        '<button id="spkModalClose" class="spkModalX">×</button>' +
        '<div class="spkModalQuestion"><span class="spkPart">IELTS Part ' + q.part + '</span><h2>' + esc(q.q) + '</h2><p>Thử dùng <b>' + esc(q.word) + '</b> · ' + esc(q.ipa) + '</p></div>' +
        '<div class="spkWaveBox"><canvas id="spkWave" width="900" height="120"></canvas><div class="spkWaveMeta"><span>Tối đa 3:00</span><b id="spkTime">0:00</b></div></div>' +
        '<div class="spkLiveBox"><b>Hệ thống đang nghe:</b><p id="spkLiveTranscript">Đang nghe…</p></div>' +
        '<div class="spkModalActions"><button id="spkCancel" class="spkCancelBtn">Huỷ</button><button id="spkSend" class="spkSendBtn">↑ Gửi</button></div>' +
      '</div>';

    document.body.appendChild(modal);
    document.getElementById("spkModalClose").onclick = cancelRecorder;
    document.getElementById("spkCancel").onclick = cancelRecorder;
    document.getElementById("spkSend").onclick = sendRecorder;
    startRecorder();
  }

  async function startRecorder() {
    try {
      st.stream = await navigator.mediaDevices.getUserMedia({audio:true});
      st.chunks = [];
      st.transcript = "";
      st.confidence = 0;
      st.startedAt = Date.now();
      st.recording = true;

      var options = {};
      if (window.MediaRecorder && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options.mimeType = "audio/webm;codecs=opus";
      }
      st.recorder = new MediaRecorder(st.stream, options);
      st.recorder.ondataavailable = function (e) { if (e.data && e.data.size) st.chunks.push(e.data); };
      st.recorder.start(200);

      startRecognition();
      startWave();
      clearInterval(st.timer);
      st.timer = setInterval(function () {
        var sec = (Date.now() - st.startedAt) / 1000;
        var el = document.getElementById("spkTime");
        if (el) el.textContent = fmt(sec);
        if (sec >= 180) sendRecorder();
      }, 200);
    } catch (e) {
      var box = document.querySelector(".spkWaveBox");
      if (box) box.innerHTML = '<div class="spkMicError">Không mở được microphone. Hãy cho phép Microphone trong Chrome.</div>';
    }
  }

  function resolveRecognitionWaiters(){
    var list=st.recognitionWaiters.splice(0);
    list.forEach(function(fn){try{fn();}catch(e){}});
  }

  function waitForRecognitionFinal(timeoutMs){
    if(st.recognitionEnded)return Promise.resolve();
    return new Promise(function(resolve){
      var done=false;
      function finish(){if(done)return;done=true;resolve();}
      st.recognitionWaiters.push(finish);
      setTimeout(finish,timeoutMs||1400);
    });
  }

  function startRecognition() {
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    st.finalTranscript="";
    st.interimTranscript="";
    st.transcript="";
    st.confidence=0;
    st.recognitionError="";
    st.recognitionEnded=!SR;
    if(!SR)return;

    try{
      var r=new SR();
      st.recognition=r;
      st.recognitionEnded=false;
      r.lang="en-NZ";
      r.continuous=true;
      r.interimResults=true;
      r.maxAlternatives=3;

      r.onresult=function(ev){
        var finals=[],interims=[],conf=[];
        for(var i=0;i<ev.results.length;i++){
          var best=ev.results[i][0];
          var t=best?String(best.transcript||"").trim():"";
          if(!t)continue;
          if(best&&typeof best.confidence==="number"&&best.confidence>0)conf.push(best.confidence);
          if(ev.results[i].isFinal)finals.push(t); else interims.push(t);
        }
        st.finalTranscript=finals.join(" ").trim();
        st.interimTranscript=interims.join(" ").trim();
        st.transcript=(st.finalTranscript+" "+st.interimTranscript).trim();
        if(conf.length)st.confidence=conf.reduce(function(x,y){return x+y;},0)/conf.length;
        var live=document.getElementById("spkLiveTranscript");
        if(live)live.textContent=st.transcript||"Đang nghe…";
      };

      r.onerror=function(ev){st.recognitionError=ev&&ev.error?String(ev.error):"recognition-error";};
      r.onend=function(){
        st.recognitionEnded=true;
        st.transcript=(st.finalTranscript||st.transcript||"").trim();
        resolveRecognitionWaiters();
      };
      r.start();
    }catch(e){
      st.recognitionEnded=true;
      st.recognitionError=String(e);
      resolveRecognitionWaiters();
    }
  }

  function startWave() {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      st.audioCtx = new C();
      st.analyser = st.audioCtx.createAnalyser();
      st.analyser.fftSize = 256;
      st.source = st.audioCtx.createMediaStreamSource(st.stream);
      st.source.connect(st.analyser);

      var data = new Uint8Array(st.analyser.frequencyBinCount);
      var canvas = document.getElementById("spkWave");
      var ctx = canvas.getContext("2d");

      function draw() {
        st.raf = requestAnimationFrame(draw);
        st.analyser.getByteTimeDomainData(data);
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0,0,w,h);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 4;
        ctx.beginPath();
        var step = w / (data.length - 1);
        for (var i = 0; i < data.length; i++) {
          var x = i * step;
          var y = (data[i] / 255) * h;
          if (i === 0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      draw();
    } catch (e) {}
  }

  function cleanup(removeModal) {
    clearInterval(st.timer);
    st.timer = null;
    st.recording = false;
    try { if (st.recognition) st.recognition.stop(); } catch (e) {}
    try { if (st.stream) st.stream.getTracks().forEach(function(t){t.stop();}); } catch (e) {}
    try { if (st.raf) cancelAnimationFrame(st.raf); } catch (e) {}
    try { if (st.audioCtx) st.audioCtx.close(); } catch (e) {}
    st.stream = null;
    st.recognition = null;
    st.raf = null;
    st.audioCtx = null;
    if (removeModal) {
      var m = document.getElementById("spkRecordModal");
      if (m) m.remove();
    }
  }

  function cancelRecorder() {
    try { if (st.recorder && st.recorder.state !== "inactive") st.recorder.stop(); } catch (e) {}
    cleanup(true);
  }

  async function sendRecorder() {
    if(!st.recording)return;
    st.recording=false;

    var sendBtn=document.getElementById("spkSend");
    if(sendBtn){sendBtn.disabled=true;sendBtn.textContent="Đang nhận bài nói…";}

    try{
      if(st.recognition&&!st.recognitionEnded){
        try{st.recognition.stop();}catch(e){}
      }
      await waitForRecognitionFinal(1500);
    }catch(e){}

    var rec=st.recorder;
    function finishRecording(){
      if(st.stream)st.stream.getTracks().forEach(function(t){try{t.stop();}catch(e){}});
      if(st.raf)cancelAnimationFrame(st.raf);
      if(st.audioCtx){try{st.audioCtx.close();}catch(e){}}
      st.stream=null;st.raf=null;st.audioCtx=null;
      var m=document.getElementById("spkRecordModal");if(m)m.remove();

      st.transcript=(st.finalTranscript||st.transcript||"").trim();
      if(wordList(st.transcript).length<2){showRecognitionFailure();return;}
      showResult(true);
    }

    if(rec&&rec.state!=="inactive"){
      rec.onstop=function(){
        st.blob=new Blob(st.chunks,{type:rec.mimeType||"audio/webm"});
        if(st.url)URL.revokeObjectURL(st.url);
        st.url=URL.createObjectURL(st.blob);
        finishRecording();
      };
      try{rec.stop();}catch(e){finishRecording();}
    }else finishRecording();
  }

  function showRecognitionFailure(){
    var body=document.getElementById("lessonBody");if(!body)return;
    var reason=(st.recognitionError==="not-allowed"||st.recognitionError==="service-not-allowed")
      ?"Chrome chưa được phép dùng nhận dạng giọng nói."
      :"Website chưa nhận được đủ lời nói để chấm chính xác.";
    body.innerHTML='<div class="spkApp"><div class="spkRecognitionError"><div class="spkErrorIcon">🎙️</div><h2>Chưa nhận được bài nói</h2><p>'+esc(reason)+'</p><p>Mình không cho website tạo band giả khi chưa nhận đủ câu trả lời.</p><div class="spkResultActions"><button id="spkRecRetry" class="btn primary">🎙️ Ghi lại</button><button id="spkRecBack" class="btn">← Quay lại câu hỏi</button></div></div></div>';
    document.getElementById("spkRecRetry").onclick=openRecorder;
    document.getElementById("spkRecBack").onclick=renderQuestion;
  }

  function scoreToBand(p){
    var b=4+(Number(p)-45)/13;
    return clamp(Math.round(b*2)/2,3.5,9);
  }

  function countConnectors(text){
    var m=String(text||"").match(/\b(because|however|although|therefore|for example|for instance|while|whereas|so|but|also|firstly|secondly|personally|in my opinion)\b/gi);
    return m?m.length:0;
  }

  function localCorrections(text){
    var out=[],t=String(text||"");
    var rules=[
      [/\bi am agree\b/i,"I agree","agree không dùng với am"],
      [/\bpeople is\b/i,"people are","people là danh từ số nhiều"],
      [/\bthere have\b/i,"there is / there are","dùng there is/are để nói có"],
      [/\bmore better\b/i,"better","better đã là dạng so sánh hơn"],
      [/\bdiscuss about\b/i,"discuss","discuss không cần about"],
      [/\bdepend of\b/i,"depend on","collocation đúng là depend on"],
      [/\binformations\b/i,"information","information là danh từ không đếm được"],
      [/\badvices\b/i,"advice","advice là danh từ không đếm được"],
      [/\bchildrens\b/i,"children","children đã là số nhiều"]
    ];
    rules.forEach(function(r){var m=t.match(r[0]);if(m)out.push({wrong:m[0],better:r[1],reason:r[2]});});
    return out.slice(0,6);
  }

  function questionKeywords(q){
    var map={
      "What do you usually do after school?":["school","study","home","relax","game","family","homework","usually","after"],
      "Do you prefer studying alone or with other people?":["study","alone","people","prefer","focus","concentrate","friend","group"],
      "How often do you read in English?":["read","english","often","every","week","article","book","website"],
      "Describe a skill you would like to improve.":["skill","improve","practice","learn","better","progress","speaking","writing"],
      "Describe a place where you like to study.":["place","study","library","room","home","quiet","focus","productive"],
      "To what extent do you think family members tend to have similar personality traits?":["family","member","personality","trait","similar","genetic","experience","resemblance"],
      "Why do some people struggle to study consistently?":["study","consistently","struggle","discipline","routine","motivation","distraction","stress"],
      "How has technology changed the way people learn?":["technology","learn","online","information","course","internet","ai","access"]
    };
    return map[q.q]||[];
  }

  function questionCoverage(text,q){
    var low=String(text||"").toLowerCase(),keys=questionKeywords(q),hit=0;
    if(!keys.length)return .5;
    keys.forEach(function(k){if(low.indexOf(k)>=0)hit++;});
    return hit/keys.length;
  }

  function localScores() {
    var text = st.transcript || "";
    var ws = wordList(text);
    var duration = Math.max(1, (Date.now() - st.startedAt) / 1000);
    var wpm = ws.length / Math.max(.1, duration / 60);
    var fillers = (text.match(/\b(um|uh|erm|like|you know)\b/gi) || []).length;
    var unique = {};
    ws.forEach(function(w){ var k=w.toLowerCase().replace(/[^a-z']/g,""); if(k)unique[k]=1; });
    var lexicalRatio = ws.length ? Object.keys(unique).length/ws.length : 0;
    var connectors = countConnectors(text);
    var used = text.toLowerCase().indexOf(current().word.toLowerCase()) >= 0;
    var corrections = localCorrections(text);
    var targetWords = current().part===1 ? 28 : (current().part===2 ? 85 : 55);
    var lengthFactor = Math.min(1, ws.length/targetWords);

    var grammar = 48 + Math.min(28,ws.length*.35) + Math.min(10,connectors*2) - corrections.length*7;
    grammar = clamp(Math.round(grammar),38,91);

    var vocab = 43 + Math.min(34,lexicalRatio*50) + Math.min(8,connectors*1.5) + (used?8:0);
    vocab = clamp(Math.round(vocab),38,93);

    var pacePenalty = Math.abs(125-wpm)*.20;
    var coherence = 48 + lengthFactor*30 + Math.min(12,connectors*2) - pacePenalty - fillers*4;
    coherence = clamp(Math.round(coherence),35,94);

    var conf = Number(st.confidence)||0;
    var pronunciation = 45 + conf*42 + Math.min(7,lengthFactor*7);
    pronunciation = clamp(Math.round(pronunciation),38,96);

    var gb=scoreToBand(grammar),vb=scoreToBand(vocab),cb=scoreToBand(coherence),pb=scoreToBand(pronunciation);
    var band=clamp(Math.round(((gb+vb+cb+pb)/4)*2)/2,4,9);

    return {
      grammar:grammar,vocab:vocab,coherence:coherence,pronunciation:pronunciation,
      grammarBand:gb,vocabBand:vb,coherenceBand:cb,pronunciationBand:pb,band:band,
      words:ws.length,wpm:Math.round(wpm),fillers:fillers,connectors:connectors,corrections:corrections
    };
  }

  function sampleAnswer(q) {
    if (q.part === 1) return "I usually spend some time reviewing what I learned at school, and then I relax. Having a simple routine helps me stay organised without feeling too stressed.";
    if (q.part === 2) return "One skill I would really like to improve is my English speaking. I have made progress, but I still hesitate when I need to explain complex ideas. I plan to practise regularly by recording myself and reviewing my mistakes.";
    return "I think there is often some resemblance between family members because genetics can influence certain personality traits. However, people also have different life experiences, so they do not always behave or think in the same way.";
  }

  function markWrong(text,corrections){
    var html=esc(text);
    (corrections||[]).forEach(function(x){
      if(!x.wrong)return;
      var safe=esc(x.wrong);
      html=html.replace(safe,'<span class="spkWrongWord">'+safe+'</span>');
    });
    return html;
  }

  function showResult(useAI) {
    var body = document.getElementById("lessonBody");
    if (!body) return;
    var q = current();
    var s = localScores();
    var transcript = st.transcript || "No clear transcript was detected.";
    var localFix=s.corrections||[];

    body.innerHTML =
      '<div class="spkApp">' +
        '<div class="spkResultTop"><button id="spkBack" class="spkGhost">← Câu hỏi</button><span class="spkPart">IELTS Part ' + q.part + '</span><button id="spkNextTop" class="spkGhost">Câu tiếp →</button></div>' +
        '<div class="spkFeedbackCard good">' +
          '<div class="spkDoneLine"><span>✓ Đã hoàn thành câu trả lời</span><b id="spkOverallBand">Band luyện tập ' + s.band.toFixed(1) + '</b></div>' +
          '<h3>Bạn nói</h3><p class="spkTranscript" id="spkTranscriptMarked">' + markWrong(transcript,localFix) + '</p>' +
          '<h3>Sửa lỗi</h3><p class="spkCorrected" id="spkCorrected">' + esc(transcript) + '</p>' +
          '<div id="spkCorrections">' + (localFix.length?'<ul class="spkCorrectionList">'+localFix.map(function(x){return '<li><del>'+esc(x.wrong)+'</del> → <b>'+esc(x.better)+'</b></li>';}).join("")+'</ul>':'') + '</div>' +
        '</div>' +
        '<div class="spkScoreRow spkBandRow">' +
          '<span class="spkMetricChip"><b>Ngữ pháp</b> <strong id="spkGrammarBand">' + s.grammarBand.toFixed(1) + '</strong><small id="spkGrammarPct">' + s.grammar + '%</small></span>' +
          '<span class="spkMetricChip"><b>Từ vựng</b> <strong id="spkVocabBand">' + s.vocabBand.toFixed(1) + '</strong><small id="spkVocabPct">' + s.vocab + '%</small></span>' +
          '<span class="spkMetricChip"><b>Mạch lạc</b> <strong id="spkCoherenceBand">' + s.coherenceBand.toFixed(1) + '</strong><small id="spkCoherencePct">' + s.coherence + '%</small></span>' +
          '<span class="spkMetricChip"><b>Phát âm</b> <strong id="spkPronBand">' + s.pronunciationBand.toFixed(1) + '</strong><small id="spkPronPct">' + s.pronunciation + '%</small></span>' +
        '</div>' +
        '<div class="spkCoachBox"><div><span>Gợi ý</span><b id="spkBandBadge">' + s.band.toFixed(1) + '/9.0</b></div><p id="spkFeedbackText">Bạn nói khoảng ' + s.words + ' từ, ' + s.wpm + ' từ/phút. Hãy phát triển một ý rõ hơn, dùng từ ' + esc(q.word) + ' tự nhiên và sửa các lỗi được đánh dấu.</p><div id="spkAIState" class="spkAIState">' + (useAI?'AI đang kiểm tra audio để tinh chỉnh điểm…':'Điểm trên là ước lượng luyện tập từ transcript.') + '</div></div>' +
        '<div class="spkHighBand"><b>Câu trả lời band cao</b><p id="spkHighText">' + esc(sampleAnswer(q)) + '</p><button id="spkReadHigh" class="spkLinkBtn">🔊 Nghe câu mẫu</button></div>' +
        (st.url ? '<audio controls class="spkReplay" src="' + esc(st.url) + '"></audio>' : '') +
        '<div class="spkResultActions"><button id="spkRetry" class="btn">↻ Trả lời lại</button><button id="spkNext" class="btn primary">Câu tiếp theo →</button></div>' +
        '<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>' +
      '</div>';

    document.getElementById("spkBack").onclick = renderQuestion;
    document.getElementById("spkRetry").onclick = renderQuestion;
    document.getElementById("spkNextTop").onclick = nextQ;
    document.getElementById("spkNext").onclick = nextQ;
    document.getElementById("spkReadHigh").onclick = function () {
      var u = new SpeechSynthesisUtterance(document.getElementById("spkHighText").textContent);
      u.lang = "en-GB"; u.rate = .88;
      try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
    };

    var finish = document.getElementById("finish");
    if (finish && st.finishHandler) finish.onclick = st.finishHandler;

    if (useAI) runAIEnhancement(q, transcript, s);
  }

  function nextQ() {
    st.index = (st.index + 1) % questions.length;
    renderQuestion();
  }

  async function runAIEnhancement(q, transcript, local) {
    var stateEl=document.getElementById("spkAIState");
    if (!window.LanguageModel || !st.blob){
      if(stateEl)stateEl.textContent="AI audio không khả dụng trên Chrome này; điểm hiện tại là ước lượng luyện tập.";
      return;
    }
    try {
      var opts = {expectedInputs:[{type:"text",languages:["en"]},{type:"audio"}],expectedOutputs:[{type:"text",languages:["en"]}]};
      var av = await window.LanguageModel.availability(opts);
      if (av === "unavailable"){
        if(stateEl)stateEl.textContent="AI audio không khả dụng trên thiết bị này; điểm hiện tại là ước lượng luyện tập.";
        return;
      }

      var session = await window.LanguageModel.create(opts);
      var C = window.AudioContext || window.webkitAudioContext;
      var ctx = new C();
      var ab = await st.blob.arrayBuffer();
      var audio = await ctx.decodeAudioData(ab.slice(0));

      var prompt = "You are an IELTS Speaking practice examiner. Evaluate this learner answer against the exact question. Return JSON only with: overall_band, grammar_band, vocab_band, coherence_band, pronunciation_band (all 0-9 in 0.5 steps), corrected, feedback_vi, high_band, corrections. corrections is an array of {wrong,better}. Use audio evidence for pronunciation and fluency. Do not reward answer length by itself. Question: " + q.q + ". Browser transcript may contain recognition errors: " + transcript + ".";
      var raw = await session.prompt([{role:"user",content:[{type:"text",value:prompt},{type:"audio",value:audio}]}]);
      var text = String(raw || "").trim();
      var first = text.indexOf("{"), last = text.lastIndexOf("}");
      if (first >= 0 && last > first) text = text.slice(first,last+1);
      var d = JSON.parse(text);

      function setText(id,val){var e=document.getElementById(id);if(e&&val!==undefined&&val!==null)e.textContent=val;}
      var gb=Number(d.grammar_band),vb=Number(d.vocab_band),cb=Number(d.coherence_band),pb=Number(d.pronunciation_band),ob=Number(d.overall_band);
      if(!isFinite(gb))gb=local.grammarBand;if(!isFinite(vb))vb=local.vocabBand;if(!isFinite(cb))cb=local.coherenceBand;if(!isFinite(pb))pb=local.pronunciationBand;if(!isFinite(ob))ob=Math.round(((gb+vb+cb+pb)/4)*2)/2;
      gb=clamp(Math.round(gb*2)/2,0,9);vb=clamp(Math.round(vb*2)/2,0,9);cb=clamp(Math.round(cb*2)/2,0,9);pb=clamp(Math.round(pb*2)/2,0,9);ob=clamp(Math.round(ob*2)/2,0,9);

      setText("spkGrammarBand",gb.toFixed(1));setText("spkVocabBand",vb.toFixed(1));setText("spkCoherenceBand",cb.toFixed(1));setText("spkPronBand",pb.toFixed(1));
      setText("spkOverallBand","Band luyện tập "+ob.toFixed(1));setText("spkBandBadge",ob.toFixed(1)+"/9.0");
      if (d.corrected) setText("spkCorrected",d.corrected);
      if (d.feedback_vi) setText("spkFeedbackText",d.feedback_vi);
      if (d.high_band) setText("spkHighText",d.high_band);

      var corrections=Array.isArray(d.corrections)?d.corrections.slice(0,6):[];
      if(corrections.length){
        var holder=document.getElementById("spkCorrections");
        if(holder)holder.innerHTML='<ul class="spkCorrectionList">'+corrections.map(function(x){return '<li><del>'+esc(x.wrong||"")+'</del> → <b>'+esc(x.better||"")+'</b></li>';}).join("")+'</ul>';
        var tr=document.getElementById("spkTranscriptMarked");
        if(tr)tr.innerHTML=markWrong(transcript,corrections);
      }
      if(stateEl)stateEl.textContent="AI đã nghe audio và tinh chỉnh điểm theo 4 tiêu chí IELTS.";
      if (session.destroy) session.destroy();
      try { ctx.close(); } catch (e) {}
    } catch (e) {
      if(stateEl)stateEl.textContent="AI audio chưa chạy được; giữ điểm ước lượng luyện tập hiện tại.";
    }
  }

  function initStudio() {
    var oldFinish = document.getElementById("finish");
    st.finishHandler = oldFinish && oldFinish.onclick ? oldFinish.onclick : null;
    renderQuestion();
  }

  window.openLesson = function (d,i) {
    previousOpenLesson(d,i);
    setTimeout(function () {
      var title = document.getElementById("lessonTitle");
      var t = title ? title.textContent.toUpperCase() : "";
      if (t.indexOf("SPEAKING") >= 0) initStudio();
    }, 30);
  };

  var close = document.getElementById("lessonClose");
  if (close) close.addEventListener("click", function () {
    try { cancelRecorder(); } catch (e) {}
    try { if (st.url) URL.revokeObjectURL(st.url); } catch (e) {}
  });

})();
