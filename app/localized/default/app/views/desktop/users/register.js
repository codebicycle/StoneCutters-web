'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'users_register_view',
    form: {},
    events: {
        'change .text-field': 'onChangeField',
        'focus .text-field': 'clearInputs',
        'errors': 'onErrors',
        'submit': 'onSubmit'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.form = {
            location: this.app.session.get('siteLocation'),
            languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
            identityType: 1
        };
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params || {};

        return _.extend({}, data, {
            params: params
        });
    },
    termsErrors: function(val) {
        if (val) {
            $('fieldset.accept').removeClass('error');
        } else {
            $('fieldset.accept').addClass('error');
        }
    },
    validTerms: function() {
        var input = this.$("input[name='agreeTerms']");

        return input.is(':checked');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var query = {
            withConfirmation: true
        };
        console.log(this.validTerms());
        var post = function(done) {
            helpers.dataAdapter.post(this.app.req, '/users', {
                query: query,
                data: this.form,
                done: done,
                fail: done.fail
            });
        }.bind(this);

        var fail = function(err) {
            // TODO: Improve error handling
            if (err) {
                if (err.responseText) {
                    err = JSON.parse(err.responseText);
                }
                if (_.isArray(err)) {
                    console.log(err);
                    this.$el.trigger('errors', [err]);
                }
            }
        }.bind(this);

        var success = function(item) {

            helpers.common.redirect.call(this.app.router, '/register/success', null, {
                status: 200
            });

        }.bind(this);

        if (this.validTerms()) {
            this.termsErrors(this.validTerms());
            asynquence().or(fail)
                .then(post)
                .val(success);
        }

        this.termsErrors(this.validTerms());

    },
    onChangeField: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var field = event.currentTarget;
        if (field.value) {
            this.form[field.name] = field.value;
        }
        else {
            delete this.form[field.name];
        }
    },
    onErrors: function(event, errors) {
        for (var i = 0; i < errors.length; i++) {
            $('fieldset' + '.' + errors[i].selector)
                .addClass('error')
                .find('.advice')
                .text(errors[i].message);
        }
    },
    clearInputs: function(event) {
        event.preventDefault();
        $('.wrapper.error').removeClass('error');
    }

});

module.exports.id = 'users/register';
