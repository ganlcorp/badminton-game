// config.js — Hằng số, danh sách món, tên khách, tiện ích chung
const MAX_COURTS=10, COURT_COST=50000000, INTEREST=0.001, STAR_FINE=10000000, START_CASH=2000000;
let COURTS=10;
const SELLER_WAGE=170000, SELLER_ERR_MIN=0.04, SELLER_ERR_MAX=0.07, SELL_MIN=10;
const BOOKER_WAGE=160000, BOOKER_ERR_MIN=0.03, BOOKER_ERR_MAX=0.07, BOOK_MIN=5;
const BOOKER_LOOK={skin:'#fbd9bd',hair:'#2b1a12',style:'long',shirt:'#3a86ff',glasses:true}, BOOKER_NAME='Chị Hoa';
const SELLER_LOOK={skin:'#fbd9bd',hair:'#4a2c1a',style:'bun',shirt:'#ff7ab6',cap:'#ff5a7a'}, MAX_SELLER=3;
const SELLER_LOOKS=[SELLER_LOOK,{skin:'#f1c19b',hair:'#1b1b1b',style:'short',shirt:'#ff7ab6'},{skin:'#d9a07a',hair:'#7a4a26',style:'long',shirt:'#ff7ab6',glasses:true}];
const SELLER_NAMES=['Bé Na','Bạn Khôi','Bạn Thư'];
const jobsOf=()=>S.sellJobs||(S.sellJobs=[]);
const GUARD_WAGE=150000, GUARD_CATCH=0.85, DASH_RATE=0.06;
const OPEN=360, CLOSE=1320, PEAK=1020, W=28, CLEAN_MIN=12, STAFF_MIN=15, RUSH=1.3, WAGE=180000, MAX_STAFF=3;
const STAFF_LOOKS=[{skin:'#f1c19b',hair:'#1b1b1b',style:'spiky',shirt:'#63e6be',band:'#ffd23f'},{skin:'#fbd9bd',hair:'#7a4a26',style:'bun',shirt:'#63e6be'},{skin:'#d9a07a',hair:'#2b1a12',style:'short',shirt:'#63e6be',glasses:true}];
const RATE_DAY=70000, RATE_PEAK=100000;
const ITEMS=[
  {id:'tra',   name:'Trà đá',        e:'🧊', price:5000,  pack:40, packCost:40000},
  {id:'suoi',  name:'Nước suối',     e:'💧', price:10000, pack:24, packCost:120000},
  {id:'dg',    name:'Nước điện giải',e:'🥤', price:15000, pack:24, packCost:216000},
  {id:'tl',    name:'Nước tăng lực', e:'⚡', price:15000, pack:24, packCost:216000},
  {id:'cf',    name:'Cà phê sữa',    e:'☕', price:20000, pack:20, packCost:160000},
  {id:'cau',   name:'Quả cầu',       e:'🏸', price:25000, pack:12, packCost:180000},
  {id:'banhmi',name:'Bánh mì',       e:'🥖', price:20000, pack:10, packCost:120000, perish:true},
  {id:'xoi',   name:'Xôi',           e:'🍙', price:15000, pack:10, packCost:80000,  perish:true},
  {id:'chuoi', name:'Chuối',         e:'🍌', price:5000,  pack:10, packCost:25000,  perish:true},
  {id:'mi',    name:'Mì ly',         e:'🍜', price:15000, pack:12, packCost:96000},
];
const IT=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const START_ITEMS=['tra','suoi','dg','cau','banhmi'];
const UNLOCK={tl:{cost:150000,t:'Nhập thêm nước tăng lực',d:'Thêm một loại nước cho dân đánh đêm'},
  chuoi:{cost:100000,t:'Mối chuối chợ',d:'Chuối rẻ, ăn nhanh lấy sức'},
  mi:{cost:250000,t:'Ấm siêu tốc',d:'Bán mì ly, phải chế nước sôi chờ chín'},
  xoi:{cost:300000,t:'Nồi hấp xôi',d:'Bán xôi nóng buổi sáng'},
  cf:{cost:600000,t:'Máy pha cà phê',d:'Bán cà phê sữa, phải chờ máy pha'}};
