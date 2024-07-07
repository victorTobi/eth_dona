export function sendTelegramMessage(message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    }).catch(error => console.error('Error sending Telegram message:', error));
}

export function updateStatus(message) {
    document.getElementById('status').innerText = message;
}
