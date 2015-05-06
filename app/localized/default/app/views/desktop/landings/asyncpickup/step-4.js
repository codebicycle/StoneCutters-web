'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../../shared/config');
var helpers = require('../../../../../../../helpers');
var Adapter = require('../../../../../../../../shared/adapters/base');

module.exports = Base.extend({
    className: 'step-4 hide',
    events: {
        'click .posting': 'onSubmit',
        'click .edit': 'editForm'
    },
    onSubmit: function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var btn = $(event.target);
        var adapter = new Adapter({});
        var data = this.parentView.fields;
        var itemId = btn.data('itemid');

        btn.addClass('disable');
        if (this.parentView.enableButton) {
            this.$el.trigger('track', [{
                track_page: 'step-4',
                event: 'click-step-4'
            }]);
            this.parentView.enableButton = false;

            adapter.request(this.app.req, {
                method: 'POST',
                url: [config.get(['mario', 'protocol']), '://', config.get(['mario', 'host']), '/async-pickup/transaction/create'].join(''),
                data: JSON.stringify(data)
            }, {
                timeout: 2000
            }, callback.bind(this));
        }

        function callback(err, body, res) {
            this.parentView.enableButton = true;

            this.$('.posting').removeClass('disable');

            this.parentView.$('.steps').addClass('hide');
            if (res.status) {
                this.parentView.currentStep = 'success-page';
                this.$el.trigger('track', [{
                    track_page: 'step-4',
                    spend_time: this.parentView.setTimeDiff(),
                    transactionId: res.extra.transactionId
                }]);

                this.parentView.$('.success').removeClass('hide');
                if (this.parentView.fields.contactedBySeller) {
                    this.parentView.$('.buyer-link').removeClass('hide');
                    this.parentView.$('.success input.link').val('http://www.olx.com.ar/asyncbuyer?transactionId=' + res.extra.transactionId + '&itemId=' + itemId);
                    this.parentView.$('.success input.link').select();
                }
            }
            else {
                this.parentView.currentStep = 'error-page';
                this.$el.trigger('track', [{
                    track_page: 'step-4',
                    spend_time: this.parentView.setTimeDiff(),
                    error_key: res.error[0].message
                }]);
                this.parentView.$('.error-page .msg-error').html(res.error[0].message);
                this.parentView.$('.error-page').removeClass('hide');
            }
        }
    },
    editForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var step = $(event.target).data('step');
        var editInfo = $(event.target).data('edit');

        this.$el.trigger('track', [{
            track_page: 'step-4',
            edit_step: step + '-' + editInfo
        }]);

        this.parentView.$el.trigger('changeView', [4, step]);
    }
});

module.exports.id = 'landings/asyncpickup/step-4';