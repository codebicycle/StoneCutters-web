'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('featured/listings');

module.exports = Base.extend({
    tagName: 'main',
    id: 'featured-listings-view',
    className: 'page-standart'
});
