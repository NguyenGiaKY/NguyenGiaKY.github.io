/* Three-stage Learning Journey with transparent, evidence-driven progress. */
(function(){
"use strict";
const root=document.getElementById("journeyRoot");if(!root)return;
function read(key){try{return JSON.parse(localStorage.getItem(key)||"{}")||{}}catch(e){return{}}}
function pretty(n){if(n===null||!Number.isFinite(n))return"—";if(n===0)return"0%";return n<1?n.toFixed(2)+"%":Number.isInteger(n)?n+"%":n.toFixed(1)+"%"}
function clamp(n){return Math.max(0,Math.min(100,n||0))}
function foundation(){
 const a=read("gk_foundation_v1").records||{},b=read("gk_foundation_sentence_v1").records||{},c=read("gk_foundation_relations_v1").records||{};
 const aDone=Object.values(a).filter(x=>(x.attempts||[]).length>0).length;
 const bDone=Object.values(b).filter(x=>(x.attempts||[]).length>0&&(x.builds||[]).length>0).length;
 const cDone=Object.values(c).filter(x=>(x.checks||[]).length>0).length;
 const done=Math.min(24,aDone)+Math.min(12,bDone)+Math.min(10,cDone);
 return{done,total:46,pct:done/46*100,parts:[{name:"Bài Foundation",done:aDone,total:24},{name:"Giải mã câu",done:bDone,total:12},{name:"Quan hệ 4 loại từ",done:cDone,total:10}]};
}
function core(){
 const s=window.GKCoreSkills?.snapshot?.();
 return s?{done:s.answered,total:s.questions,pct:s.answered/s.questions*100,mastered:s.mastered,lessons:s.total}: {done:0,total:60,pct:0,mastered:0,lessons:30};
}
function ielts(){
 const s=window.GKIELTSProgress?.();
 return s?{done:s.known,total:s.total,answered:s.answered,pct:s.coverage,mastered:s.mastered}: {done:0,total:81,answered:0,pct:0,mastered:0};
}
function nav(view){const target=document.querySelector('.nav[data-view="'+view+'"]');if(target)target.click();}
function block(num,title,desc,progress,explain,action,button,parts){
let h='<section class="lj-stage"><div class="lj-stage-heading"><div class="lj-stage-id">'+num+'</div><div class="lj-stage-name"><span>STAGE '+num+'</span><h3>'+title+'</h3><p>'+desc+'</p></div><strong class="lj-rate">'+pretty(progress)+'</strong></div>'+
'<div class="lj-bar"><i style="width:'+clamp(progress)+'%"></i></div><p class="lj-caption">'+explain+'</p>';
if(parts){h+='<div class="lj-parts">';parts.forEach(p=>h+='<div><span>'+p.name+'</span><b>'+p.done+'/'+p.total+'</b></div>');h+='</div>';}
h+='<button type="button" data-lj-open="'+action+'" class="lj-action">'+button+' →</button></section>';return h;
}
function render(){
const f=foundation(),c=core(),i=ielts();
root.innerHTML='<div class="lj-wrap"><div class="lj-hero"><div><span class="lj-kicker">PERSONAL LEARNING JOURNEY</span><h2>Hành trình học tiếng Anh → IELTS</h2>'+
'<p>Ba giai đoạn bổ sung cho nhau: <b>Hiểu ngôn ngữ</b> → <b>Biết dùng kỹ năng</b> → <b>Luyện IELTS</b>. Không khóa bài theo lịch. Các thanh tiến độ đo hoạt động cụ thể, không tự suy ra IELTS band.</p></div>'+
'<div class="lj-hero-side"><strong>3</strong><span>giai đoạn kết nối</span><small>Học đúng kỹ năng còn thiếu, không chạy theo số % ảo.</small></div></div>'+
'<div class="lj-alert"><strong>Phân biệt 3 con số</strong><p><b>Coverage:</b> số câu/bài thực sự đã làm. <b>Accuracy:</b> câu đúng / số câu được chấm. <b>Readiness:</b> còn cần kiểm chứng bằng bài mới, nói/viết và bài thi thử. 100% coverage không có nghĩa là band 8.0.</p></div>'+
'<div class="lj-stage-list">'+
block(1,"English Foundation","Từ loại, quan hệ của từ, to be, xây câu, từ vựng và phát âm.",f.pct,f.done+'/'+f.total+' hoạt động có bằng chứng luyện tập (24 bài gốc + 12 bài tư duy câu + 10 quan hệ). Chưa phải chứng nhận A2.',"foundation","Học Foundation",f.parts)+
block(2,"Core Skills Lab","30 bài kỹ năng nghe, đọc, viết, nói và tư duy ngôn ngữ trước IELTS.",c.pct,c.done+'/'+c.total+' câu hỏi đã trả lời; '+c.mastered+'/'+c.lessons+' bài đã ôn đủ điều kiện. Bài nói/viết cần phản hồi riêng.',"core","Học Core Skills")+
block(3,"IELTS Training · Question Types + 81 Tasks","Học chiến thuật theo dạng đề và kết nối trở lại Core Skills khi thiếu nền tảng.",i.pct,i.done+'/'+i.total+' tasks có dữ liệu số câu; '+i.answered+' câu đã trả lời; '+i.mastered+' tasks ôn đạt nhiều ngày. Chỉ tiến độ thực tế của 81 tasks được tính ở thanh này.',"question-types","Xem IELTS Question Types")+
'<div class="lj-stage-secondary"><button type="button" data-lj-open="today">Mở trực tiếp 81 IELTS Tasks →</button></div>' ++
'</div><div class="lj-guidance"><h3>Khi nào chuyển giai đoạn?</h3><p>Không cần hoàn thành 100% mới được học thử giai đoạn sau. Khi hiểu cấu trúc câu và làm được các bài đọc/nghe A1–A2, bắt đầu Core Skills. Khi biết tìm bằng chứng, nghe ý chính và diễn đạt ý rõ ràng, bắt đầu các IELTS tasks phù hợp. Nếu sai nhiều, quay về đúng kỹ năng cần sửa.</p><div class="lj-shortcuts"><button data-lj-open="progress" type="button">Xem Progress Hub</button><button data-lj-open="mock" type="button">Luyện Mock Tests</button></div></div></div>';
}
root.addEventListener("click",e=>{const b=e.target.closest("button[data-lj-open]");if(b)nav(b.dataset.ljOpen);});
document.querySelector('.nav[data-view="journey"]')?.addEventListener("click",render);
window.GKJourney={render,foundation,core,ielts};
render();
})();