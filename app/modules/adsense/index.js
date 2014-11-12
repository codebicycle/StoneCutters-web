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
    title: getPropertyHead,
    description: getPropertyHead,
    keywords: getPropertyHead,
    topTitle: getPropertyHead
};

var INSTANCE;
var Base;
var Seo;

Backbone.noConflict();
Base = Backbone.Model;

function getHead() {
    var head = this.head.toJSON();
    return head;
}

function getPropertyHead(key) {
    return this.head.get(key);
}

Seo = Backbone.Model.extend({
    initialize: function (attrs, options) {
        this.head = new Head({}, options);
        this.reset(options.app, {
            silent: true
        });

        this.on('change:staticSearch', this.onChangeStaticSearch, this);
    },
    get: function (key) {
        var attr;
        var getter;

        // if (this.config[key]) {
            getter = getters[key];
            if (getter) {
                attr = getter.apply(this, arguments);
            }
            else {
                attr = Base.prototype.get.apply(this, arguments);
            }
        // }
        return attr;
    },
    setContent: function (meta, options) {
        var seo;
        var title;
        var suffix;

        if (meta && meta.seo) {
            seo = meta.seo;
            options = _.defaults({}, options || {}, {
                unset: false
            });

            this.set(seo, options);
            this.head.setAll(seo.metas, options);

            if (seo.itemPage) {
                this.head.setAll(seo.itemPage, options);
            }
            if (seo.levelPath) {
                if (seo.levelPath.wikititles) {
                    this.set('wikititles', seo.levelPath.wikititles);
                }
            }
        }
    },
    reset: function (app, options) {
        options = _.defaults({}, options || {}, {
            silent: false
        });
        app.seo = this;
        this.app = app;
        this.config = _.extend({}, config.getForMarket(app.session.get('location').url, ['seo'], defaultConfig), {
            head: true
        });
        if (!options.silent) {
            this.head.reset(app, options);
            this.clear();
        }
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
        if (!value) {
            return;
        }
        var dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
        var location = this.app.session.get('location');
        var region = (location.current || location).name;
        var message = dictionary['messages_item_page.CATEGORY_REGION'] || '';
        var topTitle = [];

        topTitle.push(value.keyword);
        topTitle.push(': ');
        topTitle.push(message.replace('<<CATEGORY>>', value.category).replace('<<REGION>>', region));
        topTitle.push(' | OLX');

        this.head.set('topTitle', topTitle.join(''), {
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
    }
};
