'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');
var config = require('../../config');

module.exports = BaseView.extend({
    className: 'header_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var app = helpers.environment.init(this.app);

        function getBlackBar(app) {
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
            blackBar: getBlackBar(this.app),
            location: this.app.getSession('location'),
            user: app.getSession('user')
        });
    },
    postRender: function() {
        $('#topBar ul li.logIn span').click(function(e){
            $('menu#myOlx').slideToggle();
        });
    },
});

module.exports.id = 'header/index';
