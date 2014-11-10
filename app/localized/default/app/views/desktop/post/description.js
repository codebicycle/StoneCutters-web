'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-description-view',
    className: 'posting-description-view',
    events: {
        'change': 'onChange',
        'keyup [name=title]': 'characterCount'
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('fieldSubmit', [$(event.target)]);
    },
    characterCount: function (event) {
        var $input = $(event.currentTarget);
        var $msg = $input.next('small');
        var count = $msg.text().split(' ');

        count[0] = $input.val().length;
        $msg.text(count.join(' '));
    }
});

module.exports.id = 'post/description';
