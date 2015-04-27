'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/keywords');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'keywords-view',
    className: 'keywords-view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var headerTitle = this.app.seo.get('topTitle');

        if(location.url === 'www.olx.com.ar'){
           headerTitle = this.app.seo.get('title');
        }

        return _.extend({}, data, {
            seo: this.app.seo,
            headerTitle: headerTitle
        });
    }
});
