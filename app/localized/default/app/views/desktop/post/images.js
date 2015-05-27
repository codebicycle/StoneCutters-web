'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    id: 'posting-images-view',
    tagName: 'fieldset',
    className: 'posting-images-view field-wrapper',
    pending: 0,
    events: {
        'imageLoadStart': onImageLoadStart,
        'imageLoadEnd': onImageLoadEnd,
        'change input[type=file]': onChange,
        'click .image:not(.fill .image)': onClickImage,
        'click input[type=file]': onClickInput,
        'click .remove': onClickRemove,
        'click .experiment-growth-load-image-from-mobile a': onClickLoadImageMobile
    },
    getTemplateData: getTemplateData,
    postRender: postRender,
    showImage: showImage
});

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var sixpackCurrentAlternative = this.app.sixpack.experiments.growthLoadImageFromMobile ? this.app.sixpack.experiments.growthLoadImageFromMobile.alternative : '';
 
    return _.extend({}, data, {
        experiments: sixpackCurrentAlternative === 'control' ? {} : this.app.sixpack.experiments
    });
}

function postRender() {
    var images = this.parentView.getItem().get('images');

    _.each(images.slice(0, 6), this.showImage, this);
}

function showImage(file, index, callback) {
    var $container = this.$('[data-input=file' + index + ']');
    var $image = $container.children('.image');
    var image = new window.Image();

    image.src = file.url = file.url || window.URL.createObjectURL(file);
    image.onerror = image.onload = function(event) {
        EXIF.getData(this);
        file.orientation = EXIF.getTag(this, 'Orientation') || 1;
        $image.removeClass('icons icon-addpicture').addClass('fill r' + file.orientation).css({
            'background-image': 'url(' + this.src + ')'
        });
        $container.addClass('loaded');
        if (_.isFunction(callback)) {
            callback();
        }
    };
}

function onImageLoadStart(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (++this.pending === 1) {
        this.parentView.$el.trigger('imagesLoadStart');
    }
}

function onImageLoadEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (--this.pending === 0) {
        this.parentView.$el.trigger('imagesLoadEnd');
    }
}

function onChange(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $input = $(event.currentTarget);
    var input = $input.attr('id');
    var index = input.replace('file', '');
    var $container = this.$('[data-input=' + input + ']').addClass('loading');
    var $image = $container.children('.image');
    var image = event.target.files[0];

    asynquence().or(fail.bind(this))
        .then(validate.bind(this))
        .then(post.bind(this))
        .then(success.bind(this))
        .val(done.bind(this));

    function validate(done) {
        if (image.size > 5242880) {
            done.abort();
            statsd.increment([this.app.session.get('location').abbreviation, 'posting', 'error', 'size', this.app.session.get('platform')]);
            this.$('small.hint.message').addClass('error');
            return $container.removeClass('loading');
        }
        done();
    }

    function post(done) {
        this.$el.trigger('imageLoadStart');
        this.parentView.getItem().get('images')[index] = image;
        this.parentView.getItem().postImages(done);
    }

    function success(done) {
        this.showImage(image, index, done);
    }

    function done() {
        this.$el.trigger('imageLoadEnd');
        this.$('small.hint.message').removeClass('error');
        $container.removeClass('loading');
    }

    function fail(err) {
        this.$el.trigger('imageLoadEnd');
        this.parentView.getItem().get('images').splice(index, 1);
        this.$('small.hint.message').addClass('error');
        $container.removeClass('loading');
        $input.val('');
    }
}

function onClickImage(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $image = $(event.currentTarget);
    var $container = $image.parent();
    var $input = this.$('#' + $container.data('input'));

    this.$('small.hint.message').removeClass('error');
    $input.click();
}

function onClickInput(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
}

function onClickRemove(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $remove = $(event.currentTarget);
    var $container = $remove.parent().removeClass('loaded');
    var $image = $container.find('.image').removeClass('fill').removeAttr('style').addClass('icons icon-addpicture');
    var input = $container.data('input');
    var $input = this.$('#' + input).val('');

    this.parentView.getItem().get('images').splice(input.replace('file', ''), 1);
}

function onClickLoadImageMobile(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $container = $(event.currentTarget).parent().addClass('loading');

    window.setTimeout(function() {
        $container.removeClass('loading').addClass('msj').delay(7000).fadeOut();
    }, 1000);

    this.app.sixpack.convert(this.app.sixpack.experiments.growthLoadImageFromMobile);
}

module.exports.id = 'post/images';
