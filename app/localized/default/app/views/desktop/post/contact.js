'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-contact-view',
    className: 'posting-contact-view',
    validations: {},
    events: {
        'update': 'onUpdate',
        'validate': 'onValidate'
    },

    onUpdate: function(event, fields) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        _.each(fields, function(field) {
            this.validations[field.name] = field.validations;
        }, this);
    },
    onValidate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        _.each(this.validations, function(validations, field) {
            _.each(validations, function(validation) {
                if (field === 'email') {
                    if (validation.match) {
                        if (!$('#seller-email').val().match(eval(validation.match))) {
                            alert('Invalid');
                        }
                        else {
                            alert('Valid');
                        }
                    }
                }
            });
        });
    }
});

module.exports.id = 'post/contact';
