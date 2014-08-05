'use strict';

var _ = require('underscore');
var isServer = typeof window === 'undefined';
if (isServer) {
    var memcachedModule = '../server/memcached';
    var memcached = require(memcachedModule);
    var uuidModule = 'node-uuid';
    var uuid = require(uuidModule);
}

function noop() {}

var Session = function(isApp, data, done) {
    if (data instanceof Function) {
        done = data;
        data = {};
    }
    data = data || {};
    done = done || noop;
    if (isApp && data.isServer) {
        return done();
    }
    this.session = {};
    if (isServer) {
        new ServerSession(this, callback.bind(this));
    }
    else {
        new ClientSession(this, callback.bind(this));
    }

    function callback(store) {
        var session = _.extend({}, _.clone(this.get('session') || {}), store.getAll(), data);

        this.session.update = function(pairs) {
            for (var key in pairs) {
                session[key] = pairs[key];
            }
            this.set('session', _.clone(session));
        }.bind(this);

        this.session.persist = function(pairs, options) {
            for (var key in pairs) {
                store.put(key, pairs[key], options);
            }
            this.session.update(pairs);
        }.bind(this);

        this.session.get = function(key) {
            if (!key) {
                return _.clone(session);
            }
            return _.clone(session[key]);
        }.bind(this);

        this.session.clear = function(key, options) {
            if (!key) {
                return;
            }
            store.clear(key, options);
            delete session[key];
            this.set('session', _.clone(session));
        }.bind(this);

        done();
    }
};

var ServerSession = function(app, callback) {
    var req = app.req;
    var res = app.req.res;

    if (req.subdomains.pop() !== 'wap') {
        CookiesSession.call(this, req, res, callback);
    }
    else {
        MemcachedSession.call(this, req, res, callback);
    }
};

var CookiesSession = function(req, res, callback) {
    this.getAll = function() {
        return _.clone(_.omit(req.cookies || {}, ['Expires']));
    };

    this.get = function(key, dephault) {
        if (req.cookies) {
            var value = req.cookies[key];

            return (typeof value === 'undefined' ? dephault : value);
        }
        return dephault;
    };

    this.put = function(key, value, options) {
        if (res.cookie) {
            res.cookie(key, value, _.defaults({}, (options || {}), {
                path: '/',
                maxAge: 1728000000
            }));
        }
    };

    this.clear = function(key) {
        res.clearCookie(key, {
            path: '/'
        });
    };

    callback(this);
};

var MemcachedSession = function(req, res, callback) {
    var sid = req.param('sid');

    if (!sid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sid)) {
        console.log('new SID', req.originalUrl);
        console.log(new Error().stack);
        sid = uuid.v4();
    }
    memcached.get(sid, after.bind(this));

    function after(err, session) {
        session = session || {};
        session.sid = sid;

        function getAll() {
            return _.clone(session);
        }

        function get(key, dephault) {
            var value = session[key];

            return (typeof value === 'undefined' ? dephault : value);
        }

        function put(key, value, options) {
            session[key] = value;
            memcached.set(sid, session, 1800, noop);
        }

        function clear(key) {
            delete session[key];
            memcached.set(sid, session, 1800, noop);
        }

        this.getAll = !err ? getAll : noop;
        this.get = !err ? get : noop;
        this.put = !err ? put : noop;
        this.clear = !err ? clear : noop;
        callback(this);
    }
};

var ClientSession = function(app, callback) {
    function getAll() {
        var cookies = {};

        if (document.cookie) {
            document.cookie.split(';').forEach(function each(cookie) {
                cookie = cookie.split('=');
                cookies[cookie[0]] = cookie[1];
            });
        }
        return cookies;
    }

    function get(key, dephault) {
        var cookies = this.getAll();
        var value = cookies[key];

        return (typeof value === 'undefined' ? dephault : value);
    }

    function put(key, value, options) {
        var cookie = key + '=' + value;
        var properties = _.defaults(options || {}, {
            path: '/',
            maxAge: 1728000000
        });

        for (var option in properties) {
            cookie += '; ' + option + '=' + properties[option];
        }
        document.cookie = cookie;
    }

    function clear(key, options) {
        var expires = new Date();

        expires.setMonth(-1);
        put(key, '', {
            expires: expires.toUTCString()
        });
    }

    this.getAll = !isServer ? getAll : noop;
    this.get = !isServer ? get : noop;
    this.put = !isServer ? put : noop;
    this.clear = !isServer ? clear : noop;
    callback(this);
};

module.exports = Session;
