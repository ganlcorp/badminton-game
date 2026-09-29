// orientation.js — Xoay màn hình: chỉnh khung tranh
/* ---------- Xoay màn hình: chỉnh khung tranh ---------- */
function fitArt(){
  const land=innerWidth>innerHeight&&innerHeight<=520;
  const sc=$('#scArt'); if(sc)sc.setAttribute('viewBox',land?'0 330 520 460':'0 0 520 860');
  const mk=document.querySelector('.mk-art'); if(mk){mk.setAttribute('viewBox',land?'0 50 520 380':'0 0 520 860');mk.setAttribute('preserveAspectRatio',land?'xMidYMid slice':'xMidYMin slice')}
}
addEventListener('resize',fitArt); addEventListener('orientationchange',()=>setTimeout(fitArt,200)); fitArt();
