'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-errors-view',
    className: 'posting-errors-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var errors = _.values(this.parentView.errors);

        return _.extend({}, data, {
            errors: errors
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.render();
    },
    onHide: function(event) {

    }
});

module.exports.id = 'post/errors';
