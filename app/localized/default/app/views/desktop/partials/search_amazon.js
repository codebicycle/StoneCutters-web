'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/search_amazon');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');
var Mixpanel = require('../../../../../../modules/tracking/trackers/mixpanel');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:end', this.onEnd.bind(this));
    },
    onEnd: function() {
        this.app.router.once('action:end', this.onEnd.bind(this));
        this.$('[name=search]').val(this.app.session.get('search'));
    },
    events: {
        'submit form': 'onSubmit',
        'click .search-category': 'onSearchCategoryClick',
        'click .category-link': 'onCategoryLinkClick'
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var search = this.$('.search-term').val();
        var category = this.$('.search-category-value').val();
        var url = search ? ('/nf/search/' + search) : '/nf/all-results';

        Metric.increment.call(this, ['dgd', 'home', ['search', (search ? 'with' : 'without') + '_term']], {
            include: 'currentRoute:categories#list'
        });

        Mixpanel.track.call(this, 'search', {
            keyword: search.toLowerCase()
        });

        if (category) {
            url = url.replace(/search|nf\/all-results/, category);
        }

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    },
    onSearchCategoryClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $source = this.$(event.target);
        var $list = this.$('.categories-list');

        if ($list.hasClass('active')) {
            $list.removeClass('active');
            $source.removeClass('active');
            $('body').off('click.categoriesList');
        }
        else {
            $list.addClass('active');
            $source.addClass('active');
            $('body').on('click.categoriesList', function() {
                $list.removeClass('active');
                $source.removeClass('active');
                $('body').off('click.categoriesList');
            });
        }
    },
    onCategoryLinkClick: function(event) {
        event.preventDefault();

        var $link = this.$(event.currentTarget);
        var $input = this.$('.search-category-value');
        var $display = this.$('.search-category');

        $input.val($link.data('category'));
        if ($link.hasClass('all')) {
            $display.text(translations.get(this.app.session.get('selectedLanguage'))['popularsearchesbody.CATEGORIES_BOX']);
        }
        else {
            $display.text($link.text());
        }
    }
});
