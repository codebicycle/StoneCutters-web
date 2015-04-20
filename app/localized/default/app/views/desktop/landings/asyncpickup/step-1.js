'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    className: 'step-1',
    events: {
        'click .posting': 'onSubmit',
        'click [data-viewmore]': 'showDescription',
        'click .arrow-hide': 'showDescription'
    },
    onSubmit: function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var step = $(event.target).data('step');

        this.$el.trigger('changeView', [step, 'next']);
    },
    showDescription: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.arrow-hide').fadeToggle();
        this.$('[data-viewmore]').fadeToggle();
        this.$('.desc').slideToggle();
    }
});

module.exports.id = 'landings/asyncpickup/step-1';