'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_errors_view',
    id: 'errors',
    tagName: 'section',
    errors: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.errors = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            errors: this.errors || {}
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .close': 'onCloseClick'
    },
    onShow: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        console.log(errors);
        this.errors = errors;
        this.render();
        this.$el.addClass('visible');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.removeClass('visible');
    },
    onCloseClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.trigger('hide');
    }
});

module.exports.id = 'post/flow/errors';
