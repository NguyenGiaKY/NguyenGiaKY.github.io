
const ALLOWED_ORIGINS = new Set([
  "https://nguyengiaky.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

function cors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.has(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function extractJSON(text) {
  const s = String(text || "").trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("Model did not return JSON");
  return JSON.parse(s.slice(a, b + 1));
}

function clampBand(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(9, Math.round(n * 2) / 2));
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const key = process.env.OPENAI_API_KEY;
  const primaryModel = process.env.OPENAI_AUDIO_MODEL || "gpt-audio-mini";
  const fallbackModel = primaryModel === "gpt-audio" ? "gpt-audio-mini" : "gpt-audio";

  if (req.method === "GET") {
    if (!key) return res.status(503).json({
      ok: false,
      keyConfigured: false,
      model: primaryModel,
      error: "OPENAI_API_KEY is missing"
    });
    try {
      const check = await fetch("https://api.openai.com/v1/models/" + encodeURIComponent(primaryModel), {
        headers: { "Authorization": "Bearer " + key }
      });
      const raw = await check.json().catch(() => ({}));
      if (!check.ok) {
        return res.status(check.status).json({
          ok: false,
          keyConfigured: true,
          model: primaryModel,
          openaiStatus: check.status,
          openaiCode: raw?.error?.code || raw?.error?.type || "",
          openaiMessage: raw?.error?.message || "OpenAI model check failed"
        });
      }
      return res.status(200).json({
        ok: true,
        keyConfigured: true,
        model: primaryModel,
        modelAvailable: true
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        keyConfigured: true,
        model: primaryModel,
        error: "Unable to reach OpenAI",
        detail: String(err?.message || err)
      });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!key) return res.status(503).json({ error: "AI backend is not configured", code: "missing_api_key" });

  try {
    const body = req.body || {};
    const audioBase64 = String(body.audioBase64 || "");
    const format = String(body.format || "wav").toLowerCase();
    const question = String(body.question || "").slice(0, 1000);
    const transcriptHint = String(body.transcriptHint || "").slice(0, 8000);

    if (!audioBase64 || audioBase64.length < 1000) {
      return res.status(400).json({ error: "Missing audio" });
    }
    if (audioBase64.length > 14_000_000) {
      return res.status(413).json({ error: "Audio is too large" });
    }
    if (!["wav", "mp3"].includes(format)) {
      return res.status(400).json({ error: "Unsupported audio format" });
    }

    const prompt = [
      "You are an IELTS Speaking practice examiner, English coach, and pronunciation coach.",
      "",
      "PRIMARY EVIDENCE RULE:",
      "- LISTEN TO THE AUDIO DIRECTLY.",
      "- The browser transcript is only a hint and may contain recognition mistakes.",
      "- When the audio and transcript disagree, trust the audio.",
      "",
      "QUESTION:",
      question,
      "",
      transcriptHint ? "BROWSER TRANSCRIPT HINT (secondary evidence only): " + transcriptHint : "",
      "",
      "ASSESSMENT:",
      "Evaluate the learner's ACTUAL spoken answer using IELTS-style practice criteria:",
      "1. Fluency and Coherence",
      "2. Lexical Resource",
      "3. Grammatical Range and Accuracy",
      "4. Pronunciation",
      "Give practice bands in 0.5 increments. Do not inflate scores just because the answer is understandable.",
      "For short answers, judge whether the response is sufficiently developed for the question.",
      "",
      "TRANSCRIPTION:",
      "- Produce an accurate English transcript from the AUDIO.",
      "- Preserve meaningful grammar mistakes the learner actually made.",
      "- Do not translate the transcript into Vietnamese.",
      "",
      "CORRECTIONS AND ANNOTATION:",
      "- Identify exact mistakes from the learner's spoken answer.",
      "- For each correction: quote the exact wrong wording, give a natural English correction, explain the reason briefly in Vietnamese, classify it as grammar|vocabulary|fluency|word_choice|other, and mark severity as major|minor.",
      "- Also identify obvious filler/discourse words that weaken this specific answer (for example repeated um/uh/you know), but do not mark natural discourse markers as errors when they are used appropriately.",
      "- Do not invent errors that are not present.",
      "",
      "CORRECTED ANSWER:",
      "- corrected MUST be ENGLISH ONLY.",
      "- Keep the learner's original ideas and meaning.",
      "- Correct grammar, word choice, sentence structure, and unnatural phrasing.",
      "- Do not unnecessarily rewrite the whole answer.",
      "",
      "HIGHER-BAND ANSWER:",
      "- high_band MUST be ENGLISH ONLY.",
      "- Keep the learner's CORE IDEAS, activities, opinions, and topic.",
      "- Improve grammar, vocabulary, sentence structure, naturalness, and coherence.",
      "- You MAY add natural linking phrases.",
      "- You MAY slightly develop an EXISTING idea with a short reason, result, feeling, or explanation that is a natural extension of what the learner already said.",
      "- You MUST NOT replace the learner's core idea or invent an unrelated activity, place, person, event, hobby, preference, or personal experience.",
      "- The result should sound like natural IELTS Speaking English, not an academic essay.",
      "- Avoid unnecessarily complicated vocabulary.",
      "",
      "PRONUNCIATION:",
      "- Use the AUDIO, not spelling, to assess pronunciation.",
      "- Listen for intelligibility, individual vowel/consonant sounds, final consonants, consonant clusters, word stress, sentence stress, rhythm, linking, intonation, and pace.",
      "- Only report pronunciation problems actually supported by the audio.",
      "- Never invent pronunciation errors just to fill the list.",
      "- For each word-level issue include: exact word, IPA, what it sounded like if useful, specific issue in Vietnamese, concrete correction tip in Vietnamese, and a category.",
      "",
      "DELIVERY FEEDBACK:",
      "- Give specific Vietnamese feedback on intonation, stress, rhythm, linking, and pace.",
      "- Avoid generic advice such as 'practice more' or 'speak more naturally'.",
      "",
      "COACH FEEDBACK:",
      "- feedback_vi must be concise, specific, and written in Vietnamese.",
      "- coach_feedback.grammar_vi: explain the most important grammar pattern to fix, quoting the learner when useful.",
      "- coach_feedback.vocab_vi: explain one concrete lexical/collocation upgrade grounded in the learner's wording.",
      "- coach_feedback.development_vi: tell the learner exactly how to develop this answer for the question without inventing an unrelated story.",
      "- coach_feedback.pronunciation_vi: summarise the most important pronunciation/delivery priority actually supported by the audio.",
      "- strengths_vi: 1-3 short Vietnamese strengths supported by the answer.",
      "- Do not put corrected or high_band answers in Vietnamese.",
      "",
      "HIGH-BAND ANSWER + TRANSLATION + HIGHLIGHTS:",
      "- high_band_translation_vi must be a natural Vietnamese translation of high_band, preserving the same meaning and sentence flow.",
      "- high_band_highlights must identify the most useful phrases/words to learn from the high-band answer.",
      "- Each high_band_highlights item must contain phrase copied EXACTLY from high_band and translation_vi copied EXACTLY from high_band_translation_vi.",
      "- category must be vocabulary|grammar|development|linking.",
      "- Choose 3-7 genuinely useful focus phrases. Prefer collocations, strong sentence frames, linking language, and useful development phrases; do not highlight random function words.",
      "- The English phrase and Vietnamese translation phrase should correspond to each other so the UI can mark the same learning point in both languages.",
      "",
      "OUTPUT:",
      "- Return VALID JSON ONLY.",
      "- Do not use markdown.",
      "- Do not include any text before or after the JSON.",
      "- Use exactly this structure:",
      JSON.stringify({
        overall_band: 6.0,
        grammar_band: 6.0,
        vocab_band: 6.0,
        coherence_band: 6.0,
        pronunciation_band: 6.0,
        transcript: "Accurate English transcript based primarily on the audio.",
        corrected: "English-only minimally corrected version preserving the learner's meaning.",
        feedback_vi: "Specific Vietnamese feedback about this answer.",
        high_band: "English-only higher-band answer that naturally develops the learner's existing ideas without changing the core idea.",
        high_band_translation_vi: "Bản dịch tiếng Việt tự nhiên, sát nghĩa của toàn bộ high_band.",
        corrections: [
          {
            wrong: "exact wording from learner",
            better: "natural English correction",
            reason: "Giải thích ngắn gọn bằng tiếng Việt.",
            type: "grammar|vocabulary|fluency|word_choice|other",
            severity: "major|minor"
          }
        ],
        fillers: [
          {
            text: "exact filler wording from transcript",
            reason_vi: "Vì sao nên giảm hoặc bỏ trong câu này."
          }
        ],
        strengths_vi: [
          "Điểm mạnh cụ thể 1",
          "Điểm mạnh cụ thể 2"
        ],
        coach_feedback: {
          grammar_vi: "Lỗi grammar quan trọng nhất + cách sửa.",
          vocab_vi: "Nâng cấp từ/collocation cụ thể.",
          development_vi: "Cách phát triển câu trả lời sát câu hỏi.",
          pronunciation_vi: "Ưu tiên phát âm/delivery quan trọng nhất."
        },
        high_band_highlights: [
          {
            phrase: "exact substring from high_band",
            translation_vi: "cụm tương ứng, copied exactly from high_band_translation_vi",
            category: "vocabulary|grammar|development|linking"
          }
        ],
        pronunciation_feedback: [
          {
            word: "exact English word from the learner's audio",
            ipa: "/IPA/",
            heard_as: "what it sounded like, if useful",
            issue_vi: "Lỗi phát âm cụ thể bằng tiếng Việt.",
            tip_vi: "Cách sửa cụ thể bằng tiếng Việt.",
            category: "sound|word_stress|final_sound|linking|vowel|consonant|other"
          }
        ],
        delivery_feedback: {
          intonation_vi: "Nhận xét cụ thể về ngữ điệu.",
          stress_vi: "Nhận xét cụ thể về trọng âm.",
          rhythm_vi: "Nhận xét cụ thể về nhịp điệu.",
          linking_vi: "Nhận xét cụ thể về nối âm.",
          pace_vi: "Nhận xét cụ thể về tốc độ."
        }
      }),
      "",
      "FINAL RULES:",
      "- AUDIO is primary evidence; transcript is secondary.",
      "- corrected = ENGLISH ONLY.",
      "- high_band = ENGLISH ONLY.",
      "- high_band_translation_vi = VIETNAMESE ONLY.",
      "- Preserve the learner's core idea.",
      "- high_band may naturally DEVELOP an existing idea, but must not replace it.",
      "- Never invent pronunciation mistakes.",
      "- Never give pronunciation feedback based only on spelling.",
      "- fillers, corrections, and both English/Vietnamese fields in high_band_highlights must use exact text spans so the UI can annotate them reliably.",
      "- Prefer natural IELTS Speaking English."
    ].filter(Boolean).join("\n");

    async function callAudioModel(model) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.15,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "input_audio", input_audio: { data: audioBase64, format } }
            ]
          }]
        })
      });
      const payload = await resp.json().catch(() => ({}));
      return { resp, payload, model };
    }

    let attempt = await callAudioModel(primaryModel);
    if (!attempt.resp.ok) {
      const code = attempt.payload?.error?.code || attempt.payload?.error?.type || "";
      const msg = attempt.payload?.error?.message || "";
      const retryModel =
        attempt.resp.status === 404 ||
        /model|access|not found|does not exist/i.test(code + " " + msg);
      if (retryModel && fallbackModel !== primaryModel) {
        const second = await callAudioModel(fallbackModel);
        if (second.resp.ok) attempt = second;
      }
    }

    const openaiRes = attempt.resp;
    const raw = attempt.payload;

    if (!openaiRes.ok) {
      const safeCode = raw?.error?.code || raw?.error?.type || "openai_error";
      const safeMessage = raw?.error?.message || "Audio AI request failed";
      console.error("OpenAI error", {status: openaiRes.status, code: safeCode, message: safeMessage});
      return res.status(openaiRes.status >= 400 && openaiRes.status < 600 ? openaiRes.status : 502).json({
        error: "Audio AI request failed",
        code: safeCode,
        message: safeMessage,
        model: attempt.model,
        openaiStatus: openaiRes.status
      });
    }

    const content = raw?.choices?.[0]?.message?.content;
    const result = extractJSON(content);

    for (const k of ["overall_band","grammar_band","vocab_band","coherence_band","pronunciation_band"]) {
      const v = clampBand(result[k]);
      if (v !== null) result[k] = v;
    }

    result.source = "openai-audio";
    result.model = attempt.model;
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to grade audio", code: "server_error", message: String(err?.message || err) });
  }
}
