'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-title-view',
    tagName: 'section',
    className: 'posting-title-view',
    rTitle: /[^]{10,}/g,
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
                pattern: this.rTitle
            }]
        }, true);
    },
    onBlur: function(event) {
        var $field = this.$(event.currentTarget);
        var value = this.trimValue($field);

        if ($field.data('value') !== value) {
            this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidTitle) {
                if (isValidTitle) {
                    this.parentView.$el.trigger('fieldSubmit', [$field]);
                    this.parentView.categorySuggestion(value); //AB test : category-suggestion
                }
            }.bind(this)]);
            $field.data('value', value);
            $field.trigger('keyup');
        }
    },
    onKeyup: function (event) {
        var $input = this.$(event.currentTarget);
        var $msg = $input.next('small');
        var count = $msg.text().split(' ');

        count[0] = $input.val().length;
        $msg.text(count.join(' '));
    },
    onValidate: function(event, done, isValid) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = this.$('#field-title');

        this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidTitle) {
            done(isValid && isValidTitle);
        }]);
    },
    trimValue: function(field) {
        var value = field.val();

        value = $.trim(value);
        field.val(value);
        return value;
    }
});

module.exports.id = 'post/title';
