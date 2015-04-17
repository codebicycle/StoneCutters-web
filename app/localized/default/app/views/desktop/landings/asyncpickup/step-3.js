'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'step-3 hide',
    events: {
        'click .posting': 'onSubmit',
        'click [name="hasinfo"]': 'showForm'
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
        var contactedBySeller = (data.hasinfo === 'link') ? true : false;

        _.extend(fieldsValidate, {
            contactedBySeller: contactedBySeller,
            buyer: {
                email: data.buyer_email,
                name: data.buyer_name,
                phone: data.buyer_phone
            }
        });

        if (this.parentView.enableButton && data.hasinfo === 'form') {
            btn.addClass('disable');
            this.parentView.enableButton = false;
            this.parentView.$el.trigger('validateFields', [fieldsValidate, step]);
        }
        else {
            _.extend(this.parentView.fields, {
                contactedBySeller: contactedBySeller
            });
            if (contactedBySeller) {
                this.parentView.$el.trigger('changeView', [step, 'next']);
            }
            else {
                $('.fork-form .field-wrapper').addClass('fork');
                this.$('.error-alert').removeClass('hide');
            }
        }
    },
    showForm: function(event) {
        var $ele = $(event.target);
        var value = this.$('[name="hasinfo"]:checked').val();

        $ele.closest('.fork').removeClass('fork');
        this.$('.error-alert').remove();

        if (value === 'form') {
            this.$('.buyer-form').removeClass('hide');
        }
        else {
            this.$('.buyer-form').addClass('hide');
        }
    }
});

module.exports.id = 'landings/asyncpickup/step-3';