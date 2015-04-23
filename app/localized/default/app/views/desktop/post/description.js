'use strict';

var S = require('string');
var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-description-view',
    className: 'posting-description-view',
    events: {
        'blur #field-description': 'onBlur',
        'validate': 'onValidate'
    },
    validations: {
        description: {
            message: 'misc.DescriptionCharacters_Mob',
            minLength: 10
        }
    },
    postRender: function() {
        var $field = this.$('#field-description');

        this.stripValue($field);
    },
    onBlur: function(event) {
        var $field = $(event.target);
        var value = this.stripValue($field);

        if ($field.data('value') !== value) {
            if (this.validate($field)) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
            }

            $field.data('value', value);
        }
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var isValidDescription = this.validate(this.$('#field-description'));

        done(isValid && isValidDescription);
    },
    validate: function(field) {
        var $field = this.$(field);
        var name = $field.attr('name');
        var options = this.validations[name];
        var location = this.app.session.get('location').abbreviation;
        var valid = true;
        var message;

        if (!options) {
            return valid;
        }
        this.parentView.$el.trigger('errorClean', [$field]);
        if ($field.val().length < options.minLength) {
            valid = false;
            message = translations.get(this.app.session.get('selectedLanguage'))[options.message];
            $field.closest('.field-wrapper').addClass('error').removeClass('success');
            $field.parent().append('<small class="error message">' + message.replace('<<NUMBER>>', ' ' + options.minLength + ' ') + '</small>');
            statsd.increment([location, 'posting', 'invalid', this.app.session.get('platform'), name]);
        }
        return valid;
    },
    stripValue: function(field) {
        var value = field.val();

        value = S(value).stripTags().s;
        value = $.trim(value);
        field.val(value);

        return value;
    }
});

module.exports.id = 'post/description';
