'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-searchig-view',
    className: 'items-searchig-view',
    tagName: 'main',
    order: ['parentcategory', 'state', 'city'],
    events: {
        'click .sub-categories li a': 'categoryFilter',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title span.icons': 'toogleFilter'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var linkig = this.app.session.get('path');
        var link = linkig.replace('-ig', '');
        var filters = Filters.sort(this.order, data.metadata.filters);

        if (!this.filters) {
            this.filters = new Filters(link);
        }
        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items,
            filters: filters,
            wFilters: this.filters,
            nav: {
                link: link,
                linkig: linkig,
                galeryAct: 'active',
                current: 'searchig'
            }
        });
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(this.app.session.get('path'));
        }
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    },
    toogleFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $filter = $(event.currentTarget);
        var filterName = $filter.data('filter-name');

        $filter.toggleClass('icon-arrow-top');
        $('.' + filterName).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path').split('/-').shift();
        path = this.cleanPath(path);

        this.app.router.redirectTo(path);
    },
    categoryFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);
        var filterSlug = $target.data('filter-slug');

        if (!filterSlug) {
            filterSlug  = ['/des-cat-', $target.data('filter-id'), '/'].join('');
        }

        path = path.replace('/search/', filterSlug);
        path = this.refactorPath(path);

        this.app.router.redirectTo(path);
    },
    refactorPath: function(path) {
        var regexpFindPage = /-p-[0-9]+-ig/;
        var regexpReplacePage = /(-p-[0-9]+-ig)/;
        var regexpFindGallery = /-ig/;
        var regexpReplaceGallery = /(-ig)/;
        var regexpReplaceCategory = /([a-zA-Z0-9-]+-cat-[0-9]+)/;
        var page = '';

        if (path.match(regexpFindPage)) {
            page = path.match(regexpFindPage).shift();
            path = path.replace(regexpReplacePage, '');
        }
        else if (path.match(regexpFindGallery)) {
            page = path.match(regexpFindGallery).shift();
            path = path.replace(regexpReplaceGallery, '');
        }
        path = path.replace(regexpReplaceCategory, '$1' + page);

        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPath: function(path) {
        var regexpFindPage = /-p-[0-9]+-ig/;
        var regexpReplacePage = /(-p-[0-9]+-ig)/;
        var regexpFindGallery = /-ig/;
        var regexpReplaceGallery = /(-ig)/;
        var regexpReplaceCategory = /([a-zA-Z0-9-]+-cat-[0-9]+)/;
        var page = '';

        if (path.match(regexpFindPage)) {
            page = path.match(regexpFindPage).shift();
            path = path.replace(regexpReplacePage, '');
        }
        else if (path.match(regexpFindGallery)) {
            page = path.match(regexpFindGallery).shift();
            path = path.replace(regexpReplaceGallery, '');
        }
        path = path.replace(regexpReplaceCategory, 'search');

        if (path.slice(path.length - 1) !== '/') {
            path += '/';
        }
        path += page;
        return path;
    }
});

module.exports.id = 'items/searchig';
