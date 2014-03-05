'use strict';

var sixpack = require('../../app/lib/sixpack')();
var experiments = require('../../app/experiments')();

/**
 * AB Testing middleware.
 * Here we call sixpack server in order to define which template we have to show.
 */
module.exports = function() {

    return function abSelectorLoader(dataAdapter) {

        var myClientId = sixpack.generate_client_id();
        var session = new sixpack.Session(myClientId);

        return function abSelector(req, res, next) {
            console.log('<DEBUG CONSOLE LOG> Loading all the experiments.');
            var myExperiments = experiments;
            var experimentsAmount = 0;
            var index = 0;
            var length = experiments.length;

            for (index; index < length; index++) {
                var myIndex= index;

                session.participate(experiments[index].name, experiments[index].options, function callback(err, res) {
                    var alt;
                    if (err) {
                        throw err;
                    }
                    alt = res.alternative.name
                    req[myExperiments[myIndex].name] = {
                        value: alt,
                        client_id: myClientId
                    };
                    global[myExperiments[myIndex].name] = {
                        value:alt,
                        client_id: myClientId
                    };
                    experimentsAmount++;
                    if(experimentsAmount == myExperiments.length) {
                        next();
                    }
                });
            }
            if(experiments.length==0){
                next();
            }
        };

    };

};
