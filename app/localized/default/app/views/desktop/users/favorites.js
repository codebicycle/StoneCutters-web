'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_favorites_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var favs;

        if (data.context && data.context.ctx) {
            favs = data.context.ctx.favorites || {};
        }

        return _.extend({}, data, {
            favorites: favs
        });
    },
    postRender: function() {
        var $removeItem = $('.removeItem');

        $removeItem.click(function onClick(event) {
            event.preventDefault();

            var $item = $(event.currentTarget).closest('li.item');
            var api = this.app.get('apiPath');
            var user = this.app.session.get('user');
            var itemId = $(event.currentTarget).data('itemid');
            var url = [];

            url.push(api);
            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push('/delete?token=');
            url.push(user.token);

            if (!$item.hasClass('removeAd')) {
                $item.addClass('removeAd');
                $.ajax({
                    type: 'POST',
                    url: url.join(''),
                    cache: false,
                    json: true,
                    data: {}
                })
                .done(function done() {
                    $item.fadeOut('fast', function deleteFav () {
                        $item.remove();
                        if (!this.$('.my-items').children().length) {
                            this.render();
                        }
                    }.bind(this));
                }.bind(this))
                .fail(function fail() {
                    console.log('Error');
                })
                .always(function always() {
                    $item.removeClass('removeAd');
                });
            }


        }.bind(this));

    }
});

module.exports.id = 'users/favorites';
