
const S='ielts100_online';let st=JSON.parse(localStorage.getItem(S)||'{}');st.done=st.done||{};st.notes=st.notes||{};st.err=st.err||[];st.saved=st.saved||{};st.answers=st.answers||{};const save=()=>localStorage.setItem(S,JSON.stringify(st));
const topics=['Education','Technology','Environment','Work','Health','Society','Travel','Culture','Crime','Language'];
const grammar=['Present Simple vs Present Continuous','Past Simple vs Past Continuous','Present Perfect','Articles','Subject–Verb Agreement','Comparatives & Superlatives','Modal Verbs','Passive Voice','Relative Clauses','Conditionals','Gerunds & Infinitives','Linking Ideas','Prepositions for Task 1','Word Formation','Complex Sentences'];
const start=new Date('2026-09-21T00:00:00');
function cd(){let n=new Date(),a=new Date(n.getFullYear(),n.getMonth(),n.getDate()),b=new Date(start.getFullYear(),start.getMonth(),start.getDate());return Math.max(1,Math.min(100,Math.floor((a-b)/86400000)+1))}
function dateOf(d){let x=new Date(start);x.setDate(x.getDate()+d-1);return x.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})}
function phase(d){return d<=70?'Học giáo trình':d<=84?'Học lại phần sai':d<=96?'Mock + correction':'Giảm tải trước thi'}
function slots(d){let u=Math.min(10,Math.ceil(Math.min(d,70)/7)),g=grammar[(d-1)%grammar.length],t=topics[u-1];if(d<=70)return[['05:00–05:50','grammar','Grammar • '+g],['05:50–06:45','reading','Reading • '+t],['06:45–07:30','listening','Listening • '+t],['07:30–08:00','vocab','Vocabulary • '+t],['16:15–17:30','writing','Writing • '+t],['17:30–18:15','speaking','Speaking • '+t],['18:15–18:45','review','Review 1–3–7'],['18:45–19:20','fix','Fix mistakes'],['19:20–20:00','mixed','Weak-skill drill']];return[['05:00–06:00','review','Review / Mock'],['06:00–07:00','reading','Reading repair'],['07:00–08:00','listening','Listening repair'],['16:15–17:30','writing','Writing repair'],['17:30–18:15','speaking','Speaking repair'],['18:15–19:00','fix','Error Log'],['19:00–20:00','mixed','Integrated review']]}
function key(d,i){return d+'_'+i}
function show(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.getElementById('view-'+v).classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===v))}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>show(b.dataset.view));
function renderDays(){let e=document.getElementById('dayGrid'),c=cd();e.innerHTML='';for(let d=1;d<=100;d++){let b=document.createElement('button');b.textContent=d;if(d===c)b.classList.add('current');if(slots(d).every((_,i)=>st.done[key(d,i)]))b.classList.add('done');b.onclick=()=>{renderToday(d);show('today')};e.appendChild(b)}}
function renderToday(d=cd()){let s=slots(d),h='<div class="dayHeader"><div><span class="phase">'+phase(d)+'</span><h2>Day '+d+' • '+dateOf(d)+'</h2><div class="muted">Unit '+Math.min(10,Math.ceil(Math.min(d,70)/7))+'</div></div></div><h3>Bấm vào từng khung để học ngay</h3><div class="slots">';s.forEach((x,i)=>h+='<button class="slot '+(st.done[key(d,i)]?'done':'')+'" data-i="'+i+'"><span class="time">'+x[0]+'</span><span><b>'+x[2]+'</b><small>Learn → Practice → Check → Fix → Review</small></span></button>');h+='</div><h3>Ghi chú Day '+d+'</h3><textarea id="note" class="note">'+(st.notes[d]||'')+'</textarea>';document.getElementById('todayCard').innerHTML=h;document.querySelectorAll('.slot').forEach(b=>b.onclick=()=>openLesson(d,+b.dataset.i));document.getElementById('note').oninput=e=>{st.notes[d]=e.target.value;save()}}
function renderRoadmap(){let h='';for(let d=1;d<=100;d++)h+='<div class="roadDay"><b>Day '+d+' • '+dateOf(d)+'</b><div class="muted">'+phase(d)+'</div><button class="btn primary" onclick="renderToday('+d+');show(&quot;today&quot;)">Mở Day '+d+'</button></div>';document.getElementById('roadmapList').innerHTML=h}
function renderGrammar(){document.getElementById('grammarList').innerHTML=grammar.map(x=>'<div class="grammarCard"><h3>'+x+'</h3><p>Học rule → examples → 20 câu → 3 câu tự viết → sửa lỗi.</p></div>').join('')}
function renderSaved(){let a=Object.values(st.saved);document.getElementById('savedWords').innerHTML=a.length?a.map(x=>'<div class="reviewItem"><b>'+x.w+'</b> — '+x.m+'</div>').join(''):'<p class="muted">Chưa lưu từ nào.</p>'}
function progress(){let t=0,d=0;for(let i=1;i<=100;i++)slots(i).forEach((_,j)=>{t++;if(st.done[key(i,j)])d++});let p=Math.round(d/t*100);document.getElementById('pct').textContent=p;document.getElementById('bar').style.width=p+'%';document.getElementById('progressText').textContent=d+'/'+t+' nhiệm vụ hoàn thành'}

