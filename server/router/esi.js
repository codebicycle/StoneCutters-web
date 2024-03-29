'use strict';

module.exports = function itemRouter(app, dataAdapter) {
    var _ = require('underscore');
    var utils = require('../../shared/utils');
    var marketing = require('../../app/helpers/marketing');
    var translations = require('../../shared/translations');

    (function esi() {
        app.get('/esi', handler);

        function getDataDefault(req) {
            var data = {
                osName: req.rendrApp.session.get('osName')
            };

            return data;
        }

        function getDataUser(req) {
            var user = req.rendrApp.session.get('user');
            var clientId = req.rendrApp.session.get('clientId');
            var sid = req.rendrApp.session.get('sid');
            var data = {
                user_loggedin: !!user,
                clientId: clientId
            };

            if (data.user_loggedin) {
                data.user_id = user.id;
            }
            if (sid) {
                data.sid = sid;
            }
            return data;
        }

        function getDataMarketing(req) {
            var data = {};
            var info = marketing.getInfo(req.rendrApp, 'footer');
            var dictionary;
            var key;

            if (info && !_.isEmpty(info)) {
                for (key in info) {
                    data['marketing_' + key] = info[key];
                }
                dictionary = translations.get(req.rendrApp.session.get('selectedLanguage'));
                data.marketing_forOsKey = dictionary[data.marketing_forOsKey];
                data.marketing_freeInKey = dictionary[data.marketing_freeInKey];
            }
            return data;
        }

        function handler(req, res) {
            var result = {};
            var esi = [];
            var xOriginOlx = req.param('x-origin-olx');

            if (xOriginOlx) {
                req.rendrApp.session.persist({
                    'x-origin-olx': xOriginOlx
                });
                return res.redirect('/');
            }

            _.extend(result, getDataDefault(req, result));
            _.extend(result, getDataUser(req, result));
            _.extend(result, getDataMarketing(req, result));

            for (var variable in result) {
                esi.push('<esi:assign name="');
                esi.push(variable);
                esi.push('">\'\'\'');
                esi.push(result[variable]);
                esi.push('\'\'\'</esi:assign>');
            }
            res.send(esi.join(''));
        }
    })();
};
