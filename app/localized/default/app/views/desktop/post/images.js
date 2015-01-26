'use strict';

var Base = require('../../../../../common/app/bases/view');
var Item = require('../../../../../../models/item');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'posting-images-view field-wrapper',
    id: 'posting-images-view',
    tagName: 'fieldset',
    pending: 0,
    postRender: function() {
        _.each(this.parentView.getItem().get('images').slice(0, 6), function each(image, i) {
            this.showImage(i, image);
        }, this);
    },
    events: {
        'click .image:not(.fill .image)': 'onImageClick',
        'click .remove': 'onRemoveClick',
        'click input[type=file]': 'onInputClick',
        'change input[type=file]': 'onChange',
        'imageLoadStart': 'onImageLoadStart',
        'imageLoadEnd': 'onImageLoadEnd'
    },
    onImageClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $image = $(event.currentTarget);
        var $container = $image.parent();
        var $input = this.$('#' + $container.data('input'));

        $input.click();
    },
    onRemoveClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $remove = $(event.currentTarget);
        var $container = $remove.parent().removeClass('loaded');
        var $image = $container.find('.image').removeClass('fill').removeAttr('style').addClass('icons icon-addpicture');
        var input = $container.data('input');
        var $input = this.$('#' + input).val('');

        this.parentView.getItem().get('images').splice(input.replace('file', ''), 1);
    },
    onInputClick: function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $input = $(event.target);
        var input = $input.attr('id');
        var index = input.replace('file', '');
        var $container = this.$('[data-input=' + input + ']').addClass('loading');
        var $image = $container.children('.image');
        var image = event.target.files[0];

        asynquence().or(fail.bind(this))
            .then(post.bind(this))
            .then(success.bind(this))
            .val(done.bind(this));

        function post(done) {
            this.$el.trigger('imageLoadStart');
            this.parentView.getItem().get('images')[index] = image;
            this.parentView.getItem().postImages(done);
        }

        function success(done) {
            this.showImage(index, image, done);
        }

        function done() {
            this.$el.trigger('imageLoadEnd');
            $container.removeClass('loading');
        }

        function fail(err) {
            this.$el.trigger('imageLoadEnd');
            this.parentView.getItem().get('images').splice(index, 1);
            $input.val('');
        }
    },
    onImageLoadStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (++this.pending === 1) {
            this.parentView.$el.trigger('imagesLoadStart');
        }
    },
    onImageLoadEnd: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (--this.pending === 0) {
            this.parentView.$el.trigger('imagesLoadEnd');
        }
    },
    showImage: function(index, file, callback) {
        var image = new window.Image();
        var $container = this.$('[data-input=file' + index + ']');
        var $image = $container.children('.image');

        image.src = file.url = file.url || window.URL.createObjectURL(file);
        image.onerror = image.onload = function(event) {
            EXIF.getData(this);
            file.orientation = EXIF.getTag(this, 'Orientation') || 1;
            $image.removeClass('icons icon-addpicture').addClass('fill r' + file.orientation).css({
                'background-image': 'url(' + this.src + ')'
            });
            $container.addClass('loaded');
            if (callback) {
                callback();
            }
        };
    }
});

module.exports.id = 'post/images';
