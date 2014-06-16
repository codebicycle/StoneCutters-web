'use strict';

var BaseAppView = require('rendr/client/app_view');

var $body = $('body');

module.exports = BaseAppView.extend({
    className: 'app_view_index_view',
    initialize: function() {
        function progressBar(loading) {
            if (loading){ 
                $("#progressBar").show();
                $("#progressBar").width('80%');
            }else{
                $("#progressBar").width('100%');
                window.setTimeout(function(){
                    $("#progressBar").hide();
                    $("#progressBar").width('0');
                }, 500);
            }
        }

        this.app.on('change:loading', function onLoading(app, loading) {
            progressBar(loading);
        }, this);
    }
});

module.exports.id = 'app_view/index';
