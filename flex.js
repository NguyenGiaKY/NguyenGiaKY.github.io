
(function(){
const FLEX_KEY='ielts_flexible_skill_v1';
let fs={};
try{fs=JSON.parse(localStorage.getItem(FLEX_KEY)||'{}')}catch(e){}
fs.done=fs.done||{};
fs.queue=fs.queue||[];
fs.queueSize=[2,4,6].includes(Number(fs.queueSize))?Number(fs.queueSize):4;
fs.scores=fs.scores||{listening:[],reading:[],writing:[],speaking:[]};
fs.listenVocab=fs.listenVocab||{mastered:{},missed:{}};
fs.taskProgress=fs.taskProgress||{};
fs.phase=fs.phase||'foundation';
const saveFlex=()=>localStorage.setItem(FLEX_KEY,JSON.stringify(fs));

const modules={
 listening:[
  {id:'L1',title:'Decode English sounds',goal:'Nghe ra từ thật trước khi nghĩ tới đáp án.',tasks:[
   ['L1a','Names, numbers & spelling','Luyện tên riêng, số, ngày tháng và spelling.',1,2],
   ['L1b','Weak forms & connected speech','Tập nhận âm yếu, nối âm và từ bị nuốt.',3,2],
   ['L1c','Transcript repair','Nghe → đối chiếu transcript → nghe lại đúng đoạn sai.',6,2]
  ]},
  {id:'L2',title:'Section 1 accuracy',goal:'Form/note completion: không mất điểm vì spelling hoặc giới hạn từ.',tasks:[
   ['L2a','Form completion','Predict answer type trước khi nghe.',8,2],
   ['L2b','Dates, prices, addresses','Drill chi tiết dễ mất điểm.',10,2],
   ['L2c','Section 1 correction loop','Làm lại chỉ những câu từng sai.',13,2]
  ]},
  {id:'L3',title:'Section 2 maps & MCQ',goal:'Theo dõi vị trí và paraphrase mà không bị distractor.',tasks:[
   ['L3a','Map / plan language','left/right/opposite/beyond/next to.',15,2],
   ['L3b','MCQ distractors','Nghe thay đổi ý và đáp án bị loại.',17,2],
   ['L3c','Section 2 repair','Transcript evidence + replay.',20,2]
  ]},
  {id:'L4',title:'Section 3 conversations',goal:'Theo được nhiều người nói, opinion và matching.',tasks:[
   ['L4a','Speaker opinions','Phân biệt ai nói gì.',22,2],
   ['L4b','Matching & distractors','Track paraphrases across speakers.',24,2],
   ['L4c','Section 3 repair','Ghi nguyên nhân sai: sound / vocab / attention.',27,2]
  ]},
  {id:'L5',title:'Section 4 academic listening',goal:'Theo lecture dài và note completion.',tasks:[
   ['L5a','Signposting','first, however, in contrast, finally...',29,2],
   ['L5b','Academic note completion','Predict noun/verb/number before listening.',31,2],
   ['L5c','Lecture replay','Nghe lại theo chunk, không nghe cả bài vô thức.',34,2]
  ]},
  {id:'L6',title:'Band 8 consolidation',goal:'Ổn định accuracy cao ở full Listening tests.',tasks:[
   ['L6a','Full test checkpoint','Làm full Listening như thi, ghi score /40.','checkpoint','listening'],
   ['L6b','Deep correction','Mỗi lỗi phải có transcript evidence.',36,7],
   ['L6c','Redo wrong questions','Làm lại sau khi không nhìn đáp án.',39,6]
  ]}
 ],
 reading:[
  {id:'R1',title:'Skimming & scanning',goal:'Tìm vị trí thông tin nhanh mà không đọc từng chữ.',tasks:[
   ['R1a','Skim main idea','Đọc topic sentence và cấu trúc passage.',1,1],
   ['R1b','Scan names, dates, keywords','Tìm evidence trước khi đọc sâu.',2,1],
   ['R1c','Paraphrase spotting','Nối question wording với passage wording.',4,1]
  ]},
  {id:'R2',title:'True / False / Not Given',goal:'Phân biệt contradiction với thiếu thông tin.',tasks:[
   ['R2a','TFNG logic','True = same meaning; False = contradiction; NG = insufficient.',7,1],
   ['R2b','Evidence discipline','Mỗi câu phải chỉ ra dòng evidence.',9,1],
   ['R2c','TFNG repair','Phân tích vì sao mình suy diễn quá mức.',12,1]
  ]},
  {id:'R3',title:'Headings & Matching Information',goal:'Nhìn chức năng đoạn văn thay vì săn keyword.',tasks:[
   ['R3a','Matching Headings','Main idea ≠ one detail.',14,1],
   ['R3b','Matching Information','Locate unusual details efficiently.',16,1],
   ['R3c','Paragraph map','Viết 3–5 từ tóm ý mỗi đoạn.',19,1]
  ]},
  {id:'R4',title:'MCQ & Completion',goal:'Loại distractor và kiểm word limit.',tasks:[
   ['R4a','Multiple Choice','Evidence + eliminate 3 distractors.',21,1],
   ['R4b','Sentence completion','Grammar slot + word limit.',23,1],
   ['R4c','Summary / table completion','Predict word class before locating.',26,1]
  ]},
  {id:'R5',title:'Academic paraphrase',goal:'Tăng tốc bằng synonyms, word families và collocations.',tasks:[
   ['R5a','Paraphrase notebook','Question phrase → passage phrase.',28,1],
   ['R5b','Word families in context','noun/verb/adjective/adverb theo câu.',30,1],
   ['R5c','Unknown-word strategy','Đoán từ theo context trước khi dùng dictionary.',33,1]
  ]},
  {id:'R6',title:'Band 8 consolidation',goal:'Ổn định Reading full test với evidence-based correction.',tasks:[
   ['R6a','Full test checkpoint','Làm full Academic Reading, ghi score /40.','checkpoint','reading'],
   ['R6b','Timing repair','Xác định passage/dạng câu làm bạn mất thời gian.',35,7],
   ['R6c','Redo wrong questions','Làm lại không nhìn key.',38,6]
  ]}
 ],
 writing:[
  {id:'W1',title:'Sentence accuracy',goal:'Giảm lỗi cơ bản để không kéo Grammar band xuống.',tasks:[
   ['W1a','Tense & S-V agreement','Viết câu đúng trước khi viết câu phức.',1,0],
   ['W1b','Articles, plurals, word forms','Target những lỗi lặp.',4,0],
   ['W1c','Complex sentence control','Although/while/relative clauses chính xác.',15,0]
  ]},
  {id:'W2',title:'Paragraph development',goal:'Main idea → explain → example → link.',tasks:[
   ['W2a','Topic sentence','Một paragraph = một central idea.',2,4],
   ['W2b','Explain ideas','Trả lời “why/how?” sau main idea.',5,4],
   ['W2c','Relevant examples','Ví dụ phải chứng minh đúng ý.',8,4]
  ]},
  {id:'W3',title:'Task 1 core',goal:'Overview rõ + chọn data quan trọng + so sánh.',tasks:[
   ['W3a','Overview','Không liệt kê số; nêu 2–3 features lớn.',11,4],
   ['W3b','Comparisons','higher/lower, whereas, respectively.',14,4],
   ['W3c','Data accuracy','by/to/from/at + numbers.',17,4]
  ]},
  {id:'W4',title:'Task 2 core',goal:'Hiểu question type và giữ position nhất quán.',tasks:[
   ['W4a','Question analysis','Opinion / discussion / problem-solution / two-part.',20,4],
   ['W4b','Thesis & outline','Position trước khi viết.',23,4],
   ['W4c','Essay organisation','Intro → Body 1 → Body 2 → conclusion.',26,4]
  ]},
  {id:'W5',title:'Coherence & vocabulary',goal:'Dùng linking tự nhiên và vocabulary chính xác.',tasks:[
   ['W5a','Cohesion without overlinking','Không nhồi however/moreover.',29,4],
   ['W5b','Collocations','Ưu tiên cụm đúng hơn “từ khó”.',32,4],
   ['W5c','Rewrite weak sentences','Biến lỗi thật thành câu tốt hơn.',35,4]
  ]},
  {id:'W6',title:'6.5 consolidation',goal:'Viết timed + self-check + rewrite ổn định.',tasks:[
   ['W6a','Writing checkpoint','Làm một task hoàn chỉnh và ghi band ước lượng.','checkpoint','writing'],
   ['W6b','Self-check by criterion','TR/TA • CC • LR • GRA.',38,4],
   ['W6c','Rewrite after feedback','Không chỉ đọc feedback; phải viết lại.',41,4]
  ]}
 ],
 speaking:[
  {id:'S1',title:'Part 1 fluency',goal:'Trả lời tự nhiên 2–4 câu, không học thuộc.',tasks:[
   ['S1a','Answer + reason','Không trả lời một câu cụt.',1,5],
   ['S1b','Add a small example','Example cá nhân giúp fluency tự nhiên.',4,5],
   ['S1c','Repair fillers','Giảm “uh…”, silence dài và restart.',7,5]
  ]},
  {id:'S2',title:'Part 2 structure',goal:'Nói gần 2 phút có flow rõ.',tasks:[
   ['S2a','1-minute notes','Keyword, không viết script.',10,5],
   ['S2b','Story structure','Context → details → feeling/result.',13,5],
   ['S2c','Keep talking','Dùng expansion questions khi bí ý.',16,5]
  ]},
  {id:'S3',title:'Part 3 development',goal:'Opinion → reason → example → consequence.',tasks:[
   ['S3a','Develop abstract ideas','Why / how / who is affected?',19,5],
   ['S3b','Compare perspectives','individual vs society / now vs past.',22,5],
   ['S3c','Speculation','may/might/could + cautious language.',25,5]
  ]},
  {id:'S4',title:'Pronunciation',goal:'Dễ hiểu, stress và chunking tốt hơn.',tasks:[
   ['S4a','Sentence stress','Nhấn content words.',28,5],
   ['S4b','Chunking','Ngắt theo meaning groups.',31,5],
   ['S4c','Record & replay','Nghe lại chính mình và sửa 3 điểm.',34,5]
  ]},
  {id:'S5',title:'Grammar & lexical control',goal:'Range vừa đủ nhưng chính xác.',tasks:[
   ['S5a','Tense flexibility','past/present/future theo câu hỏi.',37,5],
   ['S5b','Natural collocations','Không ép idiom.',40,5],
   ['S5c','Self-correction','Sửa nhanh nhưng không restart cả câu.',43,5]
  ]},
  {id:'S6',title:'6.5 consolidation',goal:'Full mock Part 1–2–3 ổn định.',tasks:[
   ['S6a','Speaking checkpoint','Làm full mock và ghi band ước lượng.','checkpoint','speaking'],
   ['S6b','5-error repair','Chỉ chọn 5 lỗi lặp quan trọng.',46,5],
   ['S6c','Record again','Nói lại sau khi sửa.',49,5]
  ]}
 ],
 support:[
  {id:'G1',title:'Grammar repair',goal:'Chỉ học grammar có tác động tới Writing/Speaking.',tasks:[
   ['G1a','Tenses','Present/Past/Perfect/Continuous.',1,0],
   ['G1b','Articles & plurals','a/an/the/zero + countability.',4,0],
   ['G1c','S-V & complex sentences','Accuracy before complexity.',5,0]
  ]},
  {id:'V1',title:'Vocabulary in context',goal:'Học từ gặp trong Reading/Listening/Writing, không học list rời.',tasks:[
   ['V1a','12 useful collocations','Meaning + example + production.',1,3],
   ['V1b','Word families','noun/verb/adjective/adverb thật sự tồn tại.',3,3],
   ['V1c','Saved-word review','Chỉ ôn từ bạn đã lưu.',6,3]
  ]},
  {id:'E1',title:'Error repair',goal:'Một lỗi chỉ thật sự xong khi bạn làm lại đúng.',tasks:[
   ['E1a','Review 1–3–7','Làm lại lỗi đến hạn.',1,6],
   ['E1b','Wrong → Why → Rule → Correct','Viết nguyên nhân sai.',1,7],
   ['E1c','Mixed weak-skill drill','Luyện chính lỗi lặp.',1,8]
  ]}
 ]
};

const skillMeta={
 listening:{label:'Listening',target:'8+',metric:'/40',goal:35},
 reading:{label:'Reading',target:'8+',metric:'/40',goal:35},
 writing:{label:'Writing',target:'6.5+',metric:'band',goal:6.5},
 speaking:{label:'Speaking',target:'6.5+',metric:'band',goal:6.5},
 support:{label:'Grammar & Vocabulary',target:'support',metric:'',goal:null}
};

const listeningVocabByTask={
 L1a:{
  categories:[
   ['DAYS OF THE WEEK','https://study4.com/flashcards/lists/384/'],
   ['MONTHS OF THE YEAR','https://study4.com/flashcards/lists/385/'],
   ['TIME EXPRESSION','https://study4.com/flashcards/lists/399/'],
   ['COUNTRY','https://study4.com/flashcards/lists/393/'],
   ['LANGUAGES','https://study4.com/flashcards/lists/394/']
  ],
  words:[
   ['Wednesday','thứ Tư','Âm đọc /ˈwenzdeɪ/ khác khá xa spelling.'],
   ['February','tháng Hai','Chú ý cụm chữ br và âm tiết đầu.'],
   ['fifteen','mười lăm','Phân biệt stress với fifty.'],
   ['thirty','ba mươi','Phân biệt với thirteen.'],
   ['quarter','một phần tư / 15 phút','Hay gặp trong cách nói giờ.'],
   ['Australia','Úc','Tên quốc gia: nghe rõ các âm tiết giữa.'],
   ['German','tiếng Đức / người Đức','Nghe ending -man rõ.'],
   ['Thursday','thứ Năm','Chú ý âm /θ/ đầu.']
  ]
 },
 L1b:{
  categories:[
   ['VERBS','https://study4.com/flashcards/lists/395/'],
   ['ADJECTIVES','https://study4.com/flashcards/lists/396/'],
   ['QUALITIES','https://study4.com/flashcards/lists/404/']
  ],
  words:[
   ['arrive','đến','Âm đầu thường yếu trong connected speech.'],
   ['collect','thu thập / lấy','Nghe rõ âm /k/ cuối.'],
   ['available','có sẵn','Từ nhiều âm tiết, dễ bỏ sót giữa từ.'],
   ['comfortable','thoải mái','Thường được nói nhanh còn khoảng 3 âm tiết.'],
   ['reliable','đáng tin cậy','Chú ý stress ở âm tiết thứ hai.'],
   ['flexible','linh hoạt','Ending -ible có âm yếu.'],
   ['required','bắt buộc','Âm cuối /d/ có thể rất nhẹ.'],
   ['optional','tùy chọn','Dễ xuất hiện trong form/note completion.']
  ]
 },
 L1c:{
  categories:[['OTHERS','https://study4.com/flashcards/lists/417/']],
  words:[
   ['receipt','biên lai','Chữ p không phát âm.'],
   ['schedule','lịch trình','UK thường /ˈʃedjuːl/.'],
   ['reference','tham chiếu / mã tham chiếu','Âm giữa thường bị rút gọn.'],
   ['appointment','cuộc hẹn','Stress ở âm tiết thứ hai.'],
   ['information','thông tin','Nghe đúng số âm tiết.'],
   ['confirmation','xác nhận','Dễ nhầm với information.'],
   ['entrance','lối vào','Chú ý /tr/ và ending.'],
   ['membership','thành viên / tư cách thành viên','Âm /ʃɪp/ cuối.']
  ]
 },
 L2a:{
  categories:[
   ['EDUCATION','https://study4.com/flashcards/lists/406/'],
   ['WORKS','https://study4.com/flashcards/lists/414/']
  ],
  words:[
   ['assignment','bài tập','Stress ở âm tiết thứ hai.'],
   ['semester','học kỳ','Nghe rõ ending -ster.'],
   ['lecture','bài giảng','UK /ˈlektʃə/.'],
   ['tutorial','buổi hướng dẫn','Từ nhiều âm tiết.'],
   ['enrolment','sự đăng ký học','Spelling dễ sai: enrolment/enrollment.'],
   ['employer','người/công ty tuyển dụng','Phân biệt employer và employee.'],
   ['salary','lương','Dễ nghe nhầm ending.'],
   ['qualification','bằng cấp / trình độ','Stress ở -ca-.']
  ]
 },
 L2b:{
  categories:[
   ['MONEY MATTERS','https://study4.com/flashcards/lists/390/'],
   ['PLACES','https://study4.com/flashcards/lists/402/'],
   ['IN THE CITY','https://study4.com/flashcards/lists/400/']
  ],
  words:[
   ['deposit','tiền đặt cọc','Stress đầu hoặc giữa tùy loại từ; trong Listening thường là noun.'],
   ['discount','giảm giá','Noun thường stress âm đầu.'],
   ['receipt','biên lai','p câm.'],
   ['currency','tiền tệ','Ending -cy.'],
   ['intersection','giao lộ','Hay gặp chỉ đường.'],
   ['pedestrian','người đi bộ','Từ dài, dễ mất âm tiết.'],
   ['pharmacy','nhà thuốc','UK /ˈfɑːməsi/.'],
   ['museum','bảo tàng','Stress âm tiết thứ hai.']
  ]
 },
 L2c:{
  categories:[
   ['HOMES','https://study4.com/flashcards/lists/403/'],
   ['HEALTH','https://study4.com/flashcards/lists/401/']
  ],
  words:[
   ['accommodation','chỗ ở','Double c + double m, từ rất hay sai spelling.'],
   ['apartment','căn hộ','Âm /t/ cuối cần nghe rõ.'],
   ['furnished','có nội thất','Ending -ed đọc /t/.'],
   ['electricity','điện','Stress ở -tri-.'],
   ['appointment','cuộc hẹn','Hay gặp Section 1.'],
   ['prescription','đơn thuốc','Cụm consonant khó.'],
   ['symptom','triệu chứng','p gần như không nghe.'],
   ['treatment','điều trị','Ending -ment.']
  ]
 },
 L3a:{
  categories:[
   ['TRANSPORTATIONS','https://study4.com/flashcards/lists/415/'],
   ['VEHICLES','https://study4.com/flashcards/lists/416/'],
   ['TOURING','https://study4.com/flashcards/lists/410/']
  ],
  words:[
   ['junction','ngã giao','Map language phổ biến.'],
   ['roundabout','vòng xuyến','Từ ghép hay gặp chỉ đường.'],
   ['platform','sân ga','Nghe rõ số platform đi kèm.'],
   ['shuttle','xe trung chuyển','Âm /ʃ/ đầu.'],
   ['vehicle','phương tiện','UK /ˈviːəkl/.'],
   ['bicycle','xe đạp','Âm giữa rất nhẹ.'],
   ['itinerary','lịch trình chuyến đi','Từ dài, stress dễ nhầm.'],
   ['destination','điểm đến','Stress ở -na-.']
  ]
 },
 L3b:{
  categories:[
   ['ARCHITECTURE','https://study4.com/flashcards/lists/405/'],
   ['SHAPES','https://study4.com/flashcards/lists/397/']
  ],
  words:[
   ['entrance','lối vào','Map keyword.'],
   ['corridor','hành lang','Stress âm đầu trong UK.'],
   ['staircase','cầu thang','Từ ghép.'],
   ['rectangular','hình chữ nhật','Từ dài, cần nghe root rectangle.'],
   ['circular','hình tròn','Ending -cular.'],
   ['opposite','đối diện','Map instruction.'],
   ['adjacent','liền kề','Academic/map synonym của next to.'],
   ['boundary','ranh giới','Âm giữa dễ bị nuốt.']
  ]
 },
 L3c:{
  categories:[['PLACES','https://study4.com/flashcards/lists/402/']],
  words:[
   ['gallery','phòng trưng bày','Dễ nghe ending -lery.'],
   ['cafeteria','căng tin','Stress gần cuối.'],
   ['laboratory','phòng thí nghiệm','UK thường 4 âm tiết rõ.'],
   ['reception','quầy lễ tân','Stress âm tiết thứ hai.'],
   ['auditorium','hội trường','Từ dài trong map/campus.'],
   ['courtyard','sân trong','Từ ghép.'],
   ['warehouse','nhà kho','Âm house cuối.'],
   ['facility','cơ sở / tiện ích','Stress -ci-.']
  ]
 },
 L4a:{
  categories:[
   ['WORKS','https://study4.com/flashcards/lists/414/'],
   ['QUALITIES','https://study4.com/flashcards/lists/404/']
  ],
  words:[
   ['colleague','đồng nghiệp','Chú ý spelling -league.'],
   ['supervisor','người giám sát','Stress đầu.'],
   ['responsible','có trách nhiệm','Âm giữa dễ yếu.'],
   ['efficient','hiệu quả','Phân biệt efficient/effective.'],
   ['experienced','có kinh nghiệm','Ending -ed.'],
   ['deadline','hạn chót','Từ ghép.'],
   ['promotion','thăng chức / quảng bá','Stress -mo-.'],
   ['temporary','tạm thời','Nhiều accent rút gọn âm tiết.']
  ]
 },
 L4b:{
  categories:[
   ['HOBBIES','https://study4.com/flashcards/lists/407/'],
   ['SPORTS','https://study4.com/flashcards/lists/412/'],
   ['ARTS - MEDIA','https://study4.com/flashcards/lists/411/']
  ],
  words:[
   ['photography','nhiếp ảnh','Stress khác photograph.'],
   ['exhibition','triển lãm','Stress -bi-.'],
   ['documentary','phim tài liệu','Ending có thể nghe rất nhanh.'],
   ['tournament','giải đấu','UK /ˈtʊənəmənt/.'],
   ['equipment','thiết bị','Danh từ không đếm được.'],
   ['membership','thẻ/tư cách thành viên','Ending rõ.'],
   ['performance','buổi biểu diễn / hiệu suất','Stress âm hai.'],
   ['audience','khán giả','Hai đến ba âm tiết tùy accent.']
  ]
 },
 L4c:{
  categories:[['OTHERS','https://study4.com/flashcards/lists/417/']],
  words:[
   ['recommend','khuyên / đề xuất','Double m trong spelling.'],
   ['prefer','thích hơn','Stress âm hai.'],
   ['agree','đồng ý','Âm đầu yếu.'],
   ['suggest','gợi ý','Âm /dʒ/ cuối.'],
   ['alternative','phương án thay thế','Từ dài, stress đầu.'],
   ['advantage','lợi thế','Stress âm hai.'],
   ['disadvantage','bất lợi','Giữ đủ âm đầu dis-.'],
   ['decision','quyết định','Ending /ʒən/.']
  ]
 },
 L5a:{
  categories:[
   ['ENVIRONMENT','https://study4.com/flashcards/lists/409/'],
   ['NATURE','https://study4.com/flashcards/lists/391/']
  ],
  words:[
   ['environment','môi trường','Spelling dễ thiếu n.'],
   ['habitat','môi trường sống','Stress đầu.'],
   ['species','loài','Singular và plural giống nhau.'],
   ['conservation','bảo tồn','Stress -va-.'],
   ['biodiversity','đa dạng sinh học','Từ dài academic.'],
   ['vegetation','thảm thực vật','Stress -ta-.'],
   ['agriculture','nông nghiệp','Âm giữa rút gọn.'],
   ['pollution','ô nhiễm','Stress âm hai.']
  ]
 },
 L5b:{
  categories:[
   ['MATERIALS','https://study4.com/flashcards/lists/408/'],
   ['WEATHER','https://study4.com/flashcards/lists/392/']
  ],
  words:[
   ['aluminium','nhôm','UK pronunciation khác US aluminum.'],
   ['concrete','bê tông','Noun stress đầu.'],
   ['plastic','nhựa','Âm cuối /k/.'],
   ['rubber','cao su','Âm /b/ đôi không đổi phát âm.'],
   ['temperature','nhiệt độ','Thường rút còn 3–4 âm tiết.'],
   ['humidity','độ ẩm','Stress -mi-.'],
   ['forecast','dự báo','Stress đầu.'],
   ['precipitation','lượng mưa','Từ dài academic.']
  ]
 },
 L5c:{
  categories:[
   ['OCEANS','https://study4.com/flashcards/lists/389/'],
   ['CONTINENTS','https://study4.com/flashcards/lists/388/'],
   ['NATURE','https://study4.com/flashcards/lists/391/']
  ],
  words:[
   ['Pacific','Thái Bình Dương','Stress âm hai.'],
   ['Atlantic','Đại Tây Dương','Stress âm hai.'],
   ['coastline','đường bờ biển','Từ ghép.'],
   ['current','dòng hải lưu','Context quyết định nghĩa.'],
   ['continent','châu lục','Stress đầu.'],
   ['hemisphere','bán cầu','Từ dài geography.'],
   ['erosion','xói mòn','Stress âm hai.'],
   ['ecosystem','hệ sinh thái','Stress đầu.']
  ]
 },
 L6b:{
  categories:[['MIXED REVIEW','']],
  words:[
   ['accommodation','chỗ ở','Spelling trap.'],
   ['Wednesday','thứ Tư','Sound–spelling mismatch.'],
   ['environment','môi trường','Spelling trap.'],
   ['receipt','biên lai','Silent p.'],
   ['vehicle','phương tiện','Weak middle vowel.'],
   ['February','tháng Hai','Spelling + pronunciation.'],
   ['assignment','bài tập','Academic high-frequency.'],
   ['pedestrian','người đi bộ','Map high-frequency.']
  ]
 },
 L6c:{
  categories:[['MIXED REVIEW','']],
  words:[
   ['qualification','bằng cấp','Long academic word.'],
   ['itinerary','lịch trình','Travel spelling.'],
   ['prescription','đơn thuốc','Health spelling.'],
   ['exhibition','triển lãm','Arts spelling.'],
   ['biodiversity','đa dạng sinh học','Lecture vocabulary.'],
   ['temperature','nhiệt độ','Common lecture word.'],
   ['supervisor','người giám sát','Work/education word.'],
   ['intersection','giao lộ','Map vocabulary.']
  ]
 }
};

function listeningWordMeta(id){
 const x=listeningVocabByTask[id];
 if(!x)return '';
 return x.categories.map(c=>c[0]).join(' • ');
}

function speakListeningWord(word){
 try{
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(word);
   u.lang='en-GB';u.rate=.78;u.pitch=1;
   const voices=speechSynthesis.getVoices();
   u.voice=voices.find(v=>/en-GB/i.test(v.lang)&&/Google|Siri|Daniel|Serena|Kate|Premium|Enhanced/i.test(v.name))
     ||voices.find(v=>/en-GB/i.test(v.lang))
     ||voices.find(v=>/^en/i.test(v.lang))
     ||null;
   speechSynthesis.speak(u);
 }catch(e){}
}

function bindListeningWarmupHotkeys(){
 if(window.__lvHotkeysBound)return;
 window.__lvHotkeysBound=true;
 document.addEventListener('keydown',e=>{
   const overlay=document.getElementById('lessonOverlay');
   const wrap=document.querySelector('.listenVocabWarmup:not(.collapsed)');
   if(!overlay||!overlay.classList.contains('open')||!wrap)return;

   if(e.key==='Tab'){
     e.preventDefault();
     e.stopPropagation();
     if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
     if(typeof wrap._lvReplay==='function')wrap._lvReplay();
     const input=wrap.querySelector('#lvInput');
     if(input)requestAnimationFrame(()=>input.focus({preventScroll:true}));
     return;
   }

   if(e.key==='Enter'){
     const ae=document.activeElement;
     if(ae&&ae.tagName==='TEXTAREA')return;
     e.preventDefault();
     e.stopPropagation();
     if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
     if(typeof wrap._lvAction==='function')wrap._lvAction();
   }
 },true);
}
bindListeningWarmupHotkeys();

function injectListeningWarmup(t){
 const pack=listeningVocabByTask[t.id];
 if(!pack)return;
 const body=document.getElementById('lessonBody');
 if(!body||body.querySelector('.listenVocabWarmup'))return;

 let index=0,attempts=0,correct=0,finished=false;
 const wrap=document.createElement('section');
 wrap.className='listenVocabWarmup';
 body.insertBefore(wrap,body.firstChild);

 const render=()=>{
   const item=pack.words[index];
   const done=index;
   wrap.innerHTML=
    '<div class="lvHead"><div><span class="phase">LISTENING WORD WARM-UP</span><h3>Nghe → Gõ → Sửa → Nhớ</h3><p>Không nhìn chữ trước khi nghe. Mục tiêu là nghe ra từ thật và viết đúng spelling trước khi vào task chính.</p></div>'+
      '<div class="lvScore"><b>'+done+'/'+pack.words.length+'</b><span>'+correct+' đúng</span></div></div>'+
    '<div class="lvSources">'+pack.categories.map(c=>c[1]
      ?'<a href="'+c[1]+'" target="_blank" rel="noopener">'+c[0]+' ↗</a>'
      :'<span>'+c[0]+'</span>').join('')+'</div>'+
    '<div class="lvTrainer">'+
      '<button id="lvListen" class="lvListen" title="Phím Tab để nghe lại">🔊 Nghe lại · Tab</button>'+
      '<input id="lvInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ bạn nghe · Tab = nghe lại · Enter = check">'+
      '<button id="lvCheck" class="btn primary" title="Phím Enter để check">Check · Enter</button>'+
    '</div>'+
    '<div class="lvHotkeyHint"><kbd>Tab</kbd> nghe lại <span>•</span> <kbd>Enter</kbd> check / tiếp</div>'+
    '<div id="lvFeedback" class="lvFeedback"><span>Tip:</span> nghe 1–2 lần trước khi gõ. Không đoán theo nghĩa.</div>'+
    '<div class="lvProgress"><i style="width:'+Math.round(done/pack.words.length*100)+'%"></i></div>'+
    '<button id="lvSkip" class="lvSkip">Bỏ qua warm-up và vào task chính ↓</button>';

   const listen=document.getElementById('lvListen'),input=document.getElementById('lvInput'),check=document.getElementById('lvCheck');
   wrap._lvReplay=()=>speakListeningWord(item[0]);
   wrap._lvAction=()=>check.click();
   listen.onclick=wrap._lvReplay;
   check.onclick=()=>{
      const got=input.value.trim().toLowerCase(),target=item[0].toLowerCase();
      if(!got)return;
      attempts++;
      if(got===target){
        correct++;
        fs.listenVocab.mastered[item[0]]=(fs.listenVocab.mastered[item[0]]||0)+1;
        saveFlex();
        document.getElementById('lvFeedback').innerHTML='<div class="lvCorrect">✓ <b>'+item[0]+'</b> — '+item[1]+'</div><small>'+item[2]+'</small>';
        input.readOnly=true;check.textContent='Tiếp → · Enter';
        check.onclick=()=>next();
        requestAnimationFrame(()=>input.focus({preventScroll:true}));
      }else{
        fs.listenVocab.missed[item[0]]=(fs.listenVocab.missed[item[0]]||0)+1;
        saveFlex();
        if(attempts<2){
          document.getElementById('lvFeedback').innerHTML='<div class="lvWrong">Chưa đúng. Nghe lại rồi thử thêm 1 lần.</div>';
          input.select();
        }else{
          document.getElementById('lvFeedback').innerHTML='<div class="lvWrong">✕ '+got+' → <b>'+item[0]+'</b></div><div class="lvReveal">'+item[1]+'</div><small>'+item[2]+'</small>';
          input.readOnly=true;check.textContent='Tiếp → · Enter';
          check.onclick=()=>next();
          requestAnimationFrame(()=>input.focus({preventScroll:true}));
        }
      }
   };
   document.getElementById('lvSkip').onclick=()=>{
      wrap.classList.add('collapsed');
      wrap._lvAction=null;
      wrap._lvReplay=null;
   };
   setTimeout(()=>{
     speakListeningWord(item[0]);
     input.focus({preventScroll:true});
   },250);
 };

 const next=()=>{
   attempts=0;
   index++;
   if(index>=pack.words.length){
     finished=true;
     wrap.innerHTML=
       '<div class="lvFinish"><div><span>✓</span><div><h3>Warm-up hoàn thành</h3><p>Bạn đúng '+correct+'/'+pack.words.length+'. Các từ sai đã được ghi vào review để gặp lại sau.</p></div></div>'+
       '<button id="lvFinishClose" class="btn primary">Vào task Listening ↓</button></div>';
     const finishBtn=document.getElementById('lvFinishClose');
     wrap._lvReplay=null;
     wrap._lvAction=()=>finishBtn.click();
     finishBtn.onclick=()=>{
       wrap.classList.add('collapsed');
       wrap._lvAction=null;
       wrap._lvReplay=null;
     };
     requestAnimationFrame(()=>finishBtn.focus({preventScroll:true}));
     return;
   }
   render();
 };
 render();
}

const allTasks=()=>Object.entries(modules).flatMap(([skill,ms])=>ms.flatMap(m=>m.tasks.map(t=>({skill,module:m.id,moduleTitle:m.title,id:t[0],title:t[1],desc:t[2],day:t[3],index:t[4]}))));
const taskById=id=>allTasks().find(t=>t.id===id);
const doneCountSkill=skill=>allTasks().filter(t=>t.skill===skill&&fs.done[t.id]).length;
const totalSkill=skill=>allTasks().filter(t=>t.skill===skill).length;
const pctSkill=skill=>Math.round(doneCountSkill(skill)/Math.max(1,totalSkill(skill))*100);

function latestScore(skill){
 const a=fs.scores[skill]||[];return a.length?a[a.length-1]:null;
}
function scoreStatus(skill){
 const v=latestScore(skill),m=skillMeta[skill];
 if(v===null)return 'Chưa có checkpoint';
 return v>=m.goal?'Đạt vùng mục tiêu luyện tập':'Chưa đạt mục tiêu — tiếp tục module';
}
function overallProgress(){
 let tasks=allTasks(),done=tasks.filter(t=>fs.done[t.id]).length;
 return Math.round(done/tasks.length*100);
}
function updateHero(){
 const p=overallProgress(),pct=document.getElementById('pct'),bar=document.getElementById('bar'),txt=document.getElementById('progressText');
 if(pct)pct.textContent=p;if(bar)bar.style.width=p+'%';if(txt)txt.textContent=Object.keys(fs.done).filter(k=>fs.done[k]).length+'/'+allTasks().length+' task đã hoàn thành';
}
window.progress=updateHero;

function phaseInfo(){
 const lrReady=['listening','reading'].every(s=>(fs.scores[s]||[]).slice(-3).length>=3&&(fs.scores[s]||[]).slice(-3).every(x=>x>=35));
 const wsReady=['writing','speaking'].every(s=>(fs.scores[s]||[]).slice(-3).length>=3&&(fs.scores[s]||[]).slice(-3).every(x=>x>=6.5));
 if(lrReady&&wsReady)return ['Exam Readiness','Bạn đã có dữ liệu ổn định ở vùng mục tiêu. Tập mock, sửa lỗi cuối và giữ phong độ.'];
 if(pctSkill('listening')>=60&&pctSkill('reading')>=60)return ['Band Target Consolidation','Tập trung full-test checkpoints, deep correction và ổn định L/R 8+, W/S 6.5+.'];
 if(pctSkill('listening')>=25||pctSkill('reading')>=25)return ['Skill Building','Tiếp tục xây từng dạng câu hỏi. Không cần chạy theo số ngày.'];
 return ['Foundation & Diagnosis','Xây nền và tìm chính xác lỗi đang làm mất điểm.'];
}

function chooseQueue(n=4,reset=false){
 let tasks=allTasks(),existing=(fs.queue||[]).map(taskById).filter(Boolean).filter(t=>!fs.done[t.id]);
 if(!reset&&existing.length){fs.queue=existing.map(t=>t.id);saveFlex();return existing;}
 let chosen=[];
 const pick=skill=>{
   let t=tasks.find(x=>x.skill===skill&&!fs.done[x.id]&&!chosen.some(y=>y.id===x.id));
   if(t)chosen.push(t);
 };
 const pattern=['listening','reading','listening','reading','writing','speaking','support','reading','listening'];
 for(const s of pattern){if(chosen.length>=n)break;pick(s);}
 if(chosen.length<n){
  tasks.filter(t=>!fs.done[t.id]&&!chosen.some(y=>y.id===t.id)).slice(0,n-chosen.length).forEach(t=>chosen.push(t));
 }
 fs.queue=chosen.map(t=>t.id);saveFlex();return chosen;
}


let activeTaskSession=null;

function progressEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}

function taskProgressRecord(id){
 if(!fs.taskProgress[id])fs.taskProgress[id]={attempts:0,completed:0,totalSeconds:0,lastStudied:0,history:[]};
 const p=fs.taskProgress[id];
 p.history=Array.isArray(p.history)?p.history:[];
 p.attempts=Number(p.attempts)||0;
 p.completed=Number(p.completed)||0;
 p.totalSeconds=Number(p.totalSeconds)||0;
 p.lastStudied=Number(p.lastStudied)||0;
 return p;
}

function taskPerformancePct(h){
 if(!h)return null;
 if(Number.isFinite(Number(h.percent)))return Math.max(0,Math.min(100,Number(h.percent)));
 if(Number.isFinite(Number(h.band)))return Math.max(0,Math.min(100,Number(h.band)/9*100));
 if(Number.isFinite(Number(h.score))&&Number.isFinite(Number(h.total))&&Number(h.total)>0)return Math.max(0,Math.min(100,Number(h.score)/Number(h.total)*100));
 return null;
}

function taskProgressSummary(t){
 const p=taskProgressRecord(t.id);
 const scored=p.history.filter(h=>taskPerformancePct(h)!==null);
 const latest=scored.length?scored[scored.length-1]:null;
 const best=scored.length?scored.reduce((a,h)=>taskPerformancePct(h)>taskPerformancePct(a)?h:a):null;
 const latestPct=taskPerformancePct(latest),bestPct=taskPerformancePct(best);
 const recent=scored.slice(-2).map(taskPerformancePct);
 let mastery=0,status='not-started',label='Chưa học';

 if(latestPct!==null){
   mastery=Math.round(latestPct*.7+(bestPct||latestPct)*.3);
   if(recent.length>=2&&recent.every(x=>x>=85)){status='mastered';label='Mastered';}
   else if(latestPct<65){status='review';label='Cần ôn';}
   else{status='learning';label='Đang tiến bộ';}
 }else if(p.completed>0||fs.done[t.id]){
   mastery=Math.min(78,55+Math.max(p.completed,1)*8);
   status='complete';label='Đã hoàn thành';
 }else if(p.attempts>0||p.totalSeconds>0){
   mastery=Math.min(55,20+p.attempts*10);
   status='learning';label='Đang học';
 }

 const errors=latest&&Number.isFinite(Number(latest.errors))?Number(latest.errors):null;
 const nextReview=status==='review'
   ?new Date((p.lastStudied||Date.now())+24*3600*1000)
   :status==='learning'&&p.lastStudied?new Date(p.lastStudied+3*24*3600*1000):null;

 return {p,latest,best,latestPct,bestPct,mastery,status,label,errors,nextReview};
}

function taskScoreLabel(h){
 if(!h)return '—';
 if(Number.isFinite(Number(h.band)))return Number(h.band).toFixed(1)+' / 9';
 if(Number.isFinite(Number(h.score))&&Number.isFinite(Number(h.total)))return Number(h.score)+' / '+Number(h.total);
 if(Number.isFinite(Number(h.percent)))return Math.round(Number(h.percent))+'%';
 return h.note||'Đã hoàn thành';
}

function formatTaskDate(ts){
 if(!ts)return 'Chưa học';
 try{return new Date(ts).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});}catch(e){return '—';}
}

