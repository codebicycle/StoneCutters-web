'use strict';

module.exports = function participate(experiment, done) {
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack/participate?experiment=' + experiment.key + '&platform=' + this.platform + '&market=' + this.market,
        cache: false,
        timeout: 5000,
        context: this
    })
    .done(function(data){
        this.experiments[experiment.key] = data;
    })
    .fail(function(){
        console.log('error');
    })
    .always(always.bind(this));

    function always() {
        this.callback(done)();
    }
};
