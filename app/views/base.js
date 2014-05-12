'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');
var translations = require('../translations');

module.exports = RendrView.extend({
    getTemplate: function(){
        var template = this.app.getSession('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            platform: this.app.getSession('platform'),
            template: this.app.getSession('template'),
            siteLocation: this.app.getSession('siteLocation'),
            location: this.app.getSession('location'),
            analyticsImgUrls: helpers.analytics.imgUrls(this.app.getSession(), data),
            dictionary: translations[this.app.getSession('selectedLanguage') || 'en-US'] || translations['en-US'],
            referer: this.app.getSession('referer'),
            url: this.app.getSession('url')
        });
    },
});
