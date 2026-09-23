
const S='ielts100_online';let st=JSON.parse(localStorage.getItem(S)||'{}');st.done=st.done||{};st.notes=st.notes||{};st.err=st.err||[];st.saved=st.saved||{};st.answers=st.answers||{};st.mistakes=st.mistakes||[];st.errorNotes=st.errorNotes||{};const save=()=>localStorage.setItem(S,JSON.stringify(st));
const topics=['Education','Technology','Environment','Work','Health','Society','Travel','Culture','Crime','Language'];
const grammar=['Present Simple vs Present Continuous','Past Simple vs Past Continuous','Present Perfect','Articles','Subject–Verb Agreement','Comparatives & Superlatives','Modal Verbs','Passive Voice','Relative Clauses','Conditionals','Gerunds & Infinitives','Linking Ideas','Prepositions for Task 1','Word Formation','Complex Sentences'];
const start=new Date('2026-09-21T00:00:00');
function cd(){let n=new Date(),a=new Date(n.getFullYear(),n.getMonth(),n.getDate()),b=new Date(start.getFullYear(),start.getMonth(),start.getDate());return Math.max(1,Math.min(100,Math.floor((a-b)/86400000)+1))}
function dateOf(d){let x=new Date(start);x.setDate(x.getDate()+d-1);return x.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})}
function phase(d){return d<=70?'Học giáo trình':d<=84?'Học lại phần sai':d<=96?'Mock + correction':'Giảm tải trước thi'}
function slots(d){let u=Math.min(10,Math.ceil(Math.min(d,70)/7)),g=grammar[(d-1)%grammar.length],t=topics[u-1];if(d<=70)return[['05:00–05:50','grammar','Grammar • '+g],['05:50–06:45','reading','Reading • '+t],['06:45–07:30','listening','Listening • '+t],['07:30–08:00','vocab','Vocabulary • '+t],['16:15–17:30','writing','Writing • '+t],['17:30–18:15','speaking','Speaking • '+t],['18:15–18:45','review','Review 1–3–7'],['18:45–19:20','fix','Fix mistakes'],['19:20–20:00','mixed','Weak-skill drill']];return[['05:00–06:00','review','Review / Mock'],['06:00–07:00','reading','Reading repair'],['07:00–08:00','listening','Listening repair'],['16:15–17:30','writing','Writing repair'],['17:30–18:15','speaking','Speaking repair'],['18:15–19:00','fix','Error Log'],['19:00–20:00','mixed','Integrated review']]}
function key(d,i){return d+'_'+i}
function show(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.getElementById('view-'+v).classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===v))}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{show(b.dataset.view);if(b.dataset.view==='review')renderReview();if(b.dataset.view==='errors')initErrorNotes();});
function renderDays(){let e=document.getElementById('dayGrid'),c=cd();e.innerHTML='';for(let d=1;d<=100;d++){let b=document.createElement('button');b.textContent=d;if(d===c)b.classList.add('current');if(slots(d).every((_,i)=>st.done[key(d,i)]))b.classList.add('done');b.onclick=()=>{renderToday(d);show('today')};e.appendChild(b)}}
function renderToday(d=cd()){let s=slots(d),h='<div class="dayHeader"><div><span class="phase">'+phase(d)+'</span><h2>Day '+d+' • '+dateOf(d)+'</h2><div class="muted">Unit '+Math.min(10,Math.ceil(Math.min(d,70)/7))+'</div></div></div><h3>Bấm vào từng khung để học ngay</h3><div class="slots">';s.forEach((x,i)=>h+='<button class="slot '+(st.done[key(d,i)]?'done':'')+'" data-i="'+i+'"><span class="time">'+x[0]+'</span><span><b>'+x[2]+'</b><small>Learn → Practice → Check → Fix → Review</small></span></button>');h+='</div><h3>Ghi chú Day '+d+'</h3><textarea id="note" class="note">'+(st.notes[d]||'')+'</textarea>';document.getElementById('todayCard').innerHTML=h;document.querySelectorAll('.slot').forEach(b=>b.onclick=()=>openLesson(d,+b.dataset.i));document.getElementById('note').oninput=e=>{st.notes[d]=e.target.value;save()}}
function renderRoadmap(){let h='';for(let d=1;d<=100;d++)h+='<div class="roadDay"><b>Day '+d+' • '+dateOf(d)+'</b><div class="muted">'+phase(d)+'</div><button class="btn primary" onclick="renderToday('+d+');show(&quot;today&quot;)">Mở Day '+d+'</button></div>';document.getElementById('roadmapList').innerHTML=h}
function renderGrammar(){document.getElementById('grammarList').innerHTML=grammar.map(x=>'<div class="grammarCard"><h3>'+x+'</h3><p>Học rule → examples → 20 câu → 3 câu tự viết → sửa lỗi.</p></div>').join('')}
function renderSaved(){
 const host=document.getElementById('savedWords');if(!host)return;
 if(typeof window.renderSavedVocabulary==='function'){window.renderSavedVocabulary();return;}
 let a=Object.values(st.saved);
 host.innerHTML=a.length?a.map(x=>'<div class="reviewItem"><b>'+x.w+'</b> — '+x.m+'</div>').join(''):'<p class="muted">Chưa lưu từ nào.</p>';
}

function mistake(day,type,prompt,correct,explain,meta){
 let exists=st.mistakes.find(m=>m.day===day&&m.type===type&&m.p===prompt&&!m.mastered);
 if(!exists)st.mistakes.push({id:String(Date.now())+Math.random().toString(36).slice(2),day:day,type:type,p:prompt,c:correct,e:explain,due:[day+1,day+3,day+7].filter(x=>x<=100),mastered:false});
 save();renderReview();
 meta=meta||{};
 if(typeof window.recordLearningError==='function')window.recordLearningError({
   skill:type,task:meta.source||('Day '+day),question:prompt,userAnswer:meta.userAnswer||'',correctAnswer:correct,
   why:meta.why||explain,rule:meta.rule||'',evidence:meta.evidence||'',errorType:meta.errorType||''
 });
}
function master(id){let m=st.mistakes.find(x=>x.id===id);if(m)m.mastered=true;save();renderReview()}
function renderReview(){
 let list=document.getElementById('reviewList');if(!list)return;
 if(typeof window.renderErrorCenter==='function')window.renderErrorCenter();
 let items=[];try{items=JSON.parse(localStorage.getItem('gkyyy_error_center_v2')||'{}').items||[]}catch(e){}
 const active=items.filter(x=>!x.mastered),due=active.filter(x=>!x.nextReviewAt||x.nextReviewAt<=Date.now());
 list.innerHTML='<div class="reviewItem"><b>'+due.length+' lỗi đến lượt ôn</b><p>'+active.length+' lỗi đang luyện. Mỗi lỗi cần làm bài tập và thử lại qua nhiều ngày để được đánh dấu đã nhớ.</p><button type="button" class="btn primary" id="reviewGoErrorLab">Mở Error Lab để luyện</button></div>';
 document.getElementById('reviewGoErrorLab').onclick=()=>{show('errors');if(typeof window.renderErrorCenter==='function')window.renderErrorCenter();};
}
function initErrorNotes(){
 document.querySelectorAll('.error').forEach(t=>{t.value=st.errorNotes[t.dataset.key]||'';t.oninput=e=>{st.errorNotes[e.target.dataset.key]=e.target.value;save()}});
}
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
 let h='<div class="q"><b>'+(i+1)+'. '+q[0]+'</b>';
 q[1].forEach((o,j)=>h+='<button class="opt" data-p="'+p+'" data-q="'+i+'" data-o="'+j+'">'+o+'</button>');
 h+='<button class="btn hintBtn" type="button" data-p="'+p+'" data-q="'+i+'">💡 Gợi ý</button><div class="hint hidden" id="'+p+'-h-'+i+'">Tìm signal word, subject, word form hoặc evidence trước khi chọn. Loại đáp án sai ngữ pháp trước.</div><div class="feedback hidden" id="'+p+'-fb-'+i+'"></div></div>';
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
  let l=listeningPack(d),h='<div class="timePlan"><div><b>0–5 phút</b>Predict</div><div><b>5–12 phút</b>Listen 1</div><div><b>12–25 phút</b>10 câu</div><div><b>25–37 phút</b>Transcript</div><div><b>37–45 phút</b>Listen again</div></div><div class="notice"><b>Prediction:</b> trước khi nghe, đoán loại đáp án: date, time, place, number, noun...</div>'+
  '<div class="listenPlayer">'+
    '<div class="listenSeekRow">'+
      '<span id="listenCurrentTime">0:00</span>'+
      '<input id="listenSeek" class="listenSeek" type="range" min="0" max="1000" step="1" value="0" aria-label="Thanh tua audio">'+
      '<span id="listenTotalTime">0:00</span>'+
    '</div>'+
    '<div class="listenPlayerMain">'+
      '<button id="playAudio" class="btn primary">▶ Phát</button>'+
      '<button id="pauseAudio" class="btn">⏸ Tạm dừng</button>'+
      '<button id="stopAudio" class="btn">⏹ Dừng</button>'+
      '<button id="showScript" class="btn">Transcript</button>'+
      '<button id="listenHighlight" class="btn">🎨 Highlight</button>'+
    '</div>'+
    '<div class="listenSettings">'+
      '<label><span>Tốc độ</span><input id="listenRate" type="range" min="0.65" max="1.25" step="0.05" value="0.90"><b id="listenRateLabel">0.90×</b></label>'+
      '<label><span>Giọng</span><select id="listenVoice"><option value="auto-uk">Tự nhiên • UK</option><option value="auto-us">Tự nhiên • US</option></select></label>'+
    '</div>'+
    '<div class="listenStatus"><span id="listenStatusText">Sẵn sàng</span><span id="listenProgress"></span></div>'+
  '</div>'+
  '<div id="script" class="passage hidden">'+l.script+'</div><h3>Questions • 10 câu thật</h3>';
  l.q.forEach((q,i)=>h+='<div class="q"><b>'+(i+1)+'. '+q[0]+'</b><input class="search lanswer" data-i="'+i+'" placeholder="Your answer"><div class="feedback hidden" id="l-fb-'+i+'"></div></div>');
  return h+'<div id="listeningGradeSummary"></div><div class="checkRow"><button id="checkListening" class="btn primary">Chấm & chữa Listening</button></div>';
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
  fb.classList.remove('hidden');fb.className='feedback '+(ok?'good':'bad');
  fb.innerHTML=ok?'✓ Correct':'✗ Correct: <b>'+q[1][q[2]]+'</b><br><b>Giải thích:</b> '+q[3];
  if(!ok && typeof mistake==='function')mistake(d,type,q[0],q[1][q[2]],q[3],{
    userAnswer:(a===undefined||a===null)?'Bỏ trống':q[1][a],
    source:'Day '+d+' • '+(type==='grammar'?'Grammar':'Reading'),
    errorType:type==='grammar'?'Grammar choice':'Reading answer',
    why:q[3],
    rule:type==='reading'?'Tìm evidence trong passage và đối chiếu paraphrase trước khi chọn đáp án.':'Đọc lại rule của cấu trúc rồi làm lại câu mà không nhìn đáp án.'
  });
 });
 let s=document.getElementById(prefix+'-score');if(s)s.textContent=correct+'/'+qs.length;
}

const listeningTTSState={playing:false,paused:false,stopped:true,chunks:[],index:0,script:'',rate:.9,voiceMode:'auto-uk',utterance:null,startedAt:0,elapsedInChunk:0,seekSecond:0,seeking:false,uiTimer:null};

