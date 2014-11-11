'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('post/form');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    postRender: function() {
        var $form = this.$('form');

        this.$('.fileUpload .image').click(function(e) {
            e.preventDefault();
            var $image = $(this).attr('id');
            var $input = $('input.'+$image);
            $input.trigger('click');
        });
        this.$('.fileUpload .imgCont span').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $input = $(this).attr('class');
            $(this).parent('.imgCont').removeClass('fill').addClass('empty');
            $('#' + $input).removeAttr("style");
            var $clone = $('<input>').attr({'type': $('.'+$input).attr('type'),'name': $('.'+$input).attr('name'),'class': $('.'+$input).attr('class')});
            $('fileUpload > .'+$input).replaceWith($clone);
        });
        $form.on('change', 'input[type="file"]', function (e) {
            var imageUrl = window.URL.createObjectURL(this.files[0]);
            var image = new window.Image();
            var $current = $(this).attr('class');

            image.src = imageUrl;
            image.onload = function() {
                EXIF.getData(image, function() {
                    var orientation = EXIF.getTag(this, 'Orientation');
                    var css = {
                        'background-image' : 'url(' + imageUrl + ')'
                    };
                    var deg;

                    if (orientation && orientation != 1) {
                        switch (orientation) {
                            case 3:
                                deg = 180;
                            break;
                            case 6:
                                deg = 90;
                            break;
                            case 8:
                                deg = 270;
                            break;
                        }
                        if (deg) {
                            css['-webkit-transform'] = 'rotate(' + deg + 'deg)';
                            css['-moz-transform'] = 'rotate(' + deg + 'deg)';
                            css['-o-transform'] = 'rotate(' + deg + 'deg)';
                            css['-ms-transform'] = 'rotate(' + deg + 'deg)';
                            css.transform = 'rotate(' + deg + 'deg)';
                        }
                    }
                    $('#' + $current).parent().addClass('fill').removeClass('empty');
                    $('#' + $current).css(css).removeClass('loading');
                });
            };
            $('#' + $current).addClass('loading');
        });
        this.attachTrackMe(function(category, action) {
            var itemCategory = '-';
            var itemSubcategory = '-';

            if (action !== 'ClickUploadPicture') {
                itemCategory = $('.itemCategory').val();
                itemSubcategory = $('.itemSubcategory').val();
            }
            return {
                custom: [category, itemCategory, itemSubcategory, action].join('::')
            };
        });
        this.$('#change-location-posting').click(function onClick(event) {
            var values = {};

            $.each($form.serializeArray(), function each() {
                if (values[this.name] !== undefined) {
                    if (!values[this.name].push) {
                        values[this.name] = [values[this.name]];
                    }
                    values[this.name].push(this.value || '');
                } else {
                    values[this.name] = this.value || '';
                }
            });
            this.app.session.update({
                form: {
                    values: values
                }
            });
        }.bind(this));
    }
});
