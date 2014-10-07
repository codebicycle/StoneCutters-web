'use strict';

var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer-view',
    className: 'footer-view',
});

module.exports.id = 'footer/footer';
