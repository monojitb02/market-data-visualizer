"use strict";

const application = require('./app');
const http = require('http');
const util = require('util');
const logger = require('./logger');

const port = +process.env.PORT || 3000;

process.setMaxListeners(0);

const startup = async () => {
    try {
        const app = await application.init();
        app.set('port', port);

        const server = http.createServer(app);
        server.listen(port);
        server.on('error', onError);
        server.on('listening', () => logger.info('Listening on ' + port));
    } catch (rejectReason) {
        let error = {};
        if (typeof rejectReason === 'object' && rejectReason.message) {
            error.message = util.format("Terminating app, startup due to: %s", rejectReason.message);
            error.stack = rejectReason.stack;
        } else {
            error = util.format("Terminating app, startup due to: %s", rejectReason);
        }

        logger.error(error);
        logger.flushAndExit(1);
    }
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(port + ' requires elevated privileges');
            break;
        case 'EADDRINUSE':
            logger.error(port + ' is already in use');
            break;
        default:
            throw error;
    }
}
// const shutDown = () => {
//     console.log("Caught interrupt signal");
//     logger.flushAndExit(1);
// }
// process.on('SIGTERM', shutDown);
// process.on('SIGINT', shutDown);
startup();