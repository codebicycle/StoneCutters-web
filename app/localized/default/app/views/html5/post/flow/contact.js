'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../../shared/config');
var translations = require('../../../../../../../../shared/translations');
var EmailValidator = require('../../../../../../../modules/emailValidator');
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
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var item = this.parentView.getItem ? this.parentView.getItem() : undefined;
        var current = this.app.session.get('location').current || {};
        var user = this.app.session.get('user');

        return _.extend({}, data, {
            fields: this.fields || [],
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
            location: item ? item.getLocation() || current : current
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
    },
    onNeighborhood: function() {
        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        level: 'cities',
                        type: 'neighborhoods',
                        location: this.parentView.getItem().getLocation().url,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
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
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations.get(this.app.session.get('selectedLanguage'))['misc.ContactDetails_Mob'], this.id]);
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
        this.parentView.$el.trigger('contactSubmit', [errors, translations.get(this.app.session.get('selectedLanguage'))['postingerror.InvalidLocation']]);
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
    onLocationChange: function(event, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');

        this.neighborhoodSelected = true;
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
                $contactName.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.EnterNameForBuyers_Mob'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'contactName']);
            }
            done(isValid);
        }

        function validatePhone(done, isValid) {
            var $phone = this.$('input[name=phone]').removeClass('error');
            
            if ($phone.val() !== '' && !rPhone.test($phone.val())) {
                isValid = false;
                $phone.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.PhoneNumberNotValid'] + '</small>');
            }
            done(isValid);
        }

        function validateEmail(done, isValid) {
            var $email = this.$('input[name=email]').removeClass('error');
            
            if (!rEmail.test($email.val())) {
                isValid = false;
                $email.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['postingerror.InvalidEmail'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'email']);
            }
            else {
                return this.onEmailValidate({
                    success: function onSuccess(data) {
                        done(data.is_valid);
                        this.successValidation(data);
                    }.bind(this),
                    error: function onError() {
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
                    $location.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['countryoptions.SelectANeighborhood'] + '</small>');
                    statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
                }
            }
            else if (!this.parentView.getItem().getLocation()) {
                isValid = false;
                $location.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.AdNeedsLocation_Mob'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
            }

            done(isValid);
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
    onEmailValidate: function(options) {
        var locationUrl = this.app.session.get('location').url;
        
        if (config.getForMarket(locationUrl, ['validator', 'email', 'enabled'], false)) {
            var currentPage = this.editing ? 'editing' : 'posting';
            var $field = this.$('[name="email"]');
            var value = $field.val();

            if (this.emailValid) {
                this.emailValid = null;
            }
            options = _.defaults({}, options, {
                element: $field,
                success: this.successValidation.bind(this),
                error: this.validationError.bind(this),
                currentPage: currentPage
            });

            this.emailValid = new EmailValidator(options, {
                app: this.app
            });            
        }
    },
    successValidation: function (data) {
        var $field = this.$('input[name=email]').removeClass('error');
        var category = this.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };
        var isError = '';

        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        
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
            statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'error', 'email', 'success', this.app.session.get('platform')]);
        }
        else {
            statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'success', 'email', 'success', this.app.session.get('platform')]);
        }
        if (data.did_you_mean) {
            $field.after('<small class="' + isError + 'message did-you-mean" data-content="' + data.did_you_mean + '">¿Has querido decir <a href="#">' + data.did_you_mean + '</a>?</small>');
        }
    },
    validationError: function() {
        statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'error', 'email', 'error', this.app.session.get('platform')]);
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
        
        statsd.increment([this.app.session.get('location').abbreviation, this.emailValid.get('currentPage'), 'success', 'email', 'click', this.app.session.get('platform')]);
        $field.val($(event.currentTarget).data('content'));
        this.parentView.getItem().set($field.attr('name'), $field.val());
        this.$el.trigger('validate');
    }
});

module.exports.id = 'post/flow/contact';
