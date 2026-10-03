// api/save.js — Lưu tiến trình game dưới dạng MÃ NGẮN 6 ký tự trên Redis (Vercel Marketplace).
// Hỗ trợ cả 2 loại:
//  • Redis Cloud (tích hợp "Redis" trên Vercel): dùng chuỗi kết nối redis://...  -> biến REDIS_URL / STORAGE_URL / KV_URL
//  • Upstash Redis: dùng REST API                                                 -> biến KV_REST_API_URL + KV_REST_API_TOKEN
const crypto = require('crypto');

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TCP_URL = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL;

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // bỏ 0/O, 1/I/L để khỏi đọc nhầm
const TTL = 60 * 60 * 24 * 180;                   // mã hết hạn sau 180 ngày không dùng
const RATE_LIMIT = 30;                             // tối đa 30 lượt/phút mỗi IP

// ---- kết nối Redis (giữ lại giữa các lần gọi để đỡ tốn thời gian kết nối) ----
let tcpClient = null;
async function getTcp() {
  if (tcpClient && tcpClient.isReady) return tcpClient;
  const { createClient } = require('redis');
  tcpClient = createClient({ url: TCP_URL, socket: { connectTimeout: 5000, reconnectStrategy: false } });
  tcpClient.on('error', () => {});
  await tcpClient.connect();
  return tcpClient;
}
async function redis(...cmd) {
  const args = cmd.map(String);
  if (REST_URL && REST_TOKEN) {
    const r = await fetch(REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  }
  try {
    const c = await getTcp();
    return await c.sendCommand(args);
  } catch (e) { tcpClient = null; throw e; }
}

function randomCode(n = 6) {
  let s = '';
  for (const b of crypto.randomBytes(n)) s += ALPHABET[b % ALPHABET.length];
  return s;
}
const cleanCode = c => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
const validData = d => /^SC2[A-Za-z0-9_-]{8,600}$/.test(d);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!(REST_URL && REST_TOKEN) && !TCP_URL) return res.status(500).json({ error: 'Máy chủ chưa gắn cơ sở dữ liệu' });
  try {
    // chống spam đơn giản theo IP
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const hits = Number(await redis('INCR', `rl:${ip}`));
    if (hits === 1) await redis('EXPIRE', `rl:${ip}`, 60);
    if (hits > RATE_LIMIT) return res.status(429).json({ error: 'Thao tác nhanh quá, thử lại sau 1 phút nha' });

    // Lấy tiến trình: GET /api/save?code=K7F2QX
    if (req.method === 'GET') {
      const code = cleanCode(req.query.code);
      if (!/^[0-9A-Z]{6}$/.test(code)) return res.status(400).json({ error: 'Mã ngắn phải có đúng 6 ký tự' });
      const raw = await redis('GET', `save:${code}`);
      if (!raw) return res.status(404).json({ error: 'Không tìm thấy mã này (có thể gõ sai hoặc đã hết hạn)' });
      const o = JSON.parse(raw);
      await redis('EXPIRE', `save:${code}`, TTL); // có người dùng thì gia hạn thêm
      return res.status(200).json({ data: o.d, secret: o.s, t: o.t });
    }

    // Lưu tiến trình: POST /api/save  { data:"SC2...", code?, secret? }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const data = String(body.data || '');
      if (!validData(data)) return res.status(400).json({ error: 'Dữ liệu lưu game không hợp lệ' });
      let code = cleanCode(body.code), secret = String(body.secret || '');
      const now = Date.now();

      // đã có mã và đúng khoá bí mật -> cập nhật vào chính mã đó
      if (/^[0-9A-Z]{6}$/.test(code) && secret) {
        const raw = await redis('GET', `save:${code}`);
        if (raw && JSON.parse(raw).s === secret) {
          await redis('SET', `save:${code}`, JSON.stringify({ d: data, s: secret, t: now }), 'EX', TTL);
          return res.status(200).json({ code, secret, updated: true });
        }
      }
      // chưa có mã -> tạo mã mới, không ghi đè mã của người khác (NX)
      secret = crypto.randomBytes(12).toString('hex');
      for (let i = 0; i < 6; i++) {
        code = randomCode(6);
        const ok = await redis('SET', `save:${code}`, JSON.stringify({ d: data, s: secret, t: now }), 'NX', 'EX', TTL);
        if (ok === 'OK') return res.status(200).json({ code, secret, updated: false });
      }
      return res.status(500).json({ error: 'Không tạo được mã, thử lại nha' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Phương thức không hỗ trợ' });
  } catch (e) {
    console.error('save api error:', e && e.message);
    return res.status(500).json({ error: 'Máy chủ gặp lỗi, thử lại sau' });
  }
};
