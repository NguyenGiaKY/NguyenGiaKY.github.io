
(function(){
  "use strict";

  var previousOpenLesson = window.openLesson;
  if (typeof previousOpenLesson !== "function") return;

  var WS = {
    finishHandler:null,
    startTime:0,
    timer:null,
    draftKey:"ielts_writing_task1_jobs_v1",
    sections:{intro:"",overview:"",body1:"",body2:""}
  };

  var TASK = {
    title:"Number of jobs in four sectors of the economy in the US, 1960–2020",
    prompt:"The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    years:[1960,1980,2000,2020],
    series:[
      {name:"Manufacturing",values:[15,20,17,13]},
      {name:"Retail",values:[6,10,15,16]},
      {name:"Agriculture",values:[6,3,3,2]},
      {name:"Healthcare",values:[2,5,11,16]}
    ]
  };

  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g,function(m){
      if(m==="&")return "&amp;";
      if(m==="<")return "&lt;";
      if(m===">")return "&gt;";
      if(m==="'")return "&#39;";
      return "&quot;";
    });
  }
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function words(t){return String(t||"").trim().split(/\s+/).filter(Boolean);}
  function wordCount(){return words(Object.values(WS.sections).join(" ")).length;}
  function fmt(sec){
    sec=Math.max(0,Math.floor(sec||0));
    return String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
  }
  function saveDraft(){
    try{localStorage.setItem(WS.draftKey,JSON.stringify(WS.sections));}catch(e){}
  }
  function loadDraft(){
    try{
      var x=JSON.parse(localStorage.getItem(WS.draftKey)||"{}");
      WS.sections.intro=x.intro||"";
      WS.sections.overview=x.overview||"";
      WS.sections.body1=x.body1||"";
      WS.sections.body2=x.body2||"";
    }catch(e){}
  }
  function startTimer(){
    if(WS.timer)clearInterval(WS.timer);
    if(!WS.startTime)WS.startTime=Date.now();
    WS.timer=setInterval(function(){
      var e=document.getElementById("wsTimer");
      if(e)e.textContent=fmt((Date.now()-WS.startTime)/1000);
    },500);
  }
  function stopTimer(){if(WS.timer){clearInterval(WS.timer);WS.timer=null;}}

  function chartSVG(){
    var w=720,h=420,padL=58,padR=28,padT=42,padB=58,maxY=25;
    function x(i){return padL+i*((w-padL-padR)/(TASK.years.length-1));}
    function y(v){return padT+(maxY-v)*((h-padT-padB)/maxY);}
    var palette=["#f05a28","#2447c6","#f2b134","#20a34a"];
    var svg='<svg viewBox="0 0 '+w+' '+h+'" class="wsChart" role="img" aria-label="'+esc(TASK.title)+'">';
    svg+='<rect x="0" y="0" width="'+w+'" height="'+h+'" rx="18" fill="#fffaf2"/>';
    svg+='<text x="'+(w/2)+'" y="25" text-anchor="middle" font-size="19" font-weight="800" fill="#ea5b2a">Number of jobs in four sectors of the economy in the US, 1960–2020</text>';
    for(var g=0;g<=25;g+=5){
      var gy=y(g);
      svg+='<line x1="'+padL+'" x2="'+(w-padR)+'" y1="'+gy+'" y2="'+gy+'" stroke="#ddd7cf" stroke-width="1"/>';
      svg+='<text x="'+(padL-12)+'" y="'+(gy+5)+'" text-anchor="end" font-size="12" fill="#4b5563">'+g+'</text>';
    }
    TASK.years.forEach(function(yr,i){
      svg+='<text x="'+x(i)+'" y="'+(h-24)+'" text-anchor="middle" font-size="12" fill="#374151">'+yr+'</text>';
    });
    svg+='<text transform="translate(18,'+(h/2)+') rotate(-90)" text-anchor="middle" font-size="12" fill="#4b5563">Jobs (millions)</text>';
    TASK.series.forEach(function(s,si){
      var pts=s.values.map(function(v,i){return x(i)+","+y(v);}).join(" ");
      svg+='<polyline points="'+pts+'" fill="none" stroke="'+palette[si]+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
      s.values.forEach(function(v,i){
        svg+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="5.5" fill="'+palette[si]+'"/>';
      });
    });
    var lx=80;
    TASK.series.forEach(function(s,si){
      svg+='<circle cx="'+lx+'" cy="'+(h-5)+'" r="5" fill="'+palette[si]+'"/><text x="'+(lx+10)+'" y="'+(h-1)+'" font-size="11" fill="#374151">'+esc(s.name)+'</text>';
      lx+=145;
    });
    svg+='</svg>';
    return svg;
  }

  function guideHTML(){
    return '<div class="wsGuide">'+
      '<h2>HƯỚNG DẪN VIẾT BÀI</h2>'+
      '<p class="wsGuideSub"><i>IELTS Writing Task 1 – '+esc(TASK.title)+'</i></p>'+
      '<details open><summary>1. Giải thích đề</summary>'+
        '<p>Đề yêu cầu mô tả số lượng việc làm, tính theo triệu, trong bốn khu vực kinh tế của Mỹ: <b>Manufacturing, Retail, Agriculture và Healthcare</b>, từ 1960 đến 2020.</p>'+
        '<p>Mục tiêu là chọn <b>main features</b>, nhóm dữ liệu hợp lý và tạo so sánh; không cần mô tả mọi con số theo thứ tự.</p>'+
      '</details>'+
      '<details><summary>2. Định hướng Introduction</summary>'+
        '<p>Paraphrase 4 dữ kiện chính: <b>number of jobs → four sectors → the US → 1960–2020</b>.</p>'+
        '<div class="wsExample">The line graph compares employment figures in four sectors of the US economy over the period from 1960 to 2020.</div>'+
      '</details>'+
      '<details open><summary>3. Định hướng Overview</summary>'+
        '<p><b>Trends:</b> healthcare và retail tăng đáng kể; agriculture giảm; manufacturing tăng lúc đầu rồi giảm.</p>'+
        '<p><b>Differences:</b> manufacturing đứng đầu phần lớn giai đoạn, nhưng đến cuối kỳ healthcare và retail đều đạt khoảng 16 triệu và vượt manufacturing.</p>'+
      '</details>'+
      '<details><summary>4. Phân chia Body rõ ràng</summary>'+
        '<h4>BODY 1: Retail & Healthcare</h4>'+
        '<ol><li>So sánh 1960: retail khoảng 6 triệu, healthcare khoảng 2 triệu.</li><li>Healthcare tăng đều lên 5 triệu năm 1980, 11 triệu năm 2000 và 16 triệu năm 2020.</li><li>Retail tăng lên 10 triệu, 15 triệu rồi 16 triệu.</li></ol>'+
        '<h4>BODY 2: Manufacturing & Agriculture</h4>'+
        '<ol><li>1960: manufacturing khoảng 15 triệu, agriculture khoảng 6 triệu.</li><li>Agriculture giảm xuống 3 triệu năm 1980, giữ gần như ổn định đến 2000 và còn 2 triệu vào 2020.</li><li>Manufacturing đạt đỉnh 20 triệu năm 1980 rồi giảm còn 17 và 13 triệu.</li></ol>'+
      '</details>'+
      '<details><summary>5. Gợi ý paraphrasing</summary>'+
        '<ul><li><b>employment in [sector]</b></li><li><b>[sector] employed [number] workers</b></li><li><b>[sector] provided [number] jobs</b></li></ul>'+
        '<div class="wsExample">Overall, employment in healthcare and retail grew considerably, whereas agriculture declined and manufacturing rose before falling back.</div>'+
      '</details>'+
    '</div>';
  }

  function fieldHTML(id,label,placeholder,minHeight){
    return '<label class="wsField"><span>'+label+'</span><textarea id="ws-'+id+'" data-ws="'+id+'" style="min-height:'+minHeight+'px" placeholder="'+esc(placeholder)+'">'+esc(WS.sections[id])+'</textarea><small><span id="ws-'+id+'-count">'+words(WS.sections[id]).length+'</span> words</small></label>';
  }

  function renderWorkspace(){
    loadDraft();
    var body=document.getElementById("lessonBody");if(!body)return;
    var title=document.getElementById("lessonTitle");
    if(title)title.innerHTML='<div class="phase">WRITING PRACTICE</div><h2>IELTS Writing Task 1</h2>';

    body.innerHTML=
      '<div class="writingStudio">'+
        '<div class="wsTopbar">'+
          '<div class="wsTimer">⏱ <span id="wsTimer">00:00</span></div>'+
          '<div class="wsWordCount">Word count: <b id="wsTotalWords">'+wordCount()+'</b></div>'+
          '<button id="wsClear" class="wsGhost">Xoá bài</button>'+
        '</div>'+
        '<div class="wsGrid">'+
          '<section class="wsTaskPane">'+
            '<div class="wsPrompt">'+esc(TASK.prompt)+'</div>'+
            chartSVG()+
            guideHTML()+
          '</section>'+
          '<section class="wsWritingPane">'+
            '<div class="wsWritingHead"><div><span class="phase">TASK 1</span><h2>Viết bài của bạn</h2></div><button id="wsSampleToggle" class="wsGhost">Xem sample</button></div>'+
            '<div id="wsSample" class="wsSample hidden"><b>Sample overview</b><p>Overall, employment in healthcare and retail increased markedly, whereas agriculture declined. Manufacturing initially rose to a peak before falling, and by 2020 it had been overtaken by both healthcare and retail.</p></div>'+
            fieldHTML("intro","Introduction","Paraphrase đề bài...",80)+
            fieldHTML("overview","Overview","Nêu 2–3 đặc điểm chính, không cần nhiều số liệu...",100)+
            fieldHTML("body1","Body 1","Retail & Healthcare: so sánh và mô tả xu hướng...",150)+
            fieldHTML("body2","Body 2","Manufacturing & Agriculture: so sánh và mô tả xu hướng...",150)+
            '<div class="wsSubmitBar"><button id="wsSave" class="btn">💾 Lưu nháp</button><button id="wsGrade" class="btn primary">🤖 AI chấm & sửa bài</button></div>'+
          '</section>'+
          '<aside class="wsCoachPane">'+
            '<div class="wsCoachCard"><h3>Checklist</h3>'+
              '<label><input type="checkbox"> Có Introduction</label>'+
              '<label><input type="checkbox"> Overview nêu main trends</label>'+
              '<label><input type="checkbox"> Có comparisons</label>'+
              '<label><input type="checkbox"> Dùng số liệu chính xác</label>'+
              '<label><input type="checkbox"> ≥ 150 words</label>'+
            '</div>'+
            '<div class="wsCoachCard"><h3>Useful language</h3>'+
              '<p><b>rose to</b> + number</p><p><b>fell to</b> + number</p><p><b>remained stable at</b></p><p><b>overtook</b></p><p><b>approximately / roughly</b></p>'+
            '</div>'+
            '<div class="wsCoachCard"><h3>Quick feedback</h3><div id="wsQuickFeedback" class="muted">Viết bài rồi bấm AI chấm & sửa. Nếu Chrome AI không khả dụng, website vẫn cho điểm luyện tập cơ bản và sửa các lỗi phổ biến.</div></div>'+
          '</aside>'+
        '</div>'+
        '<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>'+
      '</div>';

    document.querySelectorAll("[data-ws]").forEach(function(t){
      t.oninput=function(){
        var id=this.getAttribute("data-ws");
        WS.sections[id]=this.value;
        var count=document.getElementById("ws-"+id+"-count");
        if(count)count.textContent=words(this.value).length;
        var total=document.getElementById("wsTotalWords");
        if(total)total.textContent=wordCount();
        saveDraft();
      };
    });
    document.getElementById("wsSampleToggle").onclick=function(){document.getElementById("wsSample").classList.toggle("hidden");};
    document.getElementById("wsSave").onclick=function(){saveDraft();var b=this;b.textContent="✓ Đã lưu";setTimeout(function(){b.textContent="💾 Lưu nháp";},1200);};
    document.getElementById("wsClear").onclick=function(){
      if(!confirm("Xoá toàn bộ bài viết hiện tại?"))return;
      WS.sections={intro:"",overview:"",body1:"",body2:""};saveDraft();renderWorkspace();
    };
    document.getElementById("wsGrade").onclick=gradeEssay;
    var finish=document.getElementById("finish");if(finish&&WS.finishHandler)finish.onclick=WS.finishHandler;
    startTimer();
  }

  function localCorrections(text){
    var rules=[
      [/\bmore higher\b/gi,"higher"],
      [/\bmore lower\b/gi,"lower"],
      [/\bamount of jobs\b/gi,"number of jobs"],
      [/\bnumber of job\b/gi,"number of jobs"],
      [/\bwas increase\b/gi,"increased"],
      [/\bwas decrease\b/gi,"decreased"],
      [/\bpeople was\b/gi,"people were"],
      [/\bjobs was\b/gi,"jobs were"],
      [/\bcompare to\b/gi,"compared with"],
      [/\bin the other hand\b/gi,"on the other hand"]
    ];
    var out=[];
    rules.forEach(function(r){
      var m=text.match(r[0]);if(m)out.push({wrong:m[0],better:r[1]});
    });
    return out.slice(0,8);
  }

  function localAssessment(){
    var intro=WS.sections.intro.trim(),overview=WS.sections.overview.trim(),b1=WS.sections.body1.trim(),b2=WS.sections.body2.trim();
    var all=[intro,overview,b1,b2].join(" ").trim(),wc=wordCount(),low=all.toLowerCase();
    var hasOverview=/overall|in general|generally/.test(overview.toLowerCase());
    var dataHits=(all.match(/\b(1960|1980|2000|2020|15|20|17|13|6|10|16|2|5|11|3)\b/g)||[]).length;
    var compareHits=(low.match(/\b(whereas|while|compared|higher|lower|more than|less than|overtook|respectively|than)\b/g)||[]).length;
    var trendHits=(low.match(/\b(rose|increased|grew|fell|decreased|declined|peaked|remained|stable|trend|fluctuated)\b/g)||[]).length;
    var connectors=(low.match(/\b(overall|whereas|while|however|meanwhile|by contrast|in comparison|respectively|subsequently|thereafter)\b/g)||[]).length;
    var uniq={},ws=words(all);ws.forEach(function(w){var k=w.toLowerCase().replace(/[^a-z']/g,"");if(k)uniq[k]=1;});
    var lexRatio=ws.length?Object.keys(uniq).length/ws.length:0;
    var errors=localCorrections(all);

    var ta=4.5;
    if(wc>=150)ta+=.5;if(intro)ta+=.5;if(hasOverview)ta+=1;if(dataHits>=8)ta+=.5;if(compareHits>=3)ta+=.5;
    ta=clamp(Math.round(ta*2)/2,4,8.5);

    var cc=4.5;
    if(intro&&overview&&b1&&b2)cc+=1;
    if(connectors>=3)cc+=.5;
    if(compareHits>=3)cc+=.5;
    if(wc>=150)cc+=.5;
    cc=clamp(Math.round(cc*2)/2,4,8.5);

    var lr=4.5 + Math.min(2,lexRatio*3) + (trendHits>=5?.5:0) + (compareHits>=3?.5:0);
    lr=clamp(Math.round(lr*2)/2,4,8.5);

    var gra=5.0 + (wc>=150?.5:0) + (connectors>=3?.5:0) - Math.min(1.5,errors.length*.25);
    gra=clamp(Math.round(gra*2)/2,4,8.5);

    var overall=Math.round(((ta+cc+lr+gra)/4)*2)/2;
    return {
      overall:overall,task:ta,coherence:cc,lexical:lr,grammar:gra,
      corrections:errors,
      feedback:[
        wc<150?"Bài đang dưới 150 từ; cần phát triển đầy đủ nhưng tránh thêm chi tiết không cần thiết.":"Độ dài đã đạt yêu cầu tối thiểu.",
        hasOverview?"Overview đã có tín hiệu rõ.":"Overview cần bắt đầu bằng Overall/In general và nêu 2–3 đặc điểm lớn nhất.",
        compareHits>=3?"Bạn đã có một số so sánh.":"Cần thêm comparison thay vì chỉ liệt kê số liệu.",
        dataHits>=8?"Bạn đã sử dụng khá nhiều số liệu chính.":"Cần dùng thêm số liệu chọn lọc để hỗ trợ main features."
      ].join(" ")
    };
  }

  function combinedEssay(){
    return [WS.sections.intro,WS.sections.overview,WS.sections.body1,WS.sections.body2].filter(Boolean).join("\n\n");
  }

  function correctedLocal(text,corrections){
    var out=text;
    (corrections||[]).forEach(function(x){
      var low=out.toLowerCase(),needle=String(x.wrong||"").toLowerCase();
      var i=low.indexOf(needle);
      if(i>=0)out=out.slice(0,i)+x.better+out.slice(i+needle.length);
    });
    return out;
  }

  function bandCard(title,band,desc){
    return '<div class="wsBandCard"><span>'+title+'</span><strong>'+Number(band).toFixed(1)+'</strong><p>'+esc(desc)+'</p></div>';
  }

  function renderResult(result){
    stopTimer();
    var body=document.getElementById("lessonBody");if(!body)return;
    var raw=combinedEssay();
    var corr=result.corrections||[];
    var corrHTML=corr.length?'<ul class="wsCorrectionList">'+corr.map(function(x){return '<li><del>'+esc(x.wrong||"")+'</del> → <b>'+esc(x.better||"")+'</b>'+(x.reason?'<small>'+esc(x.reason)+'</small>':'')+'</li>';}).join("")+'</ul>':'<p class="muted">Không phát hiện lỗi phổ biến rõ ràng bằng bộ kiểm tra cục bộ.</p>';

    body.innerHTML=
      '<div class="writingResult">'+
        '<div class="wsResultTop"><button id="wsBackEdit" class="wsGhost">← Quay lại sửa bài</button><div class="wsOverallBand"><span>Estimated practice band</span><strong>'+Number(result.overall).toFixed(1)+'</strong><small>Không phải điểm IELTS chính thức</small></div><button id="wsRegrade" class="wsGhost">Chấm lại</button></div>'+
        '<div class="wsBandGrid">'+
          bandCard("Task Achievement",result.task,result.task_comment||"Main features, overview, data selection and comparisons.")+
          bandCard("Coherence & Cohesion",result.coherence,result.coherence_comment||"Paragraphing, progression and linking.")+
          bandCard("Lexical Resource",result.lexical,result.lexical_comment||"Range, precision and collocations.")+
          bandCard("Grammar",result.grammar,result.grammar_comment||"Range and accuracy of sentence structures.")+
        '</div>'+
        '<div class="wsResultGrid">'+
          '<section class="wsResultMain">'+
            '<div class="wsResultCard"><h2>Bài của bạn</h2><div class="wsEssayText">'+esc(raw).replace(/\n/g,"<br>")+'</div></div>'+
            '<div class="wsResultCard"><h2>Lỗi cần sửa</h2>'+corrHTML+'</div>'+
            '<div class="wsResultCard good"><h2>Bản sửa</h2><div id="wsCorrectedEssay" class="wsEssayText">'+esc(result.corrected||correctedLocal(raw,corr)).replace(/\n/g,"<br>")+'</div></div>'+
            '<div class="wsResultCard blue"><h2>Bản nâng cấp</h2><div id="wsImprovedEssay" class="wsEssayText">'+esc(result.improved||result.corrected||correctedLocal(raw,corr)).replace(/\n/g,"<br>")+'</div></div>'+
          '</section>'+
          '<aside class="wsResultAside">'+
            '<div class="wsCoachCard"><h3>Nhận xét</h3><p id="wsDetailedFeedback">'+esc(result.feedback||"")+'</p></div>'+
            '<div class="wsCoachCard"><h3>3 việc cần làm tiếp</h3><ol><li>Viết Overview trước khi đi vào số liệu.</li><li>Nhóm 2 sectors có pattern giống nhau.</li><li>Rewrite các câu bị sửa rồi mới viết bài mới.</li></ol></div>'+
            '<div class="wsCoachCard"><button id="wsCopyImproved" class="btn primary" style="width:100%">Copy bản nâng cấp</button></div>'+
          '</aside>'+
        '</div>'+
        '<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>'+
      '</div>';

    document.getElementById("wsBackEdit").onclick=renderWorkspace;
    document.getElementById("wsRegrade").onclick=gradeEssay;
    document.getElementById("wsCopyImproved").onclick=function(){
      var t=document.getElementById("wsImprovedEssay").innerText;
      if(navigator.clipboard)navigator.clipboard.writeText(t);
      var b=this;b.textContent="✓ Đã copy";setTimeout(function(){b.textContent="Copy bản nâng cấp";},1200);
    };
    var finish=document.getElementById("finish");if(finish&&WS.finishHandler)finish.onclick=WS.finishHandler;
  }

  async function gradeWithAI(local){
    if(!window.LanguageModel)return local;
    try{
      var opts={expectedInputs:[{type:"text",languages:["en","vi"]}],expectedOutputs:[{type:"text",languages:["en","vi"]}]};
      var av=await window.LanguageModel.availability(opts);
      if(av==="unavailable")return local;
      var session=await window.LanguageModel.create(opts);
      var essay=combinedEssay();
      var prompt=
        "You are an IELTS Academic Writing Task 1 practice examiner. Grade this response using the four official-style criteria: Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy. This is practice feedback, not an official IELTS score. Task: "+TASK.prompt+
        " Data: Manufacturing 15,20,17,13; Retail 6,10,15,16; Agriculture 6,3,3,2; Healthcare 2,5,11,16 for 1960,1980,2000,2020 respectively. Learner response: "+essay+
        '. Return VALID JSON ONLY with keys: overall, task, coherence, lexical, grammar (bands 0-9 in 0.5 steps), task_comment, coherence_comment, lexical_comment, grammar_comment, feedback (Vietnamese), corrected, improved, corrections. corrections must be an array of {"wrong":"exact learner wording","better":"natural correction","reason":"short Vietnamese explanation"}. corrected should preserve the learner ideas and fix errors. improved should be a stronger natural Band 7-ish version, not an overcomplicated Band 9 model.';
      var raw=await session.prompt(prompt);
      var t=String(raw||"").trim(),a=t.indexOf("{"),b=t.lastIndexOf("}");
      if(a>=0&&b>a)t=t.slice(a,b+1);
      var d=JSON.parse(t);
      function band(x,f){x=Number(x);return isFinite(x)?clamp(Math.round(x*2)/2,0,9):f;}
      var out={
        overall:band(d.overall,local.overall),
        task:band(d.task,local.task),
        coherence:band(d.coherence,local.coherence),
        lexical:band(d.lexical,local.lexical),
        grammar:band(d.grammar,local.grammar),
        task_comment:d.task_comment||"",
        coherence_comment:d.coherence_comment||"",
        lexical_comment:d.lexical_comment||"",
        grammar_comment:d.grammar_comment||"",
        feedback:d.feedback||local.feedback,
        corrected:d.corrected||correctedLocal(combinedEssay(),local.corrections),
        improved:d.improved||"",
        corrections:Array.isArray(d.corrections)?d.corrections:local.corrections
      };
      if(session.destroy)session.destroy();
      return out;
    }catch(e){return local;}
  }

  async function gradeEssay(){
    saveDraft();
    var all=combinedEssay();
    var quick=document.getElementById("wsQuickFeedback");
    if(words(all).length<25){
      if(quick)quick.textContent="Bài còn quá ngắn để chấm. Hãy viết ít nhất Introduction + Overview + một Body.";
      return;
    }
    var body=document.getElementById("lessonBody");
    if(body)body.innerHTML='<div class="wsProcessing"><div class="spkSpinner"></div><h2>Đang chấm và sửa bài…</h2><p>Kiểm tra Task Achievement, Coherence, Vocabulary và Grammar.</p></div>';
    var local=localAssessment();
    var result=await gradeWithAI(local);
    if(!result.corrected)result.corrected=correctedLocal(all,result.corrections);
    if(!result.improved)result.improved=result.corrected;
    renderResult(result);
  }

  function initWritingStudio(){
    var oldFinish=document.getElementById("finish");
    WS.finishHandler=oldFinish&&oldFinish.onclick?oldFinish.onclick:null;
    WS.startTime=Date.now();
    renderWorkspace();
  }

  window.openLesson=function(d,i){
    previousOpenLesson(d,i);
    setTimeout(function(){
      var title=document.getElementById("lessonTitle");
      var t=title?title.textContent.toUpperCase():"";
      if(t.indexOf("WRITING")>=0)initWritingStudio();
    },50);
  };

  var close=document.getElementById("lessonClose");
  if(close)close.addEventListener("click",function(){stopTimer();saveDraft();});
})();