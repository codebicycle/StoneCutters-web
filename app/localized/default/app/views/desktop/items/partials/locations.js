'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../../helpers');
var Filters = require('../../../../../../../modules/filters');

module.exports = Base.extend({
    className: 'items-locations',
    id: 'items-locations',
    tagName: 'nav',
    events: {
        'click [data-action=slide]': 'filterSlide',
        'click [data-action=filter]': 'filter',
        'click [data-action=selectMore]': 'selectMore',
        'click [data-action=seeLess]': 'seeLess',
        'click [data-action=seeMore]': 'seeMore'
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
        var animateTime = 500;
        var $neighborhoodList = $('.neighborhood-list');
        var $neighborhoodFirst = $('.neighborhood-first');
        var $cancel = $('.cancel-btn');
        var $filter = $('.filter-btn[data-action=filter]');
        var $seeMore = $('.see.more');

        $neighborhoodFirst.slideUp( parseInt(animateTime), function() {
            $neighborhoodList.slideDown(parseInt(animateTime));
        });

    },
    filter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath('path');
        var filtersId = '';
        var $neighborhoods = $('.neighborhood-list input:checked');
        var filter = {
            name: 'neighborhood',
            type: 'SELECT'
        };

        $($neighborhoods).each(function (index) {
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

    },
    selectMore: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $activeNeighborhoods = $('.active-neighborhoods');
        var $neighborhoodList = $('.neighborhood-list');
        var animateTime = 500;

        $activeNeighborhoods.slideUp( parseInt(animateTime), function() {
            $neighborhoodList.slideDown(parseInt(animateTime));
        });

    },
    seeLess: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var $neighborhoodList = $('.neighborhood-list ul');
        var $seeMore = $('.see.more');
        var animateTime = 500;
        var height = '60px';

        $neighborhoodList.animate({height: height}, parseInt(animateTime));
        $seeMore.removeClass('hide');
        $target.addClass('hide');

    },
    seeMore: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var animateTime = 500;
        var $neighborhoodList = $('.neighborhood-list ul');
        var $seeLess = $('.see.less');
        var curHeight = $neighborhoodList.height();
        var autoHeight = $neighborhoodList.css('height', 'auto').height();

        $neighborhoodList.height(curHeight);
        $neighborhoodList.stop().animate({ height: autoHeight }, parseInt(animateTime));
        $target.addClass('hide');
        $seeLess.removeClass('hide');
    },

    /*
    filterAction: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $seeLess = $('.see.less');
        var $neighborhoods = $('.neighborhood-list input:checked');

        if (action === 'slide') {
            $neighborhoodList.addClass('open');
            $neighborhoodList.animate({height: height}, parseInt(animateTime));
            $filter.data('action', 'filter');
            $seeMore.removeClass('hide');
            $cancel.removeClass('hide');
        }
        else if (action === 'seeMore') {
            var curHeight = $neighborhoodList.height();
            var autoHeight = $neighborhoodList.css('height', 'auto').height();

            $neighborhoodList.height(curHeight);
            $neighborhoodList.stop().animate({ height: autoHeight }, parseInt(animateTime));
            $seeMore.addClass('hide');
            $seeLess.removeClass('hide');
        }
        else if (action === 'seeLess') {
            $neighborhoodList.animate({height: height}, parseInt(animateTime));
            $seeMore.removeClass('hide');
            $seeLess.addClass('hide');
        }
        else if (action === 'filter' && $neighborhoods.length > 0) {
            var path = this.getPath('path');
            var filtersId = '';
            var filter = {
                name: 'neighborhood',
                type: 'SELECT'
            };

            $($neighborhoods).each(function (index) {
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
    },*/
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
