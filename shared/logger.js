'use strict';

var debugModule = './debug/node';
var Debug = typeof window === 'undefined' ? require(debugModule) : require('./debug/browser');
var debuggers = {};

function getDebug(key) {
    if (!debuggers[key]) {
        debuggers[key] = Debug(key);
    }
    return debuggers[key];
}

function Logger(key) {
    return {
        log: function(string) {
            getDebug(key).apply(null, arguments);
        },
        error: function(string) {
            getDebug(key + ':error').apply(null, arguments);
        }
    };
}

module.exports = function(key) {
    var error = false;
    var logger;

    key = key || '';
    if (Array.isArray(key)) {
        if (key[key.length - 1] === 'error') {
            error = true;
            key = key.slice(0, -1);
        }
        key.unshift('arwen');
        key = key.join(':');
    }
    else {
        key = key.replace(' ', ':');
        if (~key.indexOf(':error', key.length - 6)) {
            error = true;
            key = key.slice(0, -6);
        }
        if (key) {
            key = ':' + key;
        }
        key = 'arwen' + key;
    }
    logger = new Logger(key);
    if (arguments.length > 1) {
        if (error) {
            logger.error.apply(logger, [].slice.call(arguments, 1));
        }
        else {
            logger.log.apply(logger, [].slice.call(arguments, 1));
        }
    }
    return logger;
};
