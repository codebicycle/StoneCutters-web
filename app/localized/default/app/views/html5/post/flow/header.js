'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
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
        'click .logo': 'onLogoClick',
        'change': 'onChange',
        'click #back': 'onBackClick'
    },
    onLogoClick: function(event) {
        if (this.parentView.edited && !confirm(translations.get(this.app.session.get('selectedLanguage'))['misc.WantToGoBack'])) { // Now find a better translation
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    },
    onChange: function(event, title, current, back, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#title').text(title);
        if (current && back) {
            this.$el.addClass('internal');

            //this.$('.logo').hide();
            //this.$('#back').removeClass('disabled');
            this.$el.data('current', current);
            this.$el.data('back', back);
        }
        else {
            this.$el.removeClass('internal');

            //this.$('.logo').show();
            //this.$('#back').addClass('disabled');
            this.$el.removeData('current');
            this.$el.removeData('back');
        }
        this.data = data;
    },
    onBackClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.$el.data('current'), this.$el.data('back'), this.data]);
    }
});

module.exports.id = 'post/flow/header';
