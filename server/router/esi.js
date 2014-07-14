'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    (function esi() {
        app.get('/esi', handler);

        function handler(req, res) {
            console.log(req.rendrApp.session.get());
            var result = {
                user: 'martin',
                test: true
            };
            var esi = '';

            for (var variable in result) {
                esi += '<esi:text><esi:assign name="' + variable + '">\'\'\'</esi:text>' + result[variable] + '<esi:text>\'\'\'</esi:assign></esi:text>';
            }
            res.send(esi);
        }
    })();
};
