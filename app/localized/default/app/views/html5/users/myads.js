'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var helpers = require('../../../../../../helpers');
var Items = require('../../../../../../collections/items');

module.exports = Base.extend({
    events: {
        'click [data-action=more]': 'showActions',
        'click [data-action=delete]': 'onDeleteClick',
        'click .btncanceldelete': 'onCancelDeleteClick',
        'submit .formdelete': 'onDelete'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.items = this.items && this.items.toJSON ? this.items.toJSON() : this.items || data.items && data.items.toJSON ? data.items.toJSON() : data.items;

        return data;
    },
    deleted: false,
    postRender: function() {
        var $messages = $('#messages');

        if (this.deleted) {
            $messages.removeClass('hide');

            setTimeout(function(){
                $messages.slideUp();
            }, 3000);
        }

        this.items = this.items || this.options.items && this.options.items.toJSON ? this.options.items : new Items(this.options.items || {}, {
            app: this.app
        });
    },
    showActions: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $buttons = $('.my-ads .btnfilter[data-action=more]');
        var $action = $target.parent().find('.actions').html();
        var $actions = $('.actions-show[data-action=actions]');
        var targetPosition = $target.parent().position().top;
        var newPosition = targetPosition + $target.parent().height() + 12;

        $actions.html($action);
        $actions.css('top', newPosition);

        if ($target.hasClass('active')) {
            $actions.addClass('hide');
            $target.removeClass('active');
        }
        else {
            $buttons.removeClass('active');
            $target.addClass('active');
            $actions.removeClass('hide');
        }
    },
    onDeleteClick: function(event) {
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
        this.$('#myads').hide();
        $('.breadcrumb').hide();
        $('.header_index_view').hide();
        $('.footer_footer_view').addClass('disabled');
        this.$('#formdeleteitem').find('#idd').val(itemId);
        this.$('#topBar').show();
        this.$('#formdeleteitem').show();
    },
    onCancelDeleteClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#formdeleteitem').hide();
        this.$('#topBar').hide();
        $('.breadcrumb').show();
        $('#myads').show();
        $('.header_index_view').show();
        $('.footer_footer_view').removeClass('disabled');
    },
    onDelete: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        function remove(done) {
            var id = this.$('.formdelete #idd').val();
            var item = this.items.get(id);
            var reason = this.$('.formdelete input[name="close_reason"]:checked').val();
            var comment = this.$('.formdelete input[name="close_comment"]').val();

            item.remove(reason, comment, done);
        }

        function success(e) {
            var $header = $('.header_index_view');
            var $footer = $('.footer_footer_view');
            var $messages = $('#messages');

            this.deleted = true;
            this.render();
            $header.show();
            $footer.removeClass('disabled');
            $messages.addClass('deleted');
        }
        asynquence().or(success.bind(this)) // TODO: Improve error handling
            .then(remove.bind(this))
            .val(success.bind(this));
    }
});
