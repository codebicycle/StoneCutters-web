'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view'
});

module.exports.id = 'post/index';