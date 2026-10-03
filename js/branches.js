// branches.js — Mở rộng chi nhánh: bản đồ thành phố, mở chi nhánh (500tr, vay cần thế chấp 100tr),
// chi nhánh do nhân viên vận hành, mỗi ngày tự tính doanh thu/lợi nhuận khác nhau.

const COLLATERAL=50000000, BRANCH_COURTS=6, BRANCH_SELL_RATE=0.6;
const costOf=id=>(locOf(id)||{}).cost||100000000;
const BRANCH_LOCS=[
  {id:'tt', name:'Khu Trung Tâm',      icon:'🏙️', x:205,y:70,  f:1.30, drink:1.1, rent:900000, cost:500000000, desc:'Đông dân, dân văn phòng chịu chi, mặt bằng đắt'},
  {id:'dh', name:'Khu Làng Đại Học',   icon:'🎓', x:330,y:58,  f:1.10, drink:1.4, rent:450000, cost:180000000, desc:'Sinh viên đông, giá rẻ dễ đông, uống nước nhiều'},
  {id:'ss', name:'Khu Dân Cư Ven Sông',icon:'🌊', x:85, y:118, f:0.95, drink:0.9, rent:400000, cost:120000000, desc:'Gia đình, khách quen cuối tuần, ổn định'},
  {id:'cn', name:'Khu Công Nghiệp',    icon:'🏭', x:345,y:210, f:0.85, drink:1.2, rent:300000, cost:80000000, desc:'Công nhân đánh tối, mặt bằng rẻ'},
  {id:'cc', name:'Khu Chung Cư Mới',   icon:'🏢', x:110,y:232, f:1.15, drink:1.0, rent:650000, cost:280000000, desc:'Cư dân trẻ, thích sân đẹp, sạch'},
  {id:'cd', name:'Khu Chợ Đêm',        icon:'🏮', x:255,y:250, f:1.05, drink:1.5, rent:550000, cost:220000000, desc:'Đông về đêm, bán nước và đồ ăn rất chạy'},
  {id:'nt', name:'Khu Ngoại Ô',        icon:'🌾', x:30, y:175, f:0.6,  drink:0.8, rent:100000, cost:30000000,  desc:'Xa trung tâm, khách thưa, nhưng mở sân rẻ'}];
const MAIN_PIN={x:200,y:165};
const BR_ROLES=[
  {k:'manager',e:'👔',t:'Quản lý coi quán',wage:300000,min:1,max:1,need:1},
  {k:'seller', e:'🧑‍💼',t:'Nhân viên bán hàng',wage:SELLER_WAGE,min:1,max:3,need:2},
  {k:'cleaner',e:'🧹',t:'Nhân viên dọn sân',wage:WAGE,min:0,max:3,need:2},
  {k:'booker', e:'📅',t:'Lễ tân đặt sân',wage:BOOKER_WAGE,min:0,max:1,need:1},
  {k:'guard',  e:'🛡️',t:'Bảo vệ',wage:GUARD_WAGE,min:0,max:1,need:1}];
const locOf=id=>BRANCH_LOCS.find(l=>l.id===id);
const brWages=b=>BR_ROLES.reduce((a,r)=>a+(b.staff[r.k]||0)*r.wage,0);
const brDailyCost=b=>brWages(b)+locOf(b.loc).rent;
function brStaffScore(st){return BR_ROLES.reduce((a,r)=>a+Math.min(1,(st[r.k]||0)/r.need)*(r.k==='manager'?2:r.k==='guard'?.5:1),0)/5.5}

