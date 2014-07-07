'use strict';

var Base = require('../view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'html5',
    constructor: function() {
        console.log('hola');
    }
});
