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
        var platform = this.app.session.get('platform');
        var currentRoute = this.app.session.get('currentRoute');
        var postButton = this.readPostButtonConfig(platform, currentRoute);
        var postLink = this.getPostLink();

        return _.extend({}, data, {
            user: this.app.session.get('user'),
            postButton: postButton,
            postLink: postLink
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
    readPostButtonConfig: function(platform, currentRoute) {
        var buttonsConfig = config.get('disablePostingButton', {});
        var match = _.find(buttonsConfig[platform], function(conf) {
            conf = conf.split(':');
            var configRoute = {
                controller: conf[0],
                action: conf[1]
            };

            if (configRoute.action) {
                return (configRoute.controller === currentRoute.controller && configRoute.action === currentRoute.action);
            }
            else {
                return (configRoute.controller === currentRoute.controller);
            }
        });

        return (match) ? false : true;
    }
});

module.exports.id = 'header/index';
