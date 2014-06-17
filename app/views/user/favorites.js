'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'user_favorites_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    postRender: function() {
        var $popup = this.$('#favoritePopup');
        var $viewItem = $popup.find('.viewItem');
        var $removeItem = $popup.find('.removeItem');

        function close() {
            $popup.removeClass('visible');
            $viewItem.attr('href', '#');
            $removeItem.removeData('itemId');
        }

        this.$('.favoritePopup').click(function onClick(event) {
            event.preventDefault();

            var $item = $(this);
            var itemId = $item.attr('data-itemId');

            $viewItem.attr('href', $item.attr('data-itemUrl'));
            $removeItem.data('itemId', itemId);
            $popup.addClass('visible');
        });
        $popup.find('.popup-close').click(function onClick(event) {
            event.preventDefault();

            close();
        });
        $removeItem.click(function onClick(event) {
            event.preventDefault();

            var api = this.app.get('apiPath');
            var user = this.app.session.get('user');
            var itemId = $removeItem.data('itemId');
            var url = [];

            url.push(api);
            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push('/delete?token=');
            url.push(user.token);

            $('.loading').show();
            $.ajax({
                type: 'POST',
                url: url.join(''),
                cache: false,
                json: true,
                data: {}
            })
            .done(function done() {
                this.$('[data-itemId="' + itemId + '"]').parent().remove();
                close();
            }.bind(this))
            .fail(function fail() {
                console.log('Error');
            })
            .always(function always() {
                $('.loading').hide();
            });
        }.bind(this));
    }
});

module.exports.id = 'user/favorites';
