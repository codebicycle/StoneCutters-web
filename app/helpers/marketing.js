'use strict';

module.exports = {
    getInfo: function(app, medium) {
        var marketing = app.session.get('marketing');
        var platform = app.session.get('platform');
        var osName = marketing.osName;
        var osVersion = marketing.osVersion;
        var data = {};

        if((osVersion < 2.1 && osName == 'Android') || (osVersion < 3.2 && osName == 'iOS') || (osVersion < 4.5 && osName == 'RIM') || (osVersion < 8 && osName == 'Windows Phone')){
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
                data.image = 'android';
            break;
            case 'iOS':
                data.link = 'http://itunes.apple.com/es/app/olx-classifieds/id382059698';
                data.forOsKey = 'misc.BrandFor_Mob';
                data.forOs = 'iPhone';
                data.freeInKey = 'misc.FreeIn_Mob';
                data.freeIn = ' <span>App Store</span>';
                data.rating = '(+4)';
                data.image = 'ios';
            break;
            case 'Windows Phone':
                data.link = 'http://windowsphone.com/s?appid=31fc00f9-44e8-df11-9264-00237de2db9e';
                data.forOsKey = 'misc.BrandFor_Mob';
                data.forOs = ' Windows Phone';
                data.freeInKey = 'misc.FreeIn_Mob';
                data.freeIn = ' <span>Windows</span>';
                data.rating = '(+4)';
                data.image = 'windowsphone';
            break;
        }
        return data;

    },
};
