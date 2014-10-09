'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'fieldset',
    id: 'posting-images-view',
    className: 'posting-images-view wrapper'
});

module.exports.id = 'post/images';
