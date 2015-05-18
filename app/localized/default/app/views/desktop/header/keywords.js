'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/keywords');
var _ = require('underscore');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'header',
    id: 'keywords-view',
    className: 'keywords-view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var currentRoute = this.app.session.get('currentRoute');
        var headerTitle = this.app.seo.get('topTitle');
        
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        
        if(location.url === 'www.olx.com.ar' && currentRoute.controller === 'categories' && currentRoute.action === 'list'){   
            headerTitle = this.dictionary['misc.FreeClassifieds-SEO'].replace('<<AREA>>', (location.current || location).name);
        }

        return _.extend({}, data, {
            seo: this.app.seo,
            headerTitle: headerTitle
        });
    }
});
