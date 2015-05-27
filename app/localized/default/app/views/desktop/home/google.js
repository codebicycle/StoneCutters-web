'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/google');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_google',
    events: {
        'submit .search-form': 'onSearchSubmit',
        'click .search-location': 'onSearchLocationClick',
        'click .country-link, .state-link': 'onStateLinkClick'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var locationUrl = this.app.session.get('location').url;
        var customText;

        switch (locationUrl) {
            case 'www.olx.co.za':
                customText = 'Find the best deals near you';
                break;
            case 'www.olx.com.co':
                customText = 'Encuentra los mejores anuncios cerca tuyo';
                break;
        }

        return _.extend({}, data, {
            customText: customText,
            orderedStates: utils.sortUsingList(data.states, config.get(['googleExperiment', locationUrl, 'statesOrder'], []), 'hostname')
        });
    },
    preRender: function() {
        if (!utils.isServer) {
            this.app.trigger('header:customize', {
                className: 'header google wrapper',
                search: false
            });
            this.app.trigger('footer:hide');
        }
    },
    postRender: function() {
        this.once('remove', this.onRemove, this);
        this.app.sixpack.convert(this.app.sixpack.experiments.dgdHomePage);
    },
    onRemove: function(event) {
        this.app.trigger('header:restore');
        this.app.trigger('footer:show');
    },
    onSearchSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var value = this.$('.search-term').val();
        var location = this.$('.search-location-value').val();
        var url = value ? ('/nf/search/' + value) : '/nf/all-results';
        var pushState = true;

        if (location && location !== this.app.session.get('siteLocation')) {
            pushState = false;
            url = utils.fullizeUrl(url, this.app);
            this.app.session.persist({
                siteLocation: location
            });
        }
        helpers.common.redirect.call(this.app.router, url, null, {
            pushState: pushState,
            status: 200
        });
    },
    onSearchLocationClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $list = this.$('.states-list');

        if ($list.hasClass('active')) {
            $list.removeClass('active');
            $('body').off('click.statesList');
        }
        else {
            $list.addClass('active');
            $('body').on('click.statesList', function() {
                $list.removeClass('active');
                $('body').off('click.statesList');
            });
        }
    },
    onStateLinkClick: function(event) {
        event.preventDefault();

        var $link = this.$(event.currentTarget);
        var $input = this.$('.search-location-value');
        var $display = this.$('.search-location-state');

        $input.val($link.data('location'));
        if ($link.hasClass('state-link')) {
            this.$('.country-link').show();
            $display.text($link.text() + ',');
        }
        else {
            $link.hide();
            $display.text('');
        }
    }
});
