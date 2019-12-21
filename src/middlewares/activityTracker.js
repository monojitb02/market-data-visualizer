'use strict';
const uuid = require('uuid/v4');
/**
 * Assign Activity and trace-level
 */
module.exports = (req, res, next) => {
    let activityId = req.get('x-request-id')
    if (!activityId) {
        activityId = uuid();
        req.headers['x-request-id'] = activityId
    }

    const traceLevel = req.get('x-trace')
    if (!traceLevel) {
        req.headers['x-trace'] = (0).toString()
    }

    next()
}
