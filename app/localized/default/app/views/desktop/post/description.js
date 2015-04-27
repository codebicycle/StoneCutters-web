'use strict';

var S = require('string');
var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-description-view',
    tagName: 'section',
    className: 'posting-description-view',
    selector: '#field-description',
    rDescription: /[^]{10,}/g,
    events: {
        'validate': onValidate,
        'blur #field-description': onBlur
    },
    initialize: initialize,
    postRender: postRender,
    val: val
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function postRender() {
    var $field = this.$(this.selector);

    this.val($field);
    this.parentView.$el.trigger('fieldValidationRegister', [$field, {
        rules: [{
            id: 'length',
            message: this.dictionary['misc.DescriptionCharacters_Mob'].replace('<<NUMBER>>', ' ' + 10 + ' '),
            pattern: this.rDescription
        }]
    }, true]);
}

function val(field) {
    var value = field.val();

    value = S(value).stripTags().s;
    value = $.trim(value);
    field.val(value);
    return value;
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);

    this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidField) {
        done(isValid && isValidField);
    }]);
}

function onBlur(event) {
    var $field = $(event.currentTarget);
    var value = this.val($field);

    if ($field.data('value') !== value) {
        this.$el.trigger('validate', [function onComplete(isValidField) {
            if (isValidField) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
            }
        }.bind(this), true]);
        $field.data('value', value);
    }
}

module.exports.id = 'post/description';
