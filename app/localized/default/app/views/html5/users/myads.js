'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    events: {
        'click [data-action=more]': 'showActions',
        'click [data-action=delete]': 'deleteItem'
    },
    postRender: function() {
        var $messages = $('#messages');

        if ($messages.length) {
            setTimeout(function(){
                $messages.slideUp();
            }, 3000);
        }
    },
    showActions: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $buttons = $('.my-ads .btnfilter[data-action=more]');
        var $actions = $('.actions[data-action=actions]');
        var $renews = $('.action[data-action=renews]');
        var $view = $('.action[data-action=view]');
        var $deleteItem = $('.action[data-action=delete]');
        var status = $target.parent().data('status');
        var targetPosition = $target.parent().position().top;
        var actionsPosition = $actions.position().top;
        var newPosition = targetPosition + $target.parent().height();
        var itemId = $target.data('id');
        var itemUrl = $target.data('itemurl');
        var href = $deleteItem.attr('href');

        if (status === 'expired') {
            $view.addClass('hide');
            $renews.removeClass('hide');
        }
        else {
            $view.removeClass('hide');
            $renews.addClass('hide');
        }

        if ($actions.hasClass('hide')) {
            $target.addClass('active');
            $actions.css('top', newPosition);
            $view.attr('href', itemUrl);
            $deleteItem.attr('href', href.replace('[[itemId]]', itemId));
            $actions.removeClass('hide');
        }
        else if (actionsPosition == newPosition) {
            $actions.addClass('hide');
            $target.removeClass('active');
            $deleteItem.attr('href', href.replace(/\/[0-9]+\?/, '/[[itemId]]?'));
            $view.attr('href', '');
        }
        else {
            $buttons.removeClass('active');
            $target.addClass('active');
            $view.attr('href', itemUrl);
            $deleteItem.attr('href', href.replace('[[itemId]]', itemId));
            $actions.css('top', newPosition);
        }
    }
    /*onDeleteClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $btndel = $(event.target);
        var itemId = $btndel.data('idd');
        var itemImg = $btndel.data('img');
        var itemTitle = $btndel.data('title');

        if (itemImg) {
            this.$('.confirmdelete .image img').attr('src',itemImg);
            this.$('.confirmdelete .image .withoutimg').hide();
        }
        else {
            this.$('.confirmdelete .image img').hide();
            this.$('.confirmdelete .image .withoutimg').show();
        }
        this.$('.confirmdelete .description').text(itemTitle);
        this.$('.my-items').hide();
        this.$('.formdeleteitem').find('#idd').val(itemId);
        this.$('.formdeleteitem').show();
    },
    onCancelDeleteClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.formdeleteitem').hide();
        $('.my-items').show();
    },
    onDelete: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(success.bind(this)) // TODO: Improve error handling
            .then(remove.bind(this))
            .val(success.bind(this));

        function remove(done) {
            var id = this.$('.formdelete #idd').val();
            var item = this.parentView.items.get(id);
            var reason = this.$('.formdelete input[name="close_reason"]:checked').val();
            var comment = this.$('.formdelete input[name="close_comment"]').val();

            item.remove(reason, comment, done);
        }

        function success() {
            this.render();
        }
    }*/
});
