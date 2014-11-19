'use strict';

var _ = require('underscore');
var esi = require('../../app/modules/esi');

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
                    v = stringifyPrimitive(v);
                    return ks + (esi.isEsiString(v) ? v : encodeURIComponent(v));
                }).join(sep);
            }
            else {
                k = stringifyPrimitive(obj[k]);
                return ks + (esi.isEsiString(k) ? k : encodeURIComponent(k));
            }
        }).join(sep);
    }

    if (!name) {
        return '';
    }
    obj = stringifyPrimitive(obj);
    return encodeURIComponent(stringifyPrimitive(name)) + eq + (esi.isEsiString(obj) ? obj : encodeURIComponent(obj));
}

module.exports = {
    parse: parse,
    stringify: stringify
};
