'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_form_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    postRender: function() {
        $('.fileUpload .image').click(function(e) {
            e.preventDefault();
            var $image = $(this).attr('id');
            var $input = $('input.'+$image);
            $input.trigger('click');
        });
        $('.fileUpload .image span').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $input = $(this).parent('.image').attr('id');
            $(this).parent('.image').removeClass('fill').addClass('empty');
            var $clone = $('<input>').attr({'type': $('.'+$input).attr('type'),'name': $('.'+$input).attr('name'),'class': $('.'+$input).attr('class')});
            $('.'+$input).replaceWith($clone);
        });
        $('form').on('change', 'input[type="file"]', function (e) {
            var $imageUrl = window.URL.createObjectURL(this.files[0]);
            window.URL.revokeObjectURL(this.src);
            var $current = $(this).attr('class');
            $('#' + $current).addClass('loading');
            $('<img/>').attr('src', $imageUrl).load(function() {
                $(this).remove();
                $('#' + $current).css({'background-image' : 'url(' + $imageUrl + ')'}).addClass('fill').removeClass('empty').removeClass('loading');
            });
        });
    }
});

module.exports.id = 'post/form';
