const express = require('express');
const pino = require('pino');
const { trace, context, SpanStatusCode } = require('@opentelemetry/api');

const app = express();
const logger = pino();
app.use(express.json());

const tracer = trace.getTracer('notification-service');

function startSpan(spanName, callback) {
  const span = tracer.startSpan(spanName);
  return context.with(trace.setSpan(context.active(), span), () => {
    try {
      return callback(span);
    } finally {
      span.end();
    }
  });
}

app.post('/notifications', (req, res) => {
  startSpan('SEND_NOTIFICATION', (span) => {
    const { userId, type, message } = req.body;

    span.setAttributes({ userId, type, message });
    span.addEvent('Validation started');

    if (!userId || !type || !message) {
      span.addEvent('Validation failed: missing required fields');
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required fields in notification' });
      logger.warn('Missing required fields in notification');
      return res.status(400).json({ error: 'userId, type and message are required' });
    }

    span.addEvent('Notification send started');

    logger.info({ userId, type, message }, 'Simulated notification sent');

    span.addEvent('Notification send succeeded');
    span.setStatus({ code: SpanStatusCode.OK });
    res.status(200).json({ status: 'ok' });
  });
});

const PORT = 4002;
app.listen(PORT, () => {
  logger.info(`NotificationService running on port ${ PORT }`);
}); 