'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/filter');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');

module.exports = Base.extend({
    order: ['pricerange', 'hasimage', 'state', 'parentcategory'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        this.filters = data.filters;
        this.filters.order = this.order;
        return _.extend({}, data, {});
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
    },
    events: {
        'change .check-box input': 'selectFilter',
        'submit': 'onSubmit'
    },
    onStart: function(event) {
        this.appView.trigger('filter:start');
    },
    onEnd: function(event) {
        this.appView.trigger('filter:end');
    },
    selectFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $this = $(event.currentTarget);
        var val = $this.val();
        var filter = {
            name: $this.closest('fieldset').data('filter-name'),
            type: $this.closest('fieldset').data('filter-type'),
            value: val
        };

        if ($this.is(':checked') && !this.filters.has(filter.name, filter.value)) {
            // $this.closest('fieldset').find('a').attr('data-filter-value', val);
            this.filters.add(filter);
        } else {
            this.filters.remove(filter);
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var filters = this.filters;
        var path = this.app.session.get('path');
        var values = this.$('[data-filter-type=RANGE]');
        var $this;
        var filter = {};
        var val;
        var val2;

        values.each(function setValues(){
            $this = $(this);
            filter = {
                name: $this.data('filter-name'),
                type: $this.data('filter-type')
            };

            val = $this.find('[data-filter-id=from]').val();
            val2 = $this.find('[data-filter-id=to]').val();

            if (!val && !val2) {
                return filters.remove(filter);
            }

            filter.value = {
                from: val,
                to: val2
            };

            filters.add(filter);

        });

        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        path = path.replace('/filter', '');
        return path.split('/-').shift();
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    }

});