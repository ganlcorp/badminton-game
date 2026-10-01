// save-code.js — Mã lưu game dạng ngắn gọn (SC2)
// ===== Mã lưu v2: đóng gói nhị phân gọn (varint) thay cho JSON, chỉ giữ tiến trình cốt lõi =====
const UPG_ORDER=['cam','broom','vac','bench','fan','led','sign']; // chỉ thêm mới vào cuối, không đổi thứ tự
function crc16(u8){let c=0xFFFF;for(const b of u8){c^=b<<8;for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c}
function packV2(){
  const o=[], w=n=>{n=Math.max(0,Math.round(n||0));while(n>=128){o.push((n&127)|128);n=Math.floor(n/128)}o.push(n)};
  const nextDay=S.phase!=='prep';
  const nm=new TextEncoder().encode(cleanName(S.name).slice(0,30));
  const debt=S.phase==='open'?S.debt*(1+INTEREST):S.debt;
  const pr=ITEMS.map((it,i)=>[i,priceOf(it.id)]).filter(([i,v])=>v!==ITEMS[i].price);
  const cr=S.courtRate.day!==RATE_DAY||S.courtRate.peak!==RATE_PEAK;
  w(2); w(nm.length); nm.forEach(b=>o.push(b));
  w(S.day+(nextDay?1:0)); w(S.money/1000); w(S.rating*100); w(COURTS); w(debt/1000); w(S.loan0/1000);
  const bs=S.branches||[];
  w((S.avgOn?1:0)|(pr.length?2:0)|(cr?4:0)|(bs.length?8:0)|(S.collateral?16:0));
  const mask=list=>ITEMS.reduce((m,it,i)=>list.includes(it.id)?m|(1<<i):m,0);
  w(mask(S.unlocked)); w(mask(S.menu)); w(UPG_ORDER.reduce((m,k,i)=>S.upg&&S.upg[k]?m|(1<<i):m,0));
  ITEMS.forEach(it=>w(nextDay&&it.perish?0:S.stock[it.id]));
  if(pr.length){w(pr.length);pr.forEach(([i,v])=>{w(i);w(v/1000)})}
  if(cr){w(S.courtRate.day/1000);w(S.courtRate.peak/1000)}
  if(bs.length){w(bs.length);bs.forEach(b=>{w(BRANCH_LOCS.findIndex(l=>l.id===b.loc));BR_ROLES.forEach(r=>w(b.staff[r.k]||0));w(b.rating*100);w(b.openedDay);w(Math.max(0,b.total||0)/1000)})}
  if(S.collateral)w(S.collateral/1000);
  const u8=new Uint8Array(o), c=crc16(u8);
  return 'SC2'+b64u.enc(new Uint8Array([...u8,c>>8,c&255]));
}
function unpackV2(body){
  let u8; try{u8=b64u.dec(body)}catch(e){throw new Error('Mã có ký tự lạ. Hãy dán lại đầy đủ nhé.')}
  if(u8.length<8)throw new Error('Mã bị thiếu. Hãy dán lại đầy đủ nhé.');
  const data=u8.subarray(0,u8.length-2), c=(u8[u8.length-2]<<8)|u8[u8.length-1];
  if(crc16(data)!==c)throw new Error('Mã bị sai một vài ký tự (kiểm tra không khớp). Hãy dán lại đầy đủ nhé.');
  let p=0; const r=()=>{let n=0,m=1,b;do{if(p>=data.length)throw new Error('Mã bị thiếu. Hãy dán lại đầy đủ nhé.');b=data[p++];n+=(b&127)*m;m*=128}while(b&128);return n};
  if(r()!==2)throw new Error('Phiên bản mã không hỗ trợ.');
  const L=r(); const name=new TextDecoder().decode(data.subarray(p,p+L)); p+=L;
  const day=r(), money=r()*1000, rating=r()/100, co=r(), debt=r()*1000, loan0=r()*1000, fl=r();
  const um=r(), mm=r(), gm=r();
  const stock={}; ITEMS.forEach(it=>stock[it.id]=r());
  const prices={}; if(fl&2){const k=r();for(let j=0;j<k;j++){const i=r(),v=r()*1000;if(ITEMS[i])prices[ITEMS[i].id]=v}}
  const courtRate=fl&4?{day:r()*1000,peak:r()*1000}:{day:RATE_DAY,peak:RATE_PEAK};
  const branches=[]; if(fl&8){const nb=r();for(let j=0;j<nb;j++){const li=r(),staff={};BR_ROLES.forEach(x=>staff[x.k]=r());const rating=r()/100,openedDay=r(),total=r()*1000;if(BRANCH_LOCS[li])branches.push({loc:BRANCH_LOCS[li].id,staff,rating,openedDay,total,hist:[]})}}
  const collateral=fl&16?r()*1000:0;
  const bits=m=>ITEMS.filter((_,i)=>m&(1<<i)).map(it=>it.id);
  const st=newGame(cleanName(name)||undefined,co||MAX_COURTS);
  Object.assign(st,{day,money,rating:clamp(rating||5),phase:'prep',stock:Object.assign(Object.fromEntries(ITEMS.map(i=>[i.id,0])),stock),
    unlocked:bits(um).length?bits(um):[...START_ITEMS],menu:bits(mm).length?bits(mm):bits(um),prices,courtRate,
    upg:Object.fromEntries(UPG_ORDER.filter((k,i)=>gm&(1<<i)).map(k=>[k,1])),lastSold:{},reviews:[],debt,loan0:loan0||debt,fineDay:0,avgOn:!!(fl&1),branches,collateral});
  Object.assign(st,dayState(st.money));
  st.hist={}; if(st.avgOn)st.hist[day-1]={s:Math.max(40,Math.round(st.rating*(40+PRIOR_N)-PRIOR_STAR*PRIOR_N)),n:40}; // giữ đúng số sao lúc lưu
  const nd=norm(st); { const keep=S; S=nd; nd.rating=calcRating(); S=keep; } nd.wasBelow=nd.rating<3; return nd;
}
async function makeKey(){ return packV2(); }
async function makeKeyV1(){
  const json=JSON.stringify(snapshot()), raw=new TextEncoder().encode(json);
  let body,tag='J';
  try{if(window.CompressionStream){body=b64u.enc(await zip(raw,'c'));tag='Z'}}catch(e){}
  if(!body)body=b64u.enc(raw);
  return `SCL1${tag}-${crc32(json)}-${body}`;
}
async function readKey(key){
  const k=String(key||'').replace(/\s+/g,'');
  if(/^SC2/.test(k))return unpackV2(k.slice(3));
  const m=k.match(/^SCL1([ZJ])-([0-9A-Z]{5})-([A-Za-z0-9_-]+)$/);
  if(!m)throw new Error('Mã không đúng định dạng. Mã hợp lệ bắt đầu bằng "SCL1".');
  let u8; try{u8=b64u.dec(m[3]); if(m[1]==='Z')u8=await zip(u8,'d')}catch(e){throw new Error('Mã bị thiếu hoặc sai ký tự. Hãy dán lại đầy đủ nhé.')}
  const json=new TextDecoder().decode(u8);
  if(crc32(json)!==m[2])throw new Error('Mã bị sai một vài ký tự (kiểm tra không khớp). Hãy dán lại đầy đủ nhé.');
  const o=JSON.parse(json); if(!o||o.v!==1||!o.d)throw new Error('Mã không đọc được.');
  const st=newGame(cleanName(o.n)||undefined,o.co||MAX_COURTS);
  st.debt=o.db||0; st.loan0=o.l0||st.debt; st.fineDay=o.fd||0;
  st.avgOn=o.ao===undefined?true:!!o.ao;
  st.hist={};for(const d in (o.hs||{}))st.hist[d]={s:o.hs[d][0],n:o.hs[d][1],b:o.hs[d][2]||0};
  Object.assign(st,{day:o.d,money:o.m,rating:clamp(o.r||4),phase:'prep',
    stock:Object.assign(Object.fromEntries(ITEMS.map(i=>[i.id,0])),o.s||{}),
    unlocked:(o.u||START_ITEMS).filter(id=>IT[id]),menu:(o.mn||o.u||START_ITEMS).filter(id=>IT[id]),
    prices:o.p||{},courtRate:o.c||{day:RATE_DAY,peak:RATE_PEAK},upg:Object.fromEntries((o.g||[]).filter(k=>UPG[k]).map(k=>[k,1])),lastSold:o.ls||{},
    reviews:(o.rv||[]).map((r,i)=>({id:'k'+i+'_'+(++uid),h:r.h,stars:r.s,t:r.t,likes:r.l,day:r.d,look:makeLook(pick(NAMES)),...(r.re?{reply:r.re,follow:r.f,tone:r.o}:{})}))});
  Object.assign(st,dayState(st.money));
  if(!Object.keys(st.hist).length&&o.r)st.hist[st.day-1]={s:Math.round(o.r*5),n:5};
  const nd=norm(st); { const keep=S; S=nd; nd.rating=calcRating(); S=keep; } nd.wasBelow=nd.rating<3; return nd;
}
