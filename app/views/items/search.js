'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'items_search_view',
    wapAttributes: {
        cellpadding: 0
    },
    postRender: function() {
        $('.switchView').click(function(e) {

            var url;
            $('.filled').each(function() {
                url = $(this).attr('data-fullimg');
                loadImages(url , $(this));
            });
            $('section#itemListing ul').toggleClass('gallery-list');
            $('.switchView').toggleClass('gallery');
            /*var action = ($('section#itemListing ul').hasClass('gallery-list')) ? 'viewGalery' : 'viewListing';
            _gaq.push(['_trackEvent', 'listing', action]);*/
        });

        function loadImages(url , $this){
            var newImg = new Image();
            newImg.src = url;
            newImg.onload = function() {
                $this.css('background-image', 'url('+url+')');
            };
        }
    }
});

module.exports.id = 'items/search';
