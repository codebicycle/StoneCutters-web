'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'user_myads_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    postRender: function() {
        $('.edit').click(function(e) {
            e.preventDefault();
            var element = $(this);
            var itemId = element.attr('data-itemId');
            var itemUrl = element.attr('data-itemUrl');
            $('.viewItem').attr("href", itemUrl);
            $('.editItem').attr("href", 'urlForEdit');
            $('.deleteItem').attr("href", 'urlForDelete');
            $('#edit').addClass('visible');
        });
        $('.popup-close').click(function(e) {
            e.preventDefault();
            $('.viewItem').attr("href", '#');
            $('.editItem').attr("href", '#');
            $('.deleteItem').attr("href", '#');
            $('#edit').removeClass('visible');
        });
    }
});

module.exports.id = 'user/my-ads';
