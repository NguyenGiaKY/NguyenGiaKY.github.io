
(function(){
  "use strict";

  var previousOpenLesson = window.openLesson;
  if (typeof previousOpenLesson !== "function") return;

  var RS = {
    day:1,
    pack:null,
    answers:{},
    startTime:0,
    elapsed:0,
    timer:null,
    currentReview:0,
    finishHandler:null,
    note:"",
    progressRecorded:false
  };

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g,function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];
    });
  }

  function getPack(d){
    try{
      if (typeof window.readingPack === "function") return window.readingPack(d);
      if (typeof readingPack === "function") return readingPack(d);
    }catch(e){}
    return null;
  }

  function fmt(sec){
    sec=Math.max(0,Math.floor(sec||0));
    var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }

  function stopTimer(){
    if(RS.timer){clearInterval(RS.timer);RS.timer=null;}
  }

  function startTimer(){
    stopTimer();
    if(!RS.startTime)RS.startTime=Date.now();
    RS.timer=setInterval(function(){
      RS.elapsed=Math.floor((Date.now()-RS.startTime)/1000);
      var e=document.getElementById("rsTimer");
      if(e)e.textContent=fmt(RS.elapsed);
    },250);
  }

  function answeredCount(){
    return Object.keys(RS.answers).filter(function(k){return RS.answers[k] !== null && RS.answers[k] !== undefined;}).length;
  }

  function isTFNG(q){
    return q && Array.isArray(q[1]) && q[1].length===3 &&
      String(q[1][0]).toLowerCase()==="true" &&
      String(q[1][1]).toLowerCase()==="false" &&
      String(q[1][2]).toLowerCase()==="not given";
  }

  function navHTML(){
    var qs=RS.pack.q||[];
    return '<div class="rsBottomBar"><div class="rsNav">' +
      qs.map(function(q,i){
        var cls=RS.answers[i]===undefined?"": " answered";
        return '<button class="rsNavBtn'+cls+'" data-rs-jump="'+i+'">'+(i+1)+'</button>';
      }).join("") +
      '</div><button id="rsFinish" class="rsFinishBtn">Hoàn thành</button></div>';
  }

  function toolsHTML(){
    return '<aside class="rsTools">' +
      '<div class="rsToolsTitle">Công cụ</div>'+
      '<button id="rsHighlight" class="rsToolBtn">🎨<span>Highlight 7 màu</span></button>'+
      '<button id="rsNote" class="rsToolBtn">📝<span>Notes</span></button>'+
      '<button id="rsLookup" class="rsToolBtn">📖<span>Tra từ</span></button>'+
    '</aside>';
  }

  function renderQuestionList(){
    var qs=RS.pack.q||[];
    return qs.map(function(q,i){
      var sel=RS.answers[i];
      return '<section class="rsQuestion" id="rsQ'+i+'">'+
        '<div class="rsQHead"><span class="rsQNum">'+(i+1)+'</span><b>'+esc(q[0])+'</b></div>'+
        '<div class="rsOptions">'+q[1].map(function(o,j){
          return '<label class="rsOption'+(sel===j?' selected':'')+'">'+
            '<input type="radio" name="rsq'+i+'" value="'+j+'" '+(sel===j?'checked':'')+'>'+
            '<span class="rsRadio"></span><span>'+esc(o)+'</span>'+
          '</label>';
        }).join("")+'</div>'+
      '</section>';
    }).join("");
  }

  function getSavedSplit(){
    try{
      var n=parseFloat(localStorage.getItem("ielts_reading_split")||"50");
      return isFinite(n)?Math.max(28,Math.min(72,n)):50;
    }catch(e){return 50;}
  }

  function setSplitPct(pct){
    pct=Math.max(28,Math.min(72,Number(pct)||50));
    var split=document.getElementById("rsSplit");
    var review=document.getElementById("rrSplit");
    if(split)split.style.setProperty("--reading-left",pct+"%");
    if(review)review.style.setProperty("--reading-left",pct+"%");
    var label=document.getElementById("rsSplitLabel");
    if(label)label.textContent=Math.round(pct)+" / "+Math.round(100-pct);
    try{localStorage.setItem("ielts_reading_split",String(pct));}catch(e){}
  }

  function bindSplitResize(splitId,dividerId){
    var split=document.getElementById(splitId),divider=document.getElementById(dividerId);
    if(!split||!divider)return;
    setSplitPct(getSavedSplit());
    var dragging=false;
    divider.onpointerdown=function(ev){
      dragging=true;
      divider.classList.add("dragging");
      document.body.classList.add("rsResizing");
      try{divider.setPointerCapture(ev.pointerId);}catch(e){}
      ev.preventDefault();
    };
    divider.onpointermove=function(ev){
      if(!dragging)return;
      var r=split.getBoundingClientRect();
      var pct=((ev.clientX-r.left)/r.width)*100;
      setSplitPct(pct);
    };
    divider.onpointerup=function(ev){
      dragging=false;
      divider.classList.remove("dragging");
      document.body.classList.remove("rsResizing");
      try{divider.releasePointerCapture(ev.pointerId);}catch(e){}
    };
    divider.onpointercancel=function(){
      dragging=false;
      divider.classList.remove("dragging");
      document.body.classList.remove("rsResizing");
    };
  }

  function bindSplitPresets(){
    var a=document.getElementById("rsMorePassage"),b=document.getElementById("rsEqualSplit"),d=document.getElementById("rsMoreQuestions");
    if(a)a.onclick=function(){setSplitPct(64);};
    if(b)b.onclick=function(){setSplitPct(50);};
    if(d)d.onclick=function(){setSplitPct(36);};
  }

  function renderTest(){
    var body=document.getElementById("lessonBody");
    if(!body||!RS.pack)return;

    var title=document.getElementById("lessonTitle");
    if(title){
      title.innerHTML='<div class="phase">READING PRACTICE</div><h2>'+esc(RS.pack.title)+'</h2>';
    }

    body.innerHTML=
      '<div class="readingStudio">'+
        '<div class="rsTop"><button id="rsExit" class="rsCloseGhost">×</button><div class="rsTimerPill">⏱ <span id="rsTimer">'+fmt(RS.elapsed)+'</span></div><div class="rsTopRight"><div class="rsSplitControls"><button id="rsMorePassage" type="button">◀ Bài đọc</button><button id="rsEqualSplit" type="button"><span id="rsSplitLabel">50 / 50</span></button><button id="rsMoreQuestions" type="button">Câu hỏi ▶</button></div><span id="rsAnswered">'+answeredCount()+' / '+RS.pack.q.length+' answered</span></div></div>'+
        toolsHTML()+
        '<div class="rsSplit" id="rsSplit">'+
          '<article class="rsPassagePane" id="rsPassagePane">'+
            '<div class="rsPassageInner"><h2>'+esc(RS.pack.title)+'</h2><p>'+esc(RS.pack.text)+'</p></div>'+
          '</article>'+
          '<div class="rsDivider" id="rsDivider" role="separator" aria-label="Kéo để thay đổi kích thước"><span>⋮</span></div>'+
          '<main class="rsQuestionsPane">'+
            '<div class="rsInstruction"><h2>Questions 1 - '+RS.pack.q.length+'</h2>'+
              '<p>'+(isTFNG(RS.pack.q[0])?'Do the following statements agree with the information given in the passage?':'Choose the best answer for each question.')+'</p>'+
            '</div>'+
            renderQuestionList()+
          '</main>'+
        '</div>'+
        navHTML()+
        '<div id="rsNotePanel" class="rsNotePanel hidden"><div class="rsNoteHead"><b>Notes</b><button id="rsNoteClose">×</button></div><textarea id="rsNoteText" placeholder="Ghi chú cho passage này...">'+esc(RS.note)+'</textarea></div>'+
      '</div>';

    document.querySelectorAll(".rsOption input").forEach(function(inp){
      inp.onchange=function(){
        var qIndex=Number(this.name.replace("rsq",""));
        RS.answers[qIndex]=Number(this.value);
        renderAnswerState(qIndex);
        var answered=document.getElementById("rsAnswered");
        if(answered)answered.textContent=answeredCount()+" / "+RS.pack.q.length+" answered";
      };
    });

    bindNavButtons();
    document.getElementById("rsFinish").onclick=showResult;
    document.getElementById("rsExit").onclick=function(){
      var close=document.getElementById("lessonClose");if(close)close.click();
    };
    document.getElementById("rsHighlight").onclick=function(){
      if(typeof window.openStudyHighlighter==="function")window.openStudyHighlighter();
      else highlightSelection();
    };
    document.getElementById("rsNote").onclick=toggleNotes;
    document.getElementById("rsLookup").onclick=lookupSelection;
    document.getElementById("rsNoteClose").onclick=toggleNotes;
    document.getElementById("rsNoteText").oninput=function(){RS.note=this.value;};
    bindSplitResize("rsSplit","rsDivider");
    bindSplitPresets();

    startTimer();
  }

  function renderAnswerState(i){
    var q=document.getElementById("rsQ"+i);if(!q)return;
    q.querySelectorAll(".rsOption").forEach(function(l){l.classList.remove("selected");});
    var val=RS.answers[i];
    if(val!==undefined){
      var lab=q.querySelector('.rsOption input[value="'+val+'"]');
      if(lab)lab.closest(".rsOption").classList.add("selected");
    }
    var nav=document.querySelector('[data-rs-jump="'+i+'"]');
    if(nav)nav.classList.add("answered");
  }

  function bindNavButtons(){
    document.querySelectorAll("[data-rs-jump]").forEach(function(b){
      b.onclick=function(){
        var i=Number(this.getAttribute("data-rs-jump"));
        var q=document.getElementById("rsQ"+i);
        if(q)q.scrollIntoView({behavior:"smooth",block:"start"});
      };
    });
  }

  function highlightSelection(){
    var pane=document.getElementById("rsPassagePane");
    var sel=window.getSelection();
    if(!pane||!sel||sel.rangeCount===0||sel.isCollapsed)return;
    var range=sel.getRangeAt(0);
    if(!pane.contains(range.commonAncestorContainer))return;
    try{
      var mark=document.createElement("mark");
      mark.className="rsUserHighlight";
      range.surroundContents(mark);
      sel.removeAllRanges();
    }catch(e){}
  }

  function toggleNotes(){
    var p=document.getElementById("rsNotePanel");
    if(p)p.classList.toggle("hidden");
  }

  function lookupSelection(){
    var text=String(window.getSelection?window.getSelection().toString():"").trim();
    if(!text)return;
    var word=(text.match(/[A-Za-z'-]+/)||[])[0];
    if(!word)return;
    try{
      if(typeof window.lookupDictionary==="function")window.lookupDictionary(word);
      else{
        var inp=document.getElementById("dictInput");
        if(inp){inp.value=word;var btn=document.getElementById("dictSearch");if(btn)btn.click();}
      }
    }catch(e){}
  }

  function scoreData(){
    var correct=0,wrong=0,skip=0,qs=RS.pack.q;
    qs.forEach(function(q,i){
      if(RS.answers[i]===undefined)skip++;
      else if(RS.answers[i]===q[2])correct++;
      else wrong++;
    });
    return {correct:correct,wrong:wrong,skip:skip,total:qs.length};
  }

  function showResult(){
    stopTimer();
    RS.elapsed=Math.floor((Date.now()-RS.startTime)/1000);
    var s=scoreData(),body=document.getElementById("lessonBody");if(!body)return;
    var pct=Math.round((s.correct/s.total)*100);
    if(typeof window.recordLearningError==="function"){
      RS.pack.q.forEach(function(q,i){
        if(RS.answers[i]===q[2])return;
        var mine=RS.answers[i]===undefined?"Bỏ qua":q[1][RS.answers[i]];
        var diagnosis=readingErrorDiagnosis(q,i);
        window.recordLearningError({
          skill:"reading",
          task:RS.pack.title||"Reading practice",
          question:q[0],
          userAnswer:mine,
          correctAnswer:q[1][q[2]],
          why:diagnosis.why||q[3]||"",
          rule:diagnosis.fix||"",
          evidence:evidenceFor(q),
          errorType:isTFNG(q)?"TFNG":"Reading answer"
        });
      });
    }
    if(!RS.progressRecorded&&typeof window.recordTaskPerformance==="function"){
      window.recordTaskPerformance({kind:"reading",score:s.correct,total:s.total,errors:s.wrong+s.skip,note:s.wrong+" sai · "+s.skip+" bỏ trống"});
      RS.progressRecorded=true;
    }
    body.innerHTML=
      '<div class="rsResultPage">'+
        '<button id="rsResultClose" class="rsResultClose">×</button>'+
        '<div class="rsResultGrid">'+
          '<div class="rsResultMessage"><div class="rsResultEmoji">📚</div><h2>'+(pct>=75?'Làm tốt lắm!':pct>=50?'Khá rồi, chữa kỹ để tăng điểm nhé.':'Bài này còn khó — chữa từng bước sẽ giúp nhiều.')+'</h2><p>Điểm chưa quan trọng bằng việc hiểu vì sao từng câu đúng hoặc sai.</p></div>'+
          '<div class="rsResultCard">'+
            '<div class="rsResultHeader"><h2>Kết quả làm bài</h2><div><span>Thời gian làm bài</span><b>'+fmt(RS.elapsed)+'</b></div></div>'+
            '<div class="rsResultBody">'+
              '<div class="rsDonut" style="--score:'+pct+'"><div><strong>'+s.correct+'/'+s.total+'</strong><span>câu đúng</span></div></div>'+
              '<div class="rsLegend"><p><i class="ok"></i>Đúng: <b>'+s.correct+' câu</b></p><p><i class="bad"></i>Sai: <b>'+s.wrong+' câu</b></p><p><i class="skip"></i>Bỏ qua: <b>'+s.skip+' câu</b></p></div>'+
            '</div>'+
            '<div class="rsResultActions"><button id="rsStepFix" class="rsPrimaryWide">Sửa từng bước</button><button id="rsExplainAll" class="rsSecondaryWide">Xem giải thích</button></div>'+
          '</div>'+
        '</div>'+
        '<div class="rsResultBottom"><button id="rsRetry" class="btn">Làm lại bài</button><button id="rsBackHome" class="btn">Quay lại</button></div>'+
      '</div>';

    document.getElementById("rsResultClose").onclick=function(){document.getElementById("lessonClose").click();};
    document.getElementById("rsRetry").onclick=function(){RS.answers={};RS.startTime=Date.now();RS.elapsed=0;RS.progressRecorded=false;renderTest();};
    document.getElementById("rsBackHome").onclick=function(){document.getElementById("lessonClose").click();};
    document.getElementById("rsExplainAll").onclick=function(){RS.currentReview=0;renderReview();};
    document.getElementById("rsStepFix").onclick=function(){
      var wrongIndex=0;
      for(var i=0;i<RS.pack.q.length;i++){
        if(RS.answers[i]!==RS.pack.q[i][2]){wrongIndex=i;break;}
      }
      RS.currentReview=wrongIndex;renderReview();
    };
  }

  function sentenceList(text){
    return String(text||"").match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
  }

  function tokens(s){
    var stop={the:1,a:1,an:1,is:1,are:1,was:1,were:1,of:1,to:1,in:1,on:1,for:1,and:1,or:1,that:1,this:1,it:1,be:1,been:1,with:1,as:1,at:1,by:1,do:1,does:1,did:1};
    return (String(s||"").toLowerCase().match(/[a-z]+/g)||[]).filter(function(w){return w.length>2&&!stop[w];});
  }

  function evidenceFor(q){
    var sentences=sentenceList(RS.pack.text),target=tokens(q[0]+" "+q[1][q[2]]+" "+q[3]),best=sentences[0]||"",bestScore=-1;
    sentences.forEach(function(s){
      var low=s.toLowerCase(),score=0;
      target.forEach(function(t){if(low.indexOf(t)>=0)score++;});
      if(score>bestScore){bestScore=score;best=s;}
    });
    return best.trim();
  }

  function keywordList(q){
    var arr=tokens(q[0]),out=[];
    arr.forEach(function(w){if(out.indexOf(w)<0)out.push(w);});
    return out.slice(0,5);
  }

  function highlightedPassage(evidence){
    var text=RS.pack.text;
    var i=text.indexOf(evidence);
    if(i<0)return '<p>'+esc(text)+'</p>';
    return '<p>'+esc(text.slice(0,i))+'<mark class="rsEvidence">'+esc(evidence)+'</mark>'+esc(text.slice(i+evidence.length))+'</p>';
  }

  function readingErrorDiagnosis(q,i){
    var mine=RS.answers[i],correct=q[2];
    if(mine===correct)return {
      title:"Bạn xử lý đúng câu này",
      why:"Đáp án bạn chọn khớp với evidence trong passage.",
      fix:"Giữ thói quen: xác định keywords → tìm evidence → so sánh nghĩa trước khi chọn."
    };
    if(mine===undefined)return {
      title:"Lỗi: bỏ trống câu hỏi",
      why:"Bạn chưa đưa ra đáp án nên mất điểm dù passage có đủ evidence.",
      fix:"Nếu còn phân vân ở cuối bài, quay lại câu này và loại các phương án không được passage hỗ trợ."
    };
    if(isTFNG(q)){
      if(correct===2)return {
        title:"Lỗi: suy diễn ngoài passage",
        why:"Bạn đã chọn "+q[1][mine]+", nhưng passage không cung cấp đủ thông tin để khẳng định TRUE hoặc FALSE.",
        fix:"Với NOT GIVEN, chỉ dùng thông tin được viết trong passage. Không dùng kiến thức đời sống hoặc điều 'có vẻ hợp lý'."
      };
      if(mine===2)return {
        title:"Lỗi: bỏ sót evidence",
        why:"Bạn chọn NOT GIVEN nhưng passage thực sự có thông tin trực tiếp để xác nhận hoặc bác bỏ statement.",
        fix:"Tìm câu chứa keyword/paraphrase của statement rồi kiểm tra quan hệ: cùng nghĩa = TRUE; mâu thuẫn = FALSE."
      };
      if(correct===1&&mine===0)return {
        title:"Lỗi: bỏ qua điểm mâu thuẫn",
        why:"Bạn chọn TRUE nhưng evidence trong passage trái với statement.",
        fix:"So từng thành phần của statement với passage, đặc biệt chú ý từ tuyệt đối, phủ định, số lượng và phạm vi."
      };
      if(correct===0&&mine===1)return {
        title:"Lỗi: hiểu evidence thành mâu thuẫn",
        why:"Bạn chọn FALSE nhưng passage thực tế truyền đạt cùng ý với statement bằng cách paraphrase.",
        fix:"Đừng đòi hỏi từ giống hệt. So sánh nghĩa của cả câu và nhận diện synonym/paraphrase."
      };
    }
    return {
      title:"Lỗi: bị distractor dẫn hướng",
      why:"Phương án '"+q[1][mine]+"' không được evidence hỗ trợ đầy đủ. Nó có thể chứa keyword giống passage nhưng sai ý, thiếu điều kiện hoặc chỉ đúng một phần.",
      fix:"Với Multiple Choice: tìm evidence trước, tự diễn đạt câu trả lời, rồi mới đối chiếu các phương án và loại distractor."
    };
  }

  function reviewSteps(q,i,evidence){
    var correct=q[1][q[2]],mine=RS.answers[i]===undefined?"Bỏ qua":q[1][RS.answers[i]];
    var type=isTFNG(q)?"TRUE / FALSE / NOT GIVEN":"Multiple Choice";
    var keywords=keywordList(q);
    var outcome=RS.answers[i]===q[2]?"Đúng":"Sai";
    var diagnosis=readingErrorDiagnosis(q,i);
    var tfngNote="";
    if(isTFNG(q)){
      if(q[2]===0)tfngNote="TRUE vì passage truyền đạt cùng ý với statement.";
      if(q[2]===1)tfngNote="FALSE vì passage có thông tin mâu thuẫn với statement.";
      if(q[2]===2)tfngNote="NOT GIVEN vì passage không cung cấp đủ thông tin để khẳng định statement.";
    }else{
      tfngNote="Chọn phương án khớp trực tiếp với evidence; các phương án còn lại không được passage hỗ trợ.";
    }

    return '<div class="rsReviewSteps">'+
      '<div class="rsReviewStatus '+(outcome==="Đúng"?"good":"bad")+'"><span>'+outcome+'</span><b>Bạn chọn: '+esc(mine)+'</b><strong>Đáp án đúng: '+esc(correct)+'</strong></div>'+
      '<div class="rsErrorDiagnosis '+(outcome==="Đúng"?"good":"bad")+'"><h3>'+esc(diagnosis.title)+'</h3><p><b>Vì sao:</b> '+esc(diagnosis.why)+'</p><p><b>Cách sửa:</b> '+esc(diagnosis.fix)+'</p></div>'+
      '<div class="rsStep"><h3>Bước 1 · Hiểu yêu cầu câu hỏi</h3><p>'+esc(q[0])+'</p><p class="muted">Dạng câu: <b>'+type+'</b></p></div>'+
      '<div class="rsStep"><h3>Bước 2 · Xác định keywords</h3><div class="rsKeywordRow">'+keywords.map(function(k){return '<span>'+esc(k)+'</span>';}).join("")+'</div><p>Đừng chỉ tìm từ giống hệt; hãy tìm cả paraphrase và ý tương đương.</p></div>'+
      '<div class="rsStep"><h3>Bước 3 · Evidence từ bài đọc</h3><blockquote>'+esc(evidence)+'</blockquote></div>'+
      '<div class="rsStep"><h3>Bước 4 · So sánh đáp án với evidence</h3><p>'+esc(tfngNote)+'</p>'+
        '<div class="rsOptionAudit">'+q[1].map(function(o,j){
          var mineClass=RS.answers[i]===j&&j!==q[2]?' mineWrong':'';
          return '<div class="'+(j===q[2]?'right':'')+mineClass+'"><b>'+(j===q[2]?'✓':RS.answers[i]===j?'✕':'×')+' '+esc(o)+'</b>'+(j===q[2]?'<span>Được passage hỗ trợ</span>':RS.answers[i]===j?'<span>Đây là đáp án bạn chọn — không khớp đủ với evidence</span>':'<span>Không phải đáp án tốt nhất</span>')+'</div>';
        }).join("")+'</div>'+
      '</div>'+
      '<div class="rsStep"><h3>Bước 5 · Quy tắc rút ra</h3><p><b>'+esc(correct)+'</b> — '+esc(q[3])+'</p><p class="rsFixRule">'+esc(diagnosis.fix)+'</p></div>'+
    '</div>';
  }

  function renderReview(){
    stopTimer();
    var i=RS.currentReview,q=RS.pack.q[i],evidence=evidenceFor(q),body=document.getElementById("lessonBody");if(!body)return;

    body.innerHTML=
      '<div class="readingReview">'+
        '<div class="rrTop"><button id="rrBack" class="spkGhost">← Kết quả</button><div><b>'+scoreData().correct+'/'+RS.pack.q.length+'</b> câu đúng</div><button id="rrNextWrong" class="spkGhost">Câu sai tiếp →</button></div>'+
        '<div class="rrSplit" id="rrSplit">'+
          '<article class="rrPassage"><div class="rrPassageInner"><h2>'+esc(RS.pack.title)+'</h2>'+highlightedPassage(evidence)+'</div></article>'+
          '<div class="rsDivider" id="rrDivider" role="separator" aria-label="Kéo để thay đổi kích thước"><span>⋮</span></div>'+
          '<main class="rrExplain">'+
            '<div class="rrQuestionHead"><span class="rsQNum">'+(i+1)+'</span><h2>'+esc(q[0])+'</h2></div>'+
            reviewSteps(q,i,evidence)+
          '</main>'+
        '</div>'+
        '<div class="rrBottom">'+
          '<div class="rsNav">'+RS.pack.q.map(function(_,j){
            var cls=RS.answers[j]===RS.pack.q[j][2]?" review-ok":" review-bad";
            return '<button class="rsNavBtn'+cls+'" data-rr="'+j+'">'+(j+1)+'</button>';
          }).join("")+'</div>'+
          '<button id="rrDone" class="rsFinishBtn">Xong phần chữa</button>'+
        '</div>'+
      '</div>';

    document.getElementById("rrBack").onclick=showResult;
    document.getElementById("rrDone").onclick=showResult;
    document.getElementById("rrNextWrong").onclick=function(){
      var next=-1;
      for(var k=i+1;k<RS.pack.q.length;k++){if(RS.answers[k]!==RS.pack.q[k][2]){next=k;break;}}
      if(next<0){for(k=0;k<i;k++){if(RS.answers[k]!==RS.pack.q[k][2]){next=k;break;}}}
      if(next<0)next=(i+1)%RS.pack.q.length;
      RS.currentReview=next;renderReview();
    };
    document.querySelectorAll("[data-rr]").forEach(function(b){
      b.onclick=function(){RS.currentReview=Number(this.getAttribute("data-rr"));renderReview();};
    });
    bindSplitResize("rrSplit","rrDivider");
  }

  function initReadingStudio(d){
    RS.day=d;
    RS.pack=getPack(d);
    if(!RS.pack)return;
    RS.answers={};
    RS.startTime=Date.now();
    RS.elapsed=0;
    RS.currentReview=0;
    RS.note="";
    RS.progressRecorded=false;
    var oldFinish=document.getElementById("finish");
    RS.finishHandler=oldFinish&&oldFinish.onclick?oldFinish.onclick:null;
    renderTest();
  }

  window.openLesson=function(d,i){
    previousOpenLesson(d,i);
    setTimeout(function(){
      var title=document.getElementById("lessonTitle");
      var t=title?title.textContent.toUpperCase():"";
      if(t.indexOf("READING")>=0)initReadingStudio(d);
    },40);
  };

  var close=document.getElementById("lessonClose");
  if(close)close.addEventListener("click",function(){stopTimer();});

})();