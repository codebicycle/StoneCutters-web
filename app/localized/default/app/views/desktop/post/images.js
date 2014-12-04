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
    selected: {},
    pending: 0,
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.selected = {};
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
        var $input = this.$('#' + $container.data('input')).val('');

        delete this.selected[$input.attr('name')];
        this.parentView.$el.trigger('imagesLoadEnd', [this.selected]);
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
        var $container = this.$('[data-input=' + $input.attr('id') + ']');
        var $image = $container.children('.image');
        var imageUrl = window.URL.createObjectURL(event.target.files[0]);
        var image = new window.Image();
        var item;

        image.src = imageUrl;

        image.onload = function() {

            window.URL.revokeObjectURL(this.src);

            function exif(done) {
                EXIF.getData(image);
                done();
            }

            function post(done) {
                this.$el.trigger('imageLoadStart');
                $container.addClass('loading');
                item = new Item({
                    images: event.target.files,
                    postingSession: this.parentView.options.postingsession || this.parentView.options.postingSession,
                    location: this.app.session.get('location').url
                }, {
                    app: this.app
                });
                item.postImages(done);
            }

            function success(done, response, images) {
                this.selected[$input.attr('name')] = {
                    id: images.shift(),
                    file: imageUrl,
                    orientation: 1
                };
                done();
            }

            function display() {
                var orientation = EXIF.getTag(image, 'Orientation');
                var cssClass = 'fill r' + (orientation || 1);

                if (orientation) {
                    this.selected[$input.attr('name')].orientation = orientation;
                }
                $image.removeClass('icons icon-addpicture');
                $image.addClass(cssClass).css({
                    'background-image': 'url(' + imageUrl + ')'
                });
                $container.removeClass('loading').addClass('loaded');
                this.$el.trigger('imageLoadEnd');
            }

            asynquence().or(image.onerror)
                .then(exif.bind(this))
                .then(post.bind(this))
                .then(success.bind(this))
                .then(display.bind(this));
        }.bind(this);

        image.onerror = function(err) {
            this.$el.trigger('imageLoadEnd');
            delete this.selected[$input.attr('name')];
            $input.val('');
        }.bind(this);
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
            this.parentView.$el.trigger('imagesLoadEnd', [this.selected]);
        }
    }
});

module.exports.id = 'post/images';
