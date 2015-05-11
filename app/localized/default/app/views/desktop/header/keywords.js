'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/keywords');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'keywords-view',
    className: 'keywords-view wrapper',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            seo: this.app.seo
        });
    },
    postRender: function() {
        this.app.router.appView.on('header:hide', this.onHeaderHide.bind(this));
        this.app.router.appView.on('header:show', this.onHeaderShow.bind(this));
    },
    onHeaderHide: function() {
        this.$el.hide();
    },
    onHeaderShow: function() {
        this.$el.show();
    }
});
