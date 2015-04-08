'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();
var Categories = require('../../../../../../collections/categories');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-title-view',
    className: 'posting-title-view',
    events: {
        'blur #field-title': 'onBlur',
        'keyup #field-title': 'characterCount',
        'validate': 'onValidate'
    },
    validations: {
        title: {
            message: 'misc.TitleCharacters_Mob',
            minLength: 10
        }
    },
    postRender: function() {
        this.$('#field-title').trigger('keyup');
    },
    onBlur: function(event) {
        var $field = $(event.target);
        var value = this.trimValue($field);

        if ($field.data('value') !== value) {
            if (this.validate($field)) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
                this.parentView.categorySelector(value); //AB test : category-selector
            }

            $field.data('value', value);

            this.$('#field-title').trigger('keyup');
        }
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var isValidTitle = this.validate(this.$('#field-title'));

        done(isValid && isValidTitle);
    },
    characterCount: function (event) {
        var $input = $(event.currentTarget);
        var $msg = $input.next('small');
        var count = $msg.text().split(' ');

        count[0] = $input.val().length;
        $msg.text(count.join(' '));
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
    trimValue: function(field) {
        var value = field.val();

        value = $.trim(value);
        field.val(value);

        return value;
    }
});

module.exports.id = 'post/title';
