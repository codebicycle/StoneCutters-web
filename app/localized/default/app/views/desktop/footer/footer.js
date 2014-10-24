'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer-view',
    className: 'footer-view',
     events: {
        'click [data-footer-sliderUp]': 'slideUpContent'
    },
    slideUpContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var element = $(event.currentTarget);
        element.parent().addClass('active');
        $('.' + element.attr('data-footer-sliderUp')).show();
    },
});

module.exports.id = 'footer/footer';
