var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'login_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var params = this.options.params;
        if (params.err) {
            params.err = params.err.split(',');
        }
        if (params.errFields) {
            params.errFields = params.errFields.split(',');
        }
        return _.extend({}, data, {
            params: params
        });
    }
});

module.exports.id = 'login/index';
