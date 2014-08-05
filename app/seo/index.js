'use strict';

var _ = require('underscore');
var URLParser = require('url');
var config = require('../config');
var configSeo = require('./config');
var utils = require('../../shared/utils');
var head = {
    metatags: {}
};
var specials = {
    title: function(content) {
        if (content) {
            head.title = content + getLocationName.call(this, ' - ');
            return;
        }
        delete head.title;
    },
    description: function(content) {
        if (content) {
            head.metatags.description = content + getLocationName.call(this, ' - ');
            return;
        }
        delete head.metatags.description;
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
        var country = this.app.session.get('location').url;
        var gsVerification;

        gsVerification = config.get(['seo', 'wmtools', country]);
        if (gsVerification) {
            head.metatags['google-site-verification'] = gsVerification;
        }
    }
};

function getLocationName(prefix) {
    var location;

    if (this && this.app) {
        location = this.app.session.get('location');
        if (location) {
            return prefix + (location.current ? location.current.name : location.name);
        }
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

function getMetatagName(currentRoute) {
    return [currentRoute.controller, currentRoute.action];
}

function desktopizeReplace(url, params) {
    _.each(params, function(value, i) {
        url = url.replace('$' + i, value);
    });
    return url;
}

function desktopizeUrl(url, options, params) {
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
            url = desktopizeReplace(url, match.regexp.exec(path));
        }
        if (match.params && params) {
            url = desktopizeReplace(url, params);
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
}

module.exports = {
    getHead: getHead,
    resetHead: function(page) {
        var metatag = page || getMetatagName(this.app.session.get('currentRoute'));
        var defaultMetatags = utils.get(configSeo, ['metatags', 'default']);
        var metatags = utils.get(configSeo, ['metatags'].concat(metatag), {});

        delete head.canonical;
        head.metatags = {};
        _.each(_.extend({}, metatags, defaultMetatags), function add(value, key) {
            addMetatag.call(this, key, value);
        }.bind(this));
    },
    addMetatag: addMetatag,
    update: update,
    desktopizeUrl: desktopizeUrl
};
