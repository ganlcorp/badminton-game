// main.js — Gắn sự kiện giao diện và khởi động game
/* ---------- Events ---------- */
rvEvents($('#over'),()=>{if(S&&S.phase==='closed')keepScroll(showSummary);else if(S&&S.phase==='prep')keepScroll(showPrep)});
rvEvents($('#sheetBody'),()=>{if(cur&&cur.type==='rv'){const y=$('#sheet').scrollTop;buildSheet();$('#sheet').scrollTop=y}});
function toast(msg,kind=''){if(msg[0]==='+'){const m=$('.money');m.classList.remove('bump');void m.offsetWidth;m.classList.add('bump')}const d=document.createElement('div');d.className='toast '+kind;d.textContent=msg;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),1800);while($('#toasts').children.length>3)$('#toasts').firstChild.remove()}
$('#qB').addEventListener('click',e=>{if(S&&S.phase==='open')openCounter(e,'B')});
$('#qD').addEventListener('click',e=>{if(S&&S.phase==='open')openCounter(e,'D')});
$('#courts').addEventListener('pointerdown',e=>{const c=e.target.closest('[data-c]');if(c)tapCourt(+c.dataset.c)});
$('#khoBtn').onclick=e=>{e.stopPropagation();openKho()};
$('#bBar').addEventListener('click',e=>{e.stopPropagation();const J=S&&S.bookJob,c=J&&S.qB.find(x=>x.id===J.id);ownerSay(c?`${BOOKER_NAME} đang xếp sân cho ${c.name}. Thỉnh thoảng chị ấy xếp nhầm, để ý nha!`:`${BOOKER_NAME} đang rảnh, có khách là chị ấy xếp liền.`)});
$('#sBar').addEventListener('click',e=>{e.stopPropagation();const sj=e.target.closest('[data-sid]');checkSeller(sj?+sj.dataset.sid:null)});
$('#sBar').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();checkSeller()}});
$('#rvBtn').onclick=openReviews;
$('#rvBtnH').onclick=openReviews;
$('#mapBtn').onclick=$('#mapBtnH').onclick=()=>openMap();
$('#mapOv').addEventListener('click',e=>{if(e.target.id==='mapOv')closeMap()});
$('#keyBtn').onclick=$('#keyBtnH').onclick=()=>{if(!S)return;const was=paused;paused=true;showKey(()=>{paused=was;last=performance.now()})};
$('#sheetClose').onclick=closeSheet;
$('#backdrop').onclick=closeSheet;
$('#ownerFace').onclick=()=>ownerSay(pick(['Cố lên nào!','Khách đông quá trời!','Nhớ quét sân sau mỗi lượt nha!','Sân sạch, khách vui, mình giàu!']));
$('#sheetBody').addEventListener('click',e=>{
  const row=e.target.closest('[data-court]');if(row)return assign(+row.dataset.court);
  const stp=e.target.closest('[data-step]');if(stp){const [k,a]=stp.dataset.step.split(':');return doStep(k,a)}
  if(e.target.closest('[data-cookclose]')){const k=cookK;if(k&&bench[k]&&!bench[k].busy)bench[k]={step:0};cookK=null;return buildSheet()}
  if(e.target.classList&&e.target.classList.contains('cookpop')){const k=cookK;if(k&&bench[k]&&!bench[k].busy)bench[k]={step:0};cookK=null;return buildSheet()}
  const ck=e.target.closest('[data-cook]');if(ck){const k=ck.dataset.cook;
    if(!cur||cur.done)return;
    if(!S.unlocked.includes(k))return ownerSay(`Chưa có ${IT[k].name}, mở ở mục Nâng cấp lúc chuẩn bị nha.`);
    if(bench[k].busy)return ownerSay(`${FLOW[k].busy}, chờ xíu nha!`);
    if(S.stock[k]-(tray[k]||0)-brewCount(k)<=0&&bench[k].step===0)return ownerSay(`Tủ hết ${IT[k].name} rồi! Vào Kho mua gấp thôi.`);
    cookK=k;return buildSheet()}
  const take=e.target.closest('[data-take]');if(take){const id=take.dataset.take;if(tray[id]>0){tray[id]--;if(!tray[id])delete tray[id];buildSheet()}return}
  const b=e.target.closest('[data-buy]');if(b)return buyRush(b.dataset.buy);
  const a=e.target.closest('[data-act]');if(!a)return;
  ({decline,close:closeSheet,give,clear:()=>{tray={};resetBench();buildSheet()},soldout:soldOut})[a.dataset.act]();
});
function resumeGame(){paused=false;last=performance.now();renderHUD()}
function showPause(){
  if(!S||S.phase!=='open')return;
  paused=true; renderHUD();
  openModal(`<div class="pmenu"><div class="mface">${avatar(OWNER_LOOK,ownerMood())}</div>
    <h2>⏸ Tạm dừng</h2>
    <div class="pinfo"><span>🏪 ${esc(S.name)}</span><span>📅 Ngày ${S.day}, ${hm(S.time)}</span><span>🪙 ${fmt(S.money)}</span><span>🏦 Nợ ${tr(S.debt)}</span></div>
    <button class="btn press" id="pmGo">▶ Tiếp tục</button>
    <button class="btn ghost press" id="pmKey">🔑 Lấy mã lưu game</button>
    <button class="btn warn press" id="pmExit">💾 Lưu & thoát</button>
    <p class="note" style="text-align:center;margin-top:8px">Lưu & thoát sẽ về màn hình mở đầu. Bấm "Chơi tiếp" để quay lại đúng lúc này.</p></div>`,resumeGame);
  $('#pmGo').onclick=()=>closeModal();
  $('#pmKey').onclick=()=>{modalOnClose=null;showKey(showPause)};
  $('#pmExit').onclick=()=>{closeModal(true);closeSheet();save();cloudAutoSync();paused=true;toast('Đã lưu game');startScreen()};
}
$('#pauseBtn').onclick=()=>{if(!S||S.phase!=='open')return;if(paused)resumeGame();else showPause()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&S&&S.phase==='open'&&!paused&&!$('#modal').classList.contains('on'))showPause()});
$('#speedBtn').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('#speedBtn').textContent=speed+'x'};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});

setInterval(()=>{if(S&&!paused)save()},3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
addEventListener('pagehide',save);
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

$('#ownerFace').innerHTML=chibi(OWNER_LOOK,'happy','owner');
$('#guardFace').onclick=()=>guardSay(pick(['Có tui canh, yên tâm!','An ninh ổn định nha chủ!','Ai định bùng là biết tay!']));
setInterval(()=>{
  const now=performance.now();let dt=(now-last)/1000;last=now;if(dt>.5)dt=.5;
  if(S&&!paused&&S.phase==='open')step(dt*GAME_SPEED*speed);
  render();
},100);
// nạp tranh SVG rồi mới mở màn hình đầu
loadArt().then(()=>{fitArt();startScreen();});
