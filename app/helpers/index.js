'use strict';

module.exports = {
    nunjucks: require('./nunjucks'),
    controllers: require('./controllers'),
    analytics: require('./analytics'),
    categories: require('./categories'),
    marketing: require('./marketing'),
    seo: require('./seo'),
    common: require('./common')(),
    urls: require('./urls'),
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
        var lastMidnight = current - (current % (24*60*60));

        if (previous >= lastMidnight){
            return 'Hoy';
        }else if (previous >= (lastMidnight - (24*60*60))) {
            return 'ayer';
        }else{
            return previous.getMonth();
        }
    }
};
