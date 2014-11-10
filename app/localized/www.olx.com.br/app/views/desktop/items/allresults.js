'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'items_allresults_view',
    
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
