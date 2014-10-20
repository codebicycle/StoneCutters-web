(function() {
    var root  = this;
    var hydra = function() {};

    // Private functions

    var eucex = function(value) {
        return encodeURIComponent(decodeURIComponent(value));
    }

    var getCookiesToSend = function() {
        var split = document.cookie.split(/;\s*/), filtered = [];
        for (var i = 0; i < split.length; i++) {
            if (null === split[i].match(/^optimizely.*/)) {
                filtered.push(split[i]);
            }
        }
        return filtered.join('; ');
    };

    var getTrackingUrl = function (type, params) {
        var ft = document.getElementById('featuredTypeId');
        var url = 'http://' + hydra.config.host + '/h/' + type + '/';
        var first = 1;
        var searchObject = {};
        var queries;
        var split;
        var i;

        // Default params
        for (var key in hydra.config.params) {
            if (null !== hydra.config.params[key]) {
                if (first) { url += '?'; first-- } else { url += '&'; }
                url += key + '=' + hydra.config.params[key];
            }
        }

        // Custom params
        for (var key in params) {
            if (null !== params[key]) {
                if (first) { url += '?'; first-- } else { url += '&'; }
                if (type == 'it') {
                    if (hydra.config.params[key]) {
                        // Skip default params
                        continue;
                    } else {
                        keyName = key;
                    }
                } else {
                    keyName = type + '_' + key;
                }
                url += keyName + '=' + params[key];
            }
        }
        if (first) { url += '?'; first-- } else { url += '&'; }

        // Add cookies
        url += 'cookies=' + eucex(getCookiesToSend());

        // Discover some params from the url
        queries = location.search.replace(/^\?/, '').split('&');
        for (i = 0; i < queries.length; i++) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        if (location.host) url += '&host=' + location.host;
        if (searchObject['invite']) url += '&iv=' + eucex(searchObject['invite']);
        if (location.hash) url += '&hash=' + eucex(location.hash);

        // Discover some params from the document
        if (ft && ft.value*1) url += '&ftid=' + eucex(ft.value);
        if (document.referrer) url += '&referer=' + eucex(document.referrer);
        if (document.title) url += "&title=" + eucex(document.title);

        // Pagename
        if (hydra.config['pageName']) url += '&pageName=' + eucex(hydra.config['pageName']);

        // Timestamp
        url += '&t=' + (new Date()).getTime();

        return url;
    }

    var deparam = function(querystring) {
        try {
            pos = querystring.indexOf('?');
            querystring = querystring.substring(pos+1).split('&');
            var params = {}, pair, d = decodeURIComponent;
            for (var i = querystring.length - 1; i >= 0; i--) {
                pair = querystring[i].split('=');
                params[d(pair[0])] = d(pair[1]);
            }
        } catch (Exc) {
            params = {};
        }

        return params;
    };

    var setupDataLayer = function(url) {
        window.dataLayer = [];
        window.dataLayer.push(deparam(url));
    };

    var trackWithIframe = function(url) {
        var iframe = document.getElementById('tracker');

        setupDataLayer(url);
        if (iframe) {
            document.body.removeChild(iframe);
            iframe = null;
        }

        iframe = document.createElement("iframe");
        iframe.setAttribute('id', 'tracker');
        iframe.setAttribute('src', url);
        iframe.setAttribute('style', 'border: none; height:0px; width: 0px');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', '0');
        iframe.setAttribute('rel', 'nofollow');
        document.body.appendChild(iframe);
        iframe.src = url;
    };

    var trackWithImage = function(url) {
        // TODO
    };

    // Export library
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = hydra;
        }
        exports.hydra = hydra;
    }
    root.hydra = hydra;
    

    // Configs
    hydra.config = {
         //trackWithImage: false
         host: 'tracking.olx-st.com',
         pageName: '-',
         params: {}
    };

    // Public functions
    hydra.set = function(name, value) {
        if (this.config[name]) {
            this.config[name] = value;
        }
    };

    hydra.trackPageView = function(params) {
        var url = getTrackingUrl('it', params);

        return trackWithIframe(url);
    };

    hydra.trackEvent = function(eventName, params) {
        var url = getTrackingUrl('event', params);
        url += '&eventName=' + eucex(eventName);

        return trackWithIframe(url);
    };

    // Add handler
    var addEvent = window.attachEvent || window.addEventListener;
    addEvent("message", function(e) {
        'tracking.olx-st.com' === e.origin.substring(7) && eval(e.data);
    }, true);

}).call(window);