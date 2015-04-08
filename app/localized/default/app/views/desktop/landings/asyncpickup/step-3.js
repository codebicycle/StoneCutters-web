'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'step-3 hide',
    events: {
        'click .posting': 'onSubmit'
    },
    onSubmit: function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var btn = $(event.target);
        var $form = this.$('form').serializeArray();
        var data = helpers.common.serializeFormJSON($form);
        var step = $(event.target).data('step');
        var fieldsValidate = {};

        _.extend(fieldsValidate, {
            buyer: {
                email: data.buyer_email,
                name: data.buyer_name,
                phone: data.buyer_phone
            }
        });

        btn.addClass('disable');
        if (this.parentView.enableButton) {
            this.parentView.enableButton = false;
            this.parentView.$el.trigger('validateFields', [fieldsValidate, step]);
        }
    }
});

module.exports.id = 'landings/asyncpickup/step-3';