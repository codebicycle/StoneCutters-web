'use strict';

var _ = require('underscore');

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

    function prepareDefaultParams(session, params) {
        if (session.user) {
            params.user_id = session.user.id;
        }
        if (session.location && session.location.city) {
            params.geo2 = standarizeName(session.location.city.name || '');
        }
        params.platform = session.platform;
        params.language = session.selectedLanguage;
    }

    function processOptions(params, options) {
        var location;

        if(!_.isUndefined(params.keyword)) {
            params.keyword = options.keyword;
        }
        if(!_.isUndefined(params.page_nb)) {
            params.page_nb = options.total;
        }
        if(!_.isUndefined(params.ad_id) && options.item) {
            params.ad_id = options.item.id;
            if(options.item.images) {
                params.ad_photo = options.item.images.length;
            }
            if(options.parentCategory) {
                params.ad_category = options.parentCategory.name;
            }
            if(options.subCategory) {
                params.ad_subcategory = options.subCategory.name;
            }
            if(options.geo1) {
                location = options.item.location;
                if (location.children && location.children[0]) {
                    params.geo1 = standarizeName(location.children[0].name || '');
                }
            }
            if(options.geo2) {
                location = options.item.location;
                if (location.children && location.children[0] && location.children[0].children && location.children[0].children[0]) {
                    params.geo2 = standarizeName(location.children[0].children[0].name || '');
                }
            }
        }
        if(!_.isUndefined(params.funnel_category) && options.parentCategory) {
            params.funnel_category = options.parentCategory.name;
        }
        if(!_.isUndefined(params.funnel_subcategory) && options.subCategory) {
            params.funnel_subcategory = options.subCategory.name;
        }
        if(!_.isUndefined(params.subcategory) && options.subCategory) {
            params.subcategory = options.subCategory.name;
        }
        if(!_.isUndefined(params.poster_id) && options.user) {
            params.poster_id = options.user.id;
            params.poster_type = 'registered_logged';
        }
        if(!_.isUndefined(params.posting_to_action) && options.postingToAction) {
            params.posting_to_action = options.postingToAction;
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

    function getParams(session, url, options) {
        var params = _.clone(url.ati.params);
        
        prepareDefaultParams(session, params);
        if (url.ati.process) {
            params = prepareParams(params, options);
        }
        return JSON.stringify(params);
    }

    return {
        getParams: getParams
    };
}();
