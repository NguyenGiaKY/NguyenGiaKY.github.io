
(function(){
  var STATES = {};
  function esc(x){
    return String(x == null ? '' : x).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function getTextContent(resp){
    var x = resp && resp.message ? resp.message.content : (resp && resp.content ? resp.content : resp);
    if(typeof x === 'string') return x;
    if(Array.isArray(x)) return x.map(function(v){ return typeof v === 'string' ? v : ((v && v.text) || ''); }).join('\n').trim();
    return String(x || '');
  }
  async function callAI(messages){
    if(!window.puter || !puter.ai || !puter.ai.chat) throw new Error('AI library chưa tải xong. Refresh trang rồi thử lại.');
    try{
      return await puter.ai.chat(messages,{
        model:'gpt-5.6-luna',
        normalize:true,
        reasoning_effort:'low',
        verbosity:'medium',
        max_tokens:1800
      });
    }catch(e){
      return await puter.ai.chat(messages,{normalize:true,max_tokens:1800});
    }
  }
  function stripFence(t){
    return String(t || '').trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'').trim();
  }
  function getState(container){
    var wordEl = container.querySelector('.dictWord');
    if(!wordEl) return null;
    var word = wordEl.textContent.trim();
    if(!word) return null;
    var sentenceEl = container.querySelector('.contextSentence');
    var sentence = sentenceEl ? sentenceEl.textContent.trim() : '';
    var base = word.toLowerCase();
    var meaningEl = Array.prototype.find.call(container.querySelectorAll('.dictMeaning'),function(el){ return /Dạng gốc/i.test(el.textContent); });
    if(meaningEl){
      var m = meaningEl.textContent.match(/Dạng gốc:\s*(.+)$/i);
      if(m) base = m[1].trim().toLowerCase();
    }
    var clone = container.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('.aiTutor'),function(n){n.remove();});
    var lexical = (clone.innerText || clone.textContent || '').replace(/\s+/g,' ').trim().slice(0,3500);
    return {word:word,base:base,sentence:sentence,lexical:lexical};
  }
  function systemPrompt(){
    return [
      'Bạn là AI English tutor cho học sinh đang học IELTS.',
      'Giải thích bằng tiếng Việt rõ ràng; ví dụ bằng tiếng Anh.',
      'Phân tích đúng ngữ cảnh và không tự bịa word family.',
      'Nếu headword không có noun, verb, adjective hoặc adverb phổ biến thì nói rõ dạng đó không phổ biến/không có.',
      'Phân biệt headword, inflection và derivation.',
      'Khi xác định part of speech trong câu, giải thích bằng vị trí và cấu trúc ngữ pháp.',
      'Ưu tiên cách dùng tự nhiên trong IELTS và English học thuật.'
    ].join(' ');
  }
  function analysisPrompt(st){
    return [
      'Phân tích từ sau cho người học IELTS.',
      'WORD: '+st.word,
      'BASE/HEADWORD: '+st.base,
      'SENTENCE/CONTEXT: '+(st.sentence || '[không có câu; phân tích tổng quát]'),
      'LEXICAL DATA FROM WEBSITE: '+(st.lexical || '[không có dữ liệu]'),
      '',
      'Trả về JSON THUẦN, không markdown, theo schema:',
      '{"simple_meaning":"...","meaning_in_context":"...","general_meaning":"...","easy_explanation":"...","part_of_speech_in_context":"...","why_this_pos":"...","grammar_role":"...","grammar_pattern":"...","naturalness":"...","word_family":[{"form":"...","pos":"noun|verb|adjective|adverb|other","common":true,"simple_meaning":"...","meaning":"...","use":"...","position":"...","pattern":"...","example":"..."}],"missing_core_forms":["adjective"],"collocations":["..."],"common_mistakes":["..."],"ielts_examples":["...","..."]}',
      'simple_meaning phải là nghĩa cực dễ hiểu như đang giải thích cho người học A2-B1, dùng từ Việt đơn giản trước rồi mới giải thích chính xác hơn. Ví dụ employer = người hoặc công ty thuê người làm và trả lương; employee = người làm việc cho công ty/chủ và nhận lương. Không dùng định nghĩa dịch máy khó hiểu nếu có cách nói đơn giản hơn. Word family phải kiểm tra noun/verb/adjective/adverb nếu thực sự tồn tại và phổ biến. Có thể thêm other POS nếu hữu ích. Không tạo dạng không có thật.'
    ].join('\n');
  }
  function listHTML(a){
    if(!Array.isArray(a) || !a.length) return '<div class="muted">—</div>';
    return '<ul class="aiList">'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
  }
  function familyHTML(a){
    if(!Array.isArray(a) || !a.length) return '<div class="muted">Không có dữ liệu word family.</div>';
    return '<div class="aiFamily">'+a.map(function(x){
      return '<div class="aiFamilyItem">'+
        '<div class="aiFamilyTop"><b>'+esc(x.form || '')+'</b><span class="posBadge">'+esc(x.pos || '')+'</span>'+(x.common === false ? '<span class="posBadge">không phổ biến</span>' : '')+'</div>'+
        (x.simple_meaning ? '<div><b>Nghĩa dễ hiểu:</b> '+esc(x.simple_meaning)+'</div>' : '')+
        (x.meaning ? '<div><b>Nghĩa chính xác:</b> '+esc(x.meaning)+'</div>' : '')+
        (x.use ? '<div><b>Công dụng:</b> '+esc(x.use)+'</div>' : '')+
        (x.position ? '<div><b>Vị trí:</b> '+esc(x.position)+'</div>' : '')+
        (x.pattern ? '<div><b>Pattern:</b> <code>'+esc(x.pattern)+'</code></div>' : '')+
        (x.example ? '<div><b>Ví dụ:</b> '+esc(x.example)+'</div>' : '')+
      '</div>';
    }).join('')+'</div>';
  }
  function renderJSON(id,obj){
    var out=document.getElementById('ai-out-'+id); if(!out) return;
    out.innerHTML =
      '<div class="aiGrid">'+
        '<b>💡 Nghĩa dễ hiểu</b><span><b>'+esc(obj.simple_meaning || obj.meaning_in_context || obj.general_meaning || '—')+'</b></span>'+ 
        '<b>Nghĩa chính xác hơn</b><span>'+esc(obj.meaning_in_context || obj.general_meaning || '—')+'</span>'+ 
        '<b>Giải thích đơn giản</b><span>'+esc(obj.easy_explanation || '—')+'</span>'+
        '<b>Loại từ trong câu</b><span>'+esc(obj.part_of_speech_in_context || 'Không có câu để xác định')+'</span>'+
        '<b>Vì sao?</b><span>'+esc(obj.why_this_pos || '—')+'</span>'+
        '<b>Vai trò ngữ pháp</b><span>'+esc(obj.grammar_role || '—')+'</span>'+
        '<b>Cấu trúc</b><span><code>'+esc(obj.grammar_pattern || '—')+'</code></span>'+
        '<b>Câu có tự nhiên?</b><span>'+esc(obj.naturalness || '—')+'</span>'+
      '</div>'+
      '<div class="aiSection"><h4>🧩 Word family & công dụng</h4>'+familyHTML(obj.word_family)+'</div>'+
      '<div class="aiSection"><h4>🔗 Collocations hữu ích</h4>'+listHTML(obj.collocations)+'</div>'+
      '<div class="aiSection"><h4>⚠️ Lỗi thường gặp</h4>'+listHTML(obj.common_mistakes)+'</div>'+
      '<div class="aiSection"><h4>🎯 IELTS examples</h4>'+listHTML(obj.ielts_examples)+'</div>'+
      (Array.isArray(obj.missing_core_forms) && obj.missing_core_forms.length ? '<div class="aiSection"><h4>Không có dạng phổ biến</h4><div class="en">'+esc(obj.missing_core_forms.join(', '))+'</div></div>' : '');
  }
  function renderRaw(id,text){
    var out=document.getElementById('ai-out-'+id); if(out) out.innerHTML='<div class="aiRaw">'+esc(text)+'</div>';
  }
  
  async function ensureAIAuth(){
    if(!window.puter || !puter.auth) throw new Error('Puter AI chưa tải xong. Hãy refresh trang.');
    if(puter.auth.isSignedIn && puter.auth.isSignedIn()) return true;
    try{
      await puter.auth.signIn({attempt_temp_user_creation:true});
      return true;
    }catch(e){
      var code=(e && (e.error || e.code)) || '';
      var msg=(e && (e.msg || e.message)) || String(e || '');
      if(code==='popup_blocked' || /popup/i.test(msg)) throw new Error('Chrome đã chặn cửa sổ đăng nhập AI. Hãy cho phép pop-up cho nguyengiaky.github.io rồi bấm lại.');
      if(code==='auth_window_closed') throw new Error('Bạn đã đóng cửa sổ đăng nhập AI trước khi hoàn tất.');
      throw new Error('Chưa đăng nhập được dịch vụ AI: '+msg);
    }
  }
  async function startAI(id){
    var st=STATES[id],btn=document.getElementById('ai-start-'+id),status=document.getElementById('ai-status-'+id);
    if(!st || !btn) return;
    btn.disabled=true; btn.textContent='✨ Đang kết nối AI…';
    if(status) status.textContent='Nếu đây là lần đầu, Chrome có thể mở cửa sổ đăng nhập/cho phép AI.';
    try{
      await ensureAIAuth();
      btn.textContent='✨ AI đang phân tích…';
      if(status) status.textContent='Đã kết nối. AI đang đọc từ + câu hiện tại + dữ liệu từ điển…';
      var messages=[{role:'system',content:systemPrompt()},{role:'user',content:analysisPrompt(st)}];
      var resp=await callAI(messages),text=getTextContent(resp);
      st.messages=messages.concat([{role:'assistant',content:text}]);
      try{ renderJSON(id,JSON.parse(stripFence(text))); }catch(e){ renderRaw(id,text); }
      var follow=document.getElementById('ai-follow-'+id); if(follow) follow.style.display='block';
      if(status) status.textContent='✓ AI Tutor đã hoạt động.';
    }catch(e){
      var msg=(e && e.message ? e.message : String(e));
      renderRaw(id,'AI chưa chạy được: '+msg);
      if(status) status.textContent=msg;
    }finally{
      btn.disabled=false; btn.textContent='✨ Phân tích bằng AI';
    }
  }
  async function followAI(id,q){
    var st=STATES[id],input=document.getElementById('ai-input-'+id),btn=document.getElementById('ai-ask-'+id),out=document.getElementById('ai-follow-out-'+id);
    q=(q || (input && input.value) || '').trim();
    if(!st || !q) return;
    if(btn){btn.disabled=true;btn.textContent='...';}
    if(out) out.innerHTML='<div class="muted">AI đang trả lời…</div>';
    try{
      await ensureAIAuth();
      var messages=st.messages && st.messages.length ? st.messages.slice(-6) : [{role:'system',content:systemPrompt()},{role:'user',content:analysisPrompt(st)}];
      messages=messages.concat([{role:'user',content:'Câu hỏi tiếp theo về từ "'+st.word+'": '+q+'\nTrả lời bằng tiếng Việt, ngắn gọn, có ví dụ tiếng Anh nếu hữu ích.'}]);
      var resp=await callAI(messages),text=getTextContent(resp);
      if(out) out.innerHTML='<div class="aiRaw">'+esc(text)+'</div>';
      st.messages=messages.concat([{role:'assistant',content:text}]).slice(-8);
      if(input) input.value='';
    }catch(e){
      if(out) out.innerHTML='<div class="aiRaw">Không gọi được AI: '+esc(e && e.message ? e.message : e)+'</div>';
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Hỏi AI';}
    }
  }
  function panelHTML(id){
    return '<div class="aiTutor">'+
      '<div class="aiTutorHead"><div><b>✨ AI English Tutor</b><br><small>Phân tích sâu dựa trên từ + câu hiện tại</small></div></div>'+
      '<div class="aiTutorBody">'+
        '<button class="aiStart" id="ai-start-'+id+'">✨ Phân tích sâu bằng AI</button>'+
        '<div class="aiStatus" id="ai-status-'+id+'">AI sẽ kiểm tra nghĩa trong câu, loại từ, word family, collocations và lỗi thường gặp.</div>'+
        '<div id="ai-out-'+id+'"></div>'+
        '<div id="ai-follow-'+id+'" style="display:none">'+
          '<div class="aiQuick">'+
            '<button data-ai-id="'+id+'" data-ai-q="Tại sao trong câu này từ này lại là loại từ đó?">Tại sao là loại từ này?</button>'+
            '<button data-ai-id="'+id+'" data-ai-q="Cho tôi 3 câu IELTS tự nhiên dùng từ này.">3 câu IELTS</button>'+
            '<button data-ai-id="'+id+'" data-ai-q="So sánh từ này với từ gần nghĩa dễ nhầm nhất.">So sánh từ dễ nhầm</button>'+
            '<button data-ai-id="'+id+'" data-ai-q="Kiểm tra noun, verb, adjective, adverb của word family này và nói dạng nào không phổ biến.">Kiểm tra word family</button>'+
          '</div>'+
          '<div class="aiFollow"><input id="ai-input-'+id+'" placeholder="Hỏi AI thêm về từ này..."><button id="ai-ask-'+id+'">Hỏi AI</button></div>'+
          '<div id="ai-follow-out-'+id+'" style="margin-top:8px"></div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }
  function enhance(container){
    if(!container) return;
    var st=getState(container); if(!st) return;
    var key=st.word+'|'+st.sentence;
    if(container.dataset.aiEnhancedKey===key && container.querySelector('.aiTutor')) return;
    var old=container.querySelector('.aiTutor'); if(old) old.remove();
    var id=container.id || ('dict-'+Math.random().toString(36).slice(2));
    container.dataset.aiEnhancedKey=key;
    STATES[id]=st;
    container.insertAdjacentHTML('beforeend',panelHTML(id));
    var start=document.getElementById('ai-start-'+id); if(start) start.onclick=function(){startAI(id);};
    var ask=document.getElementById('ai-ask-'+id); if(ask) ask.onclick=function(){followAI(id);};
    var input=document.getElementById('ai-input-'+id); if(input) input.onkeydown=function(e){if(e.key==='Enter')followAI(id);};
    Array.prototype.forEach.call(container.querySelectorAll('[data-ai-id="'+id+'"]'),function(b){
      b.onclick=function(){followAI(id,b.getAttribute('data-ai-q'));};
    });
  }
  function watch(id){
    var el=document.getElementById(id); if(!el) return;
    var scheduled=false;
    var obs=new MutationObserver(function(){
      if(scheduled) return;
      scheduled=true;
      setTimeout(function(){scheduled=false;enhance(el);},60);
    });
    obs.observe(el,{childList:true,subtree:true});
    enhance(el);
  }
  function init(){
    watch('dictResult');
    watch('dictPageResult');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
