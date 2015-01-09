'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/buyfeaturedad');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'users-buyfeaturedad-page',
    className: 'users-buyfeaturedad-page',
    events: _.extend({}, Base.prototype.events, {
        'click #fad-submit:not(:disabled)': 'onFeatureAd'
    }),
    postRender: function() {
        var checkButtonSubmit = function checkButtonSubmit(event) {
            if (this.$('.fad-check:checked').length) {
                return this.$('#fad-submit').removeAttr('disabled');
            }
            this.$('#fad-submit').attr('disabled', 'disabled');
        }.bind(this);

        this.$('.fad-check').on('click', checkButtonSubmit);
        checkButtonSubmit();
    },
    onFeatureAd: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        function prepare(done) {
            var $feature = this.$('.fad-check:checked');
            var itemId = $feature.data('item');
            var id = $feature.data('id');
            var url;
            
            url = ['/items/', itemId, '/featurable/preorder?languageCode=', this.app.session.get('selectedLanguage')].join('');
            done(url, {
                returnToUrl: helpers.common.link('/success', this.app, {
                    featureAd: true
                }),
                location: this.app.session.get('siteLocation'),
                countryIso: this.app.session.get('location').abbreviation,
                paymentProviderId: $feature.data('payment'),
                conceptId: $feature.data('concept'),
                weeks: this.$('#fad-section-' + id + '-weeks').val()
            });
        }

        function submit(done, url, data) {
            helpers.dataAdapter.post(this.app.req, url, {
                data: data
            }, done.errfcb);
        }

        function success(res, body) {
            var url;

            if (!body || !body.token) {
                throw new Error('no_token');
            }
            window.location = 'http://ads.olx.com/services/featuredad/buy?token=' + body.token;
        }

        function error(err) {
            // TODO Handle error
            console.error(err);
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
    }
});
