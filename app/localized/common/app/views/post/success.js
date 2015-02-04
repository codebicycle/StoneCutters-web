'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'post_success_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            addmessage: config.getForMarket(this.app.session.get('location').url, ['posting','success','addmessage'], '')
        });
    }
});

module.exports.id = 'post/success';
