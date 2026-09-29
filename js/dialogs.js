// dialogs.js — Hộp thoại: tên quán, vay vốn
/* ---------- Hộp thoại: tên quán, mã lưu game ---------- */
let modalOnClose=null;
function openModal(html,onClose){$('#mcard').innerHTML=html;$('#modal').classList.add('on');modalOnClose=onClose||null}
function closeModal(silent){$('#modal').classList.remove('on');const f=modalOnClose;modalOnClose=null;if(!silent&&f)f()}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('[data-mclose]'))closeModal()});
const NAME_SUGS=['Sân Cầu Lông Nhà Mình','Smash Club','Cầu Lông Chill','Sân Nhà Bé Mèo','Lông Vũ Quán','Sân Cầu Xóm Mới'];
function cleanName(t){return String(t||'').replace(/[<>"`]/g,'').replace(/\s+/g,' ').trim().slice(0,30)}
function askLoan(name,done){
  let n=3;
  const draw=()=>{
    const loan=n*COURT_COST;
    openModal(`<div class="mface">${avatar(OWNER_LOOK,'happy')}</div>
      <h2>🏦 Vay vốn mở sân</h2>
      <p style="text-align:center">Quán tối đa <b>${MAX_COURTS} sân</b>. Mỗi sân tốn <b>${fmt(COURT_COST)}</b>, muốn mở mấy sân thì ngân hàng cho vay bấy nhiêu. Lãi <b>${(INTEREST*100).toLocaleString('vi-VN')}% mỗi ngày</b>, cộng dồn vào nợ.</p>
      <div class="loan-pick"><button data-ln="-1" aria-label="Bớt sân">−</button><div><b>${n}</b><small>sân</small></div><button data-ln="1" aria-label="Thêm sân">+</button></div>
      <div class="courts-mini">${Array.from({length:MAX_COURTS},(_,i)=>`<i class="${i<n?'on':''}">${i+1}</i>`).join('')}</div>
      <div class="lvl lvl-${n<=3?'e':n<=6?'m':'h'}">${n<=3?'🙂 Dễ thở: hợp người mới chơi':n<=6?'😅 Vừa sức: đông khách hơn, lãi nặng hơn':'🔥 Khó: rất đông khách nhưng nợ khủng'}</div>
      <div class="quick-n">${[2,3,4,6,8,10].map(k=>`<button data-lnset="${k}" class="${k===n?'on':''}">${k} sân</button>`).join('')}</div>
      <div class="bank-card"><div class="bk-row"><span>Khoản vay</span><b>${fmt(loan)}</b></div>
        <div class="bk-row"><span>Lãi ngày đầu</span><b>+${fmt(loan*INTEREST)}</b></div>
        <div class="bk-row"><span>Tiền túi để nhập hàng</span><b>${fmt(START_CASH)}</b></div></div>
      <p class="note" style="text-align:center">Ít sân: nợ nhẹ nhưng ít khách. Nhiều sân: đông khách nhưng lãi mỗi ngày nặng. Sau này vẫn vay thêm để xây sân được.</p>
      <div class="mrow"><button class="btn press" id="lnOk">Ký hợp đồng vay & khai trương 🎉</button></div>`);
    $('#mcard').querySelectorAll('[data-ln]').forEach(b=>b.onclick=()=>{n=Math.max(1,Math.min(MAX_COURTS,n+ +b.dataset.ln));draw()});
    $('#mcard').querySelectorAll('[data-lnset]').forEach(b=>b.onclick=()=>{n=+b.dataset.lnset;draw()});
    $('#lnOk').onclick=()=>{closeModal(true);done(n)};
  };
  draw();
}
function askName(cur0,done,isNew){
  openModal(`<div class="mface">${avatar(OWNER_LOOK,'happy')}</div>
    <h2>${isNew?'Đặt tên quán của bạn':'Đổi tên quán'}</h2>
    <p style="text-align:center">Tên sẽ hiện trên bảng hiệu và trong mã lưu game.</p>
    <input id="nmIn" maxlength="30" placeholder="Ví dụ: Sân Cầu Lông Bé Na" value="${esc(cur0||'')}" autocomplete="off">
    <div class="sugs">${NAME_SUGS.map(n=>`<button data-sug="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <div class="err" id="nmErr"></div>
    <div class="mrow">${isNew?'':'<button class="btn ghost press" data-mclose>Huỷ</button>'}<button class="btn press" id="nmOk">${isNew?'Khai trương 🎉':'Lưu tên'}</button></div>`);
  const inp=$('#nmIn'); setTimeout(()=>inp.focus(),50);
  $('#mcard').querySelector('.sugs').onclick=e=>{const b=e.target.closest('[data-sug]');if(b){inp.value=b.dataset.sug;inp.focus()}};
  const ok=()=>{const n=cleanName(inp.value);if(n.length<2){$('#nmErr').textContent='Tên quán cần ít nhất 2 ký tự nha.';return}closeModal(true);done(n)};
  $('#nmOk').onclick=ok; inp.onkeydown=e=>{if(e.key==='Enter')ok()};
}

// Mã lưu game: nén tiến trình rồi mã hoá thành chuỗi chữ để người chơi tự cất
function crc32(str){let c,crc=~0;for(let i=0;i<str.length;i++){c=(crc^str.charCodeAt(i))&255;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xEDB88320:c>>>1;crc=(crc>>>8)^c}return ((~crc)>>>0).toString(36).toUpperCase().padStart(7,'0').slice(-5)}
const b64u={enc:u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
  dec:t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}};
async function zip(u8,mode){const cs=mode==='c'?new CompressionStream('deflate-raw'):new DecompressionStream('deflate-raw');const st=new Blob([u8]).stream().pipeThrough(cs);return new Uint8Array(await new Response(st).arrayBuffer())}
function snapshot(){
  // mã lưu từ đầu ngày kế tiếp (nếu đang mở cửa/đã đóng cửa) hoặc đúng màn chuẩn bị hiện tại
  const nextDay=S.phase!=='prep';
  const stock={};for(const it of ITEMS){const n=nextDay&&it.perish?0:S.stock[it.id];if(n)stock[it.id]=n}
  const db=Math.round(S.phase==='open'?S.debt*(1+INTEREST):S.debt);
  const hs={};Object.keys(S.hist||{}).map(Number).sort((a,b)=>b-a).slice(0,7).forEach(d=>hs[d]=[S.hist[d].s,S.hist[d].n,+(S.hist[d].b||0).toFixed(3)]);
  return {v:1,ao:S.avgOn?1:0,hs,co:COURTS,db,l0:S.loan0,fd:S.fineDay,n:S.name,d:S.day+(nextDay?1:0),m:Math.round(S.money),r:+S.rating.toFixed(2),s:stock,u:S.unlocked,mn:S.menu,p:S.prices,c:S.courtRate,g:Object.keys(S.upg||{}).filter(k=>S.upg[k]),
    ls:nextDay?S.stats.sold:S.lastSold,
    rv:S.reviews.slice(0,6).map(r=>({h:r.h,s:r.stars,t:r.t,l:r.likes,d:r.day,...(r.reply?{re:r.reply,f:r.follow,o:r.tone}:{})}))};
}
