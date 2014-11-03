'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer-view',
    className: 'footer-view',
     events: {
        'click [data-footer-slidedown]': 'slideDownContent',
        'click [data-footer-slide]': 'slideFooter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            user: this.app.session.get('user'),
            inHome: this.isHome || false
        });
    },
    postRender: function () {
        this.app.router.appView.on('home:start', this.onHomeStart.bind(this));
        this.app.router.appView.on('home:end', this.onHomeEnd.bind(this));
    },
    slideDownContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $slide = $('.footer-slide.open');
        var $select = $('.select li.active');

        $slide.addClass('onTransition');
        $slide.removeClass('open');
        $slide.slideToggle('slow', function() {
            $select.removeClass('active');
            $slide.removeClass('onTransition');
        });
    },
    slideFooter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $current = $(event.currentTarget);
        var $currentSlide = $('.' + $current.data('footer-slide'));
        var $slide = $('.footer-slide');
        var $select = $('.select li');

        if(!$select.parent().hasClass('onTransition')){
            if($slide.hasClass('open') && !$currentSlide.hasClass('open')) {
                $select.parent().addClass('onTransition');
                $slide.filter('.open').slideToggle('slow', function() {
                    $slide.filter('.open').toggleClass('open');
                    $select.removeClass('active');
                    $current.parent().addClass('active');
                    $currentSlide.slideToggle('slow', function() {
                        $currentSlide.toggleClass('open');
                        $select.parent().removeClass('onTransition');
                    });
                });
            }
            else {
                $select.parent().addClass('onTransition');
                $currentSlide.slideToggle('slow', function() {
                    $current.parent().toggleClass('active');
                    $currentSlide.toggleClass('open');
                    $select.parent().removeClass('onTransition');
                });
            }
        }
    },
    onHomeStart: function () {
        this.isHome = true;
        this.render();
    },
    onHomeEnd: function () {
        this.isHome = false;
        this.render();
    }
});
