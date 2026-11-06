/* merry themes + authenticated Notion synchronization. No secrets are stored here. */
(()=>{
'use strict';
const live=!!window.MERRY_LIVE,byId=id=>document.getElementById(id),safe=esc,clone=v=>JSON.parse(JSON.stringify(v));
const local={get:(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{toast('브라우저 저장 공간을 확인해 주세요.');return false}}};
const themeKey='merry-theme-v1',settings=local.get(themeKey,{mode:'system',accent:'lavender'}),colors={lavender:['#7179d8','#eeedfb','라벤더'],blue:['#376ebf','#eaf1ff','블루'],mint:['#288674','#e7f4ee','민트'],rose:['#b75c7d','#f9eaf0','로즈'],mono:['#515b70','#edf0f5','모노']};
const media=window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){const dark=settings.mode==='dark'||(settings.mode==='system'&&media.matches),accent=colors[settings.accent]||colors.lavender;document.documentElement.dataset.mTheme=dark?'dark':'light';document.documentElement.style.setProperty('--m-accent',accent[0]);document.documentElement.style.setProperty('--m-accent-ink',dark?({lavender:'#bcbcff',blue:'#a7c9ff',mint:'#9be5cf',rose:'#f2b0ca',mono:'#d5dded'}[settings.accent]||'#bcbcff'):accent[0]);document.documentElement.style.setProperty('--m-soft',dark?'#303a50':accent[1]);document.querySelectorAll('[data-theme-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.themeMode===settings.mode);b.setAttribute('aria-pressed',String(b.dataset.themeMode===settings.mode))});document.querySelectorAll('[data-theme-accent]').forEach(b=>{b.classList.toggle('active',b.dataset.themeAccent===settings.accent);b.setAttribute('aria-pressed',String(b.dataset.themeAccent===settings.accent))})}
media.addEventListener('change',applyTheme);applyTheme();
const oldSettings=byId('view-settings');for(const child of [...oldSettings.children])child.style.display='none';
oldSettings.insertAdjacentHTML('beforeend',`<section class="card emptycard"><div class="cardtitle">화면과 연결 설정</div><div class="m-setting"><h3>화면 테마</h3><p>테마는 이 브라우저에 저장되며, 다른 기기의 테마를 바꾸지 않아요.</p><div class="theme-options">${[['light','☀ 라이트'],['dark','☾ 다크'],['system','◐ 시스템 설정']].map(([mode,label])=>`<button class="theme-choice" data-theme-mode="${mode}">${label}</button>`).join('')}</div><h3 style="margin-top:24px">포인트 색상</h3><div class="theme-options">${Object.entries(colors).map(([key,[color,,label]])=>`<button class="theme-choice accent-choice" data-theme-accent="${key}"><i style="--swatch:${color}"></i>${label}</button>`).join('')}</div><div class="m-theme-sample"><div class="sample-task">✓ 오늘의 할 일<br><span>선택한 테마가 전체 화면에 적용돼요</span></div><button class="btn primary" type="button">저장 버튼 예시</button></div></div><div class="m-setting"><h3>노션 연결</h3><p id="m-connection-description">${live?'실제 데이터 모드 · 노션을 기준으로 불러오고 변경을 전송합니다.':'현재는 예시 데이터 모드입니다. 예시 기록은 노션에 자동 전송되지 않아요.'}</p><div class="m-formline"><input class="m-input" id="m-password" type="password" autocomplete="current-password" placeholder="대시보드 비밀번호" aria-label="대시보드 비밀번호"><button class="btn primary" id="m-login">로그인하고 노션 연결</button></div><div class="m-formline"><button class="btn" id="m-prepare">노션 연동 속성 준비</button><button class="btn" id="m-refresh">노션에서 새로 불러오기</button><button class="btn" id="m-demo">예시 모드로 보기</button><button class="btn" id="m-logout">로그아웃</button></div><div class="m-notice" id="m-connect-status">연결 설정을 확인 중입니다.</div><p style="margin-top:10px">로그인 후 연결 준비 과정에서 연결된 6개 DB에 Merry ID·Version·Operation·Data 속성을 추가합니다. 기존 속성과 페이지 본문은 삭제하지 않아요.</p></div><div class="m-setting"><h3>오늘 프로젝트 자동 가져오기</h3><p>켜 두면 조회할 때 오늘 예정인 미완료 프로젝트를 할 일로 가져와요. 같은 프로젝트는 중복 생성하지 않아요.</p><label class="m-formline"><input type="checkbox" id="m-auto-import" ${local.get('merry-auto-import',false)?'checked':''}>자동 가져오기 사용</label></div><div class="m-setting"><h3>분기 목표</h3><p>기간이 없는 기존 채널 실적은 목록에서 확인할 수 있지만 분기 합계에는 포함하지 않아요.</p><div class="m-formline"><select class="m-input" id="m-quarter" aria-label="성과 관리 분기"></select><input class="m-input" id="m-target" type="number" min="0" step="1" placeholder="분기 목표 공헌이익 (원)" aria-label="분기 목표 공헌이익"><button class="btn" id="m-save-target">분기 목표 저장</button></div></div><div class="m-setting"><h3>동기화 기록</h3><p>전송 대기·실패·충돌을 확인하고 재시도할 수 있어요.</p><div class="m-formline"><button class="btn" id="m-sync-open">동기화 상태 열기</button><button class="btn" id="m-export">브라우저 기록 백업 받기</button></div></div></section>`);
applyTheme();document.addEventListener('click',e=>{const mode=e.target.closest('[data-theme-mode]'),accent=e.target.closest('[data-theme-accent]');if(mode)settings.mode=mode.dataset.themeMode;if(accent)settings.accent=accent.dataset.themeAccent;if(mode||accent){local.set(themeKey,settings);applyTheme()}});
const now=new Date(),period={year:now.getFullYear(),q:Math.floor(now.getMonth()/3)+1};window.merryPeriod=period;
const quarterOptions=[];for(let y=period.year-1;y<=period.year+1;y++)for(let q=1;q<=4;q++)quarterOptions.push(`<option value="${y}-${q}" ${y===period.year&&q===period.q?'selected':''}>${y} Q${q}</option>`);byId('m-quarter').innerHTML=quarterOptions.join('');
let quarterRows=local.get(live?'merry-live-quarters':'merry-demo-quarters',[]),events=local.get(live?'merry-live-events':'merry-demo-events',live?[]:[{id:'demo-meeting',title:'콘텐츠 방향 미팅',date:new Date().toLocaleDateString('sv-SE'),end:'',tags:['미팅']},{id:'demo-shoot',title:'촬영 준비',date:new Date().toLocaleDateString('sv-SE'),end:'',tags:['콘텐츠']}]),memos=local.get(live?'merry-live-memos':'merry-demo-memos',live?[]:null),activeMemo=null,eventEditing=null,calendarDate=new Date(now.getFullYear(),now.getMonth(),1);
function quarterChanged(){const [y,q]=byId('m-quarter').value.split('-').map(Number);period.year=y;period.q=q;const row=quarterRows.find(r=>r.title.replace(/\s/g,'').toUpperCase()===`${y}Q${q}`||r.title.replace(/\s/g,'').toUpperCase()===`${y}${q}Q`);window.merryQuarterTarget=row?.target||0;byId('m-target').value=row?.target??'';byId('quarterbtn').textContent=`${y}년 ${q}분기 ▾`;render();paint()}
byId('m-quarter').onchange=quarterChanged;byId('quarterbtn').onclick=()=>{navigate('settings');byId('m-quarter').focus()};
let writeOwner=!live,ownerReady=Promise.resolve();
if(live){ownerReady=new Promise(resolve=>{if(!navigator.locks){writeOwner=true;resolve();return}navigator.locks.request('merry-live-owner',{ifAvailable:true},async lock=>{writeOwner=!!lock;resolve();if(lock)await new Promise(done=>window.addEventListener('pagehide',done,{once:true}))}).catch(()=>resolve())})}
function connectionReady(){return !live||(writeOwner&&authorized&&loaded)}
function requireConnection(e){if(connectionReady())return false;e.preventDefault();e.stopImmediatePropagation();navigate('settings');toast(!writeOwner?'다른 merry 탭을 닫고 새로고침해 주세요.':!authorized?'먼저 비밀번호로 로그인하고 노션을 연결해 주세요.':'노션 데이터를 불러온 후 수정할 수 있어요. 연결 오류를 확인해 주세요.');return true}
document.addEventListener('submit',e=>{if(e.target.matches('#wb-quickform,#wb-taskform,#wb-projectform,#wb-bulkform,#recordform,#m-event-form'))requireConnection(e)},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-undo-project],[data-delete-task],[data-project-check],[data-check],[data-import-project],[data-upload],#m-save-target,#m-memo-add,#m-memo-delete,#m-event-delete'))requireConnection(e)},true);
document.addEventListener('change',e=>{if(e.target.closest('#workbench')&&e.target.matches('input[type=checkbox]:not(#wb-showdone),select'))requireConnection(e)},true);
document.addEventListener('drop',e=>{if(e.target.closest('#workbench'))requireConnection(e)},true);
function readonlyNotice(){toast('실제 데이터는 한 탭에서 편집할 수 있어요. 다른 merry 탭을 닫고 새로고침해 주세요.')}
document.addEventListener('submit',e=>{if(live&&!writeOwner&&!e.target.matches('#sh-form')){e.preventDefault();e.stopImmediatePropagation();readonlyNotice()}},true);
document.addEventListener('click',e=>{if(!live||writeOwner)return;const dangerous=e.target.closest('[data-delete-task],#wb-projectdelete,#m-memo-add,#m-memo-delete,#m-event-delete,#m-save-target,#m-prepare,[data-local-choice],[data-remote-choice]');if(dangerous){e.preventDefault();e.stopImmediatePropagation();readonlyNotice()}},true);
document.addEventListener('change',e=>{if(live&&!writeOwner&&e.target.closest('#workbench')){e.preventDefault();e.stopImmediatePropagation();window.orbitWorkbench.paint();readonlyNotice()}},true);
document.addEventListener('drop',e=>{if(live&&!writeOwner&&!e.target.matches('#sh-form')){e.preventDefault();e.stopImmediatePropagation();readonlyNotice()}},true);
const QKEY='merry-sync-queue-v1',MKEY='merry-sync-meta-v1';let queue=local.get(QKEY,[]),meta=local.get(MKEY,{}),baseline={},applying=false,busy=false,lastError='',authorized=false,loaded=false,lastPull=0;
for(const op of queue)if(op.status==='sending')op.status='pending';
const stripped=value=>{const data={};for(const [k,v]of Object.entries(value||{}))if(!k.startsWith('_')&&!['sync','id'].includes(k))data[k]=v;return data};
const signature=v=>JSON.stringify(stripped(v));
function memoStore(){return local.set(live?'merry-live-memos':'merry-demo-memos',memos)}
function saveQueue(){return local.set(QKEY,queue)&&local.set(MKEY,meta)}
function enqueue(kind,id,data,type='upsert'){
 if(!live||applying||!writeOwner)return;
 const key=kind+':'+id,op={opId:crypto.randomUUID(),kind,id,type,data:type==='delete'?undefined:stripped(data),base:meta[key]||null,status:'pending',createdAt:Date.now()};
 queue.push(op);if(saveQueue()){paint();drain()}else{queue.pop();lastError='변경을 보관할 수 없습니다.';paint()}
}
function compare(kind,items){const prev=baseline[kind]||new Map(),next=new Map(items.map(r=>[r.id,clone(r)]));for(const [id,r]of next)if(!prev.has(id)||signature(prev.get(id))!==signature(r))enqueue(kind,id,r);for(const [id,r]of prev)if(!next.has(id))enqueue(kind,id,r,'delete');baseline[kind]=next}
function autoImportLive(){if(!live||!writeOwner||!local.get('merry-auto-import',false))return;const today=new Date().toLocaleDateString('sv-SE'),s=window.orbitWorkbench.getState();let count=0;for(const p of s.projects){if(p.done||p.date!==today||s.suppressed?.includes(p.id+'|'+today)||s.tasks.some(t=>t.source===p.id&&t.date===today))continue;const existing=s.tasks.find(t=>!t.source&&window.merryTaskDedupe.key(t)===window.merryTaskDedupe.key({...p,date:today}));if(existing){existing.source=p.id;existing.sourceType='task';count++;continue}s.tasks.push({id:'import-'+p.id+'-'+today,title:p.title,date:today,channel:p.channel,time:'',note:'',done:false,source:p.id,sourceType:'task'});count++}if(count){window.orbitWorkbench.setState(s);compare('todo',s.tasks)}}
byId('m-auto-import').onchange=()=>{local.set('merry-auto-import',byId('m-auto-import').checked);autoImportLive()};
function setBaseline(){const state=window.orbitWorkbench.getState();baseline.todo=new Map(state.tasks.map(r=>[r.id,clone(r)]));baseline.projects=new Map(state.projects.map(r=>[r.id,clone(r)]));baseline.performance=new Map(records.map(r=>[r.id,clone(r)]));baseline.memo=new Map(memos.map(r=>[r.id,clone(r)]));baseline.events=new Map(events.map(r=>[r.id,clone(r)]));baseline.quarter=new Map(quarterRows.map(r=>[r.id,clone(r)]))}
window.merryLocalSaved=(scope,snapshot)=>{if(!live||applying||!writeOwner)return;if(scope==='work'){compare('todo',snapshot.tasks);compare('projects',snapshot.projects)}if(scope==='performance')compare('performance',snapshot);paint()};
async function api(action,body){if(location.protocol==='file:')throw Error('HTML 파일만 열면 노션 서버가 실행되지 않아요. 전체 폴더를 Vercel에 배포해 주세요.');const r=await fetch('/api/notion?action='+action,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(58000)});const data=await r.json().catch(()=>({error:'백엔드 응답이 아닙니다. 전체 프로젝트 배포를 확인해 주세요.'}));if(!r.ok)throw Object.assign(Error(data.error||'연결 실패'),{status:r.status,current:data.current});return data}
function pendingFor(kind,id){return queue.some(op=>op.kind===kind&&op.id===id)}
function statusFor(kind,id){const ops=queue.filter(op=>op.kind===kind&&op.id===id);return ops.some(o=>o.status==='conflict')?'충돌 확인 필요':ops.some(o=>o.status==='error')?'전송 실패':ops.length?'전송 대기':'노션 반영 완료'}
async function drain(){
 if(!live||!writeOwner||busy||!authorized||!navigator.onLine)return;busy=true;
 try{for(const op of [...queue]){if(!queue.includes(op)||op.status==='conflict'||(op.status==='error'&&(!op.retryAt||Date.now()<op.retryAt))||queue.some(o=>o!==op&&o.kind===op.kind&&o.id===op.id&&o.createdAt<op.createdAt))continue;op.status='sending';saveQueue();paint();
  try{const result=await api('sync',op);const key=op.kind+':'+op.id;if(result.record?._remote)meta[key]=result.record._remote;if(result.deleted&&op.type==='upsert'){replaceCollection(op.kind,collection(op.kind).filter(r=>r.id!==op.id));if(op.kind==='todo'&&op.data?.source){const s=window.orbitWorkbench.getState();s.suppressed=[...(s.suppressed||[]),op.data.source+'|'+op.data.date];window.orbitWorkbench.setState(s)}baseline[op.kind]?.delete(op.id)}queue=queue.filter(o=>o.opId!==op.opId);for(const later of queue.filter(o=>o.kind===op.kind&&o.id===op.id))later.base=result.record?._remote||later.base;lastError='';saveQueue()}
  catch(e){op.status=e.status===409?'conflict':'error';op.error=e.message;op.attempts=(op.attempts||0)+1;op.retryAt=(!e.status||[423,429,502,503,504].includes(e.status))?Date.now()+Math.min(60000,2000*2**Math.min(op.attempts,5)):null;if(e.current)op.current=e.current;if(e.status===401)authorized=false;lastError=e.message;saveQueue()}
  paint();
 }}finally{busy=false;paint()}
}
function collection(kind){if(kind==='todo')return window.orbitWorkbench.getState().tasks;if(kind==='projects')return window.orbitWorkbench.getState().projects;if(kind==='performance')return records;if(kind==='memo')return memos;if(kind==='events')return events;return quarterRows}
function replaceCollection(kind,list){const wasApplying=applying;applying=true;try{if(['todo','projects'].includes(kind)){const s=window.orbitWorkbench.getState();s[kind==='todo'?'tasks':'projects']=list;window.orbitWorkbench.setState(s)}else if(kind==='performance'){records=list;persist();render()}else if(kind==='memo'){memos=list;memoStore();renderMemosLive()}else if(kind==='events'){events=list;local.set('merry-live-events',events);renderEvents()}else{quarterRows=list;local.set('merry-live-quarters',quarterRows);quarterChanged()}}finally{applying=wasApplying}}
async function pull(){if(!live||!writeOwner||!authorized||busy)return;const snapshot=await api('bootstrap',{});applying=true;try{for(const kind of ['todo','projects','performance','memo','events','quarter']){const incoming=snapshot[kind]||[],localItems=collection(kind);for(const r of incoming)if(!pendingFor(kind,r.id))meta[kind+':'+r.id]=r._remote;const kept=localItems.filter(r=>pendingFor(kind,r.id));replaceCollection(kind,[...incoming.filter(r=>!pendingFor(kind,r.id)),...kept])}setBaseline();local.set(MKEY,meta);lastPull=Date.now();loaded=true;lastError=''}finally{applying=false;autoImportLive();paint()}}
// Reject silent overwrite: the user chooses which side to keep for an actual conflict.
function useRemote(op){const key=op.kind+':'+op.id;queue=queue.filter(o=>o.kind!==op.kind||o.id!==op.id);const next=collection(op.kind).filter(r=>r.id!==op.id);if(op.current&&!op.current._deleted)next.push(op.current);replaceCollection(op.kind,next);if(op.current)meta[key]=op.current._remote;saveQueue();setBaseline();paint()}
function keepLocal(op){if(!op.current){toast('먼저 노션 내용을 새로 불러와 주세요.');return}const same=queue.filter(o=>o.kind===op.kind&&o.id===op.id),latest=same.at(-1);queue=queue.filter(o=>o.kind!==op.kind||o.id!==op.id);meta[op.kind+':'+op.id]=op.current._remote;if(op.current._deleted){const remaining=collection(op.kind).filter(r=>r.id!==op.id);if(latest.type==='upsert'){const id=crypto.randomUUID();remaining.push({...latest.data,id});replaceCollection(op.kind,remaining);enqueue(op.kind,id,latest.data);toast('삭제된 원본 대신 새 항목으로 저장합니다.')}else replaceCollection(op.kind,remaining);saveQueue();setBaseline();paint();return}enqueue(op.kind,op.id,latest.data,latest.type);saveQueue();paint()}
document.body.insertAdjacentHTML('beforeend',`<div class="overlay m-syncpanel" id="m-syncmodal" role="dialog" aria-modal="true" aria-labelledby="m-sync-title"><div class="modal wbformdialog"><div class="editor-top"><span>NOTION SYNC</span><button id="m-sync-close" aria-label="동기화 창 닫기">×</button></div><h2 id="m-sync-title">동기화 상태</h2><p id="m-sync-summary"></p><button class="btn primary" id="m-retry">실패한 변경 재시도</button><div id="m-sync-list"></div><p class="m-inline-alert">변경 전송은 로그인한 이 브라우저가 열려 있을 때 실행됩니다.</p></div></div>`);
function openSync(){paint();byId('m-syncmodal').classList.add('open');byId('m-sync-close').focus()}
byId('m-sync-close').onclick=()=>byId('m-syncmodal').classList.remove('open');byId('m-syncmodal').onclick=e=>{if(e.target===byId('m-syncmodal'))byId('m-syncmodal').classList.remove('open')};byId('m-sync-open').onclick=openSync;
byId('m-retry').onclick=async()=>{if(!authorized){lastError='설정에서 먼저 로그인해 주세요.';paint();return}queue.forEach(o=>{if(o.status==='error'){o.status='pending';delete o.error;delete o.retryAt}});saveQueue();await drain();if(!queue.length)await pull().catch(e=>{lastError=e.message;paint()})};
function conflictDiff(op){const names={title:'제목',channel:'채널',campaign:'캠페인',date:'날짜',upload:'발행일',stage:'단계',time:'시간대',note:'비고',content:'메모 본문',done:'완료',expected:'예상 금액',actual:'확정 금액',status:'성과 상태',target:'목표',end:'종료일',tags:'태그'};const local=op.data||{},remote=op.current||{};const rows=Object.entries(names).filter(([k])=>JSON.stringify(local[k])!==JSON.stringify(remote[k])&&(local[k]!==undefined||remote[k]!==undefined));const value=v=>v===true?'완료':v===false?'미완료':Array.isArray(v)?v.join(', '):v??'—';return '<details><summary>바뀐 내용 비교</summary>'+rows.map(([k,n])=>`<p class="m-inline-alert"><b>${n}</b><br>노션: ${safe(value(remote[k]))}<br>내 기록: ${safe(value(local[k]))}</p>`).join('')+'</details>'}
function paint(){if(!byId('m-sync-summary'))return;const conflicts=queue.filter(o=>o.status==='conflict').length,errors=queue.filter(o=>o.status==='error').length,label=!live?'예시 · 브라우저 저장':!writeOwner?'다른 탭에서 연동 중 · 읽기 전용':!authorized?'노션 로그인 필요':conflicts?`충돌 ${conflicts}건`:errors?`전송 실패 ${errors}건`:lastError?'노션 연결 오류':!loaded?'노션 불러오기 필요':busy?'노션에 저장 중':queue.length?`노션 전송 대기 ${queue.length}건`:'노션 반영 완료';byId('synctext').textContent=label;byId('syncpill').onclick=openSync;const workLabel=byId('wb-save');if(workLabel)workLabel.textContent=label+' ↗';byId('m-connect-status').textContent=lastError||(!live?'예시 모드 · 노션에 전송되지 않습니다.':!authorized?'비밀번호를 입력해 로그인해 주세요.':!loaded?'노션 연결과 데이터 불러오기를 완료해 주세요.':queue.length?'변경을 노션으로 전송 중입니다.':'노션 연결 확인됨 · 데이터를 불러왔습니다.');byId('m-sync-summary').textContent=!live?'예시 모드입니다. 이 기록은 노션에 전송되지 않아요.':lastError||`${queue.length}개 변경이 남아 있어요. ${lastPull?'최근 불러오기 '+new Date(lastPull).toLocaleTimeString('ko-KR'):''}`;byId('m-sync-list').innerHTML=queue.map(op=>`<div class="m-sync-item"><strong>${safe(op.data?.title||op.data?.channel||op.kind)} · ${op.type==='delete'?'삭제':'수정'}</strong><small>${safe(op.status==='conflict'?'충돌':op.status==='error'?'실패':op.status==='sending'?'전송 중':'전송 대기')} ${safe(op.error||'')}</small>${op.status==='conflict'?`<p class="m-inline-alert">노션: ${safe(op.current?.title||op.current?.channel||'(삭제됨)')} / 내 기록: ${safe(op.data?.title||op.data?.channel||'(삭제)')}</p>${conflictDiff(op)}<button class="btn" data-remote-choice="${safe(op.opId)}">노션 내용 사용</button> <button class="btn" data-local-choice="${safe(op.opId)}">내 변경 다시 저장</button>`:''}</div>`).join('')||'<div class="wb-empty">전송 대기 중인 변경이 없어요.</div>';if(live)for(const r of records){const row=document.querySelector(`[data-edit="${CSS.escape(r.id)}"]`)?.closest('tr');if(row)row.querySelector('.saved').textContent=statusFor('performance',r.id)}}
window.merrySync={drain,paint};
document.addEventListener('click',e=>{const remote=e.target.closest('[data-remote-choice]'),own=e.target.closest('[data-local-choice]');if(remote){const op=queue.find(o=>o.opId===remote.dataset.remoteChoice);if(op)useRemote(op)}if(own){const op=queue.find(o=>o.opId===own.dataset.localChoice);if(op)keepLocal(op)}});
byId('m-login').onclick=async()=>{const button=byId('m-login');button.disabled=true;try{await api('login',{password:byId('m-password').value});await api('prepare',{});byId('m-password').value='';authorized=true;if(!live){localStorage.setItem('merry-mode','live');location.reload();return}await pull();await drain();byId('m-connect-status').textContent='로그인했습니다. 노션에서 데이터를 불러왔어요.'}catch(e){lastError=e.message;byId('m-connect-status').textContent=e.message}finally{button.disabled=false;paint()}};
byId('m-prepare').onclick=async()=>{if(!authorized){toast('먼저 로그인해 주세요.');return}const button=byId('m-prepare');button.disabled=true;try{await api('prepare',{});await pull();await drain();lastError='';byId('m-connect-status').textContent='연동 속성을 준비했습니다. 전송 실패 항목은 동기화 상태에서 재시도해 주세요.'}catch(e){byId('m-connect-status').textContent=e.message}finally{button.disabled=false}};
byId('m-refresh').onclick=async()=>{try{if(queue.length){openSync();toast('남아 있는 변경을 먼저 확인해 주세요.');return}await pull();toast('노션에서 다시 불러왔어요')}catch(e){lastError=e.message;paint();toast(e.message)}};
byId('m-demo').onclick=()=>{localStorage.setItem('merry-mode','demo');location.reload()};byId('m-logout').onclick=async()=>{try{await api('logout',{})}catch{}authorized=false;localStorage.removeItem('merry-mode');location.reload()};
byId('m-save-target').onclick=()=>{const n=Number(byId('m-target').value);if(byId('m-target').value===''||!Number.isFinite(n)||n<0){toast('목표 금액을 확인해 주세요.');return}const title=`${period.year} Q${period.q}`,row=quarterRows.find(r=>r.title===title);if(row)row.target=n;else quarterRows.push({id:crypto.randomUUID(),title,target:n});local.set(live?'merry-live-quarters':'merry-demo-quarters',quarterRows);if(live)compare('quarter',quarterRows);quarterChanged();toast(live?'분기 목표 변경을 전송합니다.':'분기 목표를 예시 모드에 저장했어요')};
byId('m-export').onclick=()=>{const data={exportedAt:new Date().toISOString(),mode:live?'live':'demo',work:window.orbitWorkbench.getState(),performance:records,memos,events,quarters:quarterRows,queue};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='merry-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
// Memo library uses the existing Notion collection and preserves memo bodies.
if(!Array.isArray(memos)){const old=local.get('orbit-prototype-note-v1','');memos=old?[{id:crypto.randomUUID(),title:'기존 메모',content:old,color:''}]:[];memoStore()}
let memoSearch='',memoTimer;
const notesView=byId('view-notes');
notesView.innerHTML=`<section class="m-memo-library"><div class="m-memo-toolbar"><div><h2>내 메모 <span id="m-memo-count"></span></h2><p>저장한 메모를 한눈에 확인하세요.</p></div><button class="btn primary" id="m-memo-add">＋ 메모</button></div><input class="m-input m-memo-search" id="m-memo-search" type="search" placeholder="제목이나 내용으로 검색" aria-label="메모 검색"><div class="m-memo-list" id="m-memo-list"></div></section><section class="card emptycard" id="m-memo-editor" hidden><div class="m-memo-header"><button class="btn" id="m-memo-back">← 메모 목록</button><button class="btn" id="m-memo-delete">메모 삭제</button></div><input class="m-input" id="m-memo-title" maxlength="150" placeholder="메모 제목" aria-label="메모 제목" style="width:100%;margin-bottom:16px"><label for="note" class="quiet">메모 내용</label><textarea id="note" class="notesarea" placeholder="기억할 내용을 적어두세요."></textarea><p class="quiet" id="notestatus" role="status" style="margin-top:10px"></p></section>`;
function memoListHTML(items,query,escape){const q=query.trim().toLocaleLowerCase();return items.filter(m=>[m.title,m.content].some(v=>String(v||'').toLocaleLowerCase().includes(q))).map(m=>`<button class="m-memo-card" data-open-memo="${escape(m.id)}"><strong>${escape(m.title||'(제목 없음)')}</strong><span>${escape(String(m.content||'내용이 없는 메모예요.').slice(0,180))}</span><small>메모 열기 →</small></button>`).join('')||`<p class="m-memo-empty">${q?'검색 결과가 없어요.':'저장한 메모가 없어요. ＋ 메모로 첫 메모를 적어보세요.'}</p>`}
function renderMemoList(){byId('m-memo-count').textContent=`${memos.length}개`;byId('m-memo-list').innerHTML=memoListHTML(memos,memoSearch,safe)}
function renderMemosLive(){if(activeMemo&&!memos.some(m=>m.id===activeMemo))activeMemo=null;const m=memos.find(m=>m.id===activeMemo);notesView.querySelector('.m-memo-library').hidden=!!m;byId('m-memo-editor').hidden=!m;renderMemoList();byId('m-memo-title').value=m?.title||'';byId('note').value=m?.content||'';byId('note').disabled=!m;byId('m-memo-title').disabled=!m;byId('notestatus').textContent=m?(live?statusFor('memo',m.id):'브라우저에 저장됨'):''}
function flushMemo(){clearTimeout(memoTimer);if(live&&connectionReady()&&writeOwner)compare('memo',memos)}
function scheduleMemo(){if(live&&!connectionReady()){renderMemosLive();toast('노션 연결과 불러오기를 완료한 후 수정해 주세요.');return}if(live&&!writeOwner){renderMemosLive();readonlyNotice();return}const m=memos.find(m=>m.id===activeMemo);if(!m)return;m.title=byId('m-memo-title').value;m.content=byId('note').value;const saved=memoStore();renderMemoList();clearTimeout(memoTimer);byId('notestatus').textContent=saved?(live?'브라우저에 보관됨 · 노션 전송 대기':'브라우저에 저장됨'):'브라우저 저장 실패';if(live)memoTimer=setTimeout(()=>{flushMemo();byId('notestatus').textContent=statusFor('memo',m.id)},500)}
byId('note').oninput=scheduleMemo;byId('m-memo-title').oninput=scheduleMemo;
byId('m-memo-search').oninput=e=>{memoSearch=e.target.value;renderMemoList()};
byId('m-memo-list').onclick=e=>{const b=e.target.closest('[data-open-memo]');if(!b)return;flushMemo();activeMemo=b.dataset.openMemo;renderMemosLive();byId('m-memo-title').focus()};
byId('m-memo-back').onclick=()=>{flushMemo();activeMemo=null;renderMemosLive();byId('m-memo-search').focus()};
byId('m-memo-add').onclick=()=>{flushMemo();const m={id:crypto.randomUUID(),title:'새 메모',content:'',color:''};memos.unshift(m);activeMemo=m.id;memoStore();if(live)compare('memo',memos);renderMemosLive();byId('m-memo-title').focus()};
byId('m-memo-delete').onclick=()=>{if(!activeMemo||!confirm(live?'선택한 메모를 노션 보관함으로 이동할까요?':'선택한 메모를 삭제할까요?'))return;flushMemo();memos=memos.filter(m=>m.id!==activeMemo);activeMemo=null;memoStore();if(live)compare('memo',memos);renderMemosLive()};
// Month/week calendar and selected-day agenda; dates remain compatible with Notion.
let calendarSelected=calendarISO(now),calendarMode='month',calendarSearch='';
function calendarISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function calendarDays(y,m,mode,selected){const first=mode==='week'?new Date(selected+'T12:00:00'):new Date(y,m,1,12);first.setDate(first.getDate()-first.getDay());const count=mode==='week'?7:Math.ceil((new Date(y,m,1).getDay()+new Date(y,m+1,0).getDate())/7)*7;return Array.from({length:count},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i,12))}
function calendarEventsOn(items,date){return items.filter(e=>e.date<=date&&(e.end||e.date)>=date)}
function calendarRange(a,b){return a<=b?{start:a,end:b}:{start:b,end:a}}
function calendarWeekSegments(items,days){const weeks=[],preferred=new Map(),ordered=[...items].sort((a,b)=>a.date.localeCompare(b.date)||(b.end||b.date).localeCompare(a.end||a.date)||String(a.id).localeCompare(String(b.id)));for(let offset=0;offset<days.length;offset+=7){const dates=days.slice(offset,offset+7),occupied=[],segments=[];for(const event of ordered){const end=event.end||event.date;if(event.date>dates.at(-1)||end<dates[0])continue;const start=dates.findIndex(d=>d>=event.date),finish=dates.findLastIndex(d=>d<=end);if(start<0||finish<start)continue;const mask=Array.from({length:finish-start+1},(_,i)=>start+i);let lane=preferred.get(event.id)??0;const fits=i=>!occupied[i]||mask.every(col=>!occupied[i][col]);if(!fits(lane)){lane=0;while(!fits(lane))lane++}if(!occupied[lane])occupied[lane]=Array(7).fill(false);mask.forEach(col=>occupied[lane][col]=true);preferred.set(event.id,lane);segments.push({event,start,span:finish-start+1,lane,continuesBefore:event.date<dates[0],continuesAfter:end>dates.at(-1)})}weeks.push({dates,segments,lanes:Math.max(1,occupied.length)})}return weeks}

function calendarColor(event){const colors=['#8357e8','#ed8d3e','#6578cb','#329a82','#7d899a'];let n=0;for(const c of (event.tags||[]).join(',')||event.id)n=(n+c.charCodeAt(0))%colors.length;return colors[n]}
const calendarCard=byId('view-calendar').querySelector('.card');calendarCard.classList.add('m-calendar-card');calendarCard.querySelector('.cardtitle').textContent='나의 일정';byId('calendargrid').className='m-cal-grid';byId('calendargrid').parentElement.classList.add('m-cal-scroll');
byId('calendargrid').parentElement.insertAdjacentHTML('beforebegin',`<div class="m-cal-toolbar"><button id="m-month-prev" class="m-cal-period-nav" aria-label="이전 기간">‹</button><h2 id="m-month-label"></h2><button id="m-month-next" class="m-cal-period-nav" aria-label="다음 기간">›</button></div><div class="m-cal-controls"><div class="m-cal-segment" aria-label="캘린더 보기"><button data-calendar-mode="month">월</button><button data-calendar-mode="week">주</button></div><div class="m-cal-actions"><input class="m-input" id="m-event-search" type="search" aria-label="일정 검색" placeholder="일정 검색"><button id="m-calendar-today">오늘</button><button id="m-event-add" aria-label="일정 추가">＋</button></div></div><p id="m-cal-selection-status" class="m-cal-selection-status" aria-live="polite">날짜 클릭으로 하루 일정 · 드래그로 여러 날 일정 추가</p><div class="m-cal-weekdays">${['일','월','화','수','목','금','토'].map((d,i)=>`<span class="${i===0?'sun':i===6?'sat':''}">${d}</span>`).join('')}</div>`);
byId('calendargrid').parentElement.insertAdjacentHTML('afterend','<section class="m-cal-agenda" aria-label="선택한 날짜의 일정"><div class="m-cal-agenda-head"><h3 id="m-agenda-label"></h3><span id="m-agenda-count"></span></div><div id="m-agenda-list"></div><button class="m-cal-add-row" id="m-agenda-add">＋ 이 날짜에 일정 추가</button></section>');
function moveCalendar(step){if(calendarMode==='week'){const d=new Date(calendarSelected+'T12:00:00');d.setDate(d.getDate()+7*step);calendarSelected=calendarISO(d);calendarDate=new Date(d.getFullYear(),d.getMonth(),1)}else{calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+step,1);const day=Math.min(Number(calendarSelected.slice(8)),new Date(calendarDate.getFullYear(),calendarDate.getMonth()+1,0).getDate());calendarSelected=calendarISO(new Date(calendarDate.getFullYear(),calendarDate.getMonth(),day))}renderEvents()}
byId('m-month-prev').onclick=()=>moveCalendar(-1);byId('m-month-next').onclick=()=>moveCalendar(1);byId('m-calendar-today').onclick=()=>{calendarSelected=calendarISO(new Date());calendarDate=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderEvents()};byId('m-event-add').onclick=()=>openEvent();byId('m-agenda-add').onclick=()=>openEvent();
byId('m-event-search').oninput=()=>{calendarSearch=byId('m-event-search').value.trim();renderEvents()};
let calendarRangeDrag=null,calendarSuppressClickUntil=0;
function clearCalendarRange(){calendarRangeDrag=null;byId('calendargrid').classList.remove('m-cal-selecting');byId('calendargrid').querySelectorAll('.in-range').forEach(el=>el.classList.remove('in-range'));byId('m-cal-selection-status').textContent='날짜 클릭으로 하루 일정 · 드래그로 여러 날 일정 추가'}
byId('calendargrid').addEventListener('pointerdown',e=>{const day=e.target.closest('[data-cal-date]');if(!day||e.button!==0)return;calendarRangeDrag={start:day.dataset.calDate,end:day.dataset.calDate,x:e.clientX,y:e.clientY,id:e.pointerId,moved:false}});
byId('calendargrid').addEventListener('pointermove',e=>{const drag=calendarRangeDrag;if(!drag)return;const distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);if(!drag.moved&&distance<5)return;if(!drag.moved){drag.moved=true;byId('calendargrid').setPointerCapture(drag.id);byId('calendargrid').classList.add('m-cal-selecting')}const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cal-date]');if(cell)drag.end=cell.dataset.calDate;const range=calendarRange(drag.start,drag.end);byId('calendargrid').querySelectorAll('[data-cal-date]').forEach(el=>el.classList.toggle('in-range',el.dataset.calDate>=range.start&&el.dataset.calDate<=range.end));byId('m-cal-selection-status').textContent=`${range.start} ~ ${range.end} · 놓으면 일정 추가`;e.preventDefault()});
byId('calendargrid').addEventListener('pointerup',e=>{const drag=calendarRangeDrag;if(!drag)return;if(!drag.moved){calendarRangeDrag=null;return}const range=calendarRange(drag.start,drag.end);calendarSuppressClickUntil=performance.now()+500;clearCalendarRange();calendarSelected=range.start;const date=new Date(range.start+'T12:00:00');calendarDate=new Date(date.getFullYear(),date.getMonth(),1);renderEvents();openEvent(null,range)});
byId('calendargrid').addEventListener('pointercancel',clearCalendarRange);document.addEventListener('keydown',e=>{if(e.key==='Escape')clearCalendarRange()});

calendarCard.addEventListener('click',e=>{if(performance.now()<calendarSuppressClickUntil){e.preventDefault();return}const mode=e.target.closest('[data-calendar-mode]'),day=e.target.closest('[data-cal-date]'),event=e.target.closest('[data-event]');if(mode){calendarMode=mode.dataset.calendarMode;renderEvents()}else if(event)openEvent(event.dataset.event);else if(day){calendarSelected=day.dataset.calDate;const d=new Date(calendarSelected+'T12:00:00');calendarDate=new Date(d.getFullYear(),d.getMonth(),1);renderEvents();openEvent(null,{start:calendarSelected,end:calendarSelected})}});
document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="m-event-modal" role="dialog" aria-modal="true" aria-labelledby="m-event-title"><form class="modal" id="m-event-form"><div class="m-event-sheet-top"><button class="m-cal-textbutton" type="button" id="m-event-cancel">취소</button><h2 id="m-event-title">새로운 일정</h2><button class="m-cal-textbutton" type="submit">저장</button></div><label class="field">일정 이름<input id="m-event-name" required maxlength="150" placeholder="일정 제목"></label><p class="m-cal-all-day">종일 일정</p><label class="field">시작일<input id="m-event-date" required type="date"></label><label class="field">종료일 (여러 날 일정)<input id="m-event-end" type="date"></label><label class="field">태그<input id="m-event-tags" maxlength="100" placeholder="쉼표로 구분 · 미팅, 촬영"></label><button class="m-cal-delete" type="button" id="m-event-delete">일정 삭제</button></form></div>`);
byId('m-event-cancel').onclick=()=>byId('m-event-modal').classList.remove('open');byId('m-event-modal').onclick=e=>{if(e.target===byId('m-event-modal'))byId('m-event-modal').classList.remove('open')};document.addEventListener('keydown',e=>{if(e.key==='Escape')byId('m-event-modal').classList.remove('open')});
function saveCalendarEvents(){local.set(live?'merry-live-events':'merry-demo-events',events);if(live)compare('events',events)}
byId('m-event-form').onsubmit=e=>{e.preventDefault();if(live&&!connectionReady())return;const item={id:eventEditing||crypto.randomUUID(),title:byId('m-event-name').value.trim(),date:byId('m-event-date').value,end:byId('m-event-end').value,tags:byId('m-event-tags').value.split(',').map(s=>s.trim()).filter(Boolean).slice(0,10)};if(!item.title)return;if(item.end&&item.end<item.date){toast('종료일을 확인해 주세요.');return}const i=events.findIndex(x=>x.id===item.id);if(i>=0)events[i]=item;else events.push(item);calendarSelected=item.date;const d=new Date(item.date+'T12:00:00');calendarDate=new Date(d.getFullYear(),d.getMonth(),1);saveCalendarEvents();renderEvents();byId('m-event-modal').classList.remove('open');toast(live?'일정 변경을 노션으로 전송합니다.':'예시 일정을 브라우저에 저장했어요')};
byId('m-event-delete').onclick=()=>{if(live&&!connectionReady())return;if(!eventEditing||!confirm(live?'이 일정을 노션 보관함으로 이동할까요?':'이 예시 일정을 삭제할까요?'))return;events=events.filter(x=>x.id!==eventEditing);saveCalendarEvents();renderEvents();byId('m-event-modal').classList.remove('open')};
function openEvent(id,range){if(live&&!connectionReady()){navigate('settings');toast('먼저 노션 연결을 확인해 주세요.');return}eventEditing=id||null;const v=events.find(x=>x.id===id);byId('m-event-title').textContent=v?'일정 편집':'새로운 일정';byId('m-event-name').value=v?.title||'';byId('m-event-date').value=v?.date||range?.start||calendarSelected;byId('m-event-end').value=v?.end||(range&&range.end!==range.start?range.end:'');byId('m-event-tags').value=(v?.tags||[]).join(', ');byId('m-event-delete').hidden=!v;byId('m-event-modal').classList.add('open');byId('m-event-name').focus()}
function renderEvents(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),today=calendarISO(new Date()),query=calendarSearch.toLocaleLowerCase(),filtered=events.filter(e=>!query||(e.title+' '+(e.tags||[]).join(' ')).toLocaleLowerCase().includes(query));byId('m-month-label').textContent=`${y}년 ${m+1}월`;calendarCard.querySelectorAll('[data-calendar-mode]').forEach(b=>{const on=b.dataset.calendarMode===calendarMode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});const days=calendarDays(y,m,calendarMode,calendarSelected),dates=days.map(calendarISO),weeks=calendarWeekSegments(filtered,dates);byId('calendargrid').innerHTML=weeks.map(week=>`<div class="m-cal-week" style="grid-template-rows:44px repeat(${week.lanes},26px) 10px">${week.dates.map((iso,col)=>{const d=new Date(iso+'T12:00:00'),selected=iso===calendarSelected;return `<button class="m-cal-day ${selected?'selected':''} ${iso===today?'today':''} ${d.getMonth()!==m?'outside':''} ${d.getDay()===0?'sun':d.getDay()===6?'sat':''}" style="grid-column:${col+1};grid-row:1 / -1" data-cal-date="${iso}" aria-label="${d.toLocaleDateString('ko-KR')} 일정 추가" aria-pressed="${selected}"><span class="m-cal-number">${d.getDate()}</span></button>`}).join('')}${week.segments.map(seg=>`<button class="m-cal-event-bar ${seg.continuesBefore?'continues-before':''} ${seg.continuesAfter?'continues-after':''}" data-event="${safe(seg.event.id)}" style="grid-column:${seg.start+1} / span ${seg.span};grid-row:${seg.lane+2};--event-color:${calendarColor(seg.event)}" aria-label="${safe(seg.event.title)} ${seg.event.date}부터 ${seg.event.end||seg.event.date}까지 일정 편집">${safe(seg.event.title)}</button>`).join('')}</div>`).join('');const rows=(query?filtered:calendarEventsOn(filtered,calendarSelected)).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));byId('m-agenda-label').textContent=query?'검색 결과':new Date(calendarSelected+'T12:00:00').toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'});byId('m-agenda-count').textContent=rows.length+'개 일정';byId('m-agenda-list').innerHTML=rows.length?rows.map(ev=>`<button class="m-cal-event-row" data-event="${safe(ev.id)}" style="--event-color:${calendarColor(ev)}"><span class="m-cal-event-time">종일${ev.end&&ev.end!==ev.date?'<small>여러 날</small>':''}</span><span class="m-cal-event-body"><strong>${safe(ev.title)}</strong><small>${safe(query?ev.date+((ev.end&&ev.end!==ev.date)?' ~ '+ev.end:''):(ev.tags||[]).join(' · ')||'나의 일정')}</small></span><span class="m-cal-chevron">›</span></button>`).join(''):`<div class="m-cal-empty">${query?'검색된 일정이 없어요.':'등록된 일정이 없어요.'}</div>`;byId('m-agenda-add').hidden=!!query}
window.merryEventsRender=renderEvents;

byId('addbtn').onclick=()=>page==='overview'?window.orbitWorkbench.addTask():page==='calendar'?openEvent():page==='notes'?byId('m-memo-add').click():openEdit();
const originalNavigate=navigate;navigate=function(p){originalNavigate(p);if(p==='settings')byId('pagesub').textContent='테마와 노션 연결, 저장 상태를 관리하세요.';if(p==='notes'){flushMemo();activeMemo=null;renderMemosLive();byId('pagesub').textContent='저장한 메모를 찾아보고 이어서 기록하세요.';byId('addbtn').textContent='＋ 메모 추가';}if(p==='calendar'){window.scrollTo(0,0);byId('addbtn').textContent='＋ 일정 추가';byId('pagesub').textContent='날짜를 선택하고 그날의 일정을 확인하세요.'}paint()};
if(live){byId('m-login').textContent='로그인하고 노션 연결 확인';document.querySelector('.demo').textContent='실제 데이터 · 노션 연동';document.querySelector('.footnote').textContent='merry · 개인 워크스페이스';document.querySelector('.eyebrow').textContent='MY WORKSPACE';const reviewNotice=byId('view-performance').querySelector('.notice');reviewNotice.querySelector('div').innerHTML='<strong>예상과 확정을 구분해 관리하세요.</strong><br>기간 미지정 기록은 목록에만 표시하며, 날짜를 넣으면 분기 합계에 포함됩니다.'}
if(live){syncUI=paint;byId('retry').onclick=()=>byId('m-retry').click()}
setBaseline();quarterChanged();renderMemosLive();
(async()=>{await ownerReady;try{const status=await api('status');authorized=!!status.authenticated;byId('m-connect-status').textContent=!status.configured?'서버 환경변수 설정이 필요합니다. 배포 안내를 확인해 주세요.':authorized?'로그인되어 있습니다.':'비밀번호를 입력해 로그인해 주세요.';if(live&&authorized){await pull();await drain()}if(live&&!authorized){navigate('settings')}}catch(e){byId('m-connect-status').textContent=e.message;lastError=live?e.message:'';if(live)navigate('settings')}paint()})();
window.addEventListener('online',()=>drain());setInterval(()=>{if(!live||!authorized||document.hidden||document.querySelector('.overlay.open'))return;if(queue.length)drain();else pull().catch(e=>{lastError=e.message;paint()})},60000);
window.addEventListener('pagehide',()=>{if(live&&activeMemo){memoStore();compare('memo',memos)}});
})();

/* Sheet shortcuts: links open externally; checkmarks are browser-local manual records. */
(()=>{
'use strict';
const SHEET_SEED=[
 {
  "id": "pa",
  "name": "PA 현황 시트",
  "document": "빌바 PA Staretgy",
  "group": "daily",
  "cadence": "daily",
  "url": "https://docs.google.com/spreadsheets/d/16pgJqD5cCePczI0qa2iWv-ibA3nhL1ATwMP9fyl7Xlk/edit?gid=2104225080#gid=2104225080"
 },
 {
  "id": "align",
  "name": "얼라인랩 PPL 리스트업 현황 시트",
  "document": "얼라인랩 크리에이터 리스트업",
  "group": "daily",
  "cadence": "daily",
  "url": "https://docs.google.com/spreadsheets/d/1BV69wF_baZRcIpCTaMrWWOqrTBUT49jRSF4yjDW3mHw/edit?gid=237646180#gid=237646180"
 },
 {
  "id": "raw",
  "name": "4분기 Raw Data · PPL 성과 입력",
  "document": "[2026]BM_board_4Q",
  "group": "priority",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1M_VQfFoNmYFeIHTTcPkeQnYyMI-8w2-pj9MTH3cW6uI/edit?gid=231909546#gid=231909546"
 },
 {
  "id": "agency",
  "name": "대행사 공유 시트",
  "document": "OLIT × SHOCK | 협업 프로세스",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1wGulv_e68HKRaQHulDVOr6tcq_8Q7vaGOyNe-yLeI0A/edit?gid=1774741724#gid=1774741724"
 },
 {
  "id": "list",
  "name": "일반 리스트업 시트",
  "document": "BM_LiST",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1bSHAAhtdGIEFT75PyZ6TSvmiOdaJO7NORcjWQ2CccFI/edit?gid=1947363722#gid=1947363722"
 },
 {
  "id": "utm",
  "name": "UTM 설정 시트",
  "document": "BM_UTM 설정",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1iiLpkXzphrzmXcnIvecSDi44n4VzXROIubVWhDfNCdA/edit?gid=0#gid=0"
 },
 {
  "id": "price",
  "name": "가격 업데이트 시트",
  "document": "[올릿] 세일즈 통합 시트",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1_OzQa4vB0BURz47rWCcYduiMNH0_KZj_8AOFEf1m2-Y/edit?pli=1&gid=1772747149#gid=1772747149"
 },
 {
  "id": "kpi",
  "name": "KPI 확인 시트",
  "document": "[2026] BM_수익성 검토",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1X7I1R8OFLcqEbHRNHD1DMh_SZFkgjQbeT9PfshHVuIA/edit?gid=1361488931#gid=1361488931"
 },
 {
  "id": "pplguide",
  "name": "PPL 가이드 시트",
  "document": "BM_product PPL guide",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1LjifkuKSqU8ncZq9ZaNI9b7ipPO3L3HW7YxE4c-_CjY/edit?gid=1443284822#gid=1443284822"
 },
 {
  "id": "paguide",
  "name": "PA 가이드 시트",
  "document": "빌바 PA 릴스 가이드(261020)",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1sOcSVaXIycjQabnu-O3QA8qtdLlH-2EMZjoFjdG2Bdg/edit?gid=247364514#gid=247364514"
 },
 {
  "id": "scmcx",
  "name": "공동구매 · SCM / CX 공유시트",
  "document": "공동구매_ SCM / CX 공유시트",
  "group": "work",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1HqeGtjNClVT3guK2dDwEaRNqCb7tCzdapYvVuegoFFY/edit?gid=714857170#gid=714857170"
 },
 {
  "id": "kpi4q",
  "name": "4Q 빌바 KPI 산정",
  "document": "4Q 빌바 KPI 산정",
  "group": "reference",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/119LjQMAsnUC_mINaH5F7z41aWjlYB7HXol4EfLwyn5o/edit?gid=182698085#gid=182698085"
 },
 {
  "id": "promo",
  "name": "빌바 2026년 4분기 프로모션",
  "document": "빌바_2026Y_4Q 프로모션",
  "group": "reference",
  "cadence": "none",
  "url": "https://docs.google.com/spreadsheets/d/1QVNHv5f-xtaklJqCeffUzRfU3HE04DBwaL1nNsm4whQ/edit?gid=7626663#gid=7626663"
 }
];
const GROUPS={daily:'매일 업데이트',priority:'가장 중요한 시트',work:'업무용 시트',reference:'참고용 시트'};
const storageKey=window.MERRY_LIVE?'merry-sheet-hub-v1':'merry-sheet-hub-demo-v1',byId=id=>document.getElementById(id),safe=esc;
function sheetDate(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
function sheetURL(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='docs.google.com'&&/^\/spreadsheets\/d\/[A-Za-z0-9_-]+\/edit$/.test(u.pathname)?u.href:null}catch{return null}}
function sheetDone(item,today){return Array.isArray(item.completed)&&item.completed.includes(today)}
function sheetToggle(items,id,today){return items.map(item=>item.id!==id?item:{...item,completed:sheetDone(item,today)?item.completed.filter(d=>d!==today):[...(item.completed||[]),today]})}
function sheetMatches(item,query,filter){return (filter==='all'||item.group===filter)&&`${item.name} ${item.document}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())}
function normalizeSheet(item){if(!item||typeof item.id!=='string'||typeof item.name!=='string'||!item.name.trim()||!sheetURL(item.url))return null;return {id:item.id,name:item.name.slice(0,150),document:String(item.document||'').slice(0,150),url:sheetURL(item.url),group:Object.hasOwn(GROUPS,item.group)?item.group:'work',cadence:item.cadence==='daily'?'daily':'none',completed:Array.isArray(item.completed)?[...new Set(item.completed.filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)))]:[]}}
let items=SHEET_SEED.map(item=>({...item,completed:[]})),query='',filter='all',editing=null;
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(saved))items=saved.map(normalizeSheet).filter(Boolean)}catch{}
function store(next){try{localStorage.setItem(storageKey,JSON.stringify(next));items=next;return true}catch{toast('저장 공간을 확인해 주세요. 변경을 저장하지 못했어요.');return false}}
const view=byId('view-sheets');
view.innerHTML=`<div class="sh-today" id="sh-today"></div><section class="sh-priority-section" aria-label="가장 중요한 시트"><h2>가장 중요한 시트</h2><div id="sh-priority"></div></section><section class="sh-library"><div class="sh-section-head"><div><h2>전체 시트 <span id="sh-count"></span></h2><p>자주 쓰는 링크를 용도별로 모아뒀어요.</p></div><button class="btn" id="sh-add">＋ 시트 추가</button></div><div class="sh-tools"><input id="sh-search" class="m-input" type="search" placeholder="시트 이름이나 문서명으로 검색" aria-label="업무 시트 검색"><div class="sh-filters" id="sh-filters" role="group" aria-label="시트 분류"></div></div><div class="sh-grid" id="sh-list"></div></section><p class="sh-storage">완료 체크와 목록 수정은 이 브라우저에 저장돼요 · 다른 기기와 자동 동기화되지 않아요.</p>`;
document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="sh-modal" role="dialog" aria-modal="true" aria-labelledby="sh-editor-title"><form class="modal sh-editor" id="sh-form"><h2 id="sh-editor-title">시트 추가</h2><label class="field">시트 이름<input id="sh-name" maxlength="150" required></label><label class="field">원래 문서명<input id="sh-document" maxlength="150"></label><label class="field">구글 시트 링크<input id="sh-url" type="url" required placeholder="https://docs.google.com/spreadsheets/d/…/edit"></label><label class="field">분류<select id="sh-group">${Object.entries(GROUPS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="field">업데이트 주기<select id="sh-cadence"><option value="none">정기 체크 없이 링크만 보관</option><option value="daily">매일 업데이트 체크</option></select></label><p class="sh-editor-help">분류와 업데이트 주기는 각각 바꿀 수 있어요.</p><div class="modalactions"><button type="button" class="btn" id="sh-cancel">취소</button><button class="btn primary" type="submit">저장</button></div></form></div>`);
function link(item,label='시트 열기 ↗'){return `<a class="sh-open" href="${safe(sheetURL(item.url)||'#')}" target="_blank" rel="noopener noreferrer" aria-label="${safe(item.name)} 새 탭에서 열기">${label}</a>`}
function lastUpdated(item){const last=[...(item.completed||[])].sort().at(-1);return last?`마지막 완료 ${safe(last.replaceAll('-','.'))}`:'아직 완료 기록 없음'}
function card(item,today){return `<article class="sh-card"><div class="sh-card-label"><span class="sh-badge ${item.group==='priority'?'priority':''}">${GROUPS[item.group]}</span>${item.cadence==='daily'?'<span class="sh-frequency">매일 체크</span>':''}<button class="sh-edit" data-sheet-edit="${safe(item.id)}" aria-label="${safe(item.name)} 설정 수정">설정</button></div><h3>${safe(item.name)}</h3><p class="sh-document">${safe(item.document)}</p><div class="sh-card-footer">${link(item)}${item.cadence==='daily'?`<span class="sh-mini-status">${sheetDone(item,today)?'✓ 오늘 완료':'오늘 업데이트 필요'}</span>`:''}</div></article>`}
function renderSheets(){const today=sheetDate(),daily=items.filter(item=>item.cadence==='daily'),done=daily.filter(item=>sheetDone(item,today)).length,priority=items.filter(item=>item.group==='priority');byId('sh-today').innerHTML=`<div class="sh-section-head"><div><span class="sh-overline">${today.replaceAll('-','.')} · 매일 체크</span><h2>오늘 업데이트할 시트</h2><p>시트를 수정한 뒤 완료를 눌러주세요.</p></div><span class="sh-progress">${done}<small> / ${daily.length} 완료</small></span></div><div class="sh-daily-list">${daily.map(item=>`<article class="sh-daily ${sheetDone(item,today)?'is-done':''}"><span class="sh-daily-icon" aria-hidden="true">${sheetDone(item,today)?'✓':'↗'}</span><div><h3>${safe(item.name)}</h3><p>${safe(item.document)}</p><small>${lastUpdated(item)}</small></div><div class="sh-daily-actions">${link(item)}<button class="sh-complete ${sheetDone(item,today)?'is-done':''}" data-sheet-done="${safe(item.id)}" aria-pressed="${sheetDone(item,today)}">${sheetDone(item,today)?'✓ 오늘 완료 · 취소':'오늘 업데이트 완료'}</button></div></article>`).join('')||'<p class="sh-empty">매일 체크할 시트가 없어요. 시트 설정에서 주기를 바꿀 수 있어요.</p>'}</div>`;byId('sh-priority').innerHTML=priority.map(item=>`<article class="sh-priority"><div><span class="sh-badge priority">최우선</span><h3>${safe(item.name)}</h3><p>${safe(item.document)}</p></div><div class="sh-priority-actions">${link(item)}<button class="sh-edit" data-sheet-edit="${safe(item.id)}" aria-label="${safe(item.name)} 설정 수정">설정</button></div></article>`).join('');view.querySelector('.sh-priority-section').hidden=!priority.length;byId('sh-count').textContent=`${items.length}개`;byId('sh-filters').innerHTML=[['all','전체'],...Object.entries(GROUPS)].map(([key,name])=>`<button class="${filter===key?'active':''}" data-sheet-filter="${key}" aria-pressed="${filter===key}">${name} <span>${items.filter(item=>key==='all'||item.group===key).length}</span></button>`).join('');byId('sh-list').innerHTML=items.filter(item=>sheetMatches(item,query,filter)).map(item=>card(item,today)).join('')||'<p class="sh-empty">조건에 맞는 시트가 없어요.</p>'}
function openSheetEditor(id=null){editing=id;const item=items.find(item=>item.id===id);byId('sh-editor-title').textContent=item?'시트 설정 수정':'시트 추가';byId('sh-name').value=item?.name||'';byId('sh-document').value=item?.document||'';byId('sh-url').value=item?.url||'';byId('sh-group').value=item?.group||'work';byId('sh-cadence').value=item?.cadence||'none';byId('sh-modal').classList.add('open');byId('sh-name').focus()}
function closeSheetEditor(){byId('sh-modal').classList.remove('open');const target=editing?view.querySelector(`[data-sheet-edit="${CSS.escape(editing)}"]`):byId('sh-add');(target||byId('sh-add')).focus()}
view.addEventListener('click',event=>{const done=event.target.closest('[data-sheet-done]'),edit=event.target.closest('[data-sheet-edit]'),group=event.target.closest('[data-sheet-filter]');if(done){if(store(sheetToggle(items,done.dataset.sheetDone,sheetDate())))renderSheets()}else if(edit)openSheetEditor(edit.dataset.sheetEdit);else if(group){filter=group.dataset.sheetFilter;renderSheets()}});
byId('sh-add').onclick=()=>openSheetEditor();byId('sh-cancel').onclick=closeSheetEditor;byId('sh-search').oninput=event=>{query=event.target.value;renderSheets()};
byId('sh-form').onsubmit=event=>{event.preventDefault();const url=sheetURL(byId('sh-url').value.trim());if(!url){toast('구글 스프레드시트의 전체 링크를 넣어주세요.');return}const previous=items.find(item=>item.id===editing),item=normalizeSheet({id:editing||crypto.randomUUID(),name:byId('sh-name').value.trim(),document:byId('sh-document').value.trim(),url,group:byId('sh-group').value,cadence:byId('sh-cadence').value,completed:previous?.completed||[]});if(!item)return;if(store(previous?items.map(old=>old.id===editing?item:old):[...items,item])){renderSheets();closeSheetEditor();toast('시트 목록을 이 브라우저에 저장했어요.')}};
byId('sh-modal').onclick=event=>{if(event.target===byId('sh-modal'))closeSheetEditor()};
document.addEventListener('keydown',event=>{if(!byId('sh-modal').classList.contains('open'))return;if(event.key==='Escape'){event.preventDefault();closeSheetEditor()}if(event.key==='Tab'){const elements=[...byId('sh-form').querySelectorAll('input,select,button')],first=elements[0],last=elements.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
window.addEventListener('storage',event=>{if(event.key!==storageKey||byId('sh-modal').classList.contains('open'))return;try{const saved=JSON.parse(event.newValue);if(Array.isArray(saved)){items=saved.map(normalizeSheet).filter(Boolean);renderSheets()}}catch{}});
const beforeSheetsNavigate=navigate;navigate=function(p){beforeSheetsNavigate(p);if(p==='sheets'){byId('pagesub').textContent='오늘 업데이트할 시트부터 자주 쓰는 링크까지, 한곳에서.';renderSheets();window.scrollTo(0,0)}};
renderSheets();document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderSheets()});setInterval(()=>{if(page==='sheets')renderSheets()},60000);
})();
