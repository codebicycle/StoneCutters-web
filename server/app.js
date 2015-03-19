'use strict';

module.exports = function appUseConf(done) {
    var express = require('express');
    var rendr = require('rendr');
    var config = require('./config');
    var environment = config.get('environment', 'development');
    var DataAdapter = require('../shared/adapters/data');
    var dataAdapter = new DataAdapter({
        userAgent: 'Arwen/' + environment + ' (node.js ' + process.version + ')'
    });
    var middleware = require('./middleware')(dataAdapter);
    var server = rendr.createServer({
        dataAdapter: dataAdapter,
        errorHandler: require('./modules/errorHandler')(),
        apiPath: config.get(['smaug', 'protocol'], 'http') + '://' + config.get(['smaug', 'host'], 'api-v2.olx.com'),
        viewsPath: 'app/localized/common/app/views'
    });
    var Router = require('./router');
    var router = new Router(server);
    var http = require('http');
    var https = require('https');

    http.globalAgent = false;
    https.globalAgent = false;

    function expressConfiguration() {
        server.expressApp.disable('x-powered-by');
        server.expressApp.use(express.compress());
        server.expressApp.use(express.static(__dirname + '/../public'));
        server.expressApp.use(express.cookieParser());
    }

    function rendrConfiguration(rendrApp) {
        rendrApp.use(middleware.analytics());
        rendrApp.use(middleware.schibsted());
        rendrApp.use(middleware.localstorageiframe());
        rendrApp.use(middleware.manifest());
        rendrApp.use(middleware.robots());
        rendrApp.use(middleware.redirections());
        rendrApp.use(middleware.host());
        rendrApp.use(middleware.platform());
        rendrApp.use(middleware.session());
        rendrApp.use(middleware.com());
        rendrApp.use(middleware.device());
        rendrApp.use(middleware.environment());
        rendrApp.use(middleware.location());
        rendrApp.use(middleware.languages());
        rendrApp.use(middleware.closed());
        rendrApp.use(middleware.templates());
        rendrApp.use(middleware.internetOrg());
        rendrApp.use(middleware.securityPOST());
        rendrApp.use(middleware.securityGET());
        rendrApp.use(middleware.dependencies());
        rendrApp.use(middleware.sixpack());
    }

    server.expressApp.configure(expressConfiguration);
    server.configure(rendrConfiguration);
    router.route();
    done(server.expressApp);
};
