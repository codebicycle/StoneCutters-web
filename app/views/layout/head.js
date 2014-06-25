'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = Base.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            head: helpers.seo.getHead(),
            template: this.app.session.get('template'),
            location: this.app.session.get('location')
        });
    },
    postRender: function() {
        $(document).on('route', helpers.seo.update);
    }
});

module.exports.id = 'layout/head';
