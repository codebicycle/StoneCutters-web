'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('post/form');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    className: 'post_form_view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var hintEmailInfo = config.getForMarket(location.url, ['hints','html4','email'], false);
        var hint = '';

        if(hintEmailInfo.enabled === true && hintEmailInfo.hint !== '') {
            hint = hintEmailInfo.hint;
        }

        return _.extend({}, data, {
            hint: hint
        });
    }
});

module.exports.id = 'post/form';