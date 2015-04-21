'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-errors-view',
    tagName: 'section',
    className: 'posting-errors-view hide',
    subfix: '-error-messsage',
    templateSettings: {
        interpolate: /\{(.+?)\}/g,
        evaluate: /\{\=(.+?)\}/g,
        escape: /\{\-(.+?)\}/g
    },
    events: {
        'update': onUpdate,
        'showError': onShowError,
        'hideError': onHideError,
        'click .close': onClickClose
    },
    initialize: initialize,
    getTemplateData: getTemplateData,
    postRender: postRender
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var formErrors = this.parentView.formErrors;
    var errors = this.parentView.errors;

    if (_.size(errors)) {
        errors = _.map(this.parentView.errors, function eachError(message, field) {
            return {
                field: field,
                message: message
            };
        });
    }
    else {
        errors = false;
    }
    if (!formErrors.length) {
        formErrors = false;
    }
    return _.extend({}, data, {
        errors: false,
        formErrors: formErrors
    });
}

function postRender() {
    if (this.$el.text().trim().length) {
        this.$el.removeClass('hide');
    }
}

function onUpdate(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.render();
}

function onShowError(event, field, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(field);
    var template = this.$('#error-template');
    var id = $field.attr('name') || $field.attr('id');

    options = options || {};
    if (options.message) {
        options.message = this.dictionary[options.message] || options.message;
    }
    template = _.template(template.html(), options, this.templateSettings);
    template = $($.trim(template));
    template.attr('id', id + this.subfix);

    $field.closest('.field-wrapper').addClass('error').removeClass('success');
    $field.parent().find('.error.message').remove();
    $field.parent().append(template);
}

function onHideError(event, fields, context) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    context = context || document;
    fields = _.isArray(fields) ? fields : (fields ? [fields] : $('small.error.message:not(.exclude)', context));

    _.each(fields, function each(field) {
        var $field = $(field, context);

        $field.closest('.field-wrapper').removeClass('error success');
        $field.parent().find('small.error.message').remove();
    });
}

function onClickClose(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.$el.addClass('hide');        
}

module.exports.id = 'post/errors';
