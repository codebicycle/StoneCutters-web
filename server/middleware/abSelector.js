var sixpack = require('../../app/lib/sixpack')();
var experiments = require('../../app/experiments')();


/**
 * AB Testing middleware.
 * Here we call sixpack server in order to define which template we have to show.
 */
module.exports = function() {
    var myClientId = sixpack.generate_client_id();
    var session = new sixpack.Session(myClientId);

    return function(req, res, next) {
        var experimentsAmount = 0;
        console.log("Loading all the expriments.");
        var myExperiments = experiments;
        for (index = 0; index < experiments.length; index++) {
            var myIndex= index;
            
            session.participate(experiments[index].name, experiments[index].options, 
                function (err, res) {
                    if (err){
                        throw err;  
                    } 
                    alt = res.alternative.name
                    req[myExperiments[myIndex].name] = {value: alt, client_id: myClientId};
                    global[myExperiments[myIndex].name] = {value:alt, client_id: myClientId};
                    experimentsAmount++;
                    if(experimentsAmount == myExperiments.length){
                        next();    
                    }
                });
        }
        if(experiments.length==0){
            next();
        }	    
    }
};