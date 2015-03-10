'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'pages_didyousell_view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var categories = config.getForMarket(location.url, ['successPage', 'keepPosting'], '');

        return _.extend({}, data, {
            keepPostingCat: categories
        });
    }
});

module.exports.id = 'pages/didyousell';
