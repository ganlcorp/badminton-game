// render.js — Vẽ thanh trên cùng, sân, quầy, nhân viên
/* ---------- Render ---------- */
function renderHUD(){
  {const mb=$('#mapBadge'),n=(S.branches||[]).length;if(mb){mb.hidden=!n;mb.textContent=n}}
  const sn='🏸 '+S.name; if($('#signName').textContent!==sn){$('#signName').textContent=sn;document.title=S.name+' · Game quản lý sân cầu lông'}
  $('#clock').textContent=hm(S.time);
  $('#day').textContent=`Ngày ${S.day}`+(paused&&S.phase==='open'?' · dừng':'');
  $('#money').textContent=fmt(S.money);
  const r=Math.round(S.rating);
  $('#stars').textContent=starStr(r)+' '+S.rating.toFixed(1);
  $('#pauseBtn').textContent=paused?'▶':'❚❚';
  const m=ownerMood(); if(m!==lastMood){lastMood=m;$('#ownerFace').innerHTML=chibi(OWNER_LOOK,m,'owner')}
  const gw=$('#guardWrap'); if(gw.hidden===!!S.guard){gw.hidden=!S.guard; if(S.guard&&!$('#guardFace').innerHTML)$('#guardFace').innerHTML=chibi(GUARD_LOOK,'happy','guard')}
  const u=unreplied(); for(const bd of [$('#rvBadge'),$('#rvBadgeH')]){bd.hidden=!u; bd.textContent=u>9?'9+':u;}
}
function hashStr(t){let h=0;for(const ch of String(t))h=(h*31+ch.charCodeAt(0))>>>0;return h}
// Người chơi chibi tí hon trên sân: đầu to, cầm vợt, vung vợt theo nhịp cầu
function miniPlayer(h,bottom){
  const k='#1d2b36', skin=SKINS[h%SKINS.length], hair=HAIRS[(h>>3)%HAIRS.length], shirt=SHIRTS[(h>>5)%SHIRTS.length], band=BANDS[(h>>7)%BANDS.length];
  const bun=(h>>9)%3===0;
  return `<svg viewBox="0 0 30 36" aria-hidden="true"><ellipse cx="15" cy="34" rx="8" ry="2" fill="rgba(0,0,0,.22)"/>
    <g class="mp-body">
      <rect x="10.5" y="26" width="3.6" height="6" rx="1.5" fill="${k}"/><rect x="15.9" y="26" width="3.6" height="6" rx="1.5" fill="${k}"/>
      <rect x="8.5" y="17" width="13" height="11" rx="4.5" fill="${shirt}" stroke="${k}" stroke-width="1.8"/>
      <g class="mp-arm"><path d="M20 20 L25 13" stroke="${k}" stroke-width="3.2" stroke-linecap="round"/><path d="M20 20 L25 13" stroke="${skin}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M25 13 L26.5 9.5" stroke="${k}" stroke-width="1.4"/><ellipse cx="27.5" cy="6" rx="3.4" ry="4.3" fill="#fff" stroke="${band}" stroke-width="1.6"/><ellipse cx="27.5" cy="6" rx="4.3" ry="5.2" fill="none" stroke="${k}" stroke-width=".9"/></g>
      ${bun?`<circle cx="15" cy="3" r="3" fill="${hair}" stroke="${k}" stroke-width="1.5"/>`:''}
      <circle cx="15" cy="11" r="7.6" fill="${skin}" stroke="${k}" stroke-width="1.8"/>
      <path d="M7.6 10 Q8 3.4 15 3.4 Q22 3.4 22.4 10 Q19 6.6 15 7.2 Q11 6.4 7.6 10Z" fill="${hair}" stroke="${k}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M7.8 8.6 Q15 5.2 22.2 8.6" stroke="${band}" stroke-width="1.8" fill="none"/>
      ${bottom?'':`<circle cx="12.3" cy="12" r="1.2" fill="${k}"/><circle cx="17.7" cy="12" r="1.2" fill="${k}"/><path d="M13 15 Q15 16.6 17 15" stroke="${k}" stroke-width="1.1" fill="none" stroke-linecap="round"/><ellipse cx="10" cy="14" rx="1.5" ry="1" fill="#ff8fa3" opacity=".7"/><ellipse cx="20" cy="14" rx="1.5" ry="1" fill="#ff8fa3" opacity=".7"/>`}
    </g></svg>`;
}
function renderCourts(){
  const now=performance.now(); let html='',busy=0,dirty=0;
  for(let c=1;c<=COURTS;c++){
    const p=playingOn(c), n=nextOn(c), d=S.courts[c-1].dirty, cl=jobOn(c);
    if(courtSay[c]&&(courtSay[c].until<now||!p))delete courtSay[c];
    if(p)busy++; if(d&&!p)dirty++;
    let sub=p?`${p.name} → ${hm(p.end)}`:cl?(cl.by==='owner'?'Chủ quán quét':'Nhân viên quét'):d?'Chưa dọn':'Trống';
    let tag='';
    if(cl)tag=`<span class="tag ${cl.by==='owner'?'cl':'staff'}">${cl.by==='owner'?'🧢':'👷'} ${Math.min(99,Math.floor((S.time-cl.start)/(cl.until-cl.start)*100))}%</span>`;
    else if(d&&!p)tag=`<span class="tag dirt">Chạm để dọn</span>`;
    if(n&&n.start-S.time<=60)tag+=`<span class="tag">Đặt ${hm(n.start)}</span>`;
    let inner='';
    if(p){const h=hashStr(p.name+p.id);inner=`<span class="mp t">${miniPlayer(h,false)}</span><span class="mp b">${miniPlayer(h+7,true)}</span><i class="sh"></i>`}
    else if(d||cl)inner=`<i class="lit" style="top:18%;left:20%">🥤</i><i class="lit" style="top:66%;left:58%">🍌</i><i class="lit" style="top:30%;left:62%">🪶</i>${cl?'<i class="broom">🧹</i>':''}`;
    const bk=S.courts[c-1].broken;
    if(bk&&!p){const rp=bk.repair;sub=rp?'Đang sửa':bk.kind;tag=rp?`<span class="tag fix">🔧 ${Math.min(99,Math.floor((S.time-rp.start)/(rp.until-rp.start)*100))}%</span>`:`<span class="tag brk">💥 Chạm để sửa</span>`;inner=rp?'<i class="wrench">🔧</i><i class="wrench w2">🪛</i>':`<i class="crack">${bk.icon}</i>`}
    if(p&&p.vip){sub=`⭐ ${p.name}`;inner+=`<i class="fw f1">🎆</i><i class="fw f2">🎇</i><i class="fw f3">✨</i><i class="fw f4">🎆</i><i class="fans">📸🙌📸</i>`}
    html+=`<div class="court ${p?'play':'free'} ${p&&p.vip?'vip':''} ${d&&!p?'dirty':''} ${bk&&!p?(bk.repair?'fixing':'broken'):''}" data-c="${c}">${courtSay[c]?`<span class="say">${courtSay[c].t}</span>`:''}<div class="mini"><i class="lines"></i><i class="svc a"></i><i class="svc b"></i>${inner}</div><span class="cnum">Sân ${c}</span><small>${sub}</small>${tag}</div>`;
  }
  for(let c=COURTS+1;c<=MAX_COURTS;c++)html+=`<div class="court locked" data-c="${c}"><div class="mini"><span class="lk">🔒</span></div><span class="cnum">Sân ${c}</span><small>Chưa mở</small></div>`;
  const el=$('#courts'); if(el.dataset.h!==html){el.dataset.h=html;el.innerHTML=html}
  const pk=peakInfo(S.time/60); $('#courtSum').textContent=`${busy}/${COURTS} đang chơi`+(dirty?` · ${dirty} dơ`:'');
  const pt=$('#peakTag'); const ev=S.event&&S.event.day===S.day&&S.event.state!=='done'?S.event:null;
  if(pt){const lb=ev?(ev.state==='pending'?`🌟 Idol bao sân ${hm(ev.arrive)}`:`🌟 Idol bao sân tới ${hm(ev.end)}`):pk.lbl;pt.textContent=lb;pt.hidden=!lb;pt.classList.toggle('hot',pk.hot||!!ev);pt.classList.toggle('vipt',!!ev)}
  const st=$('#staffs'), sh=S.staff?STAFF_LOOKS.slice(0,S.staff).map(l=>`<span class="face">${avatar(l,'happy')}</span>`).join('')+`<span>thời vụ</span>`:'';
  st.hidden=!S.staff; if(st.dataset.h!==sh){st.dataset.h=sh;st.innerHTML=sh}
}
function chip(c){
  const sub=c.type==='b'?(c.walk?`Chơi luôn ${durTxt(c.dur)}`:`${hm(c.start)} – ${hm(c.start+c.dur)}`)+(c.count>1?` · 2 sân (${c.assigned.length}/2)`:''):`Sân ${c.court}`;
  return `<button class="chip press ${moodOf(c)}" data-id="${c.id}"><span class="face">${avatar(c.look,moodOf(c))}</span><b>${c.name} <small style="color:var(--soft);font-weight:600">${sub}</small></b><span class="talk">${lastLine(c)}</span><div class="pat"><i></i></div></button>`;
}
function orderText(order){return Object.entries(order).map(([id,n])=>`${n} ${IT[id].name.toLowerCase()}`).join(', ')}
function renderQueue(el,q,emptyTxt){
  const sig=q.map(c=>c.id+':'+(c.assigned?c.assigned.length:0)+':'+moodOf(c)+':'+c.chat.length).join(',');
  if(el.dataset.sig!==sig){el.dataset.sig=sig;el.innerHTML=q.length?q.map(chip).join(''):`<p class="empty">${emptyTxt}</p>`}
  for(const c of q){const bar=el.querySelector(`[data-id="${c.id}"] .pat i`);if(bar)setBar(bar,c)}
}
function setBar(bar,c){const p=Math.max(0,c.pat/c.patMax);bar.style.width=(p*100)+'%';bar.className=p<Z_LATE?'low':p<Z_WARN?'mid':''}
function render(){
  if(!S)return;
  checkStars();
  renderHUD();renderCourts();
  renderCounter('B',S.qB,'Chưa có khách hỏi sân');
  renderCounter('D',S.qD,'Chưa ai gọi đồ');
  renderSeller();
  renderBooker();
  liveSheet();
}

const lastFirst={B:null,D:null};
function reqItems(f){
  if(f.type==='b')return `<span class="rq">${f.walk?'⚡ Chơi luôn '+durTxt(f.dur):'🗓 '+hm(f.start)+'–'+hm(f.start+f.dur)}${f.count>1?` · <b>2 sân</b> (${f.assigned.length}/2)`:''}</span>`;
  if(f.complaint)return `<span class="oi bad">${f.complaint.wrong?IT[f.complaint.wrong].e:'❓'}</span><span class="arr">→</span>`+Object.entries(f.order).map(([id,n])=>`<span class="oi">${IT[id].e}<b>${n}</b></span>`).join('');
  return Object.entries(f.order).map(([id,n])=>`<span class="oi">${IT[id].e}<b>${n}</b></span>`).join('');
}
function renderCounter(k,q,emptyTxt){
  const stage=$('#q'+k+'s'), n=$('#q'+k+'n');
  n.textContent=q.length; n.classList.toggle('hot',q.length>0);
  const f=q[0];
  const sjSet=new Set(k==='D'?jobsOf().map(J=>J.id):[]); const sj=[...sjSet].join(',');
  const sig=sj+'|'+q.map(c=>c.id+':'+moodOf(c)+':'+c.chat.length+':'+(c.assigned?c.assigned.length:0)+(c.complaint?'!':'')).join(',');
  if(stage.dataset.sig!==sig){
    stage.dataset.sig=sig;
    if(!f){stage.innerHTML=`<div class="empty-ctr"><span>😴</span>${emptyTxt}</div>`;lastFirst[k]=null}
    else{
      const isNew=lastFirst[k]!==f.id; lastFirst[k]=f.id;
      const md=f.complaint?'angry':moodOf(f);
      const tag=f.vip?`<b class="viptag">🌟 Idol:</b> `:f.fan?`<b class="viptag">📣 Fan:</b> `:f.complaint?(f.type==='b'?`<b>⚠️ Xếp nhầm sân!</b> `:`<b>⚠️ Bán nhầm!</b> `):f.type==='d'?`<b>${f.court?'Sân '+f.court:'🛍️ Mang đi'}:</b> `:'';
      const rest=q.slice(1,5).map(c=>`<button class="hd ${c.complaint?'angry':moodOf(c)} ${sjSet.has(c.id)?'selling':''}" data-id="${c.id}" aria-label="${c.name}">${avatar(c.look,c.complaint?'angry':moodOf(c))}${sjSet.has(c.id)?'<i class="sell-dot">🧑‍💼</i>':''}</button>`).join('');
      const hint=sjSet.has(f.id)?'🧑‍💼 Nhân viên đang bán':f.complaint?'💢 Ra xin lỗi, đổi món!':'👆 Chạm để phục vụ';
      stage.innerHTML=`
        <button class="chibi ${f.complaint?'angry fury':md} ${isNew?'new':''}" data-id="${f.id}" aria-label="Phục vụ ${f.name}">${avatar(f.look,md)}${f.complaint?'<span class="fume">💢</span><span class="fume f2">💢</span>':''}<span class="nm">${esc(f.name)}</span></button>
        <div class="bub2 ${isNew?'new':''} ${f.complaint?'cmp':''} ${f.vip?'vipb':''}" data-id="${f.id}">
          <div class="bq-t">${tag}${esc(lastLine(f))}</div>
          <div class="bq-i">${reqItems(f)}</div>
          <div class="kn"><span class="kl">Kiên nhẫn</span><div class="pat zpat"><i></i></div></div>
          <span class="eta"></span>
        </div>
        <div class="deskline"><span class="hint2 ${f.complaint?'cmp':''}">${hint}</span><div class="line">${rest}${q.length>5?`<span class="more">+${q.length-5}</span>`:''}</div></div>`;
    }
  }
  if(f){const bar=stage.querySelector('.pat i');if(bar)setBar(bar,f);const e=stage.querySelector('.eta');if(e){const t=zoneTxt(f);if(e.textContent!==t)e.textContent=t;e.className='eta '+(f.complaint?'angry':moodOf(f))}}
}
function renderSeller(){
  const bar=$('#sBar'); if(!bar)return;
  bar.hidden=!S.seller; if(!S.seller)return;
  const n=Math.min(S.seller,MAX_SELLER), jobs=jobsOf();
  let html='', sig='';
  for(let sid=0;sid<n;sid++){
    const J=jobs.find(x=>x.sid===sid), c=J&&S.qD.find(x=>x.id===J.id);
    let txt='Rảnh', prog=0, tray='';
    if(J&&c){
      const nxt=J.units[Math.min(J.done,J.units.length-1)], nid=J.done===J.errAt?J.wrong:nxt;
      txt=J.done<J.units.length?`${n===1?'Đang lấy ':''}${IT[nid].e} ${n===1?IT[nid].name.toLowerCase()+' ':''}→ ${c.name}`:`Đưa cho ${c.name}`;
      const el=S.time-J.start, e0=J.done?J.ends[J.done-1]:0, e1=J.ends[Math.min(J.done,J.ends.length-1)];prog=Math.min(100,Math.max(0,(el-e0)/Math.max(.01,e1-e0)*100));
      tray=jobTray(J).map(id=>`<span class="oi">${IT[id].e}</span>`).join('');
    }
    sig+=sid+(J?J.id+':'+J.done:'-')+'|';
    html+=`<div class="sj ${J?'busy':''}" data-sid="${sid}"><span class="sb-face">${avatar(SELLER_LOOKS[sid],'happy')}</span><div class="sb-mid"><b>${esc(txt)}</b><span class="sb-prog"><i style="width:${prog}%"></i></span></div><div class="sb-tray">${tray||'<span class="sb-ph">khay</span>'}</div></div>`;
  }
  if(bar.dataset.sig!==sig){bar.dataset.sig=sig;bar.innerHTML=html;bar.classList.toggle('multi',n>1)}
  else{ bar.querySelectorAll('.sj').forEach(el=>{const sid=+el.dataset.sid,J=jobs.find(x=>x.sid===sid);const i=el.querySelector('.sb-prog i');if(J&&i){const t=S.time-J.start,e0=J.done?J.ends[J.done-1]:0,e1=J.ends[Math.min(J.done,J.ends.length-1)];i.style.width=Math.min(100,Math.max(0,(t-e0)/Math.max(.01,e1-e0)*100))+'%'}}) }
}
function openCounter(e,k){
  const b=e.target.closest('[data-id]');
  if(b)return openCust(+b.dataset.id);
  if(e.target.closest('#khoBtn')||e.target.closest('#sBar')||e.target.closest('#bBar'))return;
  const q=k==='B'?S.qB:S.qD; if(q[0])openCust(q[0].id);
}

function checkStars(){
  const below=S.rating<3;
  if(below&&!S.wasBelow&&S.fineDay!==S.day&&$('#modal').classList.contains('on'))return; // đợi đóng hộp thoại đang mở rồi mới báo
  if(below&&!S.wasBelow&&S.fineDay!==S.day){
    S.fineDay=S.day;
    let cash=Math.min(S.money,STAR_FINE), rest=STAR_FINE-cash;
    S.money-=cash; S.debt+=rest; S.stats.fine=(S.stats.fine||0)+STAR_FINE; L('fine');
    toast('−'+fmt(STAR_FINE),'bad');
    ownerSay(`Quán tụt dưới 3 sao, mất khách thuê sân cố định: mất ${tr(STAR_FINE)}!`);
    const wasP=paused; if(S.phase==='open'){paused=true;closeSheet()}
    openModal(`<div class="mface">${avatar(OWNER_LOOK,'angry')}</div><h2>😱 Tụt dưới 3 sao!</h2>
      <p style="text-align:center">Đánh giá quán còn <b>${S.rating.toFixed(1)}★</b>. Các nhóm thuê sân cố định huỷ hợp đồng, quán mất <b>${fmt(STAR_FINE)}</b>.</p>
      ${rest?`<p class="note" style="text-align:center">Tiền mặt không đủ nên ${fmt(rest)} bị cộng vào nợ ngân hàng.</p>`:''}
      <p class="note" style="text-align:center">Kéo sao lên lại từ 3 trở lên, nếu tụt nữa sẽ lại bị mất tiền (tối đa 1 lần mỗi ngày).</p>
      <div class="mrow"><button class="btn press" data-mclose>Đã hiểu</button></div>`,()=>{if(S.phase==='open'&&!wasP){paused=false;last=performance.now()}});
    save();
  }
  S.wasBelow=below;
}
