'use strict';

var S = require('string');
var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-description-view',
    className: 'posting-description-view',
    events: {
        'change [name=description]': 'onDescriptionChange',
        'change': 'onChange',
        'keyup [name=title]': 'characterCount',
        'validate': 'onValidate'
    },
    validations: {
        title: {
            message: 'misc.TitleCharacters_Mob',
            minLength: 10
        },
        description: {
            message: 'misc.DescriptionCharacters_Mob',
            minLength: 10
        }
    },
    postRender: function() {
        this.onDescriptionChange();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        if (this.validate($field)) {
            this.parentView.$el.trigger('fieldSubmit', [$field]);
        }
    },
    onDescriptionChange: function() {
        var $description = this.$('[name=description]');

        $description.val(S($description.val()).stripTags().s);
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var isValidTitle = this.validate(this.$('#field-title'));
        var isValidDescription = this.validate(this.$('#field-description'));

        done(isValid && isValidTitle && isValidDescription);
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
    }
});

module.exports.id = 'post/description';
