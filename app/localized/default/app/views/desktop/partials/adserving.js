'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adserving-listing',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;
        var settingsAdserving = this.getAdserving(slotname);
        var enabledAD = settingsAdserving.enabled;

        return _.extend({}, data, {
            adserving: {
                enabled : enabledAD,
                slotname: slotname
            }
        });
    },
    postRender: function(){
        var slotname = this.options.subid;
        var settings = this.getAdserving(slotname);

        if(settings.type === 'CSA') {
            window._googCsa('ads', settings.options, settings.params);
        } else if(settings.type === 'ADX') {

            var $gadxParams;

            var str = 'var google_ad_client = "ca-pub-9177434926134739";';
            str += 'var google_ad_slot = "4197936346";';
            str += 'var google_ad_width = 500;';
            str += 'var google_ad_height = 600;';

            $gadxParams = $('<script></script>');
            $gadxParams.text(str);

            var $gadx;

            $gadx = $('<script></script>');
            $gadx.attr({
                type: 'text/javascript',
                src: '//pagead2.googlesyndication.com/pagead/show_ads.js',
                id: slotname + '_script_adx'
            });

            $('#' + slotname).append($gadxParams, $gadx);
        }
    },
    getAdserving: function(slotname){
        var currentCategory = 362;
        var settings = AdServing.getSettings(slotname, currentCategory);

        return settings;
    }
});

module.exports.id = 'partials/adserving';