function formatTaskTime(sec){
 sec=Math.max(0,Math.round(Number(sec)||0));
 const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);
 return h?(h+'h '+m+'m'):(m+' phút');
}

function startTaskSession(id){
 if(activeTaskSession&&activeTaskSession.id!==id)finishTaskTime(activeTaskSession.id);
 activeTaskSession={id:id,start:Date.now(),counted:false};
 window.__activeFlexTaskId=id;
 const p=taskProgressRecord(id);
 p.lastStudied=Date.now();
 saveFlex();
}

function finishTaskTime(id){
 if(!activeTaskSession||activeTaskSession.id!==id)return;
 const p=taskProgressRecord(id);
 p.totalSeconds+=Math.max(1,Math.round((Date.now()-activeTaskSession.start)/1000));
 p.lastStudied=Date.now();
 activeTaskSession.start=Date.now();
 saveFlex();
}

function completeTaskSession(id,note){
 const p=taskProgressRecord(id);
 finishTaskTime(id);
 if(!activeTaskSession||activeTaskSession.id!==id||!activeTaskSession.counted){
   p.attempts+=1;
   p.completed+=1;
   p.history.push({at:Date.now(),kind:'completion',note:note||'Hoàn thành task'});
   if(activeTaskSession&&activeTaskSession.id===id)activeTaskSession.counted=true;
 }
 p.lastStudied=Date.now();
 p.history=p.history.slice(-30);
 saveFlex();
 renderProgressHub();
}

