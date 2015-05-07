
'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('post/customercontact');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    events: {
        'click .customer-help-tab': onClickSlide
    },
    getTemplateData: getTemplateData
});

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var customerContact = config.getForMarket(this.app.session.get('location').url, ['post_customer_contact'], '');

    return _.extend({}, data, {
        customerContact: customerContact
    });
}

function onClickSlide(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $tab = $(event.currentTarget);
    var $slide = $tab.parent('.customer-contact-service');

    $slide.toggleClass('active');
    $slide.children('icon-arrow').toggleClass('icon-arrow-left icon-arrow');
}
