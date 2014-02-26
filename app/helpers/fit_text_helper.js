module.exports = {
    fitText: function (element, kompressor, options){
        var compressor = kompressor || 1;
        var settings = $.extend({
            'minFontSize' : Number.NEGATIVE_INFINITY,
            'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);
        function resizer($self) {
            $self.css('font-size', Math.max(Math.min($self.width() / (compressor * 10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
        };
        return element.each(function resize() {
            resizer($(this));
            $(window).on('resize.fittext orientationchange.fittext', function onResize() {
                resizer($(this));
            });
        });
    }
};
