'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var config = require('../../../../../../../../shared/config');

module.exports = Base.extend({
    id: 'relateds',
    postRender: function() {
        var location = this.app.session.get('location');

        if (!config.getForMarket(location.url, ['relatedAds', 'desktop', 'enabled'], false)) {
            return;
        }

        var id = this.id;
        var data = {
            module: config.getForMarket(location.url, ['relatedAds', 'desktop', 'module'], 'suggestion'),
            country: location.abbreviation,
            item: this.parentView.getItem().get('id'),
            title: translations.get(this.app.session.get('selectedLanguage'))['itemgeneraldetails.RelatedListings'],
            group: config.getForMarket(location.url, ['relatedAds', 'desktop', 'group'], 2),
            quantity: config.getForMarket(location.url, ['relatedAds', 'desktop', 'quantity'], 'default'),
            layout: config.getForMarket(location.url, ['relatedAds', 'desktop', 'layout'], 3),
            language: this.app.session.get('selectedLanguage'),
            location: location.url,
            callback: 'samuraiCallback'
        };

        $('<iframe></iframe>')
            .attr({
                height: 1,
                width: 1,
                src: 'about:blank',
                style: 'display: none;'
            })
            .on('load', onLoad)
            .appendTo(this.$el);

        function onLoad() {
            var content = '<div class="clm-samurai"';

            _.each(data, function each(value, key) {
                content += ' data-' + key + '="' + value + '"';
            });
            content += '></div>';
            content += '<script type="text/javascript">window.samuraiCallback = function(html) { window.parent.$("#'  + id + '").html(html); };</script>';
            content += '<script type="text/javascript" async src="' + config.getForMarket(location.url, ['relatedAds', 'desktop', 'link'], 'http://samurai.onap.io/samurai.js') + '"></script>';
            (this.contentDocument || this.contentWindow.document).write(content);
        }
    }
});

module.exports.id = 'items/partials/relatedads';
