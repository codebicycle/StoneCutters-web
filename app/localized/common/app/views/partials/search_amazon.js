'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'partials_search_view',
    id: 'search',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            search: this.app.session.get('search')
        });
    }
});

module.exports.id = 'partials/search_focus_on_browse';