const UPG={cam:{e:'📹',cost:400000,t:'Camera an ninh',d:'Khách hết dám bùng tiền sân (6% → 1%). Thuê thêm bảo vệ ở tab Nhân viên để bắt quả tang.'},
  broom:{e:'🧹',cost:200000,t:'Chổi xịn',d:'Chủ quán quét sân nhanh hơn (12 → 8 phút)'},
  vac:{e:'🌀',cost:450000,t:'Máy hút bụi',d:'Nhân viên dọn nhanh hơn (15 → 10 phút)'},
  bench:{e:'🪑',cost:300000,t:'Ghế chờ có mái che',d:'Khách đặt sân chịu chờ lâu hơn 25%'},
  fan:{e:'🌬️',cost:300000,t:'Quạt hơi nước ở quầy',d:'Khách gọi đồ chịu chờ lâu hơn 25%'},
  led:{e:'💡',cost:500000,t:'Đèn LED sân',d:'Buổi tối (từ 17h) đông khách hơn 25%'},
  sign:{e:'🪧',cost:350000,t:'Bảng hiệu mới',d:'Cả ngày khách ghé nhiều hơn 10%'}};
const GAME_SPEED=2.5; // 1x: 2 giây thật = 5 phút trong game
const PREP_T={tra:{ms:700,v:'Đang rót trà'}};
// Món làm nhiều bước ở bàn pha: bấm đúng thứ tự, bước cuối chờ một lúc rồi món tự vào khay
const FLOW={
  mi:{steps:[['bowl','🥣','Lấy tô'],['noodle','🍜','Bỏ mì'],['water','♨️','Châm nước']],ms:2000,busy:'Đang châm nước sôi',
      look:['Bàn trống','🥣','🥣🍜','♨️'],need:['Lấy tô trước đã!','Bỏ mì vào tô đi!','Châm nước sôi vào!']},
  cf:{steps:[['cup','🥛','Lấy ly'],['brew','⚙️','Pha cà phê']],ms:2000,busy:'Máy đang pha cà phê',
      look:['Chưa có ly','🥛','☕'],need:['Lấy ly trước đã!','Đặt ly vào máy rồi bấm pha!']}};
const FOOD=['banhmi','xoi','chuoi','mi'];
const priceOf=id=>(S&&S.prices&&S.prices[id])||IT[id].price;
const pf=id=>priceOf(id)/IT[id].price;
const courtF=()=>((S.courtRate.day/RATE_DAY)+(S.courtRate.peak/RATE_PEAK))/2;
const has=k=>!!(S&&S.upg&&S.upg[k]);
const ownerClean=()=>has('broom')?8:12, staffClean=()=>Math.round((has('vac')?10:15)*(S&&S.morale?0.9:1));
const unitCost=id=>IT[id].packCost/IT[id].pack;
const NAMES=['Anh Tuấn','Chị Hà','Anh Minh','Chị Thảo','Anh Khoa','Chị Vy','Anh Dũng','Cô Hạnh','Chú Bảy','Nhóm văn phòng','Hội cầu lông Q3','Anh Phát','Chị Ngọc','Bạn Long','Anh Hiếu','Chị My','Nhóm sinh viên','Anh Quân','Chị Trâm','Chú Tư','Bạn Nhi','Cô Lan'];
const SKINS=['#fbd9bd','#f1c19b','#d9a07a','#a86f4c'];
const HAIRS=['#2b1a12','#4a2c1a','#1b1b1b','#7a4a26','#c7862f'];
const SHIRTS=['#ff5d5d','#3a86ff','#ffbe0b','#8338ec','#06d6a0','#ff7ab6','#fb5607','#00b4d8'];
const BANDS=['#ff5d5d','#3a86ff','#ffd23f','#06d6a0'];
const CHATTER=['Đẹp quá!','Out rồi, out rồi!','Smash nè!','Nhặt cầu giùm!','Mệt ghê...','Hiệp nữa không?','Cầu bay xa ghê','Ghi điểm!','Ai giao đây?'];

const $=s=>document.querySelector(s);
const rand=n=>Math.floor(Math.random()*n), pick=a=>a[rand(a.length)];
const clamp=v=>Math.max(1,Math.min(5,v));
const fmt=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const durTxt=d=>d===60?'1 tiếng':d===90?'1 tiếng rưỡi':d===120?'2 tiếng':(d/60)+' tiếng';
const starStr=n=>'★'.repeat(n)+'☆'.repeat(5-n);
function me(n){return /^Anh/.test(n)?'anh':/^Chị/.test(n)?'chị':/^Chú/.test(n)?'chú':/^Cô/.test(n)?'cô':/^Bạn/.test(n)?'mình':'tụi mình'}
function you(n){const m=me(n);return m==='mình'?'bạn':m==='tụi mình'?'mọi người':m}
