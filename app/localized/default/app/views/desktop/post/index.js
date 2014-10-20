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
        'blur .text-field': 'onBlur',
        'click .posting': 'onSubmit'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data);
    },
    onBlur: function(event) {
        event.preventDefault();
        var $input = $(event.currentTarget);
        var $container = $input.closest('.wrapper');
        var $removeFocus = $container.removeClass('input-focus');

        $removeFocus.blur();
    },
    onFocus: function(event) {
        event.preventDefault();
        var $input = $(event.currentTarget);
        var $container = $input.closest('.wrapper');
        var $addFocus = $container.addClass('input-focus');

        $addFocus.focus();
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#posting-contact-view').trigger('validate');
    }
});

module.exports.id = 'post/index';
