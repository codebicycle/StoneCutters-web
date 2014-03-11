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

    var atiImgUrl = function(session, urls) {
        var countryId = session.location.id;

        if (!analyticsConfig[session.path] || !atiConfig[countryId])
            return;

        var logServer = atiConfig[countryId].logServer;
        var siteId = atiConfig[countryId].siteId;
        var catName = catHelper.getCatName(session) || analyticsConfig[session.path].category;
        var subCatName = catHelper.getSubCatName(session) || analyticsConfig[session.path].subcategory;
        var pageName = analyticsConfig[session.path].pageName + getAtiPageNameSuffix(session, catName, subCatName);
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
    };

    return api;
}();