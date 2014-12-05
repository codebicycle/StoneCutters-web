'use strict';

module.exports = {
    slot_top_listing: {
        enabled: true,
        defaultType: 'CSA',
        types: {
            CSA: {
                ifSeo: 1,
                params: {
                    number: 3
                },
                excludedCategories: [186]
            }
        }
    },
    slot_bottom_listing: {
        enabled: true,
        defaultType: 'CSA',
        types: {
            CSA: {
                ifSeo: 0,
                params: {
                    number: 3
                },
                excludedCategories: []
            }
        }
    }
};
