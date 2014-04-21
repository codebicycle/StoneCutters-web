'use strict';

module.exports = {
    getInfo: function(marketing,medium,platform) {
        var osName = marketing.osName; 
        var osVersion = marketing.osVersion;
        var data = {};
        if((osVersion < 2.1 && osName == 'Android') || (osVersion < 3.2 && osName == 'iOS') || (osVersion < 4.5 && osName == 'RIM') || (osVersion < 8 && osName == 'Windows Phone')){
            return data;
        }
        switch(osName) {
            case 'Android':
                data.link = 'market://details?id=com.olx.olx&referrer=utm_source%3DOLX_'+platform+'_DownloadApp%26utm_'+medium+'%3DFooter%26utm_campaign%3B'+medium;
                data.promo = 'OLX para android';
                data.image = 'android';
            break;
            case 'iOS':
                data.link = 'http://itunes.apple.com/es/app/olx-classifieds/id382059698';
                data.promo = 'OLX para iOS';
                data.image = 'ios';
            break;
            case 'RIM':
                data.link = 'http://appworld.blackberry.com/webstore/content/58411/?lang=es';
                data.promo = 'OLX para BlackBerry';
                data.image = 'blackberry';
            break;
            case 'Windows Phone':
                data.link = 'http://windowsphone.com/s?appid=31fc00f9-44e8-df11-9264-00237de2db9e';
                data.promo = 'OLX para Windows Phone';
                data.image = 'windowsphone';
            break;
        }
        return data;

    },
};
