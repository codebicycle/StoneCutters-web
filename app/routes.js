'use strict';

var helpers = require('./helpers');

module.exports = function(match) {
    var url;
    var properties;

    for (url in helpers.urls) {
        properties = helpers.urls[ url ];
        if (!properties.isServer) {
            match(properties.url, properties.view);
        }
    }
};
