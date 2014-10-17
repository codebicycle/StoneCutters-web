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
    onStart: function(event) {
        this.appView.trigger('location:end');
    },
    onEnd: function(event) {
        this.appView.trigger('location:start');
    }
});

