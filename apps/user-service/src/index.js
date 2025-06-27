const express = require('express');
const pino = require('pino');
const axios = require('axios');

const app = express();
const logger = pino();
app.use(express.json());

const users = [];

app.post('/users', async (req, res) => {
  const { name, document } = req.body;
  if (!name || !document) {
    logger.warn('Missing required fields');
    return res.status(400).json({ error: 'name and document are required' });
  }
  const id = users.length + 1;
  const user = { id, name, document };
  users.push(user);
  logger.info({ user }, 'User created');

  try {
    await axios.post('http://localhost:4002/notifications', {
      userId: user.id,
      type: 'welcome',
      message: `Welcome, ${ user.name }!`
    });
    logger.info('Welcome notification sent');
  } catch (err) {
    logger.error({ err }, 'Failed to send notification');
  }

  res.status(201).json(user);
});

const PORT = 4001;
app.listen(PORT, () => {
  logger.info(`User Service running on port ${ PORT }`);
}); 