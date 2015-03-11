'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/thanks');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var thanksPage = config.getForMarket(location.url, ['marketing','thanksPage'], '');

        return _.extend({}, data, {
            location: location,
            thanksPage: thanksPage
        });
    }
});