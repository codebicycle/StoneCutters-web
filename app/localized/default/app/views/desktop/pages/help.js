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
        'click .question .icons': 'helpToggleQuestion',
        'click [data-navigate]': 'navigate'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');

        var mailDomain = config.get(['mails', 'domain', location.url], false) || location.url.replace('www.', '');

        var support = config.get(['mails', 'support', location.url], 'support') + '@' + mailDomain;
        var legal = config.get(['mails', 'legal', location.url], 'legal') + '@' + mailDomain;
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];

        return _.extend({}, data, {
            mails: {
                support: support,
                legal: legal,
            },
            selectedLanguage : selectedLanguage
        });
    },
    postRender: function() {
        var $slide = $('.user-ads ul li');
        var slideWrapperWidth = $slide.outerWidth() * $slide.length;
        $('.user-ads ul').width(slideWrapperWidth);

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
    },
    navigate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $current = $(event.currentTarget);
        var direction = $current.data('navigate');
        var $slideWrapper = $('[data-items-slide]');
        var $slide = $('.user-ads ul li');
        var slideWidth = $slide.outerWidth();
        var slideWrapperPos = $slideWrapper.position().left;
        var slideLength = $slide.length;
        var maxLeftPosition = -(slideLength - 6) * slideWidth;
        var pxToMove = 0;

        if(direction == 'right' && slideWrapperPos !== maxLeftPosition) {
            pxToMove = slideWrapperPos - slideWidth;
        }
        else if(direction == 'left' && slideWrapperPos !== 0) {
            pxToMove = slideWrapperPos + slideWidth;
        }
        else if(slideWrapperPos === 0) {
            pxToMove = maxLeftPosition;
        }

        $slideWrapper.animate({
            'left': pxToMove + 'px'
        }, 100);

        

        
    }
});
