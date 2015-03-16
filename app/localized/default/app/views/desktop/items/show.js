'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var helpers = require('../../../../../../helpers');
var Categories = require('../../../../../../collections/categories');
var Item = require('../../../../../../models/item');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-show-view',
    className: 'items-show-view',
    events: {
        'localstorageReady': 'onLocalstorageReady'
    },
    postRender: function() {
        if (this.app.localstorage.ready) {
            this.$el.trigger('localstorageReady');
        }
        else {
            this.listenTo(this.app.localstorage, 'ready', function visitedItems() {
                this.$el.trigger('localstorageReady');
            }.bind(this));
        }
    },
    getItem: function() {
        this.item = this.item || (this.options.item && this.options.item.toJSON ? this.options.item : new Item(this.options.item || {}, {
            app: this.app
        }));
        return this.item;
    },
    getCategories: function() {
        this.categories = this.categories || (this.options.categories && this.options.categories.toJSON ? this.options.categories : new Categories(this.options.categories || {}, {
            app: this.app
        }));
        return this.categories;
    },
    onLocalstorageReady: function() {
        if (helpers.features.isEnabled.call(this, 'visitedItems')) {
            var id = this.getItem().get('id');
            var list = this.app.localstorage.get('visited') || [];

            if (!_.contains(list, id)) {
                this.app.localstorage.unset('visited', {silent: true});
                list.unshift(id);
                this.app.localstorage.set('visited', list.slice(0, 10));
            }
        }
    }
});