window.recordTaskPerformance=function(data){
 const id=window.__activeFlexTaskId;
 if(!id||!taskById(id))return;
 const p=taskProgressRecord(id);
 finishTaskTime(id);
 const h={
   at:Date.now(),
   kind:String(data&&data.kind||taskById(id).skill||'practice'),
   note:String(data&&data.note||''),
   errors:Number.isFinite(Number(data&&data.errors))?Number(data.errors):undefined
 };
 if(Number.isFinite(Number(data&&data.band)))h.band=Number(data.band);
 if(Number.isFinite(Number(data&&data.score)))h.score=Number(data.score);
 if(Number.isFinite(Number(data&&data.total)))h.total=Number(data.total);
 if(Number.isFinite(Number(data&&data.percent)))h.percent=Number(data.percent);

 p.attempts+=1;
 if(activeTaskSession&&activeTaskSession.id===id)activeTaskSession.counted=true;
 p.history.push(h);
 p.history=p.history.slice(-30);
 p.lastStudied=Date.now();
 saveFlex();
 renderFlexHome();
 renderAllModules();
 renderCarry();
 renderProgressHub();
};

function showTaskProgress(id){
 const t=taskById(id);if(!t)return;
 const s=taskProgressSummary(t),p=s.p;
 let overlay=document.getElementById('taskProgressOverlay');
 if(!overlay){
   overlay=document.createElement('div');
   overlay.id='taskProgressOverlay';
   overlay.className='taskProgressOverlay';
   document.body.appendChild(overlay);
 }
 const hist=p.history.slice().reverse();
 overlay.innerHTML=
  '<div class="taskProgressBackdrop" data-progress-close></div>'+
  '<section class="taskProgressPanel">'+
    '<div class="tpPanelTop"><div><span class="skillPill '+t.skill+'">'+skillMeta[t.skill].label+'</span><small>'+t.module+' · '+t.moduleTitle+'</small><h2>'+t.title+'</h2></div><button data-progress-close>×</button></div>'+
    '<div class="tpHeroStats">'+
      '<div><span>Mastery</span><strong>'+s.mastery+'%</strong><div class="tpBigBar"><i style="width:'+s.mastery+'%"></i></div></div>'+
      '<div><span>Trạng thái</span><strong class="tpStatus '+s.status+'">'+s.label+'</strong></div>'+
      '<div><span>Lần làm</span><strong>'+p.attempts+'</strong></div>'+
      '<div><span>Lần gần nhất</span><strong>'+(s.latest?taskScoreLabel(s.latest):'—')+'</strong></div>'+
      '<div><span>Tốt nhất</span><strong>'+(s.best?taskScoreLabel(s.best):'—')+'</strong></div>'+
      '<div><span>Tổng thời gian</span><strong>'+formatTaskTime(p.totalSeconds)+'</strong></div>'+
    '</div>'+
    (s.nextReview?'<div class="tpReviewNotice">🔁 Nên ôn lại khoảng <b>'+formatTaskDate(s.nextReview.getTime())+'</b>.</div>':'')+
    '<div class="tpPanelSection"><h3>Lịch sử task</h3>'+
      (hist.length?'<div class="tpTimeline">'+hist.map(function(h){
        const pct=taskPerformancePct(h);
        return '<div class="tpTimelineItem"><span></span><div><b>'+formatTaskDate(h.at)+' · '+(h.kind==='completion'?'Hoàn thành':progressEsc(h.kind))+'</b>'+
          '<strong>'+taskScoreLabel(h)+'</strong>'+
          (h.errors!==undefined?'<small>'+h.errors+' lỗi được ghi nhận</small>':'')+
          (h.note?'<p>'+progressEsc(h.note)+'</p>':'')+
          (pct!==null?'<div class="tpHistoryBar"><i style="width:'+Math.round(pct)+'%"></i></div>':'')+
        '</div></div>';
      }).join('')+'</div>':'<p class="muted">Chưa có lịch sử. Mở task và bắt đầu học để hệ thống ghi tiến độ.</p>')+
    '</div>'+
    '<div class="tpPanelActions"><button id="tpOpenTask" class="btn primary">Tiếp tục học task</button><button data-progress-close class="btn">Đóng</button></div>'+
  '</section>';

 overlay.classList.add('open');
 overlay.querySelectorAll('[data-progress-close]').forEach(b=>b.onclick=()=>overlay.classList.remove('open'));
 document.getElementById('tpOpenTask').onclick=function(){overlay.classList.remove('open');openFlexTask(t);};
}

