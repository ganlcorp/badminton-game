// sheet.js — Popup phục vụ khách, kho, review
/* ---------- Sheet ---------- */
function openCust(id){const c=[...S.qB,...S.qD].find(x=>x.id===id);if(!c)return;cur=c;tray={};brewing=[];resetBench();tlT0=null;buildSheet();renderChat();showSheet()}
function openKho(){cur={type:'kho'};buildSheet();renderChat();showSheet()}
function openReviews(){if(!S)return;cur={type:'rv'};buildSheet();renderChat();showSheet()}
function showSheet(){$('#backdrop').style.display='block';requestAnimationFrame(()=>$('#sheet').classList.add('open'))}
function closeSheet(){cur=null;brewing=[];resetBench();$('#sheet').classList.remove('open');$('#backdrop').style.display='none'}

function buildSheet(){
  if(!cur)return;
  const body=$('#sheetBody'), plain=cur.type==='kho'||cur.type==='rv';
  $('#sheetPatWrap').style.visibility=plain?'hidden':'visible'; $('#sheetEta').style.display=plain?'none':'';
  $('#stKn').style.display=plain?'none':''; if(plain){$('#stItems').innerHTML='';$('#stSay').textContent=''}
  $('#sheetFace').innerHTML=plain?avatar(OWNER_LOOK,ownerMood()):avatar(cur.look,moodOf(cur));
  if(cur.type==='b'){
    const r=cur,[ws,we]=win(r);
    $('#sheetTitle').textContent=r.vip?`🌟 ${r.name}`:r.name; $('#stItems').innerHTML=reqItems(r);
    body.innerHTML=`
      ${r.complaint?`<div class="cmp-note">💢 Nhân viên đặt lịch xếp nhầm vô sân ${r.complaint.court} đang có người. Xếp lại sân trống, khách chấm tối đa 3★.</div>`:''}<div class="meta cmeta">🕒 <b id="winTxt">${hm(ws)} – ${hm(we)}</b> · 💵 <b id="feeTxt">${fmt(fee(ws,we))}</b>/sân${r.count>1?` · đã xếp <b>${r.assigned.length}/${r.count}</b>`:''}</div>
      <p class="hint chint">Chạm vào <b>hàng sân trống</b> trong khung vàng để xếp. 🧹 là sân chưa dọn.</p>
      <div class="tl-scroll" id="tlScroll"></div>
      <div class="actions">
        <button class="btn warn press" data-act="decline">Báo hết sân</button>
        <button class="btn ghost press" data-act="close">Để khách chờ</button>
      </div>`;
    buildTimeline();
  } else if(cur.type==='d'){
    const o=cur;
    $('#sheetTitle').textContent=o.vip?`🌟 ${o.name}`:o.fan?`📣 ${o.name} · fan`:o.court?`${o.name} · sân ${o.court}`:`${o.name} · mang đi`;
    let sum=0; const tis=Object.entries(tray).filter(([,n])=>n>0).map(([id,n])=>{sum+=n*priceOf(id);return `<button class="ti" data-take="${id}" aria-label="Bỏ bớt ${IT[id].name}">${IT[id].e}<b>${n}</b></button>`}).join('');
    const checks=Object.entries(o.order).map(([id,n])=>{const h=tray[id]||0;return `<span class="ck ${h===n?'ok':h>n?'ck-over':''}">${IT[id].e} ${h}/${n}${h===n?' ✓':''}</span>`}).join('')
      +Object.keys(tray).filter(id=>!o.order[id]).map(id=>`<span class="ck ck-over">${IT[id].e} dư</span>`).join('');
    $('#stItems').innerHTML=checks;
    const wk=Object.keys(bench).find(k=>bench[k].busy);
    const cmpNote=o.complaint?`<div class="cmp-note">💢 Nhân viên bán nhầm${o.complaint.wrong?' '+IT[o.complaint.wrong].name.toLowerCase():''}. Làm lại đúng đơn, khách chấm tối đa 3★.</div>`:'';
    const bw=brewing.length?`${PREP_T[brewing[0].id].v}...`:wk?`${FLOW[wk].busy}...`:'';
    body.innerHTML=`
      ${cmpNote}<div class="step">${bw?`⏳ ${bw}`:trayCount()?'Đủ món thì bấm Giao':'Chạm hoặc kéo món vào khay'}</div>
      <div class="traybar">
        <div class="khay" id="khay">${tis||'<div class="ph">🍽️ Khay trống</div>'}</div>
        <div class="tb-act">
          <button class="btn press tb-give" data-act="give" ${trayCount()&&!brewing.length&&!wk?'':'disabled'}>Giao${trayCount()?`<small>${fmt(sum)}</small>`:''}</button>
          <button class="btn ghost press" data-act="clear" ${trayCount()?'':'disabled'} aria-label="Làm lại khay">↺</button>
          <button class="btn warn press" data-act="soldout" aria-label="Báo hết món">Hết</button>
        </div>
      </div>
      <div class="grid10">
        ${sit('suoi','fr')}${sit('dg','fr')}${sit('tl','fr')}${sit('tra','tr')}${sit('cau','cau')}
        ${sit('banhmi','food')}${sit('xoi','food')}${sit('chuoi','food')}${cookTile('mi','hot')}${cookTile('cf','cfz')}
      </div>
      ${cookK?cookPopHTML(cookK):''}`;
  } else if(cur.type==='kho'){
    $('#sheetTitle').textContent='Kho: mua gấp';
    body.innerHTML=`<p class="hint">Đang mở cửa thì chỉ mua gấp ở tạp hoá gần đây được, đắt hơn 30%. Lần sau nhớ nhập đủ lúc chuẩn bị đầu ngày nha.</p>`+
      ITEMS.filter(it=>S.unlocked.includes(it.id)).map(it=>`<div class="kho-row"><span class="e">${it.e}</span><div><b>${it.name}</b>${it.perish?'<span class="fresh">🕒 tươi</span>':''}<br><small>Còn ${S.stock[it.id]}, bán ${fmt(it.price)}</small></div>
      <button class="btn ghost press" data-buy="${it.id}">+${it.pack} · ${fmt(rushPrice(it.id))}</button></div>`).join('')
      +`<p class="hint">Tiền hiện có: <b>${fmt(S.money)}</b></p>`;
  } else {
    $('#sheetTitle').textContent='Review về quán';
    body.innerHTML=S.reviews.length?`<p class="hint">Tự viết phản hồi. Lời lẽ tích cực (xin lỗi, khắc phục, cảm ơn, ạ...) được cộng điểm uy tín vào sao quán (tối đa +0,3★ trong 7 ngày). Chửi hoặc cà khịa khách bị trừ ${fmt(RUDE_FINE)} và khách hạ còn 1★.</p><p class="hint">Điểm uy tín đang có: <b>+${replyBonus().toFixed(2)}★</b></p><div class="rvs">${S.reviews.map(reviewHTML).join('')}</div>`:`<p class="empty">Chưa có review nào. Hết ngày đầu tiên là dân mạng bắt đầu nhận xét đó!</p>`;
  }
}
function buildTimeline(){
  const r=cur, el=$('#tlScroll'); if(!el)return;
  const keep=el.scrollLeft;
  const t0=Math.floor(S.time/30)*30; tlT0=t0;
  const cols=Math.max(1,(CLOSE-t0)/30), tw=cols*W;
  const x=m=>(m-t0)/30*W;
  let hours='',grid='';
  for(let m=t0;m<=CLOSE;m+=30){ if(m%60===0){hours+=`<span class="hr" style="left:${x(m)}px">${m/60}h</span>`;grid+=`<i class="grid" style="left:${x(m)}px"></i>`} }
  let rows='';
  for(let c=1;c<=COURTS;c++){
    let blks='';
    for(const b of S.bookings){ if(b.court!==c||b.end<=t0)continue;
      const l=Math.max(0,x(b.start)), w=x(b.end)-l;
      blks+=`<i class="blk ${b.rid===r.id?'mine':''}" style="left:${l}px;width:${w}px">${b.name}</i>`;
    }
    const dirt=isDirty(c)&&!playingOn(c)?' 🧹':'';
    rows+=`<button class="tl-row ${r.assigned.includes(c)?'mine':''}" data-court="${c}" aria-label="Xếp sân ${c}"><span class="tl-lab">Sân ${c}${dirt}</span><span class="tl-track" style="width:${tw}px">${grid}${blks}<i class="tl-req"></i><i class="tl-now"></i></span></button>`;
  }
  el.innerHTML=`<div class="tl-inner" style="width:${60+tw}px"><div class="tl-hours"><span class="tl-lab">Giờ</span><span class="tl-track" style="width:${tw}px">${hours}</span></div>${rows}</div>`;
  el.scrollLeft=keep;
  el.dataset.dirt=dirtSig();
  placeMarks();
}
function dirtSig(){let s='';for(let c=1;c<=COURTS;c++)s+=isDirty(c)&&!playingOn(c)?'1':'0';return s}
function placeMarks(){
  const r=cur;if(!r||r.type!=='b'||tlT0===null)return;
  const [ws,we]=win(r), t0=tlT0, x=m=>(m-t0)/30*W;
  document.querySelectorAll('.tl-req').forEach(e=>{e.style.left=x(ws)+'px';e.style.width=(x(we)-x(ws))+'px'});
  document.querySelectorAll('.tl-now').forEach(e=>{e.style.left=x(S.time)+'px'});
  if(r.walk&&!r.done){const w=$('#winTxt'),f=$('#feeTxt');if(w)w.textContent=`${hm(ws)} – ${hm(we)}`;if(f)f.textContent=fmt(fee(ws,we))}
}
let lastSheetMood='';
function liveSheet(){
  if(!cur||cur.type==='kho'||cur.type==='rv')return;
  tickBrew();
  setBar($('#sheetPat'),cur);{const e=$('#sheetEta'),t=zoneTxt(cur);if(e.textContent!==t)e.textContent=t;e.className='eta '+moodOf(cur)}
  const m=moodOf(cur);if(m!==lastSheetMood){lastSheetMood=m;$('#sheetFace').innerHTML=avatar(cur.look,m)}
  if(cur.type==='b'&&!cur.done){
    const el=$('#tlScroll');
    if(Math.floor(S.time/30)*30!==tlT0||(el&&el.dataset.dirt!==dirtSig()))buildTimeline(); else placeMarks();
  }
}

