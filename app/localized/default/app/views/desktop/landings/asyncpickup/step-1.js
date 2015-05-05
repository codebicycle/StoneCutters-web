'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'step-1',
    events: {
        'click .posting': 'onSubmit'
    },
    onSubmit: function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var step = $(event.target).data('step');

        this.$el.trigger('track', [{
            event: 'click-step-' + step
        }]);
        this.$el.trigger('changeView', [step, 'next']);
    }
});

module.exports.id = 'landings/asyncpickup/step-1';