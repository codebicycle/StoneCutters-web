'use strict';

var BaseAppView = require('rendr/client/app_view');

var $body = $('body');

module.exports = BaseAppView.extend({
    className: 'app_view_index_view',
    events:{
        'click .navLeft': 'toggleLeftPanel',
        'click #overlay': 'toggleLeftPanel',
        'click #toggle-search': 'toggleSearch',
        'click nav#leftPanel li a': 'toggleLeftPanel'
    },
    initialize: function() {
        this.app.on('change:loading', function onLoading(app, loading) {
            $body.toggleClass('loading', loading);
        }, this);
        $('#search-bar').change(function(){
            window.location = 'nf/search/' + $('#search-bar').val() + '?location=' + this.app.getSession('siteLocation');
        });
        $('nav div').css('height' , ($(window).height() - $('header').height()) + 'px');
        $(window).resize(function onResize() {
            $('nav div').css('height', ($(window).height() - $('header').height()) + 'px');
        });
    },
    toggleLeftPanel: function(event) {
        event.preventDefault();
        $('article nav').toggleClass('open');
        $('#overlay').fadeToggle();
        $('body').toggleClass('noscroll');
    },
    toggleSearch: function(event) {
        if (event) {
            event.preventDefault();
        }
        $('#search-container').toggle();
        if ($('#search-container').is(':visible')){
            $('#search-bar').focus();

            //$('#toggle-search .ui-btn-text').text('Cancel');
        }
        else {
            $('#search-bar').val('');

            //$('#toggle-search .ui-btn-text').text('Search');
        }
    }
});

module.exports.id = 'app_view/index';
