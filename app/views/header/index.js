'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var config = require('../../config');

function readPostButtonConfig(platform, currentRoute) {
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

module.exports = BaseView.extend({
    className: 'header_index_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#0075BD'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var platform = this.app.getSession('platform');
        var currentRoute = this.app.getSession('currentRoute');
        var postButton = readPostButtonConfig(platform, currentRoute);

        return _.extend({}, data, {
            location: this.app.getSession('location'),
            user: this.app.getSession('user'),
            postButton: postButton
        });
    },
    postRender: function() {
        $('#topBar ul li.logIn span').click(function(e){
            $('menu#myOlx').slideToggle();
        });
        $('menu#myOlx ul li a').click(function(e){
            $('menu#myOlx').slideUp();
        });
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });
        $(document).on('route', function onRoute() {
            var platform = this.app.getSession('platform');
            var currentRoute = this.app.getSession('currentRoute');
            var button = $('.postBtn', '#topBar');
            var postButton = readPostButtonConfig(platform, currentRoute);

            if (postButton) {
                button.removeClass('disabled');
            }
            else {
                button.addClass('disabled');
            }
        }.bind(this));
    }
});

module.exports.id = 'header/index';
