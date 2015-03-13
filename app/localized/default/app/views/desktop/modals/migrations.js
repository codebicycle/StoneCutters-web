'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('modals/modal', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'modal-migrations-view',
    idModal: 'migrations-modal'
});

module.exports.id = 'modals/migrations';
