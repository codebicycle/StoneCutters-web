'use strict';

var _ = require('underscore');
var ShopsAdmin = require('./models/shopsadmin');
function prepare() {
    return "";
}

_.extend(ShopsAdmin, {
    prepare: prepare,
    getShop: function() {
        return "Hola";
    }
});

module.exports = ShopsAdmin;
