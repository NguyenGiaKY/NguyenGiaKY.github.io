/* A0 Foundation Visual Learning Studio: lightweight semantic SVG and browser-local exercises.
 * Uses no external libraries, media requests or paid speech API.
 * Deliberately separate from Foundation mastery and IELTS percentages.
 */
(function(){
"use strict";
const host=document.getElementById("foundationRoot"),pack=window.GKFoundationVisualData;
if(!host||!pack||!Array.isArray(pack.lessons))return;
const key="gk_foundation_visual_v1",byId=Object.fromEntries(pack.lessons.map(x=>[x.id,x]));
let stored={};try{stored=JSON.parse(localStorage.getItem(key)||"{}")||{}}catch(e){}
const records=stored.records||{},ui={id:null,scene:0,showHelp:false,status:""};
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify({records}));}catch(e){ui.status="Không lưu được dữ liệu: trình duyệt có thể đang chặn bộ nhớ cục bộ.";}};
function item(id){return records[id]||(records[id]={answers:{}});}
function circle(x,y,r,fill){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';}
const outline='#294d7f',violet='#6470c7',teal='#2f9b94',paper='#f3f7ff';
function base(content,description){
 return '<svg class="fv-illustration" viewBox="0 0 340 180" role="img" aria-label="'+esc(description)+'" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="2" y="2" width="336" height="176" rx="20" fill="#f3f7ff"/><circle cx="295" cy="30" r="33" fill="#e4edff"/><circle cx="37" cy="150" r="24" fill="#e5f5f1"/>'+content+'</svg>';
}
function sound(scene){
 const ship=scene.phrase.includes("ship"),cat=scene.phrase.includes("cat");
 let parts='<circle cx="94" cy="88" r="49" fill="#e3ebff" stroke="'+outline+'" stroke-width="2.5"/>'+
 '<path d="M83 69 Q66 71 70 90 Q75 105 91 101 M83 80 Q93 84 87 94" stroke="'+outline+'" stroke-width="5" stroke-linecap="round" fill="none"/>'+
 '<path d="M139 79 Q157 88 139 97 M150 67 Q180 88 150 110 M164 55 Q204 88 164 122" fill="none" stroke="'+teal+'" stroke-width="4" stroke-linecap="round"/>';
 if(cat)parts+='<g transform="translate(226 78)"><path d="M-35 -22 L-25 -47 L-9 -31 Q0 -36 9 -31 L25 -47 L35 -22 A37 37 0 1 1 -35 -22" fill="#f8d69c" stroke="'+outline+'" stroke-width="3"/>'+circle(-14,0,3,outline)+circle(14,0,3,outline)+'<path d="M-6 15 Q0 21 6 15" stroke="'+outline+'" stroke-width="3" fill="none"/></g>';
 else if(ship)parts+='<g transform="translate(233 86)"><path d="M-42 22 L40 22 L20 42 L-25 42Z" fill="#609ccb" stroke="'+outline+'" stroke-width="2"/><path d="M-5 -47 L-5 21 L30 21Z" fill="#fff" stroke="'+outline+'" stroke-width="2"/><path d="M-10 -43 L-10 18 L-35 18Z" fill="#c8dcf7" stroke="'+outline+'" stroke-width="2"/><path d="M-49 48 Q-25 37 0 48 Q25 59 51 48" stroke="#609ccb" fill="none" stroke-width="4"/></g>';
 else parts+='<g transform="translate(226 85)"><rect x="-40" y="-25" width="80" height="62" rx="12" fill="#fff" stroke="'+outline+'" stroke-width="2"/><path d="M-21 -7 H21 M-21 4 H10 M-21 15 H24" stroke="'+violet+'" stroke-linecap="round" stroke-width="4"/><path d="M-26 -25 L-26 -39 L-12 -25" fill="#b7c9f7"/></g>';
 return base(parts,"Hình minh họa nghe âm, nối cách phát âm với từ trong câu");
}
function person(x,y,scale,fill){
 return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+circle(0,-27,16,fill)+'<rect x="-21" y="-7" width="42" height="56" rx="19" fill="'+fill+'"/><path d="M-11 49 L-11 67 M11 49 L11 67" stroke="'+fill+'" stroke-width="11" stroke-linecap="round"/></g>';
}
function people(scene,index){
 const group=index===2;
 let g='<path d="M37 141 H307" stroke="#cfdbef" stroke-width="3" stroke-linecap="round"/>';
 if(group)g+=person(103,78,.76,'#4275b6')+person(171,78,.76,'#aa77ba')+person(239,78,.76,teal);
 else g+=person(132,72,.95,index===1?'#aa77ba':'#4275b6')+
 '<rect x="218" y="62" width="81" height="49" rx="14" fill="white" stroke="#bdd1f0" stroke-width="2"/>'+
 '<text x="259" y="92" text-anchor="middle" font-family="sans-serif" font-size="27" fill="'+outline+'" font-weight="bold">'+esc(index===1?"She":"I")+'</text>';
 return base(g,group?"Hình ba người minh họa đại từ they": "Hình một người với đại từ chỉ chủ ngữ");
}
function link(scene){
 const t=scene.tokens;
 const parts=[t[0],t[1],t.slice(2).join(" ")];
 const fills=['#e4ecff','#d8f4eb','#fff2d8'];
 let svg='';
 for(let i=0;i<3;i++){const x=12+i*111;svg+='<rect x="'+x+'" y="58" width="98" height="69" rx="13" fill="'+fills[i]+'" stroke="#b9cae0"/>'+
 '<text x="'+(x+49)+'" y="80" text-anchor="middle" font-size="11" font-family="sans-serif" font-weight="bold" fill="#6b7b98">'+["CHỦ NGỮ","TO BE","THÔNG TIN"][i]+'</text>'+
 '<text x="'+(x+49)+'" y="104" text-anchor="middle" font-size="19" font-family="sans-serif" font-weight="bold" fill="'+outline+'">'+esc(parts[i])+'</text>';
 if(i<2)svg+='<path d="M'+(x+99)+' 92 h11 m-6 -4 l5 4 -5 4" stroke="'+teal+'" fill="none" stroke-width="2.5"/>';}
 return base(svg,"Ba khối mũi tên nối chủ ngữ, động từ to be và thông tin về chủ ngữ");
}
function apple(x,y,scale){
 return '<g transform="translate('+x+' '+y+') scale('+scale+')"><path d="M0 -34 Q-6 -52 8 -56" stroke="#7f5c35" stroke-width="5" fill="none" stroke-linecap="round"/>'+
 '<path d="M3 -44 Q17 -54 31 -43 Q18 -33 3 -38" fill="#66ad72"/>'+
 '<path d="M0 -33 C-14 -48 -36 -38 -37 -12 C-39 17 -16 37 0 30 C16 37 39 17 37 -12 C36 -38 14 -48 0 -33Z" fill="#e56f6b" stroke="#c95758" stroke-width="2"/>'+
 '<ellipse cx="-17" cy="-15" rx="8" ry="14" fill="#fff" opacity=".22"/></g>';
}
function objects(scene,index){
 let svg='<path d="M48 145 H294" stroke="#d4dfed" stroke-width="3" stroke-linecap="round"/>';
 if(index===0)svg+=apple(170,91,1.1);
 else if(index===1)svg+=apple(112,96,.9)+apple(232,96,.9);
 else svg+='<g transform="translate(102 34)"><path d="M0 25 Q43 8 79 25 V115 Q43 100 0 115Z" fill="#72a5d3" stroke="'+outline+'" stroke-width="3"/><path d="M79 25 Q116 8 153 25 V115 Q116 100 79 115Z" fill="#dce6fb" stroke="'+outline+'" stroke-width="3"/><path d="M79 26 V114" stroke="'+outline+'" stroke-width="3"/><path d="M17 50 H60 M94 50 H135 M17 64 H62 M94 64 H134" stroke="#fff" stroke-width="3"/></g>';
 return base(svg,index===0?"Một quả táo":index===1?"Hai quả táo":"Một quyển sách đã xác định");
}
function calendar(scene,index){
 let g='<rect x="43" y="26" width="254" height="133" rx="15" fill="white" stroke="#bed0e7" stroke-width="2"/>'+
 '<path d="M44 58 H296" stroke="#b9cfea" stroke-width="2"/><path d="M86 23 v18 M255 23 v18" stroke="'+outline+'" stroke-width="7" stroke-linecap="round"/>';
 const days=['M','T','W','T','F','S','S'];
 days.forEach((d,i)=>{const x=66+i*35;g+='<text x="'+x+'" y="80" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#69809b">'+d+'</text>'+
 circle(x,108,12,i<5?'#d2ebea':'#e7edf8')+
 '<path d="M'+(x-5)+' 108 l3 4 l7 -8" stroke="'+(i<5?teal:'#adbed8')+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>';});
 g+='<text x="170" y="143" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="'+outline+'">every day · routine</text>';
 return base(g,"Lịch minh họa hành động thường xuyên ở nhiều ngày");
}
function question(scene,index){
 const label=["Do","Are","Where"][index];
 let g='<rect x="54" y="30" width="235" height="103" rx="25" fill="white" stroke="#aabfe4" stroke-width="3"/>'+
 '<path d="M85 132 L104 151 L119 132" fill="white" stroke="#aabfe4" stroke-width="3"/>'+
 circle(116,82,26,index===2?'#dff3eb':'#e5ebff')+
 '<text x="116" y="93" font-family="sans-serif" font-weight="bold" font-size="31" fill="'+outline+'" text-anchor="middle">?</text>'+
 '<text x="205" y="86" font-family="sans-serif" font-weight="bold" font-size="26" fill="'+outline+'" text-anchor="middle">'+label+'</text>'+
 '<text x="205" y="107" font-family="sans-serif" font-size="11" fill="#6684a7" text-anchor="middle">'+(index===2?"PLACE":"QUESTION")+'</text>';
 return base(g,"Ô thoại câu hỏi gồm từ hỏi và dấu chấm hỏi");
}
function diagram(scene,index){
 switch(scene.kind){case"ear":return sound(scene);case"people":return people(scene,index);case"link":return link(scene);case"apple":case"apples":case"book":return objects(scene,index);case"calendar":return calendar(scene,index);case"question":return question(scene,index);default:return base("","Sơ đồ minh họa bài học");}
}
function orderedOptions(id,i,options){
 // Stable rotation ensures the correct answer is not always option A, even after the panel re-renders.
 const shift=(Number(id.split("-")[1])+i)%options.length;
 return options.map((_,j)=>options[(j+shift)%options.length]);
}
function status(id){const r=item(id),count=Object.keys(r.answers||{}).length,total=byId[id]?.quiz.length||0,good=Object.values(r.answers||{}).filter(x=>x.correct).length;return {count,total,good};}
function lesson(id){
 const u=byId[id];if(!u)return"";
 const r=item(id),s=status(id),sceneIndex=ui.id===id?ui.scene:0,scene=u.scenes[sceneIndex];
 let h='<section class="fv-studio" aria-label="Bài học A0 trực quan"><div class="fv-heading"><div><span class="fv-kicker">A0 VISUAL LAB · HÌNH & TƯ DUY</span><h3>'+esc(u.title)+'</h3><p>'+esc(u.why)+'</p></div><span class="fv-progress">'+s.count+'/'+s.total+' câu đã thử</span></div>'+
 '<div class="fv-switch" role="group" aria-label="Chọn ví dụ minh họa">';
 u.scenes.forEach((x,i)=>{h+='<button type="button" data-fv-scene="'+i+'" aria-pressed="'+(i===sceneIndex)+'" class="'+(i===sceneIndex?"active":"")+'"><span>0'+(i+1)+'</span>'+esc(x.label)+'</button>';});h+='</div>'+
 '<div class="fv-scene"><div class="fv-picture">'+diagram(scene,sceneIndex)+'</div><div class="fv-explainer"><span class="fv-caption">NHÌN → HIỂU → NÓI</span><h4>'+esc(scene.phrase)+'</h4><p class="fv-translation">'+esc(scene.translation)+'</p>'+
 '<div class="fv-chips">'+scene.tokens.map((x,i)=>'<span class="'+(i===0?"first":"")+'">'+esc(x)+'</span>').join('<b aria-hidden="true">→</b>')+'</div>'+
 '<p class="fv-description">'+esc(scene.description)+'</p><div class="fv-sound"><button type="button" data-fv-audio="normal">▶ Nghe câu</button><button type="button" data-fv-audio="slow">🐢 Nghe chậm</button><small>Giọng đọc của thiết bị; không thay thế người hướng dẫn phát âm.</small></div></div></div>'+
 '<div class="fv-question-heading"><div><h4>Thử hiểu qua câu mới</h4><p>3 câu bổ sung, chấm ngay từng câu. Kết quả không tự đánh dấu Foundation hoàn thành.</p></div><span>'+s.good+'/'+s.total+' đúng đã ghi</span></div><div class="fv-practice">';
 u.quiz.forEach((q,i)=>{
  const answer=r.answers[i],done=!!answer;
  h+='<fieldset class="fv-question"><legend><span>Câu '+(i+1)+'</span> '+esc(q.prompt)+'</legend><div class="fv-options">';
  orderedOptions(id,i,q.options).forEach((option,j)=>{const selected=done&&option===answer.choice;
   h+='<button type="button" data-fv-answer="'+i+'" data-fv-option="'+j+'" '+(done?'disabled':'')+' aria-pressed="'+selected+'" class="'+(done?(option===q.correct?"correct":selected?"wrong":""):"")+'">'+esc(option)+'</button>';});
  h+='</div>';
  if(done)h+='<div class="fv-feedback '+(answer.correct?"ok":"retry")+'"><strong>'+(answer.correct?"✓ Đúng":"✗ Chưa đúng")+'</strong><p>'+esc(q.why)+'</p><small>Ví dụ: '+esc(q.example)+'</small></div>';
  h+='</fieldset>';
 });h+='</div><div class="fv-bottom"><span>Tiến độ minh họa: '+s.count+'/'+s.total+' câu đã thử · '+s.good+'/'+s.count+' câu đúng trong các câu đã thử.</span><button type="button" data-fv-reset="1">Làm lại phần trực quan</button></div>'+
 '<div class="fv-build-link"><div><strong>Muốn hiểu sâu hơn về cấu trúc?</strong><small>Mở Giải mã câu để chạm từng từ, xem vai trò và tự sắp xếp câu.</small></div><button type="button" data-f-tab="structure">Mở Sentence Builder →</button></div><p class="fv-status" id="foundationVisualSpeechStatus" role="status">'+esc(ui.status||"")+'</p></section>';
 return h;
}
function preview(){
 return '<div class="fv-home-banner"><div class="fv-home-icon" aria-hidden="true">◉ → Aa</div><div><strong>6 bài A0 đã có hình minh họa tương tác</strong><p>Hình ảnh → nghe chậm → phân tích từng phần → thử câu mới. Mở bài A0 đầu tiên để học từ số 0.</p></div><button type="button" data-fv-start="1">Học A0 bằng hình →</button></div>';
}
function renderPanel(){
 const panel=host.querySelector("#foundationVisualPanel");if(panel&&ui.id&&byId[ui.id])panel.innerHTML=lesson(ui.id);
}
function setCurrent(id){if(byId[id]){ui.id=id;ui.scene=0;ui.status="";}return lesson(id);}
function speak(text,slow){
 const statusNode=host.querySelector("#foundationVisualSpeechStatus");
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){if(statusNode)statusNode.textContent="Trình duyệt không hỗ trợ đọc tự động.";return;}
 try{window.speechSynthesis.cancel();const utter=new window.SpeechSynthesisUtterance(text);utter.lang="en-NZ";utter.rate=slow?.73:.91;
 const voices=window.speechSynthesis.getVoices?.()||[];
 utter.voice=voices.find(v=>/^en-(NZ|AU|GB)$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
 utter.onend=()=>{const el=host.querySelector("#foundationVisualSpeechStatus");if(el)el.textContent="Đã phát xong. Thử nhắc lại không nhìn chữ."};
 utter.onerror=()=>{const el=host.querySelector("#foundationVisualSpeechStatus");if(el)el.textContent="Không phát được âm thanh. Thử nút nghe trong bài Foundation gốc."};
 if(statusNode)statusNode.textContent=slow?"Đang đọc chậm...":"Đang đọc...";window.speechSynthesis.speak(utter);
 }catch(e){if(statusNode)statusNode.textContent="Không đọc được trên thiết bị này.";}
}
host.addEventListener("click",function(event){
 const button=event.target.closest("button");if(!button||!host.contains(button))return;
 if(button.dataset.fvScene!==undefined){const n=Number(button.dataset.fvScene);if(ui.id&&Number.isInteger(n)&&byId[ui.id]?.scenes[n]){ui.scene=n;ui.status="";renderPanel();}return;}
 if(button.dataset.fvAudio){const scene=byId[ui.id]?.scenes[ui.scene];if(scene)speak(scene.phrase.replace(/[→≠]/g,", "),button.dataset.fvAudio==="slow");return;}
 if(button.dataset.fvAnswer!==undefined){const u=byId[ui.id],qi=Number(button.dataset.fvAnswer),q=u?.quiz[qi],o=q&&orderedOptions(ui.id,qi,q.options)[Number(button.dataset.fvOption)];
 if(!q||!o)return;const r=item(ui.id),index=Number(button.dataset.fvAnswer);if(r.answers[index])return;
 r.answers[index]={choice:o,correct:o===q.correct,at:Date.now()};save();renderPanel();return;}
 if(button.dataset.fvReset){if(ui.id){item(ui.id).answers={};save();renderPanel();}return;}
 if(button.dataset.fvStart){if(typeof window.GKFoundationOpenLesson==="function")window.GKFoundationOpenLesson("a0-01");else{const first=host.querySelector('[data-f-id="a0-01"]');if(first)first.click();}return;}
});
window.GKFoundationVisual={render:setCurrent,preview,status,lessons:pack.lessons,getRecord:id=>item(id),open:id=>{if(byId[id]){ui.id=id;ui.scene=0;renderPanel();}}};
})();