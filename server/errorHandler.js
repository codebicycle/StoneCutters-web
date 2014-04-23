var config = require('./config');

var env = process.env.NODE_ENV || 'development';

exports = module.exports = function errorHandler() {
    return function errorHandler(err, req, res, next) {
        var accept = req.headers.accept || '';

        if (err.status) {
            res.statusCode = err.status;
        }
        if (res.statusCode < 400) {
            res.statusCode = 500;
        }
        if (env === 'development') {
            console.error(err.stack);
        }
        if (~accept.indexOf('html')) {
            if (config.get(['error', 'detail'], true)) {
                req.rendrApp.updateSession({
                    error: {
                        statusCode: res.statusCode,
                        message: err.message,
                        detail: err.stack
                    }
                });
            }
            res.redirect('/500');
        } 
        else if (~accept.indexOf('json')) {
            var error = { message: err.message };
            if (config.get(['error', 'detail'], true)) {
                error.stack = err.stack;
            }
            for (var prop in err) {
                error[prop] = err[prop];
            }
            var json = JSON.stringify({ error: error });

            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        } 
        else {
            res.setHeader('Content-Type', 'text/plain');
            res.end(config.get(['error', 'detail'], true) ? err.stack : err.toString());
        }
    };
};
