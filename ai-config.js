(function(){
  "use strict";
  var saved="";
  try{saved=localStorage.getItem("speaking_ai_endpoint")||"";}catch(e){}
  var vercelDefault="https://nguyen-gia-ky-github-io-rvay.vercel.app/api/speaking-grade";
  var sameOrigin=(location.hostname.endsWith(".vercel.app")||location.hostname==="localhost"||location.hostname==="127.0.0.1")
    ? location.origin+"/api/speaking-grade"
    : "";
  window.SPEAKING_AI_ENDPOINT=saved||sameOrigin||vercelDefault;

  var writingSaved="";
  try{writingSaved=localStorage.getItem("writing_ai_endpoint")||"";}catch(e){}
  var writingVercel="https://nguyen-gia-ky-github-io-rvay.vercel.app/api/writing-grade";
  var writingSameOrigin=(location.hostname.endsWith(".vercel.app")||location.hostname==="localhost"||location.hostname==="127.0.0.1")
    ? location.origin+"/api/writing-grade"
    : "";
  window.WRITING_AI_ENDPOINT=writingSaved||writingSameOrigin||writingVercel;

  var dictionarySaved="";
  try{dictionarySaved=localStorage.getItem("dictionary_ai_endpoint")||"";}catch(e){}
  var dictionaryVercel="https://nguyen-gia-ky-github-io-rvay.vercel.app/api/dictionary-explain";
  var dictionarySameOrigin=(location.hostname.endsWith(".vercel.app")||location.hostname==="localhost"||location.hostname==="127.0.0.1")
    ? location.origin+"/api/dictionary-explain"
    : "";
  window.DICTIONARY_AI_ENDPOINT=dictionarySaved||dictionarySameOrigin||dictionaryVercel;
})();
