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
        'click .filter-btn': 'filterAction',
        'click .see': 'filterAction'
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
    },
    filterAction: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $filter = $(event.currentTarget);
        var action = $filter.data('action');
        var $neighborhoodList = $('.neighborhood-list');
        var $cancel = $('.cancel-btn');
        var $seeMore = $('.see.more');
        var $seeLess = $('.see.less');
        var $neighborhoods = $('.neighborhood-list input:checked');
        var height = '60px';
        var animateTime = 500;

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
            console.log($neighborhoods);
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
    }
});

module.exports.id = 'items/partials/locations';
