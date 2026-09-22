
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
    recognitionEnded:true, recognitionWaiters:[], recognitionError:"", uncertainWords:[],
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

  function speakingBuilderSteps(q){
    var map={
      "What do you usually do after school?":[
        {label:"Trả lời",text:"After school, I usually review my lessons and then relax for a while."},
        {label:"Lý do",text:"I do this because I want to keep a simple routine and avoid leaving all my schoolwork until later."},
        {label:"Ví dụ",text:"For example, I normally spend a short time checking what I learned before I play games or watch videos."},
        {label:"Kết luận",text:"Overall, this routine helps me balance studying and relaxing."}
      ],
      "Do you prefer studying alone or with other people?":[
        {label:"Trả lời",text:"I prefer studying alone most of the time."},
        {label:"Lý do",text:"The main reason is that I can concentrate better when the environment is quiet."},
        {label:"Ví dụ",text:"For example, when I study by myself, I can work at my own pace and spend more time on difficult topics."},
        {label:"Kết luận",text:"So, studying alone is usually more effective for me."}
      ],
      "How often do you read in English?":[
        {label:"Trả lời",text:"I read in English almost every day."},
        {label:"Lý do",text:"I do it because regular exposure helps me become more familiar with vocabulary and sentence structures."},
        {label:"Ví dụ",text:"For example, I read school materials, short articles and English content online."},
        {label:"Kết luận",text:"Overall, daily reading has become an important part of my English practice."}
      ],
      "Describe a skill you would like to improve.":[
        {label:"Trả lời",text:"A skill I would really like to improve is my English speaking."},
        {label:"Lý do",text:"I want to improve it because speaking clearly and confidently is important for study and everyday communication."},
        {label:"Ví dụ",text:"For example, I can record myself, listen to my mistakes and practise answering IELTS questions regularly."},
        {label:"Kết luận",text:"If I keep practising consistently, I think I will make steady progress."}
      ],
      "Describe a place where you like to study.":[
        {label:"Trả lời",text:"I like studying in a quiet place where I can focus properly."},
        {label:"Lý do",text:"A calm environment helps me stay productive and avoid distractions."},
        {label:"Ví dụ",text:"For example, I can keep my books and laptop nearby and work without being interrupted."},
        {label:"Kết luận",text:"That is why a quiet study space works best for me."}
      ],
      "To what extent do you think family members tend to have similar personality traits?":[
        {label:"Trả lời",text:"I think family members can have some similar personality traits, but they are not always the same."},
        {label:"Lý do",text:"This may be partly because of genetics and partly because people grow up in the same environment."},
        {label:"Ví dụ",text:"For example, relatives may share a similar temperament, while different life experiences can still shape their behaviour in different ways."},
        {label:"Kết luận",text:"So, there can be a resemblance in personality, but it is rarely complete."}
      ],
      "Why do some people struggle to study consistently?":[
        {label:"Trả lời",text:"Some people struggle to study consistently because they find it difficult to maintain a routine."},
        {label:"Lý do",text:"A lack of discipline, clear goals or enough rest can make regular study much harder."},
        {label:"Ví dụ",text:"For example, someone who is easily distracted may keep postponing tasks until the last minute."},
        {label:"Kết luận",text:"Therefore, a realistic routine and clear priorities can make studying more consistent."}
      ],
      "How has technology changed the way people learn?":[
        {label:"Trả lời",text:"Technology has made learning much more accessible."},
        {label:"Lý do",text:"People can now find information, lessons and explanations almost immediately."},
        {label:"Ví dụ",text:"For example, students can use online courses, videos and AI tools to review difficult topics."},
        {label:"Kết luận",text:"Overall, technology has made learning more flexible, although learners still need to use it carefully."}
      ]
    };
    return map[q.q]||[
      {label:"Trả lời",text:"Give a direct answer to the question."},
      {label:"Lý do",text:"Explain the main reason for your answer."},
      {label:"Ví dụ",text:"Add one specific example from your own idea."},
      {label:"Kết luận",text:"Finish with a short result, feeling or summary."}
    ];
  }

  function builderPanelHTML(q,expanded){
    var steps=speakingBuilderSteps(q);
    if(expanded){
      return '<aside class="spkBuilder spkBuilderExpanded">'+
        '<div class="spkBuilderTabs"><b>💡 Gợi ý từng bước</b><span>📘 Từ vựng hữu ích</span></div>'+
        '<div class="spkBuilderReady"><strong>4/4 bước</strong><div class="spkBuilderSegments"><i></i><i></i><i></i><i></i></div></div>'+
        '<div class="spkExpandedSteps">'+steps.map(function(s,i){
          return '<div class="spkExpandedStep">'+
            '<span class="spkBuilderNum">'+(i+1)+'</span>'+
            '<div><div class="spkExpandedLabel"><b>'+esc(s.label)+'</b><small>'+(i===0?'Trả lời trực tiếp câu hỏi':i===1?'Giải thích lý do':i===2?'Đưa ra ví dụ cụ thể':'Kết thúc và nêu cảm nhận')+'</small></div>'+
            '<p>'+esc(s.text)+'</p></div>'+
          '</div>';
        }).join("")+'</div>'+
        '<div class="spkBuilderSuccess"><span>✓</span><div><b>Bạn đã sẵn sàng!</b><p>Hãy nói tự nhiên theo ý của bạn, rồi nhấn <strong>Chấm bài</strong> để nhận phản hồi từ AI.</p></div></div>'+
      '</aside>';
    }
    return '<aside class="spkBuilder">'+
      '<div class="spkBuilderHead"><div><span>💡 Gợi ý từng bước</span><b id="spkBuilderProgress">0/4 bước</b></div><small>Cấu trúc trả lời cho Speaking Builder</small></div>'+
      '<div class="spkBuilderBar"><i id="spkBuilderBarFill"></i></div>'+
      '<div class="spkBuilderSteps">'+steps.map(function(s,i){
        return '<button class="spkBuilderStep" data-builder-step="'+i+'"><span class="spkBuilderNum">'+(i+1)+'</span><span class="spkBuilderLabel">'+esc(s.label)+'</span><span class="spkBuilderArrow">›</span></button>'+
          '<div class="spkBuilderExample hidden" id="spkBuilderExample'+i+'"><b>'+esc(s.label)+'</b><p>'+esc(s.text)+'</p></div>';
      }).join("")+'</div>'+
      '<div class="spkBuilderTip">Mẹo: dùng ý của <b>bạn</b>. Các câu trên chỉ là khung để bạn biết cách mở rộng câu trả lời.</div>'+
    '</aside>';
  }

  function bindBuilder(){
    var opened={};
    document.querySelectorAll("[data-builder-step]").forEach(function(btn){
      btn.onclick=function(){
        var i=Number(this.getAttribute("data-builder-step"));
        var ex=document.getElementById("spkBuilderExample"+i);
        if(!ex)return;
        var isHidden=ex.classList.contains("hidden");
        ex.classList.toggle("hidden");
        if(isHidden)opened[i]=true;else delete opened[i];
        this.classList.toggle("active",isHidden);
        var count=Object.keys(opened).length;
        var p=document.getElementById("spkBuilderProgress");
        var bar=document.getElementById("spkBuilderBarFill");
        if(p)p.textContent=count+"/4 bước";
        if(bar)bar.style.width=(count/4*100)+"%";
      };
    });
  }

  function renderQuestion() {
    st.progressRecorded=false;
    var body = document.getElementById("lessonBody");
    if (!body) return;
    var q = current();

    body.innerHTML =
      '<div class="spkApp spkQuestionPage">' +
        '<div class="spkTopbar">' +
          '<button id="spkChange" class="spkGhost">⟳ Đổi câu hỏi</button>' +
          '<span class="spkPart">IELTS Part ' + q.part + '</span>' +
          '<span class="spkCount">Câu hỏi: ' + (st.index + 1) + ' / ' + questions.length + '</span>' +
        '</div>' +
        '<div class="spkBuilderLayout">' +
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
        builderPanelHTML(q) +
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

    bindBuilder();
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
    renderRecordingPage();
  }

  function renderRecordingPage(){
    var body=document.getElementById("lessonBody");
    if(!body)return;
    var q=current();

    body.innerHTML=
      '<div class="spkApp spkQuestionPage spkRecordingPage">'+
        '<div class="spkTopbar spkRecordingTopbar">'+
          '<button id="spkBackFromRecord" class="spkGhost">← Quay lại</button>'+
          '<span class="spkPart">IELTS Part '+q.part+'</span>'+
          '<span class="spkCount">Câu hỏi: '+(st.index+1)+' / '+questions.length+'</span>'+
        '</div>'+
        '<div class="spkBuilderLayout">'+
          '<section class="spkRecordingCard">'+
            '<div class="spkRecordingQuestion">'+
              '<div class="spkQuestionLine"><span class="spkSpeakerIcon">🔊</span><h2>'+esc(q.q)+'</h2></div>'+
              '<p>Hãy trả lời bằng tiếng Anh. Bạn có tối đa 3:00 để nói.</p>'+
              '<div class="spkRecordLimit">◷ <span>Thời gian trả lời</span><b>Tối đa 3:00</b></div>'+
            '</div>'+
            '<div class="spkSpeakingAnswer">'+
              '<div class="spkSpeakingAnswerHead"><b>Bài nói của bạn</b><span id="spkLiveCount">0 từ</span></div>'+
              '<div id="spkLiveTranscript" class="spkSpeakingTranscript">Đang nghe…</div>'+
            '</div>'+
            '<div class="spkInlineRecorder">'+
              '<button id="spkRecordPulse" class="spkRecordPulse" aria-label="Đang ghi âm">●</button>'+
              '<span id="spkTime" class="spkRecordTime">0:00 / 3:00</span>'+
              '<div class="spkWaveInline"><canvas id="spkWave" width="900" height="90"></canvas></div>'+
              '<span class="spkVolume">🔊</span>'+
            '</div>'+
            '<div class="spkRecordingActions">'+
              '<button id="spkRetryRecord" class="spkRecordAction secondary">↻ <span><b>Nói lại</b><small>Ghi âm lại bài nói</small></span></button>'+
              '<button id="spkSaveRecord" class="spkRecordAction light">▱ <span><b>Lưu bài nói</b><small>Lưu để xem lại sau</small></span></button>'+
              '<button id="spkSend" class="spkRecordAction grade">✦ <span><b>Chấm bài</b><small>AI sẽ đánh giá bài nói của bạn</small></span></button>'+
            '</div>'+
          '</section>'+
          builderPanelHTML(q,true)+
        '</div>'+
      '</div>';

    document.getElementById("spkBackFromRecord").onclick=function(){
      cleanup(false);
      renderQuestion();
    };
    document.getElementById("spkRetryRecord").onclick=function(){
      cleanup(false);
      setTimeout(renderRecordingPage,80);
    };
    document.getElementById("spkSaveRecord").onclick=function(){
      try{localStorage.setItem("speaking_saved_"+q.q,st.transcript||"");}catch(e){}
      this.innerHTML='✓ <span><b>Đã lưu</b><small>Bài nói đã được lưu</small></span>';
    };
    document.getElementById("spkSend").onclick=sendRecorder;
    startRecorder();
  }

  async function startRecorder() {
    try {
      st.stream = await navigator.mediaDevices.getUserMedia({
        audio:{
          channelCount:1,
          sampleRate:{ideal:48000},
          sampleSize:{ideal:16},
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true
        }
      });
      st.chunks = [];
      st.transcript = "";
      st.confidence = 0;
      st.startedAt = Date.now();
      st.recording = true;

      var options = {audioBitsPerSecond:192000};
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
        if (el) el.textContent = fmt(sec) + " / 3:00";
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

  function cleanWord(w){
    return String(w||"").toLowerCase().replace(/[^a-z']/g,"");
  }

  function collectUncertainWords(result){
    if(!result||!result.length)return;
    var best=result[0],bestText=best?String(best.transcript||"").trim():"";
    if(!bestText)return;
    var bestWords=bestText.split(/\s+/).map(cleanWord).filter(Boolean);
    var altTexts=[];
    for(var a=1;a<Math.min(result.length,3);a++){
      var t=String(result[a].transcript||"").trim();
      if(t)altTexts.push(t.split(/\s+/).map(cleanWord).filter(Boolean));
    }
    var conf=(best&&typeof best.confidence==="number")?best.confidence:0;
    for(var i=0;i<bestWords.length;i++){
      var w=bestWords[i];
      if(w.length<3)continue;
      var disagreement=0;
      altTexts.forEach(function(arr){if(arr[i]&&arr[i]!==w)disagreement++;});
      if(conf>0 && conf<.72)disagreement++;
      if(disagreement){
        if(!st.uncertainWords.some(function(x){return x.word===w;})){
          st.uncertainWords.push({word:w,confidence:conf,reason:disagreement});
        }
      }
    }
    if(st.uncertainWords.length>8)st.uncertainWords=st.uncertainWords.slice(0,8);
  }

  async function fetchIPA(word){
    try{
      var res=await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(word));
      if(!res.ok)return "";
      var data=await res.json();
      var entry=Array.isArray(data)?data[0]:null;
      if(!entry)return "";
      if(entry.phonetic)return entry.phonetic;
      var ph=(entry.phonetics||[]).find(function(x){return x&&x.text;});
      return ph&&ph.text?ph.text:"";
    }catch(e){return "";}
  }

  function speakPronWord(word){
    try{
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(word);
      u.lang="en-GB";u.rate=.72;u.pitch=1;
      speechSynthesis.speak(u);
    }catch(e){}
  }

  function fallbackPronHTML(){
    if(!st.uncertainWords.length){
      return '<div class="spkPronEmpty"><b>Chưa xác định được từ phát âm cần sửa.</b><p>Nhận dạng giọng nói không phát hiện từ nào có độ không chắc rõ ràng. Điều này không có nghĩa phát âm hoàn hảo.</p></div>';
    }
    return '<div class="spkPronNotice">⚠️ Đây là các từ <b>nhận dạng chưa chắc chắn</b>, chưa thể khẳng định là phát âm sai.</div>'+
      '<div id="spkPronList">'+st.uncertainWords.slice(0,6).map(function(x,i){
        return '<div class="spkPronItem" data-pron-word="'+esc(x.word)+'"><div class="spkPronWord"><b>'+esc(x.word)+'</b><span id="spkIpa-'+i+'">đang lấy IPA…</span></div><div class="spkPronActions"><button class="spkPronListen" data-word="'+esc(x.word)+'">🔊 Nghe mẫu</button></div><p>Chrome nghe từ này chưa ổn định. Hãy nghe mẫu, nói chậm lại và chú ý trọng âm.</p></div>';
      }).join("")+'</div>';
  }

  async function hydrateFallbackPronunciation(){
    var items=document.querySelectorAll(".spkPronItem[data-pron-word]");
    items.forEach(function(item,i){
      var word=item.getAttribute("data-pron-word");
      fetchIPA(word).then(function(ipa){
        var e=document.getElementById("spkIpa-"+i);
        if(e)e.textContent=ipa||"IPA chưa có";
      });
    });
    document.querySelectorAll(".spkPronListen").forEach(function(b){
      b.onclick=function(){speakPronWord(this.getAttribute("data-word"));};
    });
  }

  function renderAIPronunciation(list){
    var box=document.getElementById("spkPronunciationFeedback");
    if(!box)return;
    if(!Array.isArray(list)||!list.length){
      box.innerHTML=fallbackPronHTML();
      hydrateFallbackPronunciation();
      return;
    }
    box.innerHTML='<div class="spkPronNotice good">AI đã nghe audio và chỉ ra các điểm phát âm nên sửa.</div>'+
      '<div class="spkPronList">'+list.slice(0,8).map(function(x){
        return '<div class="spkPronItem">'+
          '<div class="spkPronWord"><b>'+esc(x.word||"")+'</b><span>'+esc(x.ipa||"")+'</span></div>'+
          (x.heard_as?'<p><b>AI nghe gần giống:</b> '+esc(x.heard_as)+'</p>':'')+
          (x.issue_vi?'<p><b>Vấn đề:</b> '+esc(x.issue_vi)+'</p>':'')+
          (x.tip_vi?'<p><b>Cách sửa:</b> '+esc(x.tip_vi)+'</p>':'')+
          '<div class="spkPronActions"><button class="spkPronListen" data-word="'+esc(x.word||"")+'">🔊 Nghe mẫu</button></div>'+
        '</div>';
      }).join("")+'</div>';
    document.querySelectorAll(".spkPronListen").forEach(function(b){
      b.onclick=function(){speakPronWord(this.getAttribute("data-word"));};
    });
  }

  function startRecognition() {
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    st.finalTranscript="";
    st.interimTranscript="";
    st.transcript="";
    st.confidence=0;
    st.recognitionError="";
    st.uncertainWords=[];
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
          if(ev.results[i].isFinal){finals.push(t);collectUncertainWords(ev.results[i]);} else interims.push(t);
        }
        st.finalTranscript=finals.join(" ").trim();
        st.interimTranscript=interims.join(" ").trim();
        st.transcript=(st.finalTranscript+" "+st.interimTranscript).trim();
        if(conf.length)st.confidence=conf.reduce(function(x,y){return x+y;},0)/conf.length;
        var live=document.getElementById("spkLiveTranscript");
        if(live)live.textContent=st.transcript||"Đang nghe…";
        var countEl=document.getElementById("spkLiveCount");
        if(countEl)countEl.textContent=wordList(st.transcript).length+" từ";
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
    renderQuestion();
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
    var text=st.transcript||"";
    var ws=wordList(text);
    var duration=Math.max(1,(Date.now()-st.startedAt)/1000);
    var wpm=ws.length/Math.max(.1,duration/60);
    var fillers=(text.match(/\b(um|uh|erm|like|you know)\b/gi)||[]).length;
    var unique={};
    ws.forEach(function(w){var k=w.toLowerCase().replace(/[^a-z']/g,"");if(k)unique[k]=1;});
    var lexicalRatio=ws.length?Object.keys(unique).length/ws.length:0;
    var connectors=countConnectors(text);
    var used=text.toLowerCase().indexOf(current().word.toLowerCase())>=0;
    var corrections=localCorrections(text);
    var relevance=questionCoverage(text,current());
    var targetWords=current().part===1?28:(current().part===2?85:55);
    var lengthFactor=Math.min(1,ws.length/targetWords);

    var grammar=46+Math.min(26,ws.length*.33)+Math.min(10,connectors*2)-corrections.length*7;
    grammar=clamp(Math.round(grammar),35,88);

    var vocab=42+Math.min(31,lexicalRatio*48)+Math.min(8,connectors*1.5)+(used?7:0);
    vocab=clamp(Math.round(vocab),35,90);

    var pacePenalty=Math.abs(125-wpm)*.20;
    var coherence=42+lengthFactor*23+Math.min(10,connectors*2)+(relevance*18)-pacePenalty-fillers*4;
    coherence=clamp(Math.round(coherence),30,91);

    var conf=Number(st.confidence)||0;
    var pronunciation=42+conf*42+Math.min(7,lengthFactor*7);
    pronunciation=clamp(Math.round(pronunciation),35,92);

    if(relevance<.12){coherence=Math.min(coherence,48);vocab=Math.min(vocab,58);}
    if(ws.length<8){grammar=Math.min(grammar,55);vocab=Math.min(vocab,55);coherence=Math.min(coherence,50);}

    var gb=scoreToBand(grammar),vb=scoreToBand(vocab),cb=scoreToBand(coherence),pb=scoreToBand(pronunciation);
    var band=clamp(Math.round(((gb+vb+cb+pb)/4)*2)/2,3.5,8.5);
    if(relevance<.12)band=Math.min(band,5.0);
    if(ws.length<5)band=Math.min(band,4.5);

    return {
      grammar:grammar,vocab:vocab,coherence:coherence,pronunciation:pronunciation,
      grammarBand:gb,vocabBand:vb,coherenceBand:cb,pronunciationBand:pb,band:band,
      words:ws.length,wpm:Math.round(wpm),fillers:fillers,connectors:connectors,relevance:relevance,
      corrections:corrections
    };
  }

  function sameIdeaHighBandFallback(transcript,corrections){
    var text=applyCorrectionsText(String(transcript||"").trim(),corrections||[]);
    if(!text)return "";
    text=text.replace(/\s+/g," ").trim();
    text=text.replace(/\bi think\b/gi,"In my view");
    text=text.replace(/\bin my opinion\b/gi,"From my perspective");
    text=text.replace(/\bbecause\b/gi,"mainly because");
    text=text.replace(/\balso\b/gi,"also");
    if(text && !/[.!?]$/.test(text))text+=".";
    return text;
  }


  function applyCorrectionsText(text,corrections){
    var out=String(text||"");
    (corrections||[]).forEach(function(x){
      var wrong=String(x.wrong||"").trim(),better=String(x.better||"").trim();
      if(!wrong||!better)return;
      var low=out.toLowerCase(),idx=low.indexOf(wrong.toLowerCase());
      if(idx>=0)out=out.slice(0,idx)+better+out.slice(idx+wrong.length);
    });
    return out;
  }

  function inlineCorrectionHTML(text,corrections){
    text=String(text||"");
    var used=[],ranges=[];
    (corrections||[]).forEach(function(x){
      var wrong=String(x.wrong||"").trim(),better=String(x.better||"").trim();
      if(!wrong||!better)return;
      var low=text.toLowerCase(),needle=wrong.toLowerCase(),start=0,idx=-1;
      while((idx=low.indexOf(needle,start))>=0){
        var overlap=used.some(function(r){return idx<r.end && idx+wrong.length>r.start;});
        if(!overlap)break;
        start=idx+wrong.length;
      }
      if(idx>=0){
        var range={start:idx,end:idx+wrong.length,wrong:text.slice(idx,idx+wrong.length),better:better};
        used.push(range);ranges.push(range);
      }
    });
    ranges.sort(function(x,y){return x.start-y.start;});
    if(!ranges.length)return esc(text);
    var html="",pos=0;
    ranges.forEach(function(r){
      html+=esc(text.slice(pos,r.start));
      html+='<span class="spkInlineFix"><del>'+esc(r.wrong)+'</del><ins>'+esc(r.better)+'</ins></span>';
      pos=r.end;
    });
    html+=esc(text.slice(pos));
    return html;
  }

  function speakingAnnotatedTranscriptHTML(text,corrections,fillers,pron){
    text=String(text||"");
    var ranges=[],used=[];
    function addRange(phrase,kind,priority,title){
      phrase=String(phrase||"").trim();
      if(!phrase)return;
      var low=text.toLowerCase(),needle=phrase.toLowerCase(),start=0,idx=-1;
      while((idx=low.indexOf(needle,start))>=0){
        var overlap=used.some(function(r){return idx<r.end&&idx+phrase.length>r.start;});
        if(!overlap)break;
        start=idx+Math.max(1,phrase.length);
      }
      if(idx<0)return;
      var r={start:idx,end:idx+phrase.length,kind:kind,priority:priority||1,title:title||""};
      used.push(r);ranges.push(r);
    }
    (corrections||[]).forEach(function(x){
      addRange(x.wrong,"error",4,x.reason||"Cần sửa");
    });
    (pron||[]).forEach(function(x){
      addRange(x.word,"pron",3,x.issue_vi||"Phát âm cần chú ý");
    });
    (fillers||[]).forEach(function(x){
      addRange(typeof x==="string"?x:x.text,"filler",2,(x&&x.reason_vi)||"Filler");
    });
    ranges.sort(function(a,b){return a.start-b.start||b.priority-a.priority;});
    var html="",pos=0;
    ranges.forEach(function(r){
      if(r.start<pos)return;
      html+=esc(text.slice(pos,r.start));
      html+='<span class="spkMark spkMark-'+r.kind+'" title="'+esc(r.title)+'">'+esc(text.slice(r.start,r.end))+'</span>';
      pos=r.end;
    });
    html+=esc(text.slice(pos));
    return html;
  }

  function speakingHighBandHTML(text,highlights){
    text=String(text||"");
    var used=[],ranges=[];
    (Array.isArray(highlights)?highlights:[]).forEach(function(x){
      var phrase=String(x&&x.phrase||"").trim();
      if(!phrase)return;
      var low=text.toLowerCase(),needle=phrase.toLowerCase(),start=0,idx=-1;
      while((idx=low.indexOf(needle,start))>=0){
        var overlap=used.some(function(r){return idx<r.end&&idx+phrase.length>r.start;});
        if(!overlap)break;
        start=idx+Math.max(1,phrase.length);
      }
      if(idx>=0){
        var cat=String(x.category||"vocabulary").toLowerCase();
        if(!/^(vocabulary|grammar|development|linking)$/.test(cat))cat="vocabulary";
        var r={start:idx,end:idx+phrase.length,cat:cat};
        used.push(r);ranges.push(r);
      }
    });
    ranges.sort(function(a,b){return a.start-b.start;});
    if(!ranges.length)return esc(text);
    var html="",pos=0;
    ranges.forEach(function(r){
      html+=esc(text.slice(pos,r.start));
      html+='<span class="spkHighMark spkHigh-'+r.cat+'">'+esc(text.slice(r.start,r.end))+'</span>';
      pos=r.end;
    });
    html+=esc(text.slice(pos));
    return html;
  }

  function speakResultText(id){
    var el=document.getElementById(id);if(!el)return;
    var txt=String(el.textContent||"").trim();if(!txt)return;
    var u=new SpeechSynthesisUtterance(txt);
    u.lang="en-GB";u.rate=.88;
    try{speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
  }

  function correctionDetailHTML(corrections){
    var list=Array.isArray(corrections)?corrections:[];
    if(!list.length)return "";
    return '<details class="spkCorrectionDetails"><summary>Xem '+list.length+' lỗi AI đã xác định</summary><div>'+
      list.slice(0,10).map(function(x){
        var type=String(x.type||"other").replace("_"," ");
        return '<div class="spkCorrectionDetail">'+
          '<span class="spkCorrectionType">'+esc(type)+'</span>'+
          '<div><del>'+esc(x.wrong||"")+'</del> <b>→</b> <ins>'+esc(x.better||"")+'</ins></div>'+
          (x.reason?'<small>'+esc(x.reason)+'</small>':'')+
        '</div>';
      }).join("")+
    '</div></details>';
  }

  function pronunciationSummaryHTML(list){
    var arr=Array.isArray(list)&&list.length?list:st.uncertainWords;
    if(!arr||!arr.length)return '<span class="spkPronNone">Chưa xác định lỗi phát âm cụ thể.</span>';
    return arr.slice(0,6).map(function(x){
      var word=x.word||"",ipa=x.ipa||"";
      return '<span class="spkPronFlag" data-word="'+esc(word)+'"><b>'+esc(word)+'</b>'+(ipa?' <em>'+esc(ipa)+'</em>':'')+'</span>';
    }).join(" ");
  }


  function showResult(useAI) {
    var body=document.getElementById("lessonBody");
    if(!body)return;
    var q=current(),s=localScores(),transcript=st.transcript||"No clear transcript was detected.";
    var localFix=s.corrections||[];
    var localCorrected=applyCorrectionsText(transcript,localFix);

    body.innerHTML=
      '<div class="spkApp spkCoachResult">'+
        '<div class="spkResultTop"><button id="spkBack" class="spkGhost">← Câu hỏi</button><span class="spkPart">IELTS Part '+q.part+' · AI Speaking Coach</span><button id="spkNextTop" class="spkGhost">Câu tiếp →</button></div>'+

        '<section class="spkAnswerAnalysis">'+
          '<div class="spkAnswerAnalysisHead"><div><span>✓ Đã sử dụng câu trả lời thật của bạn</span><b>Câu trả lời của bạn</b></div><span class="spkDonePill">Hoàn thành</span></div>'+
          '<div class="spkAnswerMarked spkTranscriptRich" id="spkTranscriptMarked">'+speakingAnnotatedTranscriptHTML(transcript,localFix,[],[])+'</div>'+
          '<div class="spkTranscriptLegend"><span class="err">Sai / chưa tự nhiên</span><span class="filler">Filler</span><span class="pron">Phát âm cần chú ý</span></div>'+
          '<div class="spkPronInline"><span class="spkPronIcon">Aa Aa Aa</span><b> Phát âm chưa chuẩn:</b> <span id="spkPronInlineList">'+pronunciationSummaryHTML([])+'</span></div>'+
          '<div id="spkDeliveryFeedback" class="spkDeliveryFeedback hidden"></div>'+
          '<div class="spkRewriteLine"><b>Sửa lỗi:</b> <span id="spkCorrected">'+esc(localCorrected)+'</span>'+
            '<div class="spkMiniAudioActions">'+
              (st.url?'<button id="spkPlayMine" class="spkIconBtn" title="Nghe lại bài của bạn">🔊 Bài của tôi</button>':'')+
              '<button id="spkReadCorrected" class="spkIconBtn" title="Nghe bản sửa">🔊 Bản sửa</button>'+
            '</div>'+
          '</div>'+
          '<div id="spkCorrections">'+correctionDetailHTML(localFix)+'</div>'+
        '</section>'+

        '<div class="spkScoreRow spkBandRow spkScreenshotBands">'+
          '<span class="spkOverallChip"><b id="spkOverallBand">'+s.band.toFixed(1)+'</b></span>'+
          '<span class="spkMetricChip"><b>Ngữ pháp</b> <strong id="spkGrammarBand">'+s.grammarBand.toFixed(1)+'</strong></span>'+
          '<span class="spkMetricChip"><b>Từ vựng</b> <strong id="spkVocabBand">'+s.vocabBand.toFixed(1)+'</strong></span>'+
          '<span class="spkMetricChip"><b>Mạch lạc</b> <strong id="spkCoherenceBand">'+s.coherenceBand.toFixed(1)+'</strong></span>'+
          '<span class="spkMetricChip"><b>Phát âm</b> <strong id="spkPronBand">'+s.pronunciationBand.toFixed(1)+'</strong></span>'+
        '</div>'+

        '<section class="spkCoachBox spkStructuredCoach">'+
          '<div class="spkCoachHead"><div><span>Gợi ý</span><em>🤖 AI Coach</em></div><b id="spkBandBadge">'+s.band.toFixed(1)+'/9.0</b></div>'+
          '<p id="spkFeedbackText" class="spkCoachSummary">Đang phân tích bài nói thật của bạn theo 4 tiêu chí IELTS Speaking…</p>'+
          '<div class="spkCoachRows">'+
            '<p><b>Grammar:</b> <span id="spkCoachGrammar">Đang phân tích cấu trúc câu và lỗi ngữ pháp quan trọng nhất.</span></p>'+
            '<p><b>Vocab:</b> <span id="spkCoachVocab">Đang tìm collocation/từ vựng có thể nâng cấp.</span></p>'+
            '<p><b>Phát triển ý:</b> <span id="spkCoachDevelop">Đang kiểm tra câu trả lời đã đủ lý do, ví dụ và kết quả chưa.</span></p>'+
            '<p id="spkCoachPronRow" class="hidden"><b>Pronunciation:</b> <span id="spkCoachPron"></span></p>'+
          '</div>'+
          '<div id="spkStrengths" class="spkStrengths hidden"></div>'+
          '<div id="spkAIState" class="spkAIState">'+(useAI?'OpenAI đang nghe trực tiếp audio để chấm và chữa…':'Điểm trên là ước lượng luyện tập từ transcript thật.')+'</div>'+
        '</section>'+

        '<section class="spkHighBand spkBandUpgradeCard">'+
          '<div class="spkHighHead"><div><span>Câu trả lời band cao hơn</span><small>Giữ nguyên core ideas của bạn</small></div><button id="spkReadHigh" class="spkIconBtn">🔊 Nghe mẫu</button></div>'+
          '<p id="spkHighText">'+speakingHighBandHTML(sameIdeaHighBandFallback(transcript,localFix),[])+'</p>'+
          '<div class="spkHighLegend"><span class="vocab">Vocabulary</span><span class="grammar">Grammar</span><span class="develop">Development</span><span class="link">Linking</span></div>'+
        '</section>'+
        (st.url?'<audio id="spkUserAudio" class="spkReplay spkHiddenAudio" src="'+esc(st.url)+'"></audio>':'')+
        '<div class="spkResultActions"><button id="spkRetry" class="btn">↻ Trả lời lại</button><button id="spkNext" class="btn primary">Câu tiếp theo →</button></div>'+
        '<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>'+
      '</div>';

    document.getElementById("spkBack").onclick=renderQuestion;
    document.getElementById("spkRetry").onclick=renderQuestion;
    document.getElementById("spkNextTop").onclick=nextQ;
    document.getElementById("spkNext").onclick=nextQ;
    document.getElementById("spkReadHigh").onclick=function(){speakResultText("spkHighText");};
    document.getElementById("spkReadCorrected").onclick=function(){speakResultText("spkCorrected");};
    var playMine=document.getElementById("spkPlayMine");
    if(playMine)playMine.onclick=function(){
      var a=document.getElementById("spkUserAudio");if(!a)return;
      try{a.currentTime=0;a.play();}catch(e){}
    };
    document.querySelectorAll(".spkPronFlag").forEach(function(el){
      el.onclick=function(){speakPronWord(this.getAttribute("data-word"));};
    });

    var finish=document.getElementById("finish");
    if(finish&&st.finishHandler)finish.onclick=st.finishHandler;

    if(useAI)runAIEnhancement(q,transcript,s);
  }

  function nextQ() {
    st.index = (st.index + 1) % questions.length;
    renderQuestion();
  }

  function extractAIJSON(raw){
    var text=String(raw||"").trim(),first=text.indexOf("{"),last=text.lastIndexOf("}");
    if(first>=0&&last>first)text=text.slice(first,last+1);
    return JSON.parse(text);
  }

  function looksVietnamese(text){
    text=String(text||"").trim();
    if(!text)return false;
    if(/[ăâđêôơưĂÂĐÊÔƠƯ]|[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(text))return true;
    var low=" "+text.toLowerCase()+" ";
    var common=[" tôi "," bạn "," của "," và "," nhưng "," không "," một "," những "," thường "," chơi "," xem "," sau "," giờ "," học "," với "," vì "," là "," được "," giúp "];
    var hits=0;common.forEach(function(w){if(low.indexOf(w)>=0)hits++;});
    return hits>=2;
  }

  function ensureEnglishImprovement(candidate,transcript,corrections){
    var t=String(candidate||"").trim();
    if(!t||looksVietnamese(t))return sameIdeaHighBandFallback(transcript,corrections||[]);
    return t;
  }

  function applyAIResult(d,transcript,local,label){
    function setText(id,val){var e=document.getElementById(id);if(e&&val!==undefined&&val!==null)e.textContent=val;}
    var gb=Number(d.grammar_band),vb=Number(d.vocab_band),cb=Number(d.coherence_band),pb=Number(d.pronunciation_band),ob=Number(d.overall_band);
    if(!isFinite(gb))gb=local.grammarBand;if(!isFinite(vb))vb=local.vocabBand;if(!isFinite(cb))cb=local.coherenceBand;if(!isFinite(pb))pb=local.pronunciationBand;
    if(!isFinite(ob))ob=Math.round(((gb+vb+cb+pb)/4)*2)/2;
    gb=clamp(Math.round(gb*2)/2,0,9);vb=clamp(Math.round(vb*2)/2,0,9);cb=clamp(Math.round(cb*2)/2,0,9);pb=clamp(Math.round(pb*2)/2,0,9);ob=clamp(Math.round(ob*2)/2,0,9);

    setText("spkGrammarBand",gb.toFixed(1));
    setText("spkVocabBand",vb.toFixed(1));
    setText("spkCoherenceBand",cb.toFixed(1));
    setText("spkPronBand",pb.toFixed(1));
    setText("spkOverallBand",ob.toFixed(1));
    setText("spkBandBadge",ob.toFixed(1)+"/9.0");
    if(d.feedback_vi)setText("spkFeedbackText",d.feedback_vi);

    if(!st.progressRecorded&&typeof window.recordTaskPerformance==="function"){
      var correctionCount=Array.isArray(d.corrections)?d.corrections.length:0;
      window.recordTaskPerformance({kind:"speaking",band:ob,errors:correctionCount,note:"Speaking practice band "+ob.toFixed(1)});
      st.progressRecorded=true;
    }

    var corrections=Array.isArray(d.corrections)?d.corrections.slice(0,12):[];
    var fillers=Array.isArray(d.fillers)?d.fillers.slice(0,10):[];
    var pron=Array.isArray(d.pronunciation_feedback)?d.pronunciation_feedback.slice(0,8):[];
    var corrected=ensureEnglishImprovement(d.corrected||applyCorrectionsText(transcript,corrections),transcript,corrections);
    var highBand=ensureEnglishImprovement(d.high_band,transcript,corrections);

    var tr=document.getElementById("spkTranscriptMarked");
    if(tr)tr.innerHTML=speakingAnnotatedTranscriptHTML(transcript,corrections,fillers,pron);
    setText("spkCorrected",corrected);

    var correctionHolder=document.getElementById("spkCorrections");
    if(correctionHolder)correctionHolder.innerHTML=correctionDetailHTML(corrections);

    var high=document.getElementById("spkHighText");
    if(high)high.innerHTML=speakingHighBandHTML(highBand,Array.isArray(d.high_band_highlights)?d.high_band_highlights:[]);

    var coach=d.coach_feedback||{};
    if(coach.grammar_vi)setText("spkCoachGrammar",coach.grammar_vi);
    if(coach.vocab_vi)setText("spkCoachVocab",coach.vocab_vi);
    if(coach.development_vi)setText("spkCoachDevelop",coach.development_vi);
    if(coach.pronunciation_vi){
      setText("spkCoachPron",coach.pronunciation_vi);
      var pr=document.getElementById("spkCoachPronRow");if(pr)pr.classList.remove("hidden");
    }

    var strengths=Array.isArray(d.strengths_vi)?d.strengths_vi.filter(Boolean).slice(0,3):[];
    var strengthsEl=document.getElementById("spkStrengths");
    if(strengthsEl&&strengths.length){
      strengthsEl.innerHTML='<b>✓ Điểm tốt:</b> '+strengths.map(function(x){return '<span>'+esc(x)+'</span>';}).join("");
      strengthsEl.classList.remove("hidden");
    }

    var pronHolder=document.getElementById("spkPronInlineList");
    if(pronHolder){
      pronHolder.innerHTML=pronunciationSummaryHTML(pron);
      pronHolder.querySelectorAll(".spkPronFlag").forEach(function(el){
        el.onclick=function(){speakPronWord(this.getAttribute("data-word"));};
      });
    }

    var stateEl=document.getElementById("spkAIState");
    if(stateEl)stateEl.textContent=label;
  }

  async function blobToWavBase64(blob){
    var C=window.AudioContext||window.webkitAudioContext;
    var ctx=new C();
    try{
      var ab=await blob.arrayBuffer();
      var audio=await ctx.decodeAudioData(ab.slice(0));
      var sourceRate=audio.sampleRate;
      var channels=audio.numberOfChannels;
      var sourceLen=audio.length;
      var duration=sourceLen/sourceRate;

      var mono=new Float32Array(sourceLen);
      for(var ch=0;ch<channels;ch++){
        var data=audio.getChannelData(ch);
        for(var i=0;i<sourceLen;i++)mono[i]+=data[i]/channels;
      }

      // Keep requests below Vercel's serverless request-body limit.
      // Short answers keep 16 kHz for clearer pronunciation analysis;
      // very long answers are downsampled more aggressively.
      var targetRate=duration<=90?16000:(duration<=150?12000:8000);
      targetRate=Math.min(targetRate,sourceRate);

      var ratio=sourceRate/targetRate;
      var outLen=Math.max(1,Math.floor(sourceLen/ratio));
      var pcm=new Float32Array(outLen);

      for(var o=0;o<outLen;o++){
        var start=Math.floor(o*ratio);
        var end=Math.min(sourceLen,Math.floor((o+1)*ratio));
        if(end<=start)end=Math.min(sourceLen,start+1);
        var sum=0,count=0;
        for(var n=start;n<end;n++){sum+=mono[n];count++;}
        pcm[o]=count?sum/count:mono[Math.min(start,sourceLen-1)];
      }

      var buffer=new ArrayBuffer(44+pcm.length*2),view=new DataView(buffer);
      function str(off,s){for(var j=0;j<s.length;j++)view.setUint8(off+j,s.charCodeAt(j));}
      str(0,"RIFF");view.setUint32(4,36+pcm.length*2,true);str(8,"WAVE");str(12,"fmt ");
      view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
      view.setUint32(24,targetRate,true);view.setUint32(28,targetRate*2,true);
      view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,"data");
      view.setUint32(40,pcm.length*2,true);

      var off=44;
      for(var k=0;k<pcm.length;k++,off+=2){
        var s=Math.max(-1,Math.min(1,pcm[k]));
        view.setInt16(off,s<0?s*0x8000:s*0x7fff,true);
      }

      var bytes=new Uint8Array(buffer),chunk=0x8000,binary="";
      for(var p=0;p<bytes.length;p+=chunk){
        binary+=String.fromCharCode.apply(null,bytes.subarray(p,Math.min(p+chunk,bytes.length)));
      }
      return btoa(binary);
    }finally{
      try{ctx.close();}catch(e){}
    }
  }

  async function tryExternalAudioGrader(q,transcript,local){
    var endpoint=String(window.SPEAKING_AI_ENDPOINT||"").trim();
    if(!endpoint||!st.blob)return false;
    var stateEl=document.getElementById("spkAIState");
    try{
      if(stateEl)stateEl.textContent="Đang tối ưu file ghi âm để gửi AI…";
      var audioBase64=await blobToWavBase64(st.blob);
      if(stateEl)stateEl.textContent="AI đang nghe trực tiếp file audio của bạn…";
      var res=await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          question:q.q,
          transcriptHint:transcript,
          audioBase64:audioBase64,
          format:"wav"
        })
      });
      var data=await res.json().catch(function(){return {};});
      if(!res.ok||!data||data.error){
        var detail=(data&&((data.code||"")+" "+(data.message||data.error||""))).trim();
        throw new Error("HTTP "+res.status+(detail?" · "+detail:""));
      }
      var aiTranscript=String(data.transcript||transcript||"").trim();
      if(aiTranscript){
        st.transcript=aiTranscript;
        var marked=document.getElementById("spkTranscriptMarked");
        if(marked)marked.textContent=aiTranscript;
      }
      applyAIResult(data,aiTranscript||transcript,local,"AI đã nghe trực tiếp audio của bạn để chấm nội dung và delivery.");
      var delivery=data.delivery_feedback||{};
      var box=document.getElementById("spkDeliveryFeedback");
      if(box){
        var rows=[
          ["Ngữ điệu",delivery.intonation_vi],
          ["Trọng âm",delivery.stress_vi],
          ["Nhịp điệu",delivery.rhythm_vi],
          ["Nối âm",delivery.linking_vi],
          ["Tốc độ",delivery.pace_vi]
        ].filter(function(x){return x[1];});
        if(rows.length){
          box.innerHTML=rows.map(function(x){return '<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>';}).join("");
          box.classList.remove("hidden");
        }
      }
      return true;
    }catch(err){
      st.lastAudioBackendError=String(err&&err.message?err.message:err);
      if(stateEl)stateEl.textContent="❌ Direct Audio AI lỗi: "+st.lastAudioBackendError;
      return false;
    }
  }

  async function runAIEnhancement(q, transcript, local) {
    var stateEl=document.getElementById("spkAIState");
    st.lastAudioBackendError="";
    var externalConfigured=!!String(window.SPEAKING_AI_ENDPOINT||"").trim();
    if(externalConfigured){
      if(await tryExternalAudioGrader(q,transcript,local))return;
      if(stateEl)stateEl.textContent="❌ Direct Audio AI lỗi: "+(st.lastAudioBackendError||"không rõ lỗi")+". Không dùng transcript để giả lập chấm phát âm.";
      return;
    }
    if(!window.LanguageModel){
      if(stateEl)stateEl.textContent=st.lastAudioBackendError
        ? "Audio AI chưa chạy được ("+st.lastAudioBackendError+"). Điểm hiện tại chỉ là phương án dự phòng từ transcript."
        : (window.SPEAKING_AI_ENDPOINT?"Audio AI backend không phản hồi; đang dùng transcript dự phòng.":"Audio AI backend chưa được kết nối; điểm hiện tại chỉ là phương án dự phòng từ transcript.");
      return;
    }

    var prompt=
      "You are an IELTS Speaking practice examiner. Grade ONLY the learner answer below against the exact question. Use Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Be strict about relevance. Do not reward answer length by itself. Question: "+q.q+
      ". Browser transcript: "+transcript+
      '. LANGUAGE RULES: corrected MUST be English only. high_band MUST be English only. feedback_vi and correction reason fields may be Vietnamese. NEVER translate corrected or high_band into Vietnamese. IMPORTANT FOR high_band: preserve the learner\'s exact ideas and factual content. Do NOT add any new action, activity, reason, example, place, person, preference, frequency, event, opinion, or detail that is not explicitly present in the learner audio/transcript. You may ONLY correct grammar, improve naturalness, reorganise the same ideas, use more precise English vocabulary with the same meaning, and add cohesive devices that do not add new factual content. Return VALID JSON ONLY: {"overall_band":6.0,"grammar_band":6.0,"vocab_band":6.0,"coherence_band":6.0,"pronunciation_band":6.0,"corrected":"English-only corrected version preserving learner meaning","feedback_vi":"specific Vietnamese feedback referring to what the learner actually said","high_band":"English-only higher-band version using ONLY the learner\'s existing ideas and facts","corrections":[{"wrong":"exact learner wording","better":"English correction","reason":"short Vietnamese reason"}],"pronunciation_feedback":[{"word":"exact English word from learner audio","ipa":"/IPA/","heard_as":"what it sounded like if relevant","issue_vi":"specific sound/stress issue in Vietnamese","tip_vi":"specific pronunciation correction in Vietnamese"}]}. pronunciation_feedback must contain ONLY issues actually supported by the audio. Use 0.5 band steps.';

    try{
      if(st.blob){
        var audioOpts={expectedInputs:[{type:"text",languages:["en"]},{type:"audio"}],expectedOutputs:[{type:"text",languages:["en"]}]};
        var av=await window.LanguageModel.availability(audioOpts);
        if(av!=="unavailable"){
          if(stateEl)stateEl.textContent="AI đang nghe chính audio của bạn…";
          var session=await window.LanguageModel.create(audioOpts);
          var C=window.AudioContext||window.webkitAudioContext,ctx=new C(),ab=await st.blob.arrayBuffer(),audio=await ctx.decodeAudioData(ab.slice(0));
          var raw=await session.prompt([{role:"user",content:[{type:"text",value:prompt},{type:"audio",value:audio}]}]);
          var d=extractAIJSON(raw);
          applyAIResult(d,transcript,local,"AI đã chấm từ audio + transcript của chính bạn.");
          if(session.destroy)session.destroy();try{ctx.close();}catch(e){}
          return;
        }
      }
    }catch(e){}

    try{
      var textOpts={expectedInputs:[{type:"text",languages:["en"]}],expectedOutputs:[{type:"text",languages:["en"]}]};
      var tav=await window.LanguageModel.availability(textOpts);
      if(tav!=="unavailable"){
        if(stateEl)stateEl.textContent="AI audio không khả dụng; đang chấm transcript thật của bạn…";
        var ts=await window.LanguageModel.create(textOpts);
        var textPrompt=prompt+" You do not have audio. Keep pronunciation_band at "+local.pronunciationBand.toFixed(1)+" and grade the other criteria from the transcript.";
        var traw=await ts.prompt(textPrompt),td=extractAIJSON(traw);
        td.pronunciation_band=local.pronunciationBand;
        td.pronunciation_feedback=[];
        applyAIResult(td,transcript,local,"AI đã chấm transcript thật; phát âm vẫn là ước lượng từ nhận dạng giọng nói.");
        if(ts.destroy)ts.destroy();
        return;
      }
    }catch(e){}

    if(stateEl)stateEl.textContent="AI tích hợp không khả dụng. Website vẫn chấm chính bài bạn vừa nói từ transcript thật, tốc độ nói và độ tin cậy nhận giọng; không dùng bài mẫu để tạo điểm.";
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
