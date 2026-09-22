(function(){
  "use strict";

  const STORE_KEY="gkyyy_highlights_v1";
  const COLORS=[
    {id:"yellow",hex:"#FFE783",label:"Keyword"},
    {id:"blue",hex:"#9ED0FF",label:"Số / thời gian"},
    {id:"green",hex:"#A9E8BE",label:"Tên / địa điểm"},
    {id:"pink",hex:"#FFB8D2",label:"Paraphrase"},
    {id:"orange",hex:"#FFC78A",label:"Distractor"},
    {id:"purple",hex:"#D7B7FF",label:"Grammar clue"},
    {id:"gray",hex:"#D8DEE8",label:"Chưa chắc"}
  ];
  const ROOT_SELECTOR=[
    ".q > b",
    "#script",
    ".lcEvidence",".lcWhy",".lcRule",
    ".feedback",
    ".rsPassageInner p",
    ".rsQHead b",
    ".rrPassageInner p",
    ".rrQuestionHead h2",
    ".rsStep p",
    ".rsStep blockquote",
    ".rsErrorDiagnosis p",
    ".rsFixRule"
  ].join(",");

  let data={};
  let undoStack=[];
  let currentRange=null;
  let applying=false;
  let observer=null;
  let restoreTimer=null;

  try{data=JSON.parse(localStorage.getItem(STORE_KEY)||"{}")||{};}catch(e){data={};}

  function save(){
    try{localStorage.setItem(STORE_KEY,JSON.stringify(data));}catch(e){}
  }
  function normalize(s){return String(s||"").replace(/\s+/g," ").trim();}
  function hash(str){
    let h=2166136261;
    str=String(str||"");
    for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function sessionKey(){
    if(window.__activeFlexTaskId)return "task:"+window.__activeFlexTaskId;
    const title=normalize(document.getElementById("lessonTitle")?.innerText||"lesson");
    return "lesson:"+hash(title);
  }
  function records(){
    const k=sessionKey();
    if(!Array.isArray(data[k]))data[k]=[];
    return data[k];
  }
  function eligibleRoot(node){
    if(!node)return null;
    let el=node.nodeType===3?node.parentElement:node;
    if(!el||!el.closest)return null;
    const root=el.closest(ROOT_SELECTOR);
    if(!root)return null;
    const body=document.getElementById("lessonBody");
    if(!body||!body.contains(root))return null;
    if(root.closest("input,textarea,button,select,[contenteditable='true']"))return null;
    return root;
  }
  function rootRole(root){
    if(root.matches("#script"))return "listening-script";
    if(root.matches(".q > b"))return "question";
    if(root.matches(".lcEvidence"))return "listening-evidence";
    if(root.matches(".lcWhy"))return "listening-error";
    if(root.matches(".lcRule"))return "listening-fix";
    if(root.matches(".rsPassageInner p"))return "reading-passage";
    if(root.matches(".rsQHead b"))return "reading-question";
    if(root.matches(".rrPassageInner p"))return "reading-review-passage";
    if(root.matches(".rrQuestionHead h2"))return "reading-review-question";
    if(root.matches(".rsStep blockquote"))return "reading-evidence";
    if(root.matches(".rsStep p"))return "reading-explanation";
    if(root.matches(".rsErrorDiagnosis p"))return "reading-error";
    if(root.matches(".rsFixRule"))return "reading-fix";
    return "feedback";
  }
  function signature(root){
    return rootRole(root)+":"+hash(normalize(root.textContent));
  }
  function textOffset(root,node,offset){
    const r=document.createRange();
    r.selectNodeContents(root);
    try{r.setEnd(node,offset);}catch(e){return null;}
    return r.toString().length;
  }
  function captureRange(range){
    if(!range||range.collapsed)return null;
    const a=eligibleRoot(range.startContainer),b=eligibleRoot(range.endContainer);
    if(!a||a!==b)return null;
    const start=textOffset(a,range.startContainer,range.startOffset);
    const end=textOffset(a,range.endContainer,range.endOffset);
    if(start===null||end===null||end<=start)return null;
    const full=a.textContent||"";
    const quote=full.slice(start,end);
    if(!quote.trim())return null;
    return {
      sig:signature(a),
      role:rootRole(a),
      start,end,
      quote,
      before:full.slice(Math.max(0,start-24),start),
      after:full.slice(end,end+24)
    };
  }
  function locateRoot(rec){
    const roots=[...document.querySelectorAll(ROOT_SELECTOR)].filter(x=>document.getElementById("lessonBody")?.contains(x));
    let root=roots.find(x=>signature(x)===rec.sig);
    if(root)return root;
    const candidates=roots.filter(x=>rootRole(x)===rec.role);
    root=candidates.find(x=>{
      const t=x.textContent||"";
      if(rec.quote&&!t.includes(rec.quote))return false;
      if(rec.before&&t.includes(rec.before+rec.quote))return true;
      if(rec.after&&t.includes(rec.quote+rec.after))return true;
      return !!rec.quote&&t.includes(rec.quote);
    });
    return root||null;
  }
  function resolveOffsets(root,rec){
    const t=root.textContent||"";
    if(rec.start>=0&&rec.end<=t.length&&t.slice(rec.start,rec.end)===rec.quote)return [rec.start,rec.end];
    let idx=-1;
    if(rec.before){
      const q=rec.before+rec.quote;
      const j=t.indexOf(q);
      if(j>=0)idx=j+rec.before.length;
    }
    if(idx<0&&rec.after){
      const q=rec.quote+rec.after;
      const j=t.indexOf(q);
      if(j>=0)idx=j;
    }
    if(idx<0&&rec.quote)idx=t.indexOf(rec.quote);
    return idx>=0?[idx,idx+rec.quote.length]:null;
  }
  function pointAt(root,offset){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        return node.parentElement?.closest(".gkHighlight")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_ACCEPT;
      }
    });
    let n,seen=0,last=null;
    while((n=walker.nextNode())){
      last=n;
      const next=seen+n.nodeValue.length;
      if(offset<=next)return {node:n,offset:Math.max(0,offset-seen)};
      seen=next;
    }
    return last?{node:last,offset:last.nodeValue.length}:null;
  }
  function makeRange(root,start,end){
    const a=pointAt(root,start),b=pointAt(root,end);
    if(!a||!b)return null;
    const r=document.createRange();
    try{r.setStart(a.node,a.offset);r.setEnd(b.node,b.offset);return r;}catch(e){return null;}
  }
  function unwrapHighlights(){
    document.querySelectorAll(".gkHighlight").forEach(span=>{
      const p=span.parentNode;
      while(span.firstChild)p.insertBefore(span.firstChild,span);
      span.remove();
      p?.normalize();
    });
  }
  function wrapRange(range,rec){
    if(!range||range.collapsed)return;
    const span=document.createElement("span");
    span.className="gkHighlight gkHL-"+rec.color;
    span.dataset.hlId=rec.id;
    span.title=(COLORS.find(c=>c.id===rec.color)||{}).label||"Highlight";
    try{
      range.surroundContents(span);
    }catch(e){
      try{
        const frag=range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }catch(_){}
    }
  }
  function restore(){
    if(applying)return;
    const body=document.getElementById("lessonBody");
    const overlay=document.getElementById("lessonOverlay");
    if(!body||!overlay?.classList.contains("open"))return;
    applying=true;
    try{
      unwrapHighlights();
      const list=records().slice().sort((a,b)=>{
        if(a.sig===b.sig)return b.start-a.start;
        return String(a.sig).localeCompare(String(b.sig));
      });
      for(const rec of list){
        const root=locateRoot(rec);
        if(!root)continue;
        const off=resolveOffsets(root,rec);
        if(!off)continue;
        const r=makeRange(root,off[0],off[1]);
        if(r)wrapRange(r,rec);
      }
    }finally{
      applying=false;
    }
  }
  function scheduleRestore(){
    clearTimeout(restoreTimer);
    restoreTimer=setTimeout(restore,120);
  }
  function snapshot(){
    undoStack.push(JSON.stringify(data));
    if(undoStack.length>25)undoStack.shift();
  }
  function addHighlight(color){
    const recBase=captureRange(currentRange);
    if(!recBase){toast("Hãy bôi đen một đoạn trong câu hỏi, passage, transcript hoặc phần chữa.");return;}
    snapshot();
    const list=records();
    const next=[];
    for(const old of list){
      if(old.sig!==recBase.sig||old.end<=recBase.start||old.start>=recBase.end)next.push(old);
    }
    next.push({
      ...recBase,
      id:"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),
      color
    });
    data[sessionKey()]=next;
    save();
    currentRange=null;
    try{window.getSelection()?.removeAllRanges();}catch(e){}
    restore();
  }
  function eraseSelection(){
    const r=captureRange(currentRange);
    if(!r){toast("Bôi đen phần muốn xóa highlight trước.");return;}
    snapshot();
    data[sessionKey()]=records().filter(x=>!(x.sig===r.sig&&x.start<r.end&&x.end>r.start));
    save();
    currentRange=null;
    try{window.getSelection()?.removeAllRanges();}catch(e){}
    restore();
  }
  function clearAll(){
    if(!records().length){toast("Task này chưa có highlight.");return;}
    if(!confirm("Xóa toàn bộ highlight trong task này?"))return;
    snapshot();
    data[sessionKey()]=[];
    save();restore();
  }
  function undo(){
    const last=undoStack.pop();
    if(!last){toast("Không còn thao tác để hoàn tác.");return;}
    try{data=JSON.parse(last)||{};}catch(e){return;}
    save();restore();
  }
  function toast(msg){
    let el=document.getElementById("gkHLToast");
    if(!el){el=document.createElement("div");el.id="gkHLToast";el.className="gkHLToast";document.body.appendChild(el);}
    el.textContent=msg;el.classList.add("show");
    clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1800);
  }
  function isStudySurface(){
    const overlay=document.getElementById("lessonOverlay");
    if(!overlay?.classList.contains("open"))return false;
    const body=document.getElementById("lessonBody");
    if(!body)return false;
    const id=String(window.__activeFlexTaskId||"").toUpperCase();
    return /^L|^R/.test(id)||!!body.querySelector(".listenPlayer,.readingStudio,.readingReview,.lcEvidence,.rsPassageInner");
  }
  function paletteHTML(){
    return '<div class="gkHLBarHead"><button id="gkHLToggle" type="button">🖍 Highlight</button><span class="gkHLHint">Bôi đen chữ → chọn màu</span></div>'+
      '<div class="gkHLColors">'+COLORS.map((c,i)=>
        '<button type="button" class="gkHLColor gkHL-'+c.id+'" data-hl-color="'+c.id+'" title="'+(i+1)+'. '+c.label+'"><span></span><small>'+c.label+'</small></button>'
      ).join("")+'</div>'+
      '<div class="gkHLActions"><button type="button" id="gkHLErase">⌫ Xóa màu</button><button type="button" id="gkHLUndo">↶ Undo</button><button type="button" id="gkHLClear">Xóa hết</button></div>';
  }
  function ensureToolbar(){
    let bar=document.getElementById("gkHighlighter");
    if(!bar){
      bar=document.createElement("aside");
      bar.id="gkHighlighter";
      bar.className="gkHighlighter";
      bar.innerHTML=paletteHTML();
      document.body.appendChild(bar);
      bar.querySelectorAll("[data-hl-color]").forEach(btn=>btn.onclick=()=>addHighlight(btn.dataset.hlColor));
      document.getElementById("gkHLErase").onclick=eraseSelection;
      document.getElementById("gkHLUndo").onclick=undo;
      document.getElementById("gkHLClear").onclick=clearAll;
      document.getElementById("gkHLToggle").onclick=()=>bar.classList.toggle("expanded");
    }
    bar.classList.toggle("visible",isStudySurface());
    return bar;
  }

  document.addEventListener("selectionchange",()=>{
    if(!isStudySurface())return;
    const sel=window.getSelection();
    if(!sel||sel.rangeCount===0||sel.isCollapsed)return;
    const r=sel.getRangeAt(0);
    if(captureRange(r))currentRange=r.cloneRange();
  });

  document.addEventListener("keydown",e=>{
    if(!isStudySurface()||e.metaKey||e.ctrlKey||e.altKey)return;
    if(/^[1-7]$/.test(e.key)&&currentRange){
      const c=COLORS[Number(e.key)-1];
      if(c){e.preventDefault();addHighlight(c.id);}
    }
  });

  function boot(){
    ensureToolbar();
    const body=document.getElementById("lessonBody");
    if(body&&!observer){
      observer=new MutationObserver(()=>{if(!applying){ensureToolbar();scheduleRestore();}});
      observer.observe(body,{childList:true,subtree:true,characterData:true});
    }
    const overlay=document.getElementById("lessonOverlay");
    if(overlay){
      const oo=new MutationObserver(()=>{ensureToolbar();if(overlay.classList.contains("open"))scheduleRestore();});
      oo.observe(overlay,{attributes:true,attributeFilter:["class"]});
    }
    scheduleRestore();
  }

  window.openStudyHighlighter=function(){
    const bar=ensureToolbar();
    bar.classList.add("visible","expanded");
    toast("Bôi đen chữ rồi chọn 1 trong 7 màu.");
  };
  window.restoreStudyHighlights=restore;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();