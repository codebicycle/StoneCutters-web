'use strict';

module.exports = function appUseConf(done) {
    var config = require('./config');
    var utils = require('./utils');
    var express = require('express');
    var rendr = require('rendr');

    var app = express();
    var DataAdapter = require('./adapter/data');
    var dataAdapter = new DataAdapter({
        userAgent: 'Arwen/' + app.get('env') + ' (node.js ' + process.version + ')'
    });
    var middleware = require('./middleware')(dataAdapter);
    var server = rendr.createServer({
        dataAdapter: dataAdapter,
        errorHandler: require('./errorHandler')(),
        apiPath: config.get(['smaug', 'protocol'], 'http') + '://' + config.get(['smaug', 'url'], 'api-v2.olx.com')
    });

    function expressConfiguration() {
        app.use(express.compress());
        app.use(express.static(__dirname + '/../public'));
        app.use(express.cookieParser());
    }

    function rendrConfiguration(rendrApp) {
        rendrApp.use(middleware.platform());
        rendrApp.use(utils.logMiddleware('platform'));
        rendrApp.use(middleware.session());
        rendrApp.use(utils.logMiddleware('session'));
        rendrApp.use(middleware.abSelector());
        rendrApp.use(utils.logMiddleware('abSelector'));
        rendrApp.use(middleware.environment());
        rendrApp.use(utils.logMiddleware('environment'));
        rendrApp.use(middleware.location());
        rendrApp.use(utils.logMiddleware('location'));
        rendrApp.use(middleware.redirections());
        rendrApp.use(utils.logMiddleware('redirections'));
        rendrApp.use(middleware.categories());
        rendrApp.use(utils.logMiddleware('categories'));
        rendrApp.use(middleware.languages());
        rendrApp.use(utils.logMiddleware('languages'));
        rendrApp.use(middleware.templates());
        rendrApp.use(utils.logMiddleware('templates'));
        rendrApp.use(middleware.bar());
        if (config.get(['interstitial', 'enabled'], false)) {
            rendrApp.use(middleware.interstitial());
        rendrApp.use(utils.logMiddleware('interstitial'));
        }

        //rendrApp.use(middleware.experimentNotificator());
        //rendrApp.use(middleware.incrementCounter());
    }

    app.configure(expressConfiguration);
    server.configure(rendrConfiguration);
    app.use(server);
    require('./router')(app, dataAdapter);
    done(app);
};
