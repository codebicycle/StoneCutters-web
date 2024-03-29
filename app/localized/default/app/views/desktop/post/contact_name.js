'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    id: 'posting-contact-name-view',
    tagName: 'section',
    className: 'posting-contact-name-view',
    selector: '#field-contactName',
    events: {
        'change': onChange,
        'validate': onValidate,
        'blur #field-contactName': onBlur
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
    return config.getForMarket(this.app.session.get('location').url, ['validator', 'contactName', 'enabled'], true);
}

function onChange(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);

    if (_.isString(options)) {
        $field.val(options);
        options = undefined;
    }
    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = this.$(this.selector);

    if (this.isMandatory()) {
        return this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidField) {
            done(isValid && isValidField);
        }]);
    }
    done(isValid);
}

function onBlur(event) {
    var $field = $(event.currentTarget);
    var value = $field.val();

    if ($field.data('value') !== value) {
        this.$el.trigger('validate', [function onComplete(isValidField) {
            if (isValidField) {
                this.parentView.$el.trigger('fieldSubmit', [$field]);
            }
        }.bind(this), true]);
        $field.data('value', value);
    }
}

module.exports.id = 'post/contact_name';
