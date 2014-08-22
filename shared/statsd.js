'use strict';

module.exports = function(options) {
    if (typeof window === 'undefined') {
        var statsdModule = '../server/modules/statsd';

        return require(statsdModule)(options);
    }
    return {
        send: function() {}
    };
};