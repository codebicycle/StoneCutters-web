
'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('post/customercontact');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    events: {
        'click .customer-help-tab': 'onSlideClick'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var customerContact = config.getForMarket(location.url, ['post_customer_contact'], '');

        return _.extend({}, data, {
            customerContact: customerContact
        });
    },
    onSlideClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $currentTab = $(event.currentTarget);
        var $slide = $currentTab.parent('.customer-contact-service');
        $slide.toggleClass('active');
        $slide.children('icon-arrow').toggleClass('icon-arrow-left icon-arrow');
    }
});
