'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/focus_on_browse');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_view',
    className: 'home_view',
	events: {
        'submit .search-form': 'onSearchSubmit'
    },
    preRender: function() {
        if (!utils.isServer) {
            this.app.trigger('header:customize', {
                //template: 'header/alternative-a',
                className: 'alternative-a wrapper',
                search: false
            });
            this.app.trigger('footer:hide');
        }
    },
    postRender: function() {
        this.once('remove', this.onRemove, this);
    },
    onRemove: function(event) {
        this.app.trigger('header:restore');
        this.app.trigger('footer:show');
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
