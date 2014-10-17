'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');
var utils = require('../../../../../../shared/utils');

module.exports = Base.extend({
    className: 'locations_list_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        var $form = this.$('.search-form');
        var $input = $form.find('input[name=search]');

        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);        

        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });

        this.$('#location .country-link, .cities-links .city-link').on('click', function(e) {
            var href = $(e.currentTarget).attr('href');
            var siteLocation = utils.params(href, 'location');

            $('body').trigger('change:location', siteLocation);
        }.bind(this));

        $form.on('submit', function onSubmit(event) {
            var url = '/location?search=' + ($input.val() || '');

            event.preventDefault();
            if (this.options.target) {
                url += '&target=' + this.options.target;
            }
            helpers.common.redirect.call(this.app.router, url, null, {
                status: 200
            });
        }.bind(this));
    },
    onStart: function(event) {
        this.appView.trigger('location:start');
    },
    onEnd: function(event) {
        this.appView.trigger('location:end');
    }
});

module.exports.id = 'locations/list';
