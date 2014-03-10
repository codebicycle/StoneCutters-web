'use strict';

/**
 * envSetup middleware.
 * Here we call smaug in order to define which type of web we have to show.
 * Also set up the site location (domain)
 */
module.exports = function(dataAdapter) {

    return function loader() {

        return function environment(req, res, next) {
            var app = req.rendrApp;
            var host = req.headers.host;
            var path = req._parsedUrl.pathname;
            var url = req.originalUrl;
            var index = host.indexOf(':');
            var siteLocation = (index === -1) ? host : host.substring(0,index);
            var viewType;

            siteLocation = siteLocation.replace('m','www');

            /** If I detect that is not a m.olx.com like URL I will set up arg location
            This is only for testing in Rackspace, must be removed in the near future. */
            (function rackspaceWalkaround() {
                var pointIndex = siteLocation.indexOf('.');
                var firstWord = siteLocation.substring(0, pointIndex);
                siteLocation = (firstWord === 'www') ? siteLocation : 'www.olx.com.ar';
            })();

            req.headers.host = siteLocation;
            switch(path) {
                case '/':
                    viewType = 'home';
                break;
                case '/items':
                    viewType = 'listing';
                break;

                //emulate /items/* match
                case '/items/'+ path.slice('/items/'.length):
                    viewType = 'itemPage';
                break;
                default:
                    viewType = 'unknown';
                break;
            }

            var clientId = app.getSession('clientId');

            if(clientId == undefined){
                var c1 = Math.floor(Math.random()*11);
                var c2 = Math.floor(Math.random()*11);
                var n = Math.floor(Math.random()* 1000000);

                clientId = String.fromCharCode(c1)+n+String.fromCharCode(c2);
            }

            app.updateSession({
                siteLocation: siteLocation,
                path: path,
                referer: '',
                viewType: viewType,
                url: url,
                clientId: clientId
            });

            next();
        };

    };

};
