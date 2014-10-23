'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_favorites_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return data.context.ctx;
    },
    postRender: function() {
        var $removeItem = $('.removeItem');

        $removeItem.click(function onClick(event) {
            event.preventDefault();

            var $item = $(event.currentTarget).closest('li.item');
            var api = this.app.get('apiPath');
            // var user = this.app.session.get('user');
            var user = {
                    userId: '14788911',
                    token: 'MTQ3ODg5MTF8MTQxMzkxMTk5ODc3Mw%253D%253D'
                };
            var itemId = $removeItem.data('itemid');
            var url = [];

            url.push(api);
            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push('/delete?token=');
            url.push(user.token);

            if (!$item.hasClass('removeAd')) {
                console.log($item.hasClass('removeAd'));
                $item.addClass('removeAd');
                $.ajax({
                    type: 'POST',
                    url: url.join(''),
                    cache: false,
                    json: true,
                    data: {}
                })
                .done(function done() {
                    $item.fadeOut('fast', function () {
                        $item.remove();
                    });
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
