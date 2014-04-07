'use strict';

module.exports = function appUseConf(done) {
    var config = require('./config');
    var express = require('express');
    var rendr = require('rendr');

    var app = express();
    var SmaugAdapter = require('./server/data_adapter/smaug_adapter');
    var dataAdapter = new SmaugAdapter({
        userAgent: 'Arwen/' + app.get('env') + ' (node.js ' + process.version + ')'
    });
    var middleware = require('./server/middleware')(dataAdapter);
    var server = rendr.createServer({
        dataAdapter: dataAdapter
    });
    var memcached = require('./memcached')(express);

    function expressConfiguration() {
        app.use(express.favicon());
        app.use(express.compress());
        app.use(express.static(__dirname + '/public'));
        app.use(express.urlencoded());
        app.use(express.json());
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

        //rendrApp.use(middleware.abSelector());
        //rendrApp.use(middleware.experimentNotificator());
        //rendrApp.use(middleware.incrementCounter());
    }

    app.configure(expressConfiguration);
    server.configure(rendrConfiguration);
    app.use(server);
    require('./server/router')(app, dataAdapter);
    done(app);
};
