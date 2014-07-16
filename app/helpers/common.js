'use strict';

var _ = require('underscore');
var config = require('../config');
var seo = require('../seo');
var utils = require('../../shared/utils');

module.exports = (function() {

    var staticsHandler = {
        static: function(env, filePath, path) {
            var baseNumber = '0' + ((filePath.length % 4) + 1);

            if (env !== 'development') {
                var pointIndex = filePath.lastIndexOf('.');
                var ext = filePath.substr(pointIndex + 1);
                var fileName = filePath.substr(0, pointIndex);
                var revision = config.get(['deploy', 'revision'], '0');

                filePath = (fileName + '-' + revision + '.' + ext);
                if (ext === 'css') {
                    filePath = (fileName + '-' + env + '-' + revision + '.' + ext);
                }
            }
            var envPath = config.get(['environment', 'staticPath'], '');

            if (env === 'production') {
                return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
            }
            return envPath + filePath;
        },
        image: function(env, filePath) {
            var envPath = config.get(['environment', 'imagePath'], '');

            if (env === 'production') {
                var baseNumber = '0' + ((filePath.length % 4) + 1);
                return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
            }
            return envPath + filePath;
        }
    };

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
        var type;

        if (key && value) {
            path = path.replace(key, value);
        }
        type = getType(path);
        if (!type) {
            return path;
        }
        return staticsHandler[type](env, path);
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
        if (_.isFunction(status)) {
            callback = status;
            status = 404;
        }
        if (typeof window === 'undefined') {
            this.app.req.res.status(status);
        }
        res = (res || {});
        seo.addMetatag('robots', 'noindex, nofollow');
        seo.addMetatag('googlebot', 'noindex, nofollow');
        seo.update();
        return callback(null, 'pages/error', res);
    }

    function daysDiff(date) {
        var now = new Date();
        var diff = now.getTime() - date.getTime();
        
        return Math.abs(Math.round(diff / (24 * 60 * 60 * 1000)));
    }

    return {
        slugToUrl: slugToUrl,
        link: utils.link,
        fullizeUrl: utils.fullizeUrl,
        params: utils.params,
        removeParams: utils.removeParams,
        redirect: redirect,
        error: error,
        daysDiff: daysDiff,
        'static': statics
    };
})();
