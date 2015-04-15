'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var Categories = require('../../../../../../collections/categories');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    id: 'posting-title-view',
    tagName: 'section',
    className: 'posting-title-view',
    events: {
        'blur #field-title': 'onBlur',
        'keyup #field-title': 'onKeyup',
        'validate': 'onValidate'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    postRender: function() {
        var $field = this.$('#field-title');
        
        $field.trigger('keyup');
        this.parentView.validator.register($field, {
            rules: [{
                id: 'length',
                message: this.dictionary['misc.TitleCharacters_Mob'].replace('<<NUMBER>>', ' ' + 10 + ' '),
                fn: function validate(val) {
                    return val.length < 10;
                }
            }]
        }, true);
    },
    onBlur: function(event) {
        var $field = $(event.target);
        var value = this.trimValue($field);

        if ($field.data('value') !== value) {
            if (this.validate($field)) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
                this.parentView.categorySuggestion(value); //AB test : category-suggestion
            }
            $field.data('value', value);
            $field.trigger('keyup');
        }
    },
    onKeyup: function (event) {
        var $input = $(event.currentTarget);
        var $msg = $input.next('small');
        var count = $msg.text().split(' ');

        count[0] = $input.val().length;
        $msg.text(count.join(' '));
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.validate(this.$('#field-title'), function onComplete(isValidTitle) {
            done(isValid && isValidTitle);
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
    trimValue: function(field) {
        var value = field.val();

        value = $.trim(value);
        field.val(value);
        return value;
    }
});

module.exports.id = 'post/title';
