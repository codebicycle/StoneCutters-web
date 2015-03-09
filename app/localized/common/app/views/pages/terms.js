'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'pages_terms_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var mailDomain = config.get(['mails', 'domain', location.url], false) || location.url.replace('www.', '');
        var support = config.get(['mails', 'support', location.url], 'support') + '@' + mailDomain;

        return _.extend({}, data, {
            mails: {
                support: support,
            },
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/terms';
