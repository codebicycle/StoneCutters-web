'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            languages: this.app.getSession('languages'),
            selectedLanguage: this.app.getSession('selectedLanguage'),
            user: this.app.getSession('user')
        });
    }
});

module.exports.id = 'footer/languages';
