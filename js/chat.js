// chat.js — Lời chủ quán, chibi, chat với khách
/* ---------- Chat helpers ---------- */
// Chibi vẽ bằng SVG: đầu to, thân nhỏ, tay vẫy khi nói
function chibi(L,mood,role){
  const k='#1d2b36',s=`stroke="${k}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const guard=role==='guard', shirt=guard?'#2d4a8a':L.shirt, pants=guard?'#1d2b36':'#3a4a6b';
  let g=`<ellipse cx="40" cy="97" rx="20" ry="4" fill="rgba(0,0,0,.18)"/><g class="cb-all">`;
  g+=`<rect x="30" y="80" width="8" height="12" rx="3" fill="${pants}" ${s}/><rect x="42" y="80" width="8" height="12" rx="3" fill="${pants}" ${s}/>`;
  g+=`<path d="M27 93 h12 M41 93 h12" stroke="${k}" stroke-width="5" stroke-linecap="round"/>`;
  g+=`<rect x="25" y="55" width="30" height="29" rx="11" fill="${shirt}" ${s}/>`;
  if(guard)g+=`<path d="M45 61 l5 2 v5 q-2.5 3.5 -5 3.5 q-2.5 0 -5 -3.5 v-5 Z" fill="#ffd23f" stroke="${k}" stroke-width="1.6"/><path d="M30 60 q4 8 10 7" fill="none" stroke="#e9eef5" stroke-width="1.8"/><rect x="25" y="74" width="30" height="4" fill="#1d2b36"/>`;
  else g+=`<path d="M32 60 h16 v18 q-8 5 -16 0 Z" fill="#fff" stroke="${k}" stroke-width="2"/><rect x="36" y="66" width="8" height="5" rx="1.5" fill="none" stroke="${k}" stroke-width="1.6"/>`;
  g+=`<path d="M27 62 q-9 6 -7 16" fill="none" stroke="${k}" stroke-width="7" stroke-linecap="round"/><path d="M27 62 q-9 6 -7 16" fill="none" stroke="${L.skin}" stroke-width="3.5" stroke-linecap="round"/>`;
  g+=`<g class="cb-armR"><path d="M53 62 q9 -2 11 -12" fill="none" stroke="${k}" stroke-width="7" stroke-linecap="round"/><path d="M53 62 q9 -2 11 -12" fill="none" stroke="${L.skin}" stroke-width="3.5" stroke-linecap="round"/>`;
  if(guard)g+=`<path d="M63 50 l6 -4" stroke="${k}" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="45" r="3" fill="#c9d2da" stroke="${k}" stroke-width="1.6"/>`;
  else g+=`<path d="M64 50 l4 -12" stroke="${k}" stroke-width="3"/><ellipse cx="70" cy="31" rx="6" ry="8" transform="rotate(18 70 31)" fill="#fff" stroke="#ff5a7a" stroke-width="2.5"/><ellipse cx="70" cy="31" rx="7.5" ry="9.5" transform="rotate(18 70 31)" fill="none" stroke="${k}" stroke-width="1.5"/>`;
  g+=`</g><g class="cb-head">`;
  g+=`<circle cx="20" cy="34" r="4.5" fill="${L.skin}" ${s}/><circle cx="60" cy="34" r="4.5" fill="${L.skin}" ${s}/><circle cx="40" cy="33" r="21" fill="${L.skin}" ${s}/>`;
  if(guard)g+=`<path d="M18 26 Q19 10 40 9 Q61 10 62 26 Z" fill="#2d4a8a" ${s}/><rect x="16" y="23" width="48" height="7" rx="3" fill="#1d2b36" ${s}/><path d="M36 13 l4 -3 l4 3 v4 l-4 2 l-4 -2 Z" fill="#ffd23f" stroke="${k}" stroke-width="1.5"/>`;
  else g+=`<path d="M19 28 Q19 10 40 10 Q61 10 61 28 Z" fill="${L.cap||L.hair}" ${s}/><path d="M56 25 Q70 24 74 30 L58 31Z" fill="${L.cap||L.hair}" ${s}/><circle cx="40" cy="11" r="2.5" fill="${k}"/>`;
  if(mood==='angry')g+=`<path d="M29 28 l7 3 M51 28 l-7 3" stroke="${k}" stroke-width="3" stroke-linecap="round"/>`;
  g+=`<g class="cb-eyes"><ellipse cx="33" cy="35" rx="3" ry="3.8" fill="${k}"/><ellipse cx="47" cy="35" rx="3" ry="3.8" fill="${k}"/><circle cx="34" cy="33.8" r="1" fill="#fff"/><circle cx="48" cy="33.8" r="1" fill="#fff"/></g>`;
  g+=`<ellipse cx="27" cy="42" rx="4" ry="2.5" fill="#ff7b7b" opacity=".55"/><ellipse cx="53" cy="42" rx="4" ry="2.5" fill="#ff7b7b" opacity=".55"/>`;
  const idle=mood==='angry'?`<path d="M34 47 Q40 42 46 47" fill="none" stroke="${k}" stroke-width="2.6" stroke-linecap="round"/>`:mood==='meh'?`<path d="M35 46 H45" stroke="${k}" stroke-width="2.6" stroke-linecap="round"/><path d="M58 20 q4 6 0 9 q-4 -3 0 -9Z" fill="#7cc7ff" stroke="${k}" stroke-width="1.5"/>`:`<path d="M33 43 Q40 51 47 43 Z" fill="#fff" stroke="${k}" stroke-width="2.4" stroke-linejoin="round"/>`;
  g+=`<g class="m-idle">${idle}</g><g class="m-talk"><ellipse cx="40" cy="46" rx="5" ry="4.5" fill="#b8323f" stroke="${k}" stroke-width="2.2"/><ellipse cx="40" cy="48" rx="3" ry="1.6" fill="#ff8fa3"/></g>`;
  g+=`</g></g>`;
  return `<svg class="cb-svg" viewBox="0 0 80 100" aria-hidden="true">${g}</svg>`;
}
const GUARD_LOOK={skin:'#e3aa7f',hair:'#1b1b1b'};
let typeTimer=null;
function ownerSay(t){
  const el=$('#ownerSay'), cb=$('#ownerFace');
  clearInterval(typeTimer); clearTimeout(sayTimer);
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on','typing'); cb.classList.add('talk');
  const ch=[...t]; let i=0;
  const who='<span class="who">Chủ quán</span>';
  const put=x=>{el.innerHTML=who+esc(x)+(el.classList.contains('typing')?'<span class="caret">▍</span>':'')};
  const done=()=>{clearInterval(typeTimer);el.classList.remove('typing');put(t);setTimeout(()=>cb.classList.remove('talk'),250);sayTimer=setTimeout(()=>el.classList.remove('on'),4500)};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){done();return}
  put('');
  typeTimer=setInterval(()=>{i+=2;put(ch.slice(0,i).join(''));if(i>=ch.length)done()},30);
}
let gsayT=null;
function guardSay(t){
  const w=$('#guardWrap'); if(w.hidden)return;
  const gs=$('#guardSay'), gf=$('#guardFace');
  gs.textContent=t; gs.classList.remove('on'); void gs.offsetWidth; gs.classList.add('on'); gf.classList.add('alert','talk');
  clearTimeout(gsayT); gsayT=setTimeout(()=>{gs.classList.remove('on');gf.classList.remove('alert','talk')},2600);
}
function talk(c,who,t){c.chat.push({who,t,mood:who==='c'?moodOf(c):ownerMood()});if(cur===c)renderChat()}
function renderChat(){
  const el=$('#chat'), say=$('#stSay');
  if(say){say.textContent=cur&&cur.chat?lastLine(cur):'';}
  if(!cur||!cur.chat){el.style.display='none';return}
  el.style.display='flex';
  el.innerHTML=cur.chat.map((m,i)=>`<div class="msg ${m.who}${i===cur.chat.length-1?' new':''}"><div class="face">${m.who==='o'?avatar(OWNER_LOOK,m.mood):avatar(cur.look,m.mood)}</div><div class="bb">${m.t}</div></div>`).join('');
  el.scrollTop=el.scrollHeight;
}
function lastLine(c){for(let i=c.chat.length-1;i>=0;i--)if(c.chat[i].who==='c')return c.chat[i].t;return ''}
