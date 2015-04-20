'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('landings/asyncbuyer');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var Adapter = require('../../../../../../../shared/adapters/base');

module.exports = Base.extend({
    events: {
        'click [data-next-step]': 'setView',
        'click .rejectTransaction': 'rejectTransaction',
        'click .submit': 'onSubmit',
        'errorsUpdate': 'onErrorsUpdate',
        'changeView': 'toogleView'
    },
    errors: {
        'EMPTY_BUYER_NAME': 'buyer_name',
        'INVALID_BUYER_ADDRESS': 'buyer_email',
        'TRANSACTION_INCOMPLETE': 'buyer_phone',
        'TRANSACTION_WRONG_STATUS': 'buyer_phone',
        'SELLER_MATCHES_BUYER': 'buyer_phone'
    },
    initialize: function(){
        this.fields = {};
        this.enableButton = true;
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onEnd: function(event) {
        this.appView.trigger('posting:end');
    },
    onStart: function(event) {
        this.appView.trigger('posting:start');
    },
    setView: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $btn = $(event.target);
        var $current = $btn.closest('.content-confirm');
        var nextStep = $btn.data('next-step');

        this.$el.trigger('changeView', [$current, nextStep]);
    },
    toogleView: function(event, current, nextStep) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        current.addClass('hide');
        this.$('.' + nextStep).removeClass('hide');
    },
    onSubmit: function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var adapter = new Adapter({});
        var $btn = $(event.target);
        var $current = $btn.closest('.content-confirm');
        var nextStep;
        var transactionId = $btn.data('transactionid');
        var hasBuyerData = $btn.data('hasbuyerdata');
        var itemId = $btn.data('itemid');
        var $form;
        var data;

        _.extend(this.fields, {
            itemId: itemId
        });

        if (!hasBuyerData) {
            $form = this.$('form').serializeArray();
            data = helpers.common.serializeFormJSON($form);

            _.extend(this.fields, {
                buyer: {
                    email: data.buyer_email,
                    name: data.buyer_name,
                    phone: data.buyer_phone,
                }
            });
        }

        if (this.enableButton) {
            this.enableButton = false;
            adapter.request(this.app.req, {
                method: 'POST',
                url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/transaction/', transactionId, '/buyer/confirm'].join(''),
                data: JSON.stringify(this.fields)
            }, {
                timeout: 2000
            }, callback.bind(this));
        }

        function callback(err, res, body) {
            res = JSON.parse(res.responseText);
            var status = body.status;
            var errors = body.error;
            this.enableButton = true;

            this.$('small.error').remove();
            if (status && !errors.length) {
                nextStep = 'success';
                this.$el.trigger('changeView', [$current, nextStep]);
            }
            else {
                if (errors[0].key === 'TRANSACTION_WRONG_STATUS') {
                    $current.addClass('hide');
                    this.$('.error-confirmed .error-message').html(errors[0].message);
                    this.$('.error-confirmed').removeClass('hide');
                }
                else {
                    this.$el.trigger('errorsUpdate', [errors]);
                }
            }
        }
    },
    rejectTransaction: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var adapter = new Adapter({});
        var $btn = $(event.target);
        var nextStep;
        var $current = $btn.closest('.content-confirm');
        var transactionId = $btn.data('transactionid');
        var itemId = $btn.data('itemid');

        if (this.enableButton) {
            this.enableButton = false;
            adapter.request(this.app.req, {
                method: 'POST',
                url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/transaction/', transactionId, '/buyer/reject/transaction'].join(''),
                data: JSON.stringify({
                    itemId: itemId
                })
            }, {
                timeout: 2000
            }, callback.bind(this));
        }

        function callback(err, res, body) {
            res = JSON.parse(res.responseText);
            var status = body.status;
            var errors = body.error;
            this.enableButton = true;

            if (status && !errors.length) {
                nextStep = 'transaction-rejected';
                this.$el.trigger('changeView', [$current, nextStep]);
            }
        }
    },
    onErrorsUpdate: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field;

        _.each(errors, function eachError(obj) {
            $field = this.$('[name="' + this.errors[obj.key] + '"]');
            $field.closest('.field-wrapper').append('<small class="error">' + obj.message + '</small>');
        }.bind(this));
    }
});

module.exports.id = 'landings/asyncbuyer';
