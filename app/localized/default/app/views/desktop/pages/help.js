'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/help');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-help-view',
    className: 'pages-help-view',
    events: {
        'click .help-toggle-content': 'helpToggleContent',
        'click .question .icons': 'helpToggleQuestion'
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

        $('h4.icon-arrowdown').toggleClass('icon-arrow-right icon-arrow-down');

        if(element_current.hasClass('faq-open')) {
            $(event.currentTarget).removeClass('icon-arrow-down');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        } else {
            element_current.find('.icon-arrowright').toggleClass('icon-arrow-down icon-arrow-right');
            $('.faq-open').
                toggleClass('faq-open').
                find('.question-content').slideToggle();

            element_current.
                toggleClass('faq-open').
                find('.question-content').slideToggle();
        }
    }

});
