'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-errors-view',
    className: 'posting-errors-view hide',
    getTemplateData: function() {
        var errors = this.parentView.errors;
        var formErrors = this.parentView.formErrors;
        var data = Base.prototype.getTemplateData.call(this);

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
    },
    events: {
        'update': 'onUpdate',
        'click .close': 'onCloseClick'
    },
    postRender: function() {
        if (this.$el.text().trim().length) {
            this.$el.removeClass('hide');
        }
    },
    onUpdate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.render();
    },
    onCloseClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('hide');        
    }
});

module.exports.id = 'post/errors';
