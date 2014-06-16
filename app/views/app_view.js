'use strict';

var BaseAppView = require('rendr/client/app_view');
var utils = require('../../shared/utils');

var $body = $('body');

module.exports = BaseAppView.extend({
    className: 'app_view_index_view',
    initialize: function() {
        function progressBar(loading) {
            var $progress = $("#progressBar");

            if (loading) {
                $progress.show();
                $progress.width('80%');
            }
            else {
                $progress.width('100%');
                window.setTimeout(function hideProgress() {
                    $progress.hide();
                    $progress.width('0');
                }, 500);
            }
        }

        function checkLocation() {
            var siteLocation = this.app.getSession('siteLocation');

            $('.locatable').each(function(i) {
                var $locatable = $(this);
                var href = $locatable.attr('href');
                var currentLocation = utils.params(href, 'location');

                if (currentLocation !== siteLocation) {
                    if (siteLocation && ~siteLocation.indexOf('www')) {
                        href = utils.removeParams(href, 'location');
                    }
                    $locatable.attr({
                        href: utils.link(href, siteLocation)
                    });
                }
            });

        }

        this.app.on('change:loading', function onLoading(app, loading) {
            progressBar(loading);
            if (!loading) {
                checkLocation.call(this);
            }
        }, this);
    }
});

module.exports.id = 'app_view/index';
