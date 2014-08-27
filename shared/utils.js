'use strict';

var _ = require('underscore');
var isServer = (typeof window === 'undefined');
var linkParams = {
    location: function (href, query) {
        var siteLocation = this.session.get('siteLocation');

        if (!query.location && siteLocation && !~siteLocation.indexOf('www.')) {
            href = params(href, 'location', siteLocation);
        }
        return href;
    },
    language: function (href, query) {
        var selectedLanguage;
        var languages;

        if (!query.language) {
            selectedLanguage = this.session.get('selectedLanguage');

            if (selectedLanguage) {
                languages = this.session.get('languages');

                if (languages && selectedLanguage === languages.models[0].locale) {
                    href = removeParams(href, 'language');
                }
                else {
                    href = params(href, 'language', selectedLanguage);
                }
            }
        }
        else {
            href = params(href, 'language', query.language);
        }
        return href;
    },
    sid: function (href, query) {
        var sid = this.session.get('sid');
        var platform = this.session.get('platform');
        var originalPlatform = this.session.get('originalPlatform');

        if ((platform === 'wap' || originalPlatform === 'wap') && sid) {
            href = params(href, 'sid', sid);
        }
        return href;
    }
};
var defaults = {
    userAgent: 'Mozilla/5.0 (compatible; OlxArwen/1.0; +http://www.olx.com)',
    platform: 'wap'
};

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function parse(qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};

    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }

    var regexp = /\+/g;
    qs = qs.split(sep);

    var maxKeys = 1000;
    if (options && typeof options.maxKeys === 'number') {
      maxKeys = options.maxKeys;
    }

    var len = qs.length;
    // maxKeys <= 0 means that we should not limit keys count
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys;
    }

    for (var i = 0; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr, vstr, k, v;

      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } 
      else {
        kstr = x;
        vstr = '';
      }

      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);

      if (!hasOwnProperty(obj, k)) {
        obj[k] = v;
      } 
      else if (_.isArray(obj[k])) {
        obj[k].push(v);
      } 
      else {
        obj[k] = [obj[k], v];
      }
    }
    return obj;
};

function stringifyPrimitive(v) {
    switch (typeof v) {
      case 'string':
        return v;

      case 'boolean':
        return v ? 'true' : 'false';

      case 'number':
        return isFinite(v) ? v : '';

      default:
        return '';
    }
}

function stringify(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';

    if (obj !== null && typeof obj === 'object') {
      return _.map(_.keys(obj), function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

        if (_.isArray(obj[k])) {
          return _.map(obj[k], function(v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } 
        else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).join(sep);
    }

    if (!name) {
      return '';
    }
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
}

function link(href, app, query) {
    query = query || {};
    _.each(linkParams, function(checker, name) {
        href = checker.call(app, href, query);
    });
    if (!_.isEmpty(query)) {
        href = params(href, query);
    }
    return href;
}

function fullizeUrl(href, app) {
    var protocol = app.session.get('protocol') + '://';
    var host;

    if (href.slice(0, protocol.length) !== protocol) {
        host = app.session.get('host');
        href = [protocol, host, (href.indexOf('/') ? '/' : ''), href].join('');
    }
    return href;
}

function params(url, keys, value) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = parse(parts.join('?'));
    }
    if (_.isObject(keys)) {
        parameters = _.extend(parameters, keys);
    }
    else if (!value) {
        return parameters[keys];
    }
    else {
        parameters[keys] = value;
    }
    if (!_.isEmpty(parameters)) {
        out.push('?');
        out.push(stringify(parameters));
    }
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

function removeParams(url, keys) {
    var parts = url.split('?');
    var parameters = {};
    var out = [];

    out.push(parts.shift());
    if (parts.length) {
        parameters = parse(parts.join('?'));
    }
    if (_.isObject(keys)) {
        parameters = _.filter(parameters, function filter(key) {
            return !_.contains(keys, key);
        });
    }
    else {
        delete parameters[keys];
    }
    if (!_.isEmpty(parameters)) {
        out.push('?');
        out.push(stringify(parameters));
    }
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

function cleanParams(url) {
    var parts = url.split('?');
    var out = [];

    out.push(parts.shift());
    if (url.slice(url.length - 1) === '#') {
        out.push('#');
    }
    return out.join('');
}

function get(obj, keys, defaultValue) {
    var value;

    if (!Array.isArray(keys)) {
        if (typeof keys === 'undefined') {
            keys = [];
        } else {
            keys = [keys];
        }
    }
    if (typeof defaultValue === 'undefined') {
        defaultValue = null;
    }
    if (!keys.length) {
        return defaultValue || obj;
    }
    keys.every(function iterate(key, index) {
        try {
            if (!index) {
                value = obj[key];
            }
            else {
                value = value[key];
            }
        }
        catch (err) {
            value = null;
            return false;
        }
        return true;
    });
    if (typeof value === 'undefined' || value === null) {
        return defaultValue;
    }
    return _.isFunction(value) ? value : _.clone(value);
}

function daysDiff(date) {
    var now = new Date();
    var diff = now.getTime() - date.getTime();

    return Math.abs(Math.round(diff / (24 * 60 * 60 * 1000)));
}

module.exports = {
    isServer: isServer,
    link: link,
    fullizeUrl: fullizeUrl,
    params: params,
    removeParams: removeParams,
    cleanParams: cleanParams,
    get: get,
    daysDiff: daysDiff,
    defaults: defaults
};
