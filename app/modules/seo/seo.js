'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../shared/utils');
var config = require('../../../shared/config');
var configSeo = require('./config');
var defaultConfig = config.get(['markets', 'default', 'seo']);
var URLParser = require('url');
var seo;
var seoContructor = 0;

var emergingMarketsDomains = [
    'www.olx.com.bo',
    'www.olx.com.py',
    'www.olx.com.uy'
]; //@todo SACAR ESTO DE ACA!

Backbone.noConflict();

function _getMetatagName(currentRoute) {
    return [currentRoute.controller, currentRoute.action];
}

function SeoModule(app) {
    this.app = app;
    console.log("Seo Constructor:" + (seoContructor++));
    this.initialize();
}

_.extend(SeoModule.prototype, Backbone.Events);
_.extend(SeoModule.prototype, {
    head: {
        metatags: {}

    },
    _specials: {
        title: function (content) {
            if (content) {
                this.head.title = content + this.getLocationName(' - ');
                return;
            }
            delete this.head.title;
        },
        description: function (content) {
            if (content) {
                this.head.metatags.description = content + this.getLocationName(' - ');
                return;
            }
            delete this.head.metatags.description;
        },
        canonical: function (content) {
            var platform = this.app.session.get('platform');
            var url = this.app.session.get('url');
            var protocol;
            var host;

            if (_.isString(content)) {
                this.head.canonical = content;
            }
            else if (platform === 'wap' && utils.params(url, 'sid')) {
                protocol = this.app.session.get('protocol');
                host = this.app.session.get('host');

                this.head.canonical = [protocol, '://', host, utils.removeParams(url, 'sid')].join('');
            }
        },
        'google-site-verification': function (content) {
            var country = this.app.session.get('location').url;
            var gsVerification;

            gsVerification = config.get(['seo', 'wmtools', country]);
            if (gsVerification) {
                this.head.metatags['google-site-verification'] = gsVerification;
            }
        }
    },

    initialize: function () {
        var country = this.app.session.get('location').url;

        if (_.contains(emergingMarketsDomains, country)) {
            country = 'emerging';
        }
        this.config = config.get(['markets', country, 'seo'], defaultConfig);
        this.on('addMetatag', this.update.bind(this));
    },
    addMetatag: function (name, content) {
        var special = this._specials[name.toLowerCase()];

        if (special) {
            return special.call(this, content);
        }
        else {
            this.head.metatags[name] = content;
        }
        this.trigger('addMetatag', name, content);
    },
    getHead: function () {
        var clone = _.clone(this.head);

        clone.metatags = Object.keys(clone.metatags).filter(function each(metatag) {
            return !!clone.metatags[metatag];
        }).map(function each(metatag) {
            return {
                name: metatag,
                content: clone.metatags[metatag]
            };
        });
        return clone;
    },
    update: function () {
        if (utils.isServer) {
            return;
        }
        var head = this.getHead();

        $('head title').text(head.title);
        _.each($('meta[name!=viewport]'), function each(metatag) {
            metatag = $(metatag);
            if (!metatag.attr('name')) {
                return;
            }
            metatag.remove();
        });
        _.each(head.metatags, function each(metatag) {
            $('head meta:last').after('<meta name="' + metatag.name + '" content="' + metatag.content + '" />');
        });
        $('head link[rel="canonical"]').remove();
        if (head.canonical) {
            $('head').append('<link rel="canonical" href="' + head.canonical + '" >');
        }
    },
    getLocationName: function (prefix) {
        var location;

        if (this && this.app) {
            location = this.app.session.get('location');
            if (location) {
                return prefix + (location.current ? location.current.name : location.name);
            }
        }
        return '';
    },
    desktopizeReplace: function (url, params) {
        _.each(params, function (value, i) {
            url = url.replace('$' + i, value);
        });
        return url;
    },
    desktopizeUrl: function (url, options, params) {
        var protocol = options.protocol + '://';
        var host = options.host;
        var path = options.path;
        var location = utils.params(url, 'location');
        var exceptions = utils.get(configSeo, ['redirects', 'onDesktop'], {});
        var regexp;
        var match;
        var port;

        url = utils.cleanParams(url);
        _.each(exceptions, function findException(exception) {
            if (!match && (regexp = new RegExp(exception.regexp)).test(path)) {
                match = exception;
            }
        });
        if (match) {
            url = match.url;
            if (match.replace) {
                url = this.desktopizeReplace(url, match.regexp.exec(path));
            }
            if (match.params && params) {
                url = this.desktopizeReplace(url, params);
            }
        }
        if (location) {
            host = location.split('.');
        }
        else {
            host = host.split('.');
            host.shift();
            if (options.hasPlatform) {
                host.shift();
            }
            port = host.pop();
            host.push(port.split(':').shift());
            host.unshift('www');
        }
        if (url.slice(0, protocol.length) === protocol) {
            url = URLParser.parse(url);
            url = [url.pathname, (url.search || '')].join('');
        }
        url = [protocol, host.join('.'), url].join('');
        if (url.slice(url.length - 1) === '/') {
            url = url.slice(0, url.length - 1);
        }
        return url;
    },
    getCategoryId: function (categoryId) {
        return configSeo.categories.closed[categoryId] || configSeo.categories.migrated[categoryId];
    },
    resetHead: function (page) {
        var metatag = page || _getMetatagName(this.app.session.get('currentRoute'));
        var defaultMetatags = utils.get(configSeo, ['metatags', 'default']);
        var metatags = utils.get(configSeo, ['metatags'].concat(metatag), {});

        delete this.head.canonical;
        this.head.metatags = {};
        _.each(_.extend({}, metatags, defaultMetatags), function add(value, key) {
            this.addMetatag(key, value);
        }.bind(this));
    },
    reset: function (app, page) {
        //@todo borrar popular searches related ads...etc..
        this.app = app;
        this.resetHead(page);
    },
    setContent: function (content) {
        this.seoContent = content;
    },
    get: function (key) {
        if (!!this.seoContent) {
            return this.seoContent[key];
        }
    }
});

module.exports = {
    instance: function (app) {
        if (!seo) {
            seo = new SeoModule(app);
        }
        return seo;
    }
};