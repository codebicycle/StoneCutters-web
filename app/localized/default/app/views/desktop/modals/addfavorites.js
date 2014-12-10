'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'modal-addfavorites-view',
    idModal: 'favorites-modal'
});

module.exports.id = 'modals/addfavorites';