'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_images_view disabled',
    id: 'images',
    tagName: 'section',
    pending: 0,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        
        return _.extend({}, data, {
            slots: 6
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .display': 'onDisplayClick',
        'click .remove': 'onRemoveClick',
        'click .input': 'onInputClick',
        'change form': 'onChange',
        'submit form': 'onSubmit',
        'imageLoadStart': 'onImageLoadStart',
        'imageLoadEnd': 'onImageLoadEnd',
        'preloadImages': 'onPreloadImages'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations.get(this.app.session.get('selectedLanguage'))['item.AddPhotos'], this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onDisplayClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var position = 0;
        var images = this.parentView.getItem().get('images');
        var $file = $(event.currentTarget).parent();
        var $files = this.$('.file');
        
        if (images.length) {
            position = $files.index($file);
            if (!images[position]) {
                position = images.length;
            }
        }
        this.$('#file' + position).trigger('click', [position]);
    },
    onRemoveClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $remove = $(event.currentTarget);
        var $image = $remove.siblings('.display').removeClass('fill r1 r2 r3 r4 r5 r6').removeAttr('style');
        var $file = $remove.parent().removeClass('loaded');
        var $files = $file.parent().find('.file');
        var $input = this.$('.input').eq($files.index($file));

        this.parentView.getItem().get('images').splice($files.index($file), 1);
        $input.replaceWith($input.clone(true));
        $files.parent('.files').append($file.detach());
        this.parentView.$el.trigger('imagesLoadEnd');
    },
    onInputClick: function(event, position) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $input = $(event.target).data('position', position);
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var image = event.target.files[0];
        var position = $(event.target).data('position');
        var $file = this.$('.file').eq(position);
        var $image = $file.find('.display');

        asynquence().or(fail.bind(this))
            .then(reset.bind(this))
            .then(post.bind(this))
            .then(success.bind(this))
            .val(done.bind(this));

        function reset(done) {
            $file.removeClass('loaded');
            done();
        }

        function post(done) {
            this.$el.trigger('imageLoadStart');
            $file.addClass('loading');
            this.parentView.getItem().get('images')[position] = image;
            this.parentView.getItem().postImages(done);
        }

        function success(done) {
            this.showImage(position, image, done);
        }

        function done() {
            this.$el.trigger('imageLoadEnd');
            $file.removeClass('loading');
        }

        function fail(err) {
            this.$el.trigger('imageLoadEnd');
            this.parentView.getItem().get('images').splice(position, 1);
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id]);
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
    onPreloadImages: function(event, images) {
        var $display = this.$('.display');

        _.each(images, function each(image, index) {
            var imageUrl = image.thumbnail;
            var className = 'fill';

            if (image.orientation) {
                className += ' r' + image.orientation;
                imageUrl = image.url;
            }
            $display.eq(index).addClass(className).css({
                'background-image': 'url(' + imageUrl + ')'
            }).parent('.file').addClass('loaded');
        });

    },
    showImage: function(index, file, callback) {
        var image = new window.Image();
        var $file = this.$('.file').eq(index);
        var $display = $file.children('.display');

        image.src = file.url = file.url || window.URL.createObjectURL(file);
        image.onerror = image.onload = function(event) {
            EXIF.getData(this);
            file.orientation = EXIF.getTag(this, 'Orientation') || 1;
            $display.addClass('fill r' + file.orientation).css({
                'background-image': 'url(' + this.src + ')'
            });
            $file.addClass('loaded');
            if (callback) {
                callback();
            }
        };
    }
});

module.exports.id = 'post/flow/images';
