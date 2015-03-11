'use strict';

var _ = require('underscore');
var utils = require('../../../shared/utils');

module.exports = {
    log: log,
    warn: log,
    error: log
};

function log() {
    if (utils.isServer) {
        return console.log.apply(console, arguments);
    }
    $.ajax({
        url: '/tracking/log.gif',
        method: 'get',
        data: {
            message: _.toArray(arguments).join(' ')
        }
    });
}
