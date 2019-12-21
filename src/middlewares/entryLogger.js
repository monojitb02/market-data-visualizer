'use strict';
const logger = require('../logger');

module.exports = (req, res, next) => {
    // Don't log system endpoint
    if (req.openapi.operation && req.openapi.operation['x-anonymous']) {
        next()
        return
    }
    logger.info('Request received by service', {
        Url: req.originalUrl.toLowerCase(),
        ActivityId: req.get('x-request-id')
    });
    next();
}
