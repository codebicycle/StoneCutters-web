'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    events: {
        'click .btnremove': 'onRemoveClick',
        'click .btndelete': 'onDeleteClick',
        'click .btncanceldelete': 'onCancelDeleteClick',
        'click .backtomyolx': 'onCancelDeleteClick',
        'submit .formdelete': 'onDelete',
        'click .btnedit': 'onEditClick',
        'click [data-modal-close]': 'onCloseModal',
        'click [data-modal-shadow]': 'onCloseModal'
    },
    getTemplateData: function() {
        var now = new Date();
        var location = this.app.session.get('location');
        var data = Base.prototype.getTemplateData.call(this);

        data.currentTime = now.toISOString().replace('T',' ').substr(0,19);
        data.daysToRenew = config.getForMarket(location.url, ['ads', 'renew', 'daysToRenew'],14);
        data.items = data.items || this.parentView.items;

        return data;
    },
    onRemoveClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.stopImmediatePropagation();

        asynquence().or(success.bind(this)) // TODO: Improve error handling
            .then(remove.bind(this))
            .val(success.bind(this));

        function remove(done) {
            var $btnrem = $(event.target);
            var id = $btnrem.data('idd');
            var item = this.parentView.items.get(id);

            item.remove({
                deleteType: 'purged'
            }, done);
        }

        function success() {
            var path = this.app.session.get('path');

            this.app.router.redirectTo(utils.params(path, {
                removed: true
            }));
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

            item.remove({
                reason: reason,
                comment: comment
            }, done);
        }

        function success() {
            this.render();
        }
    },
    onEditClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $btn = $(event.target);
        
        if ($btn.data('featured')) {
            $('#modal-edit-featuread-view').trigger('update', {
                href: $btn.data('href'),
                featuredDates: {
                    start: $btn.data('featureddatesstart') || '2015-01-23 07:39:09',
                    end: $btn.data('featureddatesend') || '2015-01-26 20:50:22'
                }
            });
            $('#modal-edit-featuread-view').trigger('show');
            return;
        }
        this.app.router.redirectTo(URLParser.parse($btn.data('href')).path);
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-edit-featuread-view').trigger('hide');
    }
});
