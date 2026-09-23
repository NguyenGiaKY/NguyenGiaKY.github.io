(function(){
"use strict";
// Free, locally-rendered English study notes. Never calls a language-model API.
// The optional ChatGPT hand-off requires a deliberate user click and manual paste.
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").trim().toLowerCase();
const cacheKey="gkyyy_dictionary_study_v1",TTL=1000*60*60*24*14;
let cache={};try{cache=JSON.parse(localStorage.getItem(cacheKey)||"{}")||{}}catch(e){}
const CUSTOM={
 harmful:{collocations:[["harmful effects","tác động có hại"],["harmful substances","chất độc hại"],["environmentally harmful","gây hại cho môi trường"]],
 family:[["harm","noun / verb","sự tổn hại / gây hại"],["harmful","adjective","có hại"],["harmless","adjective","vô hại"],["harmfully","adverb","theo cách gây hại"]],
 examples:["Air pollution is harmful to the environment.","Some chemicals can be harmful to wildlife."],
 pattern:"be harmful to + somebody / something",patternVi:"Gây hại cho ai hoặc điều gì."},
 access:{collocations:[["access to education","cơ hội tiếp cận giáo dục"],["improve access","cải thiện khả năng tiếp cận"],["have access to","có quyền / khả năng tiếp cận"]],
 family:[["access","noun / verb","sự tiếp cận / truy cập"],["accessible","adjective","có thể tiếp cận"],["accessibility","noun","khả năng tiếp cận"]],
 examples:["Online courses improve access to education.","Students need reliable internet access."],
 pattern:"access to + noun (n) / access + something (v)",patternVi:"Dùng access to khi access là danh từ; access trực tiếp với tân ngữ khi là động từ."},
 flexible:{collocations:[["flexible schedule","lịch trình linh hoạt"],["flexible working hours","giờ làm việc linh hoạt"],["remain flexible","duy trì sự linh hoạt"]],
 family:[["flex","verb","uốn cong"],["flexible","adjective","linh hoạt"],["flexibility","noun","sự linh hoạt"]],
 examples:["Online learning offers a flexible schedule.","Students need to remain flexible when plans change."],pattern:"be flexible about + something",patternVi:"Linh hoạt về một vấn đề."},
 flexibility:{collocations:[["greater flexibility","tính linh hoạt cao hơn"],["offer flexibility","mang lại sự linh hoạt"],["flexibility in learning","sự linh hoạt trong học tập"]],
 family:[["flexible","adjective","linh hoạt"],["flexibility","noun","sự linh hoạt"]],
 examples:["Online courses offer greater flexibility.","Flexibility in learning helps students manage their time."],pattern:"flexibility in + noun / flexibility to + verb",patternVi:"Sự linh hoạt trong việc gì; khả năng linh hoạt để làm gì."},
 improve:{collocations:[["improve access","cải thiện khả năng tiếp cận"],["improve performance","cải thiện hiệu quả"],["improve significantly","cải thiện đáng kể"]],
 family:[["improve","verb","cải thiện"],["improvement","noun","sự cải thiện"],["improved","adjective","được cải thiện"]],
 examples:["Regular practice can improve your English.","The programme aims to improve access to education."],pattern:"improve + noun / improve by + amount",patternVi:"Cải thiện điều gì; cải thiện thêm bao nhiêu."},
 benefit:{collocations:[["major benefit","lợi ích lớn"],["benefit from","hưởng lợi từ"],["bring benefits","mang lại lợi ích"]],
 family:[["benefit","noun / verb","lợi ích / mang lại lợi ích"],["beneficial","adjective","có lợi"],["beneficiary","noun","người hưởng lợi"]],
 examples:["Students benefit from regular feedback.","A major benefit of online learning is flexibility."],pattern:"benefit from + noun / be beneficial to + noun",patternVi:"Hưởng lợi từ; có lợi cho."},
 environment:{collocations:[["protect the environment","bảo vệ môi trường"],["natural environment","môi trường tự nhiên"],["environmental impact","tác động môi trường"]],
 family:[["environment","noun","môi trường"],["environmental","adjective","thuộc môi trường"],["environmentally","adverb","về mặt môi trường"]],
 examples:["Air pollution harms the environment.","Schools can teach students to protect the environment."],pattern:"protect / harm + the environment",patternVi:"Bảo vệ / gây hại cho môi trường."},
 responsible:{collocations:[["be responsible for","chịu trách nhiệm về"],["socially responsible","có trách nhiệm với xã hội"],["responsible behaviour","hành vi có trách nhiệm"]],
 family:[["responsible","adjective","có trách nhiệm"],["responsibility","noun","trách nhiệm"],["responsibly","adverb","một cách có trách nhiệm"]],
 examples:["Students are responsible for their own learning.","Governments are responsible for public services."],pattern:"be responsible for + noun / V-ing",patternVi:"Chịu trách nhiệm về việc gì."}
};
const posVi={noun:"danh từ",verb:"động từ",adjective:"tính từ",adverb:"trạng từ",preposition:"giới từ",conjunction:"liên từ",determiner:"từ hạn định",article:"mạo từ",pronoun:"đại từ",modal:"động từ khuyết thiếu",auxiliary:"trợ động từ"};
function defaultPattern(word,pos){
 if(pos==="adjective")return{en:"be + "+word+" / "+word+" + noun",vi:"Tính từ đứng sau be hoặc trước danh từ; kiểm tra giới từ đi kèm trong ví dụ."};
 if(pos==="verb")return{en:"subject + "+word+" (+ object)",vi:"Động từ đứng sau chủ ngữ; việc có tân ngữ phụ thuộc vào từng nghĩa."};
 if(pos==="noun")return{en:"determiner + "+word+" / verb + "+word,vi:"Danh từ có thể làm chủ ngữ, tân ngữ hoặc bổ ngữ."};
 if(pos==="adverb")return{en:"verb / adjective + "+word,vi:"Trạng từ bổ nghĩa cho động từ, tính từ hoặc cả câu tùy ngữ cảnh."};
 if(pos==="preposition")return{en:word+" + noun phrase",vi:"Giới từ đi cùng một cụm danh từ."};
 return null;
}
function cardHTML(d){
 const x=CUSTOM[norm(d.base)]||{};
 const pattern=x.pattern?{en:x.pattern,vi:x.patternVi}:defaultPattern(d.base,d.pos);
 const exampleSet=[d.example,...(x.examples||[])].filter(Boolean);
 if(!exampleSet.length&&d.context&&d.context.toLowerCase().includes(norm(d.surface)))exampleSet.push(d.context);
 const examples=[...new Set(exampleSet.map(s=>s.trim()))].slice(0,2);
 return '<section class="dictLearnPanel" aria-label="English study notes">'+
 '<div class="dictLearnHead"><div><small>VOCABULARY STUDY</small><h3>Hiểu và dùng từ</h3></div>'+
 '<button class="dictGPTButton" type="button">↗ Hỏi ChatGPT</button></div>'+
 (d.context?'<div class="dictLearnContext"><b>Trong bài đọc</b><p>'+esc(d.context.slice(0,240))+'</p></div>':'')+
 '<div class="dictLearnSection"><h4>Ví dụ thực tế</h4><div class="dictLearnExamples">'+
 (examples.length?examples.map(en=>'<div class="dictLearnExample"><p>'+esc(en)+'</p><span class="dictExampleTranslation" data-example="'+esc(en)+'">Đang dịch…</span></div>').join(''):'<p class="dictLearnMuted">Chưa có ví dụ đã kiểm chứng từ nguồn từ điển cho nghĩa này.</p>')+
 '</div></div>'+
 '<div class="dictLearnSection"><h4>Collocations</h4><div class="dictCollocations">'+
 (x.collocations?x.collocations.slice(0,3).map(c=>'<p><b>'+esc(c[0])+'</b><span>'+esc(c[1])+'</span></p>').join(''):'<p class="dictLearnMuted">Đang tìm cụm từ có dữ liệu sử dụng…</p>')+'</div></div>'+
 '<div class="dictLearnSection"><h4>Word family</h4><div class="dictFamilies">'+
 (x.family?x.family.slice(0,4).map(f=>'<p><b>'+esc(f[0])+'</b><i>'+esc(f[1])+'</i><span>'+esc(f[2])+'</span></p>').join(''):'<p class="dictLearnMuted">Đang kiểm tra các dạng từ liên quan…</p>')+'</div></div>'+
 (pattern?'<div class="dictLearnPattern"><h4>Cấu trúc khi viết / nói</h4><strong>'+esc(pattern.en)+'</strong><span>'+esc(pattern.vi)+'</span></div>':'')+
 '<p class="dictLearnDisclaimer">Gợi ý dựa trên từ điển và dữ liệu ngôn ngữ, không phải nội dung do ChatGPT tạo.</p>'+
 '<p class="dictGPTStatus" aria-live="polite"></p></section>';
}
async function translate(text){
 const k="tr:"+norm(text);if(cache[k]?.when>Date.now()-TTL)return cache[k].value;
 try{const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),3000);
  let res;try{res=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(text.slice(0,350))+"&langpair=en%7Cvi",{signal:ctrl.signal})}finally{clearTimeout(timer)}
  if(!res.ok)return"";const j=await res.json(),v=String(j?.responseData?.translatedText||"").trim();
  if(!v||v.toLowerCase()===text.trim().toLowerCase()||/MYMEMORY WARNING|TRANSLATION LIMIT/i.test(v))return"";
  cache[k]={when:Date.now(),value:v};persist();return v;
 }catch(e){return""}
}
function persist(){try{const keys=Object.keys(cache);if(keys.length>160)for(const key of keys.slice(0,keys.length-160))delete cache[key];localStorage.setItem(cacheKey,JSON.stringify(cache))}catch(e){}}
function stem(w){
 for(const suffix of ["fully","lessly","fulness","lessness","ibility","ability","ation","tion","sion","ment","ness","less","ful","able","ible","ive","ical","ally","ly","er","ing"]){
  if(w.endsWith(suffix)&&w.length-suffix.length>=3)return w.slice(0,-suffix.length)
 }
 return w;
}
async function relations(d,box){
 if(CUSTOM[norm(d.base)])return;
 const w=norm(d.base),pos=d.pos;
 if(!/^[a-z][a-z'-]{2,28}$/.test(w))return setUnavailable();
 const root=stem(w);
 const jobs=[];
 if(pos==="adjective")jobs.push(fetch("https://api.datamuse.com/words?rel_jjb="+encodeURIComponent(w)+"&max=10").then(r=>r.ok?r.json():[]).then(rows=>rows.filter(x=>/^[a-z]{3,}$/.test(x.word)).slice(0,3).map(x=>w+" "+x.word)));
 if(pos==="noun")jobs.push(fetch("https://api.datamuse.com/words?rel_jja="+encodeURIComponent(w)+"&max=10").then(r=>r.ok?r.json():[]).then(rows=>rows.filter(x=>/^[a-z]{3,}$/.test(x.word)).slice(0,3).map(x=>x.word+" "+w)));
 const familyCandidates=new Set([w,root,root+"ful",root+"less",root+"ness",root+"ly",root+"ment",root+"er",root+"able",root+"ive",root+"tion",root+"ation",root+"ity"]);
 const fJob=fetch("https://api.datamuse.com/words?sp="+encodeURIComponent(root+"*")+"&md=p&max=100").then(r=>r.ok?r.json():[]).then(rows=>rows.filter(x=>familyCandidates.has(x.word)&&x.word!==w).slice(0,4).map(x=>[x.word,(x.tags||[]).filter(t=>["n","v","adj","adv"].includes(t)).map(t=>({n:"noun",v:"verb",adj:"adjective",adv:"adverb"}[t])).join(" / ")||"related word"]));
 const collJob=jobs.length?jobs[0]:Promise.resolve([]);
 const [coll,family]=await Promise.allSettled([collJob,fJob]);
 if(!box.isConnected||box.dataset.dictToken!==d.token)return;
 const col=coll.status==="fulfilled"?coll.value:[];
 const fam=family.status==="fulfilled"?family.value:[];
 const collTarget=box.querySelector(".dictCollocations"),familyTarget=box.querySelector(".dictFamilies");
 if(collTarget)collTarget.innerHTML=col.length?col.map(phrase=>'<p><b>'+esc(phrase)+'</b></p>').join(""):'<p class="dictLearnMuted">Chưa có cụm từ được nguồn dữ liệu xác nhận cho từ này.</p>';
 if(familyTarget)familyTarget.innerHTML=fam.length?fam.map(f=>'<p><b>'+esc(f[0])+'</b><i>'+esc(f[1])+'</i></p>').join(""):'<p class="dictLearnMuted">Chưa tìm được dạng từ cùng họ được xác nhận.</p>';
 function setUnavailable(){const a=box.querySelector(".dictCollocations"),b=box.querySelector(".dictFamilies");if(a)a.innerHTML='<p class="dictLearnMuted">Chưa có dữ liệu.</p>';if(b)b.innerHTML='<p class="dictLearnMuted">Chưa có dữ liệu.</p>'}
}
function promptFor(d){
 return 'Hãy đóng vai gia sư tiếng Anh luyện IELTS cho người Việt. Giải thích từ "'+d.surface+'"'+(d.context?' trong câu: "'+d.context.slice(0,400)+'"':'')+'. Trình bày ngắn gọn, dễ đọc: 1. IPA và từ loại; 2. nghĩa tiếng Việt đúng ngữ cảnh kèm lý do; 3. hai câu ví dụ tiếng Anh với dịch tiếng Việt; 4. ba collocations tự nhiên và nghĩa; 5. word family có thật; 6. cấu trúc hữu ích cho IELTS Speaking/Writing. Tránh các thông tin ngoài chủ đề (bài hát, tên riêng). Nếu từ có nhiều nghĩa, tập trung nghĩa đang dùng trong câu.';
}
function bindGPT(box,d){
 const btn=box.querySelector(".dictGPTButton"),status=box.querySelector(".dictGPTStatus");if(!btn)return;
 btn.onclick=async()=>{
  const prompt=promptFor(d);let copied=false;
  try{await navigator.clipboard.writeText(prompt);copied=true}catch(e){
   const ta=document.createElement("textarea");ta.value=prompt;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
   try{copied=document.execCommand("copy")}catch(_){}ta.remove();
  }
  if(copied){status.textContent="Đã sao chép câu hỏi. Dán vào tab ChatGPT vừa mở (⌘V / Ctrl+V) để nhận giải thích thực sự từ ChatGPT.";}
  else{status.textContent="Trình duyệt chặn sao chép. Dùng ô bên dưới để sao chép rồi dán vào ChatGPT.";
   let input=box.querySelector(".dictGPTManual");if(!input){input=document.createElement("textarea");input.className="dictGPTManual";input.readOnly=true;box.appendChild(input)}input.value=prompt;input.focus();input.select();}
  window.open("https://chatgpt.com/","_blank","noopener,noreferrer");
 };
}
window.enrichDictionaryCard=function(target,input){
 const d={base:String(input.base||""),surface:String(input.surface||input.base||""),context:String(input.context||""),example:String(input.example||""),pos:String(input.partOfSpeech||""),token:input.requestToken};
 const box=document.createElement("div");box.className="dictRichMount";box.dataset.dictToken=d.token;
 const small=target.querySelector(".dictQuickSource");if(small)small.before(box);else target.appendChild(box);
 box.innerHTML=cardHTML(d);bindGPT(box,d);
 const xlate=box.querySelectorAll(".dictExampleTranslation");
 // Translate just the 1-2 examples displayed; results stay cached between lookups.
 xlate.forEach(async node=>{const v=await translate(node.dataset.example||"");
  if(box.isConnected&&box.dataset.dictToken===d.token)node.textContent=v?"→ "+v:"";});
 const runner=()=>relations(d,box).catch(()=>{
  for(const sel of [".dictCollocations",".dictFamilies"]){const el=box.querySelector(sel);if(el&&el.textContent.includes("Đang"))el.innerHTML='<p class="dictLearnMuted">Không kết nối được nguồn dữ liệu ở thời điểm này.</p>'}
 });
 if(window.requestIdleCallback)requestIdleCallback(runner,{timeout:1300});else setTimeout(runner,50);
};
})();