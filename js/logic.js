// logic.js — Logic chính: sinh khách, đặt sân, nhân viên, bán hàng, vòng lặp step()
/* ---------- Logic ---------- */
function fee(ws,we){let f=0;for(let m=ws;m<we;m+=5)f+=(m>=PEAK?S.courtRate.peak:S.courtRate.day)/12;return Math.round(f/1000)*1000}
function win(r){if(r.walk){const ws=Math.ceil(S.time/5)*5;const EW=S&&evWindow();let we=Math.min(CLOSE,ws+r.dur);if(EW&&ws<EW[0]&&we>EW[0])we=EW[0];return [ws,we]}return [r.start,r.start+r.dur]}
const isBroken=c=>!!(S.courts[c-1]&&S.courts[c-1].broken);
function courtFree(c,ws,we){return !isBroken(c)&&!S.bookings.some(b=>b.court===c&&b.start<we&&ws<b.end)}
function playingOn(c){return S.bookings.find(b=>b.court===c&&b.start<=S.time&&S.time<b.end)}
function nextOn(c){return S.bookings.filter(b=>b.court===c&&b.start>S.time).sort((a,b)=>a.start-b.start)[0]}
function jobOn(c){return S.jobs.find(j=>j.court===c)}
function isDirty(c){return S.courts[c-1].dirty||!!jobOn(c)}

function spawnBooking(){
  const EW=evWindow();
  if(EW&&S.time>=EW[0]-30&&S.time<EW[1])return; // idol bao sân: không ai đặt sân khung này
  const now=S.time, walk=Math.random()<0.55, count=Math.random()<0.15?2:1;
  let dur=pick([60,60,90,120,120]), start=null;
  if(walk){ if(now+dur>CLOSE){dur=Math.floor((CLOSE-now)/30)*30; if(dur<60)return;} }
  else { start=Math.ceil((now+30*(1+rand(8)))/30)*30; if(start+dur>CLOSE)return; if(EW&&start<EW[1]&&start+dur>EW[0])return; }
  if(walk&&EW&&now<EW[0]&&now+dur>EW[0]){dur=Math.floor((EW[0]-now)/30)*30;if(dur<60)return}
  const name=pick(NAMES), pat=Math.round((240+rand(80))*(has('bench')?1.25:1));
  const c={id:++uid,type:'b',name,look:makeLook(name),walk,start,dur,count,assigned:[],paid:0,pat,patMax:pat,warned:0,chat:[]};
  const m=me(name), sc=count>1?'2 sân':'1 sân';
  talk(c,'c',walk
    ?pick([`Em ơi, còn sân không? Cho ${m} ${sc} chơi luôn ${durTxt(dur)} nha!`,`Chào em! ${m[0].toUpperCase()+m.slice(1)} cần ${sc} đánh liền ${durTxt(dur)}, còn trống không?`])
    :pick([`Đặt giúp ${m} ${sc} lúc ${hm(start)} nha, chơi ${durTxt(dur)}.`,`Em giữ cho ${m} ${sc} ${hm(start)} tới ${hm(start+dur)} được không?`]));
  S.qB.push(c);
}
function orderPool(){
  const h=S.time/60;
  if(h<10)return ['tra','suoi','cf','cf','dg','banhmi','banhmi','xoi','xoi','chuoi'];
  if(h<17)return ['tra','tra','suoi','dg','tl','mi','chuoi','cau','banhmi'];
  return ['tra','tra','suoi','dg','dg','tl','mi','mi','banhmi','chuoi','cau','cau'];
}
function spawnDrink(b){
  b=b||{id:'walk'+(++uid),name:pick(NAMES),court:0};
  let pool=[];for(const id of orderPool()){if(!S.menu.includes(id))continue;const w=Math.max(.15,2-pf(id));if(Math.random()<w/1.3)pool.push(id)}
  if(!pool.length)pool=S.menu.length?[pick(S.menu)]:['tra'];
  const order={}, n=1+rand(3);
  for(let i=0;i<n;i++){const id=pick(pool);order[id]=(order[id]||0)+1+(Math.random()<.2?1:0)}
  const pat=Math.round((120+rand(45))*(has('fan')?1.25:1));
  const c={id:++uid,type:'d',bid:b.id,name:b.name,look:makeLook(b.name),court:b.court,order,pat,patMax:pat,warned:0,chat:[]};
  const hasFood=Object.keys(order).some(id=>['banhmi','xoi','chuoi','mi'].includes(id));
  if(b.court){talk(c,'c',pick([`Em ơi, cho ${orderText(order)} nha!`,`Sân ${b.court} nè, lấy giùm ${orderText(order)}!`,hasFood?`Đói quá, cho ${orderText(order)} nha em!`:`Khát quá, ${orderText(order)} nha em!`]));
  courtSay[b.court]={t:hasFood?'Em ơi, đói bụng!':'Em ơi, cho nước!',until:performance.now()+2600};}
  else talk(c,'c',pick([`Ghé mua ${orderText(order)} mang đi nha em!`,`Đi ngang qua, cho ${orderText(order)} mang về nha!`,`Em ơi bán ${orderText(order)}, mình mang đi nè!`]));
  S.qD.push(c);
}

