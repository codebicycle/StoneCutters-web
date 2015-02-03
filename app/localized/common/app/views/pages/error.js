'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'pages_error_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        try {
            this.app.session.clear('errorDirection');
        }
        catch (error) {
            var err = (data || {}).err || {};

            console.log('[OLX_DEBUG]', this.app.session.get('platform'), this.app.session.get('referer'), JSON.stringify(err), JSON.stringify(err.stack), JSON.stringify(error.stack));
        }
        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/error';
