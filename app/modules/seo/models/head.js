'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../shared/utils');
var config = require('../../../../shared/config');
var configSeo = require('../config');
var excludes = ['itemImages'];
var metasDefaults = utils.get(configSeo, ['metatags', 'default']);
var metasHandler = {
    title: title,
    metatitle: metatitle,
    toptitle: topTitle,
    h1: topTitle,
    description: description,
    canonical: canonical,
    'google-site-verification': googleSiteVerification
};
var Base;
var Head;
var translations = require('../../../../shared/translations');

Backbone.noConflict();
Base = Backbone.Model;

function cutString(title, n) {
    var pattern = /(\sP\-\d+)$/;
    var pageMatch;
    var page = '';

    if (title.length <= n) {
        return title;
    }
    pageMatch = title.match(pattern);
    if (pageMatch) {
        title = title.substr(0, pageMatch.index + 1);
        page = pageMatch[0];
    }
    if (title.charAt(n) == ' ') {
        return title.substr(0,n) + page;
    }
    else {
        return cutString(title, --n) + page;
    }
}

function title(metas, value) {
    var suffix;
    var location = this.app.session.get('location').url;
    var titleLength = config.getForMarket(location, ['seo', 'metaTitleLength'], 110);

    if (!value) {
        this.unset('title');
    }
    else {
        suffix = this.getLocationName();

        if (!~value.indexOf(suffix)) {
            value += ' - ';
            value += suffix;
        }
        Base.prototype.set.call(this, 'title', cutString(value,titleLength), {
            unset: false
        });
    }
    return metas;
}

function metatitle(metas, value) {
    var suffix;
    var location = this.app.session.get('location').url;
    var titleLength = config.getForMarket(location, ['seo', 'metaTitleLength'], 110);

    if (!value) {
        delete metas.title;
    }
    else {
        suffix = this.getLocationName();
        if (!~value.indexOf(suffix)) {
            value += ' - ';
            value += suffix;
        }
        metas.title = cutString(value,titleLength);
    }
    return metas;
}

function topTitle(metas, value) {
    if (!value) {
        value = '';
    }
    Base.prototype.set.call(this, 'topTitle', value, {
        unset: false
    });
    return metas;
}

function description(metas, value) {
    var suffix;
    var location = this.app.session.get('location').url;
    var descriptionLength = config.getForMarket(location, ['seo', 'metaDescriptionLength'], 160);

    if (!value) {
        delete metas.description;
    }
    else {
        suffix = this.getLocationName();
        if (!~value.indexOf(suffix)) {
            value += ' - ';
            value += suffix;
        }
        metas.description = cutString(value,descriptionLength);
    }
    return metas;
}

function canonical(metas, value) {
    var platform = this.app.session.get('platform');
    var url = this.app.session.get('url');
    var _canonical;
    var protocol;
    var host;

    if (_.isString(value)) {
        _canonical = value;
    }
    else if (platform === 'wap' && utils.params(url, 'sid')) {
        protocol = this.app.session.get('protocol');
        host = this.app.session.get('host');

        _canonical = [protocol, '://', host, utils.removeParams(url, 'sid')].join('');
    }
    if (_canonical) {
        Base.prototype.set.call(this, 'canonical', _canonical, {
            unset: false
        });
    }
    return metas;
}

function googleSiteVerification(metas, value) {
    var code;

    if (value) {
        code = config.get(['seo', 'wmtools', this.app.session.get('location').url]);

        if (code) {
            metas['google-site-verification'] = code;
        }
    }
    return metas;
}

Head = Backbone.Model.extend({
    defaults: {
        metatags: {}
    },
    initialize: function(attrs, options) {
        this.app = options.app;

        this.on('change', this.update, this);
        this.on('change:topTitle', this.onChangeTopTitle, this);
        this.on('reset', this.onReset, this);
    },
    set: function(key, value, options) {
        if (_.isObject(key) || (options && options.unset)) {
            return Base.prototype.set.apply(this, arguments);
        }
        if (_.contains(excludes, key)) {
            return;
        }
        var handler = metasHandler[key.toLowerCase()];
        var metas = _.clone(this.get('metatags') || {});

        if (handler) {
            metas = handler.call(this, metas, value);
        }
        else {
            metas[key] = value;
        }
        return Base.prototype.set.call(this, 'metatags', metas, _.defaults(options || {}, {
            unset: false
        }));
    },
    setAll: function(metas, options) {
        options = _.defaults({}, options, {
            unset: false
        });

        _.each(metas, function setMeta(value, name) {
            this.set(name, value, options);
        }, this);
    },
    update: function () {
        if (utils.isServer) {
            return;
        }
        var head = this.toJSON();

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
    reset: function (app, options) {
        this.app = app;
        this.clear();
        Base.prototype.set.call(this, 'metatags', {}, {
            unset: false
        });
        this.trigger('reset', this, options);
    },
    toJSON: function() {
        var head = Base.prototype.toJSON.apply(this, arguments);
        var clone = _.clone(head);

        if (clone.metatags) {
            clone.metatags = _.clone(clone.metatags);
            clone.metatags = Object.keys(clone.metatags).filter(function each(metatag) {
                return !!clone.metatags[metatag];
            }).map(function each(metatag) {
                return {
                    name: metatag,
                    content: clone.metatags[metatag]
                };
            });
        }
        return clone;
    },
    getLocationName: function () {
        var location = this.app.session.get('location');

        if (location) {
            return (location.current || location).name;
        }
        return '';
    },
    onChangeTopTitle: function (head, value) {
        var location = this.app.session.get('location');
        var currentRoute = this.app.session.get('currentRoute');
        var headerTitle = value;
        
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        
        if(location.url === 'www.olx.com.ar' && currentRoute.controller === 'categories' && currentRoute.action === 'list'){   
            headerTitle = this.dictionary['misc.FreeClassifieds-SEO'].replace('<<AREA>>', (location.current || location).name);
        }
        if (utils.isServer) {
            return;
        }
        $('#header_keywords').text(headerTitle);
    },
    onReset: function(head, options) {
        var currentRoute = this.app.session.get('currentRoute');
        var metatags;

        if (!options.page && !currentRoute) {
            return;
        }
        metatags = utils.get(configSeo, ['metatags'].concat(options.page || [currentRoute.controller, currentRoute.action]), {});
        this.setAll(_.defaults({}, metatags, metasDefaults));
    }
});

module.exports = Head;
