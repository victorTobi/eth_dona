const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/sendTelegramMessage', async (req, res) => {
    const message = req.body.message;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        const data = await response.json();
        res.send(data);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
