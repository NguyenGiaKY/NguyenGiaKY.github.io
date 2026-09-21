
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
      "You are an IELTS Speaking practice examiner and pronunciation coach.",
      "LISTEN TO THE AUDIO DIRECTLY. Do not grade only from the transcript hint.",
      "Question: " + question,
      transcriptHint ? "Browser transcript hint (may contain recognition errors): " + transcriptHint : "",
      "",
      "Assess the learner's actual spoken response using these practice criteria:",
      "- Fluency and Coherence",
      "- Lexical Resource",
      "- Grammatical Range and Accuracy",
      "- Pronunciation",
      "",
      "For pronunciation, listen for intelligibility, individual sounds, word stress, sentence stress, rhythm, linking, final consonants, and intonation.",
      "Do not invent pronunciation errors. Only report a word-level problem when the audio supports it.",
      "The higher-band answer MUST be English only and must keep the learner's existing ideas/facts. Do not add a new action, reason, example, place, person, preference, event, or detail.",
      "Vietnamese is allowed only in feedback_vi, correction reasons, pronunciation issue/tips, and delivery_feedback values.",
      "This is practice feedback, not an official IELTS score.",
      "",
      "Return VALID JSON ONLY with this shape:",
      JSON.stringify({
        overall_band: 6.0,
        grammar_band: 6.0,
        vocab_band: 6.0,
        coherence_band: 6.0,
        pronunciation_band: 6.0,
        transcript: "English transcript based on the audio",
        corrected: "English-only minimally corrected answer preserving the learner's meaning",
        feedback_vi: "Specific Vietnamese feedback about this answer",
        high_band: "English-only stronger version using exactly the same ideas/facts",
        corrections: [
          { wrong: "exact learner wording", better: "English correction", reason: "short Vietnamese reason" }
        ],
        pronunciation_feedback: [
          {
            word: "exact English word",
            ipa: "/IPA/",
            heard_as: "what it sounded like, if useful",
            issue_vi: "specific audible sound/stress issue in Vietnamese",
            tip_vi: "concrete correction in Vietnamese",
            category: "sound|word_stress|final_sound|linking|other"
          }
        ],
        delivery_feedback: {
          intonation_vi: "specific comment",
          stress_vi: "specific comment",
          rhythm_vi: "specific comment",
          linking_vi: "specific comment",
          pace_vi: "specific comment"
        }
      })
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
