'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var image = 'R0lGODlhAQABAPAAAP39/QAAACH5BAgAAAAALAAAAAABAAEAAAICRAEAOw==';

        return function middleware(req, res, next) {
            if (!/^\/analytics(\/.*)?$/.test(req.path)) {
                return next();
            }
            var gif = new Buffer(image, 'base64');
            
            res.set('Content-Type', 'image/gif');
            res.set('Content-Length', gif.length);
            res.end(gif);
        };
    };
};
