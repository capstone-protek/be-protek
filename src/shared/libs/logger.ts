import pino, { LoggerOptions } from 'pino';
import { env } from '../config/env.config';

const options: LoggerOptions = {
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
};

if (env.NODE_ENV === 'development') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(options);

export default logger;
