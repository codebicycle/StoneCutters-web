var _ = require('underscore');
var sixpack = require('../lib/sixpack');

module.exports = {
  make_convertion: function(params, callback) {
    var session = new sixpack.Session(params.client_id);
    session.convert(params.experiment, function (err, res) {
      if (err) throw err;
      //document.getElementById("convert").innerHTML = JSON.stringify(res);
    });
    console.log(this.app.req.app._router); 
  }
};