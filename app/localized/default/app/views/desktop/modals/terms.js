'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    id: 'modal-terms-view',
    idModal: 'terms-modal',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');

        return _.extend({}, data, {
            terms: _.contains(config.get(['terms', platform]), location.url) ? location.url : 'default'
        });
    }
});

module.exports.id = 'modals/terms';