function listeningVoices(){
 try{return speechSynthesis.getVoices()||[]}catch(e){return[]}
}
function voiceQualityScore(v,accent){
 let n=(v.name||'').toLowerCase(),lang=(v.lang||'').toLowerCase(),score=0;
 let want=accent==='US'?'en-us':'en-gb';
 if(lang===want)score+=30;
 else if(lang.startsWith('en'))score+=10;
 if(/google/.test(n))score+=18;
 if(/premium|enhanced|natural|neural/.test(n))score+=20;
 if(/daniel|samantha|serena|oliver|aaron|jamie|ava|allison|tom|karen|moira|tessa/.test(n))score+=8;
 if(/compact|novelty|whisper|zarvox|bells|boing/.test(n))score-=30;
 return score;
}
function chooseListeningVoice(mode){
 let vs=listeningVoices();
 if(!vs.length)return null;
 if(mode&&mode.startsWith('voice:')){
   let name=decodeURIComponent(mode.slice(6));return vs.find(v=>v.name===name)||null;
 }
 let accent=mode==='auto-us'?'US':'UK';
 return vs.slice().sort((a,b)=>voiceQualityScore(b,accent)-voiceQualityScore(a,accent))[0]||null;
}
function populateListeningVoices(){
 let sel=document.getElementById('listenVoice');if(!sel)return;
 let current=sel.value||'auto-uk',vs=listeningVoices().filter(v=>/^en[-_]/i.test(v.lang||'')||/^English/i.test(v.name||''));
 let seen=new Set(),html='<option value="auto-uk">Tự nhiên • UK</option><option value="auto-us">Tự nhiên • US</option>';
 vs.sort((a,b)=>voiceQualityScore(b,'UK')-voiceQualityScore(a,'UK')).forEach(v=>{
   if(seen.has(v.name))return;seen.add(v.name);
   html+='<option value="voice:'+encodeURIComponent(v.name)+'">'+descape(v.name)+' • '+descape(v.lang||'English')+'</option>';
 });
 sel.innerHTML=html;
 if([...sel.options].some(o=>o.value===current))sel.value=current;
}
function splitListeningScript(text){
 let parts=String(text||'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
 let out=[];
 parts.forEach(s=>{
   s=s.trim();if(!s)return;
   if(s.length<=220){out.push(s);return}
   let clauses=s.match(/[^,;:]+[,;:]?|[^,;:]+$/g)||[s],buf='';
   clauses.forEach(x=>{
     if((buf+' '+x).trim().length>180&&buf){out.push(buf.trim());buf=x}
     else buf=(buf+' '+x).trim();
   });
   if(buf)out.push(buf.trim());
 });
 return out;
}

function estimatedChunkSeconds(text,rate){
 let words=(String(text||'').match(/\b[\w'-]+\b/g)||[]).length;
 // Approximate natural English narration at ~155 wpm, adjusted by playback rate.
 return Math.max(1.8,(words/155)*60/Math.max(.65,rate||.9));
}
function listeningTimelineSeconds(){
 let s=listeningTTSState,total=0;
 for(let i=0;i<s.index;i++)total+=estimatedChunkSeconds(s.chunks[i],s.rate);
 if(s.playing&&!s.paused&&s.startedAt)total+=Math.max(0,(performance.now()-s.startedAt)/1000);
 else total+=s.elapsedInChunk||0;
 return Math.max(0,Math.min(totalListeningSeconds(),total));
}
function totalListeningSeconds(){
 return listeningTTSState.chunks.reduce((sum,x)=>sum+estimatedChunkSeconds(x,listeningTTSState.rate),0);
}
function indexForListeningSecond(target){
 let s=listeningTTSState,acc=0;
 target=Math.max(0,Math.min(target,totalListeningSeconds()));
 for(let i=0;i<s.chunks.length;i++){
  let d=estimatedChunkSeconds(s.chunks[i],s.rate);
  if(acc+d>target)return {index:i,offset:Math.max(0,target-acc)};
  acc+=d;
 }
 return {index:Math.max(0,s.chunks.length-1),offset:0};
}

function formatListeningTime(sec){
 sec=Math.max(0,Math.round(sec||0));
 let m=Math.floor(sec/60),s=sec%60;
 return m+':'+String(s).padStart(2,'0');
}
function updateListeningSeekUI(force=false){
 let s=listeningTTSState,bar=document.getElementById('listenSeek');
 if(!bar)return;
 let total=totalListeningSeconds(),cur=listeningTimelineSeconds();
 if(!s.seeking||force)bar.value=total?Math.round((cur/total)*1000):0;
 let now=document.getElementById('listenCurrentTime'),end=document.getElementById('listenTotalTime');
 if(now)now.textContent=formatListeningTime(cur);
 if(end)end.textContent=formatListeningTime(total);
}
function startListeningUITimer(){
 let s=listeningTTSState;
 if(s.uiTimer)clearInterval(s.uiTimer);
 s.uiTimer=setInterval(()=>updateListeningSeekUI(false),180);
}
function stopListeningUITimer(){
 let s=listeningTTSState;
 if(s.uiTimer){clearInterval(s.uiTimer);s.uiTimer=null}
}
function seekListeningTo(target,autoplay){
 let s=listeningTTSState;
 if(!s.chunks.length)return;
 target=Math.max(0,Math.min(totalListeningSeconds(),Number(target)||0));
 let pos=indexForListeningSecond(target),wasActive=s.playing||s.paused;
 try{speechSynthesis.cancel()}catch(e){}
 s.index=pos.index;
 // Browser TTS cannot begin in the middle of a word/sentence. Keep the bar at the requested
 // position but restart from the nearest sentence/chunk.
 s.elapsedInChunk=0;
 s.startedAt=0;
 s.seekSecond=target;
 s.paused=false;
 if(autoplay===undefined)autoplay=wasActive;
 if(autoplay){
   s.stopped=false;s.playing=true;
   setListeningStatus('Đang phát từ vị trí đã tua');
   setTimeout(speakListeningChunk,80);
 }else{
   s.stopped=true;s.playing=false;
   setListeningStatus('Đã tua tới '+formatListeningTime(target));
 }
 updateListeningSeekUI(true);
}
function setListeningStatus(text){
 let el=document.getElementById('listenStatusText');if(el)el.textContent=text;
 let p=document.getElementById('listenProgress');
 if(p)p.textContent=listeningTTSState.chunks.length&&listeningTTSState.playing?'Câu '+Math.min(listeningTTSState.index+1,listeningTTSState.chunks.length)+' / '+listeningTTSState.chunks.length:'';
 updateListeningSeekUI(false);
}
function stopListeningAudio(reset=true){
 try{speechSynthesis.cancel()}catch(e){}
 listeningTTSState.playing=false;listeningTTSState.paused=false;listeningTTSState.stopped=true;listeningTTSState.utterance=null;listeningTTSState.startedAt=0;listeningTTSState.elapsedInChunk=0;
 if(reset){listeningTTSState.index=0;listeningTTSState.seekSecond=0}
 stopListeningUITimer();
 setListeningStatus('Đã dừng');
 updateListeningSeekUI(true);
}
function speakListeningChunk(){
 let s=listeningTTSState;
 if(s.stopped||s.index>=s.chunks.length){
   s.playing=false;s.paused=false;s.stopped=true;s.index=0;s.seekSecond=0;stopListeningUITimer();setListeningStatus('Đã phát xong');updateListeningSeekUI(true);return;
 }
 let u=new SpeechSynthesisUtterance(s.chunks[s.index]);
 let mode=s.voiceMode||'auto-uk',voice=chooseListeningVoice(mode);
 u.lang=mode==='auto-us'?'en-US':'en-GB';
 if(voice){u.voice=voice;u.lang=voice.lang||u.lang}
 u.rate=s.rate||.9;
 u.pitch=1;
 u.volume=1;
 u.onstart=()=>{s.playing=true;s.paused=false;s.startedAt=performance.now();s.elapsedInChunk=0;startListeningUITimer();setListeningStatus('Đang phát')};
 u.onend=()=>{if(s.stopped)return;s.startedAt=0;s.elapsedInChunk=0;s.index++;setTimeout(speakListeningChunk,80)};
 u.onerror=()=>{if(s.stopped)return;s.startedAt=0;s.elapsedInChunk=0;s.index++;setTimeout(speakListeningChunk,80)};
 s.utterance=u;
 try{speechSynthesis.speak(u)}catch(e){setListeningStatus('Không thể phát audio')}
}
function startListeningAudio(script){
 let s=listeningTTSState;
 try{speechSynthesis.cancel()}catch(e){}
 s.script=script;
 if(!s.chunks.length)s.chunks=splitListeningScript(script);
 let rate=document.getElementById('listenRate');if(rate)s.rate=parseFloat(rate.value)||.9;
 let voice=document.getElementById('listenVoice');if(voice)s.voiceMode=voice.value||'auto-uk';
 if(s.stopped&&s.seekSecond>0){
   let pos=indexForListeningSecond(s.seekSecond);s.index=pos.index;
 }else if(s.stopped){s.index=0}
 s.stopped=false;s.paused=false;s.playing=true;s.startedAt=0;s.elapsedInChunk=0;
 startListeningUITimer();
 speakListeningChunk();
}
function pauseResumeListening(){
 let s=listeningTTSState;if(!s.playing&&!s.paused)return;
 try{
   if(s.paused){speechSynthesis.resume();s.paused=false;s.startedAt=performance.now();setListeningStatus('Đang phát');let b=document.getElementById('pauseAudio');if(b)b.textContent='⏸ Tạm dừng'}
   else{if(s.startedAt)s.elapsedInChunk+=Math.max(0,(performance.now()-s.startedAt)/1000);s.startedAt=0;speechSynthesis.pause();s.paused=true;setListeningStatus('Đã tạm dừng');let b=document.getElementById('pauseAudio');if(b)b.textContent='▶ Tiếp tục'}
 }catch(e){}
}
function restartListeningAtRate(){
 let s=listeningTTSState;if(!s.playing||s.stopped)return;
 let rate=document.getElementById('listenRate');if(rate)s.rate=parseFloat(rate.value)||.9;
 let voice=document.getElementById('listenVoice');if(voice)s.voiceMode=voice.value||'auto-uk';
 try{speechSynthesis.cancel()}catch(e){}
 s.stopped=false;s.paused=false;
 setTimeout(speakListeningChunk,80);
}
function initListeningPlayer(script){
 let s=listeningTTSState,rate=document.getElementById('listenRate'),rateLabel=document.getElementById('listenRateLabel'),voice=document.getElementById('listenVoice'),seek=document.getElementById('listenSeek');
 stopListeningUITimer();
 s.script=script;s.chunks=splitListeningScript(script);s.index=0;s.startedAt=0;s.elapsedInChunk=0;s.seekSecond=0;s.stopped=true;s.playing=false;s.paused=false;s.seeking=false;
 populateListeningVoices();
 if(typeof speechSynthesis!=='undefined')speechSynthesis.onvoiceschanged=()=>populateListeningVoices();
 if(rate){
   s.rate=parseFloat(rate.value)||.9;
   rate.oninput=()=>{if(rateLabel)rateLabel.textContent=Number(rate.value).toFixed(2)+'×';s.rate=parseFloat(rate.value)||.9;updateListeningSeekUI(true)};
   rate.onchange=()=>restartListeningAtRate();
 }
 if(voice)voice.onchange=()=>restartListeningAtRate();
 if(seek){
   seek.onpointerdown=()=>{s.seeking=true};
   seek.oninput=()=>{
     let total=totalListeningSeconds(),target=(Number(seek.value)/1000)*total;
     let now=document.getElementById('listenCurrentTime');if(now)now.textContent=formatListeningTime(target);
   };
   seek.onchange=()=>{
     let total=totalListeningSeconds(),target=(Number(seek.value)/1000)*total,autoplay=s.playing||s.paused;
     s.seeking=false;s.seekSecond=target;seekListeningTo(target,autoplay);
   };
   seek.onpointerup=()=>{s.seeking=false};
 }
 document.getElementById('playAudio').onclick=()=>startListeningAudio(script);
 document.getElementById('pauseAudio').onclick=()=>pauseResumeListening();
 document.getElementById('stopAudio').onclick=()=>stopListeningAudio(true);
 setListeningStatus('Sẵn sàng');
 updateListeningSeekUI(true);
}

function normalizeListeningText(s){
 return String(s||'').toLowerCase()
  .replace(/[’']/g,"'")
  .replace(/\bp\.?\s*m\.?\b/g,'pm')
  .replace(/\ba\.?\s*m\.?\b/g,'am')
  .replace(/\bo[' ]?clock\b/g,'')
  .replace(/[$,]/g,'')
  .replace(/[^a-z0-9:\s-]/g,' ')
  .replace(/\b(a|an|the)\b/g,' ')
  .replace(/\s+/g,' ').trim();
}
function levenshtein(a,b){
 a=String(a||'');b=String(b||'');
 const m=a.length,n=b.length,dp=Array(n+1).fill(0).map((_,j)=>j);
 for(let i=1;i<=m;i++){
  let prev=dp[0];dp[0]=i;
  for(let j=1;j<=n;j++){
   const tmp=dp[j];
   dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
   prev=tmp;
  }
 }
 return dp[n];
}
function listeningAnswerOK(given,correct){
 const a=normalizeListeningText(given),b=normalizeListeningText(correct);
 if(!a)return false;
 if(a===b)return true;
 const stripUnit=x=>x.replace(/\b(weeks?|room|dollars?|minutes?|hours?)\b/g,' ').replace(/\s+/g,' ').trim();
 if(stripUnit(a)===stripUnit(b)&&stripUnit(a))return true;
 return false;
}
function listeningErrorDiagnosis(given,correct){
 const a=normalizeListeningText(given),b=normalizeListeningText(correct);
 if(!a)return {type:'Bỏ trống',why:'Bạn không nhập đáp án nên không thể nhận điểm cho câu này.',fix:'Trước khi audio chạy, hãy dự đoán loại từ cần điền; cuối bài đừng để trống nếu bạn có evidence.'};
 const d=levenshtein(a,b);
 if(d>0&&d<=Math.max(2,Math.floor(b.length*.18)))return {
  type:'Spelling',
  why:'Bạn nghe gần đúng nhưng spelling chưa khớp với đáp án.',
  fix:'Nghe lại riêng từ khóa, tách âm tiết rồi viết lại. Chú ý chữ đôi, âm cuối và dạng số nhiều.'
 };
 const singular=x=>x.replace(/s$/,'');
 if(singular(a)===singular(b)&&a!==b)return {
  type:'Singular / plural',
  why:'Nội dung gần đúng nhưng dạng số ít/số nhiều khác đáp án.',
  fix:'Nghe âm cuối /s/ hoặc /z/ và kiểm tra ngữ pháp của chỗ trống trước khi chốt đáp án.'
 };
 if(/[0-9:$]/.test(String(correct))||/\b(time|fee|discount|week|room|date|when|how many|how much)\b/i.test(correct+' ')){
  return {
   type:'Sai chi tiết số / thời gian',
   why:'Bạn đã chọn hoặc ghi sai con số, thời gian, ngày hoặc chi tiết định lượng.',
   fix:'Khi nghe số, viết nháp ngay và chờ speaker xác nhận hoặc sửa lại; đặc biệt chú ý distractor kiểu “not X, but Y”.'
  };
 }
 const aw=a.split(' '),bw=b.split(' ');
 if(bw.every(w=>aw.includes(w))&&aw.length>bw.length)return {
  type:'Thừa từ',
  why:'Đáp án chính có trong câu bạn viết nhưng bạn thêm từ không cần thiết.',
  fix:'Giữ đúng word limit và chỉ ghi phần trả lời cần thiết, không chép cả cụm dài nếu đề chỉ cần một từ/cụm ngắn.'
 };
 return {
  type:'Sai thông tin / distractor',
  why:'Câu trả lời của bạn không khớp với chi tiết cuối cùng được audio xác nhận.',
  fix:'Đừng chốt ngay ở keyword đầu tiên. Nghe tiếp các từ chuyển ý như but, actually, instead, rather than, not… để tránh distractor.'
 };
}
function listeningEvidence(script,q){
 const sentences=String(script||'').match(/[^.!?]+[.!?]?/g)||[script];
 const stop=new Set(['what','when','where','which','does','do','did','are','is','the','a','an','can','how','many','much','students','course']);
 const tokens=String(q[0]+' '+q[1]).toLowerCase().match(/[a-z0-9]+/g)||[];
 const keys=tokens.filter(w=>w.length>2&&!stop.has(w));
 let best=sentences[0]||'',score=-1;
 sentences.forEach(s=>{
  const low=s.toLowerCase();
  let n=0;
  keys.forEach(k=>{if(low.includes(k)||low.includes(k.slice(0,Math.max(4,k.length-1))))n++;});
  if(n>score){score=n;best=s;}
 });
 return best.trim();
}
function gradeListeningLesson(d,l){
 stopListeningAudio(true);
 let correctCount=0,wrongCount=0,blankCount=0;
 document.querySelectorAll('.lanswer').forEach(inp=>{
  const j=+inp.dataset.i,q=l.q[j],given=inp.value.trim(),ok=listeningAnswerOK(given,q[1]);
  const fb=document.getElementById('l-fb-'+j),diag=listeningErrorDiagnosis(given,q[1]),evidence=listeningEvidence(l.script,q);
  if(ok)correctCount++;else if(!given)blankCount++;else wrongCount++;
  fb.classList.remove('hidden');
  fb.className='feedback listenCorrection '+(ok?'good':'bad');
  fb.innerHTML=ok
   ? '<div class="lcStatus good">✓ Đúng</div><div class="lcGrid"><div><span>Đáp án của bạn</span><b>'+descape(given)+'</b></div><div><span>Đáp án chuẩn</span><b>'+descape(q[1])+'</b></div></div><div class="lcEvidence"><b>Evidence trong audio:</b> '+descape(evidence)+'</div><div class="lcRule"><b>Vì sao đúng:</b> '+descape(q[2])+'</div>'
   : '<div class="lcStatus bad">✕ '+descape(diag.type)+'</div><div class="lcGrid"><div><span>Đáp án của bạn</span><b>'+descape(given||'Bỏ trống')+'</b></div><div><span>Đáp án đúng</span><b>'+descape(q[1])+'</b></div></div><div class="lcEvidence"><b>Evidence trong audio:</b> '+descape(evidence)+'</div><div class="lcWhy"><b>Lỗi ở đâu:</b> '+descape(diag.why)+'</div><div class="lcRule"><b>Cách chữa:</b> '+descape(diag.fix)+'</div><div class="lcWhy"><b>Giải thích câu này:</b> '+descape(q[2])+'</div>';
  if(!ok&&typeof mistake==='function')mistake(d,'listening',q[0],q[1],diag.type+': '+diag.fix+' Evidence: '+evidence,{
    userAnswer:given||'Bỏ trống',source:'Day '+d+' • Listening',errorType:diag.type,why:diag.why,rule:diag.fix,evidence:evidence
  });
 });
 const total=l.q.length,summary=document.getElementById('listeningGradeSummary');
 if(summary){
  const pct=Math.round(correctCount/total*100);
  summary.innerHTML='<div class="skillGradeSummary"><div><span>LISTENING RESULT</span><strong>'+correctCount+'/'+total+'</strong><small>'+pct+'% chính xác</small></div><div class="skillGradeStats"><b class="ok">✓ '+correctCount+' đúng</b><b class="bad">✕ '+wrongCount+' sai</b><b>— '+blankCount+' bỏ trống</b></div><p>Chữa theo thứ tự: <b>đáp án của bạn → đáp án đúng → evidence → loại lỗi → cách sửa</b>. Các câu sai đã được đưa vào Review & Carry-over.</p></div>';
 }
 const script=document.getElementById('script');
 if(script)script.classList.remove('hidden');
 const btn=document.getElementById('checkListening');
 if(btn&&!btn.dataset.progressRecorded&&typeof window.recordTaskPerformance==='function'){
   window.recordTaskPerformance({kind:'listening',score:correctCount,total:total,errors:wrongCount+blankCount,note:wrongCount+' sai · '+blankCount+' bỏ trống'});
   btn.dataset.progressRecorded='1';
 }
 if(btn)btn.textContent='✓ Đã chấm — xem chữa từng câu';
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
  initListeningPlayer(l.script);
  document.getElementById('showScript').onclick=()=>document.getElementById('script').classList.toggle('hidden');
  const hlBtn=document.getElementById('listenHighlight');
  if(hlBtn)hlBtn.onclick=()=>{if(typeof window.openStudyHighlighter==='function')window.openStudyHighlighter();};
  document.getElementById('checkListening').onclick=()=>gradeListeningLesson(d,l);
 }
 document.getElementById('finish').onclick=()=>{st.done[key(d,i)]=true;save();progress();renderDays();document.getElementById('finish').textContent='✓ Đã hoàn thành';};
}
document.getElementById('lessonClose').onclick=()=>{stopListeningAudio(true);document.getElementById('lessonOverlay').classList.remove('open');document.body.style.overflow='';renderToday();};


/* Universal contextual dictionary: online-first, every word, all POS */
const dict=document.getElementById('dictionary'),hd=document.getElementById('dictHandle');
const DCACHE_KEY='ielts_dict_v17_cache',TCACHE_KEY='ielts_dict_v13_translate',DPOS_KEY='ielts_dict_v11_window';
let dcache={},tcache={};
try{dcache=JSON.parse(localStorage.getItem(DCACHE_KEY)||'{}')}catch(e){}
try{tcache=JSON.parse(localStorage.getItem(TCACHE_KEY)||'{}')}catch(e){}
const POSVI={noun:'danh từ',verb:'động từ',adjective:'tính từ',adverb:'trạng từ',preposition:'giới từ',conjunction:'liên từ',pronoun:'đại từ',determiner:'từ hạn định',article:'mạo từ',interjection:'thán từ',auxiliary:'trợ động từ',modal:'động từ khuyết thiếu',particle:'tiểu từ'};
const CORE={
 in:{s:[['preposition','trong; ở; vào','inside or within a place, time or situation','She is in the classroom.'],['adverb','vào trong; ở trong','towards or at the inside','Come in.'],['adjective','đang thịnh hành; hợp thời','fashionable or popular','That style is in.'],['noun','người có quan hệ/ảnh hưởng; lợi thế nội bộ','an influential connection or advantage','He has an in with the organisers.']]},
 another:{s:[['determiner','một ... khác; thêm một','one more or a different one before a noun','Can I have another example?'],['pronoun','một người/vật khác','a different person or thing','One answer is correct; another is not.']]},
 read:{s:[['verb','đọc; xem và hiểu chữ viết','to look at and understand written words','I read English articles every day.'],['noun','một bài/lần đọc; thứ đáng đọc','an act of reading or something worth reading','This article is a useful read.'],['adjective','đọc nhiều; có kiến thức qua đọc (thường trong well-read)','knowledgeable through reading','She is a well-read student.']]},
 take:{s:[['verb','lấy; mang; thực hiện; tham gia/học','to carry, receive, perform, or participate in something','Students take online courses.'],['noun','lần quay/cảnh quay; quan điểm/cách nhìn','a recorded attempt or a particular view','What is your take on this issue?']]},
 have:{s:[['verb','có; sở hữu; ăn/uống; trải qua','to possess, experience, eat or drink','I have breakfast at 7 a.m.'],['auxiliary','trợ động từ tạo thì hoàn thành','used to form perfect tenses','I have finished.']]},
 do:{s:[['verb','làm; thực hiện','to perform an action or task','I do my homework after dinner.'],['auxiliary','trợ động từ trong câu hỏi/phủ định/nhấn mạnh','used for questions, negatives and emphasis','Do you study every day?']]},
 be:{s:[['verb','là; thì; ở; tồn tại','to exist or link a subject with information','She is a student.'],['auxiliary','trợ động từ cho tiếp diễn và bị động','used in continuous and passive forms','She is studying.']]},
 the:{s:[['article','mạo từ xác định: cái/người/sự vật cụ thể','definite article for something specific or known','the book on the table']]},
 a:{s:[['article','một; đối tượng chưa xác định','indefinite article before a singular countable noun','a student']]},
 an:{s:[['article','một; dùng trước âm nguyên âm','indefinite article before a vowel sound','an example']]},
 of:{s:[['preposition','của; về; thuộc','shows belonging, connection, amount or composition','the number of students']]},
 to:{s:[['preposition','đến; tới; hướng tới','towards a place, person, limit or result','go to school'],['particle','dấu hiệu infinitive','infinitive marker before a base verb','to study']]},
 for:{s:[['preposition','cho; dành cho; trong khoảng; vì','shows purpose, recipient, duration or reason','study for two hours']]},
 by:{s:[['preposition','bởi; bằng; cạnh; trước; theo mức','shows agent, method, position, deadline or amount of change','The figure rose by 10%.'],['adverb','đi ngang qua','past a point','A bus went by.']]},
 on:{s:[['preposition','trên; vào; về','shows position, date or topic','on Monday'],['adverb','đang bật; tiếp tục','operating or continuing','The light is on.'],['adjective','đang diễn ra/đã bật','operating or happening','The event is on.']]},
 at:{s:[['preposition','tại; lúc; ở mức','shows a point in place, time or value','at 9 a.m.']]},
 can:{s:[['modal','có thể','expresses ability or possibility','Students can improve.'],['noun','lon/hộp kim loại','a metal container','a can of soup'],['verb','đóng hộp','to preserve food in a can','They can fruit in summer.']]},
 may:{s:[['modal','có thể','expresses possibility or permission','This may help.'],['noun','tháng Năm','the fifth month of the year','in May']]},
 will:{s:[['modal','sẽ','expresses future, willingness or prediction','It will increase.'],['noun','ý chí; di chúc','determination or a legal document','a strong will']]},
 should:{s:[['modal','nên; cần','expresses advice or expectation','Students should revise.']]},
 course:{s:[['noun','khóa học; hướng đi; quá trình','a series of lessons or a direction/process','I am taking an English course.'],['verb','chảy/di chuyển nhanh (hiếm)','to move rapidly or flow','Blood coursed through the veins.']]},
 breakfast:{s:[['noun','bữa sáng','the first meal of the day','I have breakfast at 7 a.m.'],['verb','ăn sáng (ít dùng)','to eat breakfast','We breakfasted early.']]},
 study:{s:[['verb','học; nghiên cứu','to learn about a subject','I study English every morning.'],['noun','việc học; nghiên cứu; phòng học','the activity or result of studying','The study examined learning habits.']]},
 school:{s:[['noun','trường học; trường phái','an educational institution or group of thought','My school starts at 9 a.m.'],['verb','dạy dỗ; huấn luyện','to educate or train','She was schooled at home.']]},
 routine:{s:[['noun','thói quen; lịch trình thường lệ','a regular way of doing things','My daily routine starts at 6 a.m.'],['adjective','thường lệ; thông thường','done as part of a regular procedure','a routine check']]},
 review:{s:[['verb','ôn lại; xem lại; đánh giá','to examine or study something again, often to improve or evaluate it','I review my grammar mistakes every evening.'],['noun','sự ôn tập; lần xem xét; bài đánh giá/phê bình','an act of looking at something again or a written evaluation','Do a quick review before the test.']]},
 practice:{s:[['noun','sự luyện tập; bài luyện','repeated exercise intended to improve a skill','Regular practice improves fluency.'],['verb','luyện tập; thực hành','to do an activity repeatedly in order to improve','I practise speaking every day.']]},
 change:{s:[['noun','sự thay đổi','the act or result of becoming different','There was a significant change.'],['verb','thay đổi','to become or make something different','The situation is changing.']]},
 increase:{s:[['noun','sự gia tăng','a rise in amount or number','There was an increase in demand.'],['verb','tăng; gia tăng','to become or make greater','The figure increased significantly.']]},
 answer:{s:[['noun','câu trả lời; đáp án','a response to a question','Check your answer.'],['verb','trả lời','to respond to a question','Please answer the question.']]},
 question:{s:[['noun','câu hỏi; vấn đề','a sentence or problem that asks for information','Read the question carefully.'],['verb','đặt câu hỏi; nghi vấn','to ask or express doubt about something','The researcher questioned the result.']]},
 class:{s:[['noun','lớp học; hạng; tầng lớp','a group of students or a category','Our class starts at nine.'],['verb','xếp loại','to classify','The species is classed as endangered.'],['adjective','cao cấp/phong cách (informal compounds)','showing high quality or style','a class act']]},
 online:{s:[['adjective','trực tuyến','connected to or available through the internet','online courses'],['adverb','trực tuyến','through the internet','I study online.']]}
 ,go:{s:[['verb','đi; di chuyển; rời đi','to move or travel from one place to another','I go to school every weekday.'],['noun','lượt; lần thử; cơ hội','an attempt or turn at doing something','Have a go.'],['adjective','sẵn sàng hoạt động (ít dùng, như “go signal”)','ready or approved to proceed','The system is go.']]}
 ,relax:{s:[['verb','thư giãn; nghỉ ngơi; bớt căng thẳng','to rest and become less tense or worried','I relax after school.']]}
 ,employer:{s:[['noun','chủ lao động; người hoặc công ty thuê người làm và trả lương','a person or organisation that employs people','My employer pays me every week.']]}
 ,employee:{s:[['noun','nhân viên; người làm việc cho chủ/công ty và nhận lương','a person who is paid to work for someone','The company has 50 employees.']]}
 ,begin:{s:[['verb','bắt đầu; khởi đầu','to start happening, existing, or doing something','When does the course begin?']]}
 ,run:{s:[['verb','chạy; vận hành; kéo dài/diễn ra','to move quickly, operate, or continue for a period of time','The course runs for eight weeks.'],['noun','lần chạy; quãng chạy; chuỗi','an act or period of running, or a continuous series','a short run']]}
 ,habit:{s:[['noun','thói quen','something you do regularly','Reading every day is a useful habit.']]}
 ,habits:{s:[['noun','thói quen','things you do regularly','Good study habits help me learn English.']]}
 ,access:{s:[['noun','khả năng tiếp cận; cơ hội sử dụng hoặc tham gia','the opportunity or ability to use or reach something','Online courses improve access to education.'],['verb','truy cập; tiếp cận để sử dụng','to find, enter or use something','Students can access the lessons online.']]}
 ,accessible:{s:[['adjective','dễ tiếp cận; có thể sử dụng được','easy to reach, use or understand','Online lessons are accessible to more students.']]}
 ,flexibility:{s:[['noun','sự linh hoạt','the ability to change or adapt as needed','A flexible schedule gives learners more flexibility.']]}
 ,flexible:{s:[['adjective','linh hoạt; có thể thay đổi cho phù hợp','able to change or adapt','Online courses often have flexible schedules.']]}
 ,responsibility:{s:[['noun','trách nhiệm; bổn phận','a duty or something you are expected to do','Students have a responsibility to prepare.']]}
 ,responsibilities:{s:[['noun','những trách nhiệm; những việc phải lo liệu','duties or things you are expected to do','Some learners have family responsibilities.']]}
 ,participation:{s:[['noun','sự tham gia','the act of taking part in an activity','Regular feedback can encourage participation.']]}
 ,interaction:{s:[['noun','sự tương tác','communication or activity between people','Discussion groups support interaction between learners.']]}
 ,motivation:{s:[['noun','động lực','the reason or desire to do something','Clear goals can improve motivation.']]}
 ,feedback:{s:[['noun','phản hồi; nhận xét giúp cải thiện','information or advice about a person’s work','Students receive feedback on their writing.']]}
 ,outcome:{s:[['noun','kết quả','the result of an action or process','The learning outcome depends on practice.']]}
 ,outcomes:{s:[['noun','những kết quả','the results of an action or process','Learning outcomes depend on several factors.']]}


};
const IRR={am:'be',is:'be',are:'be',was:'be',were:'be',been:'be',being:'be',has:'have',had:'have',having:'have',does:'do',did:'do',done:'do',doing:'do',reads:'read',reading:'read',took:'take',taken:'take',takes:'take',taking:'take',chose:'choose',chosen:'choose',chooses:'choose',choosing:'choose',went:'go',gone:'go',goes:'go',studies:'study',studied:'study',studying:'study',children:'child',people:'person',men:'man',women:'woman',better:'good',best:'good',worse:'bad',worst:'bad',ate:'eat',eaten:'eat',wrote:'write',written:'write',ran:'run',saw:'see',seen:'see',found:'find',bought:'buy',thought:'think',taught:'teach',caught:'catch',spoke:'speak',spoken:'speak',sang:'sing',sung:'sing',fell:'fall',fallen:'fall',learnt:'learn',learned:'learn',swam:'swim',swum:'swim'};
const FIXED={i:'pronoun',you:'pronoun',he:'pronoun',she:'pronoun',it:'pronoun',we:'pronoun',they:'pronoun',me:'pronoun',him:'pronoun',her:'pronoun',us:'pronoun',them:'pronoun',my:'determiner',your:'determiner',his:'determiner',our:'determiner',their:'determiner',its:'determiner',a:'article',an:'article',the:'article',and:'conjunction',but:'conjunction',or:'conjunction',because:'conjunction',although:'conjunction',while:'conjunction',whereas:'conjunction',if:'conjunction',in:'preposition',on:'preposition',at:'preposition',of:'preposition',from:'preposition',for:'preposition',with:'preposition',by:'preposition',can:'modal',could:'modal',may:'modal',might:'modal',must:'modal',should:'modal',will:'modal',would:'modal'};
function dclean(w){return String(w||'').trim().replace(/^[^\p{L}]+|[^\p{L}'-]+$/gu,'').toLowerCase()}
function candidates(raw){
 let w=dclean(raw),a=[];const add=x=>{if(x&&!a.includes(x))a.push(x)};add(w);if(w.includes(' '))return a;if(IRR[w])add(IRR[w]);
 if(w.endsWith('ies')&&w.length>4)add(w.slice(0,-3)+'y');
 if(w.endsWith('ves')&&w.length>4){add(w.slice(0,-3)+'f');add(w.slice(0,-3)+'fe')}
 if(w.endsWith('es')&&w.length>3){add(w.slice(0,-1));add(w.slice(0,-2))}
 if(w.endsWith('s')&&!w.endsWith('ss')&&w.length>3)add(w.slice(0,-1));
 if(w.endsWith('ing')&&w.length>5){let s=w.slice(0,-3);add(s);add(s+'e');if(s.length>2&&s.at(-1)===s.at(-2))add(s.slice(0,-1))}
 if(w.endsWith('ied')&&w.length>4)add(w.slice(0,-3)+'y');
 if(w.endsWith('ed')&&w.length>4){let s=w.slice(0,-2);add(s);add(s+'e');if(s.length>2&&s.at(-1)===s.at(-2))add(s.slice(0,-1))}
 return a;
}
function sentenceContext(){
 let sel=getSelection();if(!sel||!sel.rangeCount)return'';let n=sel.getRangeAt(0).commonAncestorContainer;if(n.nodeType===3)n=n.parentElement;
 let q=n.closest?.('.q');if(q){let lead=q.querySelector('b');if(lead)return (lead.innerText||lead.textContent||'').replace(/\\s+/g,' ').trim().slice(0,700)}
 let host=n.closest?.('p,li,.example,.passage,.notice,.production,.modalBody,.formula')||n;
 let txt=(host.innerText||host.textContent||'').replace(/\\s+/g,' ').trim(),chosen=sel.toString().trim(),parts=txt.match(/[^.!?]+[.!?]?/g)||[txt];
 return (parts.find(x=>x.toLowerCase().includes(chosen.toLowerCase()))||txt).slice(0,700);
}
function descape(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function rxEscape(s){return String(s).replace(/[|\\{}()[\]^$+*?.-]/g,'\\$&')}
function highlightWord(s,w){let x=descape(s);try{return x.replace(new RegExp('\\b('+rxEscape(dclean(w))+')\\b','i'),'<span class="hit">$1</span>')}catch(e){return x}}
function around(word,sentence){
 let s=(sentence||'').toLowerCase(),w=dclean(word),i=s.indexOf(w);if(i<0)return{prev:'',next:''};let b=s.slice(0,i),a=s.slice(i+w.length);
 return{prev:(b.match(/([a-z']+)\s*$/)||[])[1]||'',next:(a.match(/^\s*([a-z']+)/)||[])[1]||''};
}
function validVietnameseTranslation(source,translation){
 const x=String(translation||'').trim(),src=String(source||'').trim();
 if(!x||x.toLowerCase()===src.toLowerCase()||/MYMEMORY WARNING|PLEASE SELECT TWO DISTINCT LANGUAGES|TRANSLATION LIMIT/i.test(x))return false;
 // Reject obvious encyclopaedic / entertainment metadata, regardless of the searched word.
 if(/\b(?:song|album|single)\b.{0,85}\b(?:released|recorded|singer|sang by|performed by)\b/i.test(x)||
    /\b(?:released|recorded|singer|performed by)\b.{0,85}\b(?:song|album|single)\b/i.test(x)||
    /(?:bài hát|album|đĩa đơn).{0,75}(?:phát hành|ca sĩ|thu âm|trình bày|của tove lo)/i.test(x))return false;
 if(src.split(/\s+/).length<=2&&x.length>145)return false;
 return true;
}
async function translateText(t){
 t=String(t||'').trim();if(!t)return'';const k=t.toLowerCase();
 if(tcache[k])return tcache[k];
 try{
  const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(t.slice(0,450))+'&langpair=en%7Cvi');
  if(!r.ok)return'';
  const j=await r.json();
  const x=String(j?.responseData?.translatedText||'').trim();
  if(!validVietnameseTranslation(t,x))return'';
  tcache[k]=x;const keys=Object.keys(tcache);if(keys.length>320)delete tcache[keys[0]];
  try{localStorage.setItem(TCACHE_KEY,JSON.stringify(tcache))}catch(e){}
  return x;
 }catch(e){return''}
}

async function quickTranslate(t,ms=900){
 t=String(t||'').trim();if(!t)return'';
 let k=t.toLowerCase();if(tcache[k])return tcache[k];
 let timeout=new Promise(resolve=>setTimeout(()=>resolve(''),ms));
 try{return await Promise.race([translateText(t),timeout])||''}catch(e){return''}
}
function coreGroups(base){let x=CORE[base];if(!x)return[];return x.s.map(s=>({partOfSpeech:s[0],definitions:[{definition:s[2],vi:s[1],example:s[3]}]}))}
function mergeGroups(api,base){
 let groups=[],push=(pos,def)=>{let g=groups.find(x=>x.partOfSpeech===pos);if(!g){g={partOfSpeech:pos,definitions:[]};groups.push(g)}if(!g.definitions.some(x=>x.definition===def.definition))g.definitions.push(def)};
 (api||[]).forEach(g=>(g.definitions||[]).slice(0,4).forEach(d=>push(g.partOfSpeech||'unknown',{definition:d.definition||'',example:d.example||'',vi:''})));
 coreGroups(base).forEach(g=>g.definitions.forEach(d=>push(g.partOfSpeech,d)));
 return groups;
}

function datamusePOS(code){
 return ({n:'noun',v:'verb',adj:'adjective',adv:'adverb',u:'unknown'})[code]||code;
}
async function fetchDatamuse(base,sentence){
 try{
  let A=around(base,sentence||''),url='https://api.datamuse.com/words?sp='+encodeURIComponent(base)+'&md=dpr&ipa=1&max=6';
  if(A.prev)url+='&lc='+encodeURIComponent(A.prev);
  if(A.next)url+='&rc='+encodeURIComponent(A.next);
  let r=await fetch(url,{cache:'force-cache'});if(!r.ok)return null;
  let rows=await r.json(),row=rows.find(x=>String(x.word||'').toLowerCase()===base.toLowerCase());
  if(!row)return null;
  let groups=[],ensure=pos=>{let g=groups.find(x=>x.partOfSpeech===pos);if(!g){g={partOfSpeech:pos,definitions:[]};groups.push(g)}return g};
  (row.defs||[]).forEach(raw=>{
   let parts=String(raw).split('\t'),pos=datamusePOS(parts.length>1?parts.shift():'unknown'),definition=parts.join('\t').trim();
   if(definition)ensure(pos).definitions.push({definition:definition,example:'',vi:''});
  });
  let tags=row.tags||[];
  tags.filter(t=>['n','v','adj','adv','u'].includes(t)).forEach(t=>ensure(datamusePOS(t)));
  let pron=tags.find(t=>String(t).startsWith('ipa_pron:'))||tags.find(t=>String(t).startsWith('pron:'))||'';
  pron=pron.replace(/^ipa_pron:/,'').replace(/^pron:/,'').trim();
  let head=(row.defHeadword||base).toLowerCase();
  return {base:head,data:{groups:mergeGroups(groups,head),phonetic:pron,audio:'',source:'Datamuse / Wiktionary / WordNet'}};
 }catch(e){return null}
}

async function fetchFreeDictionary(base){
 try{
  let r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(base),{cache:'force-cache'});
  if(!r.ok)return null;
  let j=await r.json(),phon='',audio='',audios=[],api=[];
  const addAudio=(url,text)=>{
   if(!url||audios.some(x=>x.url===url))return;
   let u=String(url);if(u.startsWith('//'))u='https:'+u;if(u.startsWith('http:'))u='https:'+u.slice(5);
   let label=/(?:[-_/](?:uk|gb)(?:[-_./]|$)|_gb_)/i.test(u)?'UK':(/(?:[-_/]us(?:[-_./]|$)|_us_)/i.test(u)?'US':'Audio');
   audios.push({url:u,label:label,phonetic:text||''});
  };
  j.forEach(e=>{
   phon=phon||e.phonetic||(e.phonetics||[]).find(p=>p.text)?.text||'';
   (e.phonetics||[]).forEach(p=>{if(p.audio){addAudio(p.audio,p.text||'');audio=audio||p.audio}});
   (e.meanings||[]).forEach(m=>api.push(m));
  });
  return {base:base,data:{groups:mergeGroups(api,base),phonetic:phon,audio:audio,audios:audios,source:'Free Dictionary API'}};
 }catch(e){return null}
}


function timeoutPromise(p,ms){
 return Promise.race([p,new Promise(resolve=>setTimeout(()=>resolve(null),ms))]);
}
async function fetchData(surface,sentence){
 // Dictionary API covers the open vocabulary, not just the words in CORE.
 // CORE remains an instant offline fallback for grammatical words and common examples.
 const fastCore=new Set(['a','an','the','of','to','in','on','at','for','by','be','do','have','can','may','will','should','another']);
 for(const base of candidates(surface).slice(0,5)){
  const cached=dcache[base];
  if(cached?.groups?.some(g=>g.definitions?.length))return{base:cached.base||base,data:cached};
  if(fastCore.has(base)&&CORE[base])return{base,data:{groups:coreGroups(base),phonetic:'',audio:'',audios:[],source:'Từ điển tích hợp'}};
  // Prefer actual dictionary definitions/examples/IPA, then try a separate lexical source.
  let result=await timeoutPromise(fetchFreeDictionary(base),2300);
  if(!result?.data?.groups?.some(g=>g.definitions?.length))result=await timeoutPromise(fetchDatamuse(base,sentence),1700);
  if(result?.data?.groups?.some(g=>g.definitions?.length)){
   result.data.base=result.base;
   dcache[base]=result.data;
   const keys=Object.keys(dcache);if(keys.length>320)delete dcache[keys[0]];
   try{localStorage.setItem(DCACHE_KEY,JSON.stringify(dcache))}catch(e){}
   return result;
  }
  if(CORE[base])return{base,data:{groups:coreGroups(base),phonetic:'',audio:'',audios:[],source:'Từ điển tích hợp'}};
 }
 const base=candidates(surface)[0]||dclean(surface);
 return{base,data:{groups:[],phonetic:'',audio:'',audios:[],source:'Dịch dự phòng'}};
}
function inferPOS(surface,base,sentence,groups){
 let w=dclean(surface),A=around(surface,sentence),prev=A.prev,next=A.next,set=new Set(groups.map(g=>g.partOfSpeech)),fixed=FIXED[w];
 if(w==='access'&&set.has('noun')&&set.has('verb')){
  if(['improve','improves','improved','better','wider','greater','equal','the','an','their','our'].includes(prev)||next==='to')return'noun';
  if(['students','people','learners','users','they','we','you','i'].includes(prev)||['can','could','may','to'].includes(prev))return'verb';
 }
 if(w==='another')return next?'determiner':'pronoun';
 if(w==='in'){if(['come','go','walk','step','get'].includes(prev)&&!next)return'adverb';return set.has('preposition')?'preposition':(set.has('adverb')?'adverb':'preposition')}
 if(w==='read'){if(['a','an','the','this','that','another','good','great','interesting','quick'].includes(prev)&&set.has('noun'))return'noun';if(prev==='well'&&set.has('adjective'))return'adjective';return set.has('verb')?'verb':(set.has('noun')?'noun':'verb')}
 if(['a','an','the','this','that','these','those','my','your','his','her','our','their','its','another','each','every','some','any','many','few','several'].includes(prev)){if(next&&set.has('adjective'))return'adjective';if(set.has('noun'))return'noun'}
 if(['am','is','are','was','were','be','been','being'].includes(prev)&&w.endsWith('ing')&&set.has('verb'))return'verb';
 if(['have','has','had'].includes(prev)&&set.has('verb'))return'verb';
 if(['can','could','may','might','must','should','will','would'].includes(prev)&&set.has('verb'))return'verb';
 if(prev==='to'&&set.has('verb'))return'verb';
 if(['very','quite','extremely','highly','relatively','particularly'].includes(prev)){if(set.has('adjective'))return'adjective';if(set.has('adverb'))return'adverb'}
 if(w.endsWith('ly')&&set.has('adverb'))return'adverb';
 if(fixed){if(fixed==='article')return'article';if(set.has(fixed)||['modal','article'].includes(fixed))return fixed}
 if(base!==w&&w.endsWith('s')){if(set.has('noun')&&['a','an','the','these','those','many','more','several','two','three'].includes(prev))return'noun';if(set.has('verb'))return'verb'}
 if(set.has('verb')&&['i','you','we','they','he','she','it'].includes(prev))return'verb';
 return groups[0]?.partOfSpeech||fixed||(surface&&surface===surface.toUpperCase()?'proper noun / acronym':'unknown');
}
function formLabel(surface,base,pos){
 let w=dclean(surface);if(w===base)return base;
 if(w.endsWith('ing'))return surface+' → '+base+' (V-ing / present participle / gerund tùy ngữ cảnh)';
 if(w.endsWith('ed'))return surface+' → '+base+' (past / past participle)';
 if(w.endsWith('s')&&pos==='noun')return surface+' → '+base+' (danh từ số nhiều)';
 if(w.endsWith('s')&&pos==='verb')return surface+' → '+base+' (động từ ngôi 3 số ít)';
 return surface+' → '+base;
}
function roleInfo(surface,pos,sentence){
 let A=around(surface,sentence),prev=A.prev,next=A.next,w=dclean(surface),role='',pattern='',why='';
 if(pos==='preposition'){role='Giới thiệu prepositional phrase và nối noun phrase với phần còn lại của câu.';pattern=w+' + noun / noun phrase';why='Trong câu này từ đứng trước một thành phần danh từ nên hoạt động như giới từ.'}
 else if(pos==='determiner'||pos==='article'){role='Đứng trước danh từ để xác định, giới hạn hoặc chỉ số lượng/phạm vi.';pattern=w+' + noun';why='Vị trí trước danh từ cho thấy chức năng determiner/article.'}
 else if(pos==='pronoun'){role='Thay thế cho một noun/noun phrase.';pattern='pronoun + verb / verb + pronoun';why='Nó thay cho người/vật/ý đã được hiểu từ ngữ cảnh.'}
 else if(pos==='noun'){role=prev&&['in','on','at','of','for','from','with','by','to'].includes(prev)?'Danh từ làm object của preposition.':'Danh từ có thể làm subject, object hoặc complement.';pattern=(prev?prev+' ':'')+w+(next?' '+next:'');why='Vị trí trong noun phrase/mệnh đề cho thấy chức năng danh từ.'}
 else if(pos==='verb'||pos==='auxiliary'){role='Động từ/trợ động từ trong vị ngữ.';if(['am','is','are','was','were'].includes(prev)&&w.endsWith('ing')){pattern=prev+' + V-ing';why='be + V-ing tạo cấu trúc tiếp diễn.'}else if(['can','could','may','might','must','should','will','would'].includes(prev)){pattern=prev+' + base verb';why='Sau modal dùng base verb.'}else{pattern='subject + verb (+ object/complement)';why='Động từ là trung tâm của vị ngữ.'}}
 else if(pos==='adjective'){role='Bổ nghĩa cho noun hoặc làm subject complement sau linking verb.';pattern='adjective + noun / be + adjective';why='Vị trí cạnh noun hoặc sau linking verb cho thấy chức năng tính từ.'}
 else if(pos==='adverb'){role='Bổ nghĩa cho verb, adjective, adverb hoặc cả clause.';pattern=w.endsWith('ly')?'verb/adjective + adverb':'adverb position depends on meaning';why='Nó bổ sung thông tin về cách thức, tần suất, thời gian, mức độ hoặc thái độ.'}
 else if(pos==='conjunction'){role='Nối hai từ/cụm/mệnh đề và thể hiện quan hệ logic.';pattern='clause + '+w+' + clause';why='Chức năng là nối ý.'}
 else if(pos==='modal'){role='Modal verb bổ sung ý nghĩa khả năng, lời khuyên, nghĩa vụ hoặc dự đoán.';pattern=w+' + base verb';why='Modal được theo sau bởi base verb.'}
 else{role='Chức năng được suy đoán từ vị trí trong câu.';pattern=[prev,w,next].filter(Boolean).join(' ');why='Nếu từ có nhiều chức năng, xem danh sách loại từ bên dưới để so sánh.'}
 return{role:role,pattern:pattern,why:why};
}
function scoreDefinition(def,sentence,word){
 if(!sentence)return 0;
 const stop=new Set(['the','a','an','and','or','to','of','in','on','at','for','with','is','are','was','were','be','this','that','it','as','by','you','they','we','he','she','my']);
 const target=dclean(word),context=String(sentence||'').toLowerCase();
 const words=(context.match(/[a-z']+/g)||[]).filter(x=>!stop.has(x)&&x!==target);
 const text=(String(def.definition||'')+' '+String(def.example||'')).toLowerCase();
 const tokens=text.match(/[a-z']+/g)||[],set=new Set(tokens);
 let score=0;
 // Topic-word overlap is a weak signal; adjacent-word collocations are stronger.
 for(const w of new Set(words))if(w.length>2&&set.has(w))score+=1;
 const aroundWord=around(word,sentence);
 if(aroundWord.prev&&set.has(aroundWord.prev))score+=3;
 if(aroundWord.next&&set.has(aroundWord.next))score+=3;
 if(def.example){
  const ex=String(def.example).toLowerCase();
  if(aroundWord.prev&&ex.includes(aroundWord.prev+' '+target))score+=6;
  if(aroundWord.next&&ex.includes(target+' '+aroundWord.next))score+=6;
 }
 return score;
}
function posLearningInfo(pos,base){
 const special={
  review:{
   noun:{use:'Chỉ một lần ôn tập, xem xét hoặc bài đánh giá.',position:'Thường sau article/determiner; có thể làm subject hoặc object.',pattern:'do / conduct / write + a review • review of + noun',example:'I did a quick review before the test.'},
   verb:{use:'Diễn tả hành động xem lại, ôn lại hoặc đánh giá.',position:'Đứng sau subject; sau modal dùng base form; có thể đi với object trực tiếp.',pattern:'review + noun • review for + exam • review what/how/why...',example:'I review my grammar mistakes every evening.'}
  },
  read:{
   noun:{use:'Chỉ một lần đọc hoặc một thứ đáng đọc.',position:'Thường sau article/adjective và làm subject/object.',pattern:'a good / useful / quick read',example:'This article is a useful read.'},
   verb:{use:'Diễn tả hành động đọc và hiểu chữ viết.',position:'Làm main verb; có thể có object trực tiếp.',pattern:'read + noun • read about + topic • read for + purpose',example:'I read English articles every day.'},
   adjective:{use:'Mô tả người có kiến thức nhờ đọc nhiều, thường trong compound “well-read”.',position:'Đứng trước noun hoặc sau be.',pattern:'well-read + noun • be well-read',example:'She is a well-read student.'}
  },
  in:{
   preposition:{use:'Diễn tả vị trí, thời gian, trạng thái hoặc lĩnh vực.',position:'Đứng trước noun/noun phrase.',pattern:'in + place / month / situation / field',example:'She is in the classroom.'},
   adverb:{use:'Diễn tả chuyển động hoặc trạng thái hướng vào bên trong.',position:'Thường sau verb; không cần noun theo sau.',pattern:'come in • go in • get in',example:'Come in.'},
   adjective:{use:'Mô tả thứ đang hợp thời hoặc đang được ưa chuộng.',position:'Thường sau be.',pattern:'be in',example:'That style is in.'},
   noun:{use:'Chỉ một mối quan hệ/lợi thế giúp tiếp cận hoặc có ảnh hưởng, khá informal.',position:'Thường sau article.',pattern:'have an in with + person/group',example:'He has an in with the organisers.'}
  },
  another:{
   determiner:{use:'Chỉ thêm một hoặc một đối tượng khác.',position:'Đứng trước singular countable noun.',pattern:'another + singular noun',example:'Can I have another example?'},
   pronoun:{use:'Thay thế cho “another + noun” khi noun đã rõ từ ngữ cảnh.',position:'Đứng độc lập ở vị trí subject/object.',pattern:'one ... another • choose another',example:'One answer is correct; another is not.'}
  }
 };
 if(special[base]&&special[base][pos])return special[base][pos];

 const generic={
  noun:{use:'Dùng để gọi tên người, vật, ý tưởng, quá trình hoặc sự việc.',position:'Có thể làm subject, object, complement; thường đi sau article/determiner/adjective.',pattern:'article/determiner + noun • adjective + noun • verb + noun',example:'The noun can be the subject or object of a sentence.'},
  verb:{use:'Dùng để diễn tả hành động, trạng thái hoặc quá trình.',position:'Thường đứng sau subject; sau modal dùng base verb; có thể đi với object/complement.',pattern:'subject + verb (+ object/complement)',example:'The verb carries the main action of the clause.'},
  adjective:{use:'Dùng để mô tả hoặc phân loại noun.',position:'Thường đứng trước noun hoặc sau linking verbs như be, seem, become.',pattern:'adjective + noun • be/seem/become + adjective',example:'The adjective describes a noun or subject.'},
  adverb:{use:'Dùng để bổ nghĩa cho verb, adjective, adverb khác hoặc cả clause.',position:'Vị trí thay đổi theo loại adverb; nhiều adverb cách thức đứng sau verb/object.',pattern:'verb + adverb • adverb + adjective • sentence adverb',example:'The adverb adds information about how, when or to what degree.'},
  preposition:{use:'Dùng để tạo quan hệ giữa noun phrase với phần còn lại của câu.',position:'Đứng trước noun/pronoun/noun phrase.',pattern:'preposition + noun phrase',example:'A preposition introduces a prepositional phrase.'},
  determiner:{use:'Dùng để xác định, giới hạn hoặc chỉ số lượng của noun.',position:'Đứng trước noun, trước adjective nếu có.',pattern:'determiner + (adjective) + noun',example:'A determiner comes before a noun.'},
  pronoun:{use:'Dùng thay cho noun hoặc noun phrase.',position:'Có thể đứng ở vị trí subject hoặc object.',pattern:'pronoun + verb • verb + pronoun',example:'A pronoun replaces a noun phrase.'},
  auxiliary:{use:'Hỗ trợ main verb để tạo tense, question, negative, passive hoặc emphasis.',position:'Đứng trước main verb.',pattern:'auxiliary + main verb',example:'Auxiliary verbs help form grammatical structures.'},
  modal:{use:'Thêm ý nghĩa khả năng, lời khuyên, nghĩa vụ hoặc dự đoán.',position:'Đứng trước base verb.',pattern:'modal + base verb',example:'Students should revise regularly.'},
  conjunction:{use:'Nối từ, cụm từ hoặc mệnh đề và thể hiện quan hệ logic.',position:'Đứng giữa hai thành phần được nối.',pattern:'clause + conjunction + clause',example:'Although it is difficult, it is useful.'},
  article:{use:'Xác định noun là cụ thể hay chưa xác định.',position:'Đứng trước singular countable noun hoặc noun phrase.',pattern:'a/an/the + noun phrase',example:'I bought a book.'}
 };
 return generic[pos]||{use:'Công dụng phụ thuộc vào ngữ cảnh.',position:'Xem vị trí của từ trong câu.',pattern:base,example:''};
}
async function wordFamilyHTML(surface,base,groups){
 let chips=[];
 if(groups.some(g=>g.partOfSpeech==='verb')){
  chips.push(base);
  if(!base.endsWith('s'))chips.push(base+'s');
  let ing=base.endsWith('e')&&!base.endsWith('ee')?base.slice(0,-1)+'ing':base+'ing';
  let ed=base.endsWith('e')?base+'d':base+'ed';
  if(base==='read'){ing='reading';ed='read'}
  chips.push(ing,ed);
 }
 if(groups.some(g=>g.partOfSpeech==='noun'))chips.push(base,base.endsWith('s')?base:base+'s');

 let order=['noun','verb','adjective','adverb','preposition','determiner','pronoun','auxiliary','modal','conjunction','article'];
 let groupMap=new Map(groups.map(g=>[g.partOfSpeech,g]));
 let sections='';

 for(let pos of order){
  let g=groupMap.get(pos);
  if(!g)continue;
  let info=posLearningInfo(pos,base),d=g.definitions?.[0]||{},meaning=d.vi||'';
  if(!meaning)meaning=await translateText(d.definition||'');
  sections+='<div class="posCard" style="margin-top:10px">'+
    '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">'+
      '<b style="font-size:16px">'+descape(POSVI[pos]||pos)+'</b><span class="posBadge">'+descape(pos)+'</span>'+
    '</div>'+
    (meaning?'<div class="vi" style="margin-top:7px"><b>Nghĩa:</b> '+descape(meaning)+'</div>':'')+
    '<div class="usage" style="margin-top:8px">'+
      '<b>Công dụng</b><span>'+descape(info.use)+'</span>'+
      '<b>Vị trí thường gặp</b><span>'+descape(info.position)+'</span>'+
      '<b>Pattern</b><span><code>'+descape(info.pattern)+'</code></span>'+
      '<b>Ví dụ</b><span>'+descape(d.example||info.example||'')+'</span>'+
    '</div>'+
  '</div>';
 }

 const coreFour=['noun','verb','adjective','adverb'];
 let unavailable=coreFour.filter(p=>!groupMap.has(p));
 let note=unavailable.length?
  '<div class="en" style="margin-top:10px"><b>Lưu ý:</b> “'+descape(base)+'” không có cách dùng phổ biến được nguồn từ điển ghi nhận như '+unavailable.map(p=>POSVI[p]||p).join(', ')+'. Không phải từ nào cũng có đủ noun / verb / adjective / adverb.</div>':'';

 return '<div>'+
   (chips.length?'<div><b>Dạng biến đổi:</b><div style="margin-top:7px">'+[...new Set(chips)].slice(0,10).map(x=>'<span class="posBadge">'+descape(x)+'</span>').join(' ')+'</div></div>':'')+
   '<div style="margin-top:12px"><b>Công dụng theo từng loại từ</b></div>'+
   sections+note+
 '</div>';
}

const FAMILY_CACHE_KEY='ielts_family_v5',FAMILY_CACHE=(()=>{try{return JSON.parse(localStorage.getItem(FAMILY_CACHE_KEY)||'{}')}catch(e){return{}}})();
function titleWord(w){return w?String(w).charAt(0).toUpperCase()+String(w).slice(1):''}
function memoryTip(base){
 let w=base.toLowerCase();
 if(w.endsWith('er')&&w.length>4)return '<b>'+descape(w.slice(0,-2))+' + er → '+descape(w)+'</b> = người/vật thực hiện hành động hoặc có vai trò đó.';
 if(w.endsWith('ee')&&w.length>4)return '<b>'+descape(w.slice(0,-2))+' + ee → '+descape(w)+'</b> = người nhận/chịu hành động.';
 if(w.endsWith('ment')&&w.length>6)return '<b>'+descape(w.slice(0,-4))+' + ment → '+descape(w)+'</b> = biến ý/hành động thành danh từ.';
 if(w.endsWith('ness')&&w.length>6)return '<b>'+descape(w.slice(0,-4))+' + ness → '+descape(w)+'</b> = trạng thái/tính chất.';
 if(w.endsWith('ly')&&w.length>4)return '<b>'+descape(w.slice(0,-2))+' + ly → '+descape(w)+'</b> = thường biến adjective thành adverb.';
 if(w.startsWith('un')&&w.length>4)return '<b>un- + '+descape(w.slice(2))+' → '+descape(w)+'</b> = thường mang nghĩa “không / ngược lại”.';
 if(w.endsWith('ed')&&w.length>4)return '<b>'+descape(w.slice(0,-2))+' + ed</b> = dạng quá khứ/past participle hoặc adjective tùy câu.';
 if(w.endsWith('ing')&&w.length>5)return '<b>'+descape(w.slice(0,-3))+' + ing</b> = V-ing; có thể là verb form, gerund hoặc adjective tùy câu.';
 return '<b>'+descape(base)+'</b>: nhớ bằng nghĩa chính + một câu ví dụ thật, thay vì học nghĩa rời.';
}
function familyRoots(base){
 let w=base.toLowerCase(),roots=[w],add=x=>{if(x&&x.length>2&&!roots.includes(x))roots.push(x)};
 if(w.endsWith('er')&&w.length>4)add(w.slice(0,-2));
 if(w.endsWith('ee')&&w.length>4)add(w.slice(0,-2));
 if(w.endsWith('ment')&&w.length>6)add(w.slice(0,-4));
 if(w.endsWith('ness')&&w.length>6)add(w.slice(0,-4));
 if(w.endsWith('ly')&&w.length>4)add(w.slice(0,-2));
 if(w.startsWith('un')&&w.length>4)add(w.slice(2));
 if(w.endsWith('ed')&&w.length>4){add(w.slice(0,-2));add(w.slice(0,-1))}
 if(w.endsWith('ing')&&w.length>5){add(w.slice(0,-3));add(w.slice(0,-3)+'e')}
 if(w.endsWith('ant')&&w.length>5)add(w.slice(0,-3));
 if(w.endsWith('ent')&&w.length>5)add(w.slice(0,-3));
 return roots.slice(0,3);
}
function familyCandidates(base){
 let roots=familyRoots(base),arr=[base],add=x=>{if(x&&x.length>2&&!arr.includes(x))arr.push(x)};
 roots.forEach(r=>{
  [r,r+'er',r+'ee',r+'ment',r+'ness',r+'ful',r+'less',r+'able',r+'ive',r+'al',r+'ly',r+'ed',r+'ing',r+'ation',r+'ant','un'+r,'un'+r+'ed','un'+r+'ment'].forEach(add);
 });
 if(base.endsWith('ant')){let r=base.slice(0,-3);add(r+'ance');add(base+'ly')}
 if(base.endsWith('ent')){let r=base.slice(0,-3);add(r+'ence');add(base+'ly')}
 if(base.endsWith('ic'))add(base+'ally');
 if(base.endsWith('y')){add(base.slice(0,-1)+'iness');add(base.slice(0,-1)+'ily')}
 if(base==='employer'){['employ','employee','employment','employed','unemployed','unemployment'].forEach(add)}
 return arr.slice(0,20);
}

async function exactLexical(word){
 try{
  let r=await fetch('https://api.datamuse.com/words?sp='+encodeURIComponent(word)+'&md=pfd&max=4',{cache:'force-cache'});
  if(!r.ok)return null;
  let rows=await r.json(),row=rows.find(x=>String(x.word||'').toLowerCase()===word.toLowerCase());
  if(!row)return null;
  let defs=row.defs||[],posSet=new Set(),freq=0;
  defs.forEach(d=>{let p=String(d).split('\t')[0];if(p==='n')posSet.add('noun');else if(p==='v')posSet.add('verb');else if(p==='adj')posSet.add('adjective');else if(p==='adv')posSet.add('adverb')});
  (row.tags||[]).forEach(p=>{
   if(p==='n')posSet.add('noun');else if(p==='v')posSet.add('verb');else if(p==='adj')posSet.add('adjective');else if(p==='adv')posSet.add('adverb');
   if(String(p).startsWith('f:'))freq=parseFloat(String(p).slice(2))||freq;
  });
  let definition=defs[0]?String(defs[0]).replace(/^[^\t]+\t/,''):'';
  return {word:word,pos:[...posSet],definition:definition,frequency:freq};
 }catch(e){return null}
}


async function chatStyleFamily(base){
 if(FAMILY_CACHE[base])return FAMILY_CACHE[base];
 let cand=familyCandidates(base).slice(0,12);
 let rows=await Promise.all(cand.map(exactLexical)),valid=rows.filter(Boolean);
 valid=valid.filter(x=>x.word===base || x.frequency>=0.08);
 valid.sort((a,b)=>(a.word===base?-1:0)-(b.word===base?-1:0) || (b.frequency||0)-(a.frequency||0));
 let seen=new Set(),chosen=[];
 for(let x of valid){
  if(seen.has(x.word))continue;seen.add(x.word);chosen.push(x);
  if(chosen.length>=7)break;
 }
 let out=await Promise.all(chosen.map(async x=>{
  let vals=await Promise.all([quickTranslate(x.word,700),x.definition?quickTranslate(x.definition,800):Promise.resolve('')]);
  return {word:x.word,pos:x.pos[0]||'other',easy:vals[0]||vals[1]||'',precise:vals[1]||'',frequency:x.frequency||0};
 }));
 FAMILY_CACHE[base]=out;try{localStorage.setItem(FAMILY_CACHE_KEY,JSON.stringify(FAMILY_CACHE))}catch(e){}
 return out;
}
function usagePatterns(base,pos,groups){
 let g=groups?.find(x=>x.partOfSpeech===pos)||groups?.[0],defs=(g?.definitions||[]).map(x=>String(x.definition||'').toLowerCase()).join(' ');
 let patterns=[];
 if(pos==='verb'){
  let intr=/intransitive/.test(defs),tr=/transitive/.test(defs);
  if(intr)patterns.push('subject + '+base);
  if(tr)patterns.push(base+' + object');
  if(!intr&&!tr)patterns.push('subject + '+base+' (+ object/complement)');
  patterns.push('to + '+base);
  patterns.push('modal + '+base);
 }else if(pos==='noun'){
  patterns.push('a/an/the + '+base);
  patterns.push('adjective + '+base);
 }else if(pos==='adjective'){
  patterns.push(base+' + noun');
  patterns.push('be / seem / become + '+base);
 }else if(pos==='adverb'){
  patterns.push('verb + '+base);
  patterns.push(base+' + adjective / clause');
 }else{
  let s=posLearningInfo(pos||'noun',base);
  patterns=String(s.pattern||'').split('•').map(x=>x.trim()).filter(Boolean);
 }
 return [...new Set(patterns)].slice(0,4);
}
function fallbackExamples(base,pos,definition){
 let d=(definition||'').toLowerCase();
 if(pos==='noun'&&/(person|people|company|firm|organisation|organization|entity)/.test(d))return[
  'I spoke to the '+base+' yesterday.',
  'The '+base+' is responsible for this decision.',
  'Please contact the '+base+' for more information.'
 ];
 if(pos==='noun')return[
  'The '+base+' is important in this context.',
  'We discussed the '+base+' in class.',
  'This example shows the importance of '+base+'.'
 ];
 if(pos==='verb')return[
  'I '+base+' this every day.',
  'Students often '+base+' information before a test.',
  'It is useful to '+base+' carefully.'
 ];
 if(pos==='adjective')return[
  'This is a '+base+' issue.',
  'The result was '+base+'.',
  'It is important to consider the '+base+' factors.'
 ];
 if(pos==='adverb')return[
  'The figure changed '+base+'.',
  'She explained the idea '+base+'.',
  'The task was completed '+base+'.'
 ];
 return['Here is an example using '+base+'.'];
}


async function chatStyleExamples(base,groups,sentence,pos){
 let found=[];
 if(sentence)found.push(sentence);
 let preferred=groups.find(x=>x.partOfSpeech===pos);
 let ordered=preferred?[preferred].concat(groups.filter(x=>x!==preferred)):groups;
 ordered.forEach(g=>(g.definitions||[]).forEach(d=>{if(d.example&&!found.includes(d.example))found.push(d.example)}));
 let top=found.slice(0,3),translations=await Promise.all(top.map(en=>quickTranslate(en,800)));
 return top.map((en,i)=>({en:en,vi:translations[i]||''}));
}


function aiPOSLabel(pos){return POSVI[String(pos||'').toLowerCase()]||pos||'—';}
function quickDictionaryHTML(base,sentence,meaning,definition,coreSense,pos,definitionVi){
 const english=String(definition?.definition||coreSense?.[2]||'').trim();
 const example=String(definition?.example||coreSense?.[3]||'').trim();
 const safeMeaning=String(meaning||'').trim(),senseVi=String(definitionVi||'').trim();
 const primary=safeMeaning?'<p><b>'+descape(base)+'</b>: <strong>'+descape(safeMeaning)+'</strong></p>':
  '<p>Chưa tìm được nghĩa tiếng Việt đáng tin cậy cho <b>'+descape(base)+'</b>. Bạn có thể xem định nghĩa tiếng Anh hoặc từ điển bên ngoài.</p>';
 const contextNote=sentence&&senseVi&&senseVi.toLowerCase()!==safeMeaning.toLowerCase()?
  '<p class="dictQuickNote"><b>Trong ngữ cảnh này:</b> '+descape(senseVi.slice(0,190))+'</p>':'';
 return '<section class="dictQuickAnswer">'+primary+contextNote+
   (sentence?'<div class="dictQuickContext"><small>Câu đang đọc</small><p>'+highlightWord(String(sentence).slice(0,260),base)+'</p></div>':'')+
   (english?'<p class="dictQuickEnglish"><b>English:</b> '+descape(english.slice(0,175))+'</p>':'')+
   (example&&example.trim().toLowerCase()!==String(sentence||'').trim().toLowerCase()?
     '<p class="dictQuickExample"><b>Example:</b> '+descape(example.slice(0,185))+'</p>':'')+
 '</section>';
}
function otherMeaningsHTML(groups,selectedPos,selectedDefinition){
 const seen=new Set(),other=[];
 for(const g of groups){
  for(const d of (g.definitions||[]).slice(0,4)){
   if(!d.definition||(g.partOfSpeech===selectedPos&&d.definition===selectedDefinition))continue;
   const key=g.partOfSpeech+'|'+d.definition.toLowerCase();if(seen.has(key))continue;seen.add(key);
   other.push({pos:g.partOfSpeech,en:d.definition});
   if(other.length===5)break;
  }
  if(other.length===5)break;
 }
 if(!other.length)return'';
 return '<details class="dictOtherMeanings"><summary>Xem nghĩa và loại từ khác ('+other.length+')</summary><div class="dictOtherList">'+
   other.map(x=>'<div class="dictOtherItem"><b>'+descape(POSVI[x.pos]||x.pos)+'</b><span>'+descape(x.en.slice(0,180))+
   '</span><small class="dictOtherVi" data-en="'+descape(x.en.slice(0,350))+'"></small></div>').join('')+'</div></details>';
}
function bindOtherMeanings(target){
 const details=target.querySelector('.dictOtherMeanings');
 if(!details)return;
 details.addEventListener('toggle',async()=>{
  if(!details.open||details.dataset.translated)return;
  details.dataset.translated='1';
  const items=[...details.querySelectorAll('.dictOtherVi')];
  await Promise.all(items.map(async item=>{
   const text=await quickTranslate(item.dataset.en,1500);
   if(text&&details.isConnected)item.textContent='→ '+text.slice(0,170);
  }));
 });
}
const PRON_AUDIO_CACHE={};
function googleTtsURL(base,accent){
 let tl=accent==='UK'?'en-GB':'en-US';
 return 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl='+encodeURIComponent(tl)+'&q='+encodeURIComponent(base);
}
function dictionaryAudioButtons(audios,base){
 PRON_AUDIO_CACHE[base]=(audios||[]).filter(x=>x&&x.url);
 return '<button class="btn dictPronBtn" data-accent="UK" data-word="'+descape(base)+'" type="button">🔊 UK</button>'+
        '<button class="btn dictPronBtn" data-accent="US" data-word="'+descape(base)+'" type="button">🔊 US</button>';
}
function chooseEnglishVoice(accent){
 let voices=speechSynthesis.getVoices()||[],lang=accent==='UK'?'en-GB':'en-US';
 return voices.find(v=>v.lang===lang&&/Google/i.test(v.name))||
        voices.find(v=>v.lang===lang)||
        voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith(accent==='UK'?'en-gb':'en-us'))||
        voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith('en'))||null;
}
function speakBrowserEnglish(word,accent){
 try{
  speechSynthesis.cancel();
  let u=new SpeechSynthesisUtterance(word),v=chooseEnglishVoice(accent);
  u.lang=accent==='UK'?'en-GB':'en-US';u.rate=.82;u.pitch=1;u.volume=1;
  if(v)u.voice=v;
  speechSynthesis.speak(u);
  return true;
 }catch(e){return false}
}
function playRecordedOrGoogle(word,accent,btn){
 let list=PRON_AUDIO_CACHE[word]||[];
 let rec=list.find(x=>x.label===accent)||list[0];
 const fallbackGoogle=()=>{
  let audio=new Audio();audio.preload='auto';audio.referrerPolicy='no-referrer';
  let done=false,timer=setTimeout(()=>{if(done)return;done=true;try{audio.pause()}catch(e){};speakBrowserEnglish(word,accent)},1200);
  audio.onplaying=()=>{done=true;clearTimeout(timer)};
  audio.onerror=()=>{if(done)return;done=true;clearTimeout(timer);speakBrowserEnglish(word,accent)};
  audio.src=googleTtsURL(word,accent);
  try{let p=audio.play();if(p&&p.catch)p.catch(()=>{if(!done){done=true;clearTimeout(timer);speakBrowserEnglish(word,accent)}})}catch(e){clearTimeout(timer);speakBrowserEnglish(word,accent)}
 };
 if(rec&&rec.url){
  let audio=new Audio();audio.preload='auto';audio.referrerPolicy='no-referrer';let done=false;
  let timer=setTimeout(()=>{if(done)return;done=true;try{audio.pause()}catch(e){};fallbackGoogle()},1000);
  audio.onplaying=()=>{done=true;clearTimeout(timer)};
  audio.onerror=()=>{if(done)return;done=true;clearTimeout(timer);fallbackGoogle()};
  audio.src=String(rec.url).replace(/^\/\//,'https://').replace(/^http:/,'https:');
  try{let p=audio.play();if(p&&p.catch)p.catch(()=>{if(!done){done=true;clearTimeout(timer);fallbackGoogle()}})}catch(e){clearTimeout(timer);fallbackGoogle()}
 }else fallbackGoogle();
}
function bindDictionaryAudio(target){
 target.querySelectorAll('.dictPronBtn').forEach(btn=>btn.onclick=()=>{
  let original=btn.textContent;btn.textContent='🔊...';
  playRecordedOrGoogle(btn.dataset.word,btn.dataset.accent,btn);
  setTimeout(()=>btn.textContent=original,650);
 });
}
async function hydrateRecordedPronunciation(base){
 if((PRON_AUDIO_CACHE[base]||[]).length)return;
 let fd=await timeoutPromise(fetchFreeDictionary(base),2200);
 if(fd&&fd.data&&fd.data.audios&&fd.data.audios.length)PRON_AUDIO_CACHE[base]=fd.data.audios;
}
async function renderDictionary(surface,targetId,sentence){
 const target=document.getElementById(targetId);if(!target)return;
 surface=String(surface||'').trim();if(!surface)return;
 const requestToken=Date.now()+'-'+Math.random();
 target.dataset.dictRequest=requestToken;
 target.innerHTML='<div class="dictLoadingHead"><div class="dictWord">'+descape(surface)+'</div><div class="muted">Đang tra từ miễn phí…</div></div>';
 const got=await fetchData(surface,sentence);
 if(target.dataset.dictRequest!==requestToken)return;
 const base=got.base||dclean(surface),groups=got.data.groups||[];
 const pos=sentence?inferPOS(surface,base,sentence,groups):(groups[0]?.partOfSpeech||FIXED[base]||'');
 const group=(pos?groups.find(x=>x.partOfSpeech===pos):null)||groups[0];
 const definitions=(group?.definitions||[]).slice().sort((a,b)=>scoreDefinition(b,sentence,base)-scoreDefinition(a,sentence,base));
 const def=definitions[0]||{},coreSense=(pos?CORE[base]?.s.find(x=>x[0]===pos):null)||CORE[base]?.s?.[0];
 const cleanDefinition=String(def.definition||coreSense?.[2]||'')
  .replace(/^\((?:intransitive|transitive|countable|uncountable|informal|formal|dated|archaic)[^)]*\)\s*/i,'').trim();
 // A short free translation of the chosen *definition* is more useful in context
 // than a bare translation of an ambiguous headword (e.g., bank, charge).
 const [wordVi,senseVi]=await Promise.all([
   coreSense?.[1]?Promise.resolve(coreSense[1]):quickTranslate(base,1350),
   cleanDefinition?quickTranslate(cleanDefinition.slice(0,350),1550):Promise.resolve('')
 ]);
 if(target.dataset.dictRequest!==requestToken)return;
 const polysemous=!!sentence&&(!CORE[base])&&((group?.definitions?.length||0)>1||groups.length>1);
 let primary=polysemous&&senseVi?senseVi:(coreSense?.[1]||wordVi||senseVi||'');
 // Do not show song/artist metadata for *any* ordinary vocabulary item.
 if(!validVietnameseTranslation(base,primary)&&!coreSense?.[1])primary=senseVi||'';
 if(window.cleanSavedMeaning)primary=window.cleanSavedMeaning(base,primary)||'';
 let currentPOS=pos||group?.partOfSpeech||'';
 if(currentPOS==='unknown')currentPOS='';
 const meaningForSave=String(primary||'').slice(0,190);
 target.innerHTML='<div class="dictHeaderLine"><div><div class="dictWord">'+descape(titleWord(surface))+'</div>'+
   '<div class="dictMetaLine">'+
     (got.data.phonetic?'<span class="phonetic">'+descape(got.data.phonetic)+'</span>':'')+
     (currentPOS?'<span class="posBadge">'+descape(aiPOSLabel(currentPOS))+'</span>':'')+
     (base&&dclean(surface)!==base?'<span class="dictBase">gốc: <b>'+descape(base)+'</b></span>':'')+
   '</div></div></div>'+
   '<div class="dictActions">'+dictionaryAudioButtons(got.data.audios,base)+
     '<button class="save" id="dictSaveWord" data-meaning="'+descape(meaningForSave)+'">⭐ Lưu từ</button>'+
     '<a target="_blank" rel="noopener" href="https://dictionary.cambridge.org/dictionary/english/'+encodeURIComponent(base)+'">Cambridge ↗</a>'+
   '</div>'+
   quickDictionaryHTML(base,sentence,primary,def,coreSense,currentPOS,senseVi)+
   otherMeaningsHTML(groups,currentPOS,def.definition)+
   '<small class="dictQuickSource">Dữ liệu từ điển + dịch máy miễn phí; không gọi AI khi tra từ. Lưu từ để luyện sâu hơn.</small>';
 bindDictionaryAudio(target);bindOtherMeanings(target);hydrateRecordedPronunciation(base);
 const saveBtn=target.querySelector('.dictActions .save');
 if(saveBtn)saveBtn.onclick=function(){
   const raw=this.dataset.meaning||meaningForSave;
   const m=window.cleanSavedMeaning?window.cleanSavedMeaning(base,raw):raw;
   const oldSaved=st.saved[base]||{};
   st.saved[base]={...oldSaved,w:base,m:m||'',savedAt:Number(oldSaved.savedAt)||Date.now(),
     context:(window.isOffTopicSavedText&&window.isOffTopicSavedText(String(sentence||'').trim()||oldSaved.context))?'':(String(sentence||'').trim()||oldSaved.context||''),
     updatedAt:Date.now()};
   save();renderSaved();this.textContent='✓ Đã lưu';
 };
}
window.lookupDictionary=function(raw,targetId='dictResult',sentence=''){let w=(raw||'').trim();if(!w)return;dict.classList.add('open');dict.classList.remove('min');let fi=document.getElementById('dictFloatInput');if(fi)fi.value=w;return renderDictionary(w,targetId,sentence)};
window.toggleDictionary=function(force){let open=force===undefined?!dict.classList.contains('open'):!!force;dict.classList.toggle('open',open)};
window.dictMinimize=function(){dict.classList.toggle('min')};
window.dictMaximize=function(){dict.classList.toggle('max')};
let dg=false,dx=0,dy=0;
try{let p=JSON.parse(localStorage.getItem(DPOS_KEY)||'null');if(p){dict.style.left=p.left+'px';dict.style.top=p.top+'px';dict.style.right='auto';dict.style.bottom='auto';if(p.width)dict.style.width=p.width+'px';if(p.height)dict.style.height=p.height+'px'}}catch(e){}
hd.onpointerdown=e=>{if(e.target.closest('button')||dict.classList.contains('max'))return;let r=dict.getBoundingClientRect();dg=true;dx=e.clientX-r.left;dy=e.clientY-r.top;hd.setPointerCapture?.(e.pointerId)};
hd.onpointermove=e=>{if(!dg)return;let l=Math.max(0,Math.min(innerWidth-dict.offsetWidth,e.clientX-dx)),t=Math.max(0,Math.min(innerHeight-dict.offsetHeight,e.clientY-dy));dict.style.left=l+'px';dict.style.top=t+'px';dict.style.right='auto';dict.style.bottom='auto'};
hd.onpointerup=()=>{if(!dg)return;dg=false;let r=dict.getBoundingClientRect();localStorage.setItem(DPOS_KEY,JSON.stringify({left:r.left,top:r.top,width:r.width,height:r.height}))};
document.getElementById('dictButton').onclick=()=>toggleDictionary();
document.getElementById('dictClose').onclick=()=>toggleDictionary(false);
document.getElementById('dictMin').onclick=e=>{e.stopPropagation();dictMinimize()};
document.getElementById('dictMax').onclick=e=>{e.stopPropagation();dictMaximize()};
document.getElementById('dictGo').onclick=()=>{let di=document.getElementById('dictInput'),fi=document.getElementById('dictFloatInput');lookupDictionary(di?.value||fi?.value||'','dictResult','')};
let di=document.getElementById('dictInput');if(di)di.onkeydown=e=>{if(e.key==='Enter')lookupDictionary(di.value,'dictResult','')};
document.addEventListener('dblclick',()=>{
 let sel=(getSelection()?.toString()||'').trim();if(!sel||!/[A-Za-z]/.test(sel)||sel.split(/\s+/).length>1)return;
 lookupDictionary(sel,'dictResult',sentenceContext());
});

let dpg=document.getElementById('dictPageGo');
if(dpg)dpg.onclick=()=>lookupDictionary(document.getElementById('dictPageInput').value,'dictPageResult','');
let dpi=document.getElementById('dictPageInput');
if(dpi)dpi.onkeydown=e=>{if(e.key==='Enter')lookupDictionary(dpi.value,'dictPageResult','')};
renderReview();initErrorNotes();
document.getElementById('search').oninput=e=>{let q=e.target.value.toLowerCase(),d=days.find(x=>JSON.stringify(x).toLowerCase().includes(q));if(d){renderToday(d.day);show('today')}};
renderDays();renderToday();renderRoadmap();renderGrammar();renderSaved();progress();
