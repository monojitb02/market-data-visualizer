'use strict'
const util = require('util');
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({
            filename: `${__dirname}/../../logs/all-logs.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            timestamp: true
        }),
        new transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});

const X_OPERATION = 'X-Operation';

const getRequestLogContext = function (request) {
    const logContext = {};

    const operationJson = request.get(X_OPERATION);
    if (operationJson) {
        const operation = JSON.parse(operationJson);
        logContext.OperationId = operation.OperationId;
        logContext.OperationName = operation.OperationName;
    }
    return logContext;
}
const createLoggerWithUserContext = (request, context = {}) => {
    //  TODO: move logic from logger/request-log-context.js
    let logContext = getRequestLogContext(request);
    const handler = {
        get(target, propKey) {
            if (
                propKey === 'info' ||
                propKey === 'warn' ||
                propKey === 'error'
            ) {
                return (message, metaData) => {
                    if (metaData.stack && metaData.message) {
                        metaData = { Error: util.inspect(metaData) }
                    }
                    const meta = {
                        ...context, ...logContext, ...metaData,
                        time: new Date() // not required if logger has default time log
                    };
                    target[propKey](util.inspect(message), meta);
                }
            }
            return target[propKey];
        }
    }
    return new Proxy(logger, handler);
}

logger.createLoggerWithUserContext = createLoggerWithUserContext;
logger.flushAndExit = (code) => {
    logger.warn(`About to exit with code ${code}`);
    logger.on('finish', function () {
        process.exit(code)
    })
}
module.exports = logger;