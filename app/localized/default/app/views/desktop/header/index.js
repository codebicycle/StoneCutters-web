'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header',
    className: 'header-view clearfix',
    postRender: function() {

    }
});
