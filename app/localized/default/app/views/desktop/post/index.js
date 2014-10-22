'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    events: {
        'focus .text-field': 'fieldFocus',
        'blur .text-field': 'fieldFocus'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data);
    },
    fieldFocus: function(event) {
        $(event.currentTarget).closest('.wrapper').toggleClass('input-focus');
    }
});

module.exports.id = 'post/index';