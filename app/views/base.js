'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');

// Create a base view, for adding common extensions to our
// application's views.
module.exports = RendrView.extend({
    getTemplate: function(){
        var template = this.app.getSession('template');
        var name = this.name;

        console.log('<DEBUG CONSOLE LOG> retrieving:' + template + '/' + name);
        return this.app.templateAdapter.getTemplate(template + '/' + name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            //an array of urls to be used as srcs for analytics images
            analyticsImgUrls: helpers.analytics.imgUrls(this.app.getSession(), data)
        });
    },
});
