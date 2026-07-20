export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, age, phone, lang } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Missing required fields' });

  const BOT_TOKEN = process.env.BA_BOT_TOKEN;
  const CHAT_ID = process.env.BA_CHAT_ID;

  const now = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const text = [
    '🎓 *Yangi ariza — Bolalar Akademiyasi*',
    '',
    `👤 *Ota-ona:* ${name}`,
    `🧒 *Farzand yoshi:* ${age || '—'}`,
    `📞 *Telefon:* ${phone}`,
    `🌐 *Til:* ${lang || '—'}`,
    '',
    `🕐 *Qabul qilindi:* ${now}`,
    '',
    '🔴 *Holat:* Ko\'rib chiqilmagan',
  ].join('\n');

  const reply_markup = {
    inline_keyboard: [[
      { text: '✅ Bog\'lanildi', callback_data: 'contacted' },
    ]],
  };

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('BA_BOT_TOKEN / BA_CHAT_ID environment variables are not configured.');
    return res.status(500).json({ error: 'Lead notification is not configured yet.' });
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown', reply_markup }),
    });
    const data = await r.json();
    if (data.ok) return res.status(200).json({ success: true });
    return res.status(500).json({ error: data.description });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
