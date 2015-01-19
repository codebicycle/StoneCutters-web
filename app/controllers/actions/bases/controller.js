'use strict';

var Backbone = require('backbone');
var Controller;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

Controller = Backbone.Model.extend({
    action: action    
});

function action(Model, args) {
    var model = new Model({
        params: args[0],
        callback: args[1],
        gallery: args[2] || ''
    }, {
        app: this.app
    });

    return model.action.apply(action, args);
}

module.exports = Controller;
