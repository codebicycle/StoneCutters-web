'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');
var translations = require('../translations');

module.exports = RendrView.extend({
    getTemplate: function(){
        var template = this.app.getSession('template');
        var name = this.name;

        return this.app.templateAdapter.getTemplate(template + '/' + name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            analyticsImgUrls: helpers.analytics.imgUrls(this.app.getSession(), data),
            dictionary: translations[this.app.getSession('selectedLanguage') || 'en'],
            referer: this.app.getSession('referer'),
            url: this.app.getSession('url')
        });
    },
});
