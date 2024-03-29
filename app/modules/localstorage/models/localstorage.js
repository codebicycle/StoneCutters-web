'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Localstorage;

Backbone.noConflict();

Localstorage = Backbone.Model.extend({
    initialize: function(attrs, options) {
        this.ready = false;
        this.on('change', this.onChange, this);
        this.on('ready', this.onReady, this);
        window.LocalCache.getAll().done(function parse(localStorage) {
            this.set(_.object(_.keys(localStorage), _.map(_.values(localStorage), function each(entry) {
                return entry.value;
            })), {silent: true});
            this.trigger('ready');
        }.bind(this));
    },
    onChange: function() {
        _.each(this.changed, function persist(value, key) {
            window.LocalCache.set(false, key, value);
        });
    },
    onReady: function() {
        this.ready = true;
    }
});

module.exports = Localstorage;
