'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            head: helpers.seo.getHead(),
            template: this.app.getSession('template'),
            location: this.app.getSession('location')
        });
    },
    postRender: function() {
        $(document).on('route', helpers.seo.update);
    }
});

module.exports.id = 'layout/head';
