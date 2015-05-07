'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../../shared/config');
var translations = require('../../../../../../../../shared/translations');
var Mailgun = require('../../../../../../../modules/validator/models/mailgun');
var Metric = require('../../../../../../../modules/metric');
var statsd = require('../../../../../../../../shared/statsd')();
var rEmail = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/;
var rPhone = /^[\d -]+$/;

module.exports = Base.extend({
    className: 'post_flow_contact_view disabled',
    tagName: 'section',
    id: 'contact',
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'click .location': 'onLocationClick',
        'locationChange': 'onLocationChange',
        'submit': 'onSubmit',
        'blur [name="email"]': 'onEmailValidate',
        'click .did-you-mean': 'fillEmail',
        'validate': 'onValidate'
    },
    initialize: function() {
        Base.prototype.initialize.apply(this, arguments);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var item = this.parentView.getItem ? this.parentView.getItem() : undefined;
        var current = this.app.session.get('location').current || {};
        var user = this.app.session.get('user');
        var locationUrl = this.app.session.get('location').url;
        var isPhoneMandatory = config.getForMarket(locationUrl, ['validator', 'phone', 'enabled'], false);
        var hintEmailInfo = config.getForMarket(locationUrl, ['hints','html5','email'], false);
        var hint;
        var emailIcon;

        if(hintEmailInfo.enabled) {
            hint = hintEmailInfo.hint;
            emailIcon = (hintEmailInfo.icon)? hintEmailInfo.icon: 'icon-exclamation';
        }
        return _.extend({}, data, {
            fields: this.fields || [],
            hint: hint,
            emailIcon: emailIcon,
            form: item ? {
                values: _.object(_.map(this.fields || [], function each(field) {
                    return field.name;
                }, this), _.map(this.fields, function each(field) {
                    var value = item.get(field.name);

                    if (field.name === 'email' && typeof value === 'boolean' && user) {
                        value = user.email;
                    }
                    return value;
                }, this))
            } : {},
            location: item ? item.getLocation() || current : current,
            isPhoneMandatory: isPhoneMandatory.toString()
        });
    },
    postRender: function() {
        var current = this.app.session.get('location').current;
        var user = this.app.session.get('user');
        var location;

        if (!this.parentView.getItem().getLocation() && current) {
            this.parentView.getItem().set('location', current);
        }
        if (typeof this.parentView.getItem().get('email') === 'boolean' && user) {
            this.parentView.getItem().set('email', user.email || true);
        }
        this.$('[name=email]').change();

        location = this.parentView.getItem().getLocation();
        if( location && location.url && !this.neighborhoodSelected) {
            this.onNeighborhood();
        }
        if (!this.metric) {
            this.metric = new Metric({}, {
                app: this.app
            });
        }
    },
    onNeighborhood: function() {
        asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function prepare(done) {
            $('body > .loading').show();
            done({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        level: 'cities',
                        type: 'neighborhoods',
                        location: this.parentView.getItem().getLocation().url,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            });
        }

        function fetch(done, spec) {
            this.app.fetch(spec, {
                readFromCache: false
            }, done.errfcb);
        }

        function success(res) {
            $('body > .loading').hide();
            if (res.neighborhoods && res.neighborhoods.length) {
                this.neighborhoods = res.neighborhoods;
                this.existNeighborhoods = true;
                this.neighborhoodSelected = false;
            }
            else {
                this.existNeighborhoods = false;
                this.neighborhoodSelected = true;
            }
        }

        function fail(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [this.dictionary['misc.ContactDetails_Mob'], this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var errors = {};

        _.each(this.fields, function each(field) {
            var $field = this.$('[name=' + field.name + ']');

            if (field.name == 'email' && $field.hasClass('error')) {
                errors[field.name] = field.label; // Check for translation since we are just passing the field label as error
            }
            if (field.name == 'phone' && $field.hasClass('error')) {
                errors[field.name] = field.label; // Check for translation since we are just passing the field label as error
            }
        }, this);
        this.$el.addClass('disabled');
        this.parentView.$el.trigger('contactSubmit', [errors, this.dictionary['postingerror.InvalidLocation']]);
    },
    onFieldsChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = this.parentView.getFields().contactInformation;
        this.render();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        $field.val(this.cleanValue($field.val()));
        this.parentView.getItem().set($field.attr('name'), $field.val());
    },
    onLocationClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id, 'location']);
    },
    onLocationChange: function(event, error, neighborhoodSelected) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');

        this.neighborhoodSelected = neighborhoodSelected;
        this.render();
        if (show) {
            this.$el.trigger('show');
            this.$el.trigger('validate');
        }
    },
    onValidate: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var promise = asynquence(true).or(fail.bind(this));

        options = options || {};

        this.validate(promise);
        promise.val(success.bind(this));

        function success(isValid) {
            if (options.success) {
                options.success(isValid);
            }
        }

        function fail() {
            if (options.fail) {
                options.fail();
            }
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.trigger('validate', [{
            success: success.bind(this)
        }]);

        function success(isValid) {
            if (isValid) {
                this.parentView.$el.trigger('flow', [this.id, '']);
            }
            else {
                this.$el.addClass('error');
            }
        }
    },
    validate: function(promise) {
        var location = this.app.session.get('location').abbreviation;

        promise.then(prepare.bind(this));
        promise.then(validateContactName.bind(this));
        promise.then(validatePhone.bind(this));
        promise.then(validateEmail.bind(this));
        promise.then(validateLocation.bind(this));

        function prepare(done, isValid) {
            this.$el.removeClass('error').find('small').remove();
            done(isValid);
        }

        function validateContactName(done, isValid) {
            var $contactName = this.$('input[name=contactName]').removeClass('error');

            if (!$contactName.val().length) {
                isValid = false;
                $contactName.addClass('error').after('<small class="error">' + this.dictionary['misc.EnterNameForBuyers_Mob'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'contactName']);
            }
            done(isValid);
        }

        function validatePhone(done, isValid) {
            var locationUrl = this.app.session.get('location').url;
            var isPhoneMandatory = config.getForMarket(locationUrl, ['validator', 'phone', 'enabled'], false);
            var $phone = this.$('input[name=phone]').removeClass('error');

            if ((isPhoneMandatory && $phone.val() === '') || ($phone.val() !== '' && !rPhone.test($phone.val()))) {
                isValid = false;
                $phone.addClass('error').after('<small class="error">' + this.dictionary['misc.PhoneNumberNotValid'] + '</small>');
            }
            done(isValid);
        }

        function validateEmail(done, isValid) {
            var locationUrl = this.app.session.get('location').url;
            var $email = this.$('input[name=email]').removeClass('error');

            if (!rEmail.test($email.val())) {
                isValid = false;
                $email.addClass('error').after('<small class="error">' + this.dictionary['postingerror.InvalidEmail'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'email']);
            }
            else if (Mailgun.isEnabled(this.app)){
                return this.validateEmail({
                    success: function success(data) {
                        done(isValid && data.is_valid);
                        this.successValidation(data);
                    }.bind(this),
                    error: function error() {
                        this.validationError();
                        done(isValid);
                    }.bind(this)
                });
            }
            done(isValid);
        }

        function validateLocation(done, isValid) {
            var $location = this.$('.location').removeClass('error');

            if (this.existNeighborhoods) {
                if (!this.neighborhoodSelected) {
                    isValid = false;
                    $location.addClass('error').after('<small class="error">' + this.dictionary['countryoptions.SelectANeighborhood'] + '</small>');
                    statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
                }
            }
            else if (!this.parentView.getItem().getLocation()) {
                isValid = false;
                $location.addClass('error').after('<small class="error">' + this.dictionary['misc.AdNeedsLocation_Mob'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
            }

            done(isValid);
        }
    },
    validateEmail: function(options) {
        var locationUrl = this.app.session.get('location').url;
        var currentPage = this.editing ? 'editing' : 'posting';
        var $field = this.$('[name="email"]');
        var value = $field.val();

        if (this.emailValid) {
            this.emailValid = null;
        }
        this.emailValid = new Mailgun({
            element: $field,
            currentPage: currentPage

        }, {
            app: this.app
        });

        if (this.emailValid.isEnabled() && value) {
            this.emailValid.run(_.defaults({}, options || {}, {
                success: this.successValidation.bind(this),
                error: this.validationError.bind(this)
            }));
        }
        else if (options && options.success) {
            options.success({
                is_valid: true
            });
        }
    },
    cleanValue: function(value) {
        value = value.replace(/\s{2,}/g, ' ');
        value.trim();
        if (value === value.toUpperCase()) {
            value.toLowerCase();
        }
        return value;
    },
    onEmailValidate: function(event) {
        this.validateEmail();
    },
    successValidation: function (data) {
        var $field = this.$('input[name=email]').removeClass('error');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };
        var isError = '';

        $('small.did-you-mean').remove();

        if (!data.is_valid) {
            isError = 'error ';

            $field.addClass('error');
            if (!data.did_you_mean) {
                if ($field.siblings('small.error')) {
                    $field.removeClass('error').siblings('small').remove();
                }
                $field.addClass('error').after('<small class="error">' + this.dictionary["postingerror.InvalidEmail"] + '</small>');
            }
        }
        else {
            $field.removeClass('error').siblings('small').remove();
        }
        if (data.did_you_mean) {
            $field.after('<small class="' + isError + 'message did-you-mean" data-content="' + data.did_you_mean + '">¿Has querido decir <a href="#">' + data.did_you_mean + '</a>?</small>');
        }
        this.metric.increment(['growth', 'posting', ['validation', 'mailgun', data.is_valid ? 'success' : 'error']]);
    },
    validationError: function() {
        this.metric.increment(['growth', 'posting', ['mailgun', 'apierror']]);
    },
    fillEmail: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = this.$('input[name=email]');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };

        if ($('small.did-you-mean')) {
            $field.parent().find('small.did-you-mean').remove();
        }

        this.metric.increment(['growth', 'posting', ['mailgun', 'didyoumean']]);
        $field.val($(event.currentTarget).data('content'));
        this.parentView.getItem().set($field.attr('name'), $field.val());
        this.$el.trigger('validate');
    }
});

module.exports.id = 'post/flow/contact';
