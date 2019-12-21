'use strict';
const yaml = require('yaml');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const express = require('express');
const createMiddleware = require('swagger-express-middleware');
const mongoose = require('mongoose');
const config = require('./config');
const controllersDir = './controllers';
const middlewaresDir = './middlewares';
// const config = require('./config');
// const config = { webApiServiceUrl: 'localhost:8001' };
const app = express();
class App {
    async init() {
        app.enable('trust proxy');
        app.disable('x-powered-by');
        // await config.init();
        const swaggerYaml = await fs.readFile(`${__dirname}/swagger.yaml`, 'utf8');
        const swagger = yaml.parse(swaggerYaml);
        this.apiBasePath = swagger.servers[0].url;
        const docUiPath = `${this.apiBasePath}/doc`;
        const docJsonPath = `${this.apiBasePath}/doc/swagger.json`;

        const [
            controllers,
            middlewares
        ] = await Promise.all([
            this.loadDir(controllersDir),
            this.loadDir(middlewaresDir)
        ])
        this.controllers = controllers;
        this.middlewares = middlewares;

        app.get(`${this.apiBasePath}/`, (req, res) => res.redirect(docUiPath));
        app.get(docJsonPath, (req, res) => res.status(200).json(swagger));

        app.use(docUiPath, express.static(path.join(__dirname, '../static')));
        app.use('/', express.static(path.join(__dirname, '../ui')));
        await Promise.all([
            this.initSwagger(swagger),
            this.connectToDB(config.dalConfig)
        ]);
        this.registerRoutes(swagger);
        // this needs to registered at the end
        app.use(this.middlewares.errorHandler);
        return app;
    }
    async loadDir(dirName) {
        const fittings = {}
        const files = await fs.readdir(path.join(__dirname, dirName));
        files.forEach(file => {
            const fileName = file.split('.')[0];
            fittings[fileName] = require(`${dirName}/${fileName}`);
        });
        return fittings;
    }
    getWrappedController(controllerName, handlerName) {
        const controllerGroup = this.controllers[controllerName];
        const controller = controllerGroup[handlerName]
        //TODO: handle not found handler
        return async (req, res, next) => {
            try {
                await controller(req, res);
            } catch (e) {
                next(e);
            }
        }
    }
    async initSwagger(swaggerOpt) {
        const swaggerCreate = promisify(createMiddleware);
        const {
            auth, logSetter, requestLogger,
            entryLogger,
            activityTracker
        } = this.middlewares;
        const {
            CORS, metadata, files,
            parseRequest, validateRequest
        } = await swaggerCreate(swaggerOpt, app);

        //Hot fix for the bug in "swagger-express-middleware": "^3.0.0-alpha.5"
        //----------------- Start ----------------------//
        const [
            invalidOpenApiDefinition,
            validateParams,
            validateRequestBody,
            validateSecurity, // eslint-disable-line no-alert, no-unused-vars
            validatePath,
            validateOperation,
            validateAccept,
            validateContentLength,
            validateRequestSize,
            validateContentType
        ] = validateRequest();
        const nextWrap = (cb) => {
            return (req, res, next) => {
                cb(req, res, next);
                next();
            }
        }
        const validateParams_fix = nextWrap(validateParams);
        const validateRequestBody_fix = nextWrap(validateRequestBody);
        const validateContentLength_fix = nextWrap(validateContentLength);
        const validateRequest_fix = [
            invalidOpenApiDefinition,
            validateParams_fix,
            validateRequestBody_fix,
            // validateSecurity,
            validatePath,
            validateOperation,
            validateAccept,
            validateContentLength_fix,
            validateRequestSize,
            validateContentType
        ];
        //----------------- end ----------------------//

        app.use(
            metadata(),
            entryLogger,
            CORS(),
            auth, activityTracker,
            parseRequest(), files(),
            ...validateRequest_fix, // validateRequest(),
            logSetter, requestLogger
        );
    }
    registerRoutes({ paths }) {
        const operationTypes = ['get', 'post', 'put', 'delete'];
        _.map(paths, (operations, path) => {
            const controllerName = operations['x-swagger-router-controller'];
            operationTypes.forEach(operationType => {
                if (!operations[operationType]) {
                    return;
                }
                const { operationId } = operations[operationType];
                const wrappedController = this.getWrappedController(controllerName, operationId);
                app[operationType](`${this.apiBasePath}${path}`, wrappedController);
            });
        });
    }
    async connectToDB({ user, password, url, isSrv = false }) {
        const prefix = isSrv ? 'mongodb+srv' : 'mongodb';
        const connectionUri = `${prefix}://${user}:${password}@${url}`;
        console.log(connectionUri);
        await mongoose.connect(connectionUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
}
module.exports = new App();