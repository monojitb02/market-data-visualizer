'use strict';
const logger = require('../logger');

module.exports = (req, res, next) => {
    // Don't log system endpoint
    if (req.openapi.operation['x-anonymous']) {
        next()
        return
    }

    const startTime = new Date();
    const availableLogger = req.logger || logger;
    const logContext = {
        StartTime: startTime
    }
    availableLogger.info('Start Request', logContext)

    // Response.end is the last method called before putting the bytes on the wire
    const originalReqEnd = res.end
    res.end = (...args) => {
        const endTime = new Date();
        logContext.EndTime = endTime
        logContext.Duration = endTime - startTime
        logContext.StatusCode = res.statusCode
        availableLogger.info('End Request', logContext)
        originalReqEnd.apply(res, args)
    }
    next()
}
