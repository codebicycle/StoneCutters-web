'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/sort');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({    
    events: {
        //'click #form-sort input[type="radio"]': 'onEnableSort',
        'submit': 'onSubmit'
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);        
        //$('#form-sort #btn-sort').on('click', this.onSort.bind(this));        
    },
    onSort: function(event){
        event.preventDefault();
        var toOrder = $("#form-sort input[type='radio']:checked").val();
        var datos = $('#form-sort').serializeArray();
        var data = Base.prototype.getTemplateData.call(this);
        var newurl = helpers.filters.generateFilterOrder(datos, data, 'sort');
        
        helpers.common.redirect.call(this.app.router, newurl, null, {
            status: 200
        });
    },
    onEnableSort: function(event) {
        $('#btn-sort').attr('disabled',false).removeClass('disabled');
    },
    onStart: function(event) {
        this.appView.trigger('sort:start');
    },
    onEnd: function(event) {
        this.appView.trigger('sort:end');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var data = Base.prototype.getTemplateData.call(this);
        var url = data.referer || data.url.replace('/sort', '');

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    }
});
