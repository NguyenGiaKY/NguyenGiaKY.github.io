(function(){
  "use strict";

  const KEY="gkyyy_error_lab_v2";
  const DAY=86400000;
  let store={items:[],filter:"active",selected:null,migrated:false};
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||"null");
    if(saved&&typeof saved==="object"){
      store=Object.assign(store,saved);
      if(!Array.isArray(store.items))store.items=[];
    }
  }catch(e){}

  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g,function(m){
      return m==="&"?"&amp;":m==="<"?"&lt;":m===">"?"&gt;":m==="'"?"&#39;":"&quot;";
    });
  }
  function norm(s){
    return String(s||"").toLowerCase().replace(/[$£€,%]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  }
  function hash(s){
    let h=2166136261;
    s=String(s||"");
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}
  }
  function now(){return Date.now();}
  function dayLabel(ts){
    if(!ts)return "Hôm nay";
    const d=Math.ceil((ts-now())/DAY);
    if(d<=0)return "Hôm nay";
    if(d===1)return "Ngày mai";
    return "Sau "+d+" ngày";
  }
  function skillLabel(s){
    s=String(s||"other").toLowerCase();
    const m={grammar:"Grammar",reading:"Reading",listening:"Listening",writing:"Writing",speaking:"Speaking",vocab:"Vocabulary",vocabulary:"Vocabulary"};
    return m[s]||s.charAt(0).toUpperCase()+s.slice(1);
  }
  function skillIcon(s){
    s=String(s||"").toLowerCase();
    return s==="grammar"?"🧠":s==="reading"?"📖":s==="listening"?"🎧":s==="writing"?"✍️":s==="speaking"?"🎙️":"📝";
  }
  function fingerprint(x){
    return hash([x.skill,x.task,x.question,x.userAnswer,x.correctAnswer,x.errorType].map(norm).join("|"));
  }
  function memoryTip(x){
    const s=String(x.skill||"").toLowerCase(),t=String(x.errorType||"").toLowerCase();
    if(s==="listening"){
      if(/spell|chính tả|spelling/.test(t))return "Nghe theo âm tiết → viết từ → kiểm tra chữ cuối, số nhiều và word limit trước khi chốt.";
      if(/distractor|thông tin/.test(t))return "Đừng chốt ở keyword đầu tiên. Nghe tiếp but / actually / instead / rather than để tìm thông tin cuối cùng được xác nhận.";
      return "Prediction trước khi nghe → bắt keyword → nghe paraphrase → kiểm tra spelling/số nhiều trước khi nộp.";
    }
    if(s==="reading"){
      if(/tfng|true|false|not given/.test(t+" "+x.correctAnswer))return "TRUE = cùng nghĩa; FALSE = passage mâu thuẫn; NOT GIVEN = passage không đủ thông tin. Không dùng kiến thức ngoài bài.";
      return "Question keyword → tìm evidence → diễn đạt evidence bằng lời của bạn → mới so với đáp án. Đừng chọn chỉ vì thấy cùng keyword.";
    }
    if(s==="writing"){
      return "Nhớ theo chuỗi: lỗi của mình → rule → câu sửa → tự viết thêm 1 câu mới cùng cấu trúc. Một lỗi sửa 3 lần sẽ khó lặp lại hơn.";
    }
    if(s==="speaking"){
      if(/pronun|phát âm/.test(t))return "Tách từ thành âm tiết, nghe mẫu, nói chậm 3 lần rồi nói lại trong cả câu. Ưu tiên đúng âm/stress trước tốc độ.";
      return "Nói lại câu đúng thành tiếng, sau đó dùng cùng cấu trúc trong một câu khác về chính bản thân bạn.";
    }
    if(s==="grammar"){
      return "Đừng học đáp án riêng lẻ. Nhớ tín hiệu → rule → một cặp câu đúng/sai → tự tạo thêm 1 câu.";
    }
    return "Che đáp án, tự nhớ lại trước; sau đó xem rule và tạo một ví dụ của riêng bạn.";
  }
  function repairPrompt(x){
    const s=String(x.skill||"").toLowerCase();
    if(s==="writing"||s==="speaking")return "Sửa lại phần sai này mà không nhìn đáp án:";
    if(s==="listening")return "Từ câu hỏi này, gõ lại đáp án đúng:";
    if(s==="reading")return "Làm lại câu này dựa trên evidence:";
    if(s==="grammar")return "Làm lại câu này theo đúng rule:";
    return "Tự nhớ và nhập lại đáp án đúng:";
  }
  function isTFNG(x){
    const c=norm(x.correctAnswer);
    return ["true","false","not given"].includes(c);
  }
  function matches(answer,correct){
    const a=norm(answer),c=norm(correct);
    if(!a||!c)return false;
    if(a===c)return true;
    // Accept common Listening numeric formats such as $20 vs 20 dollars.
    const an=a.replace(/\b(dollar|dollars|pound|pounds|percent|percentage)\b/g,"").trim();
    const cn=c.replace(/\b(dollar|dollars|pound|pounds|percent|percentage)\b/g,"").trim();
    return an&&cn&&an===cn;
  }
  function due(x){return !x.mastered&&(!x.nextDue||x.nextDue<=now());}
  function activeItems(){return store.items.filter(x=>!x.mastered);}
  function sortItems(a,b){
    if(due(a)!==due(b))return due(a)?-1:1;
    if((b.repeats||1)!==(a.repeats||1))return (b.repeats||1)-(a.repeats||1);
    return (b.lastSeen||b.createdAt||0)-(a.lastSeen||a.createdAt||0);
  }

  function migrateLegacy(){
    if(store.migrated)return;
    store.migrated=true;
    try{
      const legacy=JSON.parse(localStorage.getItem("ielts100_online")||"{}");
      (Array.isArray(legacy.mistakes)?legacy.mistakes:[]).forEach(function(m){
        add({
          skill:m.type||"other",
          task:"Bài cũ · Day "+(m.day||""),
          question:m.p||"",
          userAnswer:"",
          correctAnswer:m.c||"",
          why:m.e||"",
          rule:"",
          evidence:"",
          errorType:m.type||"Lỗi từ bài cũ",
          mastered:!!m.mastered,
          source:"Review 1–3–7"
        },true);
      });
    }catch(e){}
    save();
  }

  function add(raw,silent){
    raw=raw||{};
    const item={
      skill:String(raw.skill||"other").toLowerCase(),
      task:String(raw.task||raw.source||"Task"),
      question:String(raw.question||""),
      userAnswer:String(raw.userAnswer||""),
      correctAnswer:String(raw.correctAnswer||""),
      why:String(raw.why||""),
      rule:String(raw.rule||""),
      evidence:String(raw.evidence||""),
      errorType:String(raw.errorType||"Lỗi cần sửa"),
      source:String(raw.source||""),
      createdAt:now(),
      lastSeen:now(),
      nextDue:now(),
      stage:0,
      attempts:0,
      repeats:1,
      mastered:!!raw.mastered,
      example:""
    };
    const fp=fingerprint(item);
    let existing=store.items.find(x=>x.fp===fp);
    if(existing){
      existing.lastSeen=now();
      existing.repeats=(existing.repeats||1)+1;
      existing.why=item.why||existing.why;
      existing.rule=item.rule||existing.rule;
      existing.evidence=item.evidence||existing.evidence;
      existing.correctAnswer=item.correctAnswer||existing.correctAnswer;
      existing.userAnswer=item.userAnswer||existing.userAnswer;
      if(!raw.mastered){
        existing.mastered=false;
        existing.nextDue=Math.min(existing.nextDue||now(),now());
      }
    }else{
      item.id="err-"+now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
      item.fp=fp;
      store.items.push(item);
    }
    if(store.items.length>400){
      store.items=store.items.sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0)).slice(0,400);
    }
    save();
    if(!silent)renderIfVisible();
    return existing||item;
  }

  window.recordLearningError=function(raw){return add(raw,false);};

  function stats(){
    const all=store.items,active=all.filter(x=>!x.mastered),dueNow=active.filter(due);
    return {
      active:active.length,
      due:dueNow.length,
      repeated:active.filter(x=>(x.repeats||1)>1).length,
      mastered:all.filter(x=>x.mastered).length
    };
  }
  function filtered(){
    let arr=store.items.slice(),f=store.filter||"active";
    if(f==="active")arr=arr.filter(x=>!x.mastered);
    else if(f==="due")arr=arr.filter(due);
    else if(f==="mastered")arr=arr.filter(x=>x.mastered);
    else if(f!=="all")arr=arr.filter(x=>String(x.skill||"").toLowerCase()===f&&!x.mastered);
    return arr.sort(sortItems);
  }
  function filterButton(id,label,count){
    return '<button type="button" class="errFilter '+(store.filter===id?'active':'')+'" data-err-filter="'+id+'">'+label+(count!==undefined?' <b>'+count+'</b>':'')+'</button>';
  }
  function cardHTML(x){
    const rep=x.repeats||1;
    return '<article class="errCard '+(due(x)?'due':'')+(x.mastered?' mastered':'')+'">'+
      '<div class="errCardTop">'+
        '<div><span class="errSkill">'+skillIcon(x.skill)+' '+esc(skillLabel(x.skill))+'</span><span class="errType">'+esc(x.errorType||"Lỗi cần sửa")+'</span></div>'+
        '<div class="errCardMeta">'+(rep>1?'<span class="repeat">Lặp '+rep+'×</span>':'')+'<span>'+esc(x.mastered?'Đã nhớ':dayLabel(x.nextDue))+'</span></div>'+
      '</div>'+
      '<h3>'+esc(x.question||x.task||"Lỗi từ task")+'</h3>'+
      (x.userAnswer?'<div class="errWrongRight"><div><small>Bạn làm</small><del>'+esc(x.userAnswer)+'</del></div><div><small>Đúng / nên sửa</small><strong>'+esc(x.correctAnswer||"Xem hướng dẫn")+'</strong></div></div>':
        (x.correctAnswer?'<div class="errCorrectOnly"><small>Đáp án đúng</small><strong>'+esc(x.correctAnswer)+'</strong></div>':''))+
      '<div class="errWhyRule">'+
        '<p><b>Vì sao sai:</b> '+esc(x.why||"Lỗi này được lưu từ task. Hãy so sánh câu của bạn với đáp án đúng và rule bên dưới.")+'</p>'+
        '<p><b>Cách tránh lặp lại:</b> '+esc(x.rule||memoryTip(x))+'</p>'+
      '</div>'+
      (x.evidence?'<details class="errEvidence"><summary>🔎 Evidence từ bài</summary><p>'+esc(x.evidence)+'</p></details>':'')+
      '<div class="errCardActions">'+
        (x.mastered?'<button type="button" data-err-reactivate="'+x.id+'">↩ Luyện lại</button>':
          '<button type="button" class="primary" data-err-practice="'+x.id+'">▶ Luyện lỗi này</button><button type="button" data-err-master="'+x.id+'">✓ Tôi đã nhớ</button>')+
      '</div>'+
    '</article>';
  }
  function practiceHTML(x){
    if(!x)return "";
    const tfng=isTFNG(x);
    return '<section class="errPractice" id="errPractice">'+
      '<div class="errPracticeHead"><div><span>REPAIR DRILL</span><h2>'+skillIcon(x.skill)+' '+esc(skillLabel(x.skill))+' · Luyện lại lỗi thật của bạn</h2></div><button id="errPracticeClose" type="button">×</button></div>'+
      '<div class="errPracticeGrid">'+
        '<div class="errPracticeMain">'+
          '<p class="errRepairPrompt">'+esc(repairPrompt(x))+'</p>'+
          '<div class="errPracticeQuestion">'+esc(x.question||x.userAnswer||"Nhập lại đáp án đúng")+'</div>'+
          ((String(x.skill).toLowerCase()==="writing"||String(x.skill).toLowerCase()==="speaking")&&x.userAnswer?
            '<div class="errPracticeWrong"><small>Câu/cụm cũ</small><del>'+esc(x.userAnswer)+'</del></div>':'')+
          (tfng?
            '<div class="errChoiceRow"><button data-err-choice="True">True</button><button data-err-choice="False">False</button><button data-err-choice="Not Given">Not Given</button></div>':
            '<div class="errPracticeInputRow"><input id="errPracticeInput" autocomplete="off" spellcheck="false" placeholder="Nhập câu trả lời của bạn..."><button id="errPracticeCheck" class="primary" type="button">Check</button></div>')+
          '<div id="errPracticeFeedback"></div>'+
        '</div>'+
        '<aside class="errMemoryCard">'+
          '<span>🧠 MẸO NHỚ</span><p>'+esc(memoryTip(x))+'</p>'+
          (x.rule?'<div><b>Rule từ bài:</b><br>'+esc(x.rule)+'</div>':'')+
          '<small>Lịch nhớ: làm đúng → ôn lại sau 1 ngày → 3 ngày → 7 ngày.</small>'+
        '</aside>'+
      '</div>'+
    '</section>';
  }

  function render(){
    const root=document.getElementById("errorCenter");if(!root)return;
    const s=stats(),items=filtered();
    const dueItems=activeItems().filter(due).sort(sortItems).slice(0,3);
    const selected=store.items.find(x=>x.id===store.selected);

    root.innerHTML=
      '<div class="errLabHero">'+
        '<div><span>PERSONAL ERROR SYSTEM</span><h1>🧠 Error Lab</h1><p>Sai → hiểu tại sao → luyện đúng lỗi đó → ôn lại 1–3–7 ngày để không lặp lại.</p></div>'+
        '<button id="errStartRepair" class="errStartBtn" type="button" '+(!dueItems.length?'disabled':'')+'>▶ Luyện '+Math.min(3,dueItems.length)+' lỗi hôm nay</button>'+
      '</div>'+
      '<div class="errStats">'+
        '<div><span>Lỗi đang học</span><strong>'+s.active+'</strong></div>'+
        '<div class="due"><span>Cần ôn hôm nay</span><strong>'+s.due+'</strong></div>'+
        '<div><span>Lỗi lặp lại</span><strong>'+s.repeated+'</strong></div>'+
        '<div class="good"><span>Đã ghi nhớ</span><strong>'+s.mastered+'</strong></div>'+
      '</div>'+
      (selected?practiceHTML(selected):'')+
      '<section class="errHow">'+
        '<div><b>1 · Lưu tự động</b><span>Task sai sẽ đi thẳng vào Error Lab.</span></div>'+
        '<div><b>2 · Hiểu lỗi</b><span>Xem đáp án, evidence, nguyên nhân và rule.</span></div>'+
        '<div><b>3 · Mini drill</b><span>Làm lại chính lỗi đó, không học bài tập ngẫu nhiên.</span></div>'+
        '<div><b>4 · Nhớ lâu</b><span>Ôn theo nhịp 1–3–7 ngày.</span></div>'+
      '</section>'+
      '<div class="errToolbar">'+
        '<div class="errFilters">'+
          filterButton("active","Đang học",s.active)+
          filterButton("due","Hôm nay",s.due)+
          filterButton("grammar","Grammar")+
          filterButton("reading","Reading")+
          filterButton("listening","Listening")+
          filterButton("writing","Writing")+
          filterButton("speaking","Speaking")+
          filterButton("mastered","Đã nhớ",s.mastered)+
        '</div>'+
        '<span>'+items.length+' lỗi</span>'+
      '</div>'+
      '<div class="errList">'+(items.length?items.map(cardHTML).join("") :
        '<div class="errEmptyState"><div>✨</div><h3>'+((store.filter==="mastered")?"Chưa có lỗi nào được đánh dấu đã nhớ":"Không có lỗi cần luyện trong mục này")+'</h3><p>Khi bạn làm sai Grammar, Reading, Listening, Writing hoặc Speaking, lỗi sẽ tự xuất hiện ở đây cùng bài luyện sửa lỗi.</p></div>')+'</div>';

    bind();
  }

  function bind(){
    document.querySelectorAll("[data-err-filter]").forEach(b=>b.onclick=function(){
      store.filter=this.dataset.errFilter;store.selected=null;save();render();
    });
    document.querySelectorAll("[data-err-practice]").forEach(b=>b.onclick=function(){
      store.selected=this.dataset.errPractice;save();render();
      setTimeout(()=>document.getElementById("errPractice")?.scrollIntoView({behavior:"smooth",block:"start"}),40);
    });
    document.querySelectorAll("[data-err-master]").forEach(b=>b.onclick=function(){
      const x=store.items.find(i=>i.id===this.dataset.errMaster);
      if(x){x.mastered=true;x.nextDue=0;x.stage=4;save();render();}
    });
    document.querySelectorAll("[data-err-reactivate]").forEach(b=>b.onclick=function(){
      const x=store.items.find(i=>i.id===this.dataset.errReactivate);
      if(x){x.mastered=false;x.stage=Math.min(2,x.stage||0);x.nextDue=now();store.selected=x.id;save();render();}
    });
    const start=document.getElementById("errStartRepair");
    if(start)start.onclick=function(){
      const x=activeItems().filter(due).sort(sortItems)[0];
      if(x){store.selected=x.id;save();render();}
    };
    const close=document.getElementById("errPracticeClose");
    if(close)close.onclick=function(){store.selected=null;save();render();};

    const input=document.getElementById("errPracticeInput");
    const check=document.getElementById("errPracticeCheck");
    if(check)check.onclick=function(){gradePractice(input?input.value:"");};
    if(input)input.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();gradePractice(this.value);}};

    document.querySelectorAll("[data-err-choice]").forEach(b=>b.onclick=function(){
      document.querySelectorAll("[data-err-choice]").forEach(x=>x.classList.remove("selected"));
      this.classList.add("selected");
      gradePractice(this.dataset.errChoice);
    });
  }

  function gradePractice(answer){
    const x=store.items.find(i=>i.id===store.selected);
    const box=document.getElementById("errPracticeFeedback");
    if(!x||!box)return;
    const ok=matches(answer,x.correctAnswer);
    x.attempts=(x.attempts||0)+1;
    if(ok){
      x.stage=Math.min(4,(x.stage||0)+1);
      const waits=[1,1,3,7,0];
      if(x.stage>=4){x.mastered=true;x.nextDue=0;}
      else{x.nextDue=now()+waits[x.stage]*DAY;}
      box.innerHTML=
        '<div class="errPracticeResult good"><h3>✓ Đúng — sửa được lỗi này</h3><p><b>Đáp án:</b> '+esc(x.correctAnswer)+'</p>'+
        '<p><b>Tại sao:</b> '+esc(x.why||x.rule||"Bạn đã nhớ đúng cách xử lý lỗi.")+'</p>'+
        '<div class="errMakeOwn"><label>Tạo 1 ví dụ của bạn để nhớ lâu hơn <small>(không bắt buộc)</small></label><input id="errOwnExample" value="'+esc(x.example||"")+'" placeholder="Viết một câu mới áp dụng rule này..."><button id="errSaveExample" type="button">Lưu ví dụ</button></div>'+
        '<div class="errResultActions"><button id="errNextDue" class="primary" type="button">'+(x.mastered?'✓ Đã hoàn thành':'Lỗi tiếp theo →')+'</button></div></div>';
    }else{
      x.stage=Math.max(0,(x.stage||0)-1);
      x.nextDue=now();
      box.innerHTML=
        '<div class="errPracticeResult bad"><h3>Chưa đúng — xem lại rồi thử lần nữa</h3><p><b>Bạn nhập:</b> '+esc(answer||"Bỏ trống")+'</p><p><b>Đáp án đúng:</b> '+esc(x.correctAnswer||"—")+'</p>'+
        (x.why?'<p><b>Vì sao:</b> '+esc(x.why)+'</p>':'')+
        '<p class="errMemoryInline">🧠 '+esc(memoryTip(x))+'</p><button id="errTryAgain" type="button">↻ Thử lại</button></div>';
    }
    save();

    const own=document.getElementById("errSaveExample");
    if(own)own.onclick=function(){
      const e=document.getElementById("errOwnExample");
      x.example=e?e.value.trim():"";save();this.textContent="✓ Đã lưu";
    };
    const again=document.getElementById("errTryAgain");
    if(again)again.onclick=function(){
      box.innerHTML="";
      const inp=document.getElementById("errPracticeInput");
      if(inp){inp.value="";inp.focus();}
      document.querySelectorAll("[data-err-choice]").forEach(b=>b.classList.remove("selected"));
    };
    const next=document.getElementById("errNextDue");
    if(next)next.onclick=function(){
      if(x.mastered){store.selected=null;save();render();return;}
      const candidates=activeItems().filter(i=>i.id!==x.id&&due(i)).sort(sortItems);
      store.selected=candidates.length?candidates[0].id:null;
      save();render();
    };
  }

  function renderIfVisible(){
    const v=document.getElementById("view-errors");
    if(v&&v.classList.contains("active"))render();
  }

  migrateLegacy();

  const nav=document.querySelector('[data-view="errors"]');
  if(nav)nav.addEventListener("click",function(){setTimeout(render,0);});
  document.addEventListener("DOMContentLoaded",renderIfVisible);
  window.renderErrorLab=render;
})();