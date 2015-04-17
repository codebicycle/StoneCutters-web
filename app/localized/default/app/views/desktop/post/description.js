'use strict';

var S = require('string');
var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-description-view',
    tagName: 'section',
    className: 'posting-description-view',
    rDescription: /[^]{10,}/g,
    events: {
        'blur #field-description': 'onBlur',
        'validate': 'onValidate'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    postRender: function() {
        var $field = this.$('#field-description');

        this.stripValue($field);
        this.parentView.validator.register($field, {
            rules: [{
                id: 'length',
                message: this.dictionary['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', ' ' + 10 + ' '),
                fn: this.rDescription
            }]
        }, true);
    },
    onBlur: function(event) {
        var $field = $(event.currentTarget);
        var value = this.stripValue($field);

        if ($field.data('value') !== value) {
            this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidDescription) {
                if (isValidDescription) {
                    this.parentView.$el.trigger('fieldSubmit', [$field]);
                }
            }.bind(this)]);
            $field.data('value', value);
        }
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = this.$('#field-description');

        this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidDescription) {
            done(isValid && isValidDescription);
        }]);
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
