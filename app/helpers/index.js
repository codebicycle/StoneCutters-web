'use strict';

module.exports = {
    nunjucks: require('./nunjucks'),
    environment: require('./environment'),
    analytics: require('./analytics'),
    categories: require('./categories'),
    marketing: require('./marketing'),
    cookies: require('./cookies'),
    fitText: function(element, kompressor, options) {
        var compressor = kompressor || 1;
        var settings = $.extend({
            'minFontSize' : Number.NEGATIVE_INFINITY,
            'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

        function onResize() {
            var $this = $(this);
            var max = parseFloat(settings.maxFontSize);
            var min = parseFloat(settings.minFontSize);

            $this.css('font-size', Math.max(Math.min($this.width() / (compressor * 10), max), min));
        }

        return element.each(function resize() {
            $(window).on('resize.fittext orientationchange.fittext', onResize).trigger('resize.fittext');
        });
    },
    timeAgo: function(previous) {
        var current = new Date();
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;
        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed/1000) + ' seconds ago';
        }
        else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' minutes ago';
        }
        else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' hours ago';
        }
        else if (elapsed < msPerMonth) {
            return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
        }
        else if (elapsed < msPerYear) {
            return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
        }
        else {
            return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
        }
    }
};
