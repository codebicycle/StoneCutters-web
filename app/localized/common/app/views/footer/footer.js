'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var languages = this.app.session.get('languages');
        var language;

        if (languages && languages.models && languages.models.length) {
            language = _.first(languages.models).isocode;
        }
        return _.extend({}, data, {
            user: this.app.session.get('user'),
            showInc: language !== 'ES'
        });
    }
});

module.exports.id = 'footer/footer';
