'use strict';

var Base = require('../../bases/view');
var helpers = require('../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'partials_search_view',
    id: 'search',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    postRender: function() {
        var $form = this.$('form');
        var $input = $form.find('input[name=search]');

        $form.on('submit', function onSubmit(event) {
            event.preventDefault();
            helpers.common.redirect.call(this.app.router, '/nf/search/' + $input.val() || '', null, {
                status: 200
            });
        }.bind(this));
    }
});

module.exports.id = 'partials/search';
