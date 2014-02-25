var fs = require('fs');
var path = require('path');

/**
 * This is a clever convenience for accessing our custom middleware functions.
 * In your app, you can just do something like:
 *
 *     var middleware = require('./server/middleware');
 *     app.use(middleware.myCoolMiddleware);
 *
 * Inspired by the way Express/Connect loads middleware.
 */
fs.readdirSync(__dirname).forEach(function(filename) {
    var name = path.basename(filename, '.js');
    if (name === 'index') {
        return;
    }
    exports.__defineGetter__(name, function load() {
        return require('./' + name);
    });
});
