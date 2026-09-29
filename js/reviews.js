// reviews.js — Review Gen Z và phản hồi của chủ quán
/* ---------- Review Gen Z ---------- */
const HANDLES=['@lanh.lung.boy','@chipu.caulong','@bong.bay.99','@anh.ba.q7','@gau.map.smash','@tieu.thu.tennis','@kenji.vn','@hoa.hong.do','@dat.dz','@team.dap.cau.q8','@banh.bao.mini','@mr.backhand','@cam.ne.2k6','@vitamin.sea','@minhthu.2k5','@kh0a_smash','@vy.caulong','@dungday.12','@baotram.xinhxinh','@longnguyen_','@hieuu.badminton','@my.caulonggg','@quan_smash_king','@nhinhi.hihi','@tuanbeo.97','@thao.chill','@phat.dapcau','@ngocc.nee','@trammm.2k4','@gia.bao.smash'];
const RV={
  fast:{s:[5,5,4],t:[
    'Đặt sân cái rụp, chủ quán xử lý nhanh hơn người yêu cũ trở mặt 😭 10 điểm',
    'Chủ quán green flag chính hiệu, hỏi phát có sân liền 💚',
    'Tới là có sân, không chờ không đợi, ưng cái bụng ghê 🫶',
    'Book sân mượt như lướt TikTok, real 💯']},
  cleanStart:{s:[5,4,5],t:[
    'Sân sạch bong kin kít, đánh xong muốn ở lại luôn ạ ✨',
    'Vô sân thấy sạch sẽ thơm tho là slay dữ chưa 💅',
    'Sân sạch như chưa từng có ai chơi, chủ quán đỉnh nóc kịch trần 🔥']},
  drinkOk:{s:[5,4],t:[
    'Trà đá mát lạnh cứu rỗi tâm hồn sau trận smash 🥹',
    'Nước lên nhanh xỉu, chưa kịp khát đã có 🥤',
    'Gọi nước cái có liền, dịch vụ khét lẹt 🔥']},
  food:{s:[5,4],t:[
    'Bánh mì ăn mlem mlem, đánh xong làm ổ là hết nước chấm 🥖',
    'Xôi sáng ở đây ngon bất ngờ, sẽ quay lại vì xôi chứ không phải vì cầu 🤭',
    'Mì ly sau trận tối là chân ái, mãi iu 🍜']},
  wait:{s:[1,2,2],t:[
    'Chờ muốn mọc rễ luôn á, ủa alo có ai ở quầy khum 🙃',
    'Đứng đợi mà tưởng đang săn vé concert, thôi về 💀',
    'Tui đợi lâu tới mức suy luôn rồi đó 🥲']},
  badDecline:{s:[1,2],t:[
    'Báo hết sân mà nhìn vô trống trơn, xỉu ngang 🫠',
    'Red flag: chủ nói hết sân nhưng sân trống hoắc 🚩',
    'Sân trống mà không cho chơi, ảo thật đấy 🤡']},
  conflict:{s:[2,3],t:[
    'Xếp sân mà suýt đụng nhóm khác, lú thật sự 😵‍💫',
    'Chủ quán hơi ô dề vụ xếp sân nha, check lại lịch giùm 😅']},
  dirty:{s:[1,2,2],t:[
    'Sân dơ như cái chợ, vỏ chai lăn lóc, u là trời 😤',
    'Vô sân giẫm trúng vỏ chuối, tưởng đang chơi Mario Kart 🍌💀',
    'Đánh cầu hay đi nhặt rác vậy trời, cay ghê 😮‍💨']},
  wrong:{s:[2,3],t:[
    'Gọi nước suối ra tăng lực, chủ quán đang ở vũ trụ nào vậy 🌌',
    'Order một đằng ra một nẻo, nhưng thôi thấy dễ thương nên tha 🫣']},
  soldOut:{s:[2,3],t:[
    'Hết nước giữa trận, khát khô cổ, xu cà na thật sự 🥲',
    'Tới công chuyện: sân cầu lông mà hết cầu 🏸❌',
    'Muốn ăn mà hết đồ, nhập thêm hàng đi chủ ơi 🙏']},
  fakeSold:{s:[1,2],t:[
    'Nói hết món mà tủ còn nguyên, keo lỳ tái châu hả 🤨',
    'Tủ còn đầy mà bảo hết, chủ quán đang troll tụi mình à 🤡']},
  pricey:{s:[2,2,3],t:['Giá chát xỉu, tưởng thuê sân ở trung tâm thương mại 😵','Chai nước mà giá như trà sữa size L, cay ghê 🥲','Sân đẹp nhưng ví tui khóc rồi 💸']},
  cheap:{s:[5,5,4],t:['Giá này là thuộc hàng hiếm, đánh 2 tiếng chưa bằng 1 ly trà sữa 🧋','Giá mềm như bún, sinh viên mãi iu 🫶','Rẻ mà chất, chủ quán đang làm từ thiện hả 🥹','Giá hạt dẻ, cuối tháng vẫn đi đánh được 🌰']},
  bookerWrong:{s:[2,2,3],t:['Lễ tân xếp tụi mình vô sân có người đánh rồi, đứng chờ quê xệ 😑','Đặt sân mà chị lễ tân ghi nhầm, may chủ quán xếp lại liền 😮‍💨']},
  bookerOk:{s:[5,4],t:['Có chị lễ tân xếp sân nhanh ghê, tới là có sân liền 👍','Lễ tân nhớ lịch giỏi, khỏi chờ lâu 🗓️']},
  sellerWrong:{s:[2,2,3],t:['Nhân viên đưa nhầm nước tăng lực trong khi tui gọi nước suối, hơi lú nha 😵‍💫','Bạn nhân viên dễ thương mà hay nhầm món ghê, chủ quán nhắc bạn xíu nha 🫠','Gọi một đằng nhân viên đưa một nẻo, lần sau tự lấy luôn cho chắc 🙃']},
  fixedEarly:{s:[5,4],t:['Thấy chủ quán đứng canh nhân viên lấy đồ, đưa là đúng món, chuyên nghiệp ghê 👏']},
  fixed:{s:[3,4],t:['Nhân viên bán nhầm nhưng chủ quán ra đổi lại liền, xin lỗi dễ thương nên thông cảm 🫶','Bị đưa nhầm món mà chủ quán xử lý nhanh, thôi cho qua nha 👌']},
  sellerOk:{s:[5,4],t:['Có nhân viên đứng quầy nên gọi nước nhanh hẳn, khỏi chờ lâu 👍','Bạn nhân viên bán hàng nhanh nhẹn, mát tay ghê 🧃']},
  caught:{s:[5,4,5],t:['Bảo vệ quán tóm gọn nhóm định bùng tiền sân, an ninh 10 điểm 👮','Có anh bảo vệ canh nên đánh yên tâm, xe cộ cũng an toàn 🛡️','Thấy bảo vệ chặn đám bùng tiền, quán này làm ăn đàng hoàng ghê 👏']},
  dash:{s:[3,4,3],t:['Hôm nay thấy có nhóm đánh xong chạy mất tiêu không trả tiền, thương chủ quán ghê 🥲','Bàn bên cạnh bùng tiền sân, chủ quán mặt buồn thiu, tui trả dư 5k an ủi 🫂','Quán nên gắn camera đi, nãy có đám bùng tiền chạy lẹ như Usain Bolt 🏃‍♂️💨']},
  late:{s:[2,3,2],t:['Đợi muốn đóng rêu mới được phục vụ, đói muốn xỉu 😵','Gọi nước từ hiệp 1 tới hiệp 3 mới có, chắc nước đi đường vòng 🌀','Chờ lâu ghê, nhưng chủ quán cười xin lỗi nên thôi 🙂']},
  busy:{s:[4,5,4],t:['Tối nay quán đông như hội chợ, vui xỉu, không khí cháy phố 🔥','Giờ cao điểm mà vẫn có sân, chủ quán xếp khéo ghê 👏','Đông mà vẫn gọn gàng, chủ quán multitask đỉnh nóc 🐙']},
  staff:{s:[5,4],t:['Nhân viên dọn sân nhanh như ninja, vừa đánh xong sân đã sạch bong 🥷','Bạn nhân viên thời vụ dễ thương, dọn sân kỹ ghê 🧹✨']},
  coffee:{s:[5,4],t:['Cà phê sữa ở đây đậm đà, đánh cầu xong làm ly tỉnh hẳn ☕','Không ngờ sân cầu lông mà cà phê ngon vậy, mãi mê ☕🫶']},
  noodle:{s:[5,4,4],t:['Mì ly nóng hổi sau trận tối, hạnh phúc đơn giản vậy thôi 🍜','Chủ quán chế mì nhanh, nước sôi vừa tới, 10 điểm 🍜']},
  neutral:{s:[4,5,4,3],t:['Sân ok, đèn sáng, lưới căng, không có gì để chê 👍','Lần đầu ghé, thấy cũng được, sẽ rủ bạn bè quay lại 🙂','Sân sạch sẽ, chủ quán thân thiện, giá hợp lý ✌️',
    'Sân ổn áp, giá mềm, chill phết 👌',
    'Không có gì để chê, cũng chưa có gì để flex, sẽ quay lại 😌']},
};
function genReviews(){
  const L=S.log, pool=[];
  for(const k in RV)if(L[k])for(let i=0;i<Math.min(L[k],4);i++)pool.push(k);
  if(!pool.length)pool.push('neutral');
  const n=Math.min(6,Math.max(3,Math.round(pool.length/2.5)));
  const out=[],used=new Set();
  for(let i=0;i<40&&out.length<n;i++){
    const k=pick(pool),t=pick(RV[k].t);if(used.has(t))continue;used.add(t);
    out.push({id:'r'+S.day+'_'+(++uid),h:pick(HANDLES),stars:pick(RV[k].s),t,likes:3+rand(900),day:S.day,look:makeLook(pick(NAMES)),counted:false});
  }
  const ev=S.event;
  if(ev&&ev.day===S.day&&ev.state==='done'){
    const good=['Trời ơi hôm nay được giao lưu với {n} ở sân này, sân xịn, phục vụ nhanh, 10 điểm 😭🏸','Idol {n} khen sân sạch nước mát, tui xỉu ngang luôn 🥹','Sân này giờ là sân của idol rồi nha, cuối tuần kéo nguyên hội tới 🔥','Clip {n} đánh ở sân này lên xu hướng rồi kìa, quán nổi tiếng thiệt sự 📈'];
    const bad=['Quán phục vụ như cqq, idol tới mà fan chờ mòn mỏi 🙄','Mở sân không được thì nghỉ mẹ đi, mời idol về cho quê 😤','Má sân cầu lông được idol ghé thăm mà phục vụ như cqq 🙄','Sân dỏm mà bày đặt mời VĐV, dẹp mẹ sân đi 😤','Để {n} chờ muốn mốc meo, quê dùm quán luôn á 🤦','Idol vô sân mà mặt khó chịu thấy rõ, clip lan khắp TikTok rồi, toang 🫠','Nước thì lâu, sân thì bẩn, mời idol về chi cho quê vậy trời 🚩'];
    const pool=ev.ok?good:bad; const used=new Set();
    for(let i=0;i<3;i++){let t;do{t=pick(pool)}while(used.has(t)&&used.size<pool.length);used.add(t);
      out.unshift({id:'r'+S.day+'_'+(++uid),h:pick(HANDLES),stars:ev.ok?5:1,t:t.split('{n}').join(ev.vip.n),likes:2000+rand(18000),day:S.day,look:makeLook(pick(NAMES)),viral:true,platform:pick(['TikTok','Threads','Facebook'])})}
  }
  // ngày làm ăn tệ: có bài chê lan truyền trên Threads / TikTok
  const Lg=S.log, hh=S.hist[S.day], avg=hh&&hh.n?hh.s/hh.n:5;
  const badPts=(Lg.wait||0)+(Lg.dirty||0)*2+(Lg.wrong||0)+(Lg.sellerWrong||0)+(Lg.badDecline||0)*2+(Lg.conflict||0);
  if(!(ev&&ev.day===S.day)&&(avg<3.3||badPts>=7)){
    const VB=[];
    if((Lg.wait||0)+(Lg.late||0)>=2)VB.push('Quán phục vụ như cqq, gọi chai nước chờ muốn mọc rễ 🙄');
    if((Lg.food||0)+(Lg.noodle||0)>0||(Lg.wrong||0)>0)VB.push('Đồ ăn dở ẹc mà giá thì chát, đưa món còn lộn tùm lum 🤮');
    if((Lg.conflict||0)+(Lg.badDecline||0)>0)VB.push('Xếp sân ngu thiệt, còn sân trống mà nói hết, đặt trước tới nơi bị trùng giờ 🤦');
    if((Lg.dirty||0)>0)VB.push('Sân tưởng đâu bãi tập kết rác, vỏ chai vỏ chuối lăn lóc giữa sân 🗑️');
    VB.push('Mở sân không được thì nghỉ mẹ đi, làm ăn gì kỳ cục vậy 😤');
    const k=Math.min(VB.length,badPts>=12||avg<2.6?2:1);
    for(let i=0;i<k;i++){const t=VB.splice(rand(VB.length),1)[0];
      out.unshift({id:'r'+S.day+'_'+(++uid),h:pick(HANDLES),stars:1,t,likes:1500+rand(12000),day:S.day,look:makeLook(pick(NAMES)),viral:true,platform:pick(['TikTok','Threads'])})}
  }
  return out;
}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drafts={};
const POS_WORDS=['ạ','dạ','sửa','hứa','mong','tặng','iu','yêu','thương','ghi nhận','tiếp thu','khắc phục','cải thiện','cố gắng','xin lỗi','cảm ơn','cám ơn','thông cảm','rút kinh nghiệm','lần sau','quay lại','trân trọng','thành thật','hẹn gặp','chân thành','sẽ tốt hơn','nâng cấp'];
const POS_ASCII=['khac phuc','cai thien','co gang','xin loi','cam on','thong cam','rut kinh nghiem','tiep thu','ghi nhan'];
const BAD_WORDS=['ngu','ngáo','khùng','điên','hâm','láo','xạo','chó','cút','câm','đéo','đếch','kệ','đm','dm','đcm','dcm','vcl','vl','cc','clm','cl','lol','mày','tao','cmm','đĩ','dở hơi','óc chó','đồ ngu','ai mượn','không thích thì','khỏi tới','đừng tới','biến đi','im đi','nói nhảm','vớ vẩn','tào lao','mặc kệ','kệ bạn','tại bạn','mắc gì','liên quan gì','ăn vạ','xàm','xàm xí','bố láo','mất dạy','vô học','trẻ trâu','ảo tưởng','hãm','hãm tài','khó ưa','khách gì kì','đòi hỏi','rảnh','nhảm','phiền','ai cho','đéo cần','kệ mẹ','đồ khùng','cà khịa','chê thì','ráng chịu','ở nhà đi','thích thì','không cần'];
function noAcc(t){return t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')}
function hits(text,list,ascii){
  const t=' '+text.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,' ')+' ';
  let n=0; for(const w of list)if(t.includes(' '+w+' '))n++;
  if(ascii){const a=noAcc(t);for(const w of ascii)if(a.includes(' '+w+' '))n++}
  return n;
}
function judge(text){const bad=hits(text,BAD_WORDS),good=hits(text,POS_WORDS,POS_ASCII);return bad?'rude':good?'nice':'plain'}
const FOLLOW={
  nice:{bad:['Rep vậy là green flag rồi, cho quán thêm cơ hội 💚','Chủ quán có tâm ghê, 10 điểm không có nhưng 🥹','Okela, thấy thành ý rồi, sửa sao lại cho quán nha 🌟','Thấy chủ quán thành tâm vậy thì cho quán cơ hội nữa nha 🫶','Oke, lần sau quay lại xem quán cải thiện sao 👀','Chủ quán dễ thương ghê, tha lỗi á 😆','Được, quán có tâm vậy thì mình sửa lại 4 sao nha ⭐'],
        mid:['Chủ quán cầu tiến ghê, sẽ ủng hộ tiếp 👍','Oke chờ quán lên level 📈'],
        good:['Chủ quán rep dễ thương xỉu, mãi iu 🫶','Slay luôn chủ ơi, cuối tuần kéo cả hội tới 🔥','Hihi chủ quán dễ thương quá, mãi keo 🥰','Iu quán 3000, cuối tuần rủ hội tới 🫶']},
  rude:['Ủa alo? Chủ quán nói chuyện kì dợ, red flag từ chủ tới sân luôn 🚩🚩','Chủ quán gắt ghê, tưởng đang coi drama TikTok 🍿 1 sao cho chừa nha','Nói vậy là toang rồi đó chủ ơi, unfollow liền 🫵','Khẩu nghiệp ghê, karma tới liền á 🤡 xin phép né quán','Thái độ vậy là ét o ét rồi, cả hội tui bye bye quán 👋','Chủ quán cà khịa khách luôn? Chê, chê thật sự 🙄','Ủa chủ quán ăn nói kiểu gì dợ? Thái độ vậy ai thèm tới 😤','Chửi khách luôn hả? Để tui share bài này cho cả xóm đọc 📢','Quán gì mà chủ nóng như lò vi sóng, 1 sao không hơn 🤬','Nói chuyện kiểu đó bảo sao sân vắng hoe, bye bye 👋','Trời đất, chủ quán cà khịa khách luôn, xin phép né 🚩'],
  plain:{bad:['Ờ, vậy thôi hả 😐','Trả lời cho có ghê 🙂','Rep lỏ ghê, hông thấy xin lỗi gì hết 😶'],mid:['Ừm oke 🙂'],good:['Hihi 😊','Oke chủ quán 👌']}
};
const PILE=['@hong.drama: Hóng drama quán này quá 🍿','@anhtu.99: Chủ quán gắt ghê, né né 😬','@mai.chill: Thôi đổi sân khác cho lành 🫣'];
const SUG={bad:['Dạ quán xin lỗi ạ, tụi mình sẽ khắc phục liền','Quán sẽ cố gắng cải thiện, cảm ơn bạn góp ý ạ'],mid:['Cảm ơn bạn, quán sẽ cải thiện thêm ạ'],good:['Cảm ơn bạn nhiều ạ, hẹn gặp lại trên sân!']};
const tierOf=r=>r.stars<=2?'bad':r.stars===3?'mid':'good';
function reviewHTML(r){
  const tier=tierOf(r);
  const tail=r.reply
    ?`<div class="reply"><b>Chủ quán:</b> ${esc(r.reply)}</div>${r.follow?`<div class="follow ${r.tone||''}"><b>${r.h}:</b> ${r.follow}</div>`:''}${r.pile?`<div class="pile">${r.pile}</div>`:''}${r.fined?`<div class="rv-eff bad">−${fmt(r.fined)} bồi thường vì chửi khách</div>`:''}${r.bonus?`<div class="rv-eff good">+${r.bonus.toFixed(2)}★ uy tín cho sao quán</div>`:''}`
    :`<div class="rbox"><textarea data-draft="${r.id}" maxlength="200" placeholder="Viết phản hồi cho ${r.h}...">${esc(drafts[r.id]||'')}</textarea>
      <div class="row">${SUG[tier].map(t=>`<button class="sug" data-fill="${r.id}" data-text="${esc(t)}">${esc(t.length>26?t.slice(0,24)+'…':t)}</button>`).join('')}<button class="send" data-send="${r.id}">Gửi</button></div></div>`;
  return `<div class="rv ${r.viral?'viral':''}">${r.viral?`<span class="viral-tag">🔥 Viral${r.platform?' trên '+r.platform:''}</span>`:''}<div class="face">${avatar(r.look,r.stars>=4?'happy':r.stars>=3?'meh':'angry')}</div><div><b>${r.h}</b><span class="st">${starStr(r.stars)}</span><p>${r.t}</p><small>❤️ ${r.likes} lượt thích, ngày ${r.day}</small>${tail}</div></div>`;
}
function replyReview(id,text){
  const r=S.reviews.find(x=>x.id===id); if(!r||r.reply)return false;
  text=(text||'').trim(); if(!text){toast('Viết gì đó rồi hãy gửi nha','bad');return false}
  const tier=tierOf(r), tone=judge(text), old=r.stars;
  r.reply=text.slice(0,200); r.tone=tone;
  if(tone==='rude'){
    r.follow=pick(FOLLOW.rude); r.stars=1; r.likes+=150+rand(500); r.pile=pick(PILE);
    const cash=Math.min(Math.max(0,S.money),RUDE_FINE); S.money-=cash; S.debt+=RUDE_FINE-cash; S.stats.replyFine=(S.stats.replyFine||0)+RUDE_FINE; r.fined=RUDE_FINE;
    toast('−'+fmt(RUDE_FINE)+' vì chửi khách','bad');
    ownerSay(`Ối, lỡ lời rồi... Drama lan khắp mạng, mất ${fmt(RUDE_FINE)} bồi thường!`);
  } else if(tone==='nice'){
    r.follow=pick(FOLLOW.nice[tier]); const n=hits(text,POS_WORDS,POS_ASCII);
    r.stars=Math.min(5,r.stars+(tier==='bad'&&n>=2?2:1));
    r.likes+=20+rand(120);
    const hb=S.hist[S.day]||(S.hist[S.day]={s:0,n:0,c:[0,0,0,0,0]}); const add=tier==='bad'?REPLY_BONUS*1.5:REPLY_BONUS;
    const room=Math.max(0,REPLY_BONUS_MAX-replyBonus()); const got=Math.min(add,room); hb.b=(hb.b||0)+got; r.bonus=got;
    if(got>0)setTimeout(()=>toast(`+${got.toFixed(2)}★ uy tín nhờ phản hồi tốt`,'star'),400);
    ownerSay(got>0?'Phản hồi khéo là khách thương liền, sao quán nhích lên!':'Phản hồi khéo lắm! (điểm cộng uy tín tuần này đã tối đa)');
  } else {
    r.follow=pick(FOLLOW.plain[tier]);
    ownerSay(tier==='bad'?'Hơi hời hợt, lần sau nhớ xin lỗi khách nha.':'Ok, cũng được.');
  }
  // khách sửa lại số sao -> tính lại trung bình sao của ngày họ viết review
  const d=r.stars-old;
  if(r.stars<=3)S.avgOn=true;
  S.rating=calcRating();
  if(d){const h=S.hist[r.day]||(S.hist[r.day]={s:0,n:0});
    if(h.n>0)h.s=Math.max(h.n,Math.min(5*h.n,h.s+d)); else {h.s=r.stars;h.n=1}  // review là 1 khách đã chấm trong ngày: chỉ đổi số sao của khách đó
    S.rating=calcRating();
    toast(`${r.h} sửa thành ${'★'.repeat(r.stars)}`,d<0?'bad':'star');}
  delete drafts[id]; save(); return true;
}
function rvEvents(root,rerender){
  root.addEventListener('input',e=>{const t=e.target.closest('[data-draft]');if(t)drafts[t.dataset.draft]=t.value});
  root.addEventListener('click',e=>{
    const f=e.target.closest('[data-fill]');
    if(f){drafts[f.dataset.fill]=f.dataset.text;const ta=root.querySelector(`[data-draft="${f.dataset.fill}"]`);if(ta){ta.value=f.dataset.text;ta.focus()}return}
    const sd=e.target.closest('[data-send]');
    if(sd){const ta=root.querySelector(`[data-draft="${sd.dataset.send}"]`);if(replyReview(sd.dataset.send,ta?ta.value:''))rerender()}
  });
}
function unreplied(){return S?S.reviews.filter(r=>!r.reply).length:0}
