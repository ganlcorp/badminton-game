// events-vip.js — Sự kiện VĐV bao sân, cách tính sao
// ---------- SỰ KIỆN ----------
// Nhân vật hư cấu, không phải VĐV có thật
// Tất cả đều là nhân vật HƯ CẤU (không dùng tên VĐV có thật)
const VIPS=[
  {n:'Kaito Morimura',f:'🇯🇵',r:'hạng 1 thế giới đơn nam'},
  {n:'Elena Varga',f:'🇪🇸',r:'hạng 1 thế giới đơn nữ'},
  {n:'Sun Yiran',f:'🇨🇳',r:'hạng 2 thế giới đơn nữ'},
  {n:'Arjun Mehra',f:'🇮🇳',r:'hạng 3 thế giới đơn nam'},
  {n:'Mads Lindqvist',f:'🇩🇰',r:'hạng 4 thế giới đơn nam'},
  {n:'Park Seo-ah & Kim Ha-rin',f:'🇰🇷',r:'hạng 1 thế giới đôi nữ'},
  {n:'Rizky Pratama & Dimas Aditya',f:'🇮🇩',r:'hạng 2 thế giới đôi nam'},
  {n:'Chen Wei-lun & Lin Yu-ting',f:'🇹🇼',r:'hạng 3 thế giới đôi nam nữ'},
  {n:'Nur Aisyah Rahman',f:'🇲🇾',r:'hạng 6 thế giới đơn nữ'},
  {n:'Lê Hoàng Minh',f:'🇻🇳',r:'hạng 8 thế giới đơn nam'}];
const LEGENDS=[
  {n:'Zhao Tianlong',f:'🇨🇳',r:'huyền thoại đơn nam, 2 HCV Thế vận hội, đã giải nghệ',legend:true},
  {n:'Tan Wei Sheng',f:'🇲🇾',r:'cựu số 1 thế giới nhiều năm liền, đã giải nghệ',legend:true},
  {n:'Hiroshi Kazama',f:'🇯🇵',r:'cựu vô địch thế giới 2 lần, đã giải nghệ',legend:true},
  {n:'Nguyễn Tiến Đạt',f:'🇻🇳',r:'huyền thoại cầu lông Việt Nam, đã giải nghệ',legend:true}];
