const crypto = require("crypto");
const admin = require("firebase-admin");

async function setWebhook(req, res) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const publicBaseUrl = process.env.PUBLIC_BASE_URL;

    if (!botToken || !publicBaseUrl) {
      return res.status(500).json({
        message: "Missing TELEGRAM_BOT_TOKEN or PUBLIC_BASE_URL in .env"
      });
    }

    const webhookUrl = `${publicBaseUrl}/api/telegram/webhook`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function webhook(req, res) {
  try {
    const message = req.body?.message;
    if (!message) return res.sendStatus(200);

    const chatId = message.chat?.id;
    const text = message.text || "";

    if (!text.startsWith("/start")) {
      return res.sendStatus(200);
    }

    const parts = text.split(" ");
    if (parts.length < 2) {
      // User pressed start without token
      return res.sendStatus(200);
    }

    const userId = parts[1]; 

    //SAVE chatId to Firestore
    const db = admin.firestore();

    await db.collection("users").doc(String(userId)).set(
      {
        telegramChatId: chatId
      },
      { merge: true }
    );

    
    await sendTelegramReminder(chatId, "✅ Telegram connected! You will receive reminders here.");

    console.log("Saved telegramChatId", chatId, "for user", userId);

    return res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return res.sendStatus(200); // Always 200 so Telegram doesn't retry
  }
}

async function sendTelegramReminder(chatId, message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });
}

module.exports = {
  setWebhook,
  webhook,
  sendTelegramReminder
};
