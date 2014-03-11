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

    var atiImgUrl = function(session, urls) {
        var countryId = session.location.id;

        var pathMatch = getPathMatch(session.path);

        if (!analyticsConfig[pathMatch] || !atiConfig[countryId])
            return;

        var logServer = atiConfig[countryId].logServer;
        var siteId = atiConfig[countryId].siteId;
        var catName = catHelper.getCatName(session) || analyticsConfig[pathMatch].category;
        var subCatName = catHelper.getSubCatName(session) || analyticsConfig[pathMatch].subcategory;
        var pageName = analyticsConfig[pathMatch].pageName + getAtiPageNameSuffix(session, catName, subCatName);
        var params = {
            language: session.location.flags.languageCode,
            platform: session.platform,
            page_name: pageName,
            category: catName,
            subcategory: subCatName,
        };
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