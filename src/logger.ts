import * as winston from 'winston';

class LoggerWrapper {
    private static logger: winston.Logger;

    static logConfig = {
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.splat(),
            winston.format.label({
                label: '💰',
            }),
            winston.format.printf(
                ({ timestamp, level, message, service, label }) => {
                    return `[${timestamp}] ${label}${service} ${level}: ${JSON.stringify(
                        message,
                        null,
                        4
                    )}`;
                }
            )
        ),
        defaultMeta: { service: 'e-shop' },
        transports: [
            new winston.transports.Console({ level: 'info' }),
            new winston.transports.File({
                level: 'error',
                filename: `${__dirname}/log/error.log`,
            }),
            new winston.transports.File({
                filename: `${__dirname}/log/combined.log`,
            }),
        ],
    };

    static get() {
        if (!this.logger) {
            this.logger = winston.createLogger(this.logConfig);
        }
        return this.logger;
    }
}
export const logger = LoggerWrapper.get();
