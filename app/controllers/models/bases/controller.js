'use strict';

var Backbone = require('backbone');
var Controller;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

Controller = Backbone.Model.extend({
    initialize: initialize,
    action: action
});

function initialize(attrs, options) {
    this.on('preAction', this.preAction.bind());
}

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
