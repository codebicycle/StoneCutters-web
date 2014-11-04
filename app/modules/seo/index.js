'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var URLParser = require('url');
var utils = require('../../../shared/utils');
var config = require('../../../shared/config');
var translations = require('../../../shared/translations');
var configSeo = require('./config');
var defaultConfig = config.get(['markets', 'common', 'seo']);
var Head = require('./head');

var getters = {
    head: getHead,
    topTitle: getTopTitle
};

var INSTANCE;
var Base;
var Seo;

Backbone.noConflict();
Base = Backbone.Model;

function getHead() {
    return this.head.toJSON();
}

function getTopTitle() {
    return this.head.get('topTitle');
}

Seo = Backbone.Model.extend({
    initialize: function (attrs, options) {
        this.head = new Head({}, options);
        this.reset(options.app);

        this.on('change:staticSearch', this.onChangeStaticSearch, this);
    },
    get: function (key) {
        var attr;
        var getter;

        if (this.config[key]) {
            getter = getters[key];
            if (getter) {
                attr = getter.apply(this, arguments);
            }
            else {
                attr = Base.prototype.get.apply(this, arguments);
            }
        }
        return attr;
    },
    setContent: function (meta, options) {
        var title;
        var suffix;

        if (meta && meta.seo) {
            meta = meta.seo;
            options = _.defaults({}, options || {}, {
                unset: false
            });

            this.set(meta, options);
            this.head.setAll(meta.metas, options);

            if (meta.itemPage) {
                this.head.setAll(meta.itemPage, options);
            }
            if (meta.levelPath) {
                if (meta.levelPath.wikititles) {
                    this.set('wikititles', meta.levelPath.wikititles);
                }
                if (meta.levelPath.top) {
                    if (_.isArray(meta.levelPath.top)) {
                        title = meta.levelPath.top.pop().anchor;
                        suffix = this.head.getLocationName(' - ');
                        if (title.length >= suffix.length && title.slice(title.length - suffix.length) !== suffix) {
                            title += suffix;
                        }
                        this.head.set('topTitle', title);
                    }
                }
            }
        }
    },
    reset: function (app, page) {
        app.seo = this;
        this.app = app;
        this.config = _.extend({}, config.getForMarket(app.session.get('location').url, ['seo'], defaultConfig), {
            head: true
        });
        this.head.reset(app, page);
        this.clear();
    },
    addMetatag: function (name, value) {
        this.head.set(name, value);
    },
    isEnabled: function () {
        return this.config.enabled;
    },
    isCategoryDeprecated: function (categoryId) {
        return configSeo.categories.closed[categoryId] || configSeo.categories.migrated[categoryId];
    },
    onChangeStaticSearch: function (seo, value) {
        var dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
        var location = this.app.session.get('location');
        var region = (location.current || location).name;
        var message = dictionary['messages_item_page.CATEGORY_REGION'] || '';
        var topTitle = [];

        topTitle.push(value.keyword);
        topTitle.push(': ');
        topTitle.push(message.replace('<<CATEGORY>>', value.category).replace('<<REGION>>', region));
        topTitle.push(' | OLX');
        
        this.head.set('topTitle', topTitle.push(''), {
            unset: false
        });
    }
});

module.exports = {
    instance: function (app) {
        if (!INSTANCE) {
            INSTANCE = new Seo({}, {
                app: app
            });
        }
        return INSTANCE;
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
    }
};
