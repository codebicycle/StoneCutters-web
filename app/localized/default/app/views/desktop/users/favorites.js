var Base = require('../../../../../common/app/bases/view').requireView('users/favorites');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_favorites_view',
    postRender: function() {

        $('.removeItem').click(function onClick(event) {
            event.preventDefault();

            var api = this.app.get('apiPath');
            var user = this.app.session.get('user');
            var itemId = $(event.currentTarget).data('itemId');

            var url = [];

            url.push(api);
            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push('/delete?token=');
            url.push(user.token);
            this.$('#id' + itemId + ' .spinner').removeClass('hide');

            $.ajax({
                type: 'POST',
                url: url.join(''),
                cache: false,
                json: true,
                data: {}
            })
            .done(function done() {
                this.$('#id' + itemId).remove();
                close();
            }.bind(this))
            .fail(function fail() {
                console.log('Error');
            })
            .always(function always() {
                this.$('#id' + itemId + ' .spinner').addClass('hide');
            });
        }.bind(this));
    }

});