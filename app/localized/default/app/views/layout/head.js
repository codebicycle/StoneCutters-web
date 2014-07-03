'use strict';

var Base = require('../../../../common/app/bases/view');
var _ = require('underscore');
var seo = require('../../../../../seo');

module.exports = Base.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            head: seo.getHead(),
            template: this.app.session.get('template'),
            location: this.app.session.get('location')
        });
    },
    postRender: function() {
        $(document).on('route', seo.update);
    }
});

module.exports.id = 'layout/head';
