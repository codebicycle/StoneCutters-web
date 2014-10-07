'use strict';

var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    tagName: 'main',
    id: 'categories-list-view',
    className: 'categories-list-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location')
        });
    },
    postRender: function() {

    }
});

module.exports.id = 'categories/list';
