(function(){
  "use strict";

  const KEY="gkyyy_mock_test_v1";
  let store={history:[],drafts:{}};
  try{store=Object.assign(store,JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(e){}
  store.history=store.history||[];
  store.drafts=store.drafts||{};
  const save=()=>localStorage.setItem(KEY,JSON.stringify(store));

  let exam=null,timer=null,utterance=null;

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
  function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9$:.\s-]/g," ").replace(/\s+/g," ").trim();}
  function fmt(sec){sec=Math.max(0,Math.round(sec));return String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");}

  function getReading(){
    if(typeof window.readingPack==="function") return window.readingPack(1);
    return {
      title:"Digital learning",
      text:"Online learning can improve access for learners who have work and family responsibilities. Flexibility is useful, but students also need to manage their own time. Course design, motivation and reliable technology all influence outcomes.",
      q:[
        ["Online learning may improve access.",["True","False","Not Given"],0,"The passage states this directly."],
        ["Flexibility removes all study problems.",["True","False","Not Given"],1,"The passage says time management is still important."]
      ]
    };
  }
  function getListening(){
    if(typeof window.listeningPack==="function") return window.listeningPack(1);
    return {
      script:"The evening English course begins on Monday the twelfth of October and runs for eight weeks. Classes are held on Monday and Wednesday evenings.",
      q:[
        ["When does the course begin?","12 October","The date is stated directly."],
        ["How many weeks does it run?","8 weeks","The speaker says eight weeks."]
      ]
    };
  }

  function mockCard(icon,title,meta,desc,kind,accent){
    return '<article class="mockCard '+(accent||"")+'">'+
      '<div class="mockCardIcon">'+icon+'</div>'+
      '<div class="mockCardBody"><h3>'+esc(title)+'</h3><b>'+esc(meta)+'</b><p>'+esc(desc)+'</p></div>'+
      '<button class="btn primary" data-mock-start="'+kind+'">Bắt đầu thi</button>'+
    '</article>';
  }

  function renderHistory(){
    const el=document.getElementById("mockHistory");
    if(!el)return;
    if(!store.history.length){
      el.innerHTML='<div class="mockEmpty">Chưa có bài thi thử nào. Kết quả sẽ được lưu ngay trên trình duyệt này.</div>';
      return;
    }
    el.innerHTML=store.history.slice(0,8).map(x=>
      '<div class="mockHistoryRow"><div><b>'+esc(x.label)+'</b><span>'+new Date(x.at).toLocaleString("vi-VN")+'</span></div>'+
      '<strong>'+esc(x.result)+'</strong></div>'
    ).join("");
  }

  function renderMockHome(){
    const el=document.getElementById("mockHome");
    if(!el)return;
    el.innerHTML=
      '<div class="mockHero"><div><span class="phase">EXAM MODE</span><h2>IELTS Mock Test</h2>'+
      '<p>Thi trong chế độ tập trung: ẩn từ điển, ẩn gợi ý, có đồng hồ đếm ngược và chỉ xem đáp án sau khi nộp bài.</p></div>'+
      '<div class="mockHeroBadge">Practice simulation<br><b>Không phải đề IELTS chính thức</b></div></div>'+
      '<div class="mockRules"><b>Quy tắc thi thử:</b> autosave câu trả lời • không hiện đáp án khi đang làm • hết giờ sẽ tự nộp • kết quả lưu vào lịch sử.</div>'+
      '<div class="mockGrid">'+
        mockCard("🎧","Listening Mock","30 phút • 10 câu","Audio phát một lần. Điền câu trả lời như một bài Listening thực tế.","listening","blue")+
        mockCard("📖","Reading Mock","60 phút • 12 câu","Passage + câu hỏi chia hai cột, có điều hướng câu và chấm ngay sau khi nộp.","reading","green")+
        mockCard("✍️","Writing Mock","60 phút • Task 1 + Task 2","Viết trong Exam Mode, đếm từ và tự lưu. Không có dictionary hay gợi ý khi đang thi.","writing","orange")+
        mockCard("🧪","Mini Mock","45 phút • Listening + Reading","Làm Listening và Reading liên tiếp trong một phiên thi ngắn để luyện áp lực thời gian.","mini","purple")+
      '</div>'+
      '<div class="mockSectionTitle"><h3>Lịch sử thi thử</h3><button id="mockClearHistory" class="btn">Xoá lịch sử</button></div>'+
      '<div id="mockHistory" class="mockHistory"></div>';

    el.querySelectorAll("[data-mock-start]").forEach(b=>b.onclick=()=>startMock(b.dataset.mockStart));
    const clear=document.getElementById("mockClearHistory");
    if(clear)clear.onclick=()=>{
      if(confirm("Xoá toàn bộ lịch sử thi thử trên trình duyệt này?")){
        store.history=[];save();renderHistory();
      }
    };
    renderHistory();
  }

  function startMock(kind){
    if(timer)clearInterval(timer);
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    const seconds=kind==="reading"?3600:kind==="listening"?1800:kind==="writing"?3600:2700;
    exam={
      kind,
      remaining:seconds,
      startedAt:Date.now(),
      answers:{reading:{},listening:{}},
      section:kind==="mini"?"listening":kind,
      listeningPlayed:false,
      reading:getReading(),
      listening:getListening()
    };
    document.body.classList.add("mockActive");
    buildOverlay();
    timer=setInterval(tick,1000);
  }

  function buildOverlay(){
    let old=document.getElementById("mockOverlay");if(old)old.remove();
    const wrap=document.createElement("div");
    wrap.id="mockOverlay";
    wrap.className="mockOverlay";
    wrap.innerHTML=
      '<header class="mockExamTop">'+
        '<div><span class="mockExamTag">IELTS PRACTICE MOCK</span><b id="mockExamTitle"></b></div>'+
        '<div class="mockExamSection" id="mockExamSection"></div>'+
        '<div class="mockExamClock">⏱ <strong id="mockTimer">'+fmt(exam.remaining)+'</strong></div>'+
        '<button id="mockExit" class="mockExit">Thoát</button>'+
      '</header>'+
      '<main id="mockExamBody" class="mockExamBody"></main>'+
      '<footer class="mockExamFooter"><div id="mockProgressText"></div><button id="mockSubmit" class="mockSubmit">Nộp bài</button></footer>';
    document.body.appendChild(wrap);
    wrap.addEventListener("dblclick",e=>e.stopPropagation(),true);
    document.getElementById("mockExit").onclick=exitMock;
    document.getElementById("mockSubmit").onclick=submitMock;
    renderSection();
  }

  function tick(){
    if(!exam)return;
    exam.remaining--;
    const t=document.getElementById("mockTimer");if(t)t.textContent=fmt(exam.remaining);
    if(exam.remaining<=0){clearInterval(timer);timer=null;submitMock(true);}
  }

  function titleFor(kind){
    return kind==="reading"?"Reading Mock":kind==="listening"?"Listening Mock":kind==="writing"?"Writing Mock":"Mini Mock";
  }

  function renderSection(){
    if(!exam)return;
    const title=document.getElementById("mockExamTitle");
    const sec=document.getElementById("mockExamSection");
    if(title)title.textContent=titleFor(exam.kind);
    if(sec)sec.textContent=exam.kind==="mini"?(exam.section==="listening"?"Section 1 · Listening":"Section 2 · Reading"):"";
    if(exam.section==="reading")renderReading();
    else if(exam.section==="listening")renderListening();
    else if(exam.section==="writing")renderWriting();
  }

  function renderReading(){
    const p=exam.reading,body=document.getElementById("mockExamBody");
    body.innerHTML=
      '<div class="mockReadingSplit">'+
        '<section class="mockPassage"><h2>'+esc(p.title)+'</h2><div>'+esc(p.text)+'</div></section>'+
        '<section class="mockQuestions"><div class="mockQuestionIntro"><h3>Questions 1–'+p.q.length+'</h3><p>Chọn đáp án dựa trên passage. Không hiện đáp án trước khi nộp.</p></div>'+
          p.q.map((q,i)=>'<div class="mockQ" id="mock-r-'+i+'"><div class="mockQTitle"><span>'+(i+1)+'</span><b>'+esc(q[0])+'</b></div>'+
            '<div class="mockOptions">'+q[1].map((opt,j)=>'<label><input type="radio" name="mr'+i+'" value="'+j+'" '+(exam.answers.reading[i]==j?'checked':'')+'> '+esc(opt)+'</label>').join("")+'</div></div>').join("")+
        '</section>'+
      '</div>'+
      '<div class="mockQNav">'+p.q.map((_,i)=>'<button data-rnav="'+i+'">'+(i+1)+'</button>').join("")+'</div>';
    body.querySelectorAll('input[type="radio"]').forEach(inp=>inp.onchange=()=>{
      const i=Number(inp.name.slice(2));exam.answers.reading[i]=Number(inp.value);updateProgress();
    });
    body.querySelectorAll("[data-rnav]").forEach(b=>b.onclick=()=>document.getElementById("mock-r-"+b.dataset.rnav)?.scrollIntoView({behavior:"smooth",block:"center"}));
    updateProgress();
  }

  function bestVoice(){
    const voices=window.speechSynthesis?window.speechSynthesis.getVoices():[];
    return voices.find(v=>/en-GB/i.test(v.lang)&&/Google|Siri|Daniel|Serena|Kate|Premium|Enhanced/i.test(v.name))
      ||voices.find(v=>/en-GB/i.test(v.lang))
      ||voices.find(v=>/^en/i.test(v.lang))
      ||null;
  }

  function playListening(){
    if(exam.listeningPlayed)return;
    exam.listeningPlayed=true;
    const btn=document.getElementById("mockListenPlay");
    if(btn){btn.disabled=true;btn.textContent="▶ Audio đang phát · chỉ 1 lần";}
    if(!window.speechSynthesis){
      if(btn)btn.textContent="Trình duyệt không hỗ trợ audio";
      return;
    }
    utterance=new SpeechSynthesisUtterance(exam.listening.script);
    utterance.lang="en-GB";utterance.rate=.94;utterance.pitch=1;
    const v=bestVoice();if(v)utterance.voice=v;
    utterance.onend=()=>{if(btn)btn.textContent="✓ Audio đã phát xong";};
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function renderListening(){
    const p=exam.listening,body=document.getElementById("mockExamBody");
    body.innerHTML=
      '<div class="mockListeningHead"><div><h2>Listening Mock</h2><p>Audio chỉ phát một lần. Transcript bị ẩn cho đến khi nộp bài.</p></div>'+
      '<button id="mockListenPlay" class="mockAudioBtn" '+(exam.listeningPlayed?'disabled':'')+'>'+(exam.listeningPlayed?'Audio đã bắt đầu':'▶ Bắt đầu audio')+'</button></div>'+
      '<div class="mockListeningQuestions">'+p.q.map((q,i)=>
        '<label class="mockListenQ"><span>'+(i+1)+'</span><div><b>'+esc(q[0])+'</b><input data-la="'+i+'" value="'+esc(exam.answers.listening[i]||"")+'" placeholder="Your answer"></div></label>'
      ).join("")+'</div>'+
      (exam.kind==="mini"?'<div class="mockNextSection"><button id="mockGoReading" class="btn primary">Tiếp tục sang Reading →</button></div>':"");
    document.getElementById("mockListenPlay").onclick=playListening;
    body.querySelectorAll("[data-la]").forEach(inp=>inp.oninput=()=>{exam.answers.listening[inp.dataset.la]=inp.value;updateProgress();});
    const next=document.getElementById("mockGoReading");
    if(next)next.onclick=()=>{exam.section="reading";renderSection();};
    updateProgress();
  }

  function writingPrompt(){
    return {
      t1:"The table shows the percentage of commuters using four forms of transport in a city in 2000 and 2025. Car: 55% → 42%; Bus: 20% → 22%; Train: 15% → 24%; Bicycle: 10% → 12%. Summarise the main features and make relevant comparisons.",
      t2:"Some people believe schools should spend more time teaching practical life skills, while others think academic subjects should remain the main priority. Discuss both views and give your own opinion."
    };
  }

  function renderWriting(){
    const p=writingPrompt(),body=document.getElementById("mockExamBody");
    const draft=store.drafts.writing||{t1:"",t2:""};
    body.innerHTML=
      '<div class="mockWritingGrid">'+
        '<section class="mockWritingPrompt"><span>WRITING TASK 1</span><h3>Task 1</h3><p>'+esc(p.t1)+'</p><small>Write at least 150 words.</small></section>'+
        '<section class="mockWritingAnswer"><div><b>Task 1 answer</b><span id="mockW1Count">0 words</span></div><textarea id="mockW1" placeholder="Write your Task 1 response...">'+esc(draft.t1)+'</textarea></section>'+
        '<section class="mockWritingPrompt"><span>WRITING TASK 2</span><h3>Task 2</h3><p>'+esc(p.t2)+'</p><small>Write at least 250 words.</small></section>'+
        '<section class="mockWritingAnswer"><div><b>Task 2 answer</b><span id="mockW2Count">0 words</span></div><textarea id="mockW2" placeholder="Write your Task 2 response...">'+esc(draft.t2)+'</textarea></section>'+
      '</div>';
    const count=s=>String(s||"").trim()?String(s).trim().split(/\s+/).length:0;
    const sync=()=>{
      const t1=document.getElementById("mockW1").value,t2=document.getElementById("mockW2").value;
      document.getElementById("mockW1Count").textContent=count(t1)+" words";
      document.getElementById("mockW2Count").textContent=count(t2)+" words";
      store.drafts.writing={t1,t2};save();
      updateProgress();
    };
    document.getElementById("mockW1").oninput=sync;
    document.getElementById("mockW2").oninput=sync;
    sync();
  }

  function updateProgress(){
    const e=document.getElementById("mockProgressText");if(!e||!exam)return;
    if(exam.section==="reading"){
      e.textContent=Object.keys(exam.answers.reading).length+" / "+exam.reading.q.length+" answered";
    }else if(exam.section==="listening"){
      const n=Object.values(exam.answers.listening).filter(x=>String(x).trim()).length;
      e.textContent=n+" / "+exam.listening.q.length+" answered";
    }else if(exam.section==="writing"){
      const d=store.drafts.writing||{t1:"",t2:""};
      e.textContent="Task 1: "+(d.t1.trim()?d.t1.trim().split(/\s+/).length:0)+" words · Task 2: "+(d.t2.trim()?d.t2.trim().split(/\s+/).length:0)+" words";
    }
  }

  function exitMock(){
    if(!exam)return;
    if(!confirm("Thoát bài thi thử? Câu trả lời Writing đã được tự lưu, nhưng bài khách quan chưa được chấm."))return;
    closeExam();
  }

  function closeExam(){
    clearInterval(timer);timer=null;
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    const o=document.getElementById("mockOverlay");if(o)o.remove();
    document.body.classList.remove("mockActive");
    exam=null;
  }

  function scoreReading(){
    let right=0;
    exam.reading.q.forEach((q,i)=>{if(Number(exam.answers.reading[i])===q[2])right++;});
    return {right,total:exam.reading.q.length};
  }
  function acceptableListening(ans,correct){
    const a=norm(ans),c=norm(correct);
    if(!a)return false;
    const noArticle=s=>s.replace(/^(?:a|an|the)\s+/,"");
    const digits={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
      eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
    const canonical=s=>noArticle(s).replace(/\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/g,w=>String(digits[w]));
    const equivalent=canonical(a);
    return a===c||!!equivalent&&equivalent===canonical(c);
  }
  function scoreListening(){
    let right=0;
    exam.listening.q.forEach((q,i)=>{if(acceptableListening(exam.answers.listening[i],q[1]))right++;});
    return {right,total:exam.listening.q.length};
  }

  function submitMock(auto){
    if(!exam)return;
    if(!auto&&!confirm("Nộp bài ngay? Sau khi nộp bạn sẽ không thể đổi đáp án."))return;
    clearInterval(timer);timer=null;
    if(window.speechSynthesis)window.speechSynthesis.cancel();

    if(exam.kind==="writing"){
      const d=store.drafts.writing||{t1:"",t2:""};
      const wc=s=>s.trim()?s.trim().split(/\s+/).length:0;
      const result="T1 "+wc(d.t1)+" words · T2 "+wc(d.t2)+" words";
      saveAttempt("Writing Mock",result);
      showWritingResult(result,auto);
      return;
    }

    let r=null,l=null;
    if(exam.kind==="reading")r=scoreReading();
    if(exam.kind==="listening")l=scoreListening();
    if(exam.kind==="mini"){r=scoreReading();l=scoreListening();}
    const result=exam.kind==="mini"
      ?"L "+l.right+"/"+l.total+" · R "+r.right+"/"+r.total
      :r?r.right+"/"+r.total+" correct":l.right+"/"+l.total+" correct";
    saveAttempt(titleFor(exam.kind),result);
    showObjectiveResult(r,l,auto);
  }

  function saveAttempt(label,result){
    store.history.unshift({label,result,at:Date.now()});
    store.history=store.history.slice(0,30);
    save();
  }

  function showObjectiveResult(r,l,auto){
    const body=document.getElementById("mockExamBody");
    const parts=[];
    if(typeof window.recordLearningError==="function"){
      if(l)exam.listening.q.forEach((q,i)=>{
        const given=exam.answers.listening[i]||"";
        if(!acceptableListening(given,q[1]))window.recordLearningError({
          skill:"listening",task:"Mock Test · Listening",question:q[0],userAnswer:given||"Bỏ trống",
          correctAnswer:q[1],why:q[2]||"Đáp án cần khớp với thông tin nghe được.",errorType:"Listening mock"
        });
      });
      if(r)exam.reading.q.forEach((q,i)=>{
        const given=exam.answers.reading[i];
        if(Number(given)!==q[2]||given===undefined)window.recordLearningError({
          skill:"reading",task:"Mock Test · Reading",question:q[0],userAnswer:given===undefined?"Bỏ trống":q[1][given],
          correctAnswer:q[1][q[2]],why:q[3]||"Đáp án đúng được hỗ trợ bởi đoạn đọc.",errorType:"Reading mock"
        });
      });
    }
    if(l){
      parts.push('<section class="mockResultSection"><h3>Listening · '+l.right+'/'+l.total+'</h3>'+
        exam.listening.q.map((q,i)=>{
          const given=exam.answers.listening[i]||"—",ok=acceptableListening(given,q[1]);
          return '<div class="mockReview '+(ok?'ok':'bad')+'"><b>'+(i+1)+'. '+esc(q[0])+'</b><span>Your answer: '+esc(given)+'</span><strong>Correct: '+esc(q[1])+'</strong><small>'+esc(q[2])+'</small></div>';
        }).join("")+'</section>');
    }
    if(r){
      parts.push('<section class="mockResultSection"><h3>Reading · '+r.right+'/'+r.total+'</h3>'+
        exam.reading.q.map((q,i)=>{
          const g=exam.answers.reading[i],ok=Number(g)===q[2],given=g===undefined?"—":q[1][g];
          return '<div class="mockReview '+(ok?'ok':'bad')+'"><b>'+(i+1)+'. '+esc(q[0])+'</b><span>Your answer: '+esc(given)+'</span><strong>Correct: '+esc(q[1][q[2]])+'</strong><small>'+esc(q[3])+'</small></div>';
        }).join("")+'</section>');
    }
    body.innerHTML='<div class="mockResultHero"><span>'+(auto?'⏰ Hết giờ':'✓ Đã nộp bài')+'</span><h2>Kết quả thi thử</h2><p>Đây là practice score từ bộ câu hỏi của website, không phải IELTS band chính thức.</p></div>'+
      '<div class="mockResultGrid">'+parts.join("")+'</div>';
    const footer=document.querySelector(".mockExamFooter");
    if(footer)footer.innerHTML='<button id="mockResultClose" class="mockSubmit">Về Mock Test</button>';
    document.getElementById("mockResultClose").onclick=()=>{closeExam();renderMockHome();};
  }

  function showWritingResult(result,auto){
    const body=document.getElementById("mockExamBody");
    body.innerHTML='<div class="mockResultHero"><span>'+(auto?'⏰ Hết giờ':'✓ Đã nộp bài')+'</span><h2>Writing Mock đã hoàn thành</h2>'+
      '<p>'+esc(result)+'. Bài viết đã được lưu trên trình duyệt. Hệ thống chấm Writing AI có thể được nối vào bước này sau.</p></div>';
    const footer=document.querySelector(".mockExamFooter");
    if(footer)footer.innerHTML='<button id="mockResultClose" class="mockSubmit">Về Mock Test</button>';
    document.getElementById("mockResultClose").onclick=()=>{closeExam();renderMockHome();};
  }

  window.renderMockHome=renderMockHome;
  document.addEventListener("DOMContentLoaded",renderMockHome);
  if(document.readyState!=="loading")renderMockHome();
})();
