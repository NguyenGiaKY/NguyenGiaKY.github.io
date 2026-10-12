# Foundation AI grading — Writing + Speaking

**Implementation:** The existing 24 Foundation lessons, 12 Sentence Thinking lessons and 10 Word Relationship activities now include an additional corrective writing and microphone-speaking practice panel.

## Learner workflow

1. On the website, sign in through **Save across devices** with Google.
2. Open **Stage 1 → English Foundation**. In a standard lesson, use **3. Vận dụng**; in Sentence Thinking or Word Relationships, open an individual exercise.
3. **Writing:** Type the English answer and select **Check my writing with OpenAI**. In the advanced modules, type in the dedicated answer box. Read each quoted mistake, correction, Vietnamese rule and short follow-up exercise.
4. **Speaking:** Read the spoken prompt, select **Record my answer**, allow the microphone, then **Stop recording**. Review the clip and explicitly select **Send recording for OpenAI feedback**. The recorder stops after 45 seconds.
5. Corrections and text transcript are stored under `gk_foundation_feedback_v1`, included in the existing Firebase cloud-progress sync. Raw microphone audio is **not** saved to Firestore/localStorage.

The 0–5 rating is an **informal Foundation practice indicator**, **not** a formal CEFR score or an IELTS band. AI transcription, pronunciation observations and corrections may be imperfect.

## Server-side setup and deployment

- GitHub Pages serves the user interface only. The OpenAI endpoint is `/api/foundation-grade` in the existing **Vercel** backend, and is called by the frontend at `https://nguyen-gia-ky-github-io-rvay.vercel.app/api/foundation-grade`.
- The route uses an **authenticated Firebase ID token** (project `ielts-study-sync`). The Vercel function verifies the signature and Firebase claims against Google's public keys; the OpenAI API key stays on Vercel.
- **Vercel environment variable required:** `OPENAI_API_KEY` (server-side only). Optional: `OPENAI_FOUNDATION_MODEL` (defaults to `gpt-4.1-mini`) and `OPENAI_AUDIO_MODEL` (defaults to `gpt-audio-mini`).
- Confirm that Vercel is connected to the repository and deployed the new `api/foundation-grade.js` route. GET the endpoint to check whether it reports `{"ok":true,"authRequired":true}`; GET alone does **not** test OpenAI grading.
- A real authenticated writing request and a real microphone/audio request must both succeed before marking deployment fully verified.
- Successful Firebase/GitHub Pages setup **does not establish** that Vercel's OpenAI API key, model access or billing is configured.

## Privacy and billing

**OpenAI API charges are separate from ChatGPT Plus/Pro and Firebase Spark.** A request is sent only after clicking the relevant button and confirming the cost/data-use notice. Each retry can create another charge. Check Vercel deployment logs and the OpenAI API billing dashboard for failures, usage limits and errors. Consider adding an owner-only allowlist or a persistent server-side quota if the public site is opened to other learners; the present in-memory per-UID request throttle is only a basic safeguard and not a global billing limit.

The app does not store raw voice recordings. It does store typed answers, generated corrections and transcriptions in the existing Firebase-synced learning data. As with all AI feedback, do not enter sensitive personal information.

## Important limitations

- Without `OPENAI_API_KEY` on the Vercel backend, the UI remains available but AI grading returns a configuration error.
- The speaking function uses real WAV audio for OpenAI audio assessment. Audio assessment may fail if the configured account lacks access to the audio model or the browser microphone is blocked.
- Most browsers require HTTPS and microphone permission for recording. Start with a 10–20-second practice clip.
- This feature was unit/simulation-tested in code and the GitHub repository was updated, but **the live Vercel route and API response still require real deployment checks**.
