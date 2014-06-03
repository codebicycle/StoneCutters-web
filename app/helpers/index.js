'use strict';

module.exports = {
    nunjucks: require('./nunjucks'),
    app: require('./app'),
    controllers: require('./controllers'),
    analytics: require('./analytics'),
    categories: require('./categories'),
    marketing: require('./marketing'),
    seo: require('./seo'),
    common: require('./common'),
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
        var month = [];
        month[0] = '01';
        month[1] = '02';
        month[2] = '03';
        month[3] = '04';
        month[4] = '05';
        month[5] = '06';
        month[6] = '07';
        month[7] = '08';
        month[8] = '09';
        month[9] = '10';
        month[10] = '11';
        month[11] = '12';

        if (previous >= lastMidnight){
            return 'messages_date_format.Today';
        }else if (previous >= (lastMidnight - (24*60*60))) {
            return 'messages_date_format.Yesterday';
        }else{
            return 'messages_date_format.1'+month[previous.getMonth()];
        }
    }
};
