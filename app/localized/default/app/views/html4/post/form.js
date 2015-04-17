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
        var hint;
        var emailIcon;

        if(hintEmailInfo.enabled) {
            hint = hintEmailInfo.hint;
            emailIcon = (hintEmailInfo.icon)? hintEmailInfo.icon: 'icon-exclamation';
        }

        return _.extend({}, data, {
            hint: hint,
            emailIcon: emailIcon
        });
    }
});

module.exports.id = 'post/form';