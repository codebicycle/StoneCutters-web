'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    (function esi() {
        app.get('/esi', handler);

        function handler(req, res) {
            var user = req.rendrApp.session.get('user');
            var result = {
                user_loggedin: !!user,
                clientId: req.rendrApp.session.get('clientId'),
                osName: req.rendrApp.session.get('osName') || 'Others',
                sid: req.rendrApp.session.get('sid')
            };
            var esi = [];

            if (result.user_loggedin) {
                result.user_id = user.id;
            }
            console.log(result);
            for (var variable in result) {
                esi.push('<esi:text><esi:assign name="');
                esi.push(variable);
                esi.push('">\'\'\'</esi:text>');
                esi.push(result[variable]);
                esi.push('<esi:text>\'\'\'</esi:assign></esi:text>');
            }
            res.send(esi.join(''));
        }
    })();
};
