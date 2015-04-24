'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'step-2 hide',
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

        this.parentView.dimensions = this.$('[name=dimensionsId] option:selected').text();

        _.extend(fieldsValidate, {
            itemId: data.itemId,
            price: data.price,
            locker: {
                dimensionsId: data.dimensionsId,
                kioscoId: 1
            },
            seller: {
                email: data.seller_email,
                phone: data.seller_phone
            }
        });

        btn.addClass('disable');
        if (this.parentView.enableButton) {
            this.parentView.enableButton = false;
            this.parentView.$el.trigger('validateFields', [fieldsValidate, step]);
        }
    }
});

module.exports.id = 'landings/asyncpickup/step-2';