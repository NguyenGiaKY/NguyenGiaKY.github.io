# Foundation: curriculum audit and acceptance criteria

**Status: NOT YET A COMPLETE A1–A2 CURRICULUM.** This document is a quality-control baseline, **not** a certificate or test score. Review date: 2026-10-15.

## Purpose

Help a learner understand English meaning, construct their own sentences, listen to real communicative exchanges, explain choices, correct errors and transfer skills to an unfamiliar context. IELTS 6.5+ is an eventual training goal, **not an outcome guaranteed by Foundation**.

The 5-stage sequence **Understand → Think → Use → Check & Fix → Transfer** is sound as a learning principle, but a fixed 15-screen template is **not** a teaching standard. Number of activities must depend on the skill, the learner's errors and the evidence needed.

## Verifiable baseline (current repository)

Derived from `foundation-data.js`, `foundation-flow.js`, `foundation.js` and `learning-journey.js`:

- 24 core lessons: six A0, six A1, six A2, six IELTS Bridge.
- Directly presented items in these 24 lessons: **96 vocabulary entries** and **96 quiz questions**; total nominal lesson time **495 minutes** (8 hours 15 minutes). These counts do **not** include the separate sentence lab, relationship lab, Core Skills or additional vocabulary saved during Reading.
- Among the six A2 lessons, one is dedicated to Listening and one to Reading. Short multi-step practice exists in the generic flow, but **neither the audio nor the text library yet demonstrates broad A2 coverage**.
- The fixed Foundation flow has 15 activities per lesson, including some tasks that are generic across lessons. Clicking Next is not evidence of understanding.
- Historical quiz status allowed `mastered` after repeated small 4-item quizzes plus self-confirmation. This is **quiz review**, not a language proficiency determination. UI terminology has been corrected; the historical record has been preserved.
- Foundation learning journey previously read the legacy quiz store without the new Foundation flow store; this has been fixed to include modern attempts. This metric remains **practice coverage, not ability**.
- The starting-point diagnostic uses eight pre-existing multiple-choice grammar questions. It is a rough study suggestion and **cannot establish A1/A2 level**.
- Microphone recognition of a word is **not** evidence of accurate pronunciation or correct contextual use. AI grading is practice feedback and must not be presented as a certified exam score.

## External outcome references

