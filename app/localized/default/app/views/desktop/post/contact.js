'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-contact-view',
    className: 'posting-contact-view',
    events: {
        'update': 'onUpdate',
        'validate': 'onValidate'
    },
    fields: [],

    onUpdate: function(event, fields) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.fields = fields;
    },
    onValidate: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
/*
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
*/
    }
});

module.exports.id = 'post/contact';
