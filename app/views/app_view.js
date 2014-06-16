'use strict';

var BaseAppView = require('rendr/client/app_view');

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

        this.app.on('change:loading', function onLoading(app, loading) {
            progressBar(loading);
        }, this);
    }
});

module.exports.id = 'app_view/index';
