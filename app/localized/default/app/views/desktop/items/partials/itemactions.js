'use strict';

var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'item-actions',
    id: 'item-actions',
    events: {
        'click [data-fav]': 'addToFavorites'
    },
    addToFavorites: function (e) {
        var $this = $(e.currentTarget);

        if ($this.attr('href') == '#') {
            e.preventDefault();
            var user = this.app.session.get('user');
            var itemId = $this.data('itemid');
            var removeTxt = $this.attr('data-remove');
            var addTxt = $this.attr('data-add');
            var url = [];

            $this.attr('href', 'adding');

            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push(($this.attr('data-current') == 'add' ? '' : '/delete'));
            url.push('?token=');
            url.push(user.token);

            helpers.dataAdapter.post(this.app.req, url.join(''), {
                query: {
                    platform: this.app.session.get('platform')
                },
                cache: false,
                json: true,
                done: function() {
                    $this.attr('data-qa', $this.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');
                    if ($this.attr('data-current') == 'add') {
                        $this.attr('data-current', 'remove');
                        $this.text(removeTxt);
                    } else {
                        $this.attr('data-current', 'add');
                        $this.text(addTxt);
                    }
                },
                fail: function() {
                    console.log('[OLX_DEBUG] Fail add to favorites :: ERROR');
                }
            }, function always() {
                $this.attr('href', '#');
            });
        }
    }
});

module.exports.id = 'items/partials/itemactions';
