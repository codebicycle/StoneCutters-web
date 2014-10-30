'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var Seo = require('../modules/seo');
if (typeof window === 'undefined') {
    var statsdModule = '../../server/modules/statsd';
    var statsd = require(statsdModule)();
}

module.exports = (function() {

    var staticsHandler = {
        static: function(env, filePath, host) {
            var envPath = config.get(['environment', 'staticPath'], '');
            var pointIndex = filePath.lastIndexOf('.');
            var fileName = filePath.substr(0, pointIndex);
            var ext = filePath.substr(pointIndex + 1);
            var revision = '';
            var envName = '';

            if (env !== 'development') {
                revision = '-' + config.get(['deploy', 'revision'], '0');
            }
            if (ext === 'css' && env !== 'production') {
                envName = '-' + env;
            }
            envPath = getEnv(envPath, filePath, {
                env: env,
                type: 'static',
                host: host
            });
            return [envPath, fileName, envName, revision, '.', ext].join('');
        },
        image: function(env, filePath, host) {
            var envPath = config.get(['environment', 'staticPath'], '');

            envPath = getEnv(envPath, filePath, {
                env: env,
                type: 'static',
                host: host
            });
            return [envPath, filePath].join('');
        }
    };

    function getEnv(envPath, filePath, options) {
        switch (options.env) {
            case 'production':
                return envPath.replace(/\[\[basenumber\]\]/, ('0' + ((filePath.length % 4) + 1)));
            case 'staging':
            case 'testing':
                if (~options.host.indexOf(options.env)) {
                    return envPath.replace(options.type + '01', [options.type, '-', options.env].join(''));
                }
                break;
        }
        return envPath;
    }

    function getType(path) {
        var ext = path.substr(path.lastIndexOf('.') + 1);
        var defaults = ['css', 'js'];
        var accept = config.get('staticAccept', defaults);

        if (_.indexOf(accept, ext) >= 0) {
            return 'static';
        }

        defaults = ['jpg', 'jpeg', 'png', 'gif', 'ico'];
        accept = config.get('imageAccept', defaults);
        if (_.indexOf(accept, ext) >= 0) {
            return 'image';
        }
    }

    function statics(path, key, value) {
        var env = config.get(['environment', 'type'], 'development');
        var host = this.app.session.get('host');
        var type;

        if (key && value) {
            path = path.replace(key, value);
        }
        type = getType(path);
        if (!type) {
            return path;
        }
        return staticsHandler[type](env, path, host);
    }

    function slugToUrl(obj) {
        if (obj.slug) {
            return obj.slug.substr(obj.slug.lastIndexOf('/') + 1);
        }
        return ['des', (typeof obj.parentId !== 'undefined' ? '-cat-' : '-iid-'), obj.id].join('');
    }

    function redirect(url, parameters, options) {
        var siteLocation = this.app.session.get('siteLocation');

        options = (options || {});
        url = utils.link(url, this.app, options.query);
        if (parameters) {
            url = utils.params(url, parameters);
        }
        this.redirectTo(url, _.defaults(options, {
            status: 301
        }));
    }

    function error(err, res, status, callback) {
        var seo = Seo.instance(this.app);
        if (_.isFunction(status)) {
            callback = status;
            status = 404;
        }
        if (this.app.session.get('isServer')) {
            this.app.req.res.status(status);
            statsd.increment([this.app.session.get('location').name, 'errors', 400]);
        }
        seo.addMetatag('robots', 'noindex, nofollow');
        seo.addMetatag('googlebot', 'noindex, nofollow');
        return callback(null, 'pages/error', res || {});
    }

    return {
        slugToUrl: slugToUrl,
        link: utils.link,
        fullizeUrl: utils.fullizeUrl,
        params: utils.params,
        removeParams: utils.removeParams,
        redirect: redirect,
        error: error,
        'static': statics
    };
})();
