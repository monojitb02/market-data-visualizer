'use strict';
const _ = require('lodash');
const logger = require('../logger');
const ValidationError = require('../domain/validation');
/**
 * default error handler.
 */
module.exports = (err, req, res, next) => {
    const availableLogger = req.logger || logger;
    if ((err instanceof ValidationError || err.statusCode === 400) &&
        !_.isEmpty(err.errors)
    ) {
        availableLogger.warning(`Input Validation Error: ${JSON.stringify(err.errors)}`);
        res.status(400).json({ success: false, message: err.errors });
    } else {
        const is404 = err.statusCode === 404;
        if (!is404) {
            availableLogger.error(err.message, err);
        }
        res.status(err.statusCode || 500).json({
            success: false,
            message: is404 ? 'Not Found' : 'Internal Server Error'
        });
    }
    next();
};