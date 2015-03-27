'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/search');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:end', this.onEnd.bind(this));
    },
    onEnd: function() {
        this.app.router.once('action:end', this.onEnd.bind(this));
        this.$('[name=search]').val(this.app.session.get('search'));
    },
    events: {
        'submit form': 'onSubmit'
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var search = this.$('form').find('[name=search]').val();
        var url = search ? ('/nf/search/' + search) : '/nf/all-results';

        if (!this.metric) {
            this.metric = new Metric({}, this);
        }
        this.metric.increment(['dgd', 'home', ['search', (search ? 'with' : 'without') + '_term']]);

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    }
});
