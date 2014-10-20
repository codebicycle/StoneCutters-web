'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    events: {
        'focus .text-field': 'onFocus',
        'blur .text-field': 'onFocus'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data);
    },
    onFocus: function(event) {
        event.preventDefault();
        var $input = $(event.currentTarget);
        var $container = $input.closest('.wrapper');
        var $toggleFocus = $container.toggleClass('input-focus');

        $toggleFocus.focus();
    }
});

module.exports.id = 'post/index';
