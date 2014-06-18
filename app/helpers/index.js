'use strict';

module.exports = {
    nunjucks: require('./nunjucks'),
    controllers: require('./controllers'),
    analytics: require('./analytics'),
    marketing: require('./marketing'),
    seo: require('./seo'),
    common: require('./common'),
    routes: require('./routes'),
    breadcrumb: require('./breadcrumb'),
    pagination: require('./pagination'),
    dataAdapter: require('./dataAdapter'),
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
    timeAgo: function(itemDate) {
        var current = new Date();
        var currentMonth = current.getMonth() + 1;
        var formatDate;
        var hour = (itemDate.hour < 10 ? '0' : '') + itemDate.hour;
        var minute = (itemDate.minute < 10 ? '0' : '') + itemDate.minute;
        var monthArr = ['00','01','02','03','04','05','06','07','08','09','10','11'];
        var diffDays = current.getDate() - itemDate.day;

        if (current.getFullYear() == itemDate.year && currentMonth == itemDate.month && diffDays === 0){
            formatDate = {'hour': hour + ':' + minute, 'dictionary': 'messages_date_format.Today' };
            return formatDate;
        }else if (current.getFullYear() == itemDate.year && currentMonth == itemDate.month && diffDays === 1 ) {
            formatDate = {'hour': hour + ':' + minute, 'dictionary': 'messages_date_format.Yesterday' };
            return formatDate;
        }else{
            formatDate = {'day': itemDate.day, 'dictionary': 'messages_date_format.1' + monthArr[itemDate.month] };
            return formatDate;
        }
    }
};
