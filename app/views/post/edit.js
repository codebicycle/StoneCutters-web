'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = Base.extend({
    className: 'post_edit_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.itemLocation = parse(data.form.values.location);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
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
            if ($(this).hasClass('remove-old-image')) {
                $('.check-' + $input).attr('checked', true);
            }
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
    },

});

function parse(location) {
    if (location.children && location.children[0]) {
        if (location.children[0].children && location.children[0].children[0]) {
            return location.children[0].children[0];
        }
        return location.children[0];
    }
    return location;
}

module.exports.id = 'post/edit';