// ---- mỗi tối: chi nhánh tự tính doanh thu, lời lỗ ----
function simulateBranches(){
  const rows=[]; if(!S.branches||!S.branches.length){S.stats.branchRows=[];return}
  const w=S.weather&&S.weather.day===S.day?S.weather:null, rainF=w?(1+w.mult)/2:1;
  for(const b of S.branches){
    const L=locOf(b.loc), st=b.staff, sc=brStaffScore(st);
    const errs=(b.alertsMissed||0);
    const occ=Math.max(.12,Math.min(.85,(0.38+0.11*(b.rating-3))*L.f*rainF*(0.85+Math.random()*.3)*(0.6+0.4*sc)));
    const courtRev=Math.round(BRANCH_COURTS*16*occ*85000/1000)*1000;
    const drinkRev=Math.round(courtRev*0.25*L.drink*Math.min(1,(st.seller||0)/2)/1000)*1000;
    const goods=Math.round(drinkRev*0.45/1000)*1000, wages=brWages(b), rent=L.rent;
    let profit=courtRev+drinkRev-goods-wages-rent;
    // sự cố nhỏ ngẫu nhiên
    let note='';
    if(!(st.guard)&&Math.random()<.08){const loss=(1+rand(4))*1000000;profit-=loss;note=`bị trộm ${tr(loss)}`}
    else if(w&&w.heavy&&Math.random()<.4){const loss=(2+rand(3))*1000000;profit-=loss;note=`mưa ngập, dọn ${tr(loss)}`}
    else if(errs>0)note=`${errs} sự cố bán/đặt sai chưa xử lý`;
    if(errs){profit-=errs*200000;}
    b.rating=Math.max(2.5,Math.min(5,b.rating+(sc-.8)*.2-errs*.06+(Math.random()-.5)*.08)); b.alertsMissed=0; b.alerts=[];
    const rec={day:S.day,rev:courtRev+drinkRev,cost:goods+wages+rent+(profit<courtRev+drinkRev-goods-wages-rent?courtRev+drinkRev-goods-wages-rent-profit:0),profit,occ:Math.round(occ*100),note};
    b.hist=(b.hist||[]).concat(rec).slice(-14); b.total=(b.total||0)+profit;
    if(profit>=0)S.money+=profit; else loseMoney(-profit);
    rows.push({name:L.name,icon:L.icon,...rec});
  }
  S.stats.branchRows=rows; S.stats.branchProfit=rows.reduce((a,r)=>a+r.profit,0);
}
function releaseCollateral(){
  if(S.collateral>0&&S.debt<=0){S.money+=S.collateral;toast(`🏦 Trả hết nợ, ngân hàng hoàn ${fmt(S.collateral)} thế chấp`,'star');ownerSay(`Trả hết nợ rồi, ngân hàng trả lại ${fmt(S.collateral)} tiền thế chấp! 🎉`);S.collateral=0;save()}
}
function netWorth(){return S.money+(S.savings||0)+(S.collateral||0)+(S.branches||[]).reduce((a,b)=>a+costOf(b.loc),0)*BRANCH_SELL_RATE-S.debt}
function branchesSummaryHTML(){
  const rows=S.stats.branchRows||[]; if(!rows.length)return '';
  return `<h3>🗺️ Chi nhánh hôm nay</h3><table class="sum">${rows.map(r=>`<tr><td>${r.icon} ${esc(r.name)}<br><small style="color:var(--soft)">doanh thu ${fmt(r.rev)} · kín sân ${r.occ}%${r.note?' · '+esc(r.note):''}</small></td><td style="color:${r.profit>=0?'#1f8a4c':'#d6334f'}">${r.profit>=0?'+':'−'}${fmt(Math.abs(r.profit))}</td></tr>`).join('')}
    <tr class="total"><td>Lời/lỗ các chi nhánh (đã cộng vào tiền chủ quán)</td><td>${(S.stats.branchProfit||0)>=0?'+':'−'}${fmt(Math.abs(S.stats.branchProfit||0))}</td></tr></table>`;
}
function branchesBankHTML(){
  const bs=S.branches||[];
  return `<h3 class="sub">🐷 Gửi tiết kiệm (lãi ${(SAVING_RATE*100).toLocaleString('vi-VN')}%/ngày)</h3><div class="bank-card">
    <div class="bk-row"><span>Số dư tiết kiệm</span><b>${fmt(S.savings||0)}</b></div>
    <div class="bk-row"><span>Lãi dự kiến tối nay</span><b>+${fmt(Math.round((S.savings||0)*SAVING_RATE))}</b></div>
    <div class="sv-row"><input class="qin sv-in" id="svAmt" type="number" inputmode="numeric" min="0" step="100000" placeholder="Số tiền (đ)"><button class="btn press" id="svDep">Gửi</button><button class="btn ghost press" id="svWd">Rút</button></div>
    <div class="pay-chips">${[1,10,50].map(v=>`<button data-svq="${v*1000000}">${v} tr</button>`).join('')}<button data-svq="all">Tất cả</button></div></div>
    <h3 class="sub">💼 Tổng tài sản chủ quán</h3><div class="bank-card">
    <div class="bk-row"><span>💵 Tiền mặt</span><b>${fmt(S.money)}</b></div>
    ${S.collateral?`<div class="bk-row"><span>🔒 Tiền thế chấp ở ngân hàng</span><b>${fmt(S.collateral)}</b></div>`:''}
    ${S.savings?`<div class="bk-row"><span>🐷 Tiền gửi tiết kiệm</span><b>${fmt(S.savings)}</b></div>`:''}
    <div class="bk-row"><span>🏪 ${bs.length} chi nhánh (giá trị ~${Math.round(BRANCH_SELL_RATE*100)}%)</span><b>${fmt(bs.reduce((a,b)=>a+costOf(b.loc),0)*BRANCH_SELL_RATE)}</b></div>
    <div class="bk-row"><span>🏦 Nợ ngân hàng</span><b>−${fmt(S.debt)}</b></div>
    <div class="bk-row" style="border-top:2px dashed #1d2b36;margin-top:4px;padding-top:4px"><span><b>Tài sản ròng</b></span><b>${fmt(netWorth())}</b></div></div>
    <button class="btn ghost press" id="bkMap" style="width:auto">🗺️ Mở bản đồ chi nhánh</button>`;
}

// ---- bản đồ ----
let mapWasPaused=null, mapSel=null, brForm=null;
function mapSVG(){
  const bs=S.branches||[];
  const roads=['M0 150 H400','M200 0 V300','M0 40 Q140 95 400 25','M40 300 L150 0','M260 300 Q300 180 400 120'];
  let g=`<rect width="400" height="300" fill="#d7f0c8"/>
    <path d="M-10 190 Q80 150 140 205 T300 290 L300 310 L-10 310Z" fill="#9fd7f5" stroke="#1d2b36" stroke-width="2.5"/>
    <path d="M-10 190 Q80 150 140 205 T300 290" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 8" opacity=".7"/>
    ${roads.map(d=>`<path d="${d}" fill="none" stroke="#1d2b36" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f2ede4" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffd23f" stroke-width="1.5" stroke-dasharray="7 7"/>`).join('')}
    ${[[40,70],[300,140],[160,40],[365,280],[30,260]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="14" fill="#7fd08a" stroke="#1d2b36" stroke-width="2"/><circle cx="${x+9}" cy="${y-6}" r="8" fill="#5cc06f" stroke="#1d2b36" stroke-width="2"/>`).join('')}
    ${[[250,105],[140,110],[300,175],[60,30],[370,95],[170,250]].map(([x,y],i)=>`<rect x="${x-12}" y="${y-10}" width="24" height="20" rx="3" fill="${['#ffc2cc','#cde8ff','#fff0b3','#e2d6ff','#c8f5dc','#ffd9b8'][i]}" stroke="#1d2b36" stroke-width="2"/>`).join('')}`;
  g+=`<g class="pin main" data-pin="main" transform="translate(${MAIN_PIN.x} ${MAIN_PIN.y})"><circle r="17" fill="#ff5a7a" stroke="#1d2b36" stroke-width="3"/><text y="6" text-anchor="middle" font-size="17">🏸</text><text y="31" text-anchor="middle" class="pl">Quán chính</text></g>`;
  for(const L of BRANCH_LOCS){
    const b=bs.find(x=>x.loc===L.id);
    g+=b?`<g class="pin br ${mapSel===L.id?'sel':''} ${(b.alerts||[]).length?'alert':''}" data-pin="${L.id}" transform="translate(${L.x} ${L.y})"><circle r="15" fill="#34c46e" stroke="#1d2b36" stroke-width="3"/><text y="5" text-anchor="middle" font-size="15">${L.icon}</text><text y="28" text-anchor="middle" class="pl">${esc(L.name)}</text><text y="40" text-anchor="middle" class="pl s">${b.rating.toFixed(1)}★</text>${(b.alerts||[]).length?`<text x="14" y="-12" font-size="14">❗</text>`:''}</g>`
       :`<g class="pin lot ${mapSel===L.id?'sel':''}" data-pin="${L.id}" transform="translate(${L.x} ${L.y})"><circle r="13" fill="#fff" stroke="#1d2b36" stroke-width="2.5" stroke-dasharray="4 3"/><text y="5" text-anchor="middle" font-size="15" fill="#5f6f7a">＋</text><text y="26" text-anchor="middle" class="pl s">${esc(L.name)}</text><text y="37" text-anchor="middle" class="pl s price">${tr(L.cost)}</text></g>`;
  }
  return `<svg viewBox="0 0 400 300" class="mapsvg" role="img" aria-label="Bản đồ chi nhánh">${g}</svg>`;
}
function openMap(){
  if(!S)return; if(mapWasPaused===null){mapWasPaused=paused;paused=true}
  mapSel=null; brForm=null; renderMap(); $('#mapOv').hidden=false;
}
function closeMap(){ $('#mapOv').hidden=true; if(mapWasPaused!==null){paused=mapWasPaused;mapWasPaused=null;last=performance.now()} }
function renderMap(){
  const bs=S.branches||[], tot=bs.reduce((a,b)=>a+(b.hist&&b.hist.length?b.hist[b.hist.length-1].profit:0),0);
  $('#mapCard').innerHTML=`<div class="map-top"><h2>🗺️ Bản đồ chi nhánh</h2><button class="ib press" id="mapClose" aria-label="Đóng">✕</button></div>
    <div class="map-stats"><span>💵 Tiền chủ quán <b>${fmt(S.money)}</b></span><span>🏪 Chi nhánh <b>${bs.length}</b></span><span>📈 Hôm qua <b style="color:${tot>=0?'#1f8a4c':'#d6334f'}">${tot>=0?'+':'−'}${fmt(Math.abs(tot))}</b></span></div>
    <div class="map-wrap">${mapSVG()}</div><div class="map-panel" id="mapPanel">${mapPanelHTML()}</div>`;
  $('#mapClose').onclick=closeMap;
  $('#mapCard').querySelectorAll('[data-pin]').forEach(p=>p.onclick=()=>{const id=p.dataset.pin;mapSel=id==='main'?'main':id;brForm=null;if(id!=='main'&&!bs.find(b=>b.loc===id))brForm={loc:id,staff:{manager:1,seller:2,cleaner:2,booker:1,guard:0}};renderMap()});
  bindMapPanel();
}
function staffSteppers(st,prefix){
  return BR_ROLES.map(r=>`<div class="br-role"><span>${r.e} ${r.t}${r.min?' <i>(bắt buộc)</i>':''}<small>${fmt(r.wage)}/ngày</small></span><div class="stepper"><button data-${prefix}="${r.k}:-1" aria-label="Bớt">−</button><span>${st[r.k]||0}</span><button data-${prefix}="${r.k}:1" aria-label="Thêm">+</button></div></div>`).join('');
}
function mapPanelHTML(){
  const bs=S.branches||[];
  if(!mapSel)return `<p class="hint" style="text-align:center">Chạm vào <b>＋</b> để mở chi nhánh mới, chạm vào chi nhánh 🟢 để xem tình hình buôn bán.</p>`;
  if(mapSel==='main'){const st=S.stats;return `<h3>🏸 ${esc(S.name)} (quán chính)</h3><div class="bank-card"><div class="bk-row"><span>Số sân</span><b>${COURTS}</b></div><div class="bk-row"><span>Sao quán</span><b>${S.rating.toFixed(1)}★</b></div><div class="bk-row"><span>Doanh thu hôm nay (tới giờ)</span><b>${fmt((st.court||0)+(st.drink||0))}</b></div></div><p class="hint">Quán chính do chủ quán trực tiếp đứng quầy.</p>`}
  const L=locOf(mapSel), b=bs.find(x=>x.loc===mapSel);
  if(b){
    const h=b.hist||[], last=h[h.length-1], mx=Math.max(1,...h.map(x=>Math.abs(x.profit)));
    return `<h3>${L.icon} Chi nhánh ${esc(L.name)}</h3><p class="hint">${esc(L.desc)} · mở từ ngày ${b.openedDay} · ${BRANCH_COURTS} sân</p>
      <div class="bank-card"><div class="bk-row"><span>Sao chi nhánh</span><b>${b.rating.toFixed(1)}★</b></div>
      <div class="bk-row"><span>Hôm qua: doanh thu</span><b>${last?fmt(last.rev):'chưa có'}</b></div>
      <div class="bk-row"><span>Hôm qua: lời/lỗ</span><b style="color:${last&&last.profit<0?'#d6334f':'#1f8a4c'}">${last?(last.profit>=0?'+':'−')+fmt(Math.abs(last.profit)):'–'}</b></div>
      <div class="bk-row"><span>Tổng lời từ khi mở</span><b>${fmt(b.total||0)}</b></div>
      <div class="bk-row"><span>Chi phí cố định/ngày</span><b>${fmt(brDailyCost(b))}</b></div></div>
      ${h.length?`<div class="br-chart">${h.map(x=>`<div class="bc"><i style="height:${Math.round(Math.abs(x.profit)/mx*100)}%;background:${x.profit>=0?'#34c46e':'#ff5a7a'}"></i><small>${x.day}</small></div>`).join('')}</div><p class="hint" style="text-align:center">Lời/lỗ ${h.length} ngày gần nhất${last&&last.note?` · hôm qua ${esc(last.note)}`:''}</p>`:'<p class="hint">Chi nhánh mới mở, tối nay mới có số liệu.</p>'}
      ${(b.alerts||[]).length?`<div class="br-alerts"><b>🚨 Sự cố cần xử lý (${b.alerts.length})</b>${b.alerts.map((a,i)=>`<div class="br-alert"><span>${a.e} ${hm(a.t)} · ${esc(a.text)}</span><button class="btn press" data-fix="${i}">📞 Gọi quản lý xử lý · ${fmt(a.cost)}</button></div>`).join('')}<small>Không xử lý trong ngày thì khách bỏ đi, chi nhánh mất tiền đền và bị tụt sao.</small></div>`:''}
      <h3 class="sub">👥 Nhân sự (áp dụng từ hôm nay)</h3>${staffSteppers(b.staff,'bst')}
      <p class="hint">Thiếu người thì sân dơ, bán chậm, sao chi nhánh giảm dần. Đủ người thì sao tăng, khách đông hơn.</p>
      <div class="mrow"><button class="btn warn press" id="brSell">Bán chi nhánh · thu về ${fmt(costOf(b.loc)*BRANCH_SELL_RATE)}</button></div>`;
  }
  const f=brForm, wages=BR_ROLES.reduce((a,r)=>a+(f.staff[r.k]||0)*r.wage,0), cash=S.money, COST=costOf(f.loc);
  const canCash=cash>=COST, canLoan=!canCash&&cash>=COLLATERAL, pay=canCash?COST:Math.max(0,cash-COLLATERAL), loan=canCash?0:COST-pay;
  return `<h3>${L.icon} Mở chi nhánh ${esc(L.name)}</h3><p class="hint">${esc(L.desc)}</p>
    <div class="bank-card"><div class="bk-row"><span>Chi phí mở (xây ${BRANCH_COURTS} sân, mặt bằng, trang bị)</span><b>${fmt(COST)}</b></div>
    <div class="bk-row"><span>Tiền thuê mặt bằng/ngày</span><b>${fmt(L.rent)}</b></div>
    <div class="bk-row"><span>Lương nhân viên/ngày</span><b>${fmt(wages)}</b></div>
    <div class="bk-row"><span>Mức khách đông</span><b>${'🔥'.repeat(Math.round(L.f*3))}</b></div></div>
    <h3 class="sub">👥 Thuê nhân viên vận hành (bắt buộc có <b>nhân viên bán hàng</b> và <b>quản lý coi quán</b>)</h3>${staffSteppers(f.staff,'fst')}
    <h3 class="sub">💳 Thanh toán</h3><div class="bank-card">
      <div class="bk-row"><span>Tiền mặt đang có</span><b>${fmt(cash)}</b></div>
      ${canCash?`<div class="bk-row"><span>Trả thẳng bằng tiền mặt</span><b>−${fmt(COST)}</b></div>`:
       canLoan?`<div class="bk-row"><span>🔒 Thế chấp ngân hàng</span><b>${fmt(COLLATERAL)}</b></div><div class="bk-row"><span>Trả bằng tiền mặt</span><b>${fmt(pay)}</b></div><div class="bk-row"><span>🏦 Vay ngân hàng</span><b>${fmt(loan)}</b></div>`:
       `<div class="bk-row"><span style="color:#d6334f">Muốn vay ngân hàng cần ít nhất <b>${fmt(COLLATERAL)}</b> tiền mặt để thế chấp</span><b></b></div>`}</div>
    <div class="mrow"><button class="btn press" id="brOpen" ${canCash||canLoan?'':'disabled'}>${canCash?'🏪 Mở chi nhánh':canLoan?'🏦 Thế chấp, vay & mở':'Chưa đủ điều kiện'}</button></div>`;
}
function bindMapPanel(){
  const pn=$('#mapPanel'); if(!pn)return;
  pn.querySelectorAll('[data-fst],[data-bst]').forEach(btn=>btn.onclick=()=>{
    const isF=btn.hasAttribute('data-fst'), [k,d]=(btn.dataset.fst||btn.dataset.bst).split(':'), r=BR_ROLES.find(x=>x.k===k);
    const st=isF?brForm.staff:S.branches.find(b=>b.loc===mapSel).staff;
    st[k]=Math.max(r.min,Math.min(r.max,(st[k]||0)+ +d)); if(!isF)save(); renderMap();
  });
  pn.querySelectorAll('[data-fix]').forEach(btn=>btn.onclick=()=>{const b=S.branches.find(x=>x.loc===mapSel);const a=b.alerts.splice(+btn.dataset.fix,1)[0];if(!a)return;loseMoney(a.cost);toast(`✅ Đã xử lý sự cố chi nhánh ${locOf(b.loc).name}`,'star');ownerSay(`Quản lý chi nhánh ${locOf(b.loc).name} đã xin lỗi khách và ${a.kind==='book'?'xếp lại sân':'đổi lại món'} xong!`);save();renderMap()});
  const op=$('#brOpen'); if(op)op.onclick=()=>{
    const f=brForm, cash=S.money, COST=costOf(f.loc); let loan=0;
    if(!(f.staff.seller>=1&&f.staff.manager>=1))return toast('Cần có nhân viên bán hàng và quản lý coi quán','bad');
    if(cash>=COST)S.money-=COST;
    else if(cash>=COLLATERAL){const pay=cash-COLLATERAL;loan=COST-pay;S.money=0;S.collateral=(S.collateral||0)+COLLATERAL;S.debt+=loan;S.loan0+=loan}
    else return;
    (S.branches||(S.branches=[])).push({loc:f.loc,staff:{...f.staff},rating:4.2,openedDay:S.day,hist:[],total:0});
    L('branchOpen'); save(); brForm=null; renderMap();
    toast(`🏪 Khai trương chi nhánh ${locOf(f.loc).name}!`,'star'); confetti(30);
    ownerSay(`Khai trương chi nhánh ${locOf(f.loc).name} rồi! ${loan?`Vay thêm ${tr(loan)}, thế chấp ${tr(COLLATERAL)}. `:''}Tối nay xem doanh thu nha 🎉`);
  };
  const sl=$('#brSell'); if(sl)sl.onclick=()=>{
    const L=locOf(mapSel), v=costOf(mapSel)*BRANCH_SELL_RATE; if(!confirm(`Bán chi nhánh ${L.name} thu về ${fmt(v)}?`))return;
    S.branches=S.branches.filter(b=>b.loc!==mapSel); S.money+=v; save(); mapSel=null; renderMap();
    ownerSay(`Đã sang nhượng chi nhánh ${L.name}, thu về ${fmt(v)}.`);
  };
}

// ---- trong ngày: chi nhánh thỉnh thoảng bán sai / đặt sân sai -> ghim trên bản đồ nhấp nháy ----
function branchTick(dm){
  const bs=S.branches; if(!bs||!bs.length||S.phase!=='open')return;
  for(const b of bs){
    b.alerts=b.alerts||[];
    const orders=40*((locOf(b.loc)||{}).f||1);                  // số đơn ước tính mỗi ngày
    const pDay=orders*((SELLER_ERR_MIN+SELLER_ERR_MAX)/2)*((b.staff.seller||0)?1:3);
    if(Math.random()<pDay/(CLOSE-OPEN)*dm){
      const book=Math.random()<.4;
      b.alerts.push(book?{kind:'book',e:'📅',t:S.time,text:pick(['Lễ tân xếp trùng sân, 2 nhóm cãi nhau','Ghi nhầm giờ đặt sân, khách tới không có sân','Khách đặt 2 sân mà chỉ giữ được 1']),cost:100000+rand(3)*50000}
                       :{kind:'sell',e:'🥤',t:S.time,text:pick(['Nhân viên đưa nhầm nước cho khách','Tính tiền sai, khách phàn nàn','Đưa thiếu món, khách đòi đổi']),cost:30000+rand(4)*20000});
      if(b.alerts.length>3){b.alerts.shift();b.alertsMissed=(b.alertsMissed||0)+1}
      toast(`🚨 Chi nhánh ${locOf(b.loc).name} có sự cố, mở bản đồ kiểm tra!`,'bad');
    }
  }
}
const branchAlerts=()=>(S.branches||[]).reduce((a,b)=>a+((b.alerts||[]).length),0);
function branchEndOfDay(){(S.branches||[]).forEach(b=>{b.alertsMissed=(b.alertsMissed||0)+((b.alerts||[]).length)})}

function bindBankSavings(){
  const inp=$('#svAmt'); if(!inp)return;
  document.querySelectorAll('[data-svq]').forEach(b=>b.onclick=()=>{inp.value=b.dataset.svq==='all'?Math.max(0,Math.floor(S.money)):b.dataset.svq});
  const amt=()=>Math.max(0,Math.floor(Number(inp.value)||0));
  $('#svDep').onclick=()=>{const a=Math.min(amt(),Math.floor(S.money));if(a<=0)return toast('Nhập số tiền muốn gửi','bad');S.money-=a;S.savings=(S.savings||0)+a;save();toast(`🐷 Đã gửi ${fmt(a)}`,'star');keepScroll(showPrep)};
  $('#svWd').onclick=()=>{const a=Math.min(amt()||(S.savings||0),S.savings||0);if(a<=0)return toast('Chưa có tiền gửi để rút','bad');S.savings-=a;S.money+=a;save();toast(`💵 Đã rút ${fmt(a)}`,'star');keepScroll(showPrep)};
}
