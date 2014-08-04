'use strict';

var _ = require('underscore');

module.exports = function esiHelper() {
    var esiTag = '<esi:';

    function isEnabled() {
        var platform = this.app.session.get('platform');

        if (platform === 'wap' || platform === 'html4') {
            return true;
        }
        return false;
    }

    function isEsiString(str) {
        if (!_.isString(str)) {
            return false;
        }
        if (str.length >= esiTag.length && str.slice(0, esiTag.length) === esiTag) {
            return true;
        }
        return false;
    }

    function generateVar(name) {
        return ['<esi:vars>', name, '</esi:vars>'].join('');
    }

    function esify(name, _default) {
        if (isEnabled.call(this)) {
            return generateVar(name.join(''));
        }
        return _default;
    }

    return {
        isEnabled: isEnabled,
        isEsiString: isEsiString,
        generateVar: generateVar,
        esify: esify
    };
}();
