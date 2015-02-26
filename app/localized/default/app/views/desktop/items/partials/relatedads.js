'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');

module.exports = Base.extend({
    className: 'clm-samurai',
    id: 'related-ads',
    postRender: function() {
        var id = this.id;
        var data = {
            module: 'suggestion',
            country: this.app.session.get('location').id,
            item: this.parentView.getItem().get('id'),
            group: '2',
            title: translations.get(this.app.session.get('selectedLanguage'))['itemgeneraldetails.RelatedListings'],
            quantity: '3',
            layout: 'default',
            language: this.app.session.get('selectedLanguage'),
            location: this.app.session.get('location').url,
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
            content += '<script type="text/javascript" async src="http://clm-samurai-demo.onap.io/samurai.js"></script>';
            (this.contentDocument || this.contentWindow.document).write(content);
        }
    }
});

module.exports.id = 'items/partials/relatedads';
