'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/index');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_view',
    className: 'home_view',
	events: {
        'submit .search-form': 'onSearchSubmit'
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('header:hide');
        this.appView.trigger('footer:hide');
    },
    onEnd: function(event) {
        this.appView.trigger('header:show');
        this.appView.trigger('footer:show');
    },
    onSearchSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var query = this.$('.search-form').find('.search-term').val();
        
        helpers.common.redirect.call(this.app.router, query ? ('/nf/search/' + query) : '/nf/all-results', null, {
            status: 200
        });
    }
});
