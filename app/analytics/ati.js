'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

module.exports = function analyticsHelper() {
    var actionTypes = {
        edited: function (params, options) {
            if (options.itemEdited) {
                processOptions(params, options);
            }
        }
    };

    function standarizeName(name) {
        name = name.toLowerCase();
        name = name.replace('  ', ' ');
        name = name.replace(' ', '_');
        name = name.replace('/', '_');
        name = name.replace('-', '');
        return name;
    }

    function prepareDefaultParams(params) {
        var user = this.app.session.get('user');
        var location;

        if (user) {
            params.user_id = user.id;
        }
        location = this.app.session.get('location');
        if (location && location.current) {
            params.geo2 = standarizeName(location.current.name || '');
        }
        params.platform = this.app.session.get('platform');
        params.language = this.app.session.get('selectedLanguage');
    }

    function processOptions(params, options) {
        var location;

        if(!_.isUndefined(params.keyword)) {
            params.keyword = options.keyword;
        }
        if(!_.isUndefined(params.page_nb)) {
            params.page_nb = options.page_nb;
        }
        if(!_.isUndefined(params.ad_id) && options.item) {
            params.ad_id = options.item.id;
            if(options.item.images) {
                params.ad_photo = options.item.images.length;
            }
            if(options.category) {
                params.category = options.category.name;
                params.ad_category = options.category.name;
            }
            if(options.subcategory) {
                params.ad_subcategory = options.subcategory.name;
            }
            if(!_.isUndefined(params.geo1)) {
                location = options.item.location;
                if (location.children && location.children[0]) {
                    params.geo1 = standarizeName(location.children[0].name || '');
                }
            }
            if(!_.isUndefined(params.geo2)) {
                location = options.item.location;
                if (location.children && location.children[0] && location.children[0].children && location.children[0].children[0]) {
                    params.geo2 = standarizeName(location.children[0].children[0].name || '');
                }
            }
            if(!_.isUndefined(params.posting_to_action)) {
                params.posting_to_action = helpers.common.daysDiff(new Date(options.item.date.timestamp));
            }
        }
        if(!_.isUndefined(params.funnel_category) && options.category) {
            params.funnel_category = options.category.name;
        }
        if(!_.isUndefined(params.funnel_subcategory) && options.subcategory) {
            params.funnel_subcategory = options.subcategory.name;
        }
        if(!_.isUndefined(params.subcategory) && options.subcategory) {
            params.subcategory = options.subcategory.name;
        }
        if(!_.isUndefined(params.poster_id) && options.item.user) {
            params.poster_id = options.item.user.id;
            params.poster_type = 'registered_logged';
        }
        if(params.page_name === 'expired_category' && options.category) {
            params.page_name = 'listing_' + options.category.name;
            params.category = options.category.name;
        }
        if(params.page_name === 'posting_step4' && options.category) {
            params.ad_category = options.category.name;
            params.ad_subcategory = options.subcategory.name;
        }
    }

    function prepareParams(params, options) {
        var actionType;

        if(!_.isUndefined(params.action_type)) {
            actionType = actionTypes[ params.action_type ];

            if (actionType) {
                actionType(params, options);
                return params;
            }
        }
        processOptions(params, options);
        return params;
    }

    function generateParams(ati, options) {
        var params = _.clone(ati.names);

        prepareDefaultParams.call(this, params);
        if (ati.process) {
            params = prepareParams(params, options);
        }
        return JSON.stringify(params);
    }

    return {
        generateParams: generateParams
    };
}();
