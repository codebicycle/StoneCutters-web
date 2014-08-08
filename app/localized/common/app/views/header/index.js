'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../config');

module.exports = Base.extend({
    className: 'header_index_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#0075BD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            user: this.app.session.get('user'),
            postButton: this.isPostButtonEnabled(),
            postLink: this.getPostLink()
        });
    },
    getPostLink: function() {
        var postLink = this.app.session.get('postingLink');
        var link;

        if (!postLink) {
            return '';
        }
        link = ['/', postLink.category];
        if (postLink.subcategory) {
            link.push('/');
            link.push(postLink.subcategory);
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