function progressTaskRow(t){
 const s=taskProgressSummary(t),p=s.p;
 return '<div class="progressTaskRow" data-progress-skill="'+t.skill+'">'+
  '<div class="progressTaskMain"><div><span class="skillPill '+t.skill+'">'+skillMeta[t.skill].label+'</span><small>'+t.module+'</small><h4>'+t.title+'</h4></div>'+
   '<span class="tpStatus '+s.status+'">'+s.label+'</span></div>'+
  '<div class="progressTaskBar"><i style="width:'+s.mastery+'%"></i></div>'+
  '<div class="progressTaskMeta"><span><b>'+s.mastery+'%</b> mastery</span><span>'+p.attempts+' lần</span><span>Gần nhất: '+(s.latest?taskScoreLabel(s.latest):'—')+'</span><span>'+formatTaskDate(p.lastStudied)+'</span></div>'+
  '<div class="progressTaskActions"><button class="btn primary" data-open="'+t.id+'">Học tiếp</button><button class="btn" data-progress="'+t.id+'">Xem chi tiết</button></div>'+
 '</div>';
}

function renderProgressHub(){
 const el=document.getElementById('progressHub');if(!el)return;
 const tasks=allTasks();
 const summaries=tasks.map(t=>({t:t,s:taskProgressSummary(t)}));
 const started=summaries.filter(x=>x.s.status!=='not-started').length;
 const mastered=summaries.filter(x=>x.s.status==='mastered').length;
 const review=summaries.filter(x=>x.s.status==='review').length;
 const activeSummaries=summaries.filter(x=>x.s.status!=='not-started');
 const avg=activeSummaries.length?Math.round(activeSummaries.reduce((n,x)=>n+x.s.mastery,0)/activeSummaries.length):0;

 const skillCards=['listening','reading','writing','speaking','support'].map(function(skill){
   const a=summaries.filter(x=>x.t.skill===skill);
   const active=a.filter(x=>x.s.status!=='not-started');
   const pct=active.length?Math.round(active.reduce((n,x)=>n+x.s.mastery,0)/active.length):0;
   const weak=a.filter(x=>x.s.status==='review').length;
   return '<button class="progressSkillCard" data-progress-filter="'+skill+'"><span>'+skillMeta[skill].label+'</span><strong>'+pct+'%</strong><div><i style="width:'+pct+'%"></i></div><small>'+active.length+'/'+a.length+' đã học'+(weak?' · '+weak+' cần ôn':'')+'</small></button>';
 }).join('');

 el.innerHTML=
  '<div class="progressHubHero"><div><span class="phase">TASK PROGRESS</span><h2>Progress Hub</h2><p>Mỗi task tự lưu số lần làm, điểm, thời gian và lịch sử. Mastery được tính từ kết quả thực tế; chỉ bấm “hoàn thành” sẽ không tự biến task thành Mastered.</p></div>'+
   '<div class="progressOverall"><span>Mastery trung bình</span><strong>'+avg+'%</strong></div></div>'+
  '<div class="progressSummaryGrid"><div><span>Đã bắt đầu</span><b>'+started+'/'+tasks.length+'</b></div><div><span>Mastered</span><b>'+mastered+'</b></div><div><span>Cần ôn</span><b>'+review+'</b></div><div><span>Chưa học</span><b>'+(tasks.length-started)+'</b></div></div>'+
  '<div class="progressSkillGrid">'+skillCards+'</div>'+
  '<div class="progressHubTools"><b>Tất cả task</b><div><button class="btn primary" data-progress-filter="all">Tất cả</button><button class="btn" data-progress-filter="review">Cần ôn</button><button class="btn" data-progress-filter="mastered">Mastered</button></div></div>'+
  '<div id="progressTaskList" class="progressTaskList">'+tasks.map(progressTaskRow).join('')+'</div>';

 bindTaskButtons(el);
 el.querySelectorAll('[data-progress-filter]').forEach(function(btn){
   btn.onclick=function(){
     const filter=btn.dataset.progressFilter;
     el.querySelectorAll('[data-progress-filter]').forEach(x=>x.classList.toggle('primary',x===btn));
     el.querySelectorAll('.progressTaskRow').forEach(function(row){
       const t=taskById(row.querySelector('[data-open]').dataset.open);
       const s=taskProgressSummary(t);
       row.style.display=filter==='all'||t.skill===filter||s.status===filter?'':'none';
     });
   };
 });
}

