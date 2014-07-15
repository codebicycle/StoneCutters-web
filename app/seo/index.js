'use strict';

var _ = require('underscore');
var config = require('../config');
var utils = require('../../shared/utils');
var METATAGS = require('./metatags');
var head = {
    metatags: {}
};
var specials = {
    title: function(content) {
        head.title = content + getLocationName.call(this, ' - ');
    },
    description: function(content) {
        head.metatags.description = content + getLocationName.call(this, ' - ');
    },
    canonical: function(content) {
        var platform = this.app.session.get('platform');
        var url = this.app.session.get('url');
        var protocol;
        var host;

        if (_.isString(content)) {
            head.canonical = content;
        } 
        else if (platform === 'wap' && utils.params(url, 'sid')) {
            protocol = this.app.session.get('protocol');
            host = this.app.session.get('host');

            head.canonical = [protocol, '://', host, utils.removeParams(url, 'sid')].join('');
        }
    },
    'google-site-verification': function(content) {
        var platform = this.app.session.get('platform');
        var country = this.app.session.get('location').url;
        var gsVerification;

        gsVerification = config.get(['seo', 'wmtools', country, platform]);
        if (gsVerification) {
            head.metatags['google-site-verification'] = gsVerification;
        }
    }
};

function getLocationName(prefix) {
    if (this && this.app) {
        var location = this.app.session.get('location');

        return prefix + (location.current ? location.current.name : location.name);
    }
    return '';
}

function update() {
    if (utils.isServer) {
        return;
    }
    var head = getHead();

    $('head title').text(head.title);
    _.each($('meta[name!=viewport]'), function each(metatag) {
        metatag = $(metatag);
        if (!metatag.attr('name')) {
            return;
        }
        metatag.remove();
    });
    _.each(head.metatags, function each(metatag) {
        $('head meta:last').after('<meta name="' +  metatag.name + '" content="' + metatag.content + '" />');
    });
    $('head link[rel="canonical"]').remove();
    if (head.canonical) {
        $('head').append('<link rel="canonical" href="' +  head.canonical + '" >');
    }
}

function getHead() {
    var clone = _.clone(head);

    clone.metatags = Object.keys(clone.metatags).filter(function each(metatag) {
        return !!clone.metatags[metatag];
    }).map(function each(metatag) {
        return {
            name: metatag,
            content: clone.metatags[metatag]
        };
    });
    return clone;
}

function addMetatag(name, content) {
    var special = specials[name.toLowerCase()];

    if (special) {
        return special.call(this, content);
    }
    head.metatags[name] = content;
}

function getMetatagName(page, currentRoute) {
    if (page) {
        return page;
    }
    return [currentRoute.controller, currentRoute.action];
}

module.exports = {
    getHead: getHead,
    resetHead: function(page) {
        var metatag = getMetatagName(page, this.app.session.get('currentRoute'));
        var defaultMetatags = utils.get(METATAGS, 'default');
        var metatags = utils.get(METATAGS, metatag, {});

        delete head.canonical;
        head.metatags = {};
        _.each(_.extend({}, metatags, defaultMetatags), function add(value, key) {
            addMetatag.call(this, key, value);
        }.bind(this));
    },
    addMetatag: addMetatag,
    update: update
};
