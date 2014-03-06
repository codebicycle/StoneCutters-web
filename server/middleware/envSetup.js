'use strict';

/**
 * envSetup middleware.
 * Here we call smaug in order to define which type of web we have to show.
 * Also set up the site location (domain)
 */
module.exports = function(dataAdapter) {

    return function envSetupLoader() {

        function urlVarsSetup(req) {
            var host = req.headers.host;
            var path = req._parsedUrl.pathname;
            var url = req.originalUrl;

            var index = host.indexOf(':');
            var siteLoc = (index === -1) ? host : host.substring(0,index);
            siteLoc = siteLoc.replace('m','www');

            /** If I detect that is not a m.olx.com like URL I will set up arg location
            This is only for testing in Rackspace, must be removed in the near future. */
            var pointIndex = siteLoc.indexOf('.');
            var firstWord = siteLoc.substring(0,pointIndex);
            siteLoc = (firstWord === 'www') ? siteLoc : 'www.olx.com.ar';
            req.headers.host = siteLoc;
            console.log('<DEBUG CONSOLE LOG> SITELOC-'+siteLoc);

            console.log('<DEBUG CONSOLE LOG> Extracting location ID from host header: ' + siteLoc);
            var viewType = 'unknown';

            switch(path) {
                case '/':
                    viewType = 'home';
                break;
                    case '/items': viewType = 'listing';
                break;

                //emulate /items/* match
                case '/items/'+ path.slice('/items/'.length):
                    viewType = 'itemPage';
                break;
                default:
                    viewType = 'unknown';
                break;
            }

            global.siteLocation = siteLoc;
            global.path = path;
            global.url = url;
            global.viewType = viewType;
        };

        return function envSetup(req, res, next) {
            urlVarsSetup(req);

            var userAgent = req.get('user-agent');
            var api = {
                body: {},
                url: '/devices/' + encodeURIComponent(userAgent)
            };

            console.log('<DEBUG CONSOLE LOG> Hitting SMAUG to know the platform');
            dataAdapter.promiseRequest(req, api, function callback(body) {
                var device = body;
                var template = 'basic';
                var platform = 'wap';

                if (device.isBrowser) {
                    platform = 'desktop';
                }
                else {
                    platform = device.web_platform;
                }
                switch(platform) {
                    case 'desktop':
                        template = 'desktop';
                    break;
                    case 'html5':
                        template = 'enhanced';
                    break;
                    case 'html4':
                        template = 'standard';
                    break;
                    case 'wap':
                        template = 'basic';
                    break;
                    default:
                        template = 'basic';
                    break;
                }
                req.platform = platform;
                global.platform = platform;
                req.template = template;
                global.template = template;
                next();
            }, function onError(error) {
                console.log('Got error: ' + error.err);
            });
        };

    };

};
