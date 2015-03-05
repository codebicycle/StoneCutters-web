'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/search');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    postRender: function() {
        this.app.router.once('action:start', this.onStart.bind(this));
    },
    onStart: function() {
        this.app.router.once('action:start', this.onStart.bind(this));
        this.app.router.once('action:end', this.onEnd.bind(this));
    },
    onEnd: function() {
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

        helpers.common.redirect.call(this.app.router, '/nf/search' + (search ? ('/' + search) : ''), null, {
            status: 200
        });
    }
});
