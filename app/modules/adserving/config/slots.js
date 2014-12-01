'use strict';

module.exports = {
    slot_top_listing: {
        enabled: true,
        defaultType: 'CSA',
        types: {
            CSA: {
                params: {
                    number: 3,
                    colorTitleLink: '#000'
                },
                excludedCategories: [185, 186]
            },
            ADX: {
                excludedCategories: [410]
            }
        }
    }
};
