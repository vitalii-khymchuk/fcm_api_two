const dgram = require('dgram');
const admin = require('firebase-admin');

require('dotenv').config();

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const udpServer = dgram.createSocket('udp4');

udpServer.on('message', async (msg, rinfo) => {
  const message = JSON.parse(msg.toString());
  console.log('Message received via UDP:', message);

  const {payload, token} = message;

  const fcmMessage = {
    token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
  };

  try {
    await admin.messaging().send(fcmMessage);
    console.log('Message sent to FCM');
  } catch (error) {
    console.error('FCM Error:', error);
  }
});

const {PORT = 5000} = process.env;
udpServer.bind(PORT, () => {
  console.log('Node.js Server №2 listening on UDP port ' + PORT);
});
