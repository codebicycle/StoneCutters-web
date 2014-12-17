'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/help');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-help-view',
    className: 'pages-help-view',
    events: {
        'click .help-toggle-content': 'helpToggleContent',
        'click .question .icons': 'helpToggleQuestion'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');

        var mailDomain = config.get(['mails', 'domain', location.url], false) || location.url.replace('www.', '');

        var support = config.get(['mails', 'support', location.url], 'support') + '@' + mailDomain;
        var legal = config.get(['mails', 'legal', location.url], 'legal') + '@' + mailDomain;

        return _.extend({}, data, {
            mails: {
                support: support,
                legal: legal,

            }
        });
    },

    helpToggleContent: function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        element.parent('li').siblings('li.selected').removeClass('selected');
        element.parent('li').addClass('selected');
        $('.help-content-display').hide();
        $('#' + element.attr('data-help-content')).show();
    },
    helpToggleQuestion: function(event) {
        var element_current = $(event.currentTarget).parent('.question');

        $('h4.icon-arrow-down').toggleClass('icon-arrow-right icon-arrow-down');

        if(element_current.hasClass('faq-open')) {
            $(event.currentTarget).removeClass('icon-arrow-down');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        } else {
            element_current.find('.icon-arrow-right').toggleClass('icon-arrow-down icon-arrow-right');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();

            element_current.
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        }
    }

});
