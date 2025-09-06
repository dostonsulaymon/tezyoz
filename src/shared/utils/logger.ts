import winston from 'winston';

// --- Helper to stringify safely ---
const safeStringify = (obj: any): string => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
};

// --- Env vars ---
const nodeEnv = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (nodeEnv === 'development' ? 'debug' : 'info');
const logPath = process.env.LOG_PATH || './logs';

// --- Base formats ---
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: () => new Date().toLocaleString() }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extra = Object.keys(meta).length ? safeStringify(meta) : '';
    return `${timestamp} [${level}] ${message} ${extra}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(), // structured JSON for logs in files
);

// --- Winston instance ---
const logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error', format: fileFormat }),
    new winston.transports.File({ filename: `${logPath}/combined.log`, format: fileFormat }),
  ],
});

// Add console logging only in development
if (nodeEnv === 'development') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

export default logger;
