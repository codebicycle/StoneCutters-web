'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');
var breadcrumb = require('../../../../../modules/breadcrumb');
var userzoom = require('../../../../../modules/userzoom');

module.exports = Base.extend({
    className: 'categories_show_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.userzoom = new userzoom({}, {
            app: this.app
        });

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            items: data.items,
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters'),
            isUserzoomEnabled: this.userzoom.isEnabled(data.currentCategory.id),
            userzoom: this.userzoom.getParams(data.currentCategory.id)
        });
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
        $('.switchView').click((function(e) {
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
                $this.css('background-image', 'url('+url+')');
            };
        }

        function switchView() {
            $('section#itemListing ul').toggleClass('gallery-list');
            $('.switchView').toggleClass('gallery');
            $('.filled').each(function() {
                var $this = $(this);

                loadImages($this.attr('data-fullimg'), $this);
            });
        }
    }
});

module.exports.id = 'categories/show';
