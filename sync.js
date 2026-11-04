'use strict';
const StudySync=(()=>{
 const C=StudyCore, PREFIX='haruharu-sync-v2:', GUEST=PREFIX+'guest';
 let client=null,user=null,key=GUEST,cache=null,hooks=null,timer,busy=false,epoch=0,issue=null,phase='시작 중',storageOK=true;
 const empty=()=>C.normalize({});
 const fresh=()=>({data:empty(),base:empty(),revision:0,pending:false});
 function read(k){try{const raw=localStorage.getItem(k);if(!raw)return null;const x=JSON.parse(raw);return {...x,data:C.normalize(x.data),base:C.normalize(x.base),revision:Number(x.revision)||0};}catch(e){phase='로컬 기록 읽기 오류 · JSON 백업을 확인해 주세요';return null;}}
 function persist(){cache.conflict=issue;try{localStorage.setItem(key,JSON.stringify(cache));storageOK=true;}catch{storageOK=false;phase='저장 공간 오류 · 탭을 닫기 전에 JSON 백업하세요';}paint();}
 function paint(){const box=document.getElementById('sync-status');if(!box)return;box.textContent=(user?'☁ ':'◌ ')+(!storageOK?'저장 공간 오류 · 탭을 닫기 전에 JSON 백업하세요':phase);box.dataset.kind=issue?'conflict':!storageOK?'error':'status';const a=document.getElementById('sync-account');if(a)a.textContent=user?user.email:'로그인 없이 이 기기에서 학습 중';const choices=document.getElementById('sync-choices');if(choices)choices.hidden=!issue;const c=document.getElementById('sync-conflict');if(c){c.hidden=!issue;c.textContent=issue?'동시에 바뀐 기록 '+issue.fields.join(', ')+' · 아래에서 보관할 기록을 선택하세요.':'';}}
 function announce(p){phase=p;paint();}
 function apply(){hooks.set(C.copy(cache.data));paint();}
 function loadGuest(){cache=read(GUEST);if(!cache){cache=fresh();try{const old=localStorage.getItem('haruharu-japanese-v1');if(old){cache.data=C.normalize(JSON.parse(old));cache.pending=true;}}catch{announce('기존 기록 읽기 실패 · 원본 백업을 복원해 주세요');}persist();}}
 function save(data){
  const disk=read(key);const next=C.normalize(data);
  if(disk&&!C.eq(disk.data,cache.data)){
   const m=C.merge(cache.data,next,disk.data);
   if(m.conflicts.length){issue={remote:disk.data,local:next,base:cache.data,fields:m.conflicts,revision:disk.revision};cache.data=next;cache.pending=true;persist();announce('충돌 · 다른 탭과 변경한 기록을 확인해 주세요');return;}
   cache={...disk,data:m.state};
  }else cache.data=next;
  cache.pending=true;if(issue)issue.local=C.copy(cache.data);persist();apply();announce(!storageOK?phase:user?(navigator.onLine?'변경 저장 중…':'오프라인 · 이 기기에 저장, 연결 후 전송'):'이 기기에 저장됨 · 로그인하면 동기화 가능');schedule();
 }
 function schedule(ms=700){clearTimeout(timer);timer=setTimeout(()=>sync(),ms);}
 async function switchUser(u){
  if(user?.id===u?.id){paint();return;}
  epoch++;issue=null;user=u;key=u?PREFIX+u.id:GUEST;
  if(u)cache=read(key)||fresh();else loadGuest();
  issue=cache.conflict||null;apply();announce(u?'계정 기록 불러오는 중…':'이 기기에 저장됨');
  if(tab==='settings')settings();schedule(0);
 }
 async function roundtrip(){
  if(!client||!user||busy||issue)return;
  if(!navigator.onLine){announce('오프라인 · 이 기기에 저장, 연결 후 전송');return;}
  busy=true;const e=epoch,uid=user.id;announce('동기화 중…');
  try{
   // Shared origin tabs serialize network writes and refresh the canonical cache.
   const disk=read(key);if(disk&&!C.eq(disk,cache)){cache=disk;issue=cache.conflict||null;apply();if(issue){announce('충돌 · 데이터 관리에서 선택이 필요해요');return;}}
   const {data:row,error}=await client.from('study_progress').select('payload,revision').eq('user_id',uid).maybeSingle();
   if(e!==epoch)return;if(error)throw error;
   let remote=row?C.normalize(row.payload):empty(),revision=row?.revision||0;
   for(let tries=0;tries<4;tries++){
    const merged=C.merge(cache.base,cache.data,remote);
    if(merged.conflicts.length){issue={remote,local:C.copy(cache.data),base:C.copy(cache.base),fields:merged.conflicts,revision};persist();announce('충돌 · 데이터 관리에서 선택이 필요해요');return;}
    cache.data=merged.state;cache.base=C.copy(remote);cache.revision=revision;apply();
    if(C.eq(cache.data,remote)){cache.pending=false;persist();announce('동기화 완료 · '+new Date().toLocaleTimeString('ko-KR'));return;}
    const sent=C.copy(cache.data);
    const result=await client.rpc('save_study_progress',{expected_revision:revision,new_payload:sent});
    if(e!==epoch)return;if(result.error)throw result.error;
    const reply=result.data;
    const latest=read(key);if(latest)cache.data=latest.data;
    remote=C.normalize(reply.payload);revision=Number(reply.revision);
    if(reply.conflict)continue;
    // Edits made while the request was in flight remain pending.
    cache.base=C.copy(sent);cache.revision=revision;cache.pending=!C.eq(cache.data,sent);persist();
    announce(cache.pending?'새 변경 저장 대기…':'동기화 완료 · '+new Date().toLocaleTimeString('ko-KR'));
    if(cache.pending)schedule(0);return;
   }
   throw Error('다른 기기에서 변경 중이에요. 잠시 후 다시 시도합니다.');
  }catch(err){if(e===epoch){persist();announce('동기화 오류 · '+String(err.message||err)+' · 기록 보관 중, 15초 후 재시도');}}
  finally{busy=false;paint();}
 }
 async function sync(){if(navigator.locks){return navigator.locks.request('haruharu-study-sync',roundtrip);}return roundtrip();}
 function resolve(which){if(!issue)return;const x=issue,m=C.merge(x.base,x.local,x.remote);for(const path of x.fields){const [s,k]=path.split('.'),v=(which==='local'?x.local:x.remote)[s][k];if(v===undefined)delete m.state[s][k];else m.state[s][k]=C.copy(v);}cache.data=m.state;cache.base=C.copy(x.remote);cache.revision=x.revision;cache.pending=true;issue=null;persist();apply();announce('충돌 해결 · 동기화 대기');settings();schedule(0);}
 async function login(){if(!client){alert('config.js의 Supabase 공개 설정을 먼저 확인하세요.');return;}const email=document.getElementById('sync-email').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('이메일 주소를 확인해 주세요.');return;}announce('로그인 메일 보내는 중…');try{const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;announce('메일의 로그인 링크를 눌러 주세요 · 처음이면 자동 가입돼요');}catch(e){announce('로그인 메일 오류 · '+e.message);}}
 async function logout(){if(!client)return;if(cache.pending&&!confirm('전송 대기 기록은 이 기기의 계정별 저장소에 남아요. 로그아웃할까요?'))return;const {error}=await client.auth.signOut({scope:'local'});if(error){announce('로그아웃 오류 · '+error.message);return;}await switchUser(null);}
 function migrate(){if(!user)return;const guest=read(GUEST);if(!guest)return; if(guest.claimed&&guest.claimed!==user.id){alert('다른 계정으로 이전한 기록이에요. 필요한 경우 JSON 백업으로 가져오세요.');return;}if(!confirm('이 기기의 기존 학습 기록을 현재 로그인 계정에 합칠까요?'))return;
  const d=C.copy(cache.data);for(const s of ['completed','wrong','sessions'])for(const [k,v] of Object.entries(guest.data[s]))if(d[s][k]===undefined)d[s][k]=v;
  for(const [k,v] of Object.entries(guest.data.history))d.history[k]=[...new Set([...(d.history[k]||[]),...v])].sort((a,b)=>String(a).localeCompare(String(b),'en',{numeric:true}));
  save(d);guest.claimed=user.id;try{localStorage.setItem(GUEST,JSON.stringify(guest));}catch{}settings();
 }
 function ui(){return `<section class="panel sync-panel"><h2>계정 · 자동 동기화</h2><p id="sync-account"></p><p id="sync-conflict" class="notice" hidden></p>${user?`<div class="actions"><button class="btn" onclick="StudySync.sync()">지금 동기화</button><button class="btn alt" onclick="StudySync.migrate()">이 기기의 기존 기록 가져오기</button><button class="btn alt" onclick="StudySync.logout()">로그아웃</button></div><p class="muted">기존 기록은 이 계정으로 가져오기를 누르면 합쳐져요. 계정을 바꾸면 기록도 분리돼요.</p>`:`<label for="sync-email">이메일 주소</label><input class="field" id="sync-email" type="email" autocomplete="email" placeholder="name@example.com"><div class="actions"><button class="btn" onclick="StudySync.login()">이메일로 가입 · 로그인</button></div><p class="muted">메일로 받은 링크를 눌러 로그인해요. 비밀번호는 필요 없어요.</p>`}<div class="actions" id="sync-choices" hidden><button class="btn alt" onclick="StudySync.resolve('local')">충돌 항목: 이 기기 기록 선택</button><button class="btn alt" onclick="StudySync.resolve('remote')">충돌 항목: 서버 기록 선택</button></div><p class="muted">서로 다른 항목은 자동으로 합쳐지고, 같은 항목을 다르게 바꾼 경우에만 선택이 필요해요.</p></section>`;}
 async function init(h){hooks=h;loadGuest();issue=cache.conflict||null;apply();announce('이 기기에 저장됨 · 데이터 관리에서 로그인하세요');
  addEventListener('online',()=>schedule(0));addEventListener('offline',()=>announce('오프라인 · 이 기기에 저장, 연결 후 전송'));
  addEventListener('storage',ev=>{if(ev.key===key){const d=read(key);if(d){cache=d;issue=cache.conflict||null;apply();schedule(0);}}});
  addEventListener('focus',()=>schedule(0));document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(0);});
  setInterval(()=>sync(),15000);
  const cfg=window.STUDY_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabasePublicKey){announce('로컬 모드 · Supabase 연결 설정 전');return;}
  try{
   if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.supabaseUrl))throw Error('프로젝트 URL 형식을 확인하세요');
   const k=cfg.supabasePublicKey;if(k.startsWith('sb_secret_'))throw Error('비밀 키는 사용할 수 없어요');
   if(!k.startsWith('sb_publishable_')){let p;try{p=JSON.parse(atob(k.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{throw Error('공개 키 형식을 확인하세요');}if(p.role!=='anon')throw Error('legacy 키는 anon 역할만 허용해요');}
   client=window.supabase.createClient(cfg.supabaseUrl,k,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{fetch:async(url,options={})=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timeout);}}}});
   client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>switchUser(session?.user||null),0);});
   const {data,error}=await client.auth.getSession();if(error)throw error;await switchUser(data.session?.user||null);
   if(!data.session)announce('로컬 저장 중 · 로그인하면 자동 동기화');
  }catch(e){announce('연결 설정 오류 · '+e.message);}
 }
 return {init,save,sync,login,logout,migrate,resolve,ui,paint};
})();
