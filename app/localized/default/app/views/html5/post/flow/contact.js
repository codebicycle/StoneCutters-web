'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var rEmail = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/;
var rPhone = /^[\d -]+$/;
var translations = require('../../../../../../../../shared/translations');
var statsd = require('../../../../../../../../shared/statsd')();
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'post_flow_contact_view disabled',
    tagName: 'section',
    id: 'contact',
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

        location = this.parentView.getItem().getLocation() ? this.parentView.getItem().getLocation().url : undefined;
        if( location !== undefined && !this.neighborhoodSelected) {
            this.onNeighborhood();
        }
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'click .location': 'onLocationClick',
        'locationChange': 'onLocationChange',
        'submit': 'onSubmit'
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
            var options = res.neighborhoods;
            var aux = res.neighborhoods.toJSON();

            $('body > .loading').hide();
            if(aux.length) {
                this.neighborhoods = options;
                this.existNeighborhoods = true;
                this.neighborhoodSelected = false;
            } else {
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
        }


    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.validate()) {
            this.parentView.$el.trigger('flow', [this.id, '']);
        }
    },
    validate: function() {
        var $contactName = this.$('input[name=contactName]').removeClass('error');
        var $phone = this.$('input[name=phone]').removeClass('error');
        var $email = this.$('input[name=email]').removeClass('error');
        var $location = this.$('.location').removeClass('error');
        var failed = false;
        var location = this.app.session.get('location').abbreviation.toLowerCase();

        this.$el.removeClass('error').find('small').remove();
        if (!$contactName.val().length) {
            failed = true;
            $contactName.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.EnterNameForBuyers_Mob'] + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'contactName']);
        }
        if ($phone.val() !== '' && !rPhone.test($phone.val())) {
            failed = true;
            $phone.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.PhoneNumberNotValid'] + '</small>');
        }
        if (!rEmail.test($email.val())) {
            failed = true;
            $email.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['postingerror.InvalidEmail'] + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'email']);
        }
        if(this.existNeighborhoods){
            if(!this.neighborhoodSelected){
                failed = true;
                $location.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['countryoptions.SelectANeighborhood'] + '</small>');
                statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
            }
        }
        else if (!this.parentView.getItem().getLocation()) {
            failed = true;
            $location.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['misc.AdNeedsLocation_Mob'] + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), 'city']);
        }

        if (failed) {
            this.$el.addClass('error');
        }
        return !failed;
    },
    cleanValue: function(value) {
        value = value.replace(/\s{2,}/g, ' ');
        value.trim();
        if (value === value.toUpperCase()) {
            value.toLowerCase();
        }
        return value;
    }
});

module.exports.id = 'post/flow/contact';
