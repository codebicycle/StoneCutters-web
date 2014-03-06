'use strict';

module.exports = function appUseConf(done){
  var express = require('express');
  var rendr = require('rendr');

  var abSelector = require('./server/middleware/abSelector');
  var envSetup = require('./server/middleware/envSetup');

  var config = require('config');

  var smaugAdapter = require('./server/data_adapter/smaug_adapter');
  var smaugAd = new smaugAdapter();

  var mw = require('./server/middleware')(smaugAd);
  var app = express();

  app.use(express.compress());
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
  app.use(express.bodyParser());

  app.use(mw.envSetup());
  app.use(mw.abSelector());
  app.use(mw.experimentNotificator());

  app.use(express.cookieParser());
  app.use(express.session({
      secret: config.session.secret,

      /**
       * In production apps, you should probably use something like Redis or Memcached
       * to store sessions. Look at the `connect-redis` or `connect-memcached` modules.
       */
      store: null
  }));

  /**
   * In this simple example, the DataAdapter config, which specifies host, port, etc. of the API
   * to hit, is written inline. In a real world example, you would probably move this out to a
   * config file. Also, if you want more control over the fetching of data, you can pass your own
   * `dataAdapter` object to the call to `rendr.createServer()`.
   */
  var dataAdapterConfig = config.api;
  var server = rendr.createServer({
      dataAdapter: smaugAd
  });

  /**
    * To mount Rendr, which owns its own Express instance for better encapsulation,
    * simply add `server` as a middleware onto your Express app.
    * This will add all of the routes defined in your `app/routes.js`.
    * If you want to mount your Rendr app onto a path, you can do something like:
    *
    *     app.use('/my_cool_app', server);
    */
  app.use(server);

  require('./server/router')(app, smaugAd);

  server.configure(function(rendrExpressApp) {

      /**
       * Allow the Rendr app to access session data on client and server.
       * Check out the source in the file `./server/middleware/initSession.js`.
       */
      rendrExpressApp.use(mw.initSession());
      rendrExpressApp.use(mw.incrementCounter());
      rendrExpressApp.use(mw.fetchBaseData());
      rendrExpressApp.use(mw.languageSelector());
  });

  done(app);
}
