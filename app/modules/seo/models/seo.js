'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../../shared/config');
var translations = require('../../../../shared/translations');
var configSeo = require('../config');
var Head = require('./head');
var AltGenerator = require( './altGenerator');
var getters = {
    head: getHead,
    title: getPropertyHead,
    metatitle: getPropertyHead,
    description: getPropertyHead,
    keywords: getPropertyHead,
    topTitle: getPropertyHead
};
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

function getConfig(key) {
    var location;

    if (key === 'head') {
        return true;
    }
    location = this.app.session.get('location');
    if (!location) {
        console.log('[OLX_DEBUG] SEO | Read config from default |', key);
        location = {url: ''};
    }
    return config.getForMarket(location.url, ['seo', key]);
}

Seo = Backbone.Model.extend({
    initialize: function (attrs, options) {
        this.head = new Head({}, options);
        this.reset(options.app, {
            silent: true
        });

        this.on('change:staticSearch', this.onChangeStaticSearch, this);
        this.on('change:altImages', function(seo, value) {
            this.onChangeAltImages(seo, value);
        }, this);
    },
    get: function (key) {
        var attr;
        var getter;

        if (getConfig.call(this, key)) {
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
        this.app = app;
        if (!options.silent) {
            this.head.reset(app, options);
            this.clear();
        }
    },
    addMetatag: function (name, value) {
        this.head.set(name, value);
    },
    isEnabled: function () {
        return getConfig.call(this, 'enabled');
    },
    onChangeStaticSearch: function (seo, value) {
        if (!value) {
            return;
        }
        var dictionary = translations.get(this.app.session.get('selectedLanguage'));
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
    },
    onChangeAltImages: function (seo, value) {
        if (!value) {
            return;
        }

        var generator = new AltGenerator({
            item: value
        }, {
            seo: this,
            app: this.app
        });
        this.set('altImages', generator.generate(), {
            silent: true,
            unset: false
        });
    }
});

module.exports = Seo;
