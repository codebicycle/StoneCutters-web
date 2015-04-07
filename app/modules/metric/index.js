'use strict';

var Metric = require('./models/metric');

Metric.incrementEventHandler = function incrementEventHandler(event) {
    var $elem = $(event.currentTarget);
    var options = $elem.data('increment-options');

    if (!this.metric) {
        this.metric = new Metric({}, this);
    }
    if (options) {
        try {
            options = JSON.parse(options);
        } catch(e) {
            options = undefined;
        }
    }
    this.metric.increment({
        category: $elem.data('increment-category'),
        action: $elem.data('increment-action'),
        value: $elem.data('increment-value')
    }, options);
};

module.exports = Metric;
