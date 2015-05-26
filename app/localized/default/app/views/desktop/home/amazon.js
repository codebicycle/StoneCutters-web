'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('home/amazon');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_amazon',
    events: {
        'click .location-link': 'openModal',
        'click [data-modal-shadow], [data-modal-close]': 'closeModal',
        'click .location-item-link': 'onLocationItemLinkClick',
        'change .search-location-value': 'onSearchLocationValueChange',
        'click .topic-list-handler': 'onTopicListHandlerClick',
        'click .topic-title a': 'onTopicTitleHandlerClick'
    },
    preRender: function() {
        if (!utils.isServer) {
            this.app.trigger('header:customize', {
                template: 'header/amazon',
                className: 'header amazon wrapper'
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
    openModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#location-modal').trigger('show');
    },
    closeModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#location-modal').trigger('hide');
    },
    onLocationItemLinkClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $eventSource = this.$(event.target);
        var displayText = ($eventSource.hasClass('all') ? this.app.session.get('location').name : $eventSource.text());

        this.$('.search-location-value').val($eventSource.data('location')).trigger('change');
        this.$('.location-link').text(displayText);
        this.$('#location-modal').trigger('hide');
    },
    onSearchLocationValueChange: function(event) {
        this.app.session.persist({
            siteLocation: event.target.value
        });
    },
    onTopicListHandlerClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $source = this.$(event.target);
        var $list = $source.siblings('.topic-items-wrapper').find('.topic-items-list');
        var offset = parseInt($list.attr('data-offset'));

        if ($source.hasClass('left') && offset < 14) {
            offset += 1;
            if (offset === 14) {
                $source.hide();
            }
            else if (offset === 1) {
                $source.siblings('.topic-list-handler.right').show();
            }
            $list.attr('data-offset', offset);
            $list.css('margin-left', offset * -165);
        }
        else if ($source.hasClass('right') && offset > 0) {
            offset -= 1;
            if (offset === 0) {
                $source.hide();
            }
            else if (offset === 13) {
                $source.siblings('.topic-list-handler.left').show();
            }
            $list.attr('data-offset', offset);
            $list.css('margin-left', offset * -165);
        }
    },
    onTopicTitleHandlerClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $link = this.$(event.target);
        var url = utils.fullizeUrl($link.attr('href'), this.app);

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200,
            pushState: false
        });
    }
});
