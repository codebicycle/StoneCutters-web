'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('pages/safety');
var config = require('../../../../../../../shared/config');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'main',
    events: {
        'click .st-panel-heading > a': 'onListItemClick'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var safetyTemplate = 'latam';
        var location = this.app.session.get('location');
        
        if(location.url === 'www.olx.com.ar') {
            safetyTemplate = 'ar';
        }
        
        return _.extend({}, data, {
            safetyTemplate: safetyTemplate
        });
    },
    onListItemClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $active = this.$('.st-panel-body.on');
        //var $source = this.$(event.currentTarget);
        var $target = this.$(event.currentTarget.hash).find('.st-panel-body');
        
        if ($target.hasClass('on')) {
            $target.slideToggle('fast', function() {
                //$source.toggleClass('collapsed');
                $target.toggleClass('on off');
            });
        }
        else if ($active.length) {
            $active.slideToggle('fast', function() {
                $active.toggleClass('on off');
                $target.slideToggle('fast', function() {
                    //$source.toggleClass('collapsed');
                    $target.toggleClass('on off');
                });
            });
        }
        else {
            $target.slideToggle('fast', function() {
                //$source.toggleClass('collapsed');
                $target.toggleClass('on off');
            });
        }
    }
});
