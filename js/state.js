// state.js — Trạng thái game, lưu/tải localStorage
/* ---------- State ---------- */
let S=null, uid=0, cur=null, tray={}, speed=1, paused=true, last=performance.now(), tlT0=null, prepCart={};
const LOOSE_MARKUP=1.1, MAX_BUY=999;
function buyCost(id,u){const it=IT[id],packs=Math.floor(u/it.pack),rest=u-packs*it.pack;return packs*it.packCost+Math.round(rest*it.packCost/it.pack*LOOSE_MARKUP/100)*100}
const cartTotal=()=>Object.entries(prepCart).reduce((a,[id,u])=>a+buyCost(id,u),0);
let courtSay={}, sayTimer=null, lastMood='';

// Mỗi khách chấm 1–5★. Sao ngày = trung bình sao khách hôm đó (làm mượt nhẹ khi còn ít khách).
// Sao quán = trung bình sao ngày của 7 ngày gần nhất.
const PRIOR_N=3, PRIOR_STAR=5;
function dayAvg(h){return h?(h.s+PRIOR_STAR*PRIOR_N)/(h.n+PRIOR_N):PRIOR_STAR}
const REPLY_BONUS=0.03, REPLY_BONUS_MAX=0.3, RUDE_FINE=100000;
function replyBonus(){ // điểm cộng uy tín từ phản hồi tích cực, còn hiệu lực trong 7 ngày
  if(!S||!S.hist)return 0; let b=0;
  for(const d in S.hist)if(+d>S.day-7)b+=S.hist[d].b||0;
  return Math.min(REPLY_BONUS_MAX,b);
}
