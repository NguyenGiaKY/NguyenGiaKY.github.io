
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
    recognition:null, transcript:"", confidence:0, startedAt:0, timer:null,
    audioCtx:null, analyser:null, source:null, raf:null, finishHandler:null, recording:false
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

  function startRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      var r = new SR();
      st.recognition = r;
      r.lang = "en-NZ";
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 3;
      r.onresult = function (ev) {
        var finalText = "", interimText = "", conf = [];
        for (var i = 0; i < ev.results.length; i++) {
          var best = ev.results[i][0];
          var t = best ? best.transcript : "";
          if (best && typeof best.confidence === "number") conf.push(best.confidence);
          if (ev.results[i].isFinal) finalText += t + " ";
          else interimText += t + " ";
        }
        st.transcript = (finalText + " " + interimText).trim();
        if (conf.length) st.confidence = conf.reduce(function(a,b){return a+b;},0) / conf.length;
      };
      r.onerror = function () {};
      r.start();
    } catch (e) {}
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

  function sendRecorder() {
    if (!st.recording) return;
    var rec = st.recorder;
    st.recording = false;

    if (rec && rec.state !== "inactive") {
      rec.onstop = function () {
        st.blob = new Blob(st.chunks, {type:rec.mimeType || "audio/webm"});
        if (st.url) URL.revokeObjectURL(st.url);
        st.url = URL.createObjectURL(st.blob);
        cleanup(true);
        showResult(true);
      };
      try { rec.stop(); } catch (e) { cleanup(true); showResult(true); }
    } else {
      cleanup(true);
      showResult(true);
    }
  }

  function localScores() {
    var text = st.transcript || "";
    var ws = wordList(text);
    var duration = Math.max(1, (Date.now() - st.startedAt) / 1000);
    var wpm = ws.length / Math.max(.1, duration / 60);
    var fillers = (text.match(/\b(um|uh|erm|like|you know)\b/gi) || []).length;
    var unique = {};
    ws.forEach(function(w){ unique[w.toLowerCase().replace(/[^a-z']/g,"")] = 1; });
    var used = text.toLowerCase().indexOf(current().word.toLowerCase()) >= 0;

    var grammar = clamp(Math.round(52 + Math.min(30, ws.length * .7)), 45, 88);
    var vocab = clamp(Math.round(48 + Math.min(32, Object.keys(unique).length * .9) + (used ? 8 : 0)), 42, 92);
    var coherence = clamp(Math.round(84 - Math.abs(125 - wpm) * .22 - fillers * 4), 45, 94);
    var pronunciation = clamp(Math.round(55 + (st.confidence || .55) * 38), 45, 96);
    var avg = (grammar + vocab + coherence + pronunciation) / 4;
    var band = clamp(Math.round((4 + (avg - 45) / 13) * 2) / 2, 4, 8.5);

    return {grammar:grammar,vocab:vocab,coherence:coherence,pronunciation:pronunciation,band:band};
  }

  function sampleAnswer(q) {
    if (q.part === 1) return "I usually spend some time reviewing what I learned at school, and then I relax. Having a simple routine helps me stay organised without feeling too stressed.";
    if (q.part === 2) return "One skill I would really like to improve is my English speaking. I have made progress, but I still hesitate when I need to explain complex ideas. I plan to practise regularly by recording myself and reviewing my mistakes.";
    return "I think there is often some resemblance between family members because genetics can influence certain personality traits. However, people also have different life experiences, so they do not always behave or think in the same way.";
  }

  function showResult(useAI) {
    var body = document.getElementById("lessonBody");
    if (!body) return;
    var q = current();
    var s = localScores();
    var transcript = st.transcript || "No clear transcript was detected.";

    body.innerHTML =
      '<div class="spkApp">' +
        '<div class="spkResultTop"><button id="spkBack" class="spkGhost">← Câu hỏi</button><span class="spkPart">IELTS Part ' + q.part + '</span><button id="spkNextTop" class="spkGhost">Câu tiếp →</button></div>' +
        '<div class="spkFeedbackCard good">' +
          '<div class="spkDoneLine"><span>✓ Đã hoàn thành câu trả lời</span><b>Band luyện tập ' + s.band + '</b></div>' +
          '<h3>Bạn nói</h3><p class="spkTranscript">' + esc(transcript) + '</p>' +
          '<h3>Sửa lỗi</h3><p class="spkCorrected" id="spkCorrected">' + esc(transcript) + '</p>' +
        '</div>' +
        '<div class="spkScoreRow">' +
          '<span class="spkMetricChip"><b>Ngữ pháp</b> ' + s.grammar + '</span>' +
          '<span class="spkMetricChip"><b>Từ vựng</b> ' + s.vocab + '</span>' +
          '<span class="spkMetricChip"><b>Mạch lạc</b> ' + s.coherence + '</span>' +
          '<span class="spkMetricChip"><b>Phát âm</b> ' + s.pronunciation + '</span>' +
        '</div>' +
        '<div class="spkCoachBox"><div><span>Gợi ý</span><b>' + s.band + '/9.0</b></div><p id="spkFeedbackText">Tập trung vào một ý chính, giải thích lý do rồi thêm ví dụ. Hãy dùng từ <b>' + esc(q.word) + '</b> tự nhiên nếu phù hợp.</p></div>' +
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
      u.lang = "en-GB";
      u.rate = .88;
      try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
    };

    var finish = document.getElementById("finish");
    if (finish && st.finishHandler) finish.onclick = st.finishHandler;

    if (useAI) runAIEnhancement(q, transcript);
  }

  function nextQ() {
    st.index = (st.index + 1) % questions.length;
    renderQuestion();
  }

  async function runAIEnhancement(q, transcript) {
    if (!window.LanguageModel || !st.blob) return;
    try {
      var opts = {expectedInputs:[{type:"text",languages:["en"]},{type:"audio"}],expectedOutputs:[{type:"text",languages:["en"]}]};
      var av = await window.LanguageModel.availability(opts);
      if (av === "unavailable") return;

      var session = await window.LanguageModel.create(opts);
      var C = window.AudioContext || window.webkitAudioContext;
      var ctx = new C();
      var ab = await st.blob.arrayBuffer();
      var audio = await ctx.decodeAudioData(ab.slice(0));

      var prompt = "You are an IELTS Speaking practice coach. Question: " + q.q + ". Learner transcript: " + transcript + ". Return JSON only with corrected, feedback_vi, high_band. corrected should minimally correct grammar and wording. feedback_vi should be concise Vietnamese. high_band should be a natural stronger answer for the same question.";
      var raw = await session.prompt([{role:"user",content:[{type:"text",value:prompt},{type:"audio",value:audio}]}]);
      var text = String(raw || "").trim();
      var first = text.indexOf("{"), last = text.lastIndexOf("}");
      if (first >= 0 && last > first) text = text.slice(first,last+1);
      var d = JSON.parse(text);

      if (d.corrected) document.getElementById("spkCorrected").textContent = d.corrected;
      if (d.feedback_vi) document.getElementById("spkFeedbackText").textContent = d.feedback_vi;
      if (d.high_band) document.getElementById("spkHighText").textContent = d.high_band;

      if (session.destroy) session.destroy();
      try { ctx.close(); } catch (e) {}
    } catch (e) {}
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