function taskCard(t,queue=false){
 const vocab=listeningVocabByTask[t.id],ps=taskProgressSummary(t),p=ps.p;
 return '<div class="flexTask '+(fs.done[t.id]?'done':'')+'">'+
   '<div><span class="skillPill '+t.skill+'">'+skillMeta[t.skill].label+'</span> <small>'+t.module+'</small>'+
   (vocab?'<span class="listenVocabBadge">🎧 Word drill · '+vocab.words.length+' từ</span>':'')+
   '<h4>'+t.title+'</h4><p>'+t.desc+'</p>'+
   (vocab?'<small class="listenVocabMeta">'+listeningWordMeta(t.id)+'</small>':'')+
   '<div class="taskMiniProgress"><div><span class="tpStatus '+ps.status+'">'+ps.label+'</span><small>'+p.attempts+' lần'+(ps.latest?' · gần nhất '+taskScoreLabel(ps.latest):'')+'</small><b>'+ps.mastery+'%</b></div><div class="tpMiniBar"><i style="width:'+ps.mastery+'%"></i></div></div>'+
   '</div>'+
   '<div class="flexTaskActions">'+
    '<button class="btn primary" data-open="'+t.id+'">'+(ps.status==='not-started'?'Mở bài':'Tiếp tục')+'</button>'+
    '<button class="btn" data-progress="'+t.id+'">Tiến độ</button>'+
    '<button class="btn '+(fs.done[t.id]?'green':'')+'" data-done="'+t.id+'">'+(fs.done[t.id]?'✓ Đã xong':'Đánh dấu hoàn thành')+'</button>'+
   '</div></div>';
}

