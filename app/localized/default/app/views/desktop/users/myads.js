'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    events: {
        'click .btndelete': 'onDeleteClick',
        'click .btncanceldelete': 'onCancelDeleteClick',
        'click .backtomyolx': 'onCancelDeleteClick',
        'submit .formdelete': 'onDelete'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.items = data.items || this.parentView.items;
        return data;
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
    onDelete: function() {
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
    }
});
