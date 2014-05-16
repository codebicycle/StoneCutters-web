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
        $('.favoritePopup').click(function(e) {
            e.preventDefault();
            var element = $(this);
            var itemId = element.attr('data-itemId');
            var itemUrl = element.attr('data-itemUrl');
            $('.viewItem').attr("href", itemUrl);
            $('.removeItem').attr("href", 'urlForRemoveFav');
            $('body').addClass('noscroll');
            $('#favoritePopup').addClass('visible');
        });
        $('.popup-close').click(function(e) {
            e.preventDefault();
            $('.viewItem').attr("href", '#');
            $('.removeItem').attr("href", '#');
            $('body').removeClass('noscroll');
            $('#favoritePopup').removeClass('visible');
        });
    }
});

module.exports.id = 'user/favorites';
