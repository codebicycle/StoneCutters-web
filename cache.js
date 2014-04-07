'use strict';

var asynquence = require('asynquence');
var LIFETIME = require('config').get(['cache', 'lifetime','default'], 60);
var memcached;

module.exports = function(debugMode) {
    debugMode = debugMode || false;
    memcached = memcached || require('./memcached')();

    function get(key, done, notCached, cached, lifetime) {
        function __get(done) {
            _get(key, done, notCached, lifetime);
        }

        if (typeof cached === 'number') {
            lifetime = cached;
            cached = null;
        }

        cached = cached || function(data) {
            done(data);
        };

        asynquence().or(done.fail)
            .then(__get)
            .val(cached);
    }

    function _get(key, done, notSet, lifetime) {
        if (Array.isArray(key)) {
            key = key.join('_');
        }
        lifetime = lifetime || LIFETIME;

        function attempt(done) {
            memcached.client.get(key, function got(err, response) {
                if (err) {
                    if (debugMode) {
                        console.log('Cache error getting ' + key + ': ' + err);
                    }
                    return done.fail(err);
                }
                if (response && debugMode) {
                    console.log('got: ' + key);
                }
                return done(response);
            });
        }

        function check(next, response) {
            if (response || !notSet) {
                return done(response);
            }
            notSet(next);
        }

        function cache(response) {
            set(key, response, done, lifetime);
        }

        asynquence().or(done.fail)
            .then(attempt)
            .then(check)
            .val(cache);
    }

    function set(key, value, done, lifetime) {
        if (Array.isArray(key)) {
            key = key.join('_');
        }
        lifetime = lifetime || LIFETIME;
        memcached.client.set(key, value, lifetime, function set(err) {
            if (err) {
                if (debugMode) {
                    console.log('Cache error setting ' + key + ': ' + err);
                }
                return done.fail(err);
            }
            if (debugMode) {
                console.log('set: ' + key);
            }
            done(value);
        });
    }

    function unset(key, done) {
        if (Array.isArray(key)) {
            key = key.join('_');
        }
        memcached.client.del(key, function deleted(err) {
            if (err) {
                if (debugMode) {
                    console.log('Cache error unseting ' + key + ': ' + err);
                }
                return done.fail(err);
            }
            if (debugMode) {
                console.log('unset: ' + key);
            }
            done();
        });
    }

    return {
        get: get,
        set: set,
        unset: unset
    };
};