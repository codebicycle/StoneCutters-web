'use strict';

var Base = require('../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'items_search_view',
    wapAttributes: {
        cellpadding: 0
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    },
    postRender: function() {
       var listingView = 'listView';

        if (typeof window !== 'undefined' && localStorage) {
            listingView = localStorage.getItem('listingView');
        }
        else {
            listingView = this.app.session.get('listingView');
        }
        if (listingView == 'galView') {
            switchView();
        }
        $('.switchView').click((function onClick(e) {
            switchView();
            var current = ($('.gallery-list').length === 0 ? 'listView' : 'galView');
            if (typeof window !== 'undefined' && localStorage) {
                localStorage.setItem('listingView', current);
            }else{
                this.app.session.persist({
                    listingView: current
                });
            }
        }).bind(this));

        function loadImages(url , $this) {
            var newImg = new Image();

            newImg.src = url;
            newImg.onload = function() {
                $this.css('background-image', 'url(' + url + ')');
            };
        }

        function switchView() {
            $('section#itemListing ul').toggleClass('gallery-list');
            $('.switchView').toggleClass('gallery');
            $('.filled').each(function() {
                var url = $(this).attr('data-fullimg');
                loadImages(url , $(this));
            });
        }
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'items/search';
