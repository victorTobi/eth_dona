const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message } = req.body;
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        const data = {
            chat_id: telegramChatId,
            text: message
        };

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.ok) {
                res.status(200).send('Message sent successfully');
            } else {
                console.error('Failed to send message:', response.data);
                res.status(500).send('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending Telegram message:', error);
            res.status(500).send('Error sending message');
        }
    } else {
        res.status(405).send('Method not allowed');
    }
}
