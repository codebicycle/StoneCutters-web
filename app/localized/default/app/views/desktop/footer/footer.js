'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer-view',
    className: 'footer-view',
     events: {
        'click [data-footer-slideUp]': 'slideUpContent',
        'click [data-footer-slidedown]': 'slideDownContent'
    },
    slideUpContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var element = $(event.currentTarget);

        $('[data-slide-content] > div').css('display','none');
        $('[data-footer-slideUp]').parent().removeClass('active');

        element.parent().addClass('active');
        $('.' + element.attr('data-footer-slideUp')).slideToggle();
    },
    slideDownContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var element = $(event.currentTarget),
        classTochange = element.attr('data-footer-slideDown');
        $('a[data-footer-slideUp="' + classTochange + '"]').parent().removeClass('active');
        $('.' + element.attr('data-footer-slideDown')).slideToggle();
    },
});

module.exports.id = 'footer/footer';
