'use strict';

var atiConfig = require('../config/analytics/ati_config');
var analyticsConfig = require('../config/analytics/analytics_config');
var catHelper = require('./categories');

module.exports = function analyticsHelper(){
    var imgUrls = function(session) {
        var urls = [];
        atiImgUrl(session, urls);
        
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

    var getParams = function (paramsProperties, session) {
        var params = paramsProperties;
        delete params['viewType'];

        var catName = catHelper.getCatName(session) || paramsProperties.category;
        var subCatName = catHelper.getSubCatName(session) || paramsProperties.subcategory;
        var pageName = paramsProperties.pageName + getAtiPageNameSuffix(session, catName, subCatName);
        
        var allParams = {
            page_name: pageName,
            category: catName,
            subcategory: subCatName,
        };

        for(var p in params){
            params[p] = allParams[p];
        }

        params['language'] = session.location.flags.languageCode;
        params['platform'] = session.platform;

        return params;
    }

    var atiImgUrl = function(session, urls) {
        var countryId = session.location.id;

        var pathMatch = getPathMatch(session.path);
        var paramsProperties = analyticsConfig[pathMatch];
        var atiCountryConfig = atiConfig[countryId];

        if (!paramsProperties || !atiCountryConfig)
            return;

        var logServer = atiCountryConfig.logServer;
        var siteId = atiCountryConfig.siteId;
        var params = getParams(paramsProperties, session);
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