'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../../shared/config');
var seo = require('../../../../../seo');

module.exports = Base.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var icons = config.get(['icons', this.app.session.get('platform')], []);
        var country = this.app.session.get('location').url;

        return _.extend({}, data, {
            head: seo.getHead(),
            icons: (~icons.indexOf(country) ? country : 'default')
        });
    },
    postRender: function() {
        $(document).on('route', seo.update);
    }
});

module.exports.id = 'layout/head';
