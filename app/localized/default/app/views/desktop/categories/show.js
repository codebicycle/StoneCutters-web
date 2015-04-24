'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');
var UserSurvey = require('../../../../../../modules/usersurvey');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'carmodel', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city', 'neighborhood'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpFindNeighborhood: /-neighborhood_[0-9_]+/,
    events: {
        'click [data-increment-metric]': 'onClickIncrement'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        this.userSurvey = new UserSurvey({}, {
            app: this.app
        });
        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            isUserSurveyEnabled: this.userSurvey.isEnabled(),
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'showig'),
                listAct: 'active'
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path.replace(/\/\//g, '/');
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        path = path.replace(this.regexpFindNeighborhood, '');
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    onClickIncrement: function(event) {
        var $elem = $(event.currentTarget);
        var values = Metric.getValues($elem.data('increment-metric'));

        this.app.session.persist({
            origin: {
                type: 'browse',
                isGallery: this.id !== 'categories-show-view',
                isAbundance: !!~(values.value || '').indexOf('abundance')
            }
        });
        Metric.incrementEventHandler.call(this, event);
    }
});
