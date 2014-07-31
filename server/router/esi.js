'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    (function esi() {
        app.get('/esi', handler);

        function handler(req, res) {
            var result = {
                user_loggedin: !!req.rendrApp.session.get('user'),
                clientId: req.rendrApp.session.get('clientId'),
                osName: req.rendrApp.session.get('osName')
            };
            var esi = '';

            for (var variable in result) {
                esi += '<esi:text><esi:assign name="' + variable + '">\'\'\'</esi:text>' + result[variable] + '<esi:text>\'\'\'</esi:assign></esi:text>';
            }
            res.send(esi);
        }
    })();
};
