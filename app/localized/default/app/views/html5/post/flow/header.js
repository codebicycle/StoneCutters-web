'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_header_view',
    id: 'topBar',
    tagName: 'header',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    events: {
        'change': 'onChange',
        'click #back': 'onBackClick'
    },
    onChange: function(event, title, current, prev) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (prev) {
            this.$('.logo').hide();
            this.$('#back').removeClass('disabled');
            this.$el.data('prev', prev);
        }
        else {
            this.$('.logo').show();
            this.$('#back').addClass('disabled');
            this.$el.removeData('prev', prev);
        }
        this.$el.data('current', current);
        this.$('#title').text(title);
    },
    onBackClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', ['', this.$el.data('current'), this.$el.data('prev')]);
    }
});

module.exports.id = 'post/flow/header';
