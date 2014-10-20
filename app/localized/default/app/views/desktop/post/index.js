'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    events: {
        'click input.posting': 'onSubmit'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#posting-contact-view').trigger('validate');
    }
});

module.exports.id = 'post/index';
