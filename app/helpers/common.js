'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
if (typeof window === 'undefined') {
    var statsdModule = '../../server/modules/statsd';
    var statsd = require(statsdModule)();
}

module.exports = (function() {
    var env = config.get(['environment', 'type'], 'development');

    var linkIgParsers = (function() {
        var regexpFindPage = /-p-[0-9]+/;
        var regexpReplacePage = /(-p-[0-9]+)/;
        var regexpFindFilters = /\/-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*.*/;
        var regexpReplaceFilters = /(\/-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*.*)/;
        var regexpFindCategory = /[a-zA-Z0-9-]+-cat-[0-9]+/;
        var regexpReplaceCategory = /([a-zA-Z0-9-]+-cat-[0-9]+)/;
        var regexpFindGallery = /-ig/;

        function qig(path) {
            if (path.match(regexpFindPage)) {
                path = path.replace(regexpReplacePage, '$1-ig');
            }
            else if (path.match(regexpFindFilters)) {
                path = path.replace(regexpReplaceFilters, '/-ig$1');
            }
            if (!path.match(regexpFindGallery)) {
                if (path.slice(path.length - 1) !== '/') {
                    path += '/';
                }
                path += '-ig';
            }
            return path;
        }

        function searchig(path) {
            if (path.match(regexpFindPage)) {
                path = path.replace(regexpReplacePage, '$1-ig');
            }
            else if (path.match(regexpFindFilters)) {
                path = path.replace(regexpReplaceFilters, '/-ig$1');
            }
            if (!path.match(regexpFindGallery)) {
                if (path.slice(path.length - 1) !== '/') {
                    path += '/';
                }
                path += '-ig';
            }
            return path;
        }

        function allresultsig(path) {
            if (path.match(regexpFindPage)) {
                path = path.replace(regexpReplacePage, '$1-ig');
            }
            else if (path.match(regexpFindFilters)) {
                path = path.replace(regexpReplaceFilters, '-ig$1');
            }
            if (!path.match(regexpFindGallery)) {
                if (path.slice(path.length - 1) === '/') {
                    path = path.substring(0, path.length - 1);
                }
                path += '-ig';
            }
            return path;
        }

        function showig(path) {
            if (path.match(regexpFindPage)) {
                path = path.replace(regexpReplacePage, '$1-ig');
            }
            else if (path.match(regexpFindFilters)) {
                path = path.replace(regexpReplaceFilters, '-ig$1');
            }
            else if (path.match(regexpFindCategory)) {
                path = path.replace(regexpReplaceCategory, '$1-ig');
            }
            if (!path.match(regexpFindGallery)) {
                if (path.slice(path.length - 1) === '/') {
                    path = path.substring(0, path.length - 1);
                }
                path += '-ig';
            }
            return path;
        }

        return {
            qig: qig,
            searchig: searchig,
            allresultsig: allresultsig,
            showig: showig
        };
    })();

    function linkig(href, query, parser) {
        var pairs = href.split('?');
        var path = pairs[0];
        var querystring = pairs[1];
        var linkIgParser;

        if (!~path.indexOf('-ig')) {
            linkIgParser = linkIgParsers[parser];
            if (linkIgParser) {
                path = linkIgParser.call(null, path);
            }
        }
        href = path.replace(/\/\//g, '/');
        if (querystring) {
            href = '?' + querystring;
        }
        return utils.link(href, this.app, query);
    }

    function categoryOrder(categories, country) {
        var categoryTree = config.getForMarket(country, ['categoryTree'], '');
        var list = [];

        if (categoryTree) {
            if (categoryTree.order) {
                _.each(categoryTree.order, function(obj, i){
                    _.find(categories, function(obj){
                        return obj.id == categoryTree.order[i] ? list.push(obj) : false;
                    });
                });
                categories = list;
            }
            if (categoryTree.columns) {
                categories.columns = categoryTree.columns;
            }
        }
        if (!categoryTree || !categoryTree.columns) {
            categories.columns = [1, 3, 2];
        }
        return categories;
    }

    var staticsHandler = (function() {
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

        function statics(env, filePath, host) {
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
        }

        function image(env, filePath, host) {
            var envPath = config.get(['environment', 'staticPath'], '');

            envPath = getEnv(envPath, filePath, {
                env: env,
                type: 'static',
                host: host
            });
            return [envPath, filePath].join('');
        }

        return {
            'static': statics,
            image: image
        };
    })();

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
        var host = this.app ? this.app.session.get('host') : '';
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
        if (env !== 'production') {
            console.log('[OLX DEBUG] 404 ::', err, err ? err.stack || err : '');
        }
        if (_.isFunction(status)) {
            callback = status;
            status = 404;
        }
        if (this.app.session.get('isServer')) {
            this.app.req.res.status(status);
            statsd.increment([this.app.session.get('location').abbreviation, 'errors', 400]);
        }
        this.app.seo.reset(this.app, {
            page: ['pages', 'error']
        });
        this.app.seo.addMetatag('robots', 'noindex, nofollow');
        this.app.seo.addMetatag('googlebot', 'noindex, nofollow');
        return callback(null, 'pages/error', res || {});
    }

    function serializeFormJSON(data) {
       var output = {};
        _.each(data, function each(item) {
           if (output[item.name]) {
               if (!output[item.name].push) {
                   output[item.name] = [output[item.name]];
               }
               output[item.name].push(item.value || '');
           } else {
               output[item.name] = item.value || '';
           }
       });
       return output;
    }

    function parseDate(date) {
        if (!_.isString(date)) {
            return date;
        }
        date = date.split(/[- .:]/);
        _.map(date, function toNumber(part) {
            return Number(part);
        });
        return new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
    }

    function dateDiff(start, end) {
        var miliseconds = parseDate(end).getTime() - parseDate(start).getTime();
        var seconds = miliseconds / 1000;
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        var out = [];

        minutes = minutes - hours*60;
        hours = hours - days*24;

        out.push(days);
        out.push(this.dictionary['messages_date_format.day' + (hours > 1 ? 's_n' : '')] + ',');
        out.push(hours);
        out.push(this.dictionary['messages_date_format.hour' + (hours > 1 ? 's_n' : '')]);
        out.push(this.dictionary['messages_date_format.and']);
        out.push(minutes);
        out.push(this.dictionary['messages_date_format.minute' + (minutes > 1 ? 's_n' : '')]);
        return out.join(' ');
    }

    return {
        slugToUrl: slugToUrl,
        link: utils.link,
        linkig: linkig,
        categoryOrder: categoryOrder,
        fullizeUrl: utils.fullizeUrl,
        params: utils.params,
        removeParams: utils.removeParams,
        redirect: redirect,
        error: error,
        serializeFormJSON: serializeFormJSON,
        'static': statics,
        dateDiff: dateDiff
    };
})();
