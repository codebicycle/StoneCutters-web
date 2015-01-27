'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'header_index_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#0075BD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var banner = config.get(['migration', location.url, 'banner'], false);
        var languageAbbreviation = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].isocode.toLowerCase();

        return _.extend({}, data, {
            user: this.app.session.get('user'),
            postButton: this.isPostButtonEnabled(),
            postLink: this.getPostLink(),
            banner: banner ? data.template + '/partials/migration/banner-' + location.abbreviation.toLowerCase() + '.html' : false,
            languageAbbreviation: languageAbbreviation
        });
    },
    getPostLink: function() {
        var dataPage = this.app.session.get('dataPage');
        var link;

        if (!dataPage) {
            return '';
        }
        link = ['/', dataPage.category];
        if (dataPage.subcategory) {
            link.push('/');
            link.push(dataPage.subcategory);
        }
        return link.join('');
    },
    isPostButtonEnabled: function() {
        var platform = this.app.session.get('platform');
        var currentRoute = this.app.session.get('currentRoute');
        var buttonConfig = config.get('disablePostingButton', {});

        return !_.find(buttonConfig[platform], function each(conf) {
            conf = conf.split(':');
            if (conf[1]) {
                return (conf[0] === currentRoute.controller && conf[1] === currentRoute.action);
            }
            else {
                return (conf[0] === currentRoute.controller);
            }
        });
    }
});

module.exports.id = 'header/index';