'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/sort');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');
var Filters = require('../../../../../../modules/filters');

module.exports = Base.extend({
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /([a-zA-Z0-9-]+-cat-[0-9]+)/,
    events: {
        'click #form-sort input[type="radio"]': 'onEnableSort',
        'submit': 'onSort'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        if (!this.filters) {
            this.filters = new Filters(null, {
                    app: this.app,
                    path: this.app.session.get('path')
                });
        }
        return _.extend({}, data, {
            filters: this.filters
        });
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
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
    onSort: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);
        var toSort = $('input[name="sort"]:checked').val();
        var filter = {
            name: 'sort',
            type: 'SELECT'
        };

        this.filters.remove(filter);
        filter.value = toSort;
        this.filters.add(filter);
        path = path.replace(/(\/sort)/i,'');
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        return path;
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    }
});