const pickVip=()=>Math.random()<.25?pick(LEGENDS):pick(VIPS);
const VIP_REWARD=50000000, FAN_RATE=0.15;
const VIP_LOOK={skin:'#f1c19b',hair:'#1b1b1b',style:'spiky',shirt:'#ff3d6e',band:'#ffd23f'};
function eventBonus(){if(!S||!S.hist)return 0;let b=0;for(const d in S.hist)if(+d>S.day-7)b+=S.hist[d].eb||0;return Math.max(-0.6,Math.min(0.5,b))}
function eventMult(){
  let m=1; const ev=S.event;
  if(ev&&ev.day===S.day&&(ev.state==='waiting'||ev.state==='playing'))m*=1.6;   // fan kéo tới xem idol
  if(S.fame&&S.day<=S.fame.until)m*=S.fame.mult;                                // dư âm: nổi tiếng hoặc bị phốt
  return m;
}
function planEvent(){
  if(!S.nextEvent)S.nextEvent=S.day+3+rand(3);
  if(S.day>=S.nextEvent){
    const u=S.upcoming||{vip:pickVip(),arrive:16*60+rand(6)*15,dur:120};
    S.event={type:'vip',day:S.day,vip:u.vip,arrive:u.arrive,dur:u.dur,state:'pending',score:100,notes:[],fans:0,served:0};
    S.upcoming=null; S.nextEvent=S.day+3+rand(3);   // lần sau cách 3–5 ngày
  } else if(!S.event||S.event.day!==S.day) S.event=null;
}
function planUpcoming(){ // gọi lúc đóng cửa: nếu mai có sự kiện thì chốt trước để báo tin
  if(!S.nextEvent)S.nextEvent=S.day+3+rand(3);
  if(S.nextEvent===S.day+1&&!S.upcoming)S.upcoming={vip:pickVip(),arrive:16*60+rand(6)*15,dur:120};
}
const evNow=()=>S.event&&S.event.day===S.day&&S.event.state!=='done'?S.event:null;
function evWindow(){const ev=evNow();return ev?[ev.arrive,ev.end||ev.arrive+ev.dur]:null}
function evForecast(ev){const m=(ev.vip.legend?1.3:1)*(0.35+0.23*S.rating);const orders=Math.round(FAN_RATE*m*ev.dur)+4;return {orders,items:Math.round(orders*2.2),sellers:orders>=18?3:orders>=12?2:1}}
function vipHit(n,why){const ev=S.event;if(!ev||ev.state==='done')return;ev.score=Math.max(0,ev.score-n);if(why&&!ev.notes.includes(why))ev.notes.push(why)}
function vipFinish(){
  const ev=S.event; if(!ev||ev.state==='done')return;
  if(ev.state==='left')ev.score=0;
  const ok=ev.score>=60; ev.state='done'; ev.ok=ok;
  const h=S.hist[S.day]||(S.hist[S.day]={s:0,n:0,c:[0,0,0,0,0]});
  h.eb=(h.eb||0)+(ok?0.3:-0.4); if(!ok)S.avgOn=true;
  S.fame={until:S.day+3,mult:ok?1.35:0.8};
  if(ok){S.money+=VIP_REWARD;S.stats.vipTip=VIP_REWARD;L('vipGood')} else L('vipBad');
  S.rating=calcRating(); save();
  const v=ev.vip, wasP=paused; if(S.phase==='open'){paused=true;closeSheet()}
  openModal(ok?`<div class="vip-fx">🎆🎇🎆</div><h2>🌟 ${esc(v.n)} rất hài lòng!</h2>
      <p style="text-align:center">${v.f} ${esc(v.n)} (${v.r}) khen sân đẹp, fan được phục vụ nhanh. Clip giao lưu lên xu hướng, quán <b>nổi tiếng</b>!</p>
      <div class="bank-card"><div class="bk-row"><span>Điểm hài lòng</span><b>${ev.score}/100</b></div><div class="bk-row"><span>Tiền thưởng giao lưu & tài trợ</span><b>+${fmt(VIP_REWARD)}</b></div><div class="bk-row"><span>Fan đã phục vụ</span><b>${ev.served}/${ev.fans}</b></div>
      <div class="bk-row"><span>Sao quán</span><b>+0,3★ uy tín</b></div><div class="bk-row"><span>3 ngày tới</span><b>khách đông hơn 35%</b></div></div>
      <div class="mrow"><button class="btn press" data-mclose>Tuyệt vời! 🎉</button></div>`
    :`<div class="vip-fx bad">💢😤💢</div><h2>😱 Quán dính phốt!</h2>
      <p style="text-align:center">${v.f} ${esc(v.n)} ra về không vui${ev.notes.length?`: ${ev.notes.join(', ')}`:''}. Dân mạng đang chia sẻ khắp nơi...</p>
      <div class="bank-card"><div class="bk-row"><span>Điểm hài lòng</span><b>${ev.score}/100</b></div><div class="bk-row"><span>Sao quán</span><b>−0,4★</b></div><div class="bk-row"><span>3 ngày tới</span><b>khách giảm 20%</b></div></div>
      <div class="mrow"><button class="btn warn press" data-mclose>Huhu, lần sau sẽ tốt hơn</button></div>`,
    ()=>{if(S.phase==='open'&&!wasP){paused=false;last=performance.now()}});
  ownerSay(ok?`${v.n} khen quán hết lời, quán mình nổi tiếng rồi! 🎉`:`Toang rồi, ${v.n} không vui, quán bị phốt khắp mạng... 😭`);
}
function eventTick(){
  const ev=S.event; if(!ev||ev.day!==S.day||ev.state==='done')return;
  if(ev.state==='pending'&&S.time>=ev.arrive){
    ev.state='playing'; ev.end=S.time+ev.dur;
    // nhóm nào còn đang đánh thì kết thúc sớm để nhường sân
    for(const b of S.bookings)if(!b.over&&b.start<ev.end&&b.end>S.time){if(b.start>S.time){b.cancel=true;b.end=b.start}else b.end=Math.max(b.start+5,Math.ceil(S.time))}
    S.bookings=S.bookings.filter(b=>!b.cancel);
    const dirty=[];for(let c=1;c<=COURTS;c++)if(isDirty(c)&&!isBroken(c))dirty.push(c);
    if(dirty.length)vipHit(Math.min(40,8*dirty.length),`${dirty.length} sân chưa dọn`);
    S.jobs=[]; for(let c=1;c<=COURTS;c++)S.courts[c-1].dirty=false;
    {const br=[];for(let c=1;c<=COURTS;c++)if(isBroken(c))br.push(c);if(br.length)vipHit(Math.min(30,10*br.length),`${br.length} sân đang hỏng`);}
    for(let c=1;c<=COURTS;c++)if(!isBroken(c))S.bookings.push({id:'vip-'+c,rid:0,court:c,start:S.time,end:ev.end,name:ev.vip.n,vip:true,fee:0,started:true,dur:ev.dur});
    if(S.qB.length){S.qB.forEach(c=>{if(cur===c)closeSheet()});S.qB=[]}
    ownerSay(`🌟 ${ev.vip.n} tới rồi! Idol bao trọn ${COURTS} sân giao lưu 2 tiếng, fan kéo tới đông nghịt, lo quầy nước nha!`);
    toast(`🌟 ${ev.vip.n} đã tới, bao hết sân!`,'star');
  }
  if(ev.state==='playing'){
    const el=S.time-(ev.end-ev.dur);
    for(const [k,at] of [['d1',.15],['d2',.4],['d3',.65],['d4',.85]])if(!ev[k]&&el>=ev.dur*at){
      ev[k]=1; spawnDrink({id:'vipd'+k,name:ev.vip.n,court:1+rand(COURTS)}); const o=S.qD[S.qD.length-1]; o.vip=true; o.look=VIP_LOOK; o.pat=o.patMax=Math.round(o.patMax*.7);
      S.qD=S.qD.filter(x=>x!==o); S.qD.unshift(o); o.chat=[]; talk(o,'c',`Em ơi, ${ev.vip.n} xin ${orderText(o.order)} nha, idol khát rồi!`);
      ownerSay('Idol gọi nước kìa, phục vụ lẹ lên!');
    }
    if(S.time>=ev.end)vipFinish();
  }
}
function spawnFan(){
  const ev=evNow(); if(!ev)return;
  spawnDrink(null); const o=S.qD[S.qD.length-1]; if(!o)return;
  o.fan=true; ev.fans++; o.chat=[];
  talk(o,'c',pick([`Idol đỉnh quá! Cho em ${orderText(o.order)} nha!`,`Xem ${ev.vip.n.split(' & ')[0]} đánh mà khát ghê, ${orderText(o.order)} nha em!`,`Fan cứng tới đây! Cho ${orderText(o.order)} với!`]));
}
function calcRating(){
  if(!S||!S.hist)return 5;
  if(!S.avgOn)return Math.min(5,5+Math.min(0,eventBonus())); // quán mới: giữ 5★ cho tới khi có khách chấm tệ
  const days=Object.keys(S.hist).map(Number).filter(d=>S.hist[d].n>0).sort((a,b)=>b-a).slice(0,7);
  const base=!days.length?(S.hist[S.day]?dayAvg(S.hist[S.day]):PRIOR_STAR):days.reduce((a,d)=>a+dayAvg(S.hist[d]),0)/days.length;
  return Math.max(1,Math.min(5,base+replyBonus()+eventBonus()));
}
function rate(n,who){
  n=Math.max(1,Math.min(5,Math.round(n)));
  const h=S.hist[S.day]||(S.hist[S.day]={s:0,n:0,c:[0,0,0,0,0]});
  h.s+=n;h.n++;if(h.c)h.c[n-1]++;
  if(n<=3&&!S.avgOn){S.avgOn=true;setTimeout(()=>ownerSay('Có đánh giá chưa tốt rồi, từ giờ sao quán tính theo trung bình khách chấm!'),600)}
  S.rating=calcRating();
  toast(`${who?who+' chấm ':''}${'★'.repeat(n)}`,n<=2?'bad':'star');
  return n;
}
function cleanCourts(){return Array.from({length:COURTS},()=>({dirty:false}))}
const tr=n=>(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' tr';
function dayState(money){return {time:OPEN,bookings:[],qB:[],qD:[],courts:cleanCourts(),jobs:[],staff:0,guard:0,seller:0,sellJobs:[],booker:0,bookJob:null,log:{},
  stats:{court:0,drink:0,cost:0,wage:0,served:0,lost:0,start:money,waste:0,sold:{}}}}
function newGame(name,courts){courts=Math.max(1,Math.min(MAX_COURTS,courts||4));COURTS=courts;const m=START_CASH;return Object.assign({hist:{},name:name||'Sân Cầu Lông Nhà Mình',courtsOpen:courts,debt:courts*COURT_COST,loan0:courts*COURT_COST,wasBelow:false,fineDay:0,day:1,money:m,rating:5,avgOn:false,phase:'prep',reviews:[],unread:0,lastSold:{},
  unlocked:[...START_ITEMS],menu:[...START_ITEMS],prices:{},courtRate:{day:RATE_DAY,peak:RATE_PEAK},upg:{},
  stock:{tra:20,suoi:12,dg:12,tl:6,cf:0,cau:12,banhmi:0,xoi:0,chuoi:0,mi:0}},dayState(m))}
function norm(d){
  d.stock=Object.assign(Object.fromEntries(ITEMS.map(i=>[i.id,0])),d.stock||{});
  d.reviews=d.reviews||[];
  if(!d.courts)d.courts=cleanCourts();
  if(!d.jobs)d.jobs=d.cleaning?[Object.assign({by:'owner'},d.cleaning)]:[];
  delete d.cleaning; d.staff=d.staff||0;
  d.reviews.forEach((r,i)=>{if(!r.id)r.id='r'+i+'_'+rand(1e6)});
  if(d.todayReviews){d.todayIds=d.todayReviews.map(r=>r.id);delete d.todayReviews}
  d.log=d.log||{};d.reviews=d.reviews||[];d.unread=d.unread||0;d.lastSold=d.lastSold||{};
  d.phase=d.phase||'open';
  d.name=d.name||'Sân Cầu Lông Nhà Mình';
  if(d.sellJob){d.sellJobs=[Object.assign({sid:0},d.sellJob)];delete d.sellJob}
  if(!d.nextEvent)d.nextEvent=(d.day||1)+2+Math.floor(Math.random()*3);
  if(d.avgOn===undefined)d.avgOn=true;
  if(!d.hist){d.hist={};if(d.day>1)d.hist[d.day-1]={s:Math.round((d.rating||4)*5),n:5}}
  d.courtsOpen=Math.max(1,Math.min(MAX_COURTS,d.courtsOpen||MAX_COURTS)); COURTS=d.courtsOpen;
  d.debt=d.debt||0; d.loan0=d.loan0||d.debt; d.fineDay=d.fineDay||0; if(d.wasBelow===undefined)d.wasBelow=(d.rating||4)<3;
  { const keep=S; S=d; d.rating=calcRating(); S=keep; }
  if(d.courts)while(d.courts.length<COURTS)d.courts.push({dirty:false});
  if(!d.unlocked)d.unlocked=ITEMS.map(i=>i.id);
  if(!d.menu)d.menu=[...d.unlocked];
  d.prices=d.prices||{}; d.courtRate=d.courtRate||{day:RATE_DAY,peak:RATE_PEAK}; d.upg=d.upg||{};
  d.stats=Object.assign({court:0,drink:0,cost:0,wage:0,served:0,lost:0,start:d.money,waste:0,sold:{}},d.stats||{});
  return d;
}
const SAVE_KEY='sancaulong-v2';
function load(){
  try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(d&&d.v===2&&d.S&&d.S.day){uid=Math.max(uid,d.uid||0);return norm(d.S)}}catch(e){}
  try{const o=JSON.parse(localStorage.getItem('sancaulong-v1'));if(o&&o.day){const d=norm(Object.assign(o,dayState(o.money)));d.phase='prep';return d}}catch(e){}
  return null;
}
function save(){if(!S)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:2,uid,savedAt:Date.now(),S}))}catch(e){}}
function L(k,n=1){S.log[k]=(S.log[k]||0)+n}
