import { createLogger, format, transports } from 'winston';
import { env } from 'node:process';
import packageInfo from '../../package.json';

export const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint({
      colorize: true,
      depth: 1
    }),
  ),

  defaultMeta: { service: packageInfo.name },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/info.log', level: 'info' }),
    new transports.File({ filename: 'logs/quick-start-combined.log' }),
  ],
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(logger.format),
    }),
  );
}