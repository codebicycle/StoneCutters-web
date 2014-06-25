'use strict';

module.exports = {
    formatClientUrl: function(url, api) {
        var prefix = this.app.get('apiPath') || '/api';

        if (api) {
            prefix += '/' + api;
        }
        return prefix + url;
    }
};
