const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');

const BOT_NAME = 'Cali Sky Store';
const WEBHOOK_URL = 'http://127.0.0.1:5678/webhook/cali-sky';
const AUTH_FOLDER = 'auth-cali';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: [BOT_NAME, 'Chrome', '1.0.0']
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\n==== ESCANEA EL QR PARA: ' + BOT_NAME + ' ====');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 5000);
            }
        }
    });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text.trim()) return;
        try {
            const response = await axios.post(WEBHOOK_URL, {
                sender: sender,
                name: msg.pushName || 'Sin nombre',
                message: text,
                bot: BOT_NAME
            });
            const reply = response.data?.reply || response.data?.message || null;
            if (reply) {
                await sock.sendMessage(sender, { text: String(reply) });
            }
        } catch (err) {
            console.error('Error enviando a n8n:', err.message);
        }
    });
}
startBot();
