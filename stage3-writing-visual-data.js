/* Accessible original charts and diagrams for IELTS Academic Writing Task 1. Data are invented for training, not official IELTS figures. */
(function(){const cases=window.GKStage3PracticeData.cases;
Object.assign(cases,{
  "W8a": {
    "id": "W8a",
    "mode": "writing",
    "intro": "Original fictional line graph. Write a full Academic Task 1 report (150+ words, approximately 20 minutes) after this brief data check.",
    "text": "The line graph shows the percentages of commuters using public buses and private cars in a fictional district from 2015 to 2025. Summarise the overall movement of both categories, the year in which one first exceeded the other, and major changes without explaining causes that are not shown.",
    "questions": [
      {
        "prompt": "When did bus use first exceed car use?",
        "options": [
          "2015",
          "2020",
          "2023"
        ],
        "correct": 2,
        "why": "In 2023 bus use was 52% versus 42% for cars; in 2020 bus use was still lower."
      },
      {
        "prompt": "What happened to private-car use overall?",
        "options": [
          "It fell",
          "It doubled",
          "It stayed unchanged"
        ],
        "correct": 0,
        "why": "Car use fell from 58% to 36%."
      }
    ],
    "visual": {
      "kind": "line",
      "title": "Mode of travel (%)",
      "headers": [
        "Year",
        "Bus (%)",
        "Car (%)"
      ],
      "rows": [
        [
          2015,
          28,
          58
        ],
        [
          2018,
          34,
          54
        ],
        [
          2020,
          43,
          49
        ],
        [
          2023,
          52,
          42
        ],
        [
          2025,
          61,
          36
        ]
      ]
    }
  },
  "W8b": {
    "id": "W8b",
    "mode": "writing",
    "intro": "Original fictional grouped bar chart. Read units before comparison.",
    "text": "The grouped bar chart shows the percentage of homes with high-speed broadband in three fictional districts in 2020 and 2025. Write an overview, compare the highest and lowest groups and highlight meaningful changes. Do not claim how many households there were or why adoption changed.",
    "questions": [
      {
        "prompt": "Which district had the highest percentage in 2025?",
        "options": [
          "East",
          "West",
          "North"
        ],
        "correct": 1,
        "why": "West reached 55%, above East 45% and North 35%."
      },
      {
        "prompt": "Which two districts increased by 15 percentage points?",
        "options": [
          "East and North",
          "East and West",
          "West and North"
        ],
        "correct": 0,
        "why": "East rose 30→45 and North 20→35."
      }
    ],
    "visual": {
      "kind": "bar",
      "title": "Households with broadband (%)",
      "headers": [
        "District",
        "2020 (%)",
        "2025 (%)"
      ],
      "rows": [
        [
          "East",
          30,
          45
        ],
        [
          "West",
          50,
          55
        ],
        [
          "North",
          20,
          35
        ]
      ]
    }
  },
  "W8c": {
    "id": "W8c",
    "mode": "writing",
    "intro": "Original fictional pie chart. Shares total 100%.",
    "text": "The pie chart displays how students at a fictional college travelled to campus in 2025. Write a report describing the major proportions and useful comparisons. Do not claim that one method was faster, cheaper or more environmentally friendly because no such evidence is provided.",
    "questions": [
      {
        "prompt": "What was the largest single category?",
        "options": [
          "Bus",
          "Walking",
          "Car"
        ],
        "correct": 0,
        "why": "Bus represented 35% of the full distribution."
      },
      {
        "prompt": "What percentage used buses OR walked?",
        "options": [
          "50%",
          "60%",
          "65%"
        ],
        "correct": 1,
        "why": "35% bus + 25% walking = 60%."
      }
    ],
    "visual": {
      "kind": "pie",
      "title": "Main method of travel to college, 2025",
      "headers": [
        "Method",
        "Share (%)"
      ],
      "rows": [
        [
          "Bus",
          35
        ],
        [
          "Walking",
          25
        ],
        [
          "Car",
          20
        ],
        [
          "Bicycle",
          15
        ],
        [
          "Other",
          5
        ]
      ]
    }
  },
  "W8d": {
    "id": "W8d",
    "mode": "writing",
    "intro": "Original fictional table. Identify trends without invented explanations.",
    "text": "The table shows annual enrolments on three courses at a fictional college in 2021, 2023 and 2025. Write an overview and select key comparisons. These figures are student HEADCOUNTS, not percentages.",
    "questions": [
      {
        "prompt": "Which course saw the largest numerical rise from 2021 to 2025?",
        "options": [
          "Mathematics",
          "Biology",
          "Art"
        ],
        "correct": 0,
        "why": "Mathematics grew by 40, compared with Biology 35; Art fell."
      },
      {
        "prompt": "What happened to Art enrolments?",
        "options": [
          "Increased by 20",
          "Decreased by 20",
          "Remained at 180"
        ],
        "correct": 1,
        "why": "Art declined from 180 to 160."
      }
    ],
    "visual": {
      "kind": "table",
      "title": "Annual enrolments (students)",
      "headers": [
        "Year",
        "Mathematics",
        "Biology",
        "Art"
      ],
      "rows": [
        [
          2021,
          120,
          95,
          180
        ],
        [
          2023,
          145,
          110,
          170
        ],
        [
          2025,
          160,
          130,
          160
        ]
      ]
    }
  }
});
const visuals={
  "W3a": {
    "kind": "table",
    "title": "Library visits (people)",
    "headers": [
      "Year",
      "Town A",
      "Town B",
      "Town C"
    ],
    "rows": [
      [
        2020,
        24000,
        18000,
        12000
      ],
      [
        2025,
        30000,
        16000,
        20000
      ]
    ]
  },
  "W3b": {
    "kind": "bar",
    "title": "Train commuters (%)",
    "headers": [
      "District",
      "2018 (%)",
      "2025 (%)"
    ],
    "rows": [
      [
        "East",
        35,
        52
      ],
      [
        "West",
        20,
        28
      ],
      [
        "Central",
        46,
        44
      ]
    ]
  },
  "W3c": {
    "kind": "line",
    "title": "College electricity use (units)",
    "headers": [
      "Month",
      "Use (units)"
    ],
    "rows": [
      [
        "January",
        120
      ],
      [
        "February",
        150
      ],
      [
        "March",
        135
      ]
    ]
  },
  "W7a": {
    "kind": "flow",
    "title": "Paper recycling process",
    "steps": [
      "Collect used paper",
      "Sort non-paper material",
      "Mix with water to make pulp",
      "Press pulp into sheets",
      "Dry and package the sheets"
    ]
  },
  "W7b": {
    "kind": "maps",
    "title": "School campus site layout",
    "before": [
      [
        "Garden",
        "Entrance",
        "Sports field"
      ],
      [
        "Main building",
        "—",
        "Sports field"
      ],
      [
        "Library",
        "Bicycle parking",
        "Sports field"
      ]
    ],
    "after": [
      [
        "Covered waiting area",
        "Entrance + bicycle parking",
        "Sports field"
      ],
      [
        "Main building",
        "—",
        "Sports field"
      ],
      [
        "Library",
        "—",
        "Sports field"
      ]
    ]
  },
  "W7c": {
    "kind": "mixed",
    "title": "College enrolment and partly-online share",
    "headers": [
      "Year",
      "Partly online (%)",
      "Enrolment (students)"
    ],
    "rows": [
      [
        2020,
        40,
        2000
      ],
      [
        2025,
        65,
        2400
      ]
    ]
  }
};
for(const [id,v] of Object.entries(visuals)){if(cases[id])cases[id].visual=v;}
})();
