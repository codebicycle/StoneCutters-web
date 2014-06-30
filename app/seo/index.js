'use strict';

var _ = require('underscore');
var config = require('../config');
var utils = require('../../shared/utils');
var METATAGS = require('./metatags');
var head = {
    metatags: {}
};

function update() {
    if (typeof window === 'undefined') {
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

function checkSpecials(name, content) {
    if (name === 'title' || name === 'canonical') {
        head[name] = content;
        return true;
    }
    return false;
}

function getHead() {
    var clone = _.clone(head);

    clone.metatags = Object.keys(clone.metatags).map(function each(metatag) {
        return {
            name: metatag,
            content: clone.metatags[metatag]
        };
    });
    return clone;
}

function getMetatagName(page, currentRoute) {
    if (page) {
        return page;
    }
    return [currentRoute.controller, currentRoute.action];
}


function addMetatag(name, content) {
    if (!checkSpecials(name, content)) {
        head.metatags[name] = content;
    }
}

module.exports = {
    getHead: getHead,
    resetHead: function(page) {
        var metatag = getMetatagName(page, this.app.session.get('currentRoute'));
        var defaultMetatags = utils.get(METATAGS, 'default');
        var metatags = utils.get(METATAGS, metatag, {});
        var platform = this.app.session.get('platform');
        var country = this.app.session.get('location').url;
        var googleSiteVerification;

        head.metatags = {};
        _.each(_.extend({}, metatags, defaultMetatags), function add(value, key) {
            addMetatag(key, value);
        });

        googleSiteVerification = config.get(['seo', 'wmtools', country, platform]);
        if (googleSiteVerification) {
            addMetatag('google-site-verification', googleSiteVerification);
        }
    },
    addMetatag: addMetatag,
    update: update
};
