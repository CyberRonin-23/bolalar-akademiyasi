export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  const BOT_TOKEN = process.env.BA_BOT_TOKEN;
  const update = req.body;

  if (!update || !update.callback_query) return res.status(200).json({ ok: true });
  if (!BOT_TOKEN) return res.status(200).json({ ok: true });

  const { id, from, message, data } = update.callback_query;

  if (data === 'contacted') {
    const now = new Date().toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const username = from.username
      ? `@${from.username}`
      : `${from.first_name}${from.last_name ? ' ' + from.last_name : ''}`;

    const updatedText = message.text.replace(
      "🔴 Holat: Ko'rib chiqilmagan",
      `🟢 Holat: Ko'rib chiqildi\n✅ Bog'landi: ${username}\n🕐 Vaqt: ${now}`
    );

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: updatedText,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [] },
      }),
    });

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, text: "✅ Belgilandi!" }),
    });
  }

  return res.status(200).json({ ok: true });
}