function bindTaskButtons(root=document){
 root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openFlexTask(taskById(b.dataset.open)));
 root.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>toggleDone(b.dataset.done));
 root.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>showTaskProgress(b.dataset.progress));
}
function toggleDone(id){
 fs.done[id]=!fs.done[id];
 if(fs.done[id]){
   fs.queue=(fs.queue||[]).filter(x=>x!==id);
   const p=taskProgressRecord(id);
   p.completed=Math.max(1,p.completed||0);
   if(!p.lastStudied)p.lastStudied=Date.now();
   if(!p.history.length){
     p.history.push({at:Date.now(),kind:'completion',note:'Đánh dấu hoàn thành'});
   }
 }
 saveFlex();renderFlexHome();renderAllModules();renderCarry();renderProgressHub();updateHero();
}
function openFlexTask(t){
 if(!t)return;
 startTaskSession(t.id);
 if(t.day==='checkpoint'){openCheckpoint(t);return;}
 if(typeof window.openLesson==='function'){
  window.openLesson(t.day,t.index);
  setTimeout(()=>{
   if(t.skill==='listening')injectListeningWarmup(t);
   const finish=document.getElementById('finish');
   if(finish){
    const oldFinish=finish.onclick;
    finish.onclick=function(e){
     if(oldFinish)oldFinish.call(this,e);
     fs.done[t.id]=true;fs.queue=(fs.queue||[]).filter(x=>x!==t.id);
     completeTaskSession(t.id,'Hoàn thành task từ lesson');
     saveFlex();
     this.textContent='✓ Đã hoàn thành';
     renderProgressHub();
     updateHero();
    };
   }
  },0);
 }
}
function openCheckpoint(t){
 const skill=t.index,meta=skillMeta[skill],overlay=document.getElementById('lessonOverlay');
 document.getElementById('lessonTitle').innerHTML='<div class="phase">'+meta.label.toUpperCase()+' CHECKPOINT</div><h2>'+t.title+'</h2>';
 let instruction=(skill==='listening'||skill==='reading')
  ?'Làm một full '+meta.label+' test trong điều kiện thi. Không pause, không tra từ trong lúc làm. Sau khi chấm, nhập score /40 bên dưới và chữa từng lỗi.'
  :'Làm một full '+meta.label+' mock/task. Sau khi tự chấm hoặc nhận feedback, nhập band ước lượng. Quan trọng nhất là ghi 3 lỗi lặp và rewrite/re-record.';
 document.getElementById('lessonBody').innerHTML='<div class="learnBox"><h3>Mục tiêu</h3><p>'+instruction+'</p><div class="rule">Do → Score → Correct → Explain → Redo</div></div>'+
 '<div class="writeBox"><h3>Deep correction</h3><textarea class="prod" id="checkpointNotes" placeholder="Lỗi chính / evidence / điều cần sửa..."></textarea></div>'+
 '<div class="lessonActions"><button class="btn primary" id="goScoreView">Nhập kết quả</button><button class="btn green" id="checkpointDone">✓ Hoàn thành checkpoint</button></div>';
 overlay.classList.add('open');document.body.style.overflow='hidden';
 document.getElementById('goScoreView').onclick=()=>{overlay.classList.remove('open');document.body.style.overflow='';if(typeof window.show==='function')window.show(skill);document.getElementById(skill+'ScoreInput')?.focus()};
 document.getElementById('checkpointDone').onclick=()=>{fs.done[t.id]=true;fs.queue=fs.queue.filter(x=>x!==t.id);completeTaskSession(t.id,'Hoàn thành checkpoint');saveFlex();document.getElementById('checkpointDone').textContent='✓ Đã hoàn thành';renderProgressHub();updateHero()};
}

