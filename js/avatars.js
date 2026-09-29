// avatars.js — Vẽ avatar khách kiểu hoạt hình
/* ---------- Cartoon avatars ---------- */
function makeLook(name){
  const fem=/^(Chị|Cô)/.test(name), old=/^(Chú|Cô)/.test(name), male=/^(Anh|Chú)/.test(name);
  return {skin:pick(SKINS),hair:old?pick(['#8b8f94','#b4b8bd']):pick(HAIRS),
    style:fem?pick(['long','bun']):male?pick(['short','spiky']):pick(['short','spiky','long','bun']),
    shirt:pick(SHIRTS),band:Math.random()<.35?pick(BANDS):null,glasses:Math.random()<.2||(old&&Math.random()<.5)};
}
const OWNER_LOOK={skin:'#f7cda9',hair:'#2b1a12',style:'short',shirt:'#ff9f1c',cap:'#3a86ff'};
function avatar(L,mood='happy'){
  const k='#1d2b36',s=`stroke="${k}" stroke-width="3" stroke-linejoin="round"`;
  let g='';
  if(L.style==='long')g+=`<path d="M16 28 Q13 47 19 51 L45 51 Q51 47 48 28Z" fill="${L.hair}" ${s}/>`;
  g+=`<path d="M9 66 Q11 46 32 46 Q53 46 55 66Z" fill="${L.shirt}" ${s}/>`;
  if(L.cap)g+=`<path d="M24 47 L32 58 L40 47" fill="#fff" ${s}/>`;
  else g+=`<path d="M26 47 Q32 53 38 47" fill="none" ${s}/>`;
  g+=`<circle cx="17" cy="31" r="3.5" fill="${L.skin}" ${s}/><circle cx="47" cy="31" r="3.5" fill="${L.skin}" ${s}/>`;
  if(L.style==='bun')g+=`<circle cx="32" cy="12" r="6" fill="${L.hair}" ${s}/>`;
  g+=`<circle cx="32" cy="30" r="15" fill="${L.skin}" ${s}/>`;
  if(L.cap){
    g+=`<path d="M16.5 26 Q17 12 32 12 Q47 12 47.5 26 Z" fill="${L.cap}" ${s}/><path d="M44 23 Q55 22 58 27 L46 28Z" fill="${L.cap}" ${s}/><circle cx="32" cy="12" r="2" fill="${k}"/>`;
  } else if(L.style==='spiky'){
    g+=`<path d="M17 28 L17 18 L22 21 L24 12 L30 18 L34 10 L38 18 L43 13 L44 21 L47 28 Q41 21 32 22 Q23 21 17 28Z" fill="${L.hair}" ${s}/>`;
  } else {
    g+=`<path d="M17 29 Q15 13 32 13 Q49 13 47 29 Q43 20 35 22 Q27 18 17 29Z" fill="${L.hair}" ${s}/>`;
  }
  if(L.band)g+=`<path d="M17.5 24 Q32 17 46.5 24 L47 28.5 Q32 21.5 17 28.5Z" fill="${L.band}" stroke="${k}" stroke-width="2"/>`;
  if(mood==='angry')g+=`<path d="M23 25.5 L29 27.5 M41 25.5 L35 27.5" stroke="${k}" stroke-width="2.5" stroke-linecap="round"/>`;
  g+=`<circle cx="26" cy="31" r="2.3" fill="${k}"/><circle cx="38" cy="31" r="2.3" fill="${k}"/><circle cx="26.8" cy="30.2" r=".8" fill="#fff"/><circle cx="38.8" cy="30.2" r=".8" fill="#fff"/>`;
  if(L.glasses)g+=`<circle cx="26" cy="31" r="5" fill="none" stroke="${k}" stroke-width="2"/><circle cx="38" cy="31" r="5" fill="none" stroke="${k}" stroke-width="2"/><path d="M31 31 L33 31" stroke="${k}" stroke-width="2"/>`;
  g+=`<ellipse cx="21.5" cy="36.5" rx="3" ry="2" fill="#ff7b7b" opacity=".55"/><ellipse cx="42.5" cy="36.5" rx="3" ry="2" fill="#ff7b7b" opacity=".55"/>`;
  if(mood==='happy')g+=`<path d="M26 37 Q32 44 38 37 Z" fill="#fff" stroke="${k}" stroke-width="2.3" stroke-linejoin="round"/>`;
  else if(mood==='meh')g+=`<path d="M27.5 39.5 L36.5 39.5" stroke="${k}" stroke-width="2.5" stroke-linecap="round"/><path d="M47 18 q3.5 5 0 7.5 q-3.5 -2.5 0 -7.5Z" fill="#7cc7ff" stroke="${k}" stroke-width="1.6"/>`;
  else g+=`<path d="M26.5 41.5 Q32 35.5 37.5 41.5" fill="none" stroke="${k}" stroke-width="2.5" stroke-linecap="round"/><path d="M45 17 l2 -4 l2 4 l-2 4 Z" fill="#ff5d5d" stroke="${k}" stroke-width="1.4"/>`;
  return `<svg class="ava" viewBox="0 0 64 64" aria-hidden="true">${g}</svg>`;
}
// Mốc thời gian chờ: vùng xanh (còn ≥40%) 5★ · vùng vàng (15–40%) 4★ · vùng đỏ "gần hết giờ" (<15%) 2★ · hết giờ: bỏ về 1★
const Z_WARN=0.4, Z_LATE=0.15;
function moodOf(c){const p=c.pat/c.patMax;return p>=Z_WARN?'happy':p>=Z_LATE?'meh':'angry'}
function starByTime(c){const p=c.pat/c.patMax;return p>=Z_WARN?5:p>=Z_LATE?4:2}
function zoneTxt(c){const p=c.pat/c.patMax,m=Math.max(0,Math.ceil(c.pat)),cap=c.complaint?3:5;return p>=Z_WARN?`⏱ ${m}′ · ★${Math.min(cap,5)}`:p>=Z_LATE?`⏳ ${m}′ · ★${Math.min(cap,4)}`:`🔥 ${m}′ · ★2`}
function ownerMood(){return S&&S.rating<2.5?'angry':S&&S.rating<3.5?'meh':'happy'}
