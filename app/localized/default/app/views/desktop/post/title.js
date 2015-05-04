'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-title-view',
    tagName: 'section',
    className: 'posting-title-view',
    selector: '#field-title',
    rTitle: /[^]{10,}/g,
    events: {
        'validate': onValidate,
        'blur #field-title': onBlur,
        'keyup #field-title': onKeyup
    },
    initialize: initialize,
    postRender: postRender,
    getVal: getVal
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function postRender() {
    var $field = this.$(this.selector);
    
    $field.trigger('keyup');
    this.parentView.$el.trigger('fieldValidationRegister', [$field, {
        rules: [{
            id: 'length',
            message: this.dictionary['misc.TitleCharacters_Mob'].replace('<<NUMBER>>', ' ' + 10 + ' '),
            pattern: this.rTitle
        }]
    }, true]);
}

function getVal(field) {
    var value = field.val();

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
    var $field = this.$(event.currentTarget);
    var value = this.getVal($field);

    if ($field.data('value') !== value) {
        this.$el.trigger('validate', [function onComplete(isValidField) {
            if (isValidField) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
                this.parentView.categorySuggestion(value); //AB test : category-suggestion
            }
        }.bind(this), true]);
        $field.data('value', value);
        $field.trigger('keyup');
    }
}

function onKeyup(event) {
    var $field = this.$(event.currentTarget);
    var $msg = $field.next('small');
    var count = $msg.text().split(' ');

    count[0] = $field.val().length;
    $msg.text(count.join(' '));
}

module.exports.id = 'post/title';
