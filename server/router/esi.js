'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    (function esi() {
        app.get('/esi', handler);

        function handler(req, res) {
            console.log('esi');
            var user = req.rendrApp.session.get('user');
            var result = {
                user_loggedin: !!user
            };
            var esi = '';

            for (var variable in result) {
                esi += '<esi:text><esi:assign name="' + variable + '">\'\'\'</esi:text>' + result[variable] + '<esi:text>\'\'\'</esi:assign></esi:text>';
            }
            res.send(esi);
        }
    })();
};
