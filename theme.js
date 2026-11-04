'use strict';
const StudyTheme=(()=>{
 const choices=[
  {id:'sakura',name:'벚꽃',colors:['#fff9f8','#d46e94','#ffe3ec']},
  {id:'cream',name:'크림',colors:['#faf7ef','#8c693c','#efe4cc']},
  {id:'mint',name:'민트',colors:['#f3faf7','#277c68','#cceee2']},
  {id:'sky',name:'하늘',colors:['#f3f8ff','#376ca9','#d8eaff']},
  {id:'lavender',name:'라벤더',colors:['#f8f5ff','#7955b3','#e5dafa']},
  {id:'dark',name:'다크',colors:['#17191f','#b3a0ff','#30303e']}
 ];
 let current='sakura';try{const saved=localStorage.getItem('haruharu-theme-v1');if(choices.some(x=>x.id===saved))current=saved;}catch{}
 document.documentElement.dataset.theme=current;
 function select(id){if(!choices.some(x=>x.id===id))return;current=id;document.documentElement.dataset.theme=id;let saved=true;try{localStorage.setItem('haruharu-theme-v1',id);}catch{saved=false;}
  document.querySelectorAll('[data-theme-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.themeChoice===id)));
  const label=document.getElementById('theme-feedback');if(label)label.textContent=choices.find(x=>x.id===id).name+' 테마 적용'+(saved?'':' · 기기에 저장하지 못했어요');
 }
 function ui(){return `<section class="panel theme-panel"><h2>화면 테마</h2><div class="theme-options" role="group" aria-label="테마 선택">${choices.map(x=>`<button type="button" class="theme-option" data-theme-choice="${x.id}" aria-pressed="${current===x.id}" onclick="StudyTheme.select('${x.id}')"><span class="theme-swatch" aria-hidden="true">${x.colors.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span>${x.name}</span></button>`).join('')}</div><p class="muted" id="theme-feedback" role="status" aria-live="polite">${choices.find(x=>x.id===current).name} 테마 적용</p><p class="muted">테마는 이 브라우저에 저장돼요.</p></section>`;}
 return {select,ui};
})();
