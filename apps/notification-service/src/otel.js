const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { resourceFromAttributes } = require('@opentelemetry/resources');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
});
const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs',
});
const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

const appVersion = process.env.OTEL_APP_VERSION || require('../package.json').version;
const environment = process.env.OTEL_ENV || process.env.NODE_ENV || 'development';

const resource = resourceFromAttributes({
  'service.name': process.env.OTEL_SERVICE_NAME || 'notification-service',
  'service.version': appVersion,
  'service.environment': environment,
});

const sdk = new NodeSDK({
  traceExporter,
  logRecordProcessors: [logRecordProcessor],
  instrumentations: [getNodeAutoInstrumentations()],
  resource,
});

sdk.start()

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry finished successfully'))
    .catch((error) => console.log('Error finishing OpenTelemetry', error))
    .finally(() => process.exit(0));
}); 