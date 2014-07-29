'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_hub_view',
    id: 'hub',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .step:not(".disabled")': 'onClickStep'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onClickStep: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = $(event.currentTarget);

        this.parentView.$el.trigger('flow', [$step.find('.title').text(), this.id, $step.attr('id').split('-').pop()]);
    }
});

module.exports.id = 'post/flow/hub';
