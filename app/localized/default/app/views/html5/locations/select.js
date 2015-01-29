'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('locations/select');
var _ = require('underscore');

module.exports = Base.extend({

    getTemplateData: function(){
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    postRender: function() {
        this.attachTrackMe();
    }
});

