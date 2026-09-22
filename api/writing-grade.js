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
}

function extractJSON(text){
  const s=String(text||"").trim();
  const a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a<0||b<=a)throw new Error("Model did not return JSON");
  return JSON.parse(s.slice(a,b+1));
}

function outputText(payload){
  if(typeof payload?.output_text==="string")return payload.output_text;
  const out=Array.isArray(payload?.output)?payload.output:[];
  for(const item of out){
    const content=Array.isArray(item?.content)?item.content:[];
    for(const part of content){
      if(part?.type==="output_text"&&typeof part.text==="string")return part.text;
      if(typeof part?.text==="string")return part.text;
    }
  }
  return "";
}

function band(v){
  const n=Number(v);
  if(!Number.isFinite(n))return null;
  return Math.max(0,Math.min(9,Math.round(n*2)/2));
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==="OPTIONS")return res.status(204).end();

  const key=process.env.OPENAI_API_KEY;
  const model=process.env.OPENAI_TEXT_MODEL||"gpt-5.6-luna";

  if(req.method==="GET"){
    return res.status(key?200:503).json({
      ok:!!key,
      keyConfigured:!!key,
      model
    });
  }
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!key)return res.status(503).json({error:"AI backend is not configured",code:"missing_api_key"});

  try{
    const body=req.body||{};
    const taskType=String(body.taskType||"task1").slice(0,30);
    const task=String(body.task||"").slice(0,5000);
    const dataContext=String(body.dataContext||"").slice(0,5000);
    const essay=String(body.essay||"").slice(0,18000);

    if(essay.trim().length<40)return res.status(400).json({error:"Essay is too short",code:"essay_too_short"});
    if(!task.trim())return res.status(400).json({error:"Missing task",code:"missing_task"});

    const criteria=taskType==="task2"
      ?"Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy"
      :"Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy";

    const prompt=[
      "You are an IELTS Academic Writing PRACTICE examiner and correction coach.",
      "This is not an official IELTS score.",
      "",
      "TASK TYPE: "+taskType,
      "QUESTION / TASK:",
      task,
      dataContext?"SOURCE DATA / CONTEXT:\n"+dataContext:"",
      "",
      "LEARNER RESPONSE:",
      essay,
      "",
      "Grade ONLY the learner response against the exact task and supplied data/context.",
      "Use these four IELTS-style practice criteria: "+criteria+".",
      "Use 0.5 band increments. Be strict, evidence-based, and do not reward vocabulary merely for being difficult.",
      "",
      "CORRECTION REQUIREMENTS:",
      "1. State the correct interpretation/requirements of the task.",
      "2. Identify what the learner did correctly and what is missing or inaccurate.",
      "3. For each important error, quote the learner's exact wording, provide a correction, name the error type, explain WHY it is wrong in Vietnamese, and give a reusable rule/fix in Vietnamese.",
      "4. Separate language errors from task/content errors.",
      "5. For Task 1, verify overview, main features, comparisons, and numerical/data accuracy against the supplied data. Do not invent data.",
      "6. For Task 2, verify that every part of the question is answered and that ideas are relevant/developed.",
      "7. corrected_essay must preserve the learner's ideas and repair errors without replacing the whole response.",
      "8. improved_essay may improve organisation, clarity, vocabulary and development, but keep the learner's core ideas and do not introduce unrelated claims.",
      "9. All coaching/explanations are Vietnamese. Essay text remains English.",
      "",
      "Return VALID JSON ONLY in exactly this shape:",
      JSON.stringify({
        overall_band:6,
        task_band:6,
        coherence_band:6,
        lexical_band:6,
        grammar_band:6,
        criterion_feedback:{
          task:{strength_vi:"",problem_vi:"",fix_vi:""},
          coherence:{strength_vi:"",problem_vi:"",fix_vi:""},
          lexical:{strength_vi:"",problem_vi:"",fix_vi:""},
          grammar:{strength_vi:"",problem_vi:"",fix_vi:""}
        },
        task_requirements:[
          {requirement:"",status:"met|partial|missing|incorrect",evidence_vi:"",fix_vi:""}
        ],
        errors:[
          {original:"exact learner wording",correction:"natural correction",type:"grammar|vocabulary|cohesion|task|data|spelling|punctuation",reason_vi:"",rule_vi:""}
        ],
        priority_fixes:["","",""],
        feedback_vi:"",
        corrected_essay:"",
        improved_essay:""
      }),
      "",
      "Do not add markdown. Do not include facts not supported by the task/data."
    ].filter(Boolean).join("\n");

    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+key,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model,
        input:prompt,
        max_output_tokens:6500
      })
    });

    const raw=await response.json().catch(()=>({}));
    if(!response.ok){
      const code=raw?.error?.code||raw?.error?.type||"openai_error";
      const message=raw?.error?.message||"Writing AI request failed";
      console.error("Writing OpenAI error",{status:response.status,code,message});
      return res.status(response.status>=400&&response.status<600?response.status:502).json({
        error:"Writing AI request failed",code,message,model,openaiStatus:response.status
      });
    }

    const result=extractJSON(outputText(raw));
    for(const k of ["overall_band","task_band","coherence_band","lexical_band","grammar_band"]){
      const v=band(result[k]);
      if(v!==null)result[k]=v;
    }
    result.source="openai-text";
    result.model=model;
    return res.status(200).json(result);
  }catch(err){
    console.error(err);
    return res.status(500).json({
      error:"Unable to grade writing",
      code:"server_error",
      message:String(err?.message||err)
    });
  }
}
