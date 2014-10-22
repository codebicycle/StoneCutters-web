'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'partials_tracking_view',
    id: 'tracking',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        if (this.tracking) {
            data.tracking = this.tracking;
        }
        else if (data.context && data.context.ctx && data.context.ctx.tracking){
            data.tracking = data.context.ctx.tracking;
        }
        return _.extend({}, data);
    }
});

module.exports.id = 'partials/tracking';
