'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    id: 'posting-contact-phone-view',
    tagName: 'section',
    className: 'posting-contact-phone-view',
    selector: 'field-phone',
    rEmail: /[^\d]/gi,
    events: {
        'change': onChange,
        'validate': onValidate,
        'change [name="phone"]': onChangePhone
    },
    getTemplateData: getTemplateData,
    postRender: postRender,
    isMandatory: isMandatory
});

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);

    return _.extend({}, data, {
        isMandatory: this.isMandatory()
    });
}

function postRender() {
    var $field = this.$(this.selector);

    if (this.isMandatory()) {
        this.parentView.$el.trigger('fieldValidationRegister', [$field, {
            required: {
                message: 'postingerror.PleaseCompleteThisField'
            }
        }, true]);
    }
}

function isMandatory() {
    return config.getForMarket(this.app.session.get('location').url, ['validator', 'phone', 'enabled'], false);
}

function onChange(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var $field = $(event.currentTarget);

    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);

    this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidPhone) {
        done(isValid && isValidPhone);
    }]);
}

function onChangePhone(event) {
    var $field = $(event.currentTarget);

    $field.val($field.val().replace(this.rEmail, ''));
}

module.exports.id = 'post/phone';
