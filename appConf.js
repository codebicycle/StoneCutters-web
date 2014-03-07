'use strict';

module.exports = function appUseConf(done){
    var config = require('config');
    var express = require('express');
    var rendr = require('rendr');

    var SmaugAdapter = require('./server/data_adapter/smaug_adapter');
    var dataAdapter = new SmaugAdapter();
    var middleware = require('./server/middleware')(dataAdapter);
    var app = express();
    var server = rendr.createServer({
        dataAdapter: dataAdapter
    });

    function expressConfiguration() {
        app.use(express.compress());
        app.use(express.static(__dirname + '/public'));
        app.use(express.logger());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            store: null,
            secret: config.session.secret
        }));
    }

    function rendrConfiguration(rendrApp) {
        rendrApp.use(middleware.session());
        rendrApp.use(middleware.environment());
        rendrApp.use(middleware.templates());
        rendrApp.use(middleware.categories());
        rendrApp.use(middleware.location());
        rendrApp.use(middleware.language());
        //rendrApp.use(middleware.abSelector());
        //rendrApp.use(middleware.experimentNotificator());
        //rendrApp.use(middleware.incrementCounter());
    }

    app.configure(expressConfiguration);
    server.configure(rendrConfiguration);
    app.use(server);
    require('./server/router')(app, dataAdapter);
    done(app);
}
