// cloud-save.js — Mã ngắn 6 ký tự qua API /api/save
// ===== Mã ngắn trên máy chủ (Vercel + Upstash Redis): chỉ chạy khi game được host trên Vercel có thư mục /api =====
const CLOUD_KEY='sancaulong-cloud';
function cloudInfo(){try{return JSON.parse(localStorage.getItem(CLOUD_KEY))||null}catch(e){return null}}
function setCloud(o){try{localStorage.setItem(CLOUD_KEY,JSON.stringify(o))}catch(e){}}
const cloudOK=()=>/^https?:$/.test(location.protocol)&&!/claude\.ai|claudeusercontent|anthropic/i.test(location.hostname);
async function cloudCall(url,opt){
  let r; try{r=await fetch(url,opt)}catch(e){throw new Error('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại nha.')}
  let j={}; try{j=await r.json()}catch(e){throw new Error('Máy chủ chưa có chức năng mã ngắn (thiếu file api/save.js).')}
  if(!r.ok)throw new Error(j.error||'Máy chủ gặp lỗi, thử lại sau.');
  return j;
}
async function cloudSave(){
  const ci=cloudInfo()||{};
  const j=await cloudCall('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:packV2(),code:ci.code,secret:ci.secret})});
  setCloud({code:j.code,secret:j.secret,t:Date.now()}); return j.code;
}
async function cloudLoad(code){
  const j=await cloudCall('/api/save?code='+encodeURIComponent(code));
  setCloud({code:String(code).toUpperCase(),secret:j.secret,t:Date.now()});
  return j.data;
}
function cloudAutoSync(){ if(cloudOK()&&cloudInfo()&&S)cloudSave().catch(()=>{}) }
async function showKey(after){
  if(!S)return;
  openModal(`<h2>💾 Mã lưu game</h2><p style="text-align:center">Đang tạo mã...</p>`,after);
  let key; try{key=await makeKey()}catch(e){openModal(`<h2>Không tạo được mã</h2><p>${esc(e.message)}</p><div class="mrow"><button class="btn press" data-mclose>Đóng</button></div>`,after);return}
  const from=S.phase==='prep'?`màn chuẩn bị ngày ${S.day}`:`sáng ngày ${S.day+1}`;
  openModal(`<h2>💾 Mã lưu game</h2>
    ${(()=>{const ci=cloudInfo();return cloudOK()?`<div class="cloud-box"><b>☁️ Mã ngắn 6 ký tự</b>
      ${ci?`<div class="short-code" id="shortCode">${ci.code}</div><p class="note" style="text-align:center">Mã của quán bạn. Lần cập nhật gần nhất: ${new Date(ci.t).toLocaleString('vi-VN')}. Cuối mỗi ngày game tự cập nhật vào mã này.</p>`:'<div class="short-code empty" id="shortCode">––––––</div><p class="note" style="text-align:center">Lưu tiến trình lên máy chủ, chỉ cần nhớ 6 ký tự.</p>'}
      <div class="mrow"><button class="btn press" id="cloudBtn">${ci?'☁️ Cập nhật tiến trình mới nhất':'☁️ Tạo mã ngắn'}</button>${ci?'<button class="btn ghost press" id="cloudCopy">📋 Chép mã</button>':''}</div>
      <div class="err" id="cloudMsg"></div></div>`:`<p class="note" style="text-align:center">☁️ Mã ngắn 6 ký tự chỉ dùng được khi chơi trên trang web riêng của game (bản host trên Vercel).</p>`})()}
    <p style="margin-top:10px"><b>Mã dài</b> (dùng được cả khi không có mạng): cất ở chỗ an toàn, lúc cần thì chọn <b>Nhập mã lưu game</b> ở màn hình mở đầu rồi dán vào.</p>
    <textarea id="keyTxt" readonly>${key}</textarea>
    <p class="note">Mã gọn ${key.length} ký tự, lưu: tên quán, ngày, tiền, nợ, sao, số sân, kho hàng, món đã mở, menu, giá và nâng cấp. Review cũ không nằm trong mã. Nhập mã sẽ chơi tiếp từ ${from}.</p>
    <div class="err" id="keyMsg" style="color:#239a53"></div>
    <div class="mrow"><button class="btn press" id="keyCopy">📋 Sao chép</button><button class="btn ghost press" id="keyDl">⬇️ Tải file</button></div>
    <div class="mrow"><button class="btn ghost press" data-mclose>Đóng</button></div>`,after);
  const ta=$('#keyTxt');
  const cb=$('#cloudBtn');
  if(cb)cb.onclick=async()=>{cb.disabled=true;$('#cloudMsg').style.color='#5f6f7a';$('#cloudMsg').textContent='Đang lưu lên máy chủ...';
    try{const c=await cloudSave();$('#shortCode').textContent=c;$('#shortCode').classList.remove('empty');$('#cloudMsg').style.color='#239a53';$('#cloudMsg').textContent=`Đã lưu! Mã của bạn là ${c}. Ghi lại mã này nha.`}
    catch(e){$('#cloudMsg').style.color='#d6334f';$('#cloudMsg').textContent=e.message}
    cb.disabled=false};
  const cc=$('#cloudCopy'); if(cc)cc.onclick=async()=>{const c=$('#shortCode').textContent;try{await navigator.clipboard.writeText(c);$('#cloudMsg').style.color='#239a53';$('#cloudMsg').textContent='Đã chép mã '+c}catch(e){$('#cloudMsg').textContent='Mã của bạn: '+c}};
  $('#keyCopy').onclick=async()=>{
    let ok=false; try{await navigator.clipboard.writeText(key);ok=true}catch(e){}
    if(!ok){ta.focus();ta.select();try{ok=document.execCommand('copy')}catch(e){}}
    $('#keyMsg').textContent=ok?'Đã sao chép mã!':'Không tự sao chép được, hãy giữ vào ô mã để chọn và sao chép thủ công.';
  };
  $('#keyDl').onclick=()=>{
    try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([`Mã lưu game ${S.name}\n${new Date().toLocaleString('vi-VN')}\n\n${key}\n`],{type:'text/plain'}));
      a.download=`ma-luu-${cleanName(S.name).replace(/\s+/g,'-')}-ngay${S.day}.txt`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
      $('#keyMsg').textContent='Đã tải file mã về máy.'}catch(e){$('#keyMsg').textContent='Trình duyệt chặn tải file, hãy dùng nút Sao chép.'}
  };
  ta.onclick=()=>ta.select();
}
function askImport(done,hasSave){
  openModal(`<h2>🔑 Nhập mã lưu game</h2>
    <p>Nhập <b>mã ngắn 6 ký tự</b> (ví dụ K7F2QX) hoặc dán <b>mã dài</b> bắt đầu bằng SC2 (mã cũ SCL1 vẫn dùng được).</p>
    <textarea id="impTxt" placeholder="K7F2QX hoặc SC2..." autocapitalize="characters"></textarea>
    ${hasSave?'<p class="note">Lưu ý: tiến trình đang có trên máy này sẽ bị thay bằng tiến trình trong mã.</p>':''}
    <div class="err" id="impErr"></div>
    <div class="mrow"><button class="btn ghost press" data-mclose>Huỷ</button><button class="btn press" id="impOk">Chơi tiếp</button></div>`);
  setTimeout(()=>$('#impTxt').focus(),50);
  $('#impOk').onclick=async()=>{
    const btn=$('#impOk'); btn.disabled=true;
    try{let v=$('#impTxt').value.trim();
      if(/^[0-9A-Za-z]{6}$/.test(v)){if(!cloudOK())throw new Error('Mã ngắn chỉ nhập được trên trang web riêng của game (bản host trên Vercel).');$('#impErr').style.color='#5f6f7a';$('#impErr').textContent='Đang tải từ máy chủ...';v=await cloudLoad(v.toUpperCase())}
      const st=await readKey(v);closeModal(true);done(st)}
    catch(e){$('#impErr').style.color='';$('#impErr').textContent=e.message;btn.disabled=false}
  };
}
