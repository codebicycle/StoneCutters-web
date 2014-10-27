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
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var countries = [
        {"id": 3, "name": "Algeria", "url": "www.olxalgerie.com"},
        {"id": 2, "name": "Argentina",  "url": "www.olx.com.ar"},
        { "id": 12, "name": "Aruba", "url": "www.olx.aw"},
        { "id": 13, "name": "Australia", "url": "www.olx.com.au"},
        { "id": 14, "name": "Austria", "url": "www.olx.at"},
        { "id": 16, "name": "Bahamas", "url": "www.olx.bs"},
        { "id": 18, "name": "Bangladesh", "url": "www.olx.com.bd"},
        { "id": 20, "name": "Belarus", "url": "olx.by"},
        { "id": 21, "name": "Belgium", "url": "www.olx.be"},
        { "id": 22, "name": "Belize", "url": "www.olx.bz"},
        { "id": 26, "name": "Bolivia", "url": "www.olx.com.bo"},
        { "id": 27, "name": "Bosnia and Herzegovina", "url": "www.olx.ba"},
        { "id": 28, "name": "Botswana", "url": "www.olx.co.bw"},
        { "id": 30, "name": "Brazil", "url": "www.olx.com.br"},
        { "id": 33, "name": "Bulgaria", "url": "olx.bg"},
        { "id": 37, "name": "Cameroon", "url": "www.olx.cm"},
        { "id": 38, "name": "Canada", "url": "www.olx.ca"},
        { "id": 43, "name": "Chile", "url": "www.olx.cl"},
        { "id": 44, "name": "China", "url": "www.haibao8.com"},
        { "id": 47, "name": "Colombia", "url": "www.olx.com.co"},
        { "id": 51, "name": "Costa Rica", "url": "www.olx.co.cr"},
        { "id": 53, "name": "Croatia", "url": "www.olx.com.hr"},
        { "id": 55, "name": "Cyprus", "url": "www.olx.com.cy"},
        {"id": 3, "name": "Algeria", "url": "www.olxalgerie.com"},
        {"id": 2, "name": "Argentina",  "url": "www.olx.com.ar"},
        { "id": 12, "name": "Aruba", "url": "www.olx.aw"},
        { "id": 13, "name": "Australia", "url": "www.olx.com.au"},
        { "id": 14, "name": "Austria", "url": "www.olx.at"},
        { "id": 16, "name": "Bahamas", "url": "www.olx.bs"},
        { "id": 18, "name": "Bangladesh", "url": "www.olx.com.bd"},
        { "id": 20, "name": "Belarus", "url": "olx.by"},
        { "id": 21, "name": "Belgium", "url": "www.olx.be"},
        { "id": 22, "name": "Belize", "url": "www.olx.bz"},
        { "id": 26, "name": "Bolivia", "url": "www.olx.com.bo"},
        { "id": 27, "name": "Bosnia and Herzegovina", "url": "www.olx.ba"},
        { "id": 28, "name": "Botswana", "url": "www.olx.co.bw"},
        { "id": 30, "name": "Brazil", "url": "www.olx.com.br"},
        { "id": 33, "name": "Bulgaria", "url": "olx.bg"},
        { "id": 37, "name": "Cameroon", "url": "www.olx.cm"},
        { "id": 38, "name": "Canada", "url": "www.olx.ca"},
        { "id": 43, "name": "Chile", "url": "www.olx.cl"},
        { "id": 44, "name": "China", "url": "www.haibao8.com"},
        { "id": 47, "name": "Colombia", "url": "www.olx.com.co"},
        { "id": 51, "name": "Costa Rica", "url": "www.olx.co.cr"},
        { "id": 53, "name": "Croatia", "url": "www.olx.com.hr"},
        { "id": 55, "name": "Cyprus", "url": "www.olx.com.cy"},
        {"id": 3, "name": "Algeria", "url": "www.olxalgerie.com"},
        {"id": 2, "name": "Argentina",  "url": "www.olx.com.ar"},
        { "id": 12, "name": "Aruba", "url": "www.olx.aw"},
        { "id": 13, "name": "Australia", "url": "www.olx.com.au"},
        { "id": 14, "name": "Austria", "url": "www.olx.at"},
        { "id": 16, "name": "Bahamas", "url": "www.olx.bs"},
        { "id": 18, "name": "Bangladesh", "url": "www.olx.com.bd"},
        { "id": 20, "name": "Belarus", "url": "olx.by"},
        { "id": 21, "name": "Belgium", "url": "www.olx.be"},
        { "id": 22, "name": "Belize", "url": "www.olx.bz"},
        { "id": 26, "name": "Bolivia", "url": "www.olx.com.bo"},
        { "id": 27, "name": "Bosnia and Herzegovina", "url": "www.olx.ba"},
        { "id": 28, "name": "Botswana", "url": "www.olx.co.bw"},
        { "id": 30, "name": "Brazil", "url": "www.olx.com.br"},
        { "id": 33, "name": "Bulgaria", "url": "olx.bg"},
        { "id": 37, "name": "Cameroon", "url": "www.olx.cm"},
        { "id": 38, "name": "Canada", "url": "www.olx.ca"},
        { "id": 43, "name": "Chile", "url": "www.olx.cl"},
        { "id": 44, "name": "China", "url": "www.haibao8.com"},
        { "id": 47, "name": "Colombia", "url": "www.olx.com.co"},
        { "id": 51, "name": "Costa Rica", "url": "www.olx.co.cr"},
        { "id": 53, "name": "Croatia", "url": "www.olx.com.hr"},
        { "id": 55, "name": "Cyprus", "url": "www.olx.com.cy"},
        ];
        
        return _.extend({}, data, {countries:countries});
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
