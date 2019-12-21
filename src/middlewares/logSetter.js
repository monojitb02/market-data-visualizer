'use strict';
const logger = require('../logger');
/**
 * Sets a logger object with user context on the request.
 */
module.exports = (req, res, next) => {
    req.logger = logger.createLoggerWithUserContext(req, {
        Url: req.url,
        Method: req.method,
        ActivityId: req.get('x-request-id'),
        TraceLevel: req.get('x-trace'),
        TransactionId: req.transactionId
    });

    next();
}