// nhịp khách theo giờ: b = khách hỏi sân/phút game, w = khách mua mang đi/phút game
function peakInfo(h){
  if(h<8)   return {b:.062,w:.015,hot:true, lbl:'🔥 Cao điểm sáng'};
  if(h<11)  return {b:.026,w:.01, hot:false,lbl:''};
  if(h<13)  return {b:.034,w:.013,hot:false,lbl:'🍱 Giờ trưa'};
  if(h<16)  return {b:.022,w:.009,hot:false,lbl:''};
  if(h<17)  return {b:.042,w:.012,hot:false,lbl:'⏰ Sắp tan làm'};
  if(h<21)  return {b:.09, w:.018,hot:true, lbl:'🔥 Cao điểm tối'};
  return          {b:.021,w:.008,hot:false,lbl:''};
}
const sellErr=()=>Math.max(0.02,(S.sellErr||((SELLER_ERR_MIN+SELLER_ERR_MAX)/2))-(S.morale?0.02:0));
const bookErr=()=>Math.max(0.02,(S.bookErr||((BOOKER_ERR_MIN+BOOKER_ERR_MAX)/2))-(S.morale?0.01:0));
function bookerTick(){
  if(!S.booker){S.bookJob=null;return}
  const J=S.bookJob;
  if(J){
    const c=S.qB.find(x=>x.id===J.id);
    if(!c||c===cur||c.vip||c.complaint){S.bookJob=null;return}
    if(S.time>=J.until){S.bookJob=null;bookerFinish(c)}
    return;
  }
  const ok=c=>c!==cur&&!c.vip&&!c.complaint;
  const cand=S.qB.filter(ok);
  const c=cand.find(c=>S.qB.indexOf(c)>0)||cand[0];
  if(c)S.bookJob={id:c.id,start:S.time,until:S.time+BOOK_MIN};
}
function bookerFinish(c){
  const [ws,we]=win(c), need=c.count-c.assigned.length;
  const free=[];for(let ct=1;ct<=COURTS;ct++)if(!c.assigned.includes(ct)&&courtFree(ct,ws,we))free.push(ct);
  free.sort((a,b)=>(isDirty(a)?1:0)-(isDirty(b)?1:0));
  if(free.length<need){
    const t=pick(['Tiếc ghê, hẹn bữa khác vậy.','Thôi không sao, mai ghé lại.']);talk(c,'c',t);
    S.qB=S.qB.filter(x=>x!==c); S.stats.bookOk=(S.stats.bookOk||0)+1;
    ownerSay(`${BOOKER_NAME}: "Dạ giờ đó kín sân rồi ạ." ${c.name}: "${t}"`); return;
  }
  let anyErr=false, total=0;
  for(let i=0;i<need;i++){
    let ct=free[i], err=Math.random()<bookErr();
    if(err){ // xếp nhầm: vô sân đang có người giờ đó, hoặc ghi nhầm sân
      const busy=[];for(let x=1;x<=COURTS;x++)if(!isBroken(x)&&!c.assigned.includes(x)&&!courtFree(x,ws,we))busy.push(x);
      if(busy.length)ct=pick(busy);
      anyErr=true;
    }
    const f=fee(ws,we); total+=f;
    S.bookings.push({id:c.id+'-'+ct+(err?'-e':''),rid:c.id,court:ct,start:ws,end:we,name:c.name,fee:f,dur:we-ws,bookErr:err});
    c.assigned.push(ct);
  }
  S.qB=S.qB.filter(x=>x!==c);
  if(anyErr){S.stats.bookWrongPending=(S.stats.bookWrongPending||0)+1}
  else{S.stats.bookOk=(S.stats.bookOk||0)+1; S.stats.served++; L('bookerOk'); rate(Math.min(5,starByTime(c)),c.name)}
  toast(`📅 ${BOOKER_NAME} xếp ${c.name} vào sân ${c.assigned.join(', ')}`);
}
function bookerComplaint(b){
  const dur=Math.max(30,Math.round((b.end-S.time)/5)*5); const pat=Math.round(160*(has('bench')?1.25:1));
  const c={id:++uid,type:'b',name:b.name,look:makeLook(b.name),walk:true,start:null,dur,count:1,assigned:[],paid:0,pat,patMax:pat,warned:1,chat:[],complaint:{booking:true,court:b.court}};
  talk(c,'c',pick([`Ủa em ơi! Nhân viên xếp tụi mình vô sân ${b.court} mà có người đánh rồi! 😤`,`Chị lễ tân ghi nhầm sân rồi, ra sân ${b.court} thấy người khác đang chơi nè! 😤`]));
  S.qB.unshift(c); S.stats.bookWrong=(S.stats.bookWrong||0)+1; S.stats.bookWrongPending=Math.max(0,(S.stats.bookWrongPending||0)-1); L('bookerWrong');
  ownerSay(`Chết, ${BOOKER_NAME} xếp nhầm sân cho ${b.name}! Mau xếp lại sân khác cho khách!`); toast('💢 Nhân viên xếp nhầm sân!','bad');
}
function renderBooker(){
  const bar=$('#bBar'); if(!bar)return;
  bar.hidden=!S.booker; if(!S.booker)return;
  const J=S.bookJob, c=J&&S.qB.find(x=>x.id===J.id);
  const txt=J&&c?`Đang xếp sân cho ${c.name}`:'Nhân viên đặt lịch đang rảnh';
  const prog=J?Math.min(100,(S.time-J.start)/(J.until-J.start)*100):0;
  const sig=(J?J.id:'-')+'';
  if(bar.dataset.sig!==sig){bar.dataset.sig=sig;bar.innerHTML=`<div class="sj ${J?'busy':''}"><span class="sb-face">${avatar(BOOKER_LOOK,'happy')}</span><div class="sb-mid"><b>${esc(txt)}</b><span class="sb-prog"><i></i></span></div><div class="sb-tray bk-tray">📅</div></div>`}
  const i=bar.querySelector('.sb-prog i'); if(i)i.style.width=prog+'%';
}
function sellerTick(){
  if(!S.seller){S.sellJobs=[];return}
  const jobs=jobsOf();
  // cập nhật từng người
  for(const J of [...jobs]){
    const c=S.qD.find(x=>x.id===J.id);
    if(!c||c===cur||c.complaint){S.sellJobs=S.sellJobs.filter(x=>x!==J);continue}
    if(!J.ends){let t=0;J.ends=J.units.map(()=>t+=J.per)}
    const el=S.time-J.start; J.done=J.ends.filter(e=>e<=el).length;
    if(J.done>=J.units.length){S.sellJobs=S.sellJobs.filter(x=>x!==J);sellerFinish(c,J)}
  }
  // ai rảnh thì nhận đơn mới
  for(let sid=0;sid<Math.min(S.seller,MAX_SELLER);sid++){
    if(S.sellJobs.some(J=>J.sid===sid))continue;
    const busy=new Set(S.sellJobs.map(J=>J.id));
    const ok=c=>c!==cur&&!c.complaint&&!busy.has(c.id)&&!(c.sellerSkipUntil>S.time);
    const cand=S.qD.filter(ok);
    const c=cand.find(c=>S.qD.indexOf(c)>0)||cand[0];
    if(!c)break;
    const ids=Object.keys(c.order);
    if(ids.some(id=>S.stock[id]-S.sellJobs.reduce((a,J)=>a+J.units.filter(u=>u===id).length,0)<c.order[id])){
      c.sellerSkipUntil=S.time+20;
      if(!c.sellerTold){c.sellerTold=true;talk(c,'c','Nhân viên nói hết món rồi, chủ quán coi giúp với!');ownerSay(`Nhân viên: "Hết món cho ${c.name} rồi, chủ xử lý giúp em!"`)}
      continue;
    }
    const units=[];ids.forEach(id=>{for(let i=0;i<c.order[id];i++)units.push(id)});
    const kinds=[...new Set(units)], base=Math.max(3,SELL_MIN/kinds.length);
    let t=0; const gEnd={}; kinds.forEach(id=>{t+=FLOW[id]?base*1.8:base;gEnd[id]=t}); const ends=units.map(id=>gEnd[id]); // cùng loại xong cùng lúc
    let errAt=-1,wrong=null;
    if(Math.random()<sellErr()){
      errAt=rand(units.length);
      const wr=S.unlocked.filter(id=>!c.order[id]&&S.stock[id]>0&&!FLOW[id]);
      if(wr.length)wrong=pick(wr); else errAt=-1;
    }
    S.sellJobs.push({sid,id:c.id,start:S.time,per:base,ends,units,done:0,errAt,wrong});
  }
}
function jobTray(J){return J.units.slice(0,J.done).map((id,i)=>i===J.errAt?J.wrong:id)}
function sellerFinish(c,J){
  if(J.errAt>=0){
    const right=J.units[J.errAt], wrong=J.wrong;
    S.stock[wrong]--;
    c.complaint={right,wrong}; c.pat=Math.max(c.pat,c.patMax*.55); c.warned=1;
    talk(c,'c',`Ủa em ơi! Nhân viên đưa ${IT[wrong].e} ${IT[wrong].name.toLowerCase()} mà ${me(c.name)} gọi ${IT[right].e} ${IT[right].name.toLowerCase()}! 😤`);
    S.qD=S.qD.filter(x=>x!==c); S.qD.unshift(c);
    S.stats.sellWrong=(S.stats.sellWrong||0)+1; L('sellerWrong'); if(c.vip)vipHit(15,'nhân viên đưa nhầm nước cho idol'); if(c.fan)vipHit(3,'nhân viên đưa nhầm món cho fan');
    ownerSay(`Chết, nhân viên đưa nhầm ${IT[wrong].name.toLowerCase()} cho ${c.name}! Mau ra quầy đổi món đi!`);
    toast('💢 Nhân viên bán nhầm món!','bad');
    return;
  }
  const ids=Object.keys(c.order);
  let sum=0;for(const id of ids){S.stock[id]-=c.order[id];sum+=c.order[id]*priceOf(id);S.stats.sold[id]=(S.stats.sold[id]||0)+c.order[id]}
  S.money+=sum;S.stats.drink+=sum;S.stats.served++;S.stats.sellOk=(S.stats.sellOk||0)+1;L('sellerOk');
  S.qD=S.qD.filter(x=>x!==c);
  rate(Math.min(5,starByTime(c)),c.name);
  if(c.vip){const md=moodOf(c);vipHit(md==='happy'?0:md==='meh'?8:18,md==='happy'?'':'idol phải chờ nước lâu')}
  if(c.fan&&S.event){S.event.served++;const md=moodOf(c);vipHit(md==='happy'?0:md==='meh'?1:3,md==='happy'?'':'fan phải chờ lâu')}
  toast(`+${fmt(sum)} nhân viên bán cho ${c.name}`);
}
function checkSeller(sidPick){
  if(!S||!S.seller||S.phase!=='open')return;
  const jobs=jobsOf(); const J=(sidPick!=null?jobs.find(x=>x.sid===sidPick):null)||jobs.find(x=>x.errAt>=0&&x.errAt<x.done)||jobs[0], c=J&&S.qD.find(x=>x.id===J.id);
  const LOOK=SELLER_LOOKS[J?J.sid:0]||SELLER_LOOK, NM=SELLER_NAMES[J?J.sid:0]||'Nhân viên';
  const was=paused; paused=true;
  const back=()=>{paused=was;last=performance.now()};
  if(!J||!c){openModal(`<div class="mface" style="background:#ffd6e7">${avatar(SELLER_LOOK,'happy')}</div><h2>🧑‍💼 Nhân viên bán hàng</h2><p style="text-align:center">Đang rảnh, chờ khách tiếp theo ở quầy nước.</p><div class="mrow"><button class="btn press" data-mclose>Ok</button></div>`,back);return}
  const tray=jobTray(J), bad=J.errAt>=0&&J.errAt<J.done;
  const others=jobs.length>1?`<p class="note" style="text-align:center">${jobs.length} nhân viên đang bán cùng lúc. Chạm vào từng người ở thanh dưới quầy để kiểm tra.</p>`:'';
  const ord=Object.entries(c.order).map(([id,n])=>`<span class="oi">${IT[id].e}<b>${n}</b></span>`).join('');
  const tr=tray.map((id,i)=>`<span class="oi ${i===J.errAt&&bad?'bad':''}">${IT[id].e}</span>`).join('')||'<span class="sb-ph">chưa lấy gì</span>';
  openModal(`<div class="mface" style="background:#ffd6e7">${avatar(LOOK,bad?'meh':'happy')}</div>
    <h2>🧑‍💼 ${NM} đang bán</h2>${others}
    <p style="text-align:center">Đơn của <b>${esc(c.name)}</b>${c.court?` (sân ${c.court})`:' (mang đi)'}</p>
    <div class="chk-row"><span>Khách gọi</span><div>${ord}</div></div>
    <div class="chk-row"><span>Khay nhân viên</span><div>${tr}</div></div>
    ${bad?`<div class="cmp-note">❌ Nhân viên lấy nhầm <b>${IT[J.wrong].e} ${IT[J.wrong].name}</b>, khách gọi <b>${IT[J.units[J.errAt]].e} ${IT[J.units[J.errAt]].name}</b>!</div>`:`<p class="note" style="text-align:center">Tới giờ chưa thấy nhầm gì. Nhân viên lấy xong ${J.done}/${J.units.length} món.</p>`}
    <div class="mrow">${bad?'<button class="btn press" id="sbFix">✅ Đổi lại cho đúng</button>':''}<button class="btn ghost press" data-mclose>Để nhân viên làm tiếp</button></div>`,back);
  if(bad)$('#sbFix').onclick=()=>{J.errAt=-1;S.stats.fixedEarly=(S.stats.fixedEarly||0)+1;L('fixedEarly');closeModal();
    ownerSay(`Chủ quán kịp sửa: đổi ${IT[J.wrong].name.toLowerCase()} thành ${IT[J.units[J.done-1]].name.toLowerCase()}. Nhân viên: "Dạ em xin lỗi, em để ý hơn ạ!"`);toast('✅ Sửa kịp, khách không biết gì!','star')};
}
const IMP1=['Em ơi, sao rồi?','Lâu vậy em...','Còn đó không em?','Nhanh giùm nha em!'];
const IMP2=['Chờ lâu quá à!','Thôi, sắp đi về luôn nè!','Hết kiên nhẫn rồi nha!'];
function step(dm){
  S.time=Math.min(CLOSE,S.time+dm);
  // dọn sân xong
  for(const j of S.jobs.filter(j=>S.time>=j.until)){
    S.courts[j.court-1].dirty=false;S.jobs=S.jobs.filter(x=>x!==j); if(j.by==='staff')L('staff');
    if(j.by==='owner')ownerSay(`Sân ${j.court} sạch bong rồi! ✨`);
    else courtSay[j.court]={t:'Sạch bong rồi nha! ✨',until:performance.now()+2000,staff:true};
    save();
  }
  // nhân viên thời vụ tự đi dọn, ưu tiên sân sắp có khách
  let idle=S.staff-S.jobs.filter(j=>j.by==='staff').length;
  if(idle>0){
    const cand=[];for(let c=1;c<=COURTS;c++)if(S.courts[c-1].dirty&&!isBroken(c)&&!jobOn(c)&&!playingOn(c)){const n=nextOn(c);cand.push([c,n?n.start:1e9])}
    cand.sort((a,b)=>a[1]-b[1]);
    const busyIdx=S.jobs.filter(j=>j.by==='staff').map(j=>j.who);
    for(const [c] of cand){if(idle<=0)break;let who=0;while(busyIdx.includes(who))who++;busyIdx.push(who);
      S.jobs.push({court:c,start:S.time,until:S.time+staffClean(),by:'staff',who});idle--}
  }
  // bắt đầu / kết thúc lượt chơi
  if(S.bookings.some(b=>b.cancel))S.bookings=S.bookings.filter(b=>!b.cancel);
  for(const b of S.bookings){
    if(b.bookErr&&!b.started&&S.time>=b.start){b.started=true;b.over=true;b.cancel=true;bookerComplaint(b);continue}
    if(!b.started&&S.time>=b.start){
      b.started=true;
      if(isDirty(b.court)){
        rate(2,b.name);L('dirty'); if(b.vip)vipHit(35,'sân chưa dọn');
        courtSay[b.court]={t:pick(['Sân dơ quá trời!','Ủa sao chưa dọn?','Vỏ chai đầy sân nè!']),until:performance.now()+3000};
        ownerSay(`Chết, sân ${b.court} chưa dọn mà khách vô rồi!`);toast('−0.1 ★ sân dơ','bad');
        S.jobs=S.jobs.filter(j=>j.court!==b.court);
        S.courts[b.court-1].dirty=false;
      } else L('cleanStart');
    }
    if(!b.over&&S.time>=b.end){b.over=true;S.courts[b.court-1].dirty=true; if(b.vip)vipFinish();
      const f=b.fee!=null?b.fee:0;
      if(f>0){
        const tryDash=Math.random()<(has('cam')?0.01:DASH_RATE);
        const caught=tryDash&&S.guard&&Math.random()<GUARD_CATCH;
        if(caught){S.stats.caught=(S.stats.caught||0)+1;S.stats.caughtAmt=(S.stats.caughtAmt||0)+f;L('caught');S.money+=f;S.stats.court+=f;
          courtSay[b.court]={t:'Ơ... bị bắt rồi 😅',until:performance.now()+3000};
          guardSay(`Đứng lại! Trả tiền sân ${b.court} đã! 🫷`);
          ownerSay(`Bảo vệ tóm gọn ${b.name} định bùng tiền sân ${b.court}, thu đủ ${fmt(f)}! 👮`);toast(`+${fmt(f)} bảo vệ thu lại`)}
        else if(tryDash){S.stats.dash=(S.stats.dash||0)+1;S.stats.dashLoss=(S.stats.dashLoss||0)+f;L('dash');
          courtSay[b.court]={t:pick(['Chuồn lẹ tụi bây! 🏃','Quên ví rồi, bye! 🏃‍♂️','Mai trả nha! 😜']),until:performance.now()+3000};
          ownerSay(`Ơ! ${b.name} đánh xong sân ${b.court} rồi bùng mất ${fmt(f)} tiền sân! 😤`);toast(`−${fmt(f)} khách bùng`,'bad')}
        else{S.money+=f;S.stats.court+=f;toast('+'+fmt(f)+` sân ${b.court}`)}
      }}
  }
  const h=S.time/60;
  const pk=peakInfo(h);
  const starF=0.35+0.23*S.rating;                       // 1★ ≈ 0.6 · 3★ ≈ 1.0 · 5★ ≈ 1.5
  const mult=eventMult()*starF*Math.min(1.8,1+0.06*(S.day-1))*(has('sign')?1.1:1)*(h>=17&&has('led')?1.25:1)*Math.max(.35,Math.min(1.5,2-courtF()))*(0.35+0.65*COURTS/MAX_COURTS);
  const pB=pk.b*mult*dm;
  if(S.qB.length<7&&Math.random()<pB){spawnBooking(); if(pk.hot&&S.qB.length<7&&Math.random()<.25)spawnBooking()}
  // khách mang đi: giữ quán luôn nhộn nhịp kể cả khi ít sân đang chơi
  if(S.qD.length<7&&Math.random()<pk.w*starF*dm)spawnDrink(null);
  {const ev=evNow(); if(ev&&ev.state==='playing'&&S.qD.length<12&&Math.random()<FAN_RATE*starF*(ev.vip.legend?1.3:1)*dm)spawnFan();}
  for(const b of S.bookings){
    if(b.start<=S.time&&S.time<b.end){
      if(S.qD.length<7&&!S.qD.some(o=>o.bid===b.id)&&Math.random()<(pk.hot?0.012:0.008)*dm)spawnDrink(b);
      else if(!courtSay[b.court]&&Math.random()<0.004*dm)courtSay[b.court]={t:pick(CHATTER),until:performance.now()+2400};
    }
  }
  for(const q of [S.qB,S.qD]){
    for(let i=q.length-1;i>=0;i--){
      const c=q[i]; c.pat-=dm; const p=c.pat/c.patMax;
      if(p<Z_WARN&&c.warned<1){c.warned=1;talk(c,'c',pick(IMP1))}
      if(p<Z_LATE&&c.warned<2){c.warned=2;talk(c,'c',pick(IMP2));if(cur!==c)ownerSay(`${c.name} sắp hết kiên nhẫn rồi, phục vụ gấp kẻo bị chấm xấu!`)}
      if(c.pat<=0){
        q.splice(i,1); rate(1,c.name); S.stats.lost++; L('wait');
        if(S.event&&S.event.day===S.day){const ev=S.event; if(c.vip&&c.type==='b'&&ev.state==='waiting'){ev.state='left';ev.notes.push('chờ mãi không có sân nên bỏ về');vipFinish()} else if(c.vip)vipHit(25,'idol gọi nước mà chờ không thấy'); else if(ev.state==='playing')vipHit(c.fan?4:2,'fan phải bỏ về vì chờ lâu')}
        ownerSay(`Huhu, ${c.name} bỏ về rồi... Lần sau phải nhanh hơn!`);
        if(cur===c)closeSheet();
      }
    }
  }
  sellerTick();
  bookerTick();
  eventTick();
  ownerEventTick();
  repairTick();
  if(S.time>=CLOSE)endDay();
}
