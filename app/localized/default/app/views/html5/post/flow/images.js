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
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.selected = {};
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .image:not(.fill .image)': 'onImageClick',
        'click .remove': 'onRemoveClick',
        'change form': 'onChange',
        'submit form': 'onSubmit',
        'restart': 'onRestart'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Añadir fotos', this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
        this.parentView.$el.trigger('imagesSubmit', [this.selected]);
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
        var $container = $remove.parent().removeClass('fill');
        var $input = this.$('#' + $container.data('input')).val('');

        $container.removeAttr('style');
        delete this.selected[$input.attr('name')];
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $input = $(event.target);
        var $container = this.$('[data-input=' + $input.attr('id') + ']');
        var $image = $container.children('.image');
        //var $loading = $('body > .loading').show();
        var imageUrl = window.URL.createObjectURL(event.target.files[0]);
        var image = new window.Image();

        image.src = imageUrl;
        image.onload = function() {
            var exif = function(done) {
                EXIF.getData(image, done);
            }.bind(this);

            var post = function(done) {
                var data = new FormData();

                $image.addClass('load');

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
                    file: imageUrl
                };
                done();
            }.bind(this);

            var display = function() {
                var orientation = EXIF.getTag(image, 'Orientation');
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
                $image.css(css);
                $image.removeClass('load').addClass('fill');
                //$loading.hide();
            }.bind(this);

            asynquence().or(image.onerror)
                .then(exif)
                .then(post)
                .then(success)
                .then(display);
        }.bind(this);
        image.onerror = function(err) {
            delete this.selected[$input.attr('name')];
            $input.val('');
            //$loading.hide();
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
    }
});

module.exports.id = 'post/flow/images';
