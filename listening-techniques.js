/* Listening Techniques Studio — focused IELTS practice, no paid API. */
(function(){
"use strict";
const KEY="gkyyy_listening_tech_v1";
const TASK_PACK={
  L1a:"sounds",L1b:"sounds",L1c:"sounds",
  L2a:"form",L2b:"figures",L2c:"form",
  L3a:"map",L3b:"distractors",L3c:"distractors",
  L4a:"opinions",L4b:"matching",L4c:"opinions",
  L5a:"lecture",L5b:"lecture",L5c:"lecture"
};
const PACKS={
 sounds:{
  part:"Foundation · Sound decoding",focus:"Nghe tên riêng, chính tả, nối âm và thông tin thay đổi",
  instructions:"Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
  segments:[
   {speaker:"Receptionist",text:"Hello, Westfield Language Centre. How can I help you?"},
   {speaker:"Student",text:"I'd like to register. My name is Maya Bennett. That's B E N N E T T."},
   {speaker:"Receptionist",text:"Thanks, Maya. Is your email address still maya at greenmail dot com?"},
   {speaker:"Student",text:"Not anymore. It's maya dot b at greenmail dot com. I changed it last week."},
   {speaker:"Receptionist",text:"And which class do you want? The Tuesday session starts at five, but the Thursday one starts at six thirty."},
   {speaker:"Student",text:"Thursday, please. I can only come after six."}
  ],
  questions:[
   {type:"fill",prompt:"Student's surname: ______",answer:"Bennett",seg:1,skill:"Spelling",evidence:"My name is Maya Bennett. That's B E N N E T T.",tip:"Listen to the final consonants and the letters spelled out."},
   {type:"fill",prompt:"New email username before @greenmail.com: ______",answer:"maya.b",aliases:["maya dot b"],seg:3,skill:"Self-correction",evidence:"It's maya dot b at greenmail dot com. I changed it last week.",tip:"The previous email is a distractor. Use the correction."},
   {type:"fill",prompt:"Chosen class day: ______",answer:"Thursday",seg:5,skill:"Tracking",evidence:"Thursday, please. I can only come after six.",tip:"Follow the student's final choice, not the first option."},
   {type:"fill",prompt:"Starting time of the chosen class: ______",answer:"6:30",aliases:["six thirty","6.30","6:30 pm"],seg:4,skill:"Numbers",evidence:"The Thursday one starts at six thirty.",tip:"Match Thursday to its starting time."}
  ]
 },
 form:{
  part:"Part 1 · Form completion",focus:"Predict answer type, detect corrections, check singular/plural",
  instructions:"Write ONE WORD AND/OR A NUMBER for each answer.",
  segments:[
   {speaker:"Agent",text:"Welcome to Riverside Cycle Hire. Are you booking for this weekend?"},
   {speaker:"Customer",text:"Yes. I need a bike for Saturday the twenty-fourth. Sorry, I mean Sunday the twenty-fifth."},
   {speaker:"Agent",text:"We have city bikes for eighteen dollars a day and mountain bikes for twenty-six dollars."},
   {speaker:"Customer",text:"I'll take the mountain bike. Does it come with a helmet?"},
   {speaker:"Agent",text:"Yes. A helmet is included, but you'll need to bring your own gloves."},
   {speaker:"Customer",text:"Great. My surname is Carter, C A R T E R."}
  ],
  questions:[
   {type:"fill",prompt:"Date of hire: Sunday ______",answer:"25",aliases:["25th"],seg:1,skill:"Self-correction",evidence:"Sorry, I mean Sunday the twenty-fifth.",tip:"Discard the first date after hearing a correction."},
   {type:"fill",prompt:"Type of bicycle: ______",answer:"mountain",seg:3,skill:"Paraphrase",evidence:"I'll take the mountain bike.",tip:"Only ONE WORD fits in the gap."},
   {type:"fill",prompt:"Daily price: $______",answer:"26",seg:2,skill:"Distractor",evidence:"Mountain bikes for twenty-six dollars.",tip:"Link the price to the selected type of bike."},
   {type:"fill",prompt:"Bring your own: ______",answer:"gloves",seg:4,skill:"Plural",evidence:"You'll need to bring your own gloves.",tip:"Notice the plural ending."},
   {type:"fill",prompt:"Customer's surname: ______",answer:"Carter",seg:5,skill:"Spelling",evidence:"My surname is Carter, C A R T E R.",tip:"Check every letter."}
  ]
 },
 figures:{
  part:"Part 1 · Numbers and dates",focus:"Phân biệt các con số gần nhau và đáp án được sửa lại",
  instructions:"Write ONE WORD AND/OR A NUMBER for each answer.",
  segments:[
   {speaker:"Clerk",text:"The beginner workshop usually costs forty-five dollars. This month it's thirty-five for students."},
   {speaker:"Student",text:"Perfect. I saw a leaflet saying it starts at nine fifteen."},
   {speaker:"Clerk",text:"That's an old leaflet. The new start time is nine fifty. Please arrive ten minutes earlier."},
   {speaker:"Student",text:"Is it in classroom fourteen?"},
   {speaker:"Clerk",text:"No, room forty. It's on the second floor."},
   {speaker:"Student",text:"And do I need to bring pencils or paper?"},
   {speaker:"Clerk",text:"We provide paper, but please bring two pencils."}
  ],
  questions:[
   {type:"fill",prompt:"Student fee: $______",answer:"35",seg:0,skill:"Distractor",evidence:"This month it's thirty-five for students.",tip:"The normal price is not the student fee."},
   {type:"fill",prompt:"Workshop starts at: ______",answer:"9:50",aliases:["nine fifty","9.50"],seg:2,skill:"Self-correction",evidence:"The new start time is nine fifty.",tip:"Ignore the time in the old leaflet."},
   {type:"fill",prompt:"Room number: ______",answer:"40",seg:4,skill:"Numbers",evidence:"No, room forty.",tip:"Distinguish fourteen from forty."},
   {type:"fill",prompt:"Bring two: ______",answer:"pencils",seg:6,skill:"Plural",evidence:"Please bring two pencils.",tip:"Check agreement with two."}
  ]
 },
 map:{
  part:"Part 2 · Map and directions",focus:"Theo dõi vị trí và từ chỉ hướng, không chọn dựa vào keyword",
  instructions:"Choose the correct location for each question.",
  map:true,
  segments:[
   {speaker:"Guide",text:"Welcome to the community centre. You're standing at the entrance on the south side."},
   {speaker:"Guide",text:"Go straight ahead and you'll reach reception in the middle of the ground floor."},
   {speaker:"Guide",text:"The small cafe is immediately to the left of reception. The equipment store is to its right."},
   {speaker:"Guide",text:"The art room used to be next to the cafe. It's now upstairs, directly above reception."},
   {speaker:"Guide",text:"The first-aid station is just behind reception, beside the stairs."}
  ],
  questions:[
   {type:"mcq",prompt:"Where is the cafe?",options:["To the left of reception","To the right of reception","Behind reception"],answer:0,seg:2,skill:"Directions",evidence:"The small cafe is immediately to the left of reception.",tip:"Use reception as your reference point."},
   {type:"mcq",prompt:"Where is the equipment store?",options:["To the left of reception","To the right of reception","Upstairs"],answer:1,seg:2,skill:"Directions",evidence:"The equipment store is to its right.",tip:"Its refers to reception."},
   {type:"mcq",prompt:"Where is the art room now?",options:["Next to the cafe","Behind the entrance","Above reception"],answer:2,seg:3,skill:"Self-correction",evidence:"It's now upstairs, directly above reception.",tip:"Used to describes an old location."},
   {type:"mcq",prompt:"What is beside the stairs?",options:["The first-aid station","The cafe","The equipment store"],answer:0,seg:4,skill:"Paraphrase",evidence:"The first-aid station is just behind reception, beside the stairs.",tip:"Follow the second location clue."}
  ]
 },
 distractors:{
  part:"Part 2 · Multiple choice",focus:"Differentiate answers, eliminate distractors, follow final meaning",
  instructions:"Choose ONE answer, A, B or C.",
  segments:[
   {speaker:"Host",text:"This year's local science festival has a few changes from last year."},
   {speaker:"Host",text:"We considered moving it to the university, and the sports hall was another option. But the library was chosen because it is easier to reach by public transport."},
   {speaker:"Host",text:"Some visitors told us the workshops were too long. However, our biggest problem was the lack of places in the most popular sessions."},
   {speaker:"Host",text:"This time, students will book online. We won't charge extra, and the talks will still be free."},
   {speaker:"Host",text:"The new evening talk was originally about robotics, but the speaker changed it to marine conservation."}
  ],
  questions:[
   {type:"mcq",prompt:"Why was the library chosen as the venue?",options:["It has larger rooms","It is easy to reach","It is cheaper to rent"],answer:1,seg:1,skill:"Distractor",evidence:"The library was chosen because it is easier to reach by public transport.",tip:"Several venues were considered; identify the reason for the final choice."},
   {type:"mcq",prompt:"What was the main problem last year?",options:["Workshops were too long","Tickets were too expensive","Popular sessions filled up"],answer:2,seg:2,skill:"Contrast",evidence:"However, our biggest problem was the lack of places in the most popular sessions.",tip:"However and biggest problem identify the speaker's priority."},
   {type:"mcq",prompt:"What must students do this year?",options:["Reserve a place online","Pay an additional fee","Attend an evening talk"],answer:0,seg:3,skill:"Paraphrase",evidence:"Students will book online. We won't charge extra.",tip:"Book online = reserve a place online."},
   {type:"mcq",prompt:"What is the evening talk about now?",options:["Robotics","Transport","Marine conservation"],answer:2,seg:4,skill:"Self-correction",evidence:"The speaker changed it to marine conservation.",tip:"Originally is a cue that the first answer may not be final."}
  ]
 },
 opinions:{
  part:"Part 3 · Academic discussion",focus:"Nhận diện người nói, ý kiến thay đổi và nguyên nhân chính",
  instructions:"Choose ONE answer, A, B or C.",
  segments:[
   {speaker:"Tutor",text:"So, Emma and Leo, how is your research proposal developing?"},
   {speaker:"Emma",text:"I wanted to study urban gardens. Leo thought it was too familiar, but I didn't agree with him at first."},
   {speaker:"Leo",text:"I was mainly worried that we'd already covered this in class. Then I read some new research and changed my mind."},
   {speaker:"Emma",text:"In the end, we switched to rooftop farming. Not because I disliked gardens, but because the new topic gives us better access to data."},
   {speaker:"Tutor",text:"That makes sense. For your presentation, I'm less concerned about the number of slides than about the clarity of your argument."},
   {speaker:"Leo",text:"We were going to interview farmers, but now we plan to compare published reports. It'll be more realistic in the time we have."}
  ],
  questions:[
   {type:"mcq",prompt:"Why did Emma change the topic?",options:["She lost interest in gardens","The new topic offers better data","Leo refused to study gardens"],answer:1,seg:3,skill:"Paraphrase",evidence:"Because the new topic gives us better access to data.",tip:"Not because cancels one tempting option."},
   {type:"mcq",prompt:"What happened to Leo's opinion?",options:["He became more positive about the original idea","He remained strongly opposed to it","He decided not to join the project"],answer:0,seg:2,skill:"Opinion change",evidence:"Then I read some new research and changed my mind.",tip:"Track views over time, not just the first opinion."},
   {type:"mcq",prompt:"What does the tutor value most?",options:["The number of slides","The clarity of the argument","The use of interviews"],answer:1,seg:4,skill:"Contrast",evidence:"I'm less concerned about the number of slides than about the clarity of your argument.",tip:"Less concerned about X than Y establishes the priority."},
   {type:"mcq",prompt:"How will the students collect evidence?",options:["Interview farmers","Run a lab experiment","Compare published reports"],answer:2,seg:5,skill:"Self-correction",evidence:"Now we plan to compare published reports.",tip:"Were going to signals an earlier plan, not the current one."}
  ]
 },
 matching:{
  part:"Part 3 · Matching speakers",focus:"Ai đưa ra ý nào? Phân biệt đề xuất và quyết định cuối",
  instructions:"Choose ONE answer for each speaker.",
  segments:[
   {speaker:"Tutor",text:"For your group project, tell me what each of you will focus on."},
   {speaker:"Daniel",text:"At first I wanted to design the questionnaire, but I would be more useful analysing the statistics."},
   {speaker:"Priya",text:"I enjoy data analysis too, but Daniel's stronger at that. I'll take responsibility for recruiting participants."},
   {speaker:"Mia",text:"I offered to contact participants, although we've now agreed I'll write the literature review."},
   {speaker:"Tutor",text:"Good. So Daniel handles statistical analysis, Priya recruits participants, and Mia reviews previous research."}
  ],
  questions:[
   {type:"mcq",prompt:"Daniel will...",options:["Recruit participants","Analyse statistics","Write the literature review"],answer:1,seg:1,skill:"Speaker tracking",evidence:"I would be more useful analysing the statistics.",tip:"The initial preference is not the agreed role."},
   {type:"mcq",prompt:"Priya will...",options:["Recruit participants","Analyse statistics","Write the literature review"],answer:0,seg:2,skill:"Speaker tracking",evidence:"I'll take responsibility for recruiting participants.",tip:"Match the final responsibility to the correct speaker."},
   {type:"mcq",prompt:"Mia will...",options:["Recruit participants","Analyse statistics","Write the literature review"],answer:2,seg:3,skill:"Self-correction",evidence:"We've now agreed I'll write the literature review.",tip:"Although introduces a contrast with her first offer."}
  ]
 },
 lecture:{
  part:"Part 4 · Academic lecture",focus:"Signposting + noun forms + tracking a lecture",
  instructions:"Write NO MORE THAN TWO WORDS for each answer.",
  segments:[
   {speaker:"Lecturer",text:"Today we're looking at urban heat islands, a term used when city areas are warmer than nearby countryside."},
   {speaker:"Lecturer",text:"Firstly, dark surfaces such as roads absorb more heat from sunlight than vegetation does."},
   {speaker:"Lecturer",text:"Another important factor is the shortage of trees. Trees provide shade and cool the air through evaporation."},
   {speaker:"Lecturer",text:"However, rising temperatures are not the only concern. High night-time temperatures can also affect people's sleep."},
   {speaker:"Lecturer",text:"Turning to possible solutions, some councils are installing green roofs on public buildings."},
   {speaker:"Lecturer",text:"Finally, researchers recommend monitoring changes with temperature sensors, rather than relying only on personal impressions."}
  ],
  questions:[
   {type:"fill",prompt:"Dark surfaces absorb more ______ from sunlight.",answer:"heat",seg:1,skill:"Prediction",evidence:"Dark surfaces such as roads absorb more heat from sunlight than vegetation does.",tip:"A mass noun is required after more."},
   {type:"fill",prompt:"Trees cool the air through ______.",answer:"evaporation",seg:2,skill:"Academic vocabulary",evidence:"Cool the air through evaporation.",tip:"Listen for the mechanism after through."},
   {type:"fill",prompt:"High night-time temperatures can affect people's ______.",answer:"sleep",seg:3,skill:"Contrast",evidence:"High night-time temperatures can also affect people's sleep.",tip:"However signals a shift from causes to effects."},
   {type:"fill",prompt:"One solution is to install ______ on buildings.",answer:"green roofs",seg:4,skill:"Signposting",evidence:"Some councils are installing green roofs on public buildings.",tip:"Turning to possible solutions locates this answer."},
   {type:"fill",prompt:"Researchers recommend using temperature ______.",answer:"sensors",seg:5,skill:"Plural",evidence:"Monitoring changes with temperature sensors.",tip:"Check the plural form and the noun phrase."}
  ]
 }
};
const escapeHTML=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let current=null;
let playToken=0;
function halt(){
 playToken++;
 if(typeof speechSynthesis!=="undefined"){try{speechSynthesis.cancel()}catch(e){}}
 if(current){current.playing=false;current.paused=false}
}
function voiceFor(speaker){
 if(typeof speechSynthesis==="undefined")return null;
 const voices=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang||""));
 if(!voices.length)return null;
 const list=voices.filter(v=>/en[-_]GB/i.test(v.lang||""));
 const pool=list.length>=2?list:voices;
 let n=0;for(let i=0;i<speaker.length;i++)n=(n+speaker.charCodeAt(i))%1000;
 return pool[n%pool.length];
}
function playPart(indices){
 const st=current;
 if(!st||typeof speechSynthesis==="undefined"||typeof SpeechSynthesisUtterance==="undefined"){
  const status=document.getElementById("ltStatus");
  if(status)status.textContent="Trình duyệt không hỗ trợ giọng đọc.";
  return;
 }
 halt();const token=playToken;
 st.playing=true;st.paused=false;
 let pos=0;
 function next(){
  if(playToken!==token)return;
  if(pos>=indices.length){st.playing=false;st.paused=false;refreshAudioButtons();return}
  const segment=st.pack.segments[indices[pos++]];
  const utterance=new SpeechSynthesisUtterance(segment.text);
  const voice=voiceFor(segment.speaker);
  if(voice){utterance.voice=voice;utterance.lang=voice.lang}else utterance.lang="en-GB";
  utterance.rate=st.mode==="exam"?1:st.rate;
  utterance.pitch=segment.speaker==="Lecturer"?1:(segment.speaker==="Agent"?0.96:1.02);
  utterance.onend=next;
  utterance.onerror=next;
  try{speechSynthesis.speak(utterance)}catch(e){st.playing=false;refreshAudioButtons()}
 }
 next();refreshAudioButtons();
}
function refreshAudioButtons(){
 const st=current;if(!st)return;
 const play=document.getElementById("ltPlay"),pause=document.getElementById("ltPause"),status=document.getElementById("ltStatus");
 if(play){play.disabled=st.playing||st.mode==="exam"&&st.played;play.textContent=st.mode==="exam"&&st.played?"✓ Đã phát một lần":"▶ "+(st.mode==="exam"?"Phát một lần":"Nghe toàn bài")}
 if(pause){pause.hidden=st.mode==="exam"||!st.playing;pause.textContent=st.paused?"▶ Tiếp tục":"⏸ Tạm dừng"}
 if(status)status.textContent=st.playing?(st.paused?"Đang tạm dừng":"Audio đang phát"):(st.mode==="exam"&&st.played?"Đã phát. Hãy nộp bài để xem transcript.":"Sẵn sàng");
}
function normalized(x){return String(x==null?"":x).trim().toLowerCase().replace(/[’']/g,"'").replace(/[.,]/g,"").replace(/\s+/g," ")}
function correct(q,value){
 if(q.type==="mcq")return Number(value)===q.answer;
 const v=normalized(value);return !!v&&[q.answer].concat(q.aliases||[]).some(a=>normalized(a)===v);
}
function correctText(q){return q.type==="mcq"?String.fromCharCode(65+q.answer)+". "+q.options[q.answer]:q.answer}
function diagnosis(q,value){
 if(!String(value==null?"":value).trim())return "Bỏ trống";
 if(q.type==="mcq")return q.skill||"Distractor";
 if(normalized(value).replace(/s$/,"")===normalized(q.answer).replace(/s$/,""))return "Singular / plural";
 return q.skill||"Listening accuracy";
}
function findHistory(id){
 try{const data=JSON.parse(localStorage.getItem(KEY)||"{}");return (data[id]||[]).slice(-1)[0]||null}catch(e){return null}
}
function persist(id,summary){
 try{const data=JSON.parse(localStorage.getItem(KEY)||"{}");data[id]=(data[id]||[]).slice(-19);data[id].push(summary);localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}
}
function questionsHTML(st){
 return st.pack.questions.map((q,i)=>{
  const val=st.responses[i],crossed=st.crossed[i]||[];
  let h='<div class="ltQuestion"><div class="ltQuestionTop"><strong>Question '+(i+1)+'</strong><span>'+escapeHTML(q.skill)+'</span></div><p>'+escapeHTML(q.prompt)+'</p>';
  if(st.mode==="learning"&&!st.graded&&q.type==="fill")h+='<label class="ltPredict">Dự đoán loại từ (không chấm)<input data-predict="'+i+'" value="'+escapeHTML(st.prediction[i]||"")+'" placeholder="noun / number / plural..."></label>';
  if(q.type==="mcq"){
   h+='<div class="ltChoices">'+q.options.map((op,k)=>{
    const isCrossed=crossed.includes(k),isSelected=Number(val)===k;
    return '<div class="ltChoiceRow"><button type="button" class="ltPick '+(isSelected?"ltSelected ":"")+(isCrossed?"ltCrossed":"")+'" data-pick="'+i+':'+k+'" '+(st.graded?"disabled":"")+'><b>'+String.fromCharCode(65+k)+'</b><span>'+escapeHTML(op)+'</span></button><button type="button" class="ltEliminate '+(isCrossed?"ltActive":"")+'" data-strike="'+i+':'+k+'" title="Loại trừ đáp án" aria-label="Loại trừ đáp án '+String.fromCharCode(65+k)+'" '+(st.graded?"disabled":"")+'>×</button></div>'
   }).join("")+'</div>';
  }else h+='<input class="ltAnswer" data-answer="'+i+'" value="'+escapeHTML(val||"")+'" placeholder="Your answer" '+(st.graded?"disabled":"")+'>';
  if(st.graded){
   const ok=correct(q,val),a=q.type==="mcq"?(val==null?"Bỏ trống":String.fromCharCode(65+Number(val))):String(val||"Bỏ trống");
   h+='<div class="ltFeedback '+(ok?"ltCorrect":"ltWrong")+'"><b>'+(ok?"✓ Correct":"✕ Incorrect")+'</b><div>Your answer: '+escapeHTML(a)+'</div><div><strong>Correct: '+escapeHTML(correctText(q))+'</strong></div><p><b>Evidence:</b> '+escapeHTML(q.evidence)+'</p><p><b>Fix:</b> '+escapeHTML(q.tip)+'</p><button class="btn" type="button" data-clip="'+q.seg+'">🔊 Nghe đoạn chứa đáp án</button></div>'
  }
  return h+"</div>"
 }).join("");
}
function render(){
 const st=current;if(!st)return;
 const host=document.getElementById("lessonBody");if(!host)return;
 const old=findHistory(st.id);
 let h='<div class="ltStudio"><div class="ltIntro"><div><span class="ltEyebrow">'+escapeHTML(st.pack.part)+'</span><h3>'+escapeHTML(st.pack.focus)+'</h3><p>Prediction → Listen → Check → Evidence → Fix → Review</p></div><span class="ltLabel">Technique Studio</span></div>';
 if(st.reviewTask){
  h+='<div class="ltGuide"><strong>'+escapeHTML(st.id==="L6b"?"Deep correction":"Redo wrong questions")+'</strong><p>'+escapeHTML(st.id==="L6b"?"Mở Error Lab để xem bằng chứng, phát lại đoạn sai và hoàn thành Fix Pack theo từng lỗi nghe.":"Ôn lại những câu đã sai trong Error Lab. Hoàn thành bài Retry mà không nhìn đáp án trước.")+'</p><button class="btn primary" data-errors="1">Mở Error Lab →</button><button class="btn" data-finish="1">✓ Hoàn thành task</button></div></div>';
  host.innerHTML=h;return;
 }
 h+='<div class="ltMode"><div><b>Chế độ</b><p>Exam: một lần, không pause · Learning: nghe lại có mục đích</p></div><div class="ltModeButtons"><button type="button" class="btn '+(st.mode==="exam"?"primary":"")+'" data-mode="exam" '+(st.playing?"disabled":"")+'>Exam Mode</button><button type="button" class="btn '+(st.mode==="learning"?"primary":"")+'" data-mode="learning" '+(st.playing?"disabled":"")+'>Learning Mode</button></div></div>';
 h+='<div class="ltPlayer"><div class="ltPlayerLine"><b>🎧 '+escapeHTML(st.pack.part)+'</b><span id="ltStatus">Sẵn sàng</span></div><div class="ltPlayerActions"><button type="button" id="ltPlay" class="btn primary" data-play="1">▶ Phát audio</button><button type="button" id="ltPause" class="btn" data-pause="1" hidden>⏸ Tạm dừng</button>';
 if(st.mode==="learning")h+='<label>Tốc độ <select id="ltRate"><option value="0.85" '+(st.rate===0.85?"selected":"")+'>0.85×</option><option value="1" '+(st.rate===1?"selected":"")+'>1.0×</option><option value="1.15" '+(st.rate===1.15?"selected":"")+'>1.15×</option></select></label>';
 h+='</div><small>Audio mô phỏng bằng giọng đọc của trình duyệt; chưa phải bản thu IELTS thật. Exam Mode khóa phát lại trong lần làm bài.</small></div>';
 if(st.pack.map)h+='<div class="ltMap"><b>Sơ đồ tham chiếu (ground floor)</b><div class="ltMapGrid"><span>CAFE</span><span>RECEPTION</span><span>STORE</span><span> </span><span>ENTRANCE (south)</span><span> </span></div><small>Giữ hướng nhìn từ lối vào để theo dõi lời hướng dẫn.</small></div>';
 h+='<div class="ltInstructions">'+escapeHTML(st.pack.instructions)+'</div>';
 if(old)h+='<p class="ltPrevious">Lần gần nhất: '+escapeHTML(old.score)+'/'+escapeHTML(old.total)+' · '+escapeHTML(old.mode==="exam"?"Exam":"Learning")+'</p>';
 h+=questionsHTML(st);
 if(!st.graded)h+='<div class="ltActions"><button class="btn primary" data-submit="1">Chấm & phân tích đáp án</button></div>';
 else{
  h+='<div class="ltSummary"><strong>Result: '+st.lastScore+'/'+st.pack.questions.length+'</strong><p>Câu sai được chuyển sang Error Lab. Nghe lại đúng đoạn chưa hiểu rồi thử lại mà không nhìn transcript.</p></div>';
  h+='<div class="ltTranscript"><h3>Transcript · chỉ hiện sau khi nộp bài</h3>'+st.pack.segments.map((s,i)=>'<div class="ltTranscriptRow"><strong>'+escapeHTML(s.speaker)+'</strong><p>'+escapeHTML(s.text)+'</p><button class="btn" data-clip="'+i+'">▶ Đoạn '+(i+1)+'</button></div>').join("")+'</div>';
  h+='<div class="ltActions"><button class="btn" data-retry="1">↻ Thử lại</button><button class="btn" data-errors="1">🧠 Error Lab</button><button class="btn primary" data-finish="1">✓ Hoàn thành task</button></div>';
 }
 h+='</div>';
 host.innerHTML=h;
 refreshAudioButtons();
}
function grade(){
 const st=current;if(!st||st.graded)return;
 halt();
 st.graded=true;
 st.lastScore=0;
 st.pack.questions.forEach((q,i)=>{
  const v=st.responses[i],ok=correct(q,v);
  if(ok)st.lastScore++;
  else if(typeof window.recordLearningError==="function"){
   window.recordLearningError({skill:"listening",task:st.title+" · "+st.pack.part,question:q.prompt,
    userAnswer:q.type==="mcq"?(v==null?"Bỏ trống":String.fromCharCode(65+Number(v))+". "+q.options[Number(v)]):String(v||"Bỏ trống"),
    correctAnswer:correctText(q),why:"Evidence: "+q.evidence,rule:q.tip,evidence:q.evidence,errorType:diagnosis(q,v)});
  }
 });
 const result={at:Date.now(),score:st.lastScore,total:st.pack.questions.length,mode:st.mode};
 persist(st.id,result);
 if(typeof window.recordTaskPerformance==="function")window.recordTaskPerformance({
  kind:"listening technique",score:result.score,total:result.total,errors:result.total-result.score,
  note:st.id+" · "+st.pack.part+" · "+st.mode
 });
 render();
}
function finish(){
 const st=current;if(!st)return;
 if(typeof window.finishListeningStudioTask==="function")window.finishListeningStudioTask(st.id);
 halt();
 const closer=document.getElementById("lessonClose");if(closer)closer.click();
}
function handler(e){
 if(!current)return;
 const button=e.target.closest("button");
 if(!button||!document.getElementById("lessonBody").contains(button))return;
 const st=current;
 if(button.dataset.mode){
  halt();st.mode=button.dataset.mode;st.played=false;render();return;
 }
 if(button.dataset.play){
  if(st.mode==="exam"&&st.played)return;
  st.played=true;
  playPart(st.pack.segments.map((_,i)=>i));return;
 }
 if(button.dataset.pause){
  if(typeof speechSynthesis==="undefined")return;
  if(st.paused){speechSynthesis.resume();st.paused=false}else{speechSynthesis.pause();st.paused=true}
  refreshAudioButtons();return;
 }
 if(button.dataset.pick){
  const [i,k]=button.dataset.pick.split(":").map(Number);
  if(!st.graded){st.responses[i]=k;st.crossed[i]=(st.crossed[i]||[]).filter(x=>x!==k);render()}return;
 }
 if(button.dataset.strike){
  const [i,k]=button.dataset.strike.split(":").map(Number);
  if(!st.graded){const a=st.crossed[i]||[];st.crossed[i]=a.includes(k)?a.filter(x=>x!==k):a.concat(k);if(st.responses[i]===k)st.responses[i]=null;render()}return;
 }
 if(button.dataset.submit){grade();return}
 if(button.dataset.clip!=null){
  if(st.graded||st.mode==="learning")playPart([Number(button.dataset.clip)]);
  return;
 }
 if(button.dataset.retry){halt();st.graded=false;st.played=false;st.responses={};st.crossed={};st.prediction={};render();return}
 if(button.dataset.errors){
  halt();const closer=document.getElementById("lessonClose");if(closer)closer.click();
  if(typeof window.show==="function")window.show("errors");
  if(typeof window.renderErrorCenter==="function")window.renderErrorCenter();return;
 }
 if(button.dataset.finish){finish()}
}
function open(task){
 halt();
 const id=task&&task.id;
 if(!id)return false;
 const reviewTask=id==="L6b"||id==="L6c";
 const pack=PACKS[TASK_PACK[id]];
 if(!pack&&!reviewTask)return false;
 current={id,title:task.title||id,pack:pack||null,reviewTask,mode:"learning",rate:1,graded:false,played:false,playing:false,paused:false,responses:{},prediction:{},crossed:{},lastScore:0};
 const overlay=document.getElementById("lessonOverlay"),title=document.getElementById("lessonTitle");
 if(!overlay||!title)return false;
 title.innerHTML='<div class="phase">LISTENING · '+escapeHTML(id)+'</div><h2>'+escapeHTML(current.title)+'</h2>';
 overlay.classList.add("open");document.body.style.overflow="hidden";
 render();return true;
}
window.openListeningStudioTask=open;
document.addEventListener("click",handler);
document.addEventListener("input",e=>{
 if(!current||current.graded)return;
 const n=e.target.dataset;
 if(n.answer!=null)current.responses[Number(n.answer)]=e.target.value;
 if(n.predict!=null)current.prediction[Number(n.predict)]=e.target.value;
});
document.addEventListener("change",e=>{
 if(current&&e.target.id==="ltRate")current.rate=Number(e.target.value)||1;
});
document.getElementById("lessonClose")?.addEventListener("click",()=>{halt();current=null});
window.addEventListener("pagehide",halt);
})();
