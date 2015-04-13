'use strict';

var S = require('string');
var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-description-view',
    tagName: 'section',
    className: 'posting-description-view',
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
                fn: function validate(val) {
                    return val.length < 10;
                }
            }]
        }, true);
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

        this.validate(this.$('#field-description'), function onComplete(isValidDescription) {
            done(isValid && isValidDescription);
        });
    },
    validate: function(field, callback) {
        var $field = $(field);
        var valid = this.parentView.validator.validate($field);
        var details = this.parentView.validator.details($field);
        
        this.parentView.$el.trigger('hideError', [$field]);
        if (!valid && details && details.length) {
            this.parentView.$el.trigger('showError', [$field, {
                message: details.pop()
            });
        }
        (callback || $.noop)(valid);
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
