// Cloudflare Worker – perantara selamat antara laman minit dan Claude API.
// Pembolehubah (Settings > Variables): ANTHROPIC_API_KEY (Secret), PASSCODE, ALLOWED_ORIGIN
const PROMPT = `Saya lampirkan gambar OPR (One Page Report) atau laporan program sekolah. Sila tulis ringkasan untuk dimasukkan ke dalam minit mesyuarat panitia, dalam Bahasa Melayu formal, bergaya "Pengerusi membentangkan / memaklumkan / menyatakan …".
Jawab dalam format tepat ini sahaja, tanpa simbol markdown dan tanpa ayat tambahan:
TAJUK: Laporan Program <nama program>
<4 hingga 7 baris, satu ayat setiap baris, merangkumi: tarikh dan tempat, objektif, aktiviti, penyertaan murid/guru, impak atau dapatan, dan cadangan penambahbaikan>
Jangan reka maklumat yang tiada dalam gambar. Jika sesuatu tidak jelas, tinggalkan.`;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    const out = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return out({ error: 'Kaedah tidak dibenarkan' }, 405);
    if (origin !== env.ALLOWED_ORIGIN) return out({ error: 'Laman tidak dibenarkan' }, 403);

    let body;
    try { body = await req.json(); } catch { return out({ error: 'Data tidak sah' }, 400); }
    if (!env.PASSCODE || body.passcode !== env.PASSCODE) return out({ error: 'Kod sekolah salah' }, 401);

    const images = (body.images || []).slice(0, 3);
    if (!images.length) return out({ error: 'Tiada gambar' }, 400);

    const content = [];
    for (const d of images) {
      const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(d);
      if (!m || m[2].length > 4_000_000) return out({ error: 'Gambar tidak sah atau terlalu besar' }, 400);
      content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
    }
    content.push({ type: 'text', text: PROMPT });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return out({ error: j.error?.message || 'AI gagal' }, 502);
    const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    return out({ text });
  },
};
