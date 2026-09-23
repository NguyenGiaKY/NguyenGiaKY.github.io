const ALLOWED_ORIGINS = new Set([
  "https://nguyengiaky.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

function cors(req,res){
  const origin=req.headers.origin||"";
  if(ALLOWED_ORIGINS.has(origin))res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
}

function outputText(payload){
  if(typeof payload?.output_text==="string")return payload.output_text;
  for(const item of Array.isArray(payload?.output)?payload.output:[]){
    for(const part of Array.isArray(item?.content)?item.content:[]){
      if(typeof part?.text==="string")return part.text;
    }
  }
  return "";
}

function extractJSON(text){
  const s=String(text||"").trim();
  const a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a<0||b<=a)throw new Error("Model did not return valid JSON");
  return JSON.parse(s.slice(a,b+1));
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==="OPTIONS")return res.status(204).end();

  const key=process.env.OPENAI_API_KEY;
  const model=process.env.OPENAI_TEXT_MODEL||"gpt-5.6-luna";

  if(req.method==="GET"){
    return res.status(key?200:503).json({ok:!!key,keyConfigured:!!key,model});
  }
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!key)return res.status(503).json({error:"Dictionary AI is not configured",code:"missing_api_key"});

  try{
    const word=String(req.body?.word||"").trim().slice(0,80);
    const base=String(req.body?.base||word).trim().slice(0,80);
    const sentence=String(req.body?.sentence||"").trim().slice(0,1200);
    const lexical=String(req.body?.lexical||"").trim().slice(0,2500);
    if(!word||!/[A-Za-z]/.test(word))return res.status(400).json({error:"Invalid word",code:"invalid_word"});

    const savedVocab=req.body?.mode==="saved-vocab";
    const prompt=savedVocab?[
      "You are a concise English-Vietnamese vocabulary coach for a Vietnamese IELTS learner.",
      "WORD: "+word+". BASE: "+base+".",
      sentence?"SENTENCE WHERE THE LEARNER FOUND IT: "+sentence.slice(0,450):"No sentence supplied.",
      lexical?"LEARNER'S SAVED MEANING: "+lexical.slice(0,250):"",
      "Explain the ordinary lexical word, not a song, title, artist or brand. Follow the sentence's sense and part of speech. Keep each field short.",
      "Give 1-3 real paraphrases with the same meaning and grammatical role, 2-3 common collocations, and 2-4 genuine related word forms with part of speech. Omit uncertain forms. The family exercise answer must be one of the word_family words, and its English sentence must have exactly one blank.",
      "Translate the source sentence if provided. Give one fresh short English usage example and one precise Vietnamese explanation of why this sense fits the source. Add one short, concrete Vietnamese speaking task and one mini writing task that require using this word naturally. Do not fabricate context. Vietnamese for teaching notes; English for examples and words. JSON only.",
      JSON.stringify({meaning_vi:"",sentence_translation_vi:"",context_reason_vi:"",usage_example_en:"",memory_tip_vi:"",speaking_task_vi:"",writing_task_vi:"",paraphrases:[{phrase:"",meaning_vi:"",example:""}],collocations:[{phrase:"",meaning_vi:""}],word_family:[{word:"",part_of_speech:"",meaning_vi:""}],family_exercise:{sentence_with_blank:"",answer:"",hint_vi:"",explanation_vi:""}})
    ].filter(Boolean).join("\n"):[
      "You are a precise English-Vietnamese IELTS dictionary tutor.",
      "Explain the target word for a Vietnamese learner. Context accuracy is the highest priority.",
      "",
      "TARGET SURFACE FORM: "+word,
      "LIKELY BASE FORM: "+base,
      sentence?"ORIGINAL SENTENCE: "+sentence:"NO SENTENCE CONTEXT WAS PROVIDED.",
      lexical?"LEXICAL SOURCE HINTS:\n"+lexical:"",
      "",
      "Rules:",
      "- Determine the exact part of speech and meaning used in the original sentence when context exists.",
      "- Never return a useless translation such as 'begin = begin'. Vietnamese meanings must actually explain the English.",
      "- If the word is polysemous, lead with the contextual sense, not the most common unrelated sense.",
      "- This is an English vocabulary tutor. For an ordinary lowercase word such as habits, explain its lexical meaning (habits = thói quen), never a song, artist, album, film or other title. Treat irrelevant encyclopedic hints as noise.",
      "- If context is absent, give the most common everyday or academic English sense and a short example sentence that teaches usage.",
      "- Translate the original sentence naturally into Vietnamese when provided.",
      "- Explain any important grammar role in the sentence briefly.",
      "- Give only common, natural usage patterns and collocations. Do not invent rare combinations.",
      "- For saved-word practice, give 1–3 precise paraphrases with the SAME contextual meaning and grammatical role. Do not list a loose association or simply repeat the target word.",
      "- If no reliable equivalent exists, leave paraphrases empty. Collocations should contain the exact base word and a common word partner.",
      "- Include useful inflections/irregular forms (e.g. begin–began–begun) when relevant.",
      "- Word family items must be genuine common words. Omit uncertain items.",
      "- IELTS note should focus on Listening/Reading/Writing/Speaking usefulness, spelling traps, register, or common confusion when relevant.",
      "- Keep explanations concise and learner-friendly. Vietnamese for explanations; English for English examples.",
      "- Do not use markdown. Return JSON only.",
      "",
      "Return exactly this JSON shape:",
      JSON.stringify({
        base_form:"",
        part_of_speech:"",
        meaning_vi:"",
        meaning_en_simple:"",
        context_reason_vi:"",
        sentence_translation_vi:"",
        grammar_role_vi:"",
        forms:[{form:"",label_vi:""}],
        patterns:[{pattern:"",meaning_vi:"",example:""}],
        paraphrases:[{phrase:"",meaning_vi:"",example:""}],
        collocations:[{phrase:"",meaning_vi:""}],
        word_family:[{word:"",part_of_speech:"",meaning_vi:""}],
        common_confusions:[{item:"",difference_vi:""}],
        other_meanings:[{part_of_speech:"",meaning_vi:""}],
        ielts_note_vi:"",
        memory_tip_vi:""
      })
    ].filter(Boolean).join("\n");

    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+key,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({model,input:prompt,max_output_tokens:savedVocab?1500:2600})
    });
    const raw=await response.json().catch(()=>({}));
    if(!response.ok){
      const message=raw?.error?.message||"Dictionary AI request failed";
      return res.status(response.status>=400&&response.status<600?response.status:502).json({
        error:"Dictionary AI request failed",
        code:raw?.error?.code||raw?.error?.type||"openai_error",
        message,
        model
      });
    }

    const data=extractJSON(outputText(raw));
    data.source="openai-context";
    data.model=model;
    return res.status(200).json(data);
  }catch(err){
    console.error(err);
    return res.status(500).json({
      error:"Unable to explain dictionary word",
      code:"server_error",
      message:String(err?.message||err)
    });
  }
}
