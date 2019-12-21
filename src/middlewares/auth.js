'use strict';
const checkAuth = (apiKey) => apiKey === 'abc1234';
module.exports = (req, res, next) => {
    // Don't validate authorization system endpoint
    if (req.openapi.operation && req.openapi.operation['x-anonymous']) {
        next()
        return
    }
    if (!req.headers['x-api-key']) {
        res.status(401).send();
        return;
    }
    const isAuthorized = checkAuth(req.headers['x-api-key']);
    if (!isAuthorized) {
        res.status(401).send();
        return;
    }
    // if (!req.headers.authorization) {
    //     res.status(401).send();
    //     return;
    // }
    next();
}