'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');
var config = require('../../config');

module.exports = BaseView.extend({
    className: 'header_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        function getBlackBar(app) {
            var _ = require('underscore');
            var bar = {
                show: false
            };
            var build = config.get('deploy', false);
            if (build) {
                _.extend(bar, build);
                bar.show = true;
                bar.env = (process.env.NODE_ENV || 'DEV').toUpperCase();
                bar.platform = app.getSession('platform').toUpperCase();
            }
            return bar;
        }

        return _.extend({}, data, {
            blackBar: getBlackBar(this.app)
        });
    }
});

module.exports.id = 'header/index';
