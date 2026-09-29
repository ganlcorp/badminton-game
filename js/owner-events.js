// owner-events.js — Sự kiện chủ quán: trúng số, bitcoin, lừa đảo, cạy két, sân hỏng
// ===== SỰ KIỆN CỦA CHỦ QUÁN (lâu lâu xảy ra, hiện ở bong bóng chủ quán) =====
const OEV_W=[['lotoS',24],['lotoB',6],['btc',14],['scam',8],['theft',10],['break',12]];
const REPAIR_COST=5000000, REPAIR_MIN=30;
const BREAKS=[{kind:'Lưới rách',icon:'🕸️'},{kind:'Sàn bong keo',icon:'💥'},{kind:'Đèn sân cháy',icon:'💡'},{kind:'Cột lưới gãy',icon:'🪵'}];
let ownerAnimT=null;
function ownerAnim(cls,mood,ms){
  const f=$('#ownerFace'); f.innerHTML=chibi(OWNER_LOOK,mood,'owner');
  f.classList.remove('party','hop','sad'); void f.offsetWidth; f.classList.add(cls);
  clearTimeout(ownerAnimT); ownerAnimT=setTimeout(()=>{f.classList.remove(cls);lastMood=''},ms||4200);
}
function confetti(n,emo){
  const f=$('#ownerFace'); if(!f)return; const r=f.getBoundingClientRect();
  const set=emo||['🎉','🎊','✨','💸','🪙','🥳'];
  for(let i=0;i<n;i++){const e=document.createElement('span');e.className='confetti';e.textContent=pick(set);
    e.style.left=(r.left+r.width/2)+'px';e.style.top=(r.top+r.height/3)+'px';
    e.style.setProperty('--dx',(Math.random()*260-130)+'px');e.style.setProperty('--dy',(-80-Math.random()*220)+'px');e.style.setProperty('--rt',(Math.random()*720-360)+'deg');
    e.style.animationDelay=(Math.random()*.4)+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
}
function loseMoney(a){const cash=Math.min(Math.max(0,S.money),a);S.money-=cash;const rest=a-cash;if(rest>0)S.debt+=rest;return rest}
function logO(icon,text,amt){(S.stats.oev||(S.stats.oev=[])).push({icon,text,amt})}
function scheduleOwnerEvent(){S.oev=Math.random()<0.55?{at:8*60+rand(48)*15,done:false}:null}
function ownerEventTick(){
  const o=S.oev; if(!o||o.done||S.time<o.at)return;
  if(cur||$('#modal').classList.contains('on'))return;      // đợi bạn phục vụ xong khách đang mở
  const ev=evNow(); if(ev&&ev.state==='playing')return;       // không chen vào lúc idol đang giao lưu
  o.done=true;
  const pool=OEV_W.filter(([k])=>k!=='theft'||(S.staff||S.seller||S.guard||S.booker)).filter(([k])=>k!=='break'||freeCourtsForBreak().length);
  let tot=pool.reduce((a,[,w])=>a+w,0), r=Math.random()*tot, k=pool[0][0];
  for(const [kk,w] of pool){if((r-=w)<0){k=kk;break}}
  runOwnerEvent(k);
}
function freeCourtsForBreak(){const a=[];for(let c=1;c<=COURTS;c++)if(!isBroken(c)&&!playingOn(c))a.push(c);return a}
function runOwnerEvent(k){
  const wasP=paused, back=()=>{if(S.phase==='open'&&!wasP){paused=false;last=performance.now()}};
  if(k==='lotoS'){
    const a=pick([100000,200000,300000,1000000]); S.money+=a; logO('🎟️',`Chủ quán trúng vé số`, a);
    ownerSay(pick([`Ơ trúng vé số ${fmt(a)} nè! Tối nay bao trà sữa 😆`,`Hên ghê, dò vé số trúng ${fmt(a)}, vui nhẹ nhàng ☺️`,`Trúng ${fmt(a)} tiền vé số, mua thêm cầu cho quán 🏸`]));
    ownerAnim('hop','happy'); confetti(8); toast(`🎟️ +${fmt(a)} trúng số`,'star');
  }
  else if(k==='lotoB'){
    const a=pick([10,20,50])*1000000; S.money+=a; logO('🎰',`Chủ quán TRÚNG SỐ ĐẬM`, a);
    ownerSay(`TRÚNG SỐ ${tr(a).toUpperCase()}!!! Quẩy lên anh em ơiii 🎉🕺💃🔥`);
    ownerAnim('party','happy',7000); confetti(45); setTimeout(()=>confetti(30,['💃','🕺','🎶','🍾','🎉']),900);
    toast(`🎰 +${fmt(a)} TRÚNG SỐ!`,'star');
  }
  else if(k==='btc'){
    const a=(1+rand(20))*1000000;
    if(Math.random()<.5){S.money+=a; logO('📈',`Bitcoin lên, chủ quán chốt lời`, a);
      ownerSay(pick([`Bitcoin pump rồi! Chốt lời ${fmt(a)} 🚀`,`To the moon! Lời ${fmt(a)} tiền coin 📈😎`]));ownerAnim('hop','happy');confetti(12,['🚀','📈','🪙','💰']);toast(`📈 +${fmt(a)} bitcoin`,'star')}
    else{const debt=loseMoney(a); logO('📉',`Bitcoin sập, chủ quán cháy tài khoản`, -a);
      ownerSay(pick([`Bitcoin sập ${fmt(a)}... tưởng về bờ ai dè về bãi 😭📉`,`Đu đỉnh coin, mất ${fmt(a)}, thôi lo bán cầu vậy 🥲`])+(debt?` (thiếu ${fmt(debt)} phải vay thêm)`:''));
      ownerAnim('sad','angry');toast(`📉 −${fmt(a)} bitcoin`,'bad')}
  }
  else if(k==='scam'){
    const a=(2+rand(49))*1000000, how=pick(['Cuộc gọi giả danh cơ quan chức năng, bắt chuyển tiền "để xác minh"','Link "nhận quà tri ân khách hàng" gửi qua tin nhắn','Lời mời đầu tư sàn ảo "lãi 30% mỗi tháng"','Tin nhắn giả ngân hàng, bấm link rồi đăng nhập','Người lạ nhắn nhờ nạp tiền "làm nhiệm vụ nhận hoa hồng"']);
    const debt=loseMoney(a); logO('🎣',`Chủ quán bị lừa đảo qua mạng`, -a);
    ownerSay(`Huhu bị lừa qua mạng mất ${fmt(a)}... 😭`); ownerAnim('sad','angry',6000); toast(`🎣 −${fmt(a)} bị lừa`,'bad');
    paused=true; closeSheet();
    openModal(`<div class="mface">${avatar(OWNER_LOOK,'angry')}</div><h2>🎣 Bị lừa đảo qua mạng!</h2>
      <p style="text-align:center">Chủ quán mất <b>${fmt(a)}</b> vì: ${how}.</p>
      ${debt?`<p class="note" style="text-align:center">Tiền mặt không đủ nên ${fmt(debt)} bị cộng vào nợ ngân hàng.</p>`:''}
      <div class="tip-note" style="background:#fff0b3;color:#7a5a00!important">💡 Ngoài đời: không chuyển tiền cho người lạ, không bấm link lạ, không cung cấp mã OTP. Nghi ngờ thì gọi lại số tổng đài chính thức của ngân hàng.</div>
      <div class="mrow"><button class="btn warn press" data-mclose>Đau quá, rút kinh nghiệm</button></div>`,back);
  }
  else if(k==='theft'){
    const a=(1+rand(10))*1000000;
    const staffs=[]; if(S.booker)staffs.push({t:'booker',n:BOOKER_NAME}); if(S.seller)staffs.push({t:'seller',n:SELLER_NAMES[Math.min(S.seller,MAX_SELLER)-1]}); if(S.staff)staffs.push({t:'staff',n:'Bạn '+STAFF_NAMES[S.staff-1]});
    if(S.guard&&!staffs.length)staffs.push({t:'guard',n:'Chú Hùng'});
    const who=pick(staffs);
    if(S.guard&&who.t!=='guard'&&Math.random()<.6){ logO('🛡️',`Bảo vệ ngăn ${who.n} cạy két`,0);
      guardSay(`Đứng lại! Cạy két hả ${who.n}! 🫷`); ownerSay(`Bảo vệ bắt quả tang ${who.n} định cạy két, may quá không mất đồng nào!`); ownerAnim('hop','meh'); return }
    const debt=loseMoney(a); logO('🧰',`Két bị cạy, mất tiền`, -a);
    ownerSay(`Trời ơi két bị cạy mất ${fmt(a)}! 😱`); ownerAnim('sad','angry',6000); toast(`🧰 −${fmt(a)} két bị cạy`,'bad');
    paused=true; closeSheet();
    openModal(`<div class="mface">${avatar(OWNER_LOOK,'angry')}</div><h2>🧰 Két tiền bị cạy!</h2>
      <p style="text-align:center">Mất <b>${fmt(a)}</b>. ${has('cam')?`Camera quay rõ mặt <b>${who.n}</b> lấy tiền.`:`Nghi ngờ <b>${who.n}</b> lấy, nhưng quán chưa có camera.`}</p>
      ${debt?`<p class="note" style="text-align:center">Tiền mặt không đủ nên ${fmt(debt)} bị cộng vào nợ.</p>`:''}
      <div class="mrow"><button class="btn press" id="callPolice">🚓 Báo công an</button><button class="btn ghost press" data-mclose>Thôi bỏ qua</button></div>`,back);
    $('#callPolice').onclick=()=>{
      const ok=Math.random()<(has('cam')?1:.65);
      if(ok){S.money+=a; if(who.t==='booker'){S.booker=0;S.bookJob=null} else if(who.t==='seller')S.seller=Math.max(0,S.seller-1); else if(who.t==='staff')S.staff=Math.max(0,S.staff-1); else S.guard=0;
        if(S.sellJobs)S.sellJobs=S.sellJobs.filter(J=>J.sid<S.seller);
        logO('🚓',`Công an bắt ${who.n}, thu hồi tiền`, a);
        openModal(`<div class="vip-fx">🚓🚨🚓</div><h2>Đã bắt được ${esc(who.n)}!</h2><p style="text-align:center">Công an tới quán, ${esc(who.n)} bị đưa về đồn. Quán lấy lại đủ <b>${fmt(a)}</b>. ${esc(who.n)} bị cho nghỉ việc ngay hôm nay.</p><div class="mrow"><button class="btn press" data-mclose>Cảm ơn các anh công an 🙏</button></div>`,back);
        ownerSay(`Công an bắt ${who.n} rồi, lấy lại đủ ${fmt(a)}! Hết dám cạy két nha 😤`); toast(`🚓 +${fmt(a)} thu hồi`,'star');
      } else {
        logO('🚓',`Đã báo công an, chưa tìm ra thủ phạm`,0);
        openModal(`<div class="mface">${avatar(OWNER_LOOK,'meh')}</div><h2>🚓 Đã trình báo</h2><p style="text-align:center">Công an ghi nhận nhưng chưa đủ bằng chứng để bắt. Lắp <b>camera an ninh</b> (tab Nâng cấp) để lần sau có bằng chứng rõ ràng.</p><div class="mrow"><button class="btn press" data-mclose>Đành vậy</button></div>`,back);
      }
    };
  }
  else if(k==='break'){
    const fr=freeCourtsForBreak(); const n=Math.min(fr.length,1+rand(3)); const hit=[];
    for(let i=0;i<n;i++){const c=fr.splice(rand(fr.length),1)[0];const b=pick(BREAKS);S.courts[c-1].broken={kind:b.kind,icon:b.icon};S.courts[c-1].dirty=false;S.jobs=S.jobs.filter(j=>j.court!==c);hit.push(c)}
    logO('🔨',`Nhóm khách quậy làm hư ${hit.length} sân (${hit.map(c=>'sân '+c).join(', ')})`,0);
    ownerSay(`Trời ơi nhóm khách quậy quá làm hư ${hit.length} sân rồi! Phải gọi thợ sửa thôi 😫`); ownerAnim('sad','angry',5000);
    openRepair(hit,true);
  }
  save();
}
function openRepair(list,fresh){
  list=list.filter(c=>isBroken(c)&&!S.courts[c-1].broken.repair); if(!list.length)return ownerSay('Thợ đang sửa rồi, chờ xíu nha!');
  const all=[];for(let c=1;c<=COURTS;c++)if(isBroken(c)&&!S.courts[c-1].broken.repair)all.push(c);
  const wasP=paused; paused=true; closeSheet();
  const back=()=>{if(S.phase==='open'&&!wasP){paused=false;last=performance.now()}};
  const cost=all.length*REPAIR_COST, short=Math.max(0,cost-Math.max(0,S.money));
  openModal(`<div class="mface">${avatar(OWNER_LOOK,'meh')}</div><h2>🔨 ${fresh?'Sân bị làm hư!':'Sửa sân hỏng'}</h2>
    <div class="rp-list">${all.map(c=>`<div class="rp-row"><span>${S.courts[c-1].broken.icon}</span><b>Sân ${c}</b><small>${S.courts[c-1].broken.kind}</small><span>${fmt(REPAIR_COST)}</span></div>`).join('')}</div>
    <p style="text-align:center">Sân hỏng thì <b>không xếp khách được</b>. Thợ sửa mỗi sân <b>${fmt(REPAIR_COST)}</b>, khoảng ${REPAIR_MIN} phút.</p>
    ${short?`<p class="note" style="text-align:center">Tiền mặt không đủ, sẽ <b>vay ngân hàng ${fmt(short)}</b> (lãi ${(INTEREST*100).toLocaleString('vi-VN')}%/ngày).</p>`:''}
    <div class="mrow"><button class="btn press" id="rpAll">🔧 ${short?'Vay & sửa':'Sửa'} ${all.length} sân · ${fmt(cost)}</button><button class="btn ghost press" data-mclose>Để sau</button></div>`,back);
  $('#rpAll').onclick=()=>{
    const d=loseMoney(cost); S.stats.repair=(S.stats.repair||0)+cost; logO('🔧',`Sửa ${all.length} sân${d?`, vay thêm ${tr(d)}`:''}`,-cost);
    for(const c of all)S.courts[c-1].broken.repair={start:S.time,until:S.time+REPAIR_MIN};
    closeModal(); ownerSay(`Đã gọi thợ sửa ${all.length} sân, khoảng ${REPAIR_MIN} phút là xong!${d?` Phải vay thêm ${fmt(d)} 😓`:''}`); save();
  };
}
function repairTick(){for(let c=1;c<=COURTS;c++){const b=S.courts[c-1]&&S.courts[c-1].broken;if(b&&b.repair&&S.time>=b.repair.until){S.courts[c-1].broken=null;ownerSay(`Sân ${c} sửa xong rồi, xếp khách được rồi nha! 🔧✨`);toast(`🔧 Sân ${c} đã sửa xong`,'star')}}}
function tapCourt(c){
  if(!S||paused||S.phase!=='open')return;
  if(c>COURTS)return ownerSay(`Sân ${c} chưa xây. Lúc chuẩn bị vào tab Ngân hàng để vay ${tr(COURT_COST)} mở thêm sân nha.`);
  if(isBroken(c))return openRepair([c]);
  if(playingOn(c))return ownerSay(`Sân ${c} đang có người chơi, đợi xíu rồi dọn.`);
  const j=jobOn(c);
  if(j)return ownerSay(j.by==='owner'?`Đang quét sân ${c} nè, sắp xong!`:`Nhân viên đang dọn sân ${c} rồi!`);
  if(!S.courts[c-1].dirty)return ownerSay(`Sân ${c} sạch rồi mà!`);
  const mine=S.jobs.find(x=>x.by==='owner');
  if(mine)return ownerSay(`Có một cây chổi thôi, đang dọn sân ${mine.court} á!${S.staff?'':' Mai thuê thêm nhân viên đi!'}`);
  S.jobs.push({court:c,start:S.time,until:S.time+ownerClean(),by:'owner'});
  ownerSay(pick([`Đi quét sân ${c} nè 🧹`,`Dọn sân ${c} cho khách sau nào!`]));
}

function finish(c,q,now){c.done=true;S[q]=S[q].filter(x=>x!==c);save();if(now){if(cur===c)closeSheet()}else setTimeout(()=>{if(cur===c)closeSheet()},1300)}
function assign(ct){
  const r=cur; if(!r||r.type!=='b'||r.done)return;
  if(r.assigned.includes(ct))return;
  const [ws,we]=win(r);
  talk(r,'o',`Dạ, ${you(r.name)} vào sân ${ct} nha!`);
  if(!courtFree(ct,ws,we)){r.pat-=8;r.bad=(r.bad||0)+1;L('conflict');talk(r,'c',pick([`Ơ, sân ${ct} có người giờ đó mà em!`,`Sân ${ct} kín rồi, em coi lại đi!`]));return}
  const f=fee(ws,we);
  S.bookings.push({id:r.id+'-'+ct,rid:r.id,court:ct,start:ws,end:we,name:r.name,fee:f,vip:!!r.vip,dur:we-ws});
  if(r.vip&&S.event){const ev=S.event;ev.state='playing';ev.bid=r.id+'-'+ct;const w=1-r.pat/r.patMax;if(w>.35)vipHit(Math.round((w-.35)*60),'phải chờ lâu mới có sân');if(isDirty(ct))vipHit(35,'sân chưa dọn');if(r.bad)vipHit(10*r.bad,'xếp sân lộn xộn');ownerSay(`${ev.vip.n} vào sân ${ct}! Fan kéo tới đông nghịt, pháo hoa bụp bụp! 🎆`)}
  r.paid+=f; r.assigned.push(ct);
  toast(`Sân ${ct}: thu ${fmt(f)} khi chơi xong`,'star');
  if(r.assigned.length>=r.count){
    S.stats.served++; rate(Math.min(r.complaint?3:5,starByTime(r))-Math.min(2,r.bad||0)-(courtF()>1.25?1:0),r.name); if(r.complaint){L('bookFixed');S.stats.bookFixed=(S.stats.bookFixed||0)+1} if(moodOf(r)==='happy')L('fast'); else if(moodOf(r)==='angry')L('late'); if(peakInfo(S.time/60).hot)L('busy'); if(courtF()>1.25)L('pricey'); else if(courtF()<.85)L('cheap');
    const thx=pick(['Ok em, cảm ơn nha!','Tuyệt, đi đánh thôi!','Nhanh gọn ghê, thích!','Ngon lành, cảm ơn em!']);
    talk(r,'c',thx);
    ownerSay(r.walk&&isDirty(ct)?`Ối, sân ${ct} chưa dọn mà ${r.name} vô rồi!`:`${r.name} nhận sân ${r.assigned.join(' và ')}: "${thx}"`);
    finish(r,'qB',true);
  } else { talk(r,'c','Còn 1 sân nữa nha em!'); tlT0=null; buildTimeline(); }
}
function decline(){
  const r=cur; if(r.done)return;
  if(r.vip&&S.event&&S.event.state==='waiting'){S.event.state='left';S.event.notes.push('bị quán báo hết sân');finish(r,'qB',true);vipFinish();return} const [ws,we]=win(r);
  const need=r.count-r.assigned.length;
  const free=[];for(let c=1;c<=COURTS;c++)if(!r.assigned.includes(c)&&courtFree(c,ws,we))free.push(c);
  talk(r,'o',`Dạ, giờ đó kín sân rồi ${you(r.name)} ơi.`);
  if(free.length>=need){rate(1,r.name);S.stats.lost++;L('badDecline');talk(r,'c',`Sân ${free[0]} trống trơn kia mà em?!`);ownerSay(`${r.name} bực bội: "Sân ${free[0]} trống trơn kia mà!"`)}
  else{const t=pick(['Tiếc ghê, hẹn bữa khác vậy.','Thôi không sao, mai ghé lại.']);talk(r,'c',t);ownerSay(`${r.name}: "${t}"`)}
  finish(r,'qB',true);
}
function trayCount(){return Object.values(tray).reduce((a,b)=>a+b,0)}
let brewing=[], bench={};
let cookK=null;
function resetBench(){bench={mi:{step:0},cf:{step:0}};cookK=null}
resetBench();
const brewCount=id=>brewing.filter(b=>b.id===id).length+(bench[id]&&bench[id].step>0?(bench[id].qty||1):0);
function doStep(k,act){
  if(!cur||cur.type!=='d'||cur.done)return;
  if(!S.unlocked.includes(k))return ownerSay(`Chưa có ${IT[k].name}, mở ở mục Nâng cấp lúc chuẩn bị nha.`);
  const F=FLOW[k], B=bench[k], idx=F.steps.findIndex(x=>x[0]===act);
  if(B.busy)return ownerSay(`${F.busy}, chờ xíu nha!`);
  if(idx!==B.step)return ownerSay(F.need[B.step]);
  if(idx===0){const avail=S.stock[k]-(tray[k]||0)-brewCount(k);if(avail<=0)return ownerSay(`Tủ hết ${IT[k].name} rồi! Vào Kho mua gấp thôi.`);
    const need=Math.max(1,((cur.order&&cur.order[k])||1)-(tray[k]||0));B.qty=Math.min(avail,need)}
  B.step=idx+1; if(idx===FLOW[k].steps.length-1)cookK=null; // tick đủ bước -> đóng popup, bắt đầu nấu
  if(idx===F.steps.length-1){const now=performance.now();B.busy=true;B.start=now;B.end=now+F.ms}
  buildSheet();
}
function addItem(id){
  if(!cur||cur.done)return;
  if(!S.unlocked.includes(id))return ownerSay(`Chưa có ${IT[id].name}, mở ở mục Nâng cấp lúc chuẩn bị nha.`);
  if(S.stock[id]-(tray[id]||0)-brewCount(id)<=0)return ownerSay(`Tủ hết ${IT[id].name} rồi! Vào Kho mua gấp thôi.`);
  const P=PREP_T[id];
  if(P){const now=performance.now();
    // gom: nếu đang rót ly cùng loại thì ly mới rót chung đợt, không chờ tuần tự
    const run=brewing.find(b=>b.id===id);
    brewing.push(run?{id,start:run.start,end:run.end}:{id,start:now,end:now+P.ms});buildSheet();return}
  tray[id]=(tray[id]||0)+1; buildSheet();
}
function tickBrew(){
  if(!cur||cur.type!=='d')return;
  const now=performance.now(); let done=false;
  for(const k in bench){const B=bench[k];if(B.busy&&now>=B.end){const q=B.qty||1;tray[k]=(tray[k]||0)+q;bench[k]={step:0};done=true;toast(`${IT[k].e} ${q>1?q+' ':''}${IT[k].name} xong, đã lên khay`,'star')}}
  document.querySelectorAll('[data-benchbar]').forEach(el=>{const B=bench[el.dataset.benchbar];el.style.width=B&&B.busy?Math.min(100,(now-B.start)/(B.end-B.start)*100)+'%':'0%'});
  if(!brewing.length){if(done)buildSheet();return}
  brewing=brewing.filter(b=>{if(now>=b.end){tray[b.id]=(tray[b.id]||0)+1;done=true;return false}return true});
  if(done)buildSheet();
  else document.querySelectorAll('[data-brewbar]').forEach(el=>{const id=el.dataset.brewbar;const b=brewing.filter(x=>x.id===id&&x.start<=now)[0];el.style.width=b?Math.min(100,(now-b.start)/(b.end-b.start)*100)+'%':'0%'});
}
function give(){
  const o=cur; if(o.done)return;
  if(brewing.length)return ownerSay('Đợi món đang pha xong đã!');
  const wip=Object.keys(bench).find(k=>bench[k].step>0);
  if(wip)return ownerSay(`${IT[wip].name} đang làm dở ở bàn pha, làm xong đã nha!`);
  const ids=new Set([...Object.keys(o.order),...Object.keys(tray)]);
  const ok=[...ids].every(id=>(o.order[id]||0)===(tray[id]||0));
  talk(o,'o',`Đồ của ${you(o.name)} đây ạ!`);
  if(!ok){o.pat-=6;o.bad=(o.bad||0)+1;L('wrong');talk(o,'c',`Không phải, ${me(o.name)} gọi ${orderText(o.order)} mà!`);return}
  let sum=0;for(const id in tray){S.stock[id]-=tray[id];sum+=tray[id]*priceOf(id);S.stats.sold[id]=(S.stats.sold[id]||0)+tray[id]}
  const fs=Object.keys(tray).map(pf); if(Math.max(...fs)>1.3)L('pricey'); else if(Math.min(...fs)<.8)L('cheap');
  S.money+=sum;S.stats.drink+=sum;S.stats.served++;rate(Math.min(o.complaint?3:5,starByTime(o))-Math.min(2,o.bad||0)-(Math.max(...fs)>1.3?1:0),o.name);
  if(o.complaint){L('fixed');S.stats.fixed=(S.stats.fixed||0)+1}
  if(o.vip){const md=moodOf(o);vipHit(md==='happy'?0:md==='meh'?8:18,md==='happy'?'':'idol phải chờ nước lâu');if(o.bad)vipHit(12*o.bad,'đưa nhầm món cho idol');if(o.complaint)vipHit(10,'nhân viên bán nhầm')}
  if(o.fan&&S.event){S.event.served++;const md=moodOf(o);vipHit(md==='happy'?0:md==='meh'?1:3,md==='happy'?'':'fan phải chờ lâu');if(o.bad)vipHit(3*o.bad,'đưa nhầm món cho fan')}
  L('drinkOk'); if(Object.keys(tray).some(id=>['banhmi','xoi','chuoi','mi'].includes(id)))L('food'); if(tray.cf)L('coffee'); if(tray.mi)L('noodle'); if(moodOf(o)==='angry')L('late');
  talk(o,'c',o.complaint?pick(['Ừ, lần sau nhắc nhân viên cẩn thận nha.','Thôi được, đổi đúng là ok rồi.','Hên là chủ quán đổi liền đó!']):pick(['Mát quá!','Cảm ơn em nha!','Đã ghê!','Chuẩn luôn!','Ngon xỉu!']));
  toast('+'+fmt(sum));
  const low=ITEMS.filter(it=>S.stock[it.id]<4&&S.stats.sold[it.id]);
  ownerSay(low.length?`Tủ sắp hết ${low[0].name} rồi!`:`${o.court?'Sân '+o.court:o.name}: "${lastLine(o)}"`);
  finish(o,'qD',true);
}
function soldOut(){
  const o=cur; if(o.done)return;
  const lacking=Object.keys(o.order).filter(id=>S.stock[id]<o.order[id]);
  talk(o,'o',`Dạ, món đó hết mất rồi ${you(o.name)} ơi.`);
  if(lacking.length){L('soldOut');talk(o,'c','Vậy thôi, tiếc ghê.');rate(3,o.name)}
  else{rate(1,o.name);S.stats.lost++;L('fakeSold');talk(o,'c','Tủ còn đầy kia mà em!')}
  if(o.vip)vipHit(lacking.length?20:30,lacking.length?'quán hết nước':'báo hết món dù còn');
  if(o.fan)vipHit(lacking.length?3:6,lacking.length?'hết hàng giữa lúc đông':'báo hết món dù còn');
  ownerSay(`${o.name}: "${lastLine(o)}"`);
  finish(o,'qD',true);
}
function rushPrice(id){return Math.round(IT[id].packCost*RUSH/1000)*1000}
function buyRush(id){
  const it=IT[id], c=rushPrice(id);
  if(S.money<c)return ownerSay('Không đủ tiền mua rồi...');
  S.money-=c;S.stats.cost+=c;S.stock[id]+=it.pack;
  ownerSay(`Chạy ra tạp hoá mua ${it.pack} ${it.name}, hơi đắt nhưng kịp!`); save(); buildSheet();
}
