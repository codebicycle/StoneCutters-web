'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'modal-edit-featuread-view',
    idModal: 'edit-featuread-modal',
    events: _.extend({}, Base.prototype.events, {
        'update': 'onUpdate'
    }),
    postRender: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    onUpdate: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.btnedit-modal').attr('href', options.href);
        $('.feature-ad-time').html(helpers.common.dateDiff.call(this, options.featuredDates.start, options.featuredDates.end));
    }
});

module.exports.id = 'modals/edit_feature_ad';