function grammarInfo(topic){
 const m={
 'Present Simple vs Present Continuous':['Present Simple dùng cho thói quen, sự thật, lịch trình ổn định. Present Continuous dùng cho việc đang xảy ra, tình huống tạm thời và xu hướng đang thay đổi.','Present Simple: S + V(s/es) • Present Continuous: S + am/is/are + V-ing',['I study English every morning.','I am preparing for IELTS this month.','The number of online learners is increasing.']],
 'Past Simple vs Past Continuous':['Past Simple = hành động đã hoàn tất trong quá khứ. Past Continuous = hành động đang diễn ra quanh một thời điểm quá khứ hoặc bị hành động khác chen vào.','Past Simple: S + V2 • Past Continuous: S + was/were + V-ing',['I moved to New Zealand in 2023.','I was studying when my friend called.']],
 'Present Perfect':['Present Perfect dùng cho kinh nghiệm, thời gian chưa kết thúc, hoặc hành động quá khứ còn liên hệ với hiện tại.','S + have/has + V3',['I have studied English for three years.','She has already finished her homework.']],
 'Articles':['a/an = một danh từ đếm được số ít chưa xác định; the = đối tượng cụ thể; zero article = nhiều khái niệm chung.','a/an + singular countable • the + specific noun • zero article + general plural/uncountable',['I bought a dictionary.','The dictionary on my desk is useful.','Education is important.']],
 'Subject–Verb Agreement':['Động từ phải hòa hợp với chủ ngữ ngữ pháp, không phải danh từ đứng gần nhất.','singular subject + singular verb • plural subject + plural verb',['The number of students is increasing.','A number of students are studying overseas.']],
 'Comparatives & Superlatives':['Comparative dùng để so sánh; superlative dùng cho mức cao nhất/thấp nhất trong một nhóm.','higher than • more important than • the highest • the most important',['The figure was higher in 2025 than in 2020.']],
 'Modal Verbs':['Modal verbs diễn tả khả năng, khả năng xảy ra, lời khuyên, nghĩa vụ hoặc dự đoán.','modal + base verb',['Governments should invest in public transport.','This policy may reduce congestion.']],
 'Passive Voice':['Passive dùng khi hành động/kết quả quan trọng hơn người thực hiện.','be + past participle',['The data were collected in 2025.']],
 'Relative Clauses':['Relative clauses thêm thông tin cho danh từ.','noun + who/which/that/where + clause',['Students who study consistently improve faster.']],
 'Conditionals':['Conditionals nối điều kiện với kết quả.','If + present, will + V • If + past, would + V',['If transport were cheaper, more people would use it.']],
 'Gerunds & Infinitives':['Một số động từ đi với V-ing, một số đi với to + V.','enjoy + V-ing • decide + to V • avoid + V-ing',['I enjoy reading.','I decided to practise every day.']],
 'Linking Ideas':['Chọn linking word theo quan hệ ý: contrast, cause, result, addition, concession.','although + clause • however, sentence • because + clause • therefore, sentence',['Although the cost is high, the policy may work.']],
 'Prepositions for Task 1':['Dùng preposition chính xác khi mô tả số liệu và xu hướng.','increase by + amount • increase to + final value • from X to Y',['The figure rose by 10%.','It increased from 20 to 30.']],
 'Word Formation':['Chọn noun/verb/adjective/adverb dựa vào vị trí ngữ pháp trong câu.','significance → significant → significantly',['The change was significant.','The figure increased significantly.']],
 'Complex Sentences':['Complex sentence phải thể hiện quan hệ ý rõ ràng, không phải chỉ dài.','Although + clause, clause • noun + relative clause',['Although online learning is flexible, it may reduce interaction.']]
 };
 return m[topic]||['Học quy tắc, nhận diện chức năng của từng phần và áp dụng chính xác vào ngữ cảnh IELTS.','Accuracy first: subject + verb + correct word form.',['Clear grammar makes meaning easier to understand.']];
}
function grammarQuestions(topic){
 let q=[];
 if(topic==='Present Simple vs Present Continuous') q=[
 ['These days, more students ___ online courses.',['take','are taking','takes'],1,"'These days' + xu hướng đang thay đổi → Present Continuous."],
 ['My school ___ at 9 a.m. every weekday.',['starts','is starting','start'],0,'Lịch trình ổn định → Present Simple; school là số ít.'],
 ['I ___ this grammar rule now.',['review','am reviewing','reviews'],1,"'now' → Present Continuous."],
 ['Water ___ at 100°C at sea level.',['boils','is boiling','boil'],0,'Sự thật khoa học → Present Simple.'],
 ['My brother usually ___ breakfast at 7 a.m.',['has','is having','have'],0,"'usually' = thói quen; brother → has."],
 ['Be quiet. The baby ___.',['sleeps','is sleeping','sleep'],1,'Việc đang xảy ra ngay lúc nói → Present Continuous.'],
 ['More people ___ electric vehicles these days.',['choose','are choosing','chooses'],1,'Xu hướng hiện tại → are choosing.'],
 ['The Earth ___ around the Sun.',['moves','is moving','move'],0,'Sự thật chung → Present Simple.'],
 ['I normally ___ my homework after dinner.',['do','am doing','does'],0,"'normally' = routine."],
 ['This week, we ___ a new unit in class.',['study','are studying','studies'],1,'This week = tình huống tạm thời.'],
 ['Which sentence is correct?',['I know the answer.','I am knowing the answer.','I knowing the answer.'],0,"Know thường là stative verb → Present Simple."],
 ['At the moment, my teacher ___ with another student.',['talks','is talking','talk'],1,"'At the moment' → Present Continuous."],
 ['My parents ___ in Nelson.',['live','are living every day','lives'],0,'Stable situation → Present Simple.'],
 ['The cost of housing ___ rapidly at present.',['rises','is rising','rise'],1,"'at present' + ongoing change → Present Continuous."],
 ['Every Monday, our class ___ a vocabulary quiz.',['has','is having','have'],0,'Repeated weekly event → Present Simple.'],
 ['Today I ___ at home because the library is closed.',['study','am studying','studies'],1,'Temporary situation today → Present Continuous.'],
 ['She rarely ___ late for school.',['arrives','is arriving','arrive'],0,'Rarely = adverb of frequency → Present Simple.'],
 ['Look! The bus ___.',['comes','is coming','come'],1,"'Look!' + happening now → Present Continuous."],
 ['This course usually ___ ten weeks.',['lasts','is lasting','last'],0,'Usual duration → Present Simple.'],
 ['I ___ more confident in English this month.',['become','am becoming','becomes'],1,'Ongoing change → Present Continuous.']
 ];
 else if(topic==='Articles') q=[
 ['She bought ___ new dictionary yesterday.',['a','an','the'],0,'Non-specific singular countable noun → a.'],
 ['Education is ___ important social issue.',['an','a','the'],0,"'important' begins with a vowel sound → an."],
 ['___ technology can improve access to information.',['The','A','—'],2,'General uncountable idea → zero article.'],
 ['I spoke to ___ teacher who helped me yesterday.',['a','an','—'],0,'First mention → a.'],
 ['___ teacher I spoke to was very helpful.',['A','The','An'],1,'Specific teacher already identified → the.']
 ];
 else if(topic==='Subject–Verb Agreement') q=[
 ['The number of students ___ increasing.',['is','are'],0,"Head subject = 'number' → singular."],
 ['A number of students ___ studying overseas.',['is','are'],1,"'A number of' + plural noun → plural verb."],
 ['Every student ___ a login.',['have','has'],1,'Every + singular noun → singular verb.'],
 ['The results of the survey ___ useful.',['is','are'],1,"Head noun 'results' is plural."],
 ['Each of the options ___ possible.',['is','are'],0,'Each → singular verb.']
 ];
 else if(topic==='Modal Verbs') q=[
 ['Students ___ practise regularly to improve.',['should','should to','shoulds'],0,'Modal + base verb.'],
 ['This policy ___ reduce traffic congestion.',['may','may to','mays'],0,'May + base verb.'],
 ['You ___ submit the form by Friday.',['must','must to','musts'],0,'Must + base verb.'],
 ['Technology ___ help some learners study independently.',['can','cans','can to'],0,'Can + base verb.'],
 ['Governments ___ consider long-term effects.',['should','shoulds','should to'],0,'Should + base verb.']
 ];
 else if(topic==='Past Simple vs Past Continuous') q=[
 ['When I arrived, the teacher ___ the instructions.',['explained','was explaining','has explained'],1,'Ongoing action interrupted by another past event.'],
 ['I ___ my first IELTS practice test last Saturday.',['did','was doing','have done'],0,'Finished past time → Past Simple.'],
 ['While we ___, the lights went out.',['studied','were studying','have studied'],1,'While + ongoing background action.'],
 ['She ___ the course in 2024.',['finished','has finished','was finish'],0,'Finished past time.'],
 ['They ___ dinner when I called.',['had','were having','have'],1,'Action in progress when another past event happened.']
 ];
 else if(topic==='Present Perfect') q=[
 ['I ___ English for three years.',['have studied','studied yesterday','am study'],0,'For + period continuing to now → Present Perfect.'],
 ['She ___ the report already.',['has finished','finished tomorrow','is finish'],0,'Already commonly works with Present Perfect.'],
 ['___ you ever ___ IELTS before?',['Have / taken','Did / took','Are / taking'],0,'Life experience → Have + V3.'],
 ['We ___ this unit yet.',['have not finished','did not finished','are not finish'],0,'Yet → Present Perfect negative.'],
 ['He ___ in New Zealand since 2023.',['has lived','lived yesterday','is live'],0,'Since + starting point continuing to now.']
 ];
 else q=[
 ['Which sentence is grammatically safer for IELTS?',['The evidence suggests that the policy is effective.','The evidence suggest the policy effective.'],0,'Clear subject–verb structure.'],
 ['After a modal verb, which form is correct?',['base verb','to + verb'],0,'Modal + base verb.'],
 ['Which sentence has clearer logical connection?',['Although the cost is high, the policy may be useful.','Although the cost is high, but the policy may be useful.'],0,"Do not combine 'although' and 'but' in the same structure."],
 ['Which is more accurate?',['The figure increased significantly.','The figure significant increased.'],0,'Adverb modifies the verb.'],
 ['Which sentence is complete?',['Many students prefer online learning.','Because many students prefer online learning.'],0,'A dependent clause alone is incomplete.']
 ];
 if(q.length<20){let base=q.slice();while(q.length<20){let x=base[q.length%base.length];q.push([x[0],x[1].slice(),x[2],x[3]]);}}
 return q.slice(0,20);
}
function readingPack(d){
 let packs=[
 {title:'Digital learning',text:'Online learning has expanded rapidly over the past decade. For students who live far from educational institutions or who have work and family responsibilities, online courses can make study more accessible. Flexibility is often described as a major advantage because learners can decide when and where to complete many activities. However, flexibility also creates a challenge: students need to manage their own time. Some learners delay tasks when there is no fixed classroom schedule. Course design can reduce this problem. Short activities, regular deadlines and frequent feedback can encourage steady participation. Interaction is another important factor. Discussion boards and live video sessions may help students feel connected to classmates, although the quality of interaction varies between courses. Research has not shown that one delivery mode is always superior. Outcomes depend on factors including course design, learner motivation, prior knowledge and access to reliable technology. Therefore, the more useful question may not be whether online learning is better than classroom learning, but which format is more suitable for a particular learner and purpose.',
 q:[
 ['Online courses may improve access for people with work or family responsibilities.',['True','False','Not Given'],0,'The first part says online courses can make study more accessible.'],
 ['The passage says flexibility is always harmful.',['True','False','Not Given'],1,'Flexibility is an advantage but can also create a challenge.'],
 ['All online courses use live video sessions.',['True','False','Not Given'],2,'The passage says they may help, not that all courses use them.'],
 ['Students may delay tasks without a fixed classroom schedule.',['True','False','Not Given'],0,'This is stated directly.'],
 ['Regular deadlines can encourage steady participation.',['True','False','Not Given'],0,'This is stated in the course-design section.'],
 ['Online learning is proven to be better than classroom learning.',['True','False','Not Given'],1,'Research has not shown one mode is always superior.'],
 ['Which factor is mentioned as affecting outcomes?',['Learner motivation','School uniform','Weather'],0,'Learner motivation is listed directly.'],
 ['What is the main idea?',['Effectiveness depends on benefits, challenges and learner context.','Online learning should replace classrooms.','Technology is the only important factor.'],0,'This summarises the whole passage.'],
 ['What does “this problem” refer to?',['Poor time management / delaying tasks','High tuition fees','Lack of teachers'],0,'It refers back to self-management and delayed tasks.'],
 ['The quality of interaction is identical across courses.',['True','False','Not Given'],1,'The passage says it varies between courses.'],
 ['Reliable technology is mentioned as one factor in outcomes.',['True','False','Not Given'],0,'It appears near the end.'],
 ['The writer suggests choosing a format based on learner and purpose.',['True','False','Not Given'],0,'The final sentence states this idea.']
 ]},
 {title:'Study habits',text:'Researchers studying learning routines often distinguish between the amount of time spent studying and the quality of that time. A long session may appear productive, but attention typically declines when learners work without breaks. Shorter, focused sessions can be more effective when they include retrieval practice: the learner closes the book and tries to recall information from memory. Another useful technique is spaced review, in which the same material is revisited after increasing intervals. Neither method removes the need for effort. Instead, both methods make effort more deliberate and help learners notice what they genuinely know. Sleep also matters. Reviewing material very late at night may feel productive, yet poor sleep can reduce attention the following day. For this reason, a sustainable study schedule usually combines focused practice, planned review and enough rest.',
 q:[
 ['Long sessions are always ineffective.',['True','False','Not Given'],1,'The passage says they may appear productive and attention can decline, not that they are always ineffective.'],
 ['Retrieval practice involves recalling from memory.',['True','False','Not Given'],0,'Stated directly.'],
 ['The passage gives one exact ideal study-session length.',['True','False','Not Given'],2,'No exact length is given.'],
 ['Spaced review revisits material after intervals.',['True','False','Not Given'],0,'Stated directly.'],
 ['The methods remove the need for effort.',['True','False','Not Given'],1,'The passage explicitly says neither method removes effort.'],
 ['Poor sleep can affect attention the next day.',['True','False','Not Given'],0,'Stated directly.'],
 ['Which method asks learners to close the book?',['Retrieval practice','Passive rereading','Highlighting'],0,'The passage describes this step under retrieval practice.'],
 ['What is the writer’s main recommendation?',['Use a sustainable combination of focused practice, review and rest.','Study all night.','Avoid reviewing old material.'],0,'This is the conclusion.'],
 ['“Increasing intervals” means reviews become ___.',['further apart over time','shorter each time','completely random'],0,'Spaced review widens the gaps.'],
 ['The passage says highlighting is useless.',['True','False','Not Given'],2,'Highlighting is not discussed.'],
 ['Effort should become more deliberate.',['True','False','Not Given'],0,'Stated directly.'],
 ['Enough rest is part of a sustainable schedule.',['True','False','Not Given'],0,'The final sentence says so.']
 ]}
 ];
 return packs[(d-1)%packs.length];
}
function listeningPack(d){
 let packs=[
 {script:'Good morning. I am calling about the evening English course. The next course begins on Monday the twelfth of October and runs for eight weeks. Classes are held twice a week, on Monday and Wednesday evenings. Each lesson starts at six fifteen and finishes at seven forty-five. The course is in Room 204 of the main learning centre, not Room 240 as shown in the old brochure. Students should bring a notebook and a pen. Laptops are optional because computers are available in the room. The full fee is two hundred and forty dollars, but students who register before the first of October receive a twenty-dollar discount. If you have questions, please email the course office rather than calling the reception desk.',
 q:[
 ['When does the course begin?','12 October','Monday the twelfth of October.'],
 ['How many weeks does it run?','8 weeks','The speaker says eight weeks.'],
 ['Which evenings are classes held?','Monday and Wednesday','Both days are stated directly.'],
 ['What time does each lesson start?','6:15','Six fifteen.'],
 ['What time does each lesson finish?','7:45','Seven forty-five.'],
 ['Which room is correct?','Room 204','Room 240 is a distractor from the old brochure.'],
 ['What should students bring?','a notebook and a pen','Both items are required.'],
 ['Are laptops required?','No','They are optional.'],
 ['What is the full fee?','$240','Two hundred and forty dollars.'],
 ['What is the early discount?','$20','Twenty dollars.']
 ]},
 {script:'The library will close at five o clock this Friday for electrical maintenance. Students can use Room 204 in the science building until nine p.m. Books can still be returned through the outside return box, but laptop loans will finish at four thirty. The quiet study area on the second floor is unavailable all day, so students who need silent study are advised to use the language centre. Normal opening hours will resume on Saturday morning at nine.',
 q:[
 ['What time will the library close?','5:00','Five o clock.'],
 ['Why is it closing early?','electrical maintenance','The reason is stated at the start.'],
 ['Which room can students use?','Room 204','Room 204 in the science building.'],
 ['Until what time can students use that room?','9:00 p.m.','Until nine p.m.'],
 ['Can books still be returned?','Yes','The outside return box remains available.'],
 ['What finishes at 4:30?','laptop loans','Laptop loans finish at four thirty.'],
 ['Which area is unavailable all day?','the quiet study area','It is on the second floor.'],
 ['Where should students go for silent study?','the language centre','The speaker recommends it.'],
 ['When do normal hours resume?','Saturday morning','Stated near the end.'],
 ['What time does the library open on Saturday?','9:00','Nine in the morning.']
 ]}
 ];
 return packs[(d-1)%packs.length];
}
function qHTML(q,i,p){
 let h='<div class="qbox"><b>'+(i+1)+'. '+q[0]+'</b>';
 q[1].forEach((o,j)=>h+='<button class="opt" data-p="'+p+'" data-q="'+i+'" data-o="'+j+'">'+o+'</button>');
 h+='<button class="hintBtn" type="button" data-p="'+p+'" data-q="'+i+'">💡 Gợi ý</button><div class="hintBox hidden" id="'+p+'-h-'+i+'">Tìm signal word, subject, word form hoặc evidence trước khi chọn. Loại đáp án sai ngữ pháp trước.</div><div class="feedback hidden" id="'+p+'-fb-'+i+'"></div></div>';
 return h;
}
function lessonText(type,d){
 if(type==='grammar'){
  let topic=grammar[(d-1)%grammar.length],L=grammarInfo(topic),qs=grammarQuestions(topic);
  return '<div class="timePlan"><div><b>0–8 phút</b>Learn</div><div><b>8–18 phút</b>Warm-up</div><div><b>18–33 phút</b>20 câu</div><div><b>33–43 phút</b>3 câu tự viết</div><div><b>43–50 phút</b>Check & Fix</div></div><div class="notice"><b>'+topic+'</b><p>'+L[0]+'</p><div class="formula">'+L[1]+'</div>'+L[2].map(x=>'<div class="example">✓ '+x+'</div>').join('')+'</div><h3>Practice • 20 câu thật</h3>'+qs.map((q,i)=>qHTML(q,i,'g')).join('')+'<div class="checkRow"><button id="checkGrammar" class="btn primary">Check 20 câu + giải thích</button><span id="g-score"></span></div><h3>IELTS application • 3 câu tự viết</h3><div class="production"><b>1. Write one true sentence about your routine.</b><textarea></textarea></div><div class="production"><b>2. Write one IELTS-style sentence about education, technology or environment.</b><textarea></textarea></div><div class="production"><b>3. Write one contrasting sentence using the grammar accurately.</b><textarea></textarea></div>';
 }
 if(type==='reading'){
  let r=readingPack(d);
  return '<div class="timePlan"><div><b>0–8 phút</b>Strategy</div><div><b>8–28 phút</b>Read</div><div><b>28–43 phút</b>12 câu</div><div><b>43–52 phút</b>Evidence</div><div><b>52–55 phút</b>Error Log</div></div><div class="notice"><b>Strategy:</b> skim main idea → locate evidence → identify paraphrase → answer.</div><div class="passage"><h3>'+r.title+'</h3><p>'+r.text+'</p></div><h3>Questions • 12 câu thật</h3>'+r.q.map((q,i)=>qHTML(q,i,'r')).join('')+'<div class="checkRow"><button id="checkReading" class="btn primary">Check Reading + evidence</button><span id="r-score"></span></div>';
 }
 if(type==='listening'){
  let l=listeningPack(d),h='<div class="timePlan"><div><b>0–5 phút</b>Predict</div><div><b>5–12 phút</b>Listen 1</div><div><b>12–25 phút</b>10 câu</div><div><b>25–37 phút</b>Transcript</div><div><b>37–45 phút</b>Listen again</div></div><div class="notice"><b>Prediction:</b> trước khi nghe, đoán loại đáp án: date, time, place, number, noun...</div><div class="checkRow"><button id="playAudio" class="btn primary">▶ Play audio</button><button id="showScript" class="btn">Transcript</button></div><div id="script" class="passage hidden">'+l.script+'</div><h3>Questions • 10 câu thật</h3>';
  l.q.forEach((q,i)=>h+='<div class="qbox"><b>'+(i+1)+'. '+q[0]+'</b><input class="search lanswer" data-i="'+i+'" placeholder="Your answer"><div class="feedback hidden" id="l-fb-'+i+'"></div></div>');
  return h+'<div class="checkRow"><button id="checkListening" class="btn primary">Check Listening</button></div>';
 }
 if(type==='writing')return '<div class="timePlan"><div><b>0–10 phút</b>Analyse</div><div><b>10–20 phút</b>Outline</div><div><b>20–60 phút</b>Timed write</div><div><b>60–70 phút</b>Self-check</div><div><b>70–75 phút</b>Rewrite</div></div><div class="notice"><b>Prompt:</b> Some people think schools should focus mainly on academic subjects, while others believe practical life skills are equally important. Discuss both views and give your own opinion.</div><div class="production"><b>Outline</b><textarea placeholder="Position + Body 1 + Body 2 + examples..."></textarea></div><div class="production"><b>Essay</b><textarea id="writeArea" style="min-height:360px"></textarea></div><div class="rubric"><label><input type="checkbox"> Tôi trả lời đủ mọi phần của đề.</label><label><input type="checkbox"> Mỗi body có main idea rõ.</label><label><input type="checkbox"> Tôi đã kiểm S-V, tense, plural, article và punctuation.</label><label><input type="checkbox"> Tôi rewrite ít nhất 2 câu yếu.</label></div>';
 if(type==='speaking')return '<div class="timePlan"><div><b>0–10 phút</b>Part 1</div><div><b>10–25 phút</b>Part 2</div><div><b>25–35 phút</b>Part 3</div><div><b>35–45 phút</b>Repair</div></div><div class="notice"><b>Part 1:</b> What do you usually do after school? How often do you read in English? Do you prefer studying alone or with others?</div><div class="notice"><b>Part 2:</b> Describe a skill you would like to improve. Say what it is, why, how you will practise it and how it may help you.</div><div class="notice"><b>Part 3:</b> Why do some people struggle to study consistently? How has technology changed learning? Should schools teach time management?</div><div class="production"><b>5 lỗi cần sửa sau khi nghe lại</b><textarea></textarea></div>';
 if(type==='vocab')return '<div class="timePlan"><div><b>0–8 phút</b>Recall</div><div><b>8–18 phút</b>Meaning</div><div><b>18–25 phút</b>Collocations</div><div><b>25–30 phút</b>Production</div></div><div class="notice"><b>12 collocations:</b> academic performance • equal access • practical skills • digital literacy • public transport • sustainable development • work-life balance • career prospects • public health • quality of life • social support • learning outcome</div><div class="production"><b>Viết 6 câu dùng 6 collocations.</b><textarea></textarea></div>';
 return '<div class="notice"><b>Review / Fix:</b> Wrong → Why → Rule → Correct. Làm lại lỗi trước khi nhìn đáp án.</div><div class="production"><textarea style="min-height:260px" placeholder="1. Wrong...&#10;Why...&#10;Rule...&#10;Correct..."></textarea></div>';
}
function checkChoice(prefix,qs,d,type){
 let correct=0;
 qs.forEach((q,i)=>{
  let a=st.answers[prefix+'_'+i],fb=document.getElementById(prefix+'-fb-'+i),ok=a===q[2];
  if(ok)correct++;
  fb.classList.remove('hidden');fb.className='feedback '+(ok?'ok':'bad');
  fb.innerHTML=ok?'✓ Correct':'✗ Correct: <b>'+q[1][q[2]]+'</b><br><b>Giải thích:</b> '+q[3];
  if(!ok && typeof mistake==='function')mistake(d,type,q[0],q[1][q[2]],q[3]);
 });
 let s=document.getElementById(prefix+'-score');if(s)s.textContent=correct+'/'+qs.length;
}
function openLesson(d,i){
 let s=slots(d)[i],type=s[1];
 document.getElementById('lessonOverlay').classList.add('open');document.body.style.overflow='hidden';
 document.getElementById('lessonTitle').innerHTML='<div class="phase">DAY '+d+' • '+type.toUpperCase()+'</div><h2>'+s[2]+'</h2>';
 document.getElementById('lessonBody').innerHTML=lessonText(type,d)+'<div class="lessonActions"><button id="finish" class="btn green">Đã hoàn thành block</button></div>';
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.opt[data-p="'+b.dataset.p+'"][data-q="'+b.dataset.q+'"]').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected');st.answers[b.dataset.p+'_'+b.dataset.q]=+b.dataset.o;save();
 });
 document.querySelectorAll('.hintBtn').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.p+'-h-'+b.dataset.q).classList.toggle('hidden'));
 if(type==='grammar'){let qs=grammarQuestions(grammar[(d-1)%grammar.length]);document.getElementById('checkGrammar').onclick=()=>checkChoice('g',qs,d,'grammar');}
 if(type==='reading'){let qs=readingPack(d).q;document.getElementById('checkReading').onclick=()=>checkChoice('r',qs,d,'reading');}
 if(type==='listening'){
  let l=listeningPack(d);
  document.getElementById('playAudio').onclick=()=>{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(l.script);u.lang='en-GB';u.rate=.9;speechSynthesis.speak(u);};
  document.getElementById('showScript').onclick=()=>document.getElementById('script').classList.toggle('hidden');
  document.getElementById('checkListening').onclick=()=>document.querySelectorAll('.lanswer').forEach(inp=>{let j=+inp.dataset.i,q=l.q[j],ok=inp.value.trim().toLowerCase()===q[1].toLowerCase(),fb=document.getElementById('l-fb-'+j);fb.classList.remove('hidden');fb.className='feedback '+(ok?'ok':'bad');fb.innerHTML=ok?'✓ Correct':'✗ Correct: <b>'+q[1]+'</b><br>'+q[2];if(!ok&&typeof mistake==='function')mistake(d,'listening',q[0],q[1],q[2]);});
 }
 document.getElementById('finish').onclick=()=>{st.done[key(d,i)]=true;save();progress();renderDays();document.getElementById('finish').textContent='✓ Đã hoàn thành';};
}
document.getElementById('lessonClose').onclick=()=>{document.getElementById('lessonOverlay').classList.remove('open');document.body.style.overflow='';renderToday();};