function sit(id,cls=''){
  const it=IT[id], lock=!S.unlocked.includes(id), left=S.stock[id]-(tray[id]||0)-brewCount(id), off=!lock&&!S.menu.includes(id);
  if(lock)return `<div class="sit lock ${cls}"><span class="e">${it.e}</span><b>${it.name}</b><span class="lk">🔒 Nâng cấp</span></div>`;
  const P=PREP_T[id], nb=brewCount(id);
  return `<div class="sit ${cls} ${left<=0?'out':''} ${off?'off':''}" data-add="${id}" role="button" tabindex="0" aria-label="${it.name}, còn ${left}">
    <span class="cnt">${left}</span><span class="e">${it.e}</span><b>${it.name}</b><span class="pr">${off?'ngoài menu':left<=0?'<span class="hh">Hết hàng</span>':fmt(priceOf(id))}</span>
    ${P?`<span class="brew"><i data-brewbar="${id}"></i></span>${nb?`<span class="bq">×${nb}</span>`:''}`:''}</div>`;
}
function benchHTML(k){
  if(!S.unlocked.includes(k))return sit(k,'big');
  const F=FLOW[k], B=bench[k], left=S.stock[k]-(tray[k]||0)-brewCount(k), off=!S.menu.includes(k);
  const out=left<=0&&B.step===0;
  return `<div class="bench ${out?'out':''} ${off?'off':''}">
    <span class="cnt">${Math.max(0,left)}</span>
    <div class="bench-top ${B.busy?'busy':''}">${B.step===0?`<span class="bt-t">${F.look[0]}</span>`:`<span class="bt-e">${F.look[B.step]}</span>`}${B.busy?`<span class="steam">💨</span>`:''}
      <span class="brew"><i data-benchbar="${k}"></i></span></div>
    <div class="steps">${F.steps.map(([a,e,t],i)=>`<button class="stp ${i===B.step&&!B.busy&&!out?'next':''} ${i<B.step?'done':''}" data-step="${k}:${a}"><span class="se">${i<B.step?'✅':e}</span><span class="st">${i+1}. ${t}</span></button>`).join('')}</div>
    <span class="pr">${off?'ngoài menu':out?'<span class="hh">Hết hàng</span>':`${IT[k].name} · ${fmt(priceOf(k))}`}</span>
  </div>`;
}
function cookTile(k,cls){
  if(!S.unlocked.includes(k))return sit(k,cls);
  const B=bench[k], left=S.stock[k]-(tray[k]||0)-brewCount(k), off=!S.menu.includes(k);
  return `<div class="sit ${cls} ${left<=0&&!B.busy&&!B.step?'out':''} ${off?'off':''} ${B.busy?'cooking':''}" data-cook="${k}" role="button" tabindex="0" aria-label="Làm ${IT[k].name}">
    <span class="cnt">${Math.max(0,left)}</span><span class="e">${B.busy?(k==='mi'?'♨️':'⚙️'):IT[k].e}</span><b>${IT[k].name}</b>
    <span class="pr">${B.busy?'Đang nấu…':left<=0?'<span class="hh">Hết hàng</span>':'Chạm để làm'}</span><span class="brew"><i data-benchbar="${k}"></i></span></div>`;
}
function cookPopHTML(k){
  const F=FLOW[k], B=bench[k];
  return `<div class="cookpop" role="dialog" aria-label="Làm ${IT[k].name}"><div class="cp-card">
    <div class="cp-h"><span>${IT[k].e} Làm ${(()=>{const q=B.step>0?(B.qty||1):Math.max(1,Math.min(S.stock[k]-(tray[k]||0)-brewCount(k),((cur&&cur.order&&cur.order[k])||1)-(tray[k]||0)));return q>1?q+' phần ':''})()}${IT[k].name}</span><button class="ib press" data-cookclose aria-label="Đóng">✕</button></div>
    ${F.steps.map(([a,e,t],i)=>`<button class="cp-step ${i<B.step?'done':i===B.step?'next':''}" data-step="${k}:${a}"><span class="cp-box">${i<B.step?'✓':''}</span><span class="cp-e">${e}</span><span>${i+1}. ${t}</span></button>`).join('')}
    <p class="cp-note">Tick lần lượt đủ ${F.steps.length} bước là bắt đầu ${k==='mi'?'nấu':'pha'}, khoảng ${Math.round(F.ms/1000)} giây xong, món tự lên khay.</p></div></div>`;
}
function stationHTML(){
  return `<div class="station">
    <div class="zone z-fr"><span class="zl">❄️ Tủ lạnh</span><div class="shelf">${sit('suoi')}${sit('dg')}${sit('tl')}</div></div>
    <div class="zone z-tra"><span class="zl">🧊 Bình trà đá</span>${sit('tra','big')}<div class="cups">🥤🥤🥤</div></div>
    <div class="zone z-cf"><span class="zl">☕ Cà phê</span>${benchHTML('cf')}</div>
    <div class="zone z-food"><span class="zl">🍱 Tủ kính đồ ăn</span><div class="glass">${sit('banhmi')}${sit('xoi')}${sit('chuoi')}</div></div>
    <div class="zone z-mi"><span class="zl">♨️ Ấm & mì</span>${benchHTML('mi')}</div>
    <div class="zone z-cau"><span class="zl">🏸 Kệ cầu</span>${sit('cau','big')}<div class="tubes"><i></i><i></i><i></i><i></i></div></div>
  </div>`;
}
