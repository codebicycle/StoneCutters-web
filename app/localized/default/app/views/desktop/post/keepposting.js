'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    className: 'keep-posting',
    getTemplateData: getTemplateData
});

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var keepPostingCat = config.getForMarket(this.app.session.get('location').url, ['successPage', 'keepPosting'], '');

    return _.extend({}, data, {
        keepPostingCat: keepPostingCat
    });
}

module.exports.id = 'post/keepposting';