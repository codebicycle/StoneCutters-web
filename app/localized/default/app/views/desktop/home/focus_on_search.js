'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/focus_on_search');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_view',
    className: 'home_view',
	events: {
        'showLocalize': 'onShowLocalize',
        'hideLocalize': 'onHideLocalize',
        'submit .search-form': 'onSearchSubmit',
        'click a[data-location]': 'onClickLocation',
        'click .search-location': 'onShowLocalize',
        'click .states-list li a': 'onClickState'
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
    onShowLocalize: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.states-list').fadeIn();
    },
    onHideLocalize: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.states-list').fadeOut();
    },
    onSearchSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var search = this.$('.search-form').find('.search-term').val();
        var url = search ? ('/nf/search/' + search) : '/nf/all-results';
        
        helpers.common.redirect.call(this.app.router, utils.fullizeUrl(url, this.app), null, {
            pushState: false,
            status: 200
        });
    },
    onClickLocation: function(event) {
        this.app.session.persist({
            siteLocation: $(event.currentTarget).data('location')
        });
    },
    onClickState: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $location = this.$('.search-location');
        var $state = $(event.currentTarget);

        $location.data('location', $state.data('location'));
        $location.text($state.text());
        this.$el.trigger('hideLocalize');
    }
});
