'use strict';

var atiConfig = require('../config/analytics/ati_config');
var analyticsConfig = require('../config/analytics/analytics_config');
var catHelper = require('./categories');

module.exports = function analyticsHelper(){
    var imgUrls = function(session, viewData) {
        var urls = [];
        atiImgUrl(session, viewData, urls);
        
        return urls;
    };

    var getAtiPageNameSuffix = function (session, catName, subCatName) {
        var suffix = '';

        if (session.viewType == 'listing') {
            suffix = subCatName;
        }else if (session.viewType == 'categoryList') {
            suffix = catName;
        }

        return suffix;
    };

    var getPathMatch = function (path) {
        var pathMatch = path;

        if (path.indexOf('/categories/') != -1) {
            pathMatch = '/categories';
        }else if (path.indexOf('/items/') != -1) {
            pathMatch = '/items/id';
        }

        return pathMatch;
    };

    var getAd = function (session, viewData) {
        var ad = {};

        if (viewData.hasOwnProperty('item')) {
            var item = viewData.item;
            var postDate = new Date(item.date.timestamp);
            var now = new Date();

            ad.ad_id = item.id;
            ad.ad_photo = item.images.length;
            ad.poster_id = (item.user)? item.user.id : 0;
            ad.poster_type = (item.user)? 'registered_logged' : 'registered_no';
            ad.posting_to_action = Math.abs(Math.round((now - postDate) / (60*60*24)));
        }

        return ad;
    };

    var getGeo = function (session, viewData) {
        var geo = {};

        if (viewData.hasOwnProperty('item')) {
            var item = viewData.item;
            var country = item.location;
            var state = country.children[0];
            var city = state.children[0];

            geo.geo1 = state.name.replace(/  /g,"_").replace(/ /g,"_").replace(/-/g,"");
            geo.geo2 = city.name.replace(/  /g,"_").replace(/ /g,"_").replace(/-/g,"");
        }

        return geo;
    };

    var getParams = function (paramsProperties, session, viewData) {
        var params = paramsProperties;
        delete params['viewType'];

        var catName = catHelper.getCatName(session, viewData) || paramsProperties.category;
        var subCatName = catHelper.getSubCatName(session, viewData) || paramsProperties.subcategory;
        var pageName = paramsProperties.pageName + getAtiPageNameSuffix(session, catName, subCatName);

        var geoObj = getGeo(session, viewData);
        var adObj = getAd(session, viewData);

        var action_type;

        var allParams = {
            page_name: pageName,
            category: catName,
            subcategory: subCatName,
            geo1: geoObj.geo1,
            geo2: geoObj.geo2,
            ad_category: catName,
            ad_subcategory: subCatName,
            ad_id: adObj.ad_id,
            ad_photo: adObj.ad_photo,
            poster_id: adObj.poster_id,
            poster_type: adObj.poster_type,
            posting_to_action: adObj.posting_to_action,
            action_type: params['action_type']
        };

        for(var p in params){
            params[p] = allParams[p];
        }

        params['language'] = session.location.flags.languageCode;
        params['platform'] = session.platform;

        return params;
    }

    var atiImgUrl = function(session, viewData, urls) {
        var countryId = session.location.id;

        var pathMatch = getPathMatch(session.path);
        var paramsProperties = analyticsConfig[pathMatch];
        var atiCountryConfig = atiConfig[countryId];

        if (!paramsProperties || !atiCountryConfig)
            return;

        var logServer = atiCountryConfig.logServer;
        var siteId = atiCountryConfig.siteId;
        var params = getParams(paramsProperties, session, viewData);
        var clientId = session.clientId;
        var rnd = Math.floor(Math.random() * 1000000000);
        var referer = session.referer;

        var url = "http://"+logServer+".ati-host.net/hit.xiti?s="+siteId+"&stc="+encodeURIComponent(JSON.stringify(params))+"&idclient="+clientId+"&na="+rnd+"&ref="+referer;

        urls.push(url);
    };

    var api = {
        imgUrls: imgUrls,
        getPathMatch: getPathMatch,
    };

    return api;
}();