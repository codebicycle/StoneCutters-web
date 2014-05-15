'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');
var translations = require('../translations');

module.exports = RendrView.extend({
    initialize: function() {
        if (this.tagName === 'div' && this.app.get('session').platform === 'wap') {
            this.tagName = 'table';
            this.attributes = this.getWapAttributes();
        }
    },
    getTemplate: function() {
        var template = this.app.getSession('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);
        var template = this.app.getSession('template');

        return _.extend({}, data, {
            device: this.app.getSession('device'),
            platform: this.app.getSession('platform'),
            template: template,
            siteLocation: this.app.getSession('siteLocation'),
            location: this.app.getSession('location'),
            dictionary: translations[this.app.getSession('selectedLanguage') || 'en-US'] || translations['es-ES'],
            referer: this.app.getSession('referer'),
            url: this.app.getSession('url'),
            sixpack: this.app.getSession('sixpack'),
            macros: 'compiled/' + template + '/partials/macros.html'
        });
    },
    getWapAttributes: function() {
        return _.extend(this.attributes || {}, {
            width: '100%',
            cellspacing: 0,
            cellpadding: 4,
            border: 0
        }, this.wapAttributes || {});
    }
});
