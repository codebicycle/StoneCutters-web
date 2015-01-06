'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../../helpers');
var Filters = require('../../../../../../../modules/filters');

module.exports = Base.extend({
    className: 'items-locations',
    id: 'items-locations',
    tagName: 'nav',
    animateTime: 500,
    events: {
        'click [data-action=slide]': 'filterSlide',
        'click [data-action=filter]': 'filter',
        'click [data-action=selectMore]': 'selectMore',
        'click [data-action=see]': 'toggleNeighborhoods',
        'click [data-action=removeNeighborhood]': 'removeNeighborhood',
        'click [data-action=selectAll]': 'selectAll',
        'click [data-action=cancel]': 'cancel'
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
    },
    filterSlide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $neighborhoodList = $('.neighborhood-list');
        var $neighborhoodFirst = $('.neighborhood-first');
        var $cancel = $('.cancel-btn');
        var $filter = $('.filter-btn[data-action=filter]');
        var $seeMore = $('.see.more');

        $neighborhoodFirst.slideUp( function() {
            $neighborhoodList.slideDown();
        });

    },
    filter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath('path');
        var filtersId = '';
        var $neighborhoods = $('.neighborhood-list .neighborhoods input:checked');
        var filter = {
            name: 'neighborhood',
            type: 'SELECT'
        };

        if (this.filters.isActive(filter.name) && !$neighborhoods.length ) {
            this.filters.remove(filter);
            path = [path.split('/-').shift(), '/', this.filters.format()].join('');
            path = this.refactorPath(path);
            path = helpers.common.link(path, this.app);
            this.app.router.redirectTo(path);
        }
        else if ($neighborhoods.length > 0) {
            $neighborhoods.each(function (index) {
                if (index === $neighborhoods.length - 1) {
                    filtersId += $(this).val();
                }
                else {
                    filtersId += $(this).val() + '_';
                }
            });

            this.filters.remove(filter);
            filter.value = filtersId;
            this.filters.add(filter);
            path = [path.split('/-').shift(), '/', this.filters.format()].join('');
            path = this.refactorPath(path);
            path = helpers.common.link(path, this.app);
            this.app.router.redirectTo(path);
        }
    },
    selectMore: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $activeNeighborhoodsList = $('.active-neighborhoods');
        var $neighborhoodList = $('.neighborhood-list');
        var $activeNeighborhoods = $('.neighborhood-list .neighborhoods input:checked');
        var $neighborhoods = $('.neighborhood-list .neighborhoods input');

        if ($activeNeighborhoods.length === $neighborhoods.length) {
            $('.neighborhood-list .select-all input')[0].checked = true;
        }

        $activeNeighborhoodsList.slideUp( function() {
            $neighborhoodList.slideDown();
        });

    },
    toggleNeighborhoods: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $neighborhoodList = $('.neighborhood-list .hidden-neighborhoods');
        var $see = $('.see');

        $neighborhoodList.slideToggle();
        $see.toggleClass('hide');

    },
    removeNeighborhood: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var path = this.getPath('path');
        var filter = {
            name: 'neighborhood',
            type: 'SELECT',
            value: $target.data('id').toString()
        };

        this.filters.remove(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);

    },
    selectAll: function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $neighborhoods = $('.neighborhood-list .neighborhoods input');

        if($target.is(':checked')) {
            $neighborhoods.each(function() {
                this.checked = true;
            });
        }
        else{
            $neighborhoods.each(function() {
                this.checked = false;
            });
        }

    },
    cancel: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $activeNeighborhoods = $('.active-neighborhoods');
        var $neighborhoodList = $('.neighborhood-list');
        var $neighborhoodFirst = $('.neighborhood-first');

        if (this.filters.isActive('neighborhood')) {
            $neighborhoodList.slideUp( function() {
                $activeNeighborhoods.slideDown();
            });
        }
        else {
            $neighborhoodList.slideUp( function() {
                $neighborhoodFirst.slideDown();
            });
        }
    },
    getPath: function() {
        var path = this.app.session.get('path');
        var currentRoute = this.app.session.get('currentRoute');
        var category;

        if (currentRoute.action === 'staticSearch') {
            path = path.replace('/q/', '/nf/search/');
            if (path.match(/\/c-[0-9]+/)) {
                category = path.replace(/.*\/(c-[0-9]+).*/, '$1');
                path = path.replace(/\/(c-[0-9]+)/, '');
                path = path.replace('/search/', '/des-cat' + category.substring(1) + '/');
            }
        }
        return path;
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path.replace(/\/\//g, '/');
    }
});

module.exports.id = 'items/partials/locations';
