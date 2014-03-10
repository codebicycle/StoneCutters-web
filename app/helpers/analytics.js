'use strict';

var atiConfig = require('../config/analytics/ati_config');
var analyticsConfig = require('../config/analytics/analytics_config');

module.exports = function analyticsHelper(){
    var imgUrls = function(session) {
        var atiUrl = atiImgUrl(session);
        var urls = [atiUrl];

        return urls;
    };

    var atiImgUrl = function(session) {
        var countryId = session.location.id;

        var logServer = atiConfig[countryId].logServer;
        var siteId = atiConfig[countryId].siteId;
        var params = {
            language: session.location.flags.languageCode,
            platform: session.platform,
            page_name: analyticsConfig[session.viewType].pageName,
            category: analyticsConfig[session.viewType].category,
        };
        var clientId = session.clientId;
        var rnd = Math.floor(Math.random() * 1000000000);
        var referer = session.referer;

        var url = "http://"+logServer+".ati-host.net/hit.xiti?s="+siteId+"&stc="+encodeURIComponent(JSON.stringify(params))+"&idclient="+clientId+"&na="+rnd+"&ref="+referer;

        return url;
    };

    var api = {
        imgUrls: imgUrls,
    };

    return api;
}();