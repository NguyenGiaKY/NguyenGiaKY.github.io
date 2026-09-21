
(function(){
  "use strict";

  var KEY = "ielts_reading_split";
  var dragging = false;
  var activeSplit = null;
  var activeDivider = null;

  function savedPct(){
    try{
      var n = parseFloat(localStorage.getItem(KEY) || "50");
      return isFinite(n) ? Math.max(28, Math.min(72, n)) : 50;
    }catch(e){ return 50; }
  }

  function setPct(pct){
    pct = Math.max(28, Math.min(72, Number(pct) || 50));
    document.querySelectorAll(".rsSplit,.rrSplit").forEach(function(split){
      split.style.setProperty("--reading-left", pct + "%");
    });
    var label = document.getElementById("rsSplitLabel");
    if(label) label.textContent = Math.round(pct) + " / " + Math.round(100-pct);
    try{ localStorage.setItem(KEY, String(pct)); }catch(e){}
  }

  function ensureControls(){
    var topRight = document.querySelector(".readingStudio .rsTopRight");
    if(!topRight || document.getElementById("rsSplitControls")) return;
    var box = document.createElement("div");
    box.id = "rsSplitControls";
    box.className = "rsSplitControls";
    box.innerHTML =
      '<button type="button" id="rsMorePassage" title="Phóng to bài đọc">◀ Bài đọc</button>' +
      '<button type="button" id="rsEqualSplit" title="Chia đều"><span id="rsSplitLabel">50 / 50</span></button>' +
      '<button type="button" id="rsMoreQuestions" title="Phóng to câu hỏi">Câu hỏi ▶</button>';
    topRight.insertBefore(box, topRight.firstChild);

    document.getElementById("rsMorePassage").onclick = function(){ setPct(64); };
    document.getElementById("rsEqualSplit").onclick = function(){ setPct(50); };
    document.getElementById("rsMoreQuestions").onclick = function(){ setPct(36); };
  }

  function makeDivider(split){
    if(!split || split.querySelector(":scope > .rsDivider")) return;
    var first = split.children[0], second = split.children[1];
    if(!first || !second) return;

    var divider = document.createElement("div");
    divider.className = "rsDivider";
    divider.setAttribute("role","separator");
    divider.setAttribute("aria-label","Kéo để thay đổi kích thước bài đọc và câu hỏi");
    divider.innerHTML = '<span>⋮</span>';
    split.insertBefore(divider, second);

    divider.addEventListener("pointerdown", function(ev){
      dragging = true;
      activeSplit = split;
      activeDivider = divider;
      divider.classList.add("dragging");
      document.body.classList.add("rsResizing");
      try{ divider.setPointerCapture(ev.pointerId); }catch(e){}
      ev.preventDefault();
    });
  }

  function setup(){
    var pct = savedPct();
    var test = document.querySelector(".readingStudio .rsSplit");
    if(test){
      test.id = test.id || "rsSplit";
      makeDivider(test);
      ensureControls();
      test.style.setProperty("--reading-left", pct + "%");
    }
    var review = document.querySelector(".readingReview .rrSplit");
    if(review){
      review.id = review.id || "rrSplit";
      makeDivider(review);
      review.style.setProperty("--reading-left", pct + "%");
    }
    setPct(pct);
  }

  window.addEventListener("pointermove", function(ev){
    if(!dragging || !activeSplit) return;
    var rect = activeSplit.getBoundingClientRect();
    var pct = ((ev.clientX - rect.left) / rect.width) * 100;
    setPct(pct);
  });

  window.addEventListener("pointerup", function(ev){
    if(!dragging) return;
    dragging = false;
    if(activeDivider){
      activeDivider.classList.remove("dragging");
      try{ activeDivider.releasePointerCapture(ev.pointerId); }catch(e){}
    }
    document.body.classList.remove("rsResizing");
    activeSplit = null;
    activeDivider = null;
  });

  var observer = new MutationObserver(function(){
    if(document.querySelector(".readingStudio .rsSplit") || document.querySelector(".readingReview .rrSplit")){
      setup();
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  setup();
})();