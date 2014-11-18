'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/adserving');
var _ = require('underscore');
var Adserving = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adsense-listing',
    getTemplateData: function () {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;

        return _.extend({}, data, {
            adserving: {
                enabled : true,
                slotname: slotname
            }
        });
    },
    postRender: function() {
        if (!this.adserving) {
            this.adserving = new Adserving(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }

        var tuVieja = this.adserving.pepe('Abrahan');
        console.log(tuVieja);
    }
});

module.exports.id = 'partials/adserving';