function renderFlexHome(){
 const card=document.getElementById('todayCard');if(!card)return;
 let [phase,desc]=phaseInfo(),q=chooseQueue(fs.queueSize,false);
 const qBtn=n=>'<button class="btn qsizeBtn" data-qsize="'+n+'" aria-pressed="'+(fs.queueSize===n?'true':'false')+'">'+(n===2?'Nhẹ':n===4?'Vừa':'Nhiều')+' • '+n+' task</button>';

 card.innerHTML='<div class="flexHeroLine"><div><span class="phase">'+phase+'</span><h2>Study Queue linh hoạt</h2><p class="muted">'+desc+'</p></div></div>'+
 '<div class="noPressure"><b>Không có “trễ lịch”.</b> Task chưa xong hôm nay sẽ ở lại queue cho lần học tiếp theo. Bạn có thể học ít hôm nay và bù vào ngày khác mà không làm hỏng lộ trình.</div>'+
 '<div class="queueControls"><span>Chọn lượng học phù hợp hôm nay:</span>'+qBtn(2)+qBtn(4)+qBtn(6)+'<button class="btn" id="newQueue">Đổi gợi ý</button></div>'+
 '<div class="flexQueue">'+q.map(t=>taskCard(t,true)).join('')+'</div>'+
 '<div class="skillSnapshot">'+['listening','reading','writing','speaking'].map(s=>{
   let v=latestScore(s),m=skillMeta[s];
   return '<div class="snapshotCard"><b>'+m.label+' '+m.target+'</b><strong>'+pctSkill(s)+'%</strong><span>'+(v===null?'Chưa nhập checkpoint':'Gần nhất: '+v+(m.metric==='/40'?'/40':' band'))+'</span></div>';
 }).join('')+'</div>';

 const paintSelected=n=>{
   card.querySelectorAll('[data-qsize]').forEach(btn=>{
     btn.setAttribute('aria-pressed',String(+btn.dataset.qsize===n));
   });
 };

 const renderQueue=items=>{
   const queueEl=card.querySelector('.flexQueue');
   if(!queueEl)return;
   queueEl.innerHTML=items.map(t=>taskCard(t,true)).join('');
   bindTaskButtons(queueEl);
 };

 bindTaskButtons(card);
 paintSelected(fs.queueSize);

 card.querySelectorAll('[data-qsize]').forEach(btn=>btn.onclick=()=>{
   const n=+btn.dataset.qsize;
   fs.queueSize=n;
   fs.queue=[];
   const nq=chooseQueue(n,true);
   fs.queue=nq.map(x=>x.id);
   saveFlex();
   paintSelected(n);
   renderQueue(nq);
 });

 document.getElementById('newQueue').onclick=()=>{
   fs.queue=[];
   const nq=chooseQueue(fs.queueSize,true);
   fs.queue=nq.map(x=>x.id);
   saveFlex();
   paintSelected(fs.queueSize);
   renderQueue(nq);
 };
}

