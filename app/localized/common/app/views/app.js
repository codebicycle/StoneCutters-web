'use strict';

var Base = require('rendr/client/app_view');

module.exports = Base.extend({
    className: 'app_view',
    initialize: function() {
        this.app.on('change:loading', this.loading.bind(this, this.$('#progressBar')));
    },
    loading: function($progressBar, app, isLoading) {
        if (isLoading){
            $progressBar.show();
            $progressBar.width('80%');
        }
        else{
            $progressBar.width('100%');
            window.setTimeout(function onTimeout(){
                $progressBar.hide();
                $progressBar.width('0');
            }, 500);
        }
    }
});

module.exports.id = 'app_view/index';
