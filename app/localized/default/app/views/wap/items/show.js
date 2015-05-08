'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var breadcrumb = require('../../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var item = data.item;
        var imagesTotal = item.images.length;
        var direction = config.getForMarket(this.app.session.get('location').url, ['layoutOptions', 'direction'], {});
        var digits = config.getForMarket(this.app.session.get('location').url, ['layoutOptions', 'digits'], {});
        var next;
        var prev;
        var imgTotalTranslate = helpers.numbers.translate(item.images.length, {to: digits});
        var imagePos = parseInt((item.pos)? item.pos: 0);
        var itemUrl = helpers.common.slugToUrl(item);

        if(imagesTotal > 1 && (imagesTotal - 1) > imagePos ) {
            itemUrl += '?pos=' + (imagePos + 1);
            next = helpers.common.fullizeUrl(helpers.common.link(itemUrl, this.app, {}), this.app);
        }

        if(imagePos > 0) {
            itemUrl += '?pos=' + (imagePos + 1);
            prev = helpers.common.fullizeUrl(helpers.common.link(itemUrl, this.app, {
                pos: (imagePos - 1)
            }), this.app);
        }
        imagePos = (imagePos + 1);
        if(direction === 'rtl') {
            imagePos = helpers.numbers.translate(imagePos, {to: digits});
        }

        return _.extend({}, data, {
            imagesTotal: imagesTotal,
            imgTotalTranslate: imgTotalTranslate,
            imagePos: imagePos,
            prev: prev,
            next: next,
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'items/show';
