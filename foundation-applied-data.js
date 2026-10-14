/* First-party A1/A2 integrated communication practice. Author-created examples; CEFR-aligned goals, not certification. */
window.GKFoundationAppliedData = {
  "version": 1,
  "units": [
    {
      "id": "ap-a1-01",
      "level": "A1",
      "title": "Meet someone at school",
      "goal": "Introduce yourself, ask a follow-up question and identify another person.",
      "scene": "A new student joins your class. You want to be friendly without assuming you know them.",
      "concept": "I am / My name is identifies the speaker; this is introduces another person. Questions change what information you request.",
      "contrast": "'I am Leo' gives my name; 'This is Leo' introduces someone else.",
      "words": [
        [
          "introduce",
          "giới thiệu",
          "introduce yourself"
        ],
        [
          "classmate",
          "bạn cùng lớp",
          "new classmate"
        ],
        [
          "originally",
          "quê gốc",
          "originally from"
        ],
        [
          "nice to meet you",
          "rất vui được gặp",
          "nice to meet you"
        ],
        [
          "What about you?",
          "còn bạn thì sao?",
          "What about you?"
        ],
        [
          "study together",
          "học cùng nhau",
          "study together"
        ]
      ],
      "dialog": [
        {
          "speaker": "Mia",
          "text": "Hi, I'm Mia. Are you new here?"
        },
        {
          "speaker": "Ben",
          "text": "Yes. My name is Ben. I moved here last week."
        },
        {
          "speaker": "Mia",
          "text": "Nice to meet you, Ben. Which class are you in?"
        },
        {
          "speaker": "Ben",
          "text": "I'm in Room Four. What about you?"
        },
        {
          "speaker": "Mia",
          "text": "I'm in Room Four too. This is my friend Sam."
        }
      ],
      "listening": [
        {
          "prompt": "Why does Mia ask 'Which class are you in?' ",
          "options": [
            "To find Ben's classroom",
            "To ask Ben's age",
            "To ask about lunch"
          ],
          "correct": 0,
          "why": "She wants to know which class he attends."
        },
        {
          "prompt": "Who is Sam?",
          "options": [
            "A teacher",
            "Mia's friend",
            "Ben's brother"
          ],
          "correct": 1,
          "why": "Mia says 'This is my friend Sam.'"
        }
      ],
      "reading": "Mia sends a message to Ben: 'Hi Ben, I'm the student you met outside Room Four this morning. Sam and I are working on a science poster after lunch. Would you like to join us? We will be in the library at one o'clock. Please bring a pencil, but don't worry if you don't have coloured paper. Sam has some extra sheets. We hope to finish the poster before our science lesson tomorrow. You can reply to this message or find me in the library. See you soon, Mia.'",
      "readingQuestions": [
        {
          "prompt": "Where will they work?",
          "options": [
            "In the library",
            "In Room Two",
            "At Ben's house"
          ],
          "correct": 0,
          "evidence": "The message says they will be in the library."
        },
        {
          "prompt": "When will they meet?",
          "options": [
            "Before breakfast",
            "At one o'clock",
            "At six o'clock"
          ],
          "correct": 1,
          "evidence": "The last sentence gives one o'clock."
        }
      ],
      "language": [
        {
          "prompt": "Which sentence introduces another person?",
          "options": [
            "I'm Sam.",
            "This is Sam.",
            "My name is Sam."
          ],
          "correct": 1,
          "why": "'This is...' points to someone other than the speaker."
        },
        {
          "prompt": "Which question asks about a person's class?",
          "options": [
            "Where do you study?",
            "How old is your bag?",
            "Is your homework green?"
          ],
          "correct": 0,
          "why": "Where do you study? requests a place of study."
        }
      ],
      "writing": {
        "prompt": "Write a short message (3 sentences): introduce yourself to a new student, say which class you are in, and ask one friendly question.",
        "criteria": [
          "Introduce yourself",
          "Name a class",
          "Ask a real question"
        ],
        "example": "Hi, I'm Lin. I'm in Room Four. Which class are you in?"
      },
      "speaking": {
        "prompt": "Say hello to a new student, introduce yourself and ask where they study.",
        "followup": "The student answers 'Room Five.' Ask one more relevant question."
      },
      "transfer": {
        "prompt": "You meet a student at a bus stop, NOT in class. Introduce yourself and ask one question about the bus.",
        "criteria": [
          "Use a new context",
          "Introduce yourself",
          "Ask a relevant question"
        ]
      }
    },
    {
      "id": "ap-a1-02",
      "level": "A1",
      "title": "Family, people and possessions",
      "goal": "Describe who people are and whose objects they are.",
      "scene": "Your friend looks at a family photo and a bag on the table.",
      "concept": "Possessive 's shows whose object it is: Anna's bag. Her bag has the same ownership meaning. Subject and object pronouns have different jobs.",
      "contrast": "'This is Anna's bag' identifies the owner; 'Anna is a bag' changes the person into an object.",
      "words": [
        [
          "cousin",
          "anh/chị/em họ",
          "my cousin"
        ],
        [
          "belong to",
          "thuộc về",
          "belongs to"
        ],
        [
          "whose",
          "của ai",
          "Whose bag?"
        ],
        [
          "carry",
          "mang theo",
          "carry a bag"
        ],
        [
          "family photo",
          "ảnh gia đình",
          "family photo"
        ],
        [
          "visit",
          "đến thăm",
          "visit relatives"
        ]
      ],
      "dialog": [
        {
          "speaker": "Ana",
          "text": "Is that your family photo?"
        },
        {
          "speaker": "Leo",
          "text": "Yes. This is my cousin Alex, and that is my aunt."
        },
        {
          "speaker": "Ana",
          "text": "Whose blue bag is on the chair?"
        },
        {
          "speaker": "Leo",
          "text": "It's Alex's bag. He carries his books in it."
        },
        {
          "speaker": "Ana",
          "text": "Does he live near you?"
        },
        {
          "speaker": "Leo",
          "text": "No, he lives in another town, but he visits us on Sundays."
        }
      ],
      "listening": [
        {
          "prompt": "Whose bag is it?",
          "options": [
            "Ana's",
            "Alex's",
            "Leo's aunt's"
          ],
          "correct": 1,
          "why": "Leo explicitly says 'It's Alex's bag.'"
        },
        {
          "prompt": "When does Alex visit?",
          "options": [
            "On Sundays",
            "On Fridays",
            "Every morning"
          ],
          "correct": 0,
          "why": "He visits them on Sundays."
        }
      ],
      "reading": "Leo texts his mum from his aunt's house: 'Hi Mum, I'm with Alex at Aunt Nina's house. His bike is outside by the front gate, and my backpack is in the kitchen. We are making lunch now, so I'll be home later than usual. I found your book on the shelf in the living room and I will bring it home at five. Alex is going to visit us on Sunday, so we can show him the new garden. Please tell Dad I'm safe. See you soon, Leo.'",
      "readingQuestions": [
        {
          "prompt": "Where is Leo's backpack?",
          "options": [
            "Outside",
            "In the kitchen",
            "At school"
          ],
          "correct": 1,
          "evidence": "The message says 'my backpack is in the kitchen'."
        },
        {
          "prompt": "Who owns the book Leo will bring?",
          "options": [
            "Leo's mum",
            "Alex",
            "The aunt"
          ],
          "correct": 0,
          "evidence": "The message says 'your book' to Mum."
        }
      ],
      "language": [
        {
          "prompt": "Which is natural?",
          "options": [
            "She bag is blue.",
            "Her bag is blue.",
            "Hers bag blue."
          ],
          "correct": 1,
          "why": "A possessive determiner 'her' comes before a noun."
        },
        {
          "prompt": "Which sentence shows ownership?",
          "options": [
            "This is Tom's phone.",
            "Tom is phone.",
            "His is a phone Tom."
          ],
          "correct": 0,
          "why": "Tom's modifies the noun phone."
        }
      ],
      "writing": {
        "prompt": "Describe two family members or friends and one thing each person owns. Write 3–4 sentences.",
        "criteria": [
          "Identify at least two people",
          "Use possession correctly",
          "Make sentences clear"
        ],
        "example": "My cousin Lin lives nearby. Her bike is red. My brother's bag is black."
      },
      "speaking": {
        "prompt": "Describe two people in a family photo and name something that belongs to one person.",
        "followup": "The listener asks 'Whose bag is that?' Answer clearly."
      },
      "transfer": {
        "prompt": "You found a jacket at school. Write a short message asking whose jacket it is and where it is.",
        "criteria": [
          "Ask about ownership",
          "Describe an object",
          "Give a location"
        ]
      }
    },
    {
      "id": "ap-a1-03",
      "level": "A1",
      "title": "Daily routines and timetables",
      "goal": "Explain your schedule, frequency and time using appropriate expressions.",
      "scene": "You and a friend plan to study together after school.",
      "concept": "Present Simple describes routines; at is used for clock times, on for days, and in for parts of the day. Usually shows frequency.",
      "contrast": "'I study on Tuesday' is a regular or scheduled fact; 'I'm studying now' is happening at this moment.",
      "words": [
        [
          "usually",
          "thường",
          "usually study"
        ],
        [
          "sometimes",
          "thỉnh thoảng",
          "sometimes walk"
        ],
        [
          "timetable",
          "thời khóa biểu",
          "school timetable"
        ],
        [
          "after school",
          "sau giờ học",
          "after school"
        ],
        [
          "at half past",
          "vào giờ rưỡi",
          "at half past four"
        ],
        [
          "before dinner",
          "trước bữa tối",
          "before dinner"
        ]
      ],
      "dialog": [
        {
          "speaker": "Kai",
          "text": "Do you study every afternoon?"
        },
        {
          "speaker": "Ella",
          "text": "Not every day. I usually study on Mondays and Wednesdays."
        },
        {
          "speaker": "Kai",
          "text": "What time do you start?"
        },
        {
          "speaker": "Ella",
          "text": "At half past four, after football practice."
        },
        {
          "speaker": "Kai",
          "text": "I finish school at three. Shall we meet on Wednesday?"
        },
        {
          "speaker": "Ella",
          "text": "Yes, let's meet in the library before dinner."
        }
      ],
      "listening": [
        {
          "prompt": "When does Ella usually study?",
          "options": [
            "Monday and Wednesday",
            "Every Friday",
            "Only Sunday"
          ],
          "correct": 0,
          "why": "She says Mondays and Wednesdays."
        },
        {
          "prompt": "What time does she start?",
          "options": [
            "3:00",
            "4:30",
            "5:30"
          ],
          "correct": 1,
          "why": "Half past four is 4:30."
        }
      ],
      "reading": "Notice on the library door: 'Study Club meets on Tuesdays at 3:30 pm in Room Six. Everyone in Years 9 to 12 can join. Students may bring a small snack and a bottle of water, but please do not bring hot food into the room. The club finishes at 5:00 pm. On Thursdays, the library opens late for independent study. There is no Study Club teacher on Thursdays, but students can still use the desks and books. If you need help with homework, come on Tuesday and ask Ms Lee. Please leave the tables clean.'",
      "readingQuestions": [
        {
          "prompt": "Where does Study Club meet?",
          "options": [
            "Room Six",
            "Room Three",
            "The gym"
          ],
          "correct": 0,
          "evidence": "The first sentence names Room Six."
        },
        {
          "prompt": "Which day is for independent study?",
          "options": [
            "Monday",
            "Tuesday",
            "Thursday"
          ],
          "correct": 2,
          "evidence": "The last sentence says Thursday."
        }
      ],
      "language": [
        {
          "prompt": "Choose the natural time phrase.",
          "options": [
            "in Monday",
            "at Wednesday",
            "on Wednesday"
          ],
          "correct": 2,
          "why": "Use on with days."
        },
        {
          "prompt": "Which sentence describes a habit?",
          "options": [
            "I usually walk to school.",
            "I'm walking this second.",
            "Look! She is running."
          ],
          "correct": 0,
          "why": "Usually signals a repeated routine."
        }
      ],
      "writing": {
        "prompt": "Write a realistic weekly study plan: say when you normally study, when you sometimes rest, and when you will meet a friend.",
        "criteria": [
          "Include a usual habit",
          "Use day/time phrases",
          "Explain a plan with a friend"
        ],
        "example": "I usually study on weekdays. On Fridays I sometimes rest. I will meet Leo at four on Monday."
      },
      "speaking": {
        "prompt": "Describe your routine on a typical school day. Include two times and one frequency word.",
        "followup": "Your friend asks 'Do you do that every day?' Answer and explain."
      },
      "transfer": {
        "prompt": "A friend is free on Saturday but busy on weekdays. Suggest a realistic meeting time and ask for a reply.",
        "criteria": [
          "Respond to the new availability",
          "Suggest a day and time",
          "Ask a clear question"
        ]
      }
    },
    {
      "id": "ap-a1-04",
      "level": "A1",
      "title": "Shopping and polite requests",
      "goal": "Ask about price, amount and availability in a shop.",
      "scene": "You are buying food for a school picnic.",
      "concept": "Much is used with uncountable quantities and price; many with countable plurals. Some/any commonly differ in statements and questions. Polite requests can use Could I have ...?",
      "contrast": "'How many apples?' counts individual apples; 'How much milk?' asks for amount of liquid.",
      "words": [
        [
          "cost",
          "giá",
          "How much does it cost?"
        ],
        [
          "a bottle of",
          "một chai",
          "a bottle of water"
        ],
        [
          "a few",
          "vài",
          "a few apples"
        ],
        [
          "any left",
          "còn cái nào",
          "Do you have any left?"
        ],
        [
          "receipt",
          "hóa đơn",
          "keep the receipt"
        ],
        [
          "Could I have...?",
          "Cho tôi ... được không?",
          "Could I have ...?"
        ]
      ],
      "dialog": [
        {
          "speaker": "Customer",
          "text": "Hello. Could I have three apples and a bottle of water, please?"
        },
        {
          "speaker": "Shopkeeper",
          "text": "Of course. The apples are two dollars each."
        },
        {
          "speaker": "Customer",
          "text": "Do you have any sandwiches left?"
        },
        {
          "speaker": "Shopkeeper",
          "text": "Yes, two. They cost five dollars each."
        },
        {
          "speaker": "Customer",
          "text": "I'll take one sandwich too. Can I pay by card?"
        },
        {
          "speaker": "Shopkeeper",
          "text": "Yes, you can. Would you like a receipt?"
        }
      ],
      "listening": [
        {
          "prompt": "How many apples does the customer want?",
          "options": [
            "Two",
            "Three",
            "Five"
          ],
          "correct": 1,
          "why": "The customer asks for three apples."
        },
        {
          "prompt": "How many sandwiches are left?",
          "options": [
            "Two",
            "None",
            "Five"
          ],
          "correct": 0,
          "why": "The shopkeeper says there are two left."
        }
      ],
      "reading": "Picnic shopping note from the class teacher: 'Hello everyone. We need four bananas, two bottles of water, a little cheese and some bread for our picnic. Please buy apples only if the shop has fresh ones. We don't need more juice because I already have two cartons. If the shop does not have bread, you can buy a few plain rolls instead. Remember that one student cannot eat dairy, so keep a dairy-free option for them. Keep the receipt so I can check the total cost. Bring the food to school before nine tomorrow morning.'",
      "readingQuestions": [
        {
          "prompt": "What must the shopper keep?",
          "options": [
            "The receipt",
            "The shop sign",
            "A notebook"
          ],
          "correct": 0,
          "evidence": "Keep the receipt is an explicit instruction."
        },
        {
          "prompt": "When should the shopper buy apples?",
          "options": [
            "Always",
            "If they are fresh",
            "Only if expensive"
          ],
          "correct": 1,
          "evidence": "Apples depend on freshness."
        }
      ],
      "language": [
        {
          "prompt": "Choose the correct question.",
          "options": [
            "How many water?",
            "How much water?",
            "How much apples?"
          ],
          "correct": 1,
          "why": "Water is uncountable in this use."
        },
        {
          "prompt": "Choose the polite request.",
          "options": [
            "Give now!",
            "Could I have a sandwich, please?",
            "I sandwich want."
          ],
          "correct": 1,
          "why": "Could I have ...? is a polite request."
        }
      ],
      "writing": {
        "prompt": "Write a 4-line mini dialogue between a customer and a shopkeeper. Ask for two items, ask a price and respond politely.",
        "criteria": [
          "Request two items",
          "Ask for a price or quantity",
          "Use polite English"
        ],
        "example": "Customer: Could I have two apples, please? Seller: Yes. Customer: How much are they? Seller: Four dollars."
      },
      "speaking": {
        "prompt": "Order a drink and a snack in a shop. Ask about the price and thank the worker.",
        "followup": "The worker says one item is sold out. Ask for an alternative."
      },
      "transfer": {
        "prompt": "Your friend cannot eat dairy. Write a shopping request for two appropriate non-dairy items without copying the original picnic list.",
        "criteria": [
          "Respect the new constraint",
          "Request suitable items",
          "Use a clear quantity"
        ]
      }
    },
    {
      "id": "ap-a1-05",
      "level": "A1",
      "title": "Find your way around town",
      "goal": "Ask for directions and explain locations using landmarks.",
      "scene": "You need to find a community library from the bus station.",
      "concept": "Prepositions show location and movement; imperatives like turn left/right and go straight give directions. Asking 'Could you repeat that?' repairs confusion.",
      "contrast": "'The library is next to the bank' describes position; 'Turn left at the bank' describes movement.",
      "words": [
        [
          "opposite",
          "đối diện",
          "opposite the bank"
        ],
        [
          "next to",
          "bên cạnh",
          "next to the cafe"
        ],
        [
          "go straight",
          "đi thẳng",
          "go straight"
        ],
        [
          "turn left",
          "rẽ trái",
          "turn left"
        ],
        [
          "corner",
          "góc đường",
          "at the corner"
        ],
        [
          "Could you repeat?",
          "Bạn nhắc lại được không?",
          "Could you repeat that?"
        ]
      ],
      "dialog": [
        {
          "speaker": "Visitor",
          "text": "Excuse me. How do I get to the library?"
        },
        {
          "speaker": "Local",
          "text": "Go straight past the post office, then turn left at the bank."
        },
        {
          "speaker": "Visitor",
          "text": "Is the library opposite the bank?"
        },
        {
          "speaker": "Local",
          "text": "No, it's next to the museum, on the right."
        },
        {
          "speaker": "Visitor",
          "text": "Sorry, could you repeat the last part?"
        },
        {
          "speaker": "Local",
          "text": "It's next to the museum, on your right."
        }
      ],
      "listening": [
        {
          "prompt": "Where do you turn left?",
          "options": [
            "At the bank",
            "At the museum",
            "At the post office"
          ],
          "correct": 0,
          "why": "The local says turn left at the bank."
        },
        {
          "prompt": "Where is the library?",
          "options": [
            "Opposite the bank",
            "Next to the museum",
            "Inside the cafe"
          ],
          "correct": 1,
          "why": "The final line says next to the museum."
        }
      ],
      "reading": "Visitor notice at the railway station: 'The community centre is behind the supermarket on Queen Street. From the railway station, walk along Queen Street until you see the big clock outside the supermarket. Keep going for one more minute. The entrance to the centre is on your left, opposite the pharmacy. The centre opens at nine in the morning and closes at five. The small cafe next to the centre opens at ten. Please use the main entrance, not the staff door beside the supermarket. If you are lost, ask at the railway station information desk.'",
      "readingQuestions": [
        {
          "prompt": "What is opposite the pharmacy?",
          "options": [
            "The centre entrance",
            "The supermarket",
            "The railway station"
          ],
          "correct": 0,
          "evidence": "The notice identifies the entrance opposite the pharmacy."
        },
        {
          "prompt": "What time does the centre open?",
          "options": [
            "8 am",
            "9 am",
            "10 am"
          ],
          "correct": 1,
          "evidence": "The last sentence says nine."
        }
      ],
      "language": [
        {
          "prompt": "Which asks for directions?",
          "options": [
            "How get library me?",
            "How do I get to the library?",
            "Where library are?"
          ],
          "correct": 1,
          "why": "Use How do I get to ...? for a route."
        },
        {
          "prompt": "Which tells someone to move?",
          "options": [
            "The park is opposite the bank.",
            "Turn right at the lights.",
            "The bank is a tall building."
          ],
          "correct": 1,
          "why": "Turn right is an instruction."
        }
      ],
      "writing": {
        "prompt": "Write clear directions from your school entrance to another place nearby. Include two movements and one landmark.",
        "criteria": [
          "Give two instructions",
          "Use a landmark",
          "Use clear location words"
        ],
        "example": "Go straight from the gate. Turn right at the traffic lights. The shop is next to the bank."
      },
      "speaking": {
        "prompt": "Ask a stranger where the nearest library is. Repeat the directions in your own words.",
        "followup": "You did not hear a street name. Ask the person to repeat it politely."
      },
      "transfer": {
        "prompt": "Your friend is now at the train station instead of the bus stop. Give different directions to the library using the train station as the starting point.",
        "criteria": [
          "Start from the new location",
          "Explain movement clearly",
          "Use a landmark"
        ]
      }
    },
    {
      "id": "ap-a1-06",
      "level": "A1",
      "title": "Talk about yesterday and next weekend",
      "goal": "Describe a past event and make plans with another person.",
      "scene": "Two friends discuss a school event that finished yesterday and a picnic next week.",
      "concept": "Past Simple shows a finished event, including irregular verbs such as went/saw. Going to expresses an intention or plan. Time markers help listeners.",
      "contrast": "'We went yesterday' is finished; 'We're going to go on Saturday' is future.",
      "words": [
        [
          "went",
          "đã đi",
          "went to the park"
        ],
        [
          "saw",
          "đã thấy",
          "saw a film"
        ],
        [
          "yesterday",
          "hôm qua",
          "yesterday afternoon"
        ],
        [
          "last weekend",
          "cuối tuần trước",
          "last weekend"
        ],
        [
          "plan to",
          "dự định",
          "plan to visit"
        ],
        [
          "join us",
          "tham gia cùng",
          "join us"
        ]
      ],
      "dialog": [
        {
          "speaker": "Nora",
          "text": "Did you go to the school concert yesterday?"
        },
        {
          "speaker": "Finn",
          "text": "Yes, I went with my sister. We saw three bands."
        },
        {
          "speaker": "Nora",
          "text": "Was it good?"
        },
        {
          "speaker": "Finn",
          "text": "Yes, but we arrived late and missed the first song."
        },
        {
          "speaker": "Nora",
          "text": "I'm going to visit the art fair on Saturday. Would you like to join us?"
        },
        {
          "speaker": "Finn",
          "text": "I'd love to. What time are you going?"
        }
      ],
      "listening": [
        {
          "prompt": "Why did Finn miss a song?",
          "options": [
            "He arrived late",
            "He was sick",
            "The band cancelled"
          ],
          "correct": 0,
          "why": "He says 'we arrived late and missed the first song.'"
        },
        {
          "prompt": "What is Nora planning?",
          "options": [
            "Another concert yesterday",
            "An art fair on Saturday",
            "A film on Monday"
          ],
          "correct": 1,
          "why": "Her future plan is the art fair on Saturday."
        }
      ],
      "reading": "Nora writes to Finn: 'Hi Finn. The art fair starts at ten on Saturday. My family went last year and enjoyed the student paintings, especially the colourful pictures of the river. This year I want to see the photography room. Let's meet at the school gate at nine thirty, because we need time to walk there. Bring a jacket because it may be windy, and bring a little water. We can buy lunch at the fair if we get hungry. If your sister wants to come, she is welcome too. Please message me by Friday evening. See you soon, Nora.'",
      "readingQuestions": [
        {
          "prompt": "When should Finn meet Nora?",
          "options": [
            "9:30",
            "10:00",
            "10:30"
          ],
          "correct": 0,
          "evidence": "Meet at the school gate at nine thirty."
        },
        {
          "prompt": "Why bring a jacket?",
          "options": [
            "It might be windy",
            "It is a uniform",
            "It is raining now"
          ],
          "correct": 0,
          "evidence": "The message says it may be windy."
        }
      ],
      "language": [
        {
          "prompt": "Which sentence is about the past?",
          "options": [
            "I go tomorrow.",
            "I went yesterday.",
            "I am going next week."
          ],
          "correct": 1,
          "why": "Went is the past form of go."
        },
        {
          "prompt": "Which sentence describes a plan?",
          "options": [
            "I am going to visit my cousin.",
            "I visited my cousin last year.",
            "I saw my cousin yesterday."
          ],
          "correct": 0,
          "why": "Going to indicates an intention."
        }
      ],
      "writing": {
        "prompt": "Write a short message about one thing you did last weekend, and suggest a different plan for next weekend. Use 3–4 sentences.",
        "criteria": [
          "Describe a completed past event",
          "Suggest a future plan",
          "Give a relevant time"
        ],
        "example": "I went to the market last Sunday. It was busy. I'm going to visit the park next Saturday. Would you like to come?"
      },
      "speaking": {
        "prompt": "Tell a friend two things you did yesterday, then invite them to an event next weekend.",
        "followup": "Your friend says 'Sorry, I'm busy on Saturday.' Suggest another time."
      },
      "transfer": {
        "prompt": "Your friend's event was cancelled. Suggest a NEW activity and explain when and where you can meet.",
        "criteria": [
          "Respond to cancellation",
          "Make a new plan",
          "Give time and place"
        ]
      }
    },
    {
      "id": "ap-a2-01",
      "level": "A2",
      "title": "Change an appointment politely",
      "goal": "Explain a schedule problem and negotiate another time.",
      "scene": "You need to change an appointment because of a timetable conflict.",
      "concept": "Could and would make requests more polite; because gives a reason; instead suggests an alternative. A successful message has purpose, reason and next step.",
      "contrast": "'I can't come because I have class' explains a reason; 'Could we meet later instead?' makes a request.",
      "words": [
        [
          "reschedule",
          "đổi lịch",
          "reschedule an appointment"
        ],
        [
          "available",
          "rảnh",
          "available tomorrow"
        ],
        [
          "instead",
          "thay vào đó",
          "meet later instead"
        ],
        [
          "appointment",
          "cuộc hẹn",
          "make an appointment"
        ],
        [
          "unfortunately",
          "tiếc là",
          "Unfortunately, I can't"
        ],
        [
          "confirm",
          "xác nhận",
          "confirm a time"
        ]
      ],
      "dialog": [
        {
          "speaker": "Receptionist",
          "text": "Good morning. How can I help?"
        },
        {
          "speaker": "Student",
          "text": "I have an appointment at three, but my class finishes at half past three. Could I change the time?"
        },
        {
          "speaker": "Receptionist",
          "text": "Of course. Are you available at four thirty tomorrow?"
        },
        {
          "speaker": "Student",
          "text": "Tomorrow is difficult because I have a test. Is Friday morning possible?"
        },
        {
          "speaker": "Receptionist",
          "text": "Yes, nine fifteen on Friday is free."
        },
        {
          "speaker": "Student",
          "text": "Thank you. Could you please confirm that by email?"
        }
      ],
      "listening": [
        {
          "prompt": "Why can't the student attend at three?",
          "options": [
            "A class conflict",
            "A cancelled bus",
            "A family visit"
          ],
          "correct": 0,
          "why": "The student has class until half past three."
        },
        {
          "prompt": "What time is agreed?",
          "options": [
            "Thursday 4:30",
            "Friday 9:15",
            "Friday 3:15"
          ],
          "correct": 1,
          "why": "Nine fifteen on Friday is free and accepted."
        }
      ],
      "reading": "Subject: Request to change Wednesday meeting. 'Dear Ms Green, I am writing about our meeting on Wednesday at 2 pm. Unfortunately, I will be helping to organise a school event until 3 pm, so I cannot arrive on time. I apologise for the short notice. Would it be possible to meet on Thursday after lunch instead? I am available between 1 pm and 3 pm that day. If Thursday is inconvenient, I could also meet before school on Friday. Please let me know which option works best for you. Thank you for your understanding. Kind regards, Maya.'",
      "readingQuestions": [
        {
          "prompt": "What is Maya asking?",
          "options": [
            "To cancel school",
            "To change the meeting time",
            "To register an event"
          ],
          "correct": 1,
          "evidence": "She requests Thursday instead of Wednesday."
        },
        {
          "prompt": "Why does she need to change it?",
          "options": [
            "A school event",
            "An exam result",
            "A bus delay"
          ],
          "correct": 0,
          "evidence": "She will be helping at a school event."
        }
      ],
      "language": [
        {
          "prompt": "Which is a polite request?",
          "options": [
            "Move my time now.",
            "Could we meet on Friday instead?",
            "You are wrong time."
          ],
          "correct": 1,
          "why": "Could we ...? expresses a polite request."
        },
        {
          "prompt": "Which connector introduces a reason?",
          "options": [
            "because",
            "instead",
            "however"
          ],
          "correct": 0,
          "why": "Because introduces an explanation."
        }
      ],
      "writing": {
        "prompt": "Write a polite email to change a meeting. State the original time, a real reason, and a new time. Close politely.",
        "criteria": [
          "State the existing appointment",
          "Explain the conflict",
          "Suggest a new specific time",
          "Use a polite greeting/close"
        ],
        "example": "Hello Ms Lee, I cannot attend our meeting on Tuesday at two because I have class. Could we meet on Wednesday at four instead? Thank you, Sam."
      },
      "speaking": {
        "prompt": "Phone a receptionist to change an appointment. State your reason and propose a different time.",
        "followup": "Your suggested time is unavailable. Offer another day politely."
      },
      "transfer": {
        "prompt": "Your new class finishes late on BOTH Tuesday and Wednesday. Write a message proposing a different day without copying the example.",
        "criteria": [
          "Respect both unavailable days",
          "Propose a specific alternative",
          "Ask for confirmation"
        ]
      }
    },
    {
      "id": "ap-a2-02",
      "level": "A2",
      "title": "Choose between two options",
      "goal": "Compare prices, travel times and benefits and justify a decision.",
      "scene": "You must choose how to get to a school trip.",
      "concept": "Comparatives compare two choices; superlatives compare several. 'Cheaper' is about cost, not necessarily speed; 'although' marks contrast.",
      "contrast": "'The bus is cheaper than the train' compares price, not travel time. 'The fastest' describes maximum speed.",
      "words": [
        [
          "affordable",
          "hợp túi tiền",
          "more affordable"
        ],
        [
          "convenient",
          "thuận tiện",
          "more convenient"
        ],
        [
          "reliable",
          "đáng tin",
          "more reliable"
        ],
        [
          "although",
          "mặc dù",
          "although it is slower"
        ],
        [
          "fare",
          "giá vé",
          "bus fare"
        ],
        [
          "advantage",
          "lợi thế",
          "main advantage"
        ]
      ],
      "dialog": [
        {
          "speaker": "Ella",
          "text": "The bus ticket costs eight dollars, but the train ticket costs twelve."
        },
        {
          "speaker": "Jay",
          "text": "The train is faster, though. It takes twenty minutes instead of forty-five."
        },
        {
          "speaker": "Ella",
          "text": "True, but the bus stops right outside our school."
        },
        {
          "speaker": "Jay",
          "text": "If we have plenty of time, the bus is more affordable."
        },
        {
          "speaker": "Ella",
          "text": "Agreed. Let's take the bus and leave earlier."
        }
      ],
      "listening": [
        {
          "prompt": "What is cheaper?",
          "options": [
            "The bus",
            "The train",
            "They cost the same"
          ],
          "correct": 0,
          "why": "Bus eight dollars, train twelve."
        },
        {
          "prompt": "Why does the train have an advantage?",
          "options": [
            "It is faster",
            "It stops at school",
            "It is free"
          ],
          "correct": 0,
          "why": "Train twenty minutes, bus forty-five."
        }
      ],
      "reading": "School trip information: 'City Museum: student entry costs $6. It opens at 9 am and closes at 4 pm. A guided visit usually takes 90 minutes and covers the local history collection. Art Gallery: entry is free. It opens at 10 am and closes at 5 pm. A typical visit takes about 60 minutes and includes a student art display. Both places are near the railway station, but the gallery is easier to reach on foot. The museum is useful for history classes, although the gallery may be more affordable for a large group. The teachers have not made the final decision yet.'",
      "readingQuestions": [
        {
          "prompt": "Which venue has free entry?",
          "options": [
            "City Museum",
            "Art Gallery",
            "Both"
          ],
          "correct": 1,
          "evidence": "Art Gallery entry is free."
        },
        {
          "prompt": "Which place is easier to reach on foot?",
          "options": [
            "Gallery",
            "Museum",
            "Neither"
          ],
          "correct": 0,
          "evidence": "The passage explicitly says gallery."
        }
      ],
      "language": [
        {
          "prompt": "Choose the comparative.",
          "options": [
            "more cheap",
            "cheaper",
            "the cheapest than"
          ],
          "correct": 1,
          "why": "Cheaper is the comparative of cheap."
        },
        {
          "prompt": "Choose the correct meaning of although.",
          "options": [
            "It introduces a contrast",
            "It always introduces time",
            "It counts nouns"
          ],
          "correct": 0,
          "why": "Although introduces information that contrasts."
        }
      ],
      "writing": {
        "prompt": "Recommend the bus or train for a school trip. Compare TWO criteria and explain your final choice using because or although.",
        "criteria": [
          "Compare two criteria",
          "Make a decision",
          "Justify the decision"
        ],
        "example": "The bus is cheaper than the train, although it is slower. I recommend the bus because the school wants to save money."
      },
      "speaking": {
        "prompt": "Compare two places to visit, then recommend one for your class.",
        "followup": "A friend prefers the other place. Explain your choice politely."
      },
      "transfer": {
        "prompt": "The school now needs to arrive within 30 minutes. Choose again between the bus and train and explain why your earlier answer may change.",
        "criteria": [
          "Notice the new 30-minute limit",
          "Choose a feasible option",
          "Explain how the limit changes the decision"
        ]
      }
    },
    {
      "id": "ap-a2-03",
      "level": "A2",
      "title": "Ask for help with an everyday problem",
      "goal": "Describe a problem accurately, ask advice and follow simple instructions.",
      "scene": "Your laptop stops working just before you need to submit schoolwork.",
      "concept": "Should gives advice; must expresses an obligation; mustn't forbids an action. First/then/after that organise steps.",
      "contrast": "'You should save a copy' advises; 'You must submit by five' states a requirement; 'You mustn't share your password' prohibits.",
      "words": [
        [
          "submit",
          "nộp",
          "submit an assignment"
        ],
        [
          "restart",
          "khởi động lại",
          "restart the device"
        ],
        [
          "deadline",
          "hạn nộp",
          "meet the deadline"
        ],
        [
          "back up",
          "sao lưu",
          "back up a file"
        ],
        [
          "unable to",
          "không thể",
          "unable to open"
        ],
        [
          "instead of",
          "thay vì",
          "email instead of uploading"
        ]
      ],
      "dialog": [
        {
          "speaker": "Student",
          "text": "My laptop won't open the assignment file, and the deadline is today."
        },
        {
          "speaker": "Teacher",
          "text": "First, try opening the backup copy. Have you saved one?"
        },
        {
          "speaker": "Student",
          "text": "Yes, I saved a copy online yesterday."
        },
        {
          "speaker": "Teacher",
          "text": "Good. You should try that copy. If it still fails, email me before five."
        },
        {
          "speaker": "Student",
          "text": "Should I send a screenshot of the error?"
        },
        {
          "speaker": "Teacher",
          "text": "Yes, that would help. But you mustn't share your password."
        }
      ],
      "listening": [
        {
          "prompt": "What should the student try first?",
          "options": [
            "Open the backup copy",
            "Buy a new laptop",
            "Share their password"
          ],
          "correct": 0,
          "why": "First, try opening the backup copy."
        },
        {
          "prompt": "What must the student NOT share?",
          "options": [
            "The error screenshot",
            "The assignment title",
            "The password"
          ],
          "correct": 2,
          "why": "The teacher explicitly says not to share passwords."
        }
      ],
      "reading": "School technology notice: 'If you cannot upload your assignment, contact your teacher before the deadline. In your message, include your class, assignment title and a short description of what went wrong. You should first check whether your document is saved on your device or in a backup folder. If the online system is unavailable, you may send a copy of your work by email. Ask your teacher to confirm that the file has arrived. Do not send account passwords, private login codes or other students' personal details. These steps help us support you without putting your accounts at risk.'",
      "readingQuestions": [
        {
          "prompt": "What details should a message include?",
          "options": [
            "Class and assignment title",
            "Bank account number",
            "Friend's password"
          ],
          "correct": 0,
          "evidence": "Notice asks for class and assignment title."
        },
        {
          "prompt": "Which action is not allowed?",
          "options": [
            "Emailing work",
            "Contacting the teacher",
            "Sharing login codes"
          ],
          "correct": 2,
          "evidence": "Do not send private login codes."
        }
      ],
      "language": [
        {
          "prompt": "Choose correct advice.",
          "options": [
            "You should try the backup.",
            "You should to try the backup.",
            "You mustn't try to backups."
          ],
          "correct": 0,
          "why": "Should takes the bare verb."
        },
        {
          "prompt": "Which means 'not allowed'?",
          "options": [
            "should",
            "mustn't",
            "could"
          ],
          "correct": 1,
          "why": "Mustn't expresses prohibition."
        }
      ],
      "writing": {
        "prompt": "Write a short message to a teacher: describe a technology problem, explain what you have tried, and request a safe solution before the deadline.",
        "criteria": [
          "Describe problem and urgency",
          "Say what was already tried",
          "Ask for a practical solution",
          "Do not include passwords"
        ],
        "example": "Hello, I cannot open my assignment file. I tried my backup but it did not work. Could I email the file instead? Thank you."
      },
      "speaking": {
        "prompt": "Explain a problem to your teacher and ask for a specific way to submit your work.",
        "followup": "The teacher suggests a solution that does not work. Politely say what happened and ask what to try next."
      },
      "transfer": {
        "prompt": "The school's upload system is down for everyone, but email works. Explain a safe alternative and what information you must include.",
        "criteria": [
          "Respond to the changed problem",
          "Suggest email submission",
          "Include assignment identifiers",
          "Avoid private credentials"
        ]
      }
    },
    {
      "id": "ap-a2-04",
      "level": "A2",
      "title": "Experiences and past details",
      "goal": "Talk about experiences, then give details about a completed event.",
      "scene": "You are speaking to a classmate about places you have visited.",
      "concept": "Present Perfect introduces life experiences when the exact past time is not the focus. Past Simple answers when, where or what happened on a finished occasion.",
      "contrast": "'I have visited Wellington' describes experience; 'I visited it last May' describes a finished event at a stated time.",
      "words": [
        [
          "ever",
          "đã bao giờ",
          "Have you ever...?"
        ],
        [
          "never",
          "chưa từng",
          "have never tried"
        ],
        [
          "visited",
          "đã đến thăm",
          "have visited"
        ],
        [
          "last year",
          "năm ngoái",
          "last year"
        ],
        [
          "experience",
          "trải nghiệm",
          "interesting experience"
        ],
        [
          "since",
          "từ khi",
          "since last year"
        ]
      ],
      "dialog": [
        {
          "speaker": "Luca",
          "text": "Have you ever visited Wellington?"
        },
        {
          "speaker": "Zoe",
          "text": "Yes, I have. I went there with my family last April."
        },
        {
          "speaker": "Luca",
          "text": "What did you do there?"
        },
        {
          "speaker": "Zoe",
          "text": "We visited a museum and walked along the waterfront."
        },
        {
          "speaker": "Luca",
          "text": "Have you ever been to Christchurch?"
        },
        {
          "speaker": "Zoe",
          "text": "No, I haven't, but I'd like to go next year."
        }
      ],
      "listening": [
        {
          "prompt": "When did Zoe visit Wellington?",
          "options": [
            "Last April",
            "Yesterday",
            "Next year"
          ],
          "correct": 0,
          "why": "She says last April."
        },
        {
          "prompt": "Has Zoe visited Christchurch?",
          "options": [
            "Yes",
            "No",
            "She did not say"
          ],
          "correct": 1,
          "why": "She says 'No, I haven't.'"
        }
      ],
      "reading": "Postcard from Iris: 'I have travelled to several places in New Zealand, but I have never been to Queenstown. Two years ago I stayed in Dunedin for a week with my aunt. We visited my cousin, walked along the beach and took photos of the old buildings. It rained on our first day, so we went to a museum instead. I enjoyed learning about the city's history. Since then I have become more interested in visiting new places. Next summer I hope to see Queenstown for the first time. I'm saving money for the trip and planning the route with my family.'",
      "readingQuestions": [
        {
          "prompt": "Which place has the writer NOT visited?",
          "options": [
            "Dunedin",
            "Queenstown",
            "New Zealand"
          ],
          "correct": 1,
          "evidence": "Have never been to Queenstown."
        },
        {
          "prompt": "How long did the writer stay in Dunedin?",
          "options": [
            "One day",
            "One week",
            "Two months"
          ],
          "correct": 1,
          "evidence": "The text says for a week."
        }
      ],
      "language": [
        {
          "prompt": "Which asks about life experience?",
          "options": [
            "Have you ever tried kayaking?",
            "Did you go there last Tuesday?",
            "Are you going tomorrow?"
          ],
          "correct": 0,
          "why": "Have you ever introduces experience up to now."
        },
        {
          "prompt": "Which is correct with a finished time?",
          "options": [
            "I have visited last Monday.",
            "I visited last Monday.",
            "I visiting last Monday."
          ],
          "correct": 1,
          "why": "Use Past Simple for a specified finished time."
        }
      ],
      "writing": {
        "prompt": "Write about ONE experience you have had and explain what happened on a specific occasion. Include when and one detail.",
        "criteria": [
          "Introduce an experience",
          "Use Past Simple for a specific finished time",
          "Give at least one meaningful detail"
        ],
        "example": "I have visited a museum in another city. I went there last winter with my class. I enjoyed the science exhibition."
      },
      "speaking": {
        "prompt": "Tell a classmate one experience you have had, then describe when it happened and what you did.",
        "followup": "Your friend asks 'Have you done it again since then?' Respond honestly in English."
      },
      "transfer": {
        "prompt": "A new student has never visited your town. Recommend one activity based on an experience you have actually had and mention when you did it.",
        "criteria": [
          "Describe an experience",
          "Give a finished past detail",
          "Recommend a relevant activity"
        ]
      }
    },
    {
      "id": "ap-a2-05",
      "level": "A2",
      "title": "Tell a story and correct a misunderstanding",
      "goal": "Explain events in order with background information and correct inaccurate details.",
      "scene": "Two classmates discuss what happened during a school performance.",
      "concept": "Past Continuous gives background activity while Past Simple can name a completed event. When and while organise the timeline.",
      "contrast": "'I was reading when the lights went out' contrasts an ongoing action with a finished interruption.",
      "words": [
        [
          "while",
          "trong khi",
          "while we waited"
        ],
        [
          "suddenly",
          "đột nhiên",
          "suddenly stopped"
        ],
        [
          "at first",
          "ban đầu",
          "at first"
        ],
        [
          "eventually",
          "cuối cùng",
          "eventually returned"
        ],
        [
          "meanwhile",
          "trong lúc đó",
          "meanwhile the others"
        ],
        [
          "interrupt",
          "gián đoạn",
          "interrupt a lesson"
        ]
      ],
      "dialog": [
        {
          "speaker": "Nina",
          "text": "What happened at the concert yesterday?"
        },
        {
          "speaker": "Max",
          "text": "The students were singing when the lights went out."
        },
        {
          "speaker": "Nina",
          "text": "Did everyone leave?"
        },
        {
          "speaker": "Max",
          "text": "No. At first we waited quietly. Then the teacher asked us to move near the windows."
        },
        {
          "speaker": "Nina",
          "text": "I heard the concert ended early."
        },
        {
          "speaker": "Max",
          "text": "Not exactly. The lights came back after ten minutes, and we finished the final song."
        }
      ],
      "listening": [
        {
          "prompt": "What was happening when the lights went out?",
          "options": [
            "Students were singing",
            "Everyone was leaving",
            "Teacher was reading"
          ],
          "correct": 0,
          "why": "They were singing when lights went out."
        },
        {
          "prompt": "Did the concert end early?",
          "options": [
            "Yes",
            "No",
            "The speaker is unsure"
          ],
          "correct": 1,
          "why": "They finished the final song after ten minutes."
        }
      ],
      "reading": "School event report: 'During sports day, students were running on the field when heavy rain began. The teachers immediately asked everyone to move into the hall. At first, some people thought the whole event had been cancelled because the outdoor races could not continue safely. In fact, only the outdoor programme stopped. While the rain continued, staff prepared the hall for the indoor awards ceremony. After lunch, students and families watched the awards as planned. The principal thanked everyone for responding calmly to the change. The final relay race will take place on another day, when the weather is better.'",
      "readingQuestions": [
        {
          "prompt": "What did the staff do?",
          "options": [
            "Move students into the hall",
            "Keep running outside",
            "Cancel lunch"
          ],
          "correct": 0,
          "evidence": "The report says moved everyone into the hall."
        },
        {
          "prompt": "What continued after lunch?",
          "options": [
            "Outdoor races",
            "Indoor awards ceremony",
            "Heavy rain"
          ],
          "correct": 1,
          "evidence": "The indoor awards ceremony continued."
        }
      ],
      "language": [
        {
          "prompt": "Correct timeline sentence:",
          "options": [
            "I was walking when it started to rain.",
            "I walking when raining started.",
            "I walked when it was begin rain."
          ],
          "correct": 0,
          "why": "Past Continuous background + Past Simple event."
        },
        {
          "prompt": "Which phrase politely corrects a misunderstanding?",
          "options": [
            "You're stupid.",
            "Not exactly; the event continued inside.",
            "I not knowing."
          ],
          "correct": 1,
          "why": "Not exactly gives a calm correction with accurate information."
        }
      ],
      "writing": {
        "prompt": "Tell a 4–5 sentence story about an interrupted event. Explain what was happening, what changed and the final outcome.",
        "criteria": [
          "Describe an ongoing background action",
          "Describe a new event",
          "Keep events in order",
          "Explain the outcome"
        ],
        "example": "We were studying when the power went out. At first we waited. Then our teacher opened the windows. The power returned and we finished the lesson."
      },
      "speaking": {
        "prompt": "Describe an unexpected change during a school day and explain what happened next.",
        "followup": "Your friend misunderstood the ending. Correct the detail politely."
      },
      "transfer": {
        "prompt": "A friend says that the entire sports day was cancelled. Correct the misunderstanding using information from the report and explain what happened instead.",
        "criteria": [
          "Identify the inaccurate claim",
          "Explain what actually stopped",
          "Explain what continued"
        ]
      }
    },
    {
      "id": "ap-a2-06",
      "level": "A2",
      "title": "Express an opinion in practical writing",
      "goal": "Understand a notice and write a short persuasive email with reasons.",
      "scene": "Your school asks students for opinions on a change to the library opening hours.",
      "concept": "Because gives a reason; although/however mark a contrast. An effective message is clear about the requested change and considers the reader.",
      "contrast": "'I agree because...' explains a reason; 'However...' introduces a different concern, not just an extra example.",
      "words": [
        [
          "extend",
          "kéo dài",
          "extend opening hours"
        ],
        [
          "suggest",
          "đề nghị",
          "suggest a change"
        ],
        [
          "on the other hand",
          "mặt khác",
          "on the other hand"
        ],
        [
          "benefit",
          "lợi ích",
          "main benefit"
        ],
        [
          "concern",
          "lo ngại",
          "raise a concern"
        ],
        [
          "respond",
          "phản hồi",
          "respond by Friday"
        ]
      ],
      "dialog": [
        {
          "speaker": "Teacher",
          "text": "We are thinking of keeping the library open until six instead of five."
        },
        {
          "speaker": "Student",
          "text": "That would help students who have activities after school."
        },
        {
          "speaker": "Teacher",
          "text": "Are there any disadvantages?"
        },
        {
          "speaker": "Student",
          "text": "Some students travel home by bus, so a later closing time may not help everyone."
        },
        {
          "speaker": "Teacher",
          "text": "Good point. Could you write your suggestion in an email?"
        },
        {
          "speaker": "Student",
          "text": "Yes. I'll explain why I support the change and mention the bus problem."
        }
      ],
      "listening": [
        {
          "prompt": "What change is proposed?",
          "options": [
            "Close at four",
            "Close at six",
            "Open at six"
          ],
          "correct": 1,
          "why": "They propose open until six instead of five."
        },
        {
          "prompt": "What concern does the student mention?",
          "options": [
            "Bus journeys",
            "Library books",
            "Exam fees"
          ],
          "correct": 0,
          "why": "Some students travel home by bus."
        }
      ],
      "reading": "Student Council Notice: 'We are reviewing the library opening hours for next term. At present, the library closes at 5 pm each school day. One option is to stay open until 6 pm twice a week. We know this could help students who finish sport or music practice late. However, other students must catch buses that leave before 5 pm, so a later opening time might not help everyone. Students who want to comment should send a short email to the council by Friday. Please include your opinion and at least one benefit or disadvantage of the change. We will discuss the suggestions at our next meeting.'",
      "readingQuestions": [
        {
          "prompt": "How often might the later closing apply?",
          "options": [
            "Every day",
            "Twice a week",
            "Only once this year"
          ],
          "correct": 1,
          "evidence": "The notice specifies twice a week."
        },
        {
          "prompt": "What should the email contain?",
          "options": [
            "A benefit or disadvantage",
            "A photo ID",
            "Exam answers"
          ],
          "correct": 0,
          "evidence": "The notice requests one benefit or disadvantage."
        }
      ],
      "language": [
        {
          "prompt": "Which sentence has a reason?",
          "options": [
            "I support the change because I study after school.",
            "However I study.",
            "I support because however."
          ],
          "correct": 0,
          "why": "Because introduces the supporting reason."
        },
        {
          "prompt": "Which connector signals contrast?",
          "options": [
            "and",
            "however",
            "because"
          ],
          "correct": 1,
          "why": "However contrasts with the previous point."
        }
      ],
      "writing": {
        "prompt": "Write a short email to the student council about the library proposal. Give your position, one reason, one concern or alternative, and a polite close.",
        "criteria": [
          "State a clear position",
          "Give at least one reason",
          "Respond to the notice details",
          "Mention a concern or alternative"
        ],
        "example": "Dear Student Council, I support opening until six twice a week because some students study after sport. However, bus times may be a problem. Could one late day be on Thursday? Kind regards, Mia."
      },
      "speaking": {
        "prompt": "Tell a teacher whether you support the library change and give two clear reasons.",
        "followup": "The teacher mentions students who catch the bus. Respond to that concern."
      },
      "transfer": {
        "prompt": "The school can now keep the library open late only ONE day each week. Write a revised suggestion that takes this new limit into account.",
        "criteria": [
          "Address the one-day limit",
          "Make a practical suggestion",
          "Explain why it helps"
        ]
      }
    }
  ]
};
