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
                bar.version = build.version;
                bar.revision = build.deploy.revision;
                bar.show = true;
                bar.env = (process.env.NODE_ENV || 'DEV').toUpperCase();
                bar.platform = app.getSession('platform').toUpperCase();
            }
            return bar;
        }

        return _.extend({}, data, {
            blackBar: getBlackBar(this.app)
        });
    },
    postRender: function() {
        $('#topBar ul li a').click(function(e){
            $('menu#myOlx').toggle();
        });
        $('#topBar ul li a').on('resize', this.resize).trigger('resize');
    },
});

module.exports.id = 'header/index';
