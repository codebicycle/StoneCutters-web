'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../config');
var utils = require('../../../../../../shared/utils');

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

function getPostLink() {
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
}

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
        var postButton = readPostButtonConfig(platform, currentRoute);
        var postLink = getPostLink.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            user: this.app.session.get('user'),
            postButton: postButton,
            postLink: postLink
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
            var platform = this.app.session.get('platform');
            var currentRoute = this.app.session.get('currentRoute');
            var button = $('.postBtn', '#topBar');
            var postButton = readPostButtonConfig(platform, currentRoute);

            if (postButton) {
                button.removeClass('disabled');
            }
            else {
                button.addClass('disabled');
            }
        }.bind(this));

        $('body').on('change:location', this.changeLocation.bind(this));
        $('body').on('update:postingLink', this.updatePostingLink.bind(this));
    },
    changeLocation: function (e, siteLocation) {
        this.$('.logo, .header-links .header-link, .header-links .posting-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');
            var removeLocation = (siteLocation && ~siteLocation.indexOf('www'));
            var currentLocation;

            if ($link.hasClass('posting-link')) {
                if (~href.indexOf('/posting')) {
                    if (removeLocation) {
                        $link.data('tracking', 'Posting-ClickSelectLocation');
                        $link.attr('href', '/location?target=posting');
                    }
                }
                else if (!removeLocation) {
                    $link.removeData('tracking');
                    $link.attr('href', '/posting');
                }
                href = $link.attr('href');
            }
            currentLocation = utils.params(href, 'location');
            if (currentLocation !== siteLocation) {
                if (removeLocation) {
                    href = utils.removeParams(href, 'location');
                }
                else {
                    href = utils.link(href, this.app, {
                        location: siteLocation
                    });
                }
                $link.attr({
                    href: href
                });
            }
        }.bind(this));
    },
    updatePostingLink: function(e) {
        this.$('.posting-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');
            var postLink;
            
            if (~href.indexOf('/posting')) {
                postLink = getPostLink.call(this);
                $link.attr('href', href.replace(/\/posting(\/\d*)?(\/\d*)?/, ['/posting', postLink].join('')));
            }
        }.bind(this));
    }
});

module.exports.id = 'header/index';
