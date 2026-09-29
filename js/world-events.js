// world-events.js — Thời tiết (mưa, ngập sân), thuế hằng tuần, vụ tiền giả / trộm đồ và hồ sơ điều tra của công an

// ================= THỜI TIẾT =================
const RAIN_CHANCE=0.22, HEAVY_CHANCE=0.35;
function planWeather(){
  if(Math.random()>=RAIN_CHANCE){S.weather=null;return}
  const whole=Math.random()<.2, from=whole?OPEN:(9+rand(8))*60, len=whole?CLOSE-OPEN:(2+rand(4))*60;
  S.weather={day:S.day,from,to:Math.min(CLOSE,from+len),heavy:Math.random()<HEAVY_CHANCE,mult:0.6+Math.random()*0.1,state:'pending'};
}
const isRaining=()=>{const w=S&&S.weather;return !!(w&&w.day===S.day&&S.time>=w.from&&S.time<w.to)};
const weatherMult=()=>isRaining()?S.weather.mult:1;
function weatherTick(){
  const w=S.weather; if(!w||w.day!==S.day)return;
  if(w.state==='pending'&&S.time>=w.from){
    w.state='rain'; ownerSay(pick(['Trời mưa rồi, ế vãi 😩☔','Mưa tầm tã, khách không ai ra đường luôn 🌧️','Mưa kiểu này ngồi đếm ruồi thôi 😮‍💨']));
    toast(w.heavy?'⛈️ Mưa to! Coi chừng ngập sân':'🌧️ Trời mưa, khách thưa hẳn','bad');
  }
  if(w.state==='rain'&&w.heavy&&!w.flooded&&S.time>=w.from+(w.to-w.from)*.4){w.flooded=true;floodCourts()}
  if(w.state==='rain'&&S.time>=w.to){w.state='done';ownerSay('Tạnh mưa rồi, khách lại lác đác tới 🌤️')}
  document.body.classList.toggle('raining',isRaining());
  document.body.classList.toggle('storm',isRaining()&&w.heavy);
}
function floodCourts(){
  const fr=[];for(let c=1;c<=COURTS;c++)if(!isBroken(c)&&!playingOn(c))fr.push(c);
  if(!fr.length)return;
  const n=Math.min(fr.length,1+rand(3)), total=(2+rand(4))*1000000, per=Math.round(total/n/100000)*100000; const hit=[];
  for(let i=0;i<n;i++){const c=fr.splice(rand(fr.length),1)[0];S.courts[c-1].broken={kind:'Ngập nước',icon:'🌊',cost:per,min:20,flood:true};S.courts[c-1].dirty=false;S.jobs=S.jobs.filter(j=>j.court!==c);hit.push(c)}
  logO('🌊',`Mưa to ngập ${hit.length} sân (${hit.map(c=>'sân '+c).join(', ')})`,0);
  ownerSay(`Mưa to quá ngập luôn ${hit.length} sân rồi! Phải thuê người hút nước, lau sàn thôi 😫`); ownerAnim('sad','angry',5000);
  openRepair(hit,'flood');
}

