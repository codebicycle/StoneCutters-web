'use strict';

var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_images_view disabled',
    id: 'images',
    tagName: 'section',
    selected: {},
    pending: 0,
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.selected = {};
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .image:not(.fill .image)': 'onImageClick',
        'click .remove': 'onRemoveClick',
        'click input[type=file]': 'onInputClick',
        'change form': 'onChange',
        'submit form': 'onSubmit',
        'restart': 'onRestart',
        'imageLoadStart': 'onImageLoadStart',
        'imageLoadEnd': 'onImageLoadEnd'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [this.parentView.dictionary['item.AddPhotos'], this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
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
        var $image = $container.find('.image').removeClass('fill').removeAttr('style');
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

        image.src = imageUrl;
        
        image.onload = function() {
        
            window.URL.revokeObjectURL(this.src);

            var exif = function(done) {
                EXIF.getData(image);
                done();
            }.bind(this);

            var post = function(done) {
                var data = new FormData();

                this.$el.trigger('imageLoadStart');
                $container.addClass('loading');
                data.append(0, event.target.files[0]);
                helpers.dataAdapter.post(this.app.req, '/images', {
                    query: {
                        postingSession: this.parentView.options.postingsession,
                        url: this.app.session.get('location').url
                    },
                    data: data,
                    multipart: true,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    contentType: false
                }, done);
            }.bind(this);

            var success = function(done, res) {
                    this.selected[$input.attr('name')] = {
                    id: res.shift(),
                    file: imageUrl,
                    orientation: 1
                };
                done();
            }.bind(this);

            var display = function() {
                var orientation = EXIF.getTag(image, 'Orientation');
                var cssClass = 'fill r' + (orientation || 1);
                
                if (orientation) {
                    this.selected[$input.attr('name')].orientation = orientation;
                }
                $image.addClass(cssClass).css({
                    'background-image': 'url(' + imageUrl + ')'
                });
                $container.removeClass('loading').addClass('loaded');
                this.$el.trigger('imageLoadEnd');
            }.bind(this);

            asynquence().or(image.onerror)
                .then(exif)
                .then(post)
                .then(success)
                .then(display);
        }.bind(this);
        
        image.onerror = function(err) {
            this.$el.trigger('imageLoadEnd');
            delete this.selected[$input.attr('name')];
            $input.val('');
        }.bind(this);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id]);
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.selected = {};
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

module.exports.id = 'post/flow/images';