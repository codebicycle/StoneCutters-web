'use strict';

module.exports = function appUseConf(done) {
    var config = require('./config');
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
    var memcached = require('./memcached')(express);

    function expressConfiguration() {
        app.use(express.favicon());
        app.use(express.compress());
        app.use(express.static(__dirname + '/../public'));
        app.use(express.cookieParser());
        app.use(express.session({
            store: memcached,
            secret: config.get(['session', 'secret'], '')
        }));
    }

    function rendrConfiguration(rendrApp) {
        rendrApp.use(middleware.session());
        rendrApp.use(middleware.environment());
        rendrApp.use(middleware.templates());
        rendrApp.use(middleware.categories());
        rendrApp.use(middleware.location());
        rendrApp.use(middleware.languages());
        if (config.get(['interstitial', 'enabled'], false)) {
            rendrApp.use(middleware.interstitial());
        }

        //rendrApp.use(middleware.abSelector());
        //rendrApp.use(middleware.experimentNotificator());
        //rendrApp.use(middleware.incrementCounter());
    }

    app.configure(expressConfiguration);
    server.configure(rendrConfiguration);
    app.use(server);
    require('./router')(app, dataAdapter);
    done(app);
};
