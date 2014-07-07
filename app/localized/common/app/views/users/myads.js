'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'users_myads_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        $('.edit').click(function(e) {
            e.preventDefault();
            var element = $(this);
            var itemId = element.attr('data-itemId');
            var itemUrl = element.attr('data-itemUrl');
            var itemEditable = element.attr('data-editable');
            var $edit = $('.editItem');
            var href;

            if (itemEditable) {
                href = $edit.attr('href');
                $edit.attr('href', href.replace('[[itemId]]', itemId));
                $('.deleteItemConfirm').data("itemId", itemId);
                $('.deleteItem').parent('li').removeClass('hide');
                $edit.parent('li').removeClass('hide');
            }
            else {
                $('.deleteItem').parent('li').addClass('hide');
                $edit.parent('li').addClass('hide');
            }
            $('.viewItem').attr("href", itemUrl);
            $('#edit').addClass('visible');
        });
        $('#edit .popup-close').click(function(e) {
            e.preventDefault();
            var $edit = $('.editItem');
            var href = $edit.attr('href');

            $edit.attr('href', href.replace(/\/[0-9]+\?/, '/[[itemId]]?'));
            $('.viewItem').attr("href", '#');
            $('#edit').removeClass('visible');
        });

        $('.deleteItem').on("click", function(e) {
            e.preventDefault();
            var $confirm = $('.deleteItemConfirm');
            var href = $confirm.attr('href');
            var itemId = $confirm.data('itemId');

            $confirm.attr('href', href.replace('[[itemId]]', itemId));
            $('#delete').addClass('visible');
            $('#edit .popup-close').trigger('click');
        });
        $('#delete .popup-close').click(function(e) {
            e.preventDefault();
            var $confirm = $('.deleteItemConfirm');
            var href = $confirm.attr('href');
            var itemId = $confirm.data('itemId');

            $confirm.attr('href', href.replace(/\/[0-9]+\?/, '/[[itemId]]?'));
            $confirm.removeData("itemId");
            $('#delete').removeClass('visible');
            $('.' + itemId).trigger('click');
        });
    }
});

module.exports.id = 'users/myads';
