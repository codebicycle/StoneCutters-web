'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var middlewares = require('../../../middlewares');
var helpers = require('../../../helpers');
var Controller;
var Base;

Backbone.noConflict();
Base = Backbone.Model;

Controller = Backbone.Model.extend({
    control: control
});

Controller.error = function error(err, response, callback) {
    return helpers.common.error.call(this, err, response, callback);
};

Controller.redirect = function redirect(url, parameters, options) {
    return helpers.common.redirect.call(this, url, parameters, options);
};

function control(Model, args, options) {
    var model = new Model({}, {
        currentRoute: this.currentRoute,
        redirectTo: this.redirectTo,
        app: this.app
    });

    options = _.defaults(options || {}, {
        middlewares: true,
        control: true
    });
    invoke(model, args, options);
}

function invoke(model, args, options) {
    var action = function action(params, callback) {
        model.set({
            params: params,
            callback: callback,
            gallery: args[2] || ''
        });
        if (options.control) {
            return helpers.controllers.control.call(model, params, options, model.control);
        }
        model.control.apply(model, arguments);
    };

    if (options.middlewares) {
        return middlewares(action, options.exclude).apply(model, args);
    }
    action.apply(model, args);
}

module.exports = Controller;
