// drag.js — Kéo thả món vào khay
/* ---------- Kéo thả món vào khay ---------- */
let drag=null;
function overKhay(x,y){const k=$('#khay');if(!k)return false;const r=k.getBoundingClientRect();return x>r.left-20&&x<r.right+20&&y>r.top-20&&y<r.bottom+20}
$('#sheetBody').addEventListener('pointerdown',e=>{
  const it=e.target.closest('[data-add]'); if(!it||!cur||cur.type!=='d'||cur.done)return;
  drag={id:it.dataset.add,x0:e.clientX,y0:e.clientY,moved:false,ghost:null};
  try{it.setPointerCapture(e.pointerId)}catch(_){}
});
addEventListener('pointermove',e=>{
  if(!drag)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>6){
    drag.moved=true; const g=document.createElement('div'); g.className='drag-ghost'; g.textContent=IT[drag.id].e; document.body.appendChild(g); drag.ghost=g;
  }
  if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';const k=$('#khay');if(k)k.classList.toggle('hot',overKhay(e.clientX,e.clientY))}
});
function endDrag(e){
  if(!drag)return; const d=drag; drag=null;
  const k=$('#khay'); if(k)k.classList.remove('hot');
  if(!d.moved){addItem(d.id);return}
  if(overKhay(e.clientX,e.clientY)){d.ghost.remove();addItem(d.id)}
  else{d.ghost.classList.add('back');d.ghost.style.left=d.x0+'px';d.ghost.style.top=d.y0+'px';setTimeout(()=>d.ghost.remove(),260)}
}
addEventListener('pointerup',endDrag);
addEventListener('pointercancel',e=>{if(drag&&drag.ghost)drag.ghost.remove();drag=null});
$('#sheetBody').addEventListener('keydown',e=>{const it=e.target.closest('[data-add]');if(it&&(e.key==='Enter'||e.key===' ')){e.preventDefault();addItem(it.dataset.add)}});
