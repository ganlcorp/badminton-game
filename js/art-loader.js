// art-loader.js — Nạp các tranh SVG lớn (nền, chợ, màn hình mở đầu) từ assets/art rồi chèn thẳng vào trang,
// để CSS hoạt hình trong css/*.css vẫn điều khiển được các phần tử bên trong tranh.
async function loadArt(){
  const holders=[...document.querySelectorAll('[data-art]')];
  await Promise.all(holders.map(async el=>{
    try{
      const r=await fetch(el.dataset.art); if(!r.ok)throw new Error(r.status);
      el.outerHTML=await r.text();
    }catch(e){
      console.warn('Không nạp được tranh',el.dataset.art,e);
      el.remove();
    }
  }));
}
