'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('locations/list');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({    
    events: {
        'click .logIn span': 'onLoginClick',
        'click #myOlx li a': 'onMenuClick',
        'click .topBarFilters .filter-btns':'onCancelFilter'
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);        
    },
    onStart: function(event) {
        this.appView.trigger('location:start');
    },
    onEnd: function(event) {
        this.appView.trigger('location:end');
    }
});

