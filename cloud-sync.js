/* Cross-device learning progress sync — Firebase Google Auth + owner-only Firestore.
 * The public Firebase client config is loaded separately; actual sync requires functioning Google Auth and Firestore rules.
 * Never syncs API endpoints, dictionary caches, session secrets or browser preferences.
 * Keeps pre-existing learning data local until explicit first-time reconciliation.
 */
(function(){
"use strict";
const CONFIG=window.GK_FIREBASE_CONFIG;
const KEYS=[
 "ielts100_online","ielts_flexible_skill_v1",
 "gk_foundation_v1","gk_foundation_visual_v1","gk_foundation_sentence_v1","gk_foundation_relations_v1",
 "gk_core_skills_v1","gk_question_types_v1",
 "gkyyy_mock_test_v1","gkyyy_vocab_lab_v1","gkyyy_listening_tech_v1","gkyyy_error_center_v2",
 "gkyyy_highlights_v1","ielts_writing_task1_jobs_v1","gk_foundation_feedback_v1","gk_foundation_thinking_v1","gk_foundation_missions_v2","gk_foundation_flow_v1","gk_foundation_applied_v1","gk_foundation_exit_v1","gk_foundation_grammar_v1","gk_stage2_evidence_v1","gk_stage3_evidence_v1",
 "gk_foundation_word_feedback_a0_v1","gk_foundation_word_feedback_a1_v1","gk_foundation_word_feedback_a2_v1","gk_foundation_word_feedback_bridge_v1",
 "gk_vocab_writing_feedback_0_v1","gk_vocab_writing_feedback_1_v1","gk_vocab_writing_feedback_2_v1","gk_vocab_writing_feedback_3_v1"
];
const MAX_BYTES=400000;
const escapeHtml=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const trigger=document.createElement("button");
trigger.type="button";trigger.className="cloud-sync-trigger";
trigger.textContent="☁ Save across devices";
const locationEl=document.querySelector(".progressCard")||document.querySelector(".hero");
if(locationEl)locationEl.appendChild(trigger);
const overlay=document.createElement("div");
overlay.className="cloud-sync-overlay";overlay.hidden=true;
overlay.innerHTML='<section class="cloud-sync-dialog" role="dialog" aria-modal="true" aria-labelledby="cloudSyncTitle">'+
 '<div class="cloud-sync-heading"><div><small>MY IELTS ACCOUNT</small><h2 id="cloudSyncTitle">Sync your learning progress</h2></div><button type="button" data-cloud="close" aria-label="Close cloud sync dialog">✕</button></div>'+
 '<div id="cloudSyncStatus" class="cloud-sync-status" role="status"></div>'+
 '<div id="cloudSyncBody"></div></section>';
document.body.appendChild(overlay);
const body=overlay.querySelector("#cloudSyncBody"),info=overlay.querySelector("#cloudSyncStatus");
const configured=!!(CONFIG&&typeof CONFIG==="object"&&CONFIG.apiKey&&CONFIG.authDomain&&CONFIG.projectId&&CONFIG.appId);
let status=configured?"loading":"disabled",auth=null,db=null,sdk=null,user=null,uid=null,cloud=new Map(),base=new Map();
let busy=false,pollTimer=null,authenticatedAt=0,initCycle=0,lastRefresh=0,issue="",lastUpload=0,cloudStatus="";
let exportedLocal=false,exportedCloud=false;
const clean=v=>(v===null||v===undefined)?null:String(v);
const bytes=s=>new Blob([s]).size;
function snapshotLocal(){const x=new Map();for(const k of KEYS){try{const v=localStorage.getItem(k);if(v!==null)x.set(k,v);}catch(e){}}return x;}
function same(a,b){for(const k of KEYS)if((a.get(k)??null)!==(b.get(k)??null))return false;return true;}
function meaningful(m){return KEYS.some(k=>{const val=m.get(k);if(!val||val==="{}"||val==="[]"||val==="null")return false;try{const obj=JSON.parse(val);if(obj&&typeof obj==="object"&&Object.keys(obj).length===0)return false;}catch(e){}return true;});}
function fmtTime(ts){if(!ts)return"";try{return new Date(ts).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});}catch(e){return"";}}
function setStatus(label,mode){
 trigger.textContent=label;
 trigger.dataset.state=mode||"local";
}
function setInfo(s,level){info.textContent=s;info.dataset.kind=level||"neutral";}
function userLabel(){return escapeHtml(user?.displayName||user?.email||"Google account");}
function render(){
 const onlyLocal=status==="deciding"&&!meaningful(cloud);
 let markup="";
 if(status==="disabled"){
  setStatus("☁ Sync setup needed","local");
  setInfo("Chưa kết nối dịch vụ đồng bộ. Bài học vẫn được lưu trong trình duyệt này.","warning");
  markup='<p>Website hiện vẫn hoạt động bình thường trên thiết bị này. Để đăng nhập Google và học tiếp trên điện thoại, chủ website cần thiết lập Firebase Authentication + Firestore một lần.</p><p class="cloud-sync-note">Chưa có tài khoản cloud nào được tạo; nút đăng nhập không hoạt động cho đến khi kết nối hoàn tất.</p>';
 }else if(status==="loading"){
  setStatus("☁ Connecting…","pending");
  setInfo("Đang tải hệ thống đăng nhập…");
  markup='<p>Chờ kết nối Google Authentication.</p>';
 }else if(status==="signedout"){
  setStatus("☁ Sign in to sync","local");
  setInfo("Chưa đăng nhập. Tiến độ hiện chỉ lưu trên thiết bị này.");
  markup='<p>Đăng nhập bằng cùng một tài khoản Google trên Mac và điện thoại để tiếp tục học.</p>'+
   '<button type="button" data-cloud="signin" class="cloud-sync-primary">Continue with Google</button>'+
   '<p class="cloud-sync-note">Không cần tạo mật khẩu riêng. Đăng xuất sẽ không xóa dữ liệu đã lưu trên thiết bị.</p>';
 }else if(status==="deciding"||status==="conflict"){
  setStatus("☁ Choose progress","warning");
  setInfo(status==="conflict"?"Có thay đổi trên hai thiết bị. Tạm dừng đồng bộ để tránh ghi đè.":"Có hai bản tiến độ khác nhau. Hãy chọn bản muốn tiếp tục.", "warning");
  markup='<p class="cloud-sync-user">Signed in as <strong>'+userLabel()+'</strong></p>'+
   (onlyLocal?'<p>Cloud chưa có tiến độ. Dữ liệu trên máy sẽ được giữ nguyên và tải lên tài khoản khi mày chọn.</p>':'<p>Tiến độ trên máy và cloud khác nhau. <strong>Không tự ghi đè dữ liệu.</strong></p>')+
   '<div class="cloud-sync-actions">'+(onlyLocal?'':'<button type="button" data-cloud="chooseCloud" class="cloud-sync-primary">Use cloud progress on this device</button>')+
   '<button type="button" data-cloud="chooseLocal" class="'+(onlyLocal?'cloud-sync-primary':'cloud-sync-secondary')+'">'+(onlyLocal?'Upload device progress to cloud':'Keep this device and replace cloud')+'</button></div>'+
   '<p class="cloud-sync-note">Website sẽ cố lưu bản dự phòng trước khi thay thế; mày cũng có thể tải backup JSON.</p>'+
   '<button type="button" data-cloud="exportLocal" class="cloud-sync-link">Download device backup</button>'+
   (onlyLocal?'':'<button type="button" data-cloud="exportCloud" class="cloud-sync-link">Download cloud backup</button>');
 }else if(status==="remote"){
  setStatus("☁ Cloud update available","warning");
  setInfo("Một thiết bị khác đã cập nhật tiến độ. Hãy tải bản mới khi mày đã lưu xong bài đang làm.","warning");
  markup='<p class="cloud-sync-user">Signed in as <strong>'+userLabel()+'</strong></p><p>Cloud có thay đổi mới. Những bài đang mở vẫn giữ nguyên; áp dụng dữ liệu mới sẽ tải lại trang.</p>'+
   '<button type="button" data-cloud="chooseCloud" class="cloud-sync-primary">Load updated cloud progress</button>'+
   '<button type="button" data-cloud="exportLocal" class="cloud-sync-secondary">Download backup</button>';
 }else if(status==="active"||status==="syncing"){
  setStatus(status==="syncing"?"☁ Syncing…":"☁ Progress synced",status==="syncing"?"pending":"synced");
  setInfo(status==="syncing"?"Đang lưu thay đổi lên tài khoản Google…":"Đã kết nối với tài khoản Google. Các thay đổi học tập sẽ được đồng bộ khi có mạng.","success");
  markup='<p class="cloud-sync-user">Signed in as <strong>'+userLabel()+'</strong></p>'+
   '<div class="cloud-sync-details"><span>Saved sections</span><strong>'+cloud.size+' nhóm dữ liệu</strong><span>Last upload</span><strong>'+(lastUpload?fmtTime(lastUpload):"No new changes")+'</strong></div>'+
   '<div class="cloud-sync-actions"><button type="button" data-cloud="syncNow" class="cloud-sync-primary">Sync now</button>'+
   '<button type="button" data-cloud="refresh" class="cloud-sync-secondary">Check other device</button></div>'+
   '<button type="button" data-cloud="exportLocal" class="cloud-sync-link">Download local progress backup</button>'+
   '<p class="cloud-sync-note">Chỉ đồng bộ tiến độ học, từ vựng và ghi chú được hỗ trợ. Không đồng bộ tài khoản API, dữ liệu cache hoặc tệp âm thanh thô.</p>';
 }else{
  setStatus("☁ Sync paused","warning");
  setInfo(issue||"Không kết nối được. Tiến độ vẫn được lưu trên thiết bị này.","warning");
  markup='<button type="button" data-cloud="retry" class="cloud-sync-primary">Retry connection</button><button type="button" data-cloud="exportLocal" class="cloud-sync-secondary">Download local backup</button>';
 }
 if(user&&status!=="signedout")markup+='<div class="cloud-sync-footer"><button type="button" data-cloud="signout">Sign out (keep local progress)</button></div>';
 body.innerHTML=markup;
}
function show(){overlay.hidden=false;render();}
function hide(){overlay.hidden=true;}
function verifySizes(map){
 for(const k of KEYS){const val=map.get(k);if(val!=null&&bytes(val)>MAX_BYTES)throw Error("Dữ liệu "+k+" quá lớn để đồng bộ một lần. Hãy tải backup và liên hệ để chia nhỏ dữ liệu.");}
}
function saveBackup(map,kind){
 if(!meaningful(map))return true;
 try{
  const label="gk_sync_backup_"+Date.now()+"_"+kind;
  localStorage.setItem(label,JSON.stringify({createdAt:new Date().toISOString(),kind,values:Object.fromEntries(map)}));
  return true;
 }catch(e){return false;}
}
function download(map,kind){
 const data=JSON.stringify({format:"gk-ielts-learning-backup",version:1,createdAt:new Date().toISOString(),values:Object.fromEntries(map)},null,2);
 const url=URL.createObjectURL(new Blob([data],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="ielts-progress-backup-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 if(kind==="local")exportedLocal=true;else if(kind==="cloud")exportedCloud=true;
}
function applyCloud(){
 const mine=snapshotLocal();
 if(!same(mine,cloud)&&meaningful(mine)&&!saveBackup(mine,"device")&&!exportedLocal){issue="Không đủ bộ nhớ để giữ bản sao dữ liệu hiện tại. Tải backup JSON trước, rồi giải phóng dung lượng.";status="conflict";render();return;}
 try{
  for(const k of KEYS){if(cloud.has(k))localStorage.setItem(k,cloud.get(k));else localStorage.removeItem(k);}
  setInfo("Đã tải tiến độ. Đang tải lại trang…","success");
  window.location.reload();
 }catch(e){issue="Không lưu được dữ liệu từ cloud trên thiết bị này. Kiểm tra dung lượng trình duyệt.";status="error";render();}
}
async function cloudRead(){
 if(!uid)throw Error("Not signed in");
 const snap=await sdk.getDocs(sdk.collection(db,"users",uid,"learningProgress"));
 const vals=new Map();
 snap.forEach(d=>{if(KEYS.includes(d.id)&&typeof d.data()?.value==="string")vals.set(d.id,d.data().value)});
 return vals;
}
function refFor(k){return sdk.doc(db,"users",uid,"learningProgress",k);}
function resetPolling(){if(pollTimer){clearInterval(pollTimer);pollTimer=null;}}
function activate(remote){
 cloud=new Map(remote);base=new Map(remote);status="active";lastRefresh=Date.now();issue="";resetPolling();
 pollTimer=setInterval(()=>{if(document.visibilityState!=="hidden")void syncLocal();},12000);
 render();
}
async function replaceCloud(){
 if(!uid||busy)return;busy=true;status="syncing";render();
 try{
  const mine=snapshotLocal();verifySizes(mine);
  if(meaningful(cloud)&&!saveBackup(cloud,"cloud")&&!exportedCloud){
   throw Error("Không thể tạo backup cloud trên thiết bị này. Hãy tải backup JSON trước khi thay thế.");
  }
  if(meaningful(cloud)&&!exportedCloud){
   const confirmed=window.confirm("Thay bản trên cloud bằng dữ liệu thiết bị này? Bản cloud cũ sẽ được giữ dự phòng trong trình duyệt này. Mày có thể tải backup JSON trước.");
   if(!confirmed){status="deciding";return;}
  }
  const keys=KEYS.filter(k=>(mine.get(k)??null)!==(cloud.get(k)??null));
  await sdk.runTransaction(db,async tx=>{
   const refs=keys.map(refFor);
   const snaps=[];for(const ref of refs)snaps.push(await tx.get(ref));
   snaps.forEach((snap,i)=>{if((snap.exists()?snap.data().value:null)!==(cloud.get(keys[i])??null))throw new Error("Cloud thay đổi trong lúc xác nhận. Hãy kiểm tra lại trước khi ghi đè.");});
   for(let i=0;i<keys.length;i++){const val=mine.get(keys[i]);if(val===undefined)tx.delete(refs[i]);else tx.set(refs[i],{value:val,source:"user-selected-device",updatedAt:sdk.serverTimestamp()});}
  });
  lastUpload=Date.now();activate(mine);
 }catch(e){issue=e.message||String(e);status="error";}
 finally{busy=false;render();}
}
async function syncLocal(){
 if(status!=="active"||busy||!uid||!navigator.onLine)return;
 busy=true;let changed=0;
 try{
  const local=snapshotLocal();verifySizes(local);
  const keys=KEYS.filter(k=>(local.get(k)??null)!==(base.get(k)??null));
  if(!keys.length)return;
  status="syncing";render();
  for(const k of keys){
   if(!uid||status==="signedout")return;
   const newValue=local.get(k)??null,previous=base.get(k)??null;
   await sdk.runTransaction(db,async tx=>{
    const ref=refFor(k);const existing=await tx.get(ref);
    const server=existing.exists()?existing.data().value:null;
    if(server!==previous){const err=new Error("Cloud progress changed on another device.");err.code="sync/conflict";throw err;}
    if(newValue===null)tx.delete(ref);
    else tx.set(ref,{value:newValue,source:"auto-sync",updatedAt:sdk.serverTimestamp()});
   });
   if(newValue===null){base.delete(k);cloud.delete(k);}else{base.set(k,newValue);cloud.set(k,newValue);}
   changed++;
  }
  if(changed)lastUpload=Date.now();
  status="active";
 }catch(e){
  issue=e.message||String(e);status="error";
  if(e.code==="sync/conflict"||/another device/i.test(issue)){
   try{cloud=await cloudRead();status="conflict";}catch(err){issue+=" Không tải lại được cloud.";}
  }
 }finally{busy=false;render();}
}
async function checkRemote(force){
 if(!uid||busy||!["active","remote"].includes(status))return;
 if(!force&&Date.now()-lastRefresh<90000)return;
 busy=true;
 try{
  const remote=await cloudRead();lastRefresh=Date.now();
  if(!same(remote,base)){cloud=remote;status=same(snapshotLocal(),base)?"remote":"conflict";show();}
  else if(status==="remote")status="active";
  if(status==="active")await syncLocalAfterRefresh();
 }catch(e){issue="Không kiểm tra được cloud: "+(e.message||e);status="error";show();}
 finally{busy=false;render();}
}
function syncLocalAfterRefresh(){return Promise.resolve();}
async function onUser(u){
 resetPolling();const session=++initCycle;user=u;uid=u?.uid||null;exportedLocal=false;exportedCloud=false;
 if(!u){cloud=new Map();base=new Map();status="signedout";render();return;}
 status="loading";render();
 try{
  const remote=await cloudRead();if(session!==initCycle)return;
  cloud=remote;
  const local=snapshotLocal();
  if(same(local,remote)){activate(remote);return;}
  if(!meaningful(remote)&&!meaningful(local)){activate(remote);return;}
  if(!meaningful(local)&&meaningful(remote)){status="remote";show();return;}
  status="deciding";show();
 }catch(e){if(session!==initCycle)return;issue="Không đọc được Firestore: "+(e.message||e)+". Kiểm tra Firestore rules và cấu hình.";status="error";show();}
}
async function startup(){
 if(!configured){render();return;}
 try{
  const baseUrl="https://www.gstatic.com/firebasejs/12.19.0/";
  const libs=await Promise.all([
    import(baseUrl+"firebase-app.js"),
    import(baseUrl+"firebase-auth.js"),
    import(baseUrl+"firebase-firestore.js")
  ]);
  const app=libs[0].initializeApp(CONFIG);
  auth=libs[1].getAuth(app);
  db=libs[2].getFirestore(app);
  sdk={...libs[1],...libs[2]};
  libs[1].onAuthStateChanged(auth,onUser,err=>{issue=err.message;status="error";show();});
 }catch(e){issue="Không tải được Firebase: "+(e.message||e);status="error";render();}
}
overlay.addEventListener("click",async event=>{
 if(event.target===overlay){hide();return;}
 const btn=event.target.closest("button[data-cloud]");if(!btn||busy)return;
 const action=btn.dataset.cloud;
 if(action==="close"){hide();return;}
 if(action==="exportLocal"){download(snapshotLocal(),"local");return;}
 if(action==="exportCloud"){download(cloud,"cloud");return;}
 if(action==="chooseCloud"){applyCloud();return;}
 if(action==="chooseLocal"){await replaceCloud();return;}
 if(action==="syncNow"){await syncLocal();if(status==="active")await checkRemote(true);return;}
 if(action==="refresh"){await checkRemote(true);return;}
 if(action==="retry"){if(auth&&user)await onUser(user);else if(!auth)await startup();return;}
 if(action==="signout"){if(status==="active")await syncLocal();if(status!=="active"&&status!=="signedout"){if(!window.confirm("Đồng bộ chưa xong; điện thoại có thể chưa nhận tiến độ mới. Vẫn đăng xuất?"))return;}resetPolling();await sdk.signOut(auth);return;}
 if(action==="signin"&&auth){
  try{await sdk.signInWithPopup(auth,new sdk.GoogleAuthProvider());}catch(e){
   issue=e.code==="auth/popup-blocked"?"Trình duyệt đã chặn popup. Hãy cho phép popup đăng nhập Google.":e.code==="auth/unauthorized-domain"?"Cần thêm nguyengiaky.github.io vào Firebase Authentication → Authorized domains.":"Google sign-in failed: "+(e.message||e);
   status="error";render();
  }
 }
});
trigger.addEventListener("click",show);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")void checkRemote(false);else if(status==="active")void syncLocal();});
window.addEventListener("online",()=>{if(status==="active")void syncLocal();});
window.GKCloudSync={getState:()=>status,getSyncedSections:()=>cloud.size,keys:()=>KEYS.slice(),configured,getIdToken:async()=>{if(!user||typeof user.getIdToken!=="function")throw new Error("Sign in with Google to use OpenAI correction.");return user.getIdToken();}};
render();void startup();
})();