// ================= THUẾ HẰNG TUẦN =================
const TAX_MIN_RATE=0.01, TAX_MAX_RATE=0.03, TAX_MIN=200000, TAX_GRACE=2, TAX_LATE_FEE=0.1, TAX_ARREST_FINE=10000000;
function taxOnNewDay(){
  // quá hạn -> chậm nộp, cảnh cáo; 3 lần -> công an niêm phong quán
  if(S.taxOwed>0&&S.day>S.taxDue&&!S.taxLocked){
    S.taxStrikes=(S.taxStrikes||0)+1; const fee=Math.round(S.taxOwed*TAX_LATE_FEE/1000)*1000; S.taxOwed+=fee; S.taxDue=S.day+TAX_GRACE;
    if(S.taxStrikes>=3){S.taxLocked=true;S.taxOwed+=TAX_ARREST_FINE;S.taxNotice='arrest'} else S.taxNotice='late';
    S.taxLastFee=fee;
  }
  // mỗi 7 ngày: thông báo đóng thuế tuần vừa rồi
  if(S.day>1&&(S.day-1)%7===0&&(S.weekRev||0)>0){
    const rate=Math.round((TAX_MIN_RATE+Math.random()*(TAX_MAX_RATE-TAX_MIN_RATE))*1000)/1000; S.taxRate=rate;
    const amt=Math.max(TAX_MIN,Math.round(S.weekRev*rate/1000)*1000);
    S.taxOwed=(S.taxOwed||0)+amt; if(!S.taxDue||S.taxDue<S.day)S.taxDue=S.day+TAX_GRACE; S.taxWeek=(S.day-1)/7; S.taxLastBill=amt; S.weekRev=0;
    if(!S.taxNotice)S.taxNotice='bill';
  }
}
function payTax(){
  const a=S.taxOwed||0; if(!a)return;
  const d=loseMoney(a); S.stats.tax=(S.stats.tax||0)+a;
  S.taxOwed=0; S.taxStrikes=0; S.taxDue=0; const wasLocked=S.taxLocked; S.taxLocked=false; S.taxNotice=null; save();
  toast(`🧾 Đã nộp thuế ${fmt(a)}`,'star');
  ownerSay(wasLocked?'Nộp đủ thuế và tiền phạt rồi, quán được gỡ niêm phong! 😮‍💨':'Nộp thuế xong, làm ăn đàng hoàng cho yên tâm ✅');
  if(d)setTimeout(()=>ownerSay(`Phải vay thêm ${fmt(d)} để nộp thuế 😓`),1500);
}
function prepNotices(){
  let h='';
  const w=S.weather;
  if(w&&w.day===S.day)h+=`<div class="ev-card wx-card"><b>${w.heavy?'⛈️ Dự báo mưa to':'🌧️ Dự báo có mưa'}</b> từ <b>${hm(w.from)}</b> đến <b>${hm(w.to)}</b>. Khách sẽ giảm còn khoảng ${Math.round(w.mult*100)}%.${w.heavy?' Mưa to có thể <b>ngập sân</b>, dọn dẹp tốn 2–5 triệu.':''} Nhập hàng vừa phải thôi nha.</div>`;
  if(S.taxOwed>0){
    const lk=S.taxLocked, late=S.taxStrikes||0;
    h+=`<div class="ev-card tax-card ${lk?'locked':late?'late':''}"><b>${lk?'🚔 QUÁN BỊ NIÊM PHONG DO NỢ THUẾ':late?`⚠️ Chậm nộp thuế lần ${late}/3`:'🧾 Thông báo nộp thuế'}</b><br>
      ${S.taxNotice==='bill'||(!late&&!lk)?`Thuế tuần ${S.taxWeek||''} (${((S.taxRate||0.02)*100).toLocaleString('vi-VN',{maximumFractionDigits:1})}% doanh thu tuần): <b>${fmt(S.taxLastBill||S.taxOwed)}</b>. `:''}
      ${lk?`Chậm nộp quá 3 lần nên công an đã tới làm việc và <b>niêm phong quán</b>, phạt thêm ${fmt(TAX_ARREST_FINE)}. Nộp đủ mới được mở cửa lại. `:late?`Đã phạt chậm nộp ${fmt(S.taxLastFee||0)}. Quá 3 lần sẽ bị công an niêm phong quán! `:''}
      Tổng phải nộp: <b>${fmt(S.taxOwed)}</b>${lk?'':` · Hạn chót: <b>hết ngày ${S.taxDue}</b>`}.
      <div class="mrow" style="margin-top:6px"><button class="btn press" id="taxPay">🧾 Nộp thuế ${fmt(S.taxOwed)}${S.money<S.taxOwed?' (vay thêm)':''}</button></div></div>`;
  }
  return h;
}
function bindPrepNotices(){ const b=$('#taxPay'); if(b)b.onclick=()=>{payTax();keepScroll(showPrep)} }
function taxBlocksOpen(){
  if(!S.taxLocked)return false;
  openModal(`<div class="vip-fx bad">🚔🚨🚔</div><h2>Quán đang bị niêm phong!</h2><p style="text-align:center">Chậm nộp thuế quá 3 lần nên công an đã niêm phong quán. Nộp đủ <b>${fmt(S.taxOwed)}</b> (gồm tiền phạt) mới được mở cửa lại.</p>
    <div class="mrow"><button class="btn press" id="taxPay2">🧾 Nộp ngay${S.money<S.taxOwed?' (vay thêm)':''}</button><button class="btn ghost press" data-mclose>Để sau</button></div>`);
  $('#taxPay2').onclick=()=>{payTax();closeModal(true);keepScroll(showPrep)};
  return true;
}

// ================= TIỀN GIẢ / TRỘM ĐỒ -> HỒ SƠ ĐIỀU TRA =================
const CASE_REWARD=1000000, CASE_FINE=7000000;
const FAKE_ALIBI=['Thanh toán chuyển khoản quét mã VietQR, có tin nhắn báo trừ tiền rõ ràng.','Chỉ có tiền lẻ 5k, 10k cũ nát, không hề có tờ tiền chẵn nào.','Mải quay video review, tờ tiền đưa vào quầy chuẩn polymer, soi thấy dải dạ quang.','Trả bằng ví điện tử, có mã giao dịch lưu trong máy quầy.','Đưa tờ 50k mới cứng, soi đèn thấy hình bóng chìm rõ nét.','Đi cùng nhóm, người khác trả hộ bằng thẻ ngân hàng.'];
const STEAL_ALIBI=['Ngồi ghế chờ suốt buổi, hai tay cầm điện thoại chơi game.','Mua xong có hoá đơn in từ máy, trả đủ tiền.','Chỉ ghé mượn nhà vệ sinh, camera không thấy đi ngang quầy.','Đánh liên tục 2 tiếng trên sân, không rời sân lần nào.','Tới lấy đồ bỏ quên, đi cùng nhân viên từ đầu tới cuối.','Có ra vào quầy nhưng hai tay trống trơn, túi áo xẹp lép.'];
const SUSPECT_TAGS=['Reviewer','IT','Sinh Viên','Văn Phòng','Shipper','Hàng Xóm','Tay Vợt Phong Trào','Grab'];
function planIncident(){S.incPlan=Math.random()<0.4?{at:8*60+rand(52)*15,done:false}:null}
function incidentTick(){
  const o=S.incPlan; if(!o||o.done||S.time<o.at)return;
  if(cur||$('#modal').classList.contains('on'))return;
  const ev=evNow(); if(ev&&ev.state==='playing')return;
  o.done=true;
  const pool=S.menu.filter(id=>IT[id]); const id=pick(pool.length?pool:['tra']);
  let c;
  if(Math.random()<.55){
    const note=pick([100000,200000,500000]); const amt=note;
    loseMoney(amt); c={type:'fake',item:id,amount:amt,note};
    ownerSay(`Ơ tờ ${fmt(note)} khách vừa trả mua ${IT[id].name.toLowerCase()} là TIỀN GIẢ rồi! 😡 Cuối ngày báo công an trích xuất camera.`);
    toast(`💸 −${fmt(amt)} tiền giả!`,'bad');
  } else {
    const qty=2+rand(4), have=Math.min(qty,S.stock[id]||0); if(have<=0){o.done=true;return}
    if(S.guard&&Math.random()<.5){guardSay('Đứng lại! Trả đồ đây! 🫷');ownerSay(`Bảo vệ tóm được khách định lấy trộm ${have} ${IT[id].name.toLowerCase()}!`);logO('🛡️','Bảo vệ ngăn khách lấy trộm đồ',0);return}
    S.stock[id]-=have; const amt=have*priceOf(id); c={type:'steal',item:id,qty:have,amount:amt};
    ownerSay(`Ủa sao tủ mất ${have} ${IT[id].name.toLowerCase()}? Có người lấy trộm rồi! 😤 Cuối ngày báo công an.`);
    toast(`🥷 Mất ${have} ${IT[id].name.toLowerCase()}`,'bad');
  }
  // 4 nghi phạm, 1 người đúng
  const names=[...NAMES].sort(()=>Math.random()-.5).slice(0,4), culprit=rand(4), alibis=[...(c.type==='fake'?FAKE_ALIBI:STEAL_ALIBI)].sort(()=>Math.random()-.5);
  c.suspects=names.map((n,i)=>({name:`${n} ${pick(SUSPECT_TAGS)}`,look:makeLook(n),clue:i===culprit?(c.type==='fake'?`Camera ghi nhận khách trả tờ ${fmt(c.note)} nhòe mờ, mất dải phản quang khi mua ${IT[c.item].name} rồi vội vã rời đi.`:`Camera quay cảnh lén nhét ${c.qty} ${IT[c.item].name.toLowerCase()} vào balo lúc quầy đông rồi đi thẳng ra cổng.`):alibis[i]}));
  c.culprit=culprit; c.id='case'+(++uid); c.state='open';
  // nhân viên "đoán" giúp, khoảng 60% đúng
  const staff=S.seller?SELLER_NAMES[0]:S.booker?BOOKER_NAME:S.staff?'Bạn '+STAFF_NAMES[0]:null;
  if(staff)c.hint={who:staff,idx:Math.random()<.6?culprit:(culprit+1+rand(3))%4};
  (S.cases||(S.cases=[])).push(c); L(c.type==='fake'?'fakeMoney':'stolen');
}
function casesToday(){return (S.cases||[]).filter(c=>c.state==='open')}
function openCase(id){
  const c=(S.cases||[]).find(x=>x.id===id); if(!c||c.state!=='open')return;
  const t=c.type==='fake'?'VỤ ÁN TIỀN GIẢ':'VỤ ÁN TRỘM ĐỒ';
  openModal(`<div class="case">
    <div class="case-badge">🚨 CÔNG AN PHƯỜNG TRÍCH XUẤT CAMERA</div>
    <h2 class="case-h">HỒ SƠ ĐIỀU TRA: ${t}</h2>
    <p>${c.type==='fake'?`Quán vừa bị lừa đưa <b>TIỀN GIẢ</b> (đơn hàng: <b>${IT[c.item].name}</b>, thiệt hại: <b class="neg">−${fmt(c.amount)}</b>).`:`Tủ bị lấy trộm <b>${c.qty} ${IT[c.item].name.toLowerCase()}</b> (thiệt hại: <b class="neg">−${fmt(c.amount)}</b>).`} Công an đã khoanh vùng được <b>4 nghi phạm</b> dưới đây. Hãy nhận diện đúng người!</p>
    <div class="case-rule">⚖️ <b>Quy định xử lý theo pháp luật:</b><br>✅ <b>Chỉ điểm ĐÚNG:</b> thu hồi thiệt hại, thưởng <b class="pos">+${fmt(CASE_REWARD)}</b> & tăng điểm sao quán ⭐<br>❌ <b>Chỉ điểm SAI:</b> bị phạt hành vi vu khống <b class="neg">−${fmt(CASE_FINE)}</b> & giảm điểm sao quán 📉</div>
    ${c.hint?`<div class="case-hint">📢 <b>${esc(c.hint.who)}:</b> "Sếp ơi! Em thấy nghi nhất là <b>Nghi phạm #${c.hint.idx+1}</b> nè!"<br><i>(⚠️ Đoán mò theo linh cảm thôi, chỉ nên nghe cho vui nha sếp!)</i></div>`:''}
    <div class="case-grid">${c.suspects.map((p,i)=>`<div class="sus"><div class="sus-h"><span class="face">${avatar(p.look,'meh')}</span><b>#${i+1}: ${esc(p.name)}</b></div><p>${esc(p.clue)}</p><button class="btn warn press" data-accuse="${i}">👉 Chỉ điểm</button></div>`).join('')}</div>
    <div class="mrow"><button class="btn ghost press" data-mclose>Để sau (quay lại)</button></div></div>`);
  $('#mcard').querySelectorAll('[data-accuse]').forEach(b=>b.onclick=()=>resolveCase(c,+b.dataset.accuse));
}
function resolveCase(c,i){
  const ok=i===c.culprit; c.state=ok?'solved':'wrong';
  const h=S.hist[S.day]||(S.hist[S.day]={s:0,n:0,c:[0,0,0,0,0]});
  if(ok){S.money+=c.amount+CASE_REWARD;h.eb=(h.eb||0)+0.05;L('caseOk')}
  else{const d=loseMoney(CASE_FINE);h.eb=(h.eb||0)-0.05;S.avgOn=true;c.debt=d;L('caseBad')}
  S.rating=calcRating(); save();
  const p=c.suspects[c.culprit];
  openModal(ok?`<div class="vip-fx">🚓✅🚓</div><h2>Bắt đúng người!</h2><p style="text-align:center"><b>${esc(p.name)}</b> đã nhận tội. Quán được thu hồi <b>${fmt(c.amount)}</b> và thưởng <b>${fmt(CASE_REWARD)}</b>. Sao quán tăng nhẹ ⭐</p><div class="mrow"><button class="btn press" data-mclose>Cảm ơn công an phường 🙏</button></div>`
    :`<div class="vip-fx bad">⚖️❌⚖️</div><h2>Chỉ điểm sai rồi!</h2><p style="text-align:center">Người đó vô tội. Thủ phạm thật là <b>${esc(p.name)}</b>. Quán bị phạt vu khống <b>${fmt(CASE_FINE)}</b>${c.debt?` (thiếu ${fmt(c.debt)} phải vay thêm)`:''} và giảm sao 📉</p><div class="mrow"><button class="btn warn press" data-mclose>Lần sau xem kỹ camera hơn</button></div>`,
    ()=>{if(S.phase==='closed')keepScroll(showSummary)});
}
function casesSummaryHTML(){
  const cs=(S.cases||[]).filter(c=>c.day===S.day||!c.day);
  if(!cs.length)return '';
  return `<h3>🚨 Biên bản làm việc với công an</h3><div class="case-list">${cs.map(c=>`<div class="case-row ${c.state}"><span class="ci">${c.type==='fake'?'💸':'🥷'}</span><div><b>${c.type==='fake'?'Vụ tiền giả':'Vụ trộm đồ'}</b> · ${IT[c.item].name} · −${fmt(c.amount)}<br><small>${c.state==='open'?'Chưa xử lý':c.state==='solved'?`✅ Đã bắt ${esc(c.suspects[c.culprit].name)}, thu hồi + thưởng`:`❌ Chỉ điểm sai, bị phạt ${fmt(CASE_FINE)}`}</small></div>${c.state==='open'?`<button class="btn press" data-case="${c.id}">Mở hồ sơ</button>`:''}</div>`).join('')}</div>`;
}
