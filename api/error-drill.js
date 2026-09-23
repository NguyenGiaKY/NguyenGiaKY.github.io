const ALLOWED_ORIGINS=new Set([
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
  const s=String(text||"").trim(),a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a<0||b<=a)throw new Error("Model did not return valid JSON");
  return JSON.parse(s.slice(a,b+1));
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==="OPTIONS")return res.status(204).end();
  const key=process.env.OPENAI_API_KEY;
  const model=process.env.OPENAI_TEXT_MODEL||"gpt-5.6-luna";
  if(req.method==="GET")return res.status(key?200:503).json({ok:!!key,keyConfigured:!!key,model});
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!key)return res.status(503).json({error:"Error Drill AI is not configured",code:"missing_api_key"});

  try{
    const x=req.body||{};
    const skill=String(x.skill||"other").slice(0,30);
    const task=String(x.task||"").slice(0,500);
    const question=String(x.question||"").slice(0,1200);
    const userAnswer=String(x.userAnswer||"").slice(0,800);
    const correctAnswer=String(x.correctAnswer||"").slice(0,800);
    const why=String(x.why||"").slice(0,1400);
    const rule=String(x.rule||"").slice(0,1400);
    const evidence=String(x.evidence||"").slice(0,1800);
    const errorType=String(x.errorType||"").slice(0,100);
    if(!question&&!userAnswer&&!correctAnswer)return res.status(400).json({error:"Not enough error context",code:"invalid_error"});

    const prompt=[
      "You are building a targeted IELTS Error Repair Pack for a Vietnamese learner.",
      "The goal is NOT reflection or generic advice. The goal is concrete practice that directly fixes the exact mistake.",
      "",
      "SKILL: "+skill,
      "ERROR TYPE: "+errorType,
      "TASK: "+task,
      "QUESTION: "+question,
      "LEARNER ANSWER: "+userAnswer,
      "CORRECT ANSWER / CORRECTION: "+correctAnswer,
      "WHY IT WAS WRONG: "+why,
      "RULE / FIX: "+rule,
      "EVIDENCE: "+evidence,
      "",
      "Create a short repair pack with exactly 3 drills plus 1 final retry.",
      "Rules:",
      "- Drill 1 must isolate the exact weak point (grammar form, spelling, paraphrase, collocation, pronunciation target, etc.).",
      "- Drill 2 must use a NEW but closely related context so the learner cannot pass by memorising the original answer.",
      "- Drill 3 must look like the relevant IELTS skill: Reading evidence/paraphrase, Listening dictation/spelling, Writing editing/collocation, Speaking natural phrasing/pronunciation, Grammar form choice.",
      "- Final retry must return to the ORIGINAL question/task and test the same skill again without showing the answer.",
      "- Do NOT ask the learner to explain the rule in their own words.",
      "- Do NOT ask the learner to invent their own example.",
      "- Every drill must have a checkable answer.",
      "- For mcq, provide 3 options and answer must exactly equal one option.",
      "- For fill, answer should be short and unambiguous.",
      "- For listen_type, the prompt should tell the learner to listen and type; speak_text contains the exact phrase to play with browser speech synthesis; answer equals speak_text.",
      "- For pronunciation, use listen_type with a short target word or phrase rather than subjective self-rating.",
      "- For Reading, use only the supplied evidence; never invent facts that change the original source.",
      "- Keep Vietnamese explanations concise.",
      "- memory_tip_vi must be a practical 5-10 second cue, not a motivational sentence.",
      "- pattern_vi should state the reusable pattern behind this error in one sentence.",
      "- Return JSON only, no markdown.",
      "",
      "JSON shape:",
      JSON.stringify({
        diagnosis_vi:"",
        pattern_vi:"",
        memory_tip_vi:"",
        drills:[
          {type:"mcq|fill|listen_type",title_vi:"",prompt:"",options:["","",""],answer:"",speak_text:"",explanation_vi:""},
          {type:"mcq|fill|listen_type",title_vi:"",prompt:"",options:["","",""],answer:"",speak_text:"",explanation_vi:""},
          {type:"mcq|fill|listen_type",title_vi:"",prompt:"",options:["","",""],answer:"",speak_text:"",explanation_vi:""}
        ],
        final_retry:{type:"mcq|fill",prompt:"",options:["","",""],answer:"",explanation_vi:""}
      })
    ].join("\n");

    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},
      body:JSON.stringify({model,input:prompt,max_output_tokens:2600})
    });
    const raw=await response.json().catch(()=>({}));
    if(!response.ok){
      return res.status(response.status>=400&&response.status<600?response.status:502).json({
        error:"Error Drill AI request failed",
        code:raw?.error?.code||raw?.error?.type||"openai_error",
        message:raw?.error?.message||"Error Drill AI request failed",
        model
      });
    }
    const data=extractJSON(outputText(raw));
    data.source="openai-error-drill";
    data.model=model;
    return res.status(200).json(data);
  }catch(err){
    console.error(err);
    return res.status(500).json({error:"Unable to build repair pack",code:"server_error",message:String(err?.message||err)});
  }
}