function scoreBox(skill){
 const m=skillMeta[skill],arr=fs.scores[skill]||[],max=skill==='listening'||skill==='reading'?40:9,step=max===40?1:.5;
 return '<div class="scoreBox"><div><h3>Checkpoint</h3><p class="muted">Không theo ngày. Khi bạn làm một full test/mock, nhập kết quả để website biết lúc nào nên chuyển mức.</p></div>'+
 '<div class="scoreEntry"><input id="'+skill+'ScoreInput" type="number" min="0" max="'+max+'" step="'+step+'" placeholder="'+(max===40?'Score /40':'Band')+'"><button class="btn primary" data-score="'+skill+'">Lưu</button></div>'+
 '<div class="scoreHistory">'+(arr.length?'5 kết quả gần nhất: '+arr.slice(-5).join(max===40?'/40 • ':' • ') +(max===40?'/40':''):'Chưa có kết quả')+'<br><b>'+scoreStatus(skill)+'</b></div></div>';
}

function renderSkill(skill){
 const el=document.getElementById(skill+'Modules');if(!el)return;
 const m=skillMeta[skill],ms=modules[skill];
 el.innerHTML='<div class="skillHead"><div><span class="phase">TARGET '+m.target+'</span><h2>'+m.label+'</h2><p class="muted">Hoàn thành theo năng lực, không theo ngày. Có thể dừng ở bất kỳ module nào và quay lại tiếp.</p></div><strong>'+pctSkill(skill)+'%</strong></div>'+
 (skill!=='support'?scoreBox(skill):'')+
 '<div class="moduleStack">'+ms.map(mod=>{
   let done=mod.tasks.filter(t=>fs.done[t[0]]).length;
   return '<div class="moduleCard"><div class="moduleHead"><div><span class="moduleId">'+mod.id+'</span><h3>'+mod.title+'</h3><p>'+mod.goal+'</p></div><b>'+done+'/'+mod.tasks.length+'</b></div>'+
    '<div>'+mod.tasks.map(t=>taskCard({skill,module:mod.id,moduleTitle:mod.title,id:t[0],title:t[1],desc:t[2],day:t[3],index:t[4]})).join('')+'</div></div>';
 }).join('')+'</div>';
 bindTaskButtons(el);
 el.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>saveScore(b.dataset.score));
}
function saveScore(skill){
 const input=document.getElementById(skill+'ScoreInput'),v=parseFloat(input.value),max=(skill==='listening'||skill==='reading')?40:9;
 if(Number.isNaN(v)||v<0||v>max)return;
 fs.scores[skill].push(v);if(fs.scores[skill].length>12)fs.scores[skill]=fs.scores[skill].slice(-12);
 const active=window.__activeFlexTaskId&&taskById(window.__activeFlexTaskId);
 if(active&&active.day==='checkpoint'&&active.index===skill){
   window.recordTaskPerformance(skill==='listening'||skill==='reading'
     ?{kind:skill+' checkpoint',score:v,total:40,note:'Checkpoint '+v+'/40'}
     :{kind:skill+' checkpoint',band:v,note:'Checkpoint band '+v});
 }
 saveFlex();renderSkill(skill);renderFlexHome();renderProgressHub();
}
function renderAllModules(){['listening','reading','writing','speaking','support'].forEach(renderSkill)}

function renderCarry(){
 const panel=document.querySelector('#view-review .panel');if(!panel)return;
 let carry=(fs.queue||[]).map(taskById).filter(Boolean).filter(t=>!fs.done[t.id]);
 panel.innerHTML='<h2>Review & Carry-over</h2><div class="noPressure"><b>Carry-over tự động:</b> những task chưa hoàn thành không biến thành “nợ”. Chúng chỉ nằm đây để bạn tiếp tục khi có thời gian.</div>'+
 '<h3>Task đang mang sang lần học tiếp theo</h3><div id="carryList">'+(carry.length?carry.map(t=>taskCard(t,true)).join(''):'<p class="muted">Không có task đang carry-over.</p>')+'</div>'+
 '<h3>Review lỗi 1–3–7</h3><p class="muted">Các lỗi từ bài luyện cũ vẫn có thể quay lại ở đây.</p><div id="reviewList"></div>';
 bindTaskButtons(panel);
 if(typeof window.renderReview==='function')window.renderReview();
}

function renderSavedFlex(){
 if(typeof window.renderSaved==='function')window.renderSaved();
}

function overrideSearch(){
 const s=document.getElementById('search');if(!s)return;
 s.oninput=e=>{
  let q=e.target.value.trim().toLowerCase();if(!q)return;
  let t=allTasks().find(x=>(x.title+' '+x.desc+' '+x.moduleTitle+' '+x.skill).toLowerCase().includes(q));
  if(t){if(typeof window.show==='function')window.show(t.skill==='support'?'support':t.skill);setTimeout(()=>{let el=document.querySelector('[data-open="'+t.id+'"]');el?.scrollIntoView({behavior:'smooth',block:'center'})},60)}
 };
}

function cleanOldLabels(){
 document.title='NguyenGiaKy';
 const badge=document.querySelector('.hero .badge');if(badge)badge.textContent='IELTS Academic • Flexible Skill System';
}
window.renderToday=renderFlexHome;
window.renderRoadmap=function(){};
window.flexRenderHome=renderFlexHome;
window.renderProgressHub=renderProgressHub;
window.showTaskProgress=showTaskProgress;

renderFlexHome();
renderAllModules();
renderCarry();
renderSavedFlex();
renderProgressHub();
overrideSearch();
updateHero();
cleanOldLabels();

// When returning from a legacy lesson overlay, repaint the flexible home.
const close=document.getElementById('lessonClose');
if(close){
 const old=close.onclick;
 close.onclick=function(e){
   const id=window.__activeFlexTaskId;
   if(id)finishTaskTime(id);
   activeTaskSession=null;
   window.__activeFlexTaskId=null;
   if(old)old.call(this,e);
   setTimeout(()=>{renderFlexHome();renderAllModules();renderCarry();renderProgressHub();updateHero()},0);
 };
}
})();