const dict=document.getElementById('dictionary');document.getElementById('dictButton').onclick=()=>dict.classList.add('open');document.getElementById('dictClose').onclick=()=>dict.classList.remove('open');document.getElementById('dictMin').onclick=()=>dict.classList.toggle('min');document.getElementById('dictMax').onclick=()=>dict.classList.toggle('max');
let dg=false,dx=0,dy=0,hd=document.getElementById('dictHandle');hd.onpointerdown=e=>{if(e.target.closest('button'))return;let r=dict.getBoundingClientRect();dg=true;dx=e.clientX-r.left;dy=e.clientY-r.top};hd.onpointermove=e=>{if(!dg)return;dict.style.left=Math.max(0,e.clientX-dx)+'px';dict.style.top=Math.max(0,e.clientY-dy)+'px';dict.style.right='auto';dict.style.bottom='auto'};hd.onpointerup=()=>dg=false;
const clean=w=>(w||'').trim().toLowerCase().replace(/^[^a-z]+|[^a-z'-]+$/g,'');
async function tr(t){try{let r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(t)+'&langpair=en%7Cvi'),j=await r.json();return j.responseData.translatedText||''}catch(e){return''}}
async function lookup(w,s=''){w=clean(w);if(!w)return;dict.classList.add('open');document.getElementById('dictInput').value=w;let o=document.getElementById('dictResult');o.innerHTML='<div class="dictWord">'+w+'</div><p>Đang tra online…</p>';try{let r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(w)),j=await r.json(),e=j[0],cards='';for(let m of e.meanings){let d=m.definitions[0],v=await tr(d.definition);cards+='<div class="posCard"><b>'+m.partOfSpeech+'</b><div class="definition"><div class="vi">'+v+'</div><div class="en">'+d.definition+'</div></div></div>'}let cur=e.meanings[0]?.partOfSpeech||'unknown',meaning=await tr(e.meanings[0]?.definitions[0]?.definition||w),audio=(e.phonetics||[]).find(x=>x.audio)?.audio||'';o.innerHTML='<div class="dictWord">'+w+'</div><div class="contextCard"><b>Trong câu này</b>'+(s?'<div class="contextSentence">'+s+'</div>':'')+'<div class="usage"><b>Nghĩa phù hợp</b><span>'+meaning+'</span><b>Loại từ</b><span>'+cur+'</span></div></div><h3>Tất cả loại từ / nghĩa phổ biến</h3>'+cards+'<div class="dictActions"><button id="pw">🔊 Phát âm</button><button class="save" id="sw">⭐ Lưu ôn</button></div>';document.getElementById('pw').onclick=()=>audio?new Audio(audio).play():(()=>{let u=new SpeechSynthesisUtterance(w);u.lang='en-GB';speechSynthesis.speak(u)})();document.getElementById('sw').onclick=()=>{st.saved[w]={w,m:meaning};save();renderSaved()}}catch(e){o.innerHTML='<div class="dictWord">'+w+'</div><p>Không lấy được dữ liệu lúc này.</p>'}}
function sentence(){let s=getSelection();if(!s||!s.rangeCount)return'';let n=s.getRangeAt(0).commonAncestorContainer;if(n.nodeType===3)n=n.parentElement;return(n.closest?.('p,li,.q,.example,.learnBox')||n).innerText?.slice(0,500)||''}
document.getElementById('dictGo').onclick=()=>lookup(document.getElementById('dictInput').value);document.addEventListener('dblclick',()=>{let w=getSelection().toString().trim();if(w&&/[A-Za-z]/.test(w))lookup(w,sentence())});

document.getElementById('search').oninput=e=>{let q=e.target.value.toLowerCase(),d=days.find(x=>JSON.stringify(x).toLowerCase().includes(q));if(d){renderToday(d.day);show('today')}};
renderDays();renderToday();renderRoadmap();renderGrammar();renderSaved();progress();
