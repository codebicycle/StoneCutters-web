'use strict';

var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
});

module.exports.id = 'header/index';
