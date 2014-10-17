'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('locations/list');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({    
    postRender: function() {
        this.app.router.once('action:start', this.onStart);
        this.app.router.once('action:end', this.onEnd);        
    },
    events: {
        'submit': 'onSubmit'
    },
    onStart: function(event) {
        this.appView.trigger('location:end');
    },
    onEnd: function(event) {
        this.appView.trigger('location:start');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var url = '/location?search=' + (this.$('form input[name=search]').val() || '');

        if (this.options.target) {
            url += '&target=' + this.options.target;
        }

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    }
});

