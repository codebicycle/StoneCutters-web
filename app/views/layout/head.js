'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var app = helpers.environment.init(this.app);

        return _.extend({}, data, {
            head: helpers.seo.getHead(),
            template: app.getSession('template')
        });
    },
    postRender: function() {
        var title = $('head title');

        $(document).on('route', function onRoute() {
            var head = helpers.seo.getHead();

            title.text(head.title);
            _.each($('meta[name!=viewport]'), function each(metatag) {
                metatag = $(metatag);
                if (!metatag.attr('name')) {
                    return;
                }
                metatag.remove();
            });
            _.each(head.metatags, function each(metatag) {
                $('head meta:last').after('<meta name="' +  metatag.name + '" content="' + metatag.content + '" />');
            });
        });
    }
});

module.exports.id = 'layout/head';
