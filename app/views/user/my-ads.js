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
            var $edit = $('.editItem');
            var href = $edit.attr('href');

            $edit.attr('href', href.replace('[[itemId]]', itemId));
            $('.viewItem').attr("href", itemUrl);
            $('.deleteItemConfirm').data("itemId", itemId);
            $('#edit').addClass('visible');
        });
        $('#edit .popup-close').click(function(e) {
            e.preventDefault();
            var $edit = $('.editItem');
            var href = $edit.attr('href');

            $edit.attr('href', href.replace(/\/[0-9]+\?/, '/[[itemId]]?'));
            $('.viewItem').attr("href", '#');
            $('.deleteItemConfirm').removeData("itemId");
            $('#edit').removeClass('visible');
        });
        $('.deleteItem').on("click", function(e) {
            e.preventDefault();
            var $confirm = $('.deleteItemConfirm');
            var href = $confirm.attr('href');

            $confirm.attr('href', href.replace('[[itemId]]', $confirm.data('itemId')));
            $('#delete').addClass('visible');
            $('#edit .popup-close').trigger('click');
        });
        $('#delete .popup-close').click(function(e) {
            e.preventDefault();
            var $confirm = $('.deleteItemConfirm');
            var href = $confirm.attr('href');
            
            $confirm.attr('href', href.replace(/\/[0-9]+\?/, '/[[itemId]]?'));
            $('#delete').removeClass('visible');
            $('.edit').trigger('click');
        });
    }
});

module.exports.id = 'user/my-ads';