- [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors): assess what learners **can do** in communicative contexts, across skills, rather than the number of pages completed.
- [British Council A1 description](https://learnenglish.britishcouncil.org/level/understand-your-level/a1-elementary): everyday expressions, introductions, basic personal questions, slow/simple interaction.
- [British Council A2 description](https://learnenglish.britishcouncil.org/level/understand-your-level/a2-pre-intermediate): familiar topics, direct exchanges of information, simple descriptions of past and surroundings.
- [British Council A1–A2 grammar topics](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2): use as a coverage reference, not a one-to-one syllabus mandate.

## Skills gaps and rebuild priorities

| Priority | Domain | Current evidence | Required change |
|---|---|---|---|
| P0 | Honest assessment | Completion, practice, checked answers and proficiency are not the same. | Separately record **attempted**, **checked**, **applied in a new task**, **needs review**. Never turn navigation into mastery. |
| P0 | Valid progression | 4-item quiz and repeated attendance do not prove a CEFR level. | Independent *unseen* checkpoint after each domain; a learner who misses a concept receives **targeted re-teaching**, not an empty retry. |
| P0 | A0 accessibility | An introduction lesson sometimes asks advanced paraphrase/analysis too early. | From observable situation → one meaning distinction → controlled sentence → short independent response; explicitly teach pronunciation and spelling when relevant. |
| P0 | Answer grading | Generic AI remarks can reward length over correctness. | Task-specific rubric with evidence, priority error, actionable correction, new attempt; permit Vietnamese *for reasoning*, require English for production tasks. |
| P1 | Grammar breadth | 12 A0/A1 lessons cover core forms; A2 layer is thin. | Audit question forms, articles, possessives, imperatives, frequency, tenses, quantifiers, adverb/adjective distinctions, verb patterns, basic clause links, narrative sequencing. Fill gaps through new **contextual** lessons. |
| P1 | Lexis | 96 explicitly taught core words alone are not a broad working vocabulary. | Topic/functional word banks, collocations, word family/part of speech, retrieval at spaced intervals, transfer into speaking/writing; track recognition separately from independent usage. |
| P1 | Listening | Short scripted dialogues and browser TTS can train recognition but cannot substitute for varied natural audio. | Original varied multi-turn listening with speaker distinction, graded speed, different communicative purposes and unseen comprehension questions. Label synthetic audio. |
| P1 | Reading | One dedicated A2 Reading lesson is not breadth. | Varied short messages, signs, emails, instructions, narratives and factual paragraphs with direct evidence questions and meaning-changing paraphrases. |
| P1 | Speaking | Speech recognition and an AI score are not automatically pronunciation assessment. | Elicit free responses and follow-up answers; evaluate intelligibility, relevance, response development and common pronunciation needs; show limits when audio evaluation unavailable. |
| P1 | Writing | Short sentences and a single Bridge paragraph are not enough for independent composition. | Build from meaningful sentences to linked paragraphs and practical messages; require revision after genuine feedback, not copying models. |
| P2 | Interface | Fixed 15 activities can overload tiny A0 lessons. | One action per screen remains, but activities shown should adapt to learner's stage and assessed difficulty. Optional explanation on demand, no repeated pop-up API consent; authentication and usage limits still enforced. |
| P2 | Proof of usefulness | Tests so far validate JavaScript and simulated responses, not language learning gains. | Learner trials: unseen before/after item sets, delayed retention check, error recurrence, task-completion analytics and accessible phone tests. |

## Minimum acceptance contract for every revised lesson

Each lesson must have:

1. **Can-do outcome**: an observable action, not vague terms like *understand grammar*.
2. **Prerequisites**: skills needed; diagnosis that routes to the right earlier lesson.
3. **Real communicative setting**: who is speaking, to whom, for what purpose.
4. **Explanation and contrast**: meaning, use, common confusion, at least one counterexample.
5. **Guided practice**: answerable without guessing hidden criteria, clear relevant hints.
6. **Independent production**: a new situation the student has not copied from the model.
7. **Targeted Check**: specific evidence of accuracy, a single top error and clear revision request.
8. **Second attempt and transfer**: checking that the misconception was actually fixed.
9. **Review spacing**: check again on another day with new content.
10. **Accessibility and honesty**: audio availability, mobile layout, Google sync, AI cost controls, explicit distinction between automated assessment and verified skill.

**Never claim completion based only on the learner typing a few characters, opening the solution, recording one utterance, or navigating through activities.**

## Independent exit checkpoint (to build, not yet certified)

| Skill | Unseen performance task | Evidence needed |
|---|---|---|
| Listening | New natural multi-turn conversation + questions about main point, exact details and implied contrast at an appropriate level | Direct evidence from audio; report comprehension separately from TTS voice familiarity |
| Reading | New everyday text and informational paragraph | Meaning evidence, detail and paraphrase accuracy |
| Vocabulary and grammar | New communicative gap-fills and sentence correction | Correct use in new context, not repeated recall |
| Writing | New relevant short message and coherent short paragraph (length adjusted to ability) | Task fit, accurate meaning, readable language and successful revision |
| Speaking | New questions with unexpected follow-up | Intelligible relevant answers, self-correction and honest limits of automatic speech scoring |

The checkpoint should report the **demonstrated capability** and specific weak areas. An internal checkpoint **does not certify CEFR or an IELTS band**.

## Change order: quality before features

1. Publish an honest progress model; preserve all legacy and Firebase learning data. **Started:** updated `learning-journey.js` and `foundation.js`.
2. Build unseen entry diagnostic and basic A0 review lessons. Do not infer A2 from eight grammar multiple-choice questions.
3. Rebuild A0 content with real audio examples, stepwise tasks and varied production. Validate on one fully revised lesson **before** replicating patterns.
4. Extend A1/A2 listening, reading, vocabulary, grammar, speaking and writing breadth according to actual gaps.
5. Build the unseen exit checkpoint and remedial loops, then test it on real learner responses.
6. Preserve the useful existing 5-stage learning model, lesson-scoped vocabulary, Google syncing, voice cast and revision feedback; deprecate redundant buttons/screens rather than adding more.

## Definition of done

**Not:** deployment succeeded, all 15 pages rendered, task count reached 100%, AI returned a score, or two example sentences were produced.

**Done for a lesson:** the learner can correctly complete a **new** task, understand mistakes and perform a successful transfer with minimal help. **Done for Foundation:** multiple unseen skill checks provide credible evidence across Listening, Reading, Writing, Speaking and language use. Even then, do not automatically label CEFR A2 without appropriate validation.

**Current overall status:** audit baseline established; program redesign and proficiency validation **not completed**.
