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
        $('form').on('change', 'input[type="file"]', function (e) {
        	var $imageUrl = window.URL.createObjectURL(this.files[0]);
            window.URL.revokeObjectURL(this.src);
    		var $current = $(this).attr('class');
    		$('<img/>').attr('src', $imageUrl).load(function() {
               $(this).remove();
               $('#' + $current).css({'background-image' : 'url(' + $imageUrl + ')'}).addClass('fill');
            });

    	});
    },
});

module.exports.id = 'post/form';
