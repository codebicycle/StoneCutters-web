'use strict';

var helpers = require('./features');

module.exports = {
    getInfo: function(app, medium) {
        var platform = app.session.get('platform');
        var location = app.session.get('location');
        var osName = app.session.get('osName');
        var osVersion = app.session.get('osVersion');
        var browserName = app.session.get('browserName');
        var useADX = helpers.isEnabled.call(this, 'interstitialByADX', platform, location.url);
        var language = app.session.get('selectedLanguage').split('-')[0];
        if (language != 'es' && language != 'pt') {
            language = 'en';
        }
        var data = {};

        if((osVersion < 2.1 && osName == 'Android') || (osVersion < 3.2 && osName == 'iOS')){
            return data;
        }
        switch(osName) {
            case 'Android':
                data.link = 'market://details?id=com.olx.olx&referrer=utm_source%3DOLX_'+platform+'_DownloadApp%26utm_'+medium+'%3DFooter%26utm_campaign%3B'+medium;
                data.forOsKey = 'misc.BrandFor_Mob';
                data.forOs = ' Android';
                data.freeInKey = 'misc.FreeIn_Mob';
                data.freeIn = ' <span>GOOGLE Play</span>';
                data.rating = '(+80k)';
                data.image = 'android_' + language;
                data.browserName = browserName;
            break;
            case 'iOS':
                data.link = 'http://itunes.apple.com/es/app/olx-classifieds/id382059698';
                data.forOsKey = 'misc.BrandFor_Mob';
                data.forOs = 'iPhone';
                data.freeInKey = 'misc.FreeIn_Mob';
                data.freeIn = ' <span>App Store</span>';
                data.rating = '(+4)';
                data.image = 'ios_' + language;
                data.browserName = browserName;
            break;
        }
        if (useADX) {
            data.link = 'http://ad-x.co.uk/API/click/olxinc789048jo/am5543eccbc236fa';
        }
        return data;

    },
};
