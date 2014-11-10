'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-contact-view',
    className: 'posting-contact-view',
    events: {
        'change': 'onChange',
        'disablePost': 'onDisablePost',
        'enablePost': 'onEnablePost'
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('fieldSubmit', [$(event.target)]);
    },
    onDisablePost: function(event) {
        this.$('.posting').attr('disabled', 'disabled');
    },
    onEnablePost: function(event) {
        this.$('.posting').removeAttr('disabled');
    }
});

module.exports.id = 'post/contact';
