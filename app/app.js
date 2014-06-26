'use strict';

var Base = require('rendr/shared/app');
var Session = require('./session');
var nunjucks = require('./nunjucks');

module.exports = Base.extend({
    defaults: {
        templateAdapter: 'rendr-nunjucks'
    },
    initialize: function() {
        Session.call(this, {
            isServer: typeof window === 'undefined'
        });
        this.templateAdapter.init();
        this.templateAdapter.registerHelpers(nunjucks.helpers);
        this.templateAdapter.registerExtensions(nunjucks.extensions);
    },
    start: function() {
        this.router.on('action:start', function onStart() {
            this.set({
                loading: true
            });
        }, this);
        this.router.on('action:end', function onEnd() {
            this.set({
                loading: false
            });
        }, this);
        Base.prototype.start.call(this);
    },
    getAppViewClass: function() {
        return require('./views/app');
    }
});
