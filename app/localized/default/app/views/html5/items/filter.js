'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/filter');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var filters = data.filters;
        var order = ['pricerange','hasimage','state','parentcategory'];
        var list = [];

        _.each(order, function(obj, i){
            _.find(filters, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });
        return _.extend({}, data, {
            filtersOrd: list
        });
    },
    events: {
        //'click .orange': 'applyFilter',
        //'click .clear': 'clearForm',
        //'click a.location': 'setUrlLocation',

        'submit': 'onSubmit',
        'click a': 'aClick'
    },
    clearForm: function(event) {
        event.preventDefault();
        var data = this.getData();
        var applied = data.appliedstring;
        var url;

        var removeParams = function (url, params){
            var trimUrl;

            if (params) {
                trimUrl = url.split(params + '/');
                url = trimUrl.join('');
            }

            return url;
        };

        url = removeParams(this.getData(), applied);

        $("#filter").trigger('reset');

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    },
    parseUrl: function(url) {
        if(url.indexOf('//')) {
            url = url.split('//').join('')
                .split('/').slice(1, url.length)
                .join('/').split('?').slice(0, 1)
                .join('');
        }
        return url;
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
    },
    onStart: function(event) {
        this.appView.trigger('filter:start');
    },
    onEnd: function(event) {
        this.appView.trigger('filter:end');
    },
    getData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return data;
    },
    setUrlLocation: function(event) {
        var datos = this.$('#filter').serializeArray();

        var url = this.parseUrl(helpers.filters.generateFilterOrder(datos, this.getData(), 'filter'));
        var trimUrl = url.split('/');

        if (trimUrl[trimUrl.length-1] !== '') {
            url = trimUrl.join('/') + '/';
        }

        $(event.target).attr('href', '/location?target=' + url + 'filter');
    },
    applyFilter: function(event) {
        event.preventDefault();

        var datos = $('#filter').serializeArray();
        var url = helpers.filters.generateFilterOrder(datos,this.getData(), 'filter');

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    },

    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var data = this.getData();
        var url = data.referer || data.url.replace('/filter', '');

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    },
    aClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
});