const express = require('express');
const pino = require('pino');

const app = express();
const logger = pino();
app.use(express.json());

app.post('/notifications', (req, res) => {
  const { userId, type, message } = req.body;
  if (!userId || !type || !message) {
    logger.warn('Missing required fields in notification');
    return res.status(400).json({ error: 'userId, type and message are required' });
  }
  logger.info({ userId, type, message }, 'Simulated notification sent');
  res.status(200).json({ status: 'ok' });
});

const PORT = 4002;
app.listen(PORT, () => {
  logger.info(`NotificationService running on port ${ PORT }`);
}); 