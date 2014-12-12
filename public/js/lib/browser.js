window.BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || '';
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || '';
        this.browsername = this.browser + this.version;
    },
    searchString: function(data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1) {
                    return data[i].identity;
                }
            }
            else if (dataProp) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        var versionIndex;

        if (index == -1) {
            return;
        }
        versionIndex = index + this.versionSearchString.length + 1;
        return parseFloat(dataString.substring(versionIndex));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: 'Chrome',
            identity: 'Chrome'
        },
        {
            string: navigator.userAgent,
            subString: 'OmniWeb',
            versionSearch: 'OmniWeb/',
            identity: 'OmniWeb'
        },
        {
            string: navigator.vendor,
            subString: 'Apple',
            identity: 'Safari',
            versionSearch: 'Version'
        },
        {
            prop: window.opera,
            identity: 'Opera',
            versionSearch: 'Version'
        },
        {
            string: navigator.vendor,
            subString: 'iCab',
            identity: 'iCab'
        },
        {
            string: navigator.vendor,
            subString: 'KDE',
            identity: 'Konqueror'
        },
        {
            string: navigator.userAgent,
            subString: 'Firefox',
            identity: 'Firefox'
        },
        {
            string: navigator.vendor,
            subString: 'Camino',
            identity: 'Camino'
        },
        {
            string: navigator.userAgent,
            subString: 'Netscape',
            identity: 'Netscape'
        },
        {
            string: navigator.userAgent,
            subString: 'MSIE',
            identity: 'Explorer',
            versionSearch: 'MSIE'
        },
        {
            string: navigator.userAgent,
            subString: 'Gecko',
            identity: 'Mozilla',
            versionSearch: 'rv'
        },
        {
            string: navigator.userAgent,
            subString: 'Mozilla',
            identity: 'Netscape',
            versionSearch: 'Mozilla'
        }
    ]
};
BrowserDetect.init();