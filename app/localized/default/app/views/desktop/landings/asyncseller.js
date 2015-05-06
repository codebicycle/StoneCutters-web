'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('landings/asyncseller');
var config = require('../../../../../../../shared/config');
var Adapter = require('../../../../../../../shared/adapters/base');

module.exports = Base.extend({
    events: {
        'changeView': 'toogleView',
        'validateFields': 'onValidateFields',
        'errorsUpdate': 'onErrorsUpdate',
        'progressBar': 'onProgressBar',
        'updateData': 'onUpdateData',
        'track': 'onTrack'
    },
    errors: {
        'INVALID_JSON': '',
        'INVALID_BUYER_FORMAT': '',
        'INVALID_LOCKER': '',
        'INVALID_LOCKER_FORMAT': '',
        'INVALID_SELLER_PHONE': 'seller_phone',
        'INVALID_BUYER_PHONE': 'buyer_phone',
        'EMPTY_BUYER_NAME': 'buyer_name',
        'EMPTY_BUYER_EMAIL': 'buyer_email',
        'INVALID_BUYER_ADDRESS': 'buyer_email',
        'BUYER_BOUNCED': 'buyer_email',
        'NON_NUMERIC_PRICE': 'price',
        'NEGATIVE_PRICE': 'price',
        'PRICE_TOO_HIGH': 'price',
        'LOCKER_UNAVAILABLE': 'dimensionsId',
        'ITEM_HAS_ACTIVE_TRANSACTIONS': 'dimensionsId'
    },
    initialize: function(){
        this.fields = {};
        this.enableButton = true;
        this.currentStep = 'step-1';
        this.dimensions = '';
    },
    onExit: function(event) {
        var timeDiff = _.now() - this.startTime;

        this.$el.trigger('track', [{
            track_page: this.currentStep,
            bounce_time: Math.ceil((timeDiff / 1000))
        }, {
            async: false
        }]);
    },
    postRender: function() {
        $(window).on('unload', {
            async: false
        }, this.onExit.bind(this));
        this.startTime = _.now();
        this.startStepTime = _.now();
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onEnd: function(event) {
        this.appView.trigger('posting:end');
    },
    onStart: function(event) {
        this.appView.trigger('posting:start');
    },
    toogleView: function(event, step, pos) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var current = step;
        step = pos === 'next' ? (step + 1) : pos;

        this.$el.trigger('track', [{
            track_page: this.currentStep,
            spend_time: this.setTimeDiff()
        }]);
        this.currentStep = 'step-' + step;
        this.startStepTime = _.now();

        this.$('.step-' + current).addClass('hide');
        if (step === 4) {
            this.$el.trigger('updateData');
        }
        this.$('.step-' + step).removeClass('hide');
        this.$el.trigger('progressBar', [step]);
    },
    setTimeDiff: function() {
        var timeDiff = _.now() - this.startStepTime;
        
        return Math.ceil((timeDiff / 1000));
    },
    onValidateFields: function(event, data, step) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var adapter = new Adapter({});
        adapter.request(this.app.req, {
            method: 'POST',
            url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/validate'].join(''),
            data: JSON.stringify(data)
        }, {
            timeout: 2000
        }, callback.bind(this));

        function callback(err, res, body) {
            res = JSON.parse(res.responseText);
            var status = res.status;
            var errors = res.error;
            this.enableButton = true;

            this.$('.posting').removeClass('disable');
            this.$('small.error').remove();
            if (status && !errors.length) {
                _.extend(this.fields, data);
                this.$el.trigger('changeView', [step, 'next']);
            }
            else {
                this.$el.trigger('errorsUpdate', [errors]);
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
    },
    onUpdateData: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('[data-price]').html('$' + this.fields.price);
        this.$('[data-dimensions]').html(this.dimensions);

        if (!this.fields.contactedBySeller) {
            this.$('.buyer-data').removeClass('hide');
            this.$('[data-buyer]').html(this.fields.buyer.name + ' (' + this.fields.buyer.email + ')');
        }
        else {
            this.$('.buyer-data').addClass('hide');
        }
        if (this.fields.seller.phone) {
            this.$('[data-seller]').html('o llamandote a <b>' + this.fields.seller.phone + '</b>');
        }
        else {
            this.$('[data-seller]').remove();
        }
    },
    onProgressBar: function(event, step) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var current = (step - 1);

        this.$('.progress-bar').removeClass('first complete');
        this.$('.step').removeClass('big');
        this.$('.progress-bar li').removeClass('active');

        if (step === 2) {
            this.$('.step.point-' + step + ',' + '.step.point-' + (step + 1)).removeClass('active');
        }
        else if (step === 3) {
            this.$('.step.point-' + step).removeClass('active');
            this.$('.progress-bar').addClass('first');
        }
        else {
            this.$('.progress-bar').addClass('complete');
        }
        this.$('.step.point-' + current).addClass('active');
        this.$('.step.point-' + current).addClass('big');
        this.$('.point-' + current).addClass('active');
    },
    onTrack: function(event, query, options) {
        query = _.defaults({
            clientId: this.app.session.get('clientId'),
            project: 'asyncpickup',
            t: Math.ceil((_.now() / 1000)),
            user_email: $('[name=seller_email]').val(),
            itemId: $('[name=itemId]').val()
        }, query || {});

        options = _.defaults({
            type: 'GET',
            url: 'http://tracking.olx-st.com/h/minv/',
            dataType: 'json',
            timeout: 2000,
            cache: false,
            data: query
        }, options || {});

        $.ajax(options, $.noop);
    }
});

module.exports.id = 'landings/asyncseller';
