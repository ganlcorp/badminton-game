// day-flow.js — Màn chuẩn bị, tổng kết cuối ngày, màn hình mở đầu
/* ---------- Day flow ---------- */
let prepStaff=0, prepTab='hang', prepPay=0, prepGuard=0, prepSeller=0, prepBooker=0;
function chalkboard(){
  const rows=S.menu.map(id=>{const empty=S.stock[id]+(prepCart[id]||0)<=0;return `<div class="cb-row ${empty?'cb-empty':''}"><span>${IT[id].e} ${IT[id].name}</span><i></i><b>${empty?'hết':Math.round(priceOf(id)/1000)+'k'}</b></div>`}).join('');
  return `<div class="chalk"><div class="cb-title">📋 Menu hôm nay</div>
    <div class="cb-grid">${rows||'<p>Chưa có món nào trong menu</p>'}</div>
    <div class="cb-court">🏸 Sân: ${Math.round(S.courtRate.day/1000)}k/giờ ngày · ${Math.round(S.courtRate.peak/1000)}k/giờ tối</div></div>`;
}
function tierTag(f){return f>1.3?'<span class="pt hi">đắt</span>':f<.85?'<span class="pt lo">rẻ</span>':'<span class="pt ok">vừa</span>'}
function prepTabHTML(total){
  if(prepTab==='hang'){
    const rows=ITEMS.filter(it=>S.unlocked.includes(it.id)).map(it=>{
      const u=prepCart[it.id]||0, ys=S.lastSold[it.id]||0, rest=u%it.pack;
      return `<div class="prep-row"><span class="e">${it.e}</span><div><b>${it.name}</b>${it.perish?'<span class="fresh">🕒 tươi</span>':''}
        <small>${it.perish?'Tồn 0, đồ tươi không để qua đêm':`Tồn kho ${S.stock[it.id]}`}${S.day>1?`, hôm qua bán ${ys}`:''}${u?`. Sau khi châm: <b>${S.stock[it.id]+u}</b>`:''}</small>
        <small class="pk ${u?'on':''}">${u?`<b>${u} cái: ${fmt(buyCost(it.id,u))}</b>`:`${it.pack} cái: ${fmt(it.packCost)}`}</small></div>
        <div class="stepper qty"><button data-dec="${it.id}" aria-label="Bớt 1 gói ${it.name}">−</button>
          <input class="qin" type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="${MAX_BUY}" step="1" value="${u||''}" placeholder="0" data-qty="${it.id}" aria-label="Số ${it.name} muốn nhập">
          <button data-inc="${it.id}" aria-label="Thêm 1 gói ${it.name}">+</button></div></div>`}).join('');
    return `${S.day>1?`<div class="prep-tools"><button class="btn ghost press" id="autoFill">✨ Châm theo lượng bán hôm qua</button><button class="btn ghost press" id="clearCart">Bỏ chọn</button></div>`:''}
      <div class="cart-badge">🧾 Tổng tiền hàng<b>${fmt(cartTotal())}</b></div>
      <p class="hint">Bấm +/− hoặc chạm vào ô số để <b>gõ số cái muốn nhập</b>. Hàng còn tồn thì chỉ cần châm thêm.</p>${rows}`;
  }
  if(prepTab==='nang'){
    const un=Object.entries(UNLOCK).map(([id,u])=>{const own=S.unlocked.includes(id);
      return `<div class="up-row ${own?'own':''}"><span class="e">${IT[id].e}</span><div><b>${u.t}</b><small>${u.d}</small></div>${own?'<span class="owned">✓ Đã có</span>':`<button class="btn press" data-unlock="${id}">${fmt(u.cost)}</button>`}</div>`}).join('');
    const ug=Object.entries(UPG).map(([k,u])=>{const own=has(k);
      return `<div class="up-row ${own?'own':''}"><span class="e">${u.e}</span><div><b>${u.t}</b><small>${u.d}</small></div>${own?'<span class="owned">✓ Đã có</span>':`<button class="btn press" data-upg="${k}">${fmt(u.cost)}</button>`}</div>`}).join('');
    return `<h3 class="sub">🍽️ Mở món mới</h3>${un}<h3 class="sub">🛠️ Trang bị</h3>${ug}<p class="hint">Nâng cấp trả tiền ngay, dùng mãi mãi.</p>`;
  }
  if(prepTab==='gia'){
    const cr=`<div class="price-row"><span class="e">🌞</span><div><b>Sân ban ngày</b><small>Gốc ${fmt(RATE_DAY)}/giờ ${tierTag(S.courtRate.day/RATE_DAY)}</small></div>
      <div class="stepper"><button data-cp="day:-5000">−</button><span>${Math.round(S.courtRate.day/1000)}k</span><button data-cp="day:5000">+</button></div></div>
      <div class="price-row"><span class="e">🌙</span><div><b>Sân buổi tối (từ 17h)</b><small>Gốc ${fmt(RATE_PEAK)}/giờ ${tierTag(S.courtRate.peak/RATE_PEAK)}</small></div>
      <div class="stepper"><button data-cp="peak:-5000">−</button><span>${Math.round(S.courtRate.peak/1000)}k</span><button data-cp="peak:5000">+</button></div></div>`;
    const it=ITEMS.filter(i=>S.unlocked.includes(i.id)).map(i=>{const on=S.menu.includes(i.id);
      return `<div class="price-row ${on?'':'offm'}"><span class="e">${i.e}</span><div><b>${i.name}</b><small>Gốc ${fmt(i.price)} ${tierTag(pf(i.id))}</small>
        <button class="mtog ${on?'on':''}" data-menu="${i.id}">${on?'✓ Trong menu':'+ Thêm vào menu'}</button></div>
        <div class="stepper"><button data-ip="${i.id}:-1000">−</button><span>${Math.round(priceOf(i.id)/1000)}k</span><button data-ip="${i.id}:1000">+</button></div></div>`}).join('');
    return `<p class="hint">Giá cao thì lời nhiều mỗi lượt nhưng ít khách gọi và dễ bị chê đắt. Giá rẻ thì khách đông, review khen.</p><h3 class="sub">🏸 Giá sân</h3>${cr}<h3 class="sub">🥤 Giá món & menu</h3>${it}`;
  }
  if(prepTab==='nv'){
    return `<div class="prep-row staff"><span class="e">👷</span><div><b>Nhân viên dọn sân thời vụ</b>
        <small>Tự đi quét sân dơ, ưu tiên sân sắp có khách. ${fmt(WAGE)} một người một ngày, tối đa ${MAX_STAFF}. Trả lương khi mở cửa.</small></div>
        <div class="stepper"><button data-sdec aria-label="Bớt nhân viên">−</button><span>${prepStaff}</span><button data-sinc aria-label="Thêm nhân viên">+</button></div></div>
      <div class="staff-line">${STAFF_LOOKS.slice(0,prepStaff).map(l=>`<span class="face">${avatar(l,'happy')}</span>`).join('')||'<p class="hint">Chưa thuê ai. Một mình chủ quán quét sân nha!</p>'}</div>
      <div class="prep-row staff guardrow"><span class="e">🛡️</span><div><b>Bảo vệ giám sát sân</b>
        <small>Canh các nhóm định đánh xong rồi bùng tiền sân: bắt được khoảng ${Math.round(GUARD_CATCH*100)}% vụ. ${fmt(GUARD_WAGE)} một ngày. ${has('cam')?'Có camera nữa thì gần như không ai dám bùng.':'Kết hợp camera an ninh (tab Nâng cấp) càng chắc.'}</small></div>
        <div class="stepper"><button data-gdec aria-label="Không thuê bảo vệ">−</button><span>${prepGuard}</span><button data-ginc aria-label="Thuê bảo vệ">+</button></div></div>
      ${prepGuard?`<div class="staff-line"><span class="cb mini-cb guard">${chibi(GUARD_LOOK,'happy','guard')}</span><p class="hint" style="align-self:center">Bảo vệ đã sẵn sàng canh sân!</p></div>`:''}
      <div class="prep-row staff sellrow"><span class="e">🧑‍💼</span><div><b>Nhân viên bán hàng</b>
        <small>Đứng quầy nước, tự bán cho khách đang xếp hàng, làm được cả mì và cà phê (chậm hơn). <b>Thuê càng nhiều thì càng nhiều đơn được bán cùng lúc</b> (tối đa ${MAX_SELLER} người, mỗi người ${fmt(SELLER_WAGE)}/ngày). Nhưng hay bán nhầm (khoảng ${Math.round(SELLER_ERR_MIN*100)}–${Math.round(SELLER_ERR_MAX*100)}% số đơn mỗi ngày), khách quay lại phàn nàn và chủ quán phải ra đổi món. ${fmt(SELLER_WAGE)} một ngày.</small></div>
        <div class="stepper"><button data-xdec aria-label="Không thuê nhân viên bán hàng">−</button><span>${prepSeller}</span><button data-xinc aria-label="Thuê nhân viên bán hàng">+</button></div></div>
      <div class="prep-row staff bookrow"><span class="e">📅</span><div><b>Nhân viên đặt lịch sân (lễ tân)</b>
        <small>Đứng quầy đặt sân, tự xếp sân trống cho khách (trừ idol). Mỗi ngày xếp nhầm khoảng ${Math.round(BOOKER_ERR_MIN*100)}–${Math.round(BOOKER_ERR_MAX*100)}%: khách ra sân thấy có người và quay lại phàn nàn. ${fmt(BOOKER_WAGE)}/ngày.</small></div>
        <div class="stepper"><button data-bdec aria-label="Không thuê lễ tân">−</button><span>${prepBooker}</span><button data-binc aria-label="Thuê lễ tân">+</button></div></div>
      ${prepBooker?`<div class="staff-line"><span class="face" style="background:#dcebff">${avatar(BOOKER_LOOK,'happy')}</span><p class="hint" style="align-self:center">${BOOKER_NAME} đã vào quầy đặt sân!</p></div>`:''}
      ${prepSeller?`<div class="staff-line">${SELLER_LOOKS.slice(0,prepSeller).map(l=>`<span class="face" style="background:#ffd6e7">${avatar(l,'happy')}</span>`).join('')}<p class="hint" style="align-self:center">${prepSeller} nhân viên bán hàng đã vào quầy!</p></div>`:''}`;
  }
  if(prepTab==='bank'){
    const maxPay=Math.max(0,Math.min(S.debt,S.money-(total-prepPay)));
    const next=Math.round((S.debt-prepPay)*INTEREST);
    return `<div class="bank-card"><div class="bk-row"><span>🏦 Nợ hiện tại</span><b>${fmt(S.debt)}</b></div>
        <div class="bk-row"><span>Khoản vay ban đầu</span><b>${fmt(S.loan0)}</b></div>
        <div class="bk-row"><span>Lãi suất</span><b>${(INTEREST*100).toLocaleString('vi-VN')}% mỗi ngày, cộng dồn</b></div>
        <div class="bk-row"><span>Lãi dự kiến tối nay</span><b>+${fmt(next)}</b></div>
        <div class="bar-debt"><i style="width:${S.loan0?Math.min(100,S.debt/S.loan0*100):0}%"></i></div></div>
      ${S.debt>0?`<h3 class="sub">💸 Trả nợ sáng nay: <span style="color:var(--coral)">${fmt(prepPay)}</span></h3>
      <div class="pay-chips">${[500000,1000000,5000000,10000000].map(v=>`<button data-pay="${v}">+${tr(v)}</button>`).join('')}<button data-pay="max">Trả hết mức có thể</button><button data-pay="0">Đặt lại</button></div>
      <p class="hint">Trả được tối đa ${fmt(maxPay)} (tiền mặt còn lại sau nhập hàng). Trả sớm thì lãi mỗi ngày nhỏ lại.</p>`:'<p class="hint">🎉 Quán đã hết nợ ngân hàng!</p>'}
      <h3 class="sub">🏗️ Mở thêm sân (${COURTS}/${MAX_COURTS})</h3>
      <div class="courts-mini">${Array.from({length:MAX_COURTS},(_,i)=>`<i class="${i<COURTS?'on':''}">${i+1}</i>`).join('')}</div>
      ${COURTS<MAX_COURTS?`<div class="up-row"><span class="e">🏸</span><div><b>Xây sân số ${COURTS+1}</b><small>Vay thêm ${fmt(COURT_COST)}, cộng vào nợ. Thêm sân thì thêm khách.</small></div><button class="btn press" data-build>Vay ${tr(COURT_COST)}</button></div>`:'<p class="hint">Đã đủ 10 sân.</p>'}
      ${branchesBankHTML()}
      <p class="hint">⚠️ Nếu đánh giá tụt dưới 3★, quán mất ${fmt(STAR_FINE)} (tối đa 1 lần mỗi ngày).</p>`;
  }
  // đánh giá
  return S.reviews.length?`<p class="hint">Trả lời review cũ trước khi mở cửa cũng được nè.</p><div class="rvs">${S.reviews.slice(0,12).map(reviewHTML).join('')}</div>`:'<p class="empty">Chưa có review nào. Hết ngày đầu là dân mạng bắt đầu nhận xét!</p>';
}
function showPrep(){
  paused=true; closeSheet();
  $('#prepBg').style.display='flex'; $('#over').classList.add('prep');
  prepPay=Math.max(0,Math.min(prepPay,S.debt));
  const total=cartTotal()+prepStaff*WAGE+prepGuard*GUARD_WAGE+prepSeller*SELLER_WAGE+prepBooker*BOOKER_WAGE+prepPay;
  const tabs=[['hang','📦','Nhập hàng'],['bank','🏦','Ngân hàng'],['nang','🛠️','Nâng cấp'],['gia','🏷️','Giá & menu'],['nv','👷','Nhân viên'],['rv','⭐','Đánh giá']];
  const u=unreplied();
  $('#over').innerHTML=`<div class="card box prep-card">
    ${prepNotices()}
    ${S.event&&S.event.day===S.day&&S.event.state==='pending'?`<div class="ev-card"><b>📣 Tin nóng hôm nay!</b><br>Từ <b>${hm(S.event.arrive)}</b> đến <b>${hm(S.event.arrive+S.event.dur)}</b>, ${S.event.vip.f} <b>${esc(S.event.vip.n)}</b> (${S.event.vip.r}) sẽ <b>bao hết sân</b> giao lưu. Khung này không nhận đặt sân, chỉ bán nước & đồ ăn cho fan.${(()=>{const f=evForecast(S.event);return `<div class="ev-fc">📊 Dự kiến khoảng <b>${f.orders} đơn</b> gọi đồ trong 2 tiếng (~${f.items} món). Nên thuê <b>${f.sellers} nhân viên bán hàng</b> trở lên, dọn sạch hết sân trước giờ idol tới.</div>`})()}Phục vụ tốt thưởng <b>${fmt(VIP_REWARD)}</b>, để fan và idol chờ lâu là dính phốt!</div>`:''}
    <div class="prep-head"><div class="face">${avatar(OWNER_LOOK,'happy')}</div><div><h1>Chuẩn bị ngày ${S.day}</h1><small>🪙 ${fmt(S.money)} · ⭐ ${S.rating.toFixed(1)} · 🏦 nợ ${tr(S.debt)}</small><div class="prep-keys"><button id="pRename">🏪 ${esc(S.name)} ✏️</button><button id="pKey">💾 Mã lưu game</button><button id="pMap">🗺️ Chi nhánh${(S.branches||[]).length?` (${S.branches.length})`:''}</button></div></div></div>
    ${chalkboard()}
    <div class="ptabs" role="tablist">${tabs.map(([k,e,t])=>`<button role="tab" aria-selected="${prepTab===k}" data-tab="${k}"><span>${e}</span>${t}${k==='rv'&&u?`<b>${u}</b>`:''}</button>`).join('')}</div>
    <div class="ptab-body" id="prepList">${prepTabHTML(total)}</div>
    <div class="prep-sum">
      ${(()=>{const em=S.menu.filter(id=>S.stock[id]+(prepCart[id]||0)<=0);return em.length?`<div class="warn-empty">⚠️ Trong menu nhưng chưa có hàng: <b>${em.map(id=>IT[id].e+' '+IT[id].name).join(', ')}</b>. Khách gọi là phải báo hết món. <button id="fillEmpty">Nhập mỗi món 1 lần</button></div>`:''})()}
      <div class="ps-line"><span>Nhập hàng${prepStaff?` + ${prepStaff} NV`:''}${prepGuard?' + bảo vệ':''}${prepSeller?' + NV bán':''}${prepBooker?' + lễ tân':''}${prepPay?' + trả nợ':''}</span><b>−${fmt(total)}</b><span>Còn lại</span><b>${fmt(S.money-total)}</b></div>
      <button class="btn press" id="openShop">Nhập hàng & mở cửa · ${fmt(total)}</button>
    </div></div>`;
  $('#over').style.display='flex';
  bindPrepNotices();
  $('#pRename').onclick=()=>askName(S.name,n=>{S.name=n;save();keepScroll(showPrep);ownerSay(`Quán mình giờ tên là "${n}" nha!`)});
  $('#pKey').onclick=showKey; $('#pMap').onclick=()=>openMap(); const bm=$('#bkMap'); if(bm)bm.onclick=()=>openMap();
  $('#over').querySelector('.ptabs').onclick=e=>{const t=e.target.closest('[data-tab]');if(t){prepTab=t.dataset.tab;keepScroll(showPrep)}};
  $('#prepList').onclick=e=>{
    const g=e.target.closest.bind(e.target);
    const py=g('[data-pay]');
    if(py){const v=py.dataset.pay, room=S.money-(total-prepPay);
      if(v==='0')prepPay=0; else if(v==='max')prepPay=Math.max(0,Math.min(S.debt,room)); else{const nv=prepPay+ +v;if(nv>room)return toast('Không đủ tiền mặt','bad');prepPay=Math.min(S.debt,nv)}
      return keepScroll(showPrep)}
    if(g('[data-build]')){if(COURTS>=MAX_COURTS)return;
      if(!confirm(`Vay thêm ${fmt(COURT_COST)} để xây sân số ${COURTS+1}? Khoản này cộng vào nợ, lãi ${(INTEREST*100).toLocaleString('vi-VN')}%/ngày.`))return;
      S.debt+=COURT_COST; S.loan0+=COURT_COST; COURTS++; S.courtsOpen=COURTS; S.courts.push({dirty:false}); save();
      ownerSay(`Xây xong sân số ${COURTS} rồi! Giờ quán có ${COURTS} sân.`); return keepScroll(showPrep)}
    if(g('[data-sinc]')){if(prepStaff>=MAX_STAFF)return toast('Tối đa 3 người thôi','bad');if(total+WAGE>S.money)return toast('Không đủ tiền','bad');prepStaff++;return keepScroll(showPrep)}
    if(g('[data-sdec]')){if(prepStaff){prepStaff--;keepScroll(showPrep)}return}
    if(g('[data-ginc]')){if(prepGuard>=1)return toast('Một bảo vệ là đủ canh cả quán rồi');if(total+GUARD_WAGE>S.money)return toast('Không đủ tiền','bad');prepGuard=1;return keepScroll(showPrep)}
    if(g('[data-gdec]')){if(prepGuard){prepGuard=0;keepScroll(showPrep)}return}
    if(g('[data-xinc]')){if(prepSeller>=MAX_SELLER)return toast(`Quầy chứa tối đa ${MAX_SELLER} nhân viên bán`);if(total+SELLER_WAGE>S.money)return toast('Không đủ tiền','bad');prepSeller++;return keepScroll(showPrep)}
    if(g('[data-xdec]')){if(prepSeller){prepSeller--;keepScroll(showPrep)}return}
    if(g('[data-binc]')){if(prepBooker>=1)return toast('Một lễ tân là đủ cho quầy đặt sân');if(total+BOOKER_WAGE>S.money)return toast('Không đủ tiền','bad');prepBooker=1;return keepScroll(showPrep)}
    if(g('[data-bdec]')){if(prepBooker){prepBooker=0;keepScroll(showPrep)}return}
    const inc=g('[data-inc]'),dec=g('[data-dec]');
    if(inc){const id=inc.dataset.inc,u0=prepCart[id]||0,u1=Math.min(MAX_BUY,(Math.floor(u0/IT[id].pack)+1)*IT[id].pack);if(total-buyCost(id,u0)+buyCost(id,u1)>S.money)return toast('Không đủ tiền','bad');prepCart[id]=u1;return keepScroll(showPrep)}
    if(dec){const id=dec.dataset.dec,u0=prepCart[id]||0;if(u0){const r=u0%IT[id].pack;prepCart[id]=Math.max(0,u0-(r||IT[id].pack));if(!prepCart[id])delete prepCart[id];keepScroll(showPrep)}return}
    const ul=g('[data-unlock]');
    if(ul){const id=ul.dataset.unlock,c=UNLOCK[id].cost;if(S.money-total<c)return toast('Không đủ tiền','bad');
      S.money-=c;S.stats.cost+=c;S.unlocked.push(id);S.menu.push(id);
      if(S.money-total>=IT[id].packCost){prepCart[id]=(prepCart[id]||0)+IT[id].pack;ownerSay(`Mở bán ${IT[id].name} rồi! Đã thêm ${IT[id].pack} ${IT[id].name.toLowerCase()} vào giỏ nhập hàng.`)}
      else ownerSay(`Mở bán ${IT[id].name} rồi! Vào tab Nhập hàng để nhập ${IT[id].name.toLowerCase()} nha, chưa nhập là tủ trống.`);
      save();return keepScroll(showPrep)}
    const up=g('[data-upg]');
    if(up){const k=up.dataset.upg,c=UPG[k].cost;if(S.money-total<c)return toast('Không đủ tiền','bad');
      S.money-=c;S.stats.cost+=c;S.upg[k]=1;save();ownerSay(`Lắp ${UPG[k].t} xong, xịn ghê!`);return keepScroll(showPrep)}
    const cp=g('[data-cp]');
    if(cp){const [k,d]=cp.dataset.cp.split(':');const base=k==='day'?RATE_DAY:RATE_PEAK;S.courtRate[k]=Math.max(base*.5,Math.min(base*2,S.courtRate[k]+ +d));save();return keepScroll(showPrep)}
    const ip=g('[data-ip]');
    if(ip){const [id,d]=ip.dataset.ip.split(':');const base=IT[id].price;S.prices[id]=Math.max(Math.max(1000,base*.5),Math.min(base*2,priceOf(id)+ +d));save();return keepScroll(showPrep)}
    const mt=g('[data-menu]');
    if(mt){const id=mt.dataset.menu;if(S.menu.includes(id)){if(S.menu.length<=1)return toast('Menu phải có ít nhất 1 món','bad');S.menu=S.menu.filter(x=>x!==id)}else S.menu.push(id);save();return keepScroll(showPrep)}
  };
  $('#prepList').querySelectorAll('[data-qty]').forEach(inp=>{
    const apply=()=>{
      const id=inp.dataset.qty; let v=Math.floor(Number(String(inp.value).replace(/[^0-9]/g,''))||0);
      v=Math.max(0,Math.min(MAX_BUY,v));
      const others=total-buyCost(id,prepCart[id]||0), room=S.money-others;
      if(buyCost(id,v)>room){let lo=0,hi=v;while(lo<hi){const m=Math.ceil((lo+hi)/2);if(buyCost(id,m)<=room)lo=m;else hi=m-1}v=lo;toast(v?`Chỉ đủ tiền nhập ${v} ${IT[id].name.toLowerCase()}`:'Không đủ tiền','bad')}
      if(v)prepCart[id]=v; else delete prepCart[id];
      keepScroll(showPrep);
    };
    inp.addEventListener('change',apply);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}});
    inp.addEventListener('focus',()=>inp.select());
  });
  if($('#fillEmpty'))$('#fillEmpty').onclick=()=>{let spent=total,added=0;for(const id of S.menu){if(S.stock[id]+(prepCart[id]||0)>0)continue;if(spent+IT[id].packCost>S.money)continue;prepCart[id]=(prepCart[id]||0)+IT[id].pack;spent+=IT[id].packCost;added++}
    toast(added?`Đã thêm ${added} món vào giỏ`:'Không đủ tiền','bad'.slice(added?3:0));keepScroll(showPrep)};
  if($('#autoFill'))$('#autoFill').onclick=()=>{
    prepCart={}; let spent=prepStaff*WAGE;
    for(const it of ITEMS){ if(!S.unlocked.includes(it.id))continue;
      const want=Math.max(Math.ceil((S.lastSold[it.id]||0)*1.2),S.menu.includes(it.id)?Math.ceil(it.pack*.5):0)-S.stock[it.id];
      let packs=Math.max(0,Math.ceil(want/it.pack));
      while(packs>0&&spent+packs*it.packCost>S.money)packs--;
      if(packs){prepCart[it.id]=packs*it.pack;spent+=packs*it.packCost}
    }
    keepScroll(showPrep); toast('Đã chọn châm hàng cho đủ bán');
  };
  if($('#clearCart'))$('#clearCart').onclick=()=>{prepCart={};keepScroll(showPrep)};
  $('#openShop').onclick=()=>{
    if(taxBlocksOpen())return;
    for(const [id,u] of Object.entries(prepCart)){S.stock[id]+=u}
    S.money-=total; S.debt-=prepPay; S.stats.repaid=prepPay; S.stats.wage=prepStaff*WAGE+prepGuard*GUARD_WAGE+prepSeller*SELLER_WAGE+prepBooker*BOOKER_WAGE; const goods=total-S.stats.wage-prepPay; S.stats.cost+=goods; S.stats.start=S.money+total-prepPay+(S.stats.cost-goods); S.staff=prepStaff; S.guard=prepGuard; S.seller=prepSeller; S.sellJobs=[]; S.booker=prepBooker; S.bookJob=null; S.bookErr=BOOKER_ERR_MIN+Math.random()*(BOOKER_ERR_MAX-BOOKER_ERR_MIN); S.sellErr=SELLER_ERR_MIN+Math.random()*(SELLER_ERR_MAX-SELLER_ERR_MIN); S.morale=!!S.nextMorale&&(prepSeller||prepStaff||prepGuard||prepBooker)>0; S.nextMorale=false;
    if(S.morale)setTimeout(()=>ownerSay('Hôm qua nhân viên được khách tip đậm, hôm nay ai cũng hăng hái hẳn! 💪'),800);
    scheduleOwnerEvent();
    {const br=[];for(let c=1;c<=COURTS;c++)if(isBroken(c))br.push(c);if(br.length)setTimeout(()=>ownerSay(`Còn ${br.length} sân hỏng chưa sửa (${br.map(c=>'sân '+c).join(', ')}), chạm vào sân để gọi thợ nha!`),1600)} prepCart={}; prepStaff=0; prepGuard=0; prepSeller=0; prepBooker=0;
    if(prepPay)toast('Đã trả nợ '+fmt(prepPay)); if(S.debt<=0&&prepPay){S.debt=0;ownerSay('Trả hết nợ ngân hàng rồi! Nhẹ cả người 🎉')} prepPay=0;
    S.phase='open'; save();
    $('#over').style.display='none'; $('#over').classList.remove('prep'); $('#prepBg').style.display='none'; paused=false; last=performance.now();
    ownerSay(S.staff?`Có ${S.staff} bạn thời vụ phụ dọn sân, yên tâm rồi!`:S.day===1?'Mở cửa rồi! Nhớ quét sân sau mỗi lượt chơi nha!':`Ngày ${S.day} rồi! Mở cửa đón khách thôi!`);
  };
}
function keepScroll(fn){const o=$('#over'),y=o.scrollTop;fn();o.scrollTop=y}

const TIP_RATE=0.005, TIP_BIG=[100000,100000,100000,100000,100000,200000,200000,200000,300000,300000,500000];
const STAFF_NAMES=['Tí','Tèo','Mận'];
function dayTips(){
  const list=[];
  for(let i=0;i<(S.staff||0);i++)list.push({role:'Dọn sân',name:'Bạn '+STAFF_NAMES[i],look:STAFF_LOOKS[i],wage:WAGE,why:['Khách khen sân sạch bong','Nhóm khách quen thích sân lau kỹ','Khách thấy dọn lẹ nên bo thêm']});
  if(S.guard)list.push({role:'Bảo vệ',name:'Chú Hùng',look:{skin:GUARD_LOOK.skin,hair:'#1b1b1b',style:'short',shirt:'#2d4a8a',cap:'#2d4a8a'},wage:GUARD_WAGE,why:['Khách cảm ơn vì trông xe cẩn thận','Chú bắt được nhóm bùng tiền, khách vỗ tay bo thêm','Khách quen gửi tiền cà phê cho chú']});
  if(S.booker)list.push({role:'Lễ tân',name:BOOKER_NAME,look:BOOKER_LOOK,wage:BOOKER_WAGE,why:['Khách khen xếp sân nhanh','Nhóm văn phòng thích chị lễ tân nhớ lịch','Khách quen bo vì luôn giữ sân đẹp']});
  for(let i=0;i<Math.min(S.seller||0,MAX_SELLER);i++)list.push({role:'Bán hàng',name:SELLER_NAMES[i],look:SELLER_LOOKS[i],wage:SELLER_WAGE,why:['Khách khen bán nhanh nhẹn','Khách quen thích bạn cười tươi','Nhóm văn phòng bo vì đưa nước lẹ','Fan idol bo vì đưa nước lẹ giữa lúc đông']});
  const h=S.hist[S.day], avg=h&&h.n?h.s/h.n:4.5;
  const pBig=Math.max(0.08,Math.min(0.45,0.2+0.12*(avg-3.5)));      // quán được chấm sao cao thì khách hay bo hơn
  let shop=0,cust=0,bigAny=false;
  for(const x of list){
    x.base=Math.round(x.wage*TIP_RATE/100)*100||Math.round(x.wage*TIP_RATE);
    if(x.role==='Bán hàng'&&(S.stats.sellWrong||0)>=4)x.big=0;
    else x.big=Math.random()<pBig?pick(TIP_BIG):0;
    if(x.big){x.reason=pick(x.why);if(x.big>=300000)bigAny=true}
    x.say=x.big>=500000?'Trời ơi 500k! Mai em làm hết sức luôn ạ! 🥹':x.big>=300000?'Được bo đậm quá, em cảm ơn ạ! 🫶':x.big?'Hehe có tiền uống trà sữa rồi! 🧋':pick(['Em cảm ơn chủ quán ạ!','Mai em lại tới nha chủ!','Hôm nay vui ghê!']);
    shop+=x.base; cust+=x.big;
  }
  S.money-=shop; S.stats.tipShop=shop; S.stats.tipCust=cust; S.stats.tips=list.map(({why,...r})=>r);
  S.nextMorale=bigAny;
}
function endDay(){
  paused=true; planUpcoming();
  if(S.event&&S.event.day===S.day&&(S.event.state==='waiting'||S.event.state==='playing')){if(S.event.state==='waiting'){S.event.state='left';S.event.notes.push('tới giờ đóng cửa vẫn chưa có sân')}vipFinish()}
  S.qB=[];S.qD=[];closeSheet();
  dayTips();
  simulateBranches();
  S.weekRev=(S.weekRev||0)+(S.stats.court||0)+(S.stats.drink||0);
  let waste=0;const wasted=[];
  for(const it of ITEMS)if(it.perish&&S.stock[it.id]>0){waste+=S.stock[it.id]*unitCost(it.id);wasted.push(`${S.stock[it.id]} ${it.name.toLowerCase()}`);S.stock[it.id]=0}
  S.stats.waste=waste; S.stats.wasted=wasted.join(', ');
  const rv=genReviews(); S.todayIds=rv.map(r=>r.id); S.reviews=rv.concat(S.reviews).slice(0,40);
  const it=Math.round(S.debt*INTEREST); S.debt+=it; S.stats.interest=it;
  S.phase='closed'; save(); showSummary(); $('#over').scrollTop=0;
}
function showSummary(){
  $('#prepBg').style.display='none'; $('#over').classList.remove('prep');
  const st=S.stats, profit=S.money-st.start, lg=S.log;
  const rv=(S.todayIds||[]).map(id=>S.reviews.find(r=>r.id===id)).filter(Boolean);
  $('#over').innerHTML=`<div class="card box">
    <div class="hero">${avatar(OWNER_LOOK,profit>0?'happy':'meh')}</div>
    <h1>Đóng cửa ngày ${S.day}!</h1>
    <div style="text-align:center;margin:-6px 0 8px"><span class="shop-name">🏪 ${esc(S.name)}</span></div>
    <table class="sum">
      <tr><td>🏸 Tiền sân</td><td>${fmt(st.court)}</td></tr>
      <tr><td>🥤 Tiền nước & đồ ăn</td><td>${fmt(st.drink)}</td></tr>
      <tr><td>📦 Chi nhập hàng</td><td>−${fmt(st.cost)}</td></tr>
      ${st.wage?`<tr><td>👷 Lương nhân viên & bảo vệ</td><td>−${fmt(st.wage)}</td></tr>`:''}
      <tr><td>🗑️ Đồ tươi bỏ đi${st.wasted?` (${st.wasted})`:''}<br><small style="color:var(--soft)">phí phạm, đã nằm trong tiền nhập</small></td><td>${fmt(st.waste)}</td></tr>
      <tr><td>📦 Tồn kho sang mai<br><small style="color:var(--soft)">${ITEMS.filter(i=>!i.perish&&S.stock[i.id]>0).map(i=>`${S.stock[i.id]} ${i.name.toLowerCase()}`).join(', ')||'hết sạch'}</small></td><td></td></tr>
      ${st.bookOk||st.bookWrong?`<tr><td>📅 Lễ tân ${BOOKER_NAME}<br><small style="color:var(--soft)">xếp đúng ${st.bookOk||0} khách, xếp nhầm ${st.bookWrong||0} lần${st.bookFixed?`, chủ quán xếp lại ${st.bookFixed}`:''}</small></td><td></td></tr>`:''}
      ${st.sellOk||st.sellWrong?`<tr><td>🧑‍💼 Nhân viên bán hàng<br><small style="color:var(--soft)">bán đúng ${st.sellOk||0} đơn, bán nhầm ${st.sellWrong||0} lần${(st.sellOk||0)+(st.sellWrong||0)?` (${Math.round((st.sellWrong||0)/((st.sellOk||0)+(st.sellWrong||0)+(st.fixedEarly||0))*100)}% đơn giao nhầm)`:''}${st.fixed?`, chủ quán đổi lại ${st.fixed} đơn`:''}${st.fixedEarly?`, sửa kịp trước khi giao ${st.fixedEarly} lần`:''}</small></td><td></td></tr>`:''}
      ${S.event&&S.event.day===S.day&&S.event.state==='done'?`<tr><td>🌟 VĐV ${esc(S.event.vip.n)} giao lưu<br><small style="color:var(--soft)">${S.event.ok?'hài lòng, quán nổi tiếng':'không hài lòng'+(S.event.notes.length?': '+S.event.notes.join(', '):'')} (điểm ${S.event.score}/100)</small></td><td>${S.event.ok?'✅ +'+fmt(st.vipTip||0):'❌ dính phốt'}</td></tr>`:''}
      ${st.caught?`<tr><td>🛡️ Bảo vệ bắt được vụ bùng tiền (${st.caught} lượt)</td><td>+${fmt(st.caughtAmt)}</td></tr>`:''}
      ${st.dash?`<tr><td>🏃 Khách bùng tiền sân (${st.dash} lượt)</td><td>−${fmt(st.dashLoss)}</td></tr>`:''}
      <tr><td>😊 Lượt phục vụ</td><td>${st.served}</td></tr>
      <tr><td>😠 Khách không vui</td><td>${st.lost}</td></tr>
      <tr><td>🧹 Khách vô sân dơ</td><td>${lg.dirty||0}</td></tr>
      <tr><td>⭐ Sao khách chấm hôm nay<br><small style="color:var(--soft)">${(S.hist[S.day]&&S.hist[S.day].n)||0} lượt chấm${S.hist[S.day]&&S.hist[S.day].c?': '+S.hist[S.day].c.map((x,i)=>x?`${x}×${i+1}★`:'').filter(Boolean).reverse().join(', '):''}</small></td><td>${S.hist[S.day]&&S.hist[S.day].n?(S.hist[S.day].s/S.hist[S.day].n).toFixed(1):'–'}</td></tr>
      <tr><td>⭐ Sao quán (TB 7 ngày gần nhất)${replyBonus()>0?`<br><small style="color:var(--soft)">đã gồm +${replyBonus().toFixed(2)}★ uy tín từ phản hồi tốt</small>`:''}</td><td>${S.rating.toFixed(1)}</td></tr>
      ${st.fine?`<tr><td>😱 Mất do tụt dưới 3 sao</td><td>−${fmt(st.fine)}</td></tr>`:''}
      <tr class="total"><td>💰 Lãi hôm nay</td><td>${fmt(profit)}</td></tr>
      <tr><td>🏦 Tiền lãi ngân hàng (${(INTEREST*100).toLocaleString('vi-VN')}%/ngày, cộng vào nợ)</td><td>+${fmt(st.interest||0)}</td></tr>
      ${st.repaid?`<tr><td>🏦 Đã trả nợ sáng nay</td><td>${fmt(st.repaid)}</td></tr>`:''}
      <tr><td>🏦 Nợ ngân hàng còn</td><td>${S.debt>0?fmt(S.debt):'Hết nợ 🎉'}</td></tr>
      <tr><td>💼 Tài sản ròng (tiền mặt − nợ)</td><td>${fmt(S.money-S.debt)}</td></tr>
    </table>
    ${branchesSummaryHTML()}
    ${casesSummaryHTML()}
    ${(st.oev&&st.oev.length)?`<h3>🎲 Chuyện của chủ quán hôm nay</h3><table class="sum">${st.oev.map(o=>`<tr><td>${o.icon} ${esc(o.text)}</td><td>${o.amt>0?'+'+fmt(o.amt):o.amt<0?'−'+fmt(-o.amt):'–'}</td></tr>`).join('')}</table>`:''}
    ${(st.tips&&st.tips.length)?`<h3>💝 Tip cho nhân viên</h3>
    <p>Quán bo mỗi bạn ${(TIP_RATE*100).toLocaleString('vi-VN')}% tiền công. Hôm nào khách vui thì có khi được khách bo thêm 100k đến 500k.</p>
    <div class="tips">${st.tips.map(x=>`<div class="tip ${x.big>=300000?'big':''}">
      <div class="face">${avatar(x.look,'happy')}</div>
      <div class="tip-mid"><b>${x.name}</b> <small>${x.role}</small>
        <div class="tip-l">Quán bo ${(TIP_RATE*100).toLocaleString('vi-VN')}% công: <b>${fmt(x.base)}</b></div>
        ${x.big?`<div class="tip-l cust">🎁 Khách bo thêm: <b>${fmt(x.big)}</b> <small>(${x.reason})</small></div>`:''}
        <div class="tip-say">${x.say}</div></div>
      ${x.big>=300000?'<span class="tip-conf">🎉</span>':''}</div>`).join('')}</div>
    <table class="sum"><tr><td>💝 Quán bo nhân viên</td><td>−${fmt(st.tipShop||0)}</td></tr>
      ${st.tipCust?`<tr><td>🎁 Khách bo nhân viên<br><small style="color:var(--soft)">tiền của nhân viên, không tính vào quỹ quán</small></td><td>${fmt(st.tipCust)}</td></tr>`:''}</table>
    ${S.nextMorale?'<p class="tip-note">💪 Nhân viên được bo đậm nên mai làm hăng hơn: bán ít nhầm hơn, dọn sân nhanh hơn (nếu thuê lại).</p>':''}`:''}
    ${S.upcoming?`<div class="ev-card" style="margin:10px 0"><b>📣 Tin nóng ngày mai!</b><br>${S.upcoming.vip.f} <b>${esc(S.upcoming.vip.n)}</b> (${S.upcoming.vip.r}) sẽ bao hết sân từ <b>${hm(S.upcoming.arrive)}</b> đến <b>${hm(S.upcoming.arrive+S.upcoming.dur)}</b>. Sáng mai nhớ nhập thêm nước, đồ ăn và thuê thêm nhân viên bán hàng nha!</div>`:''}
    <h3>📱 Dân mạng nói gì về quán hôm nay</h3>
    <p>Tự viết phản hồi cho khách. Lời lẽ cầu thị (xin lỗi, khắc phục, cải thiện, cố gắng, ạ...) thì khách dịu lại và quán được <b>cộng điểm uy tín vào sao</b>. Cà khịa hay chửi khách là khách chửi lại, drama lan khắp mạng và <b>bị trừ ${fmt(RUDE_FINE)}</b>!</p>
    <div class="rvs">${rv.map(reviewHTML).join('')}</div>
    <button class="btn ghost press" id="sumKey">💾 Lấy mã lưu game</button>
    <button class="btn press" id="nextDay">Sang ngày ${S.day+1}</button></div>`;
  $('#sumKey').onclick=showKey;
  $('#over').style.display='flex';
  $('#over').querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>openCase(b.dataset.case));
  if(casesToday().length&&!S.casesShown){S.casesShown=true;setTimeout(()=>openCase(casesToday()[0].id),500)}
  $('#nextDay').onclick=()=>{
    const keepBroken=S.courts.map(x=>x&&x.broken&&!x.broken.repair?x.broken:null);
    const openCases=casesToday(); if(openCases.length&&!confirm(`Còn ${openCases.length} hồ sơ công an chưa xử lý. Sang ngày mới thì hồ sơ bị đóng, không thu hồi được tiền. Vẫn sang ngày?`))return;
    openCases.forEach(c=>c.state='expired'); S.cases=[];
    S.casesShown=false;
    releaseCollateral();
    S.lastSold=S.stats.sold; S.day++; Object.assign(S,dayState(S.money)); S.todayIds=[]; planEvent(); planWeather(); planIncident(); taxOnNewDay();
    keepBroken.forEach((b,i)=>{if(b&&S.courts[i])S.courts[i].broken=b});
    courtSay={}; S.phase='prep'; save(); cloudAutoSync(); showPrep(); $('#over').scrollTop=0;
  };
  $('#over').onclick=null;
  {
  };
}
let scTimer=null;
function setScene(t){
  const sp=$('#splash'); sp.dataset.t=t;
  sp.querySelectorAll('.sc-time button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));
  try{localStorage.setItem('sancaulong-scene',t)}catch(e){}
}
function startScreen(){
  const saved=load();
  const kfmt=m=>(m/1000).toLocaleString('vi-VN',{maximumFractionDigits:1})+'k';
  $('#saveLine').textContent=saved?`${saved.name} · Ngày ${saved.day} · ${kfmt(saved.money)} · ${saved.rating.toFixed(1)}★${saved.debt>0?' · nợ '+tr(saved.debt):''}`:'Quán mới toanh, chờ chủ quán tới!';
  $('#sPlay').textContent=saved?'Chơi tiếp':'Mở quán';
  $('#sFresh').hidden=!saved;
  $('#over').style.display='none';
  // chữ tiêu đề nhảy sóng
  document.querySelectorAll('.sc-title span').forEach((sp,k)=>{
    if(sp.dataset.done)return; sp.dataset.done=1;
    sp.innerHTML=[...sp.textContent].map((ch,i)=>ch===' '?' ':`<i style="animation-delay:${(i*0.07+k*0.35).toFixed(2)}s">${ch}</i>`).join('');
  });
  // cảnh theo giờ thật, có thể tự đổi
  const h=new Date().getHours(); let t=h>=5&&h<16?'morning':h>=16&&h<19?'sunset':'night';
  try{t=localStorage.getItem('sancaulong-scene')||t}catch(e){}
  setScene(t);
  $('#splash').style.display='flex';
  const art=$('#scArt');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches&&art.pauseAnimations)art.pauseAnimations();
  // bảng điểm nhảy số theo từng pha cầu
  let L=0,R=0; clearInterval(scTimer);
  scTimer=setInterval(()=>{Math.random()<.5?L++:R++; if(L>=21||R>=21){L=0;R=0} $('#scL').textContent=L; $('#scR').textContent=R},2400);
  const resume=()=>{
    clearInterval(scTimer); $('#splash').style.display='none';
    render();
    if(S.phase==='prep')return showPrep();
    if(S.phase==='closed')return showSummary();
    $('#over').style.display='none';paused=false;last=performance.now();
    ownerSay(`Mừng chủ quán quay lại! Tiếp tục ngày ${S.day} nha.`);
  };
  const fresh=()=>askName('',n=>askLoan(n,c=>{S=newGame(n,c);save();resume()}),true);
  $('#sPlay').onclick=()=>{if(saved){S=saved;resume()}else fresh()};
  $('#sFresh').onclick=()=>{if(!confirm('Chơi lại từ đầu sẽ xoá tiến trình hiện tại. Nhớ lấy mã lưu game trước nếu muốn giữ lại. Chắc chưa?'))return;fresh()};
  $('#sImport').onclick=()=>askImport(st=>{S=st;save();resume();ownerSay(`Chào mừng quay lại ${S.name}!`)},!!saved);
  $('#sGuide').onclick=()=>{$('#guide').style.display='flex'};
  $('#gClose').onclick=()=>{$('#guide').style.display='none'};
  document.querySelectorAll('.sc-time button').forEach(b=>b.onclick=()=>setScene(b.dataset.t));
}
