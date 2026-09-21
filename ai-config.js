(function(){
  "use strict";
  var saved="";
  try{saved=localStorage.getItem("speaking_ai_endpoint")||"";}catch(e){}
  var vercelDefault="https://nguyen-gia-ky-github-io-rvay.vercel.app/api/speaking-grade";
  var sameOrigin=(location.hostname.endsWith(".vercel.app")||location.hostname==="localhost"||location.hostname==="127.0.0.1")
    ? location.origin+"/api/speaking-grade"
    : "";
  window.SPEAKING_AI_ENDPOINT=saved||sameOrigin||vercelDefault;
})();
