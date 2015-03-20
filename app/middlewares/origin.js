'use strict';

var _ = require('underscore');

module.exports = function(params, next) {
    if (isListing.call(this)) {
        this.app.session.persist({
            origin: {
                type: getType.call(this),
                isGallery: ~this.app.session.get('path').indexOf('-ig')
            }
        });
    }
    next();
};

function isListing() {
    return this.currentRoute.controller === 'searches' || (this.currentRoute.controller === 'categories' && this.currentRoute.action !== 'list');
}

function getType() {
    if (this.currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], this.currentRoute.action)) {
        return 'search';
    }
    return 'browse';
}
