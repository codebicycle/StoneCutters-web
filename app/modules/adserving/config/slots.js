'use strict';

module.exports = {
    'slot_top_listing': {
        enabled: true,
        types: {
            'CSA': {
                params: {
                    number: 3,
                    colorTitleLink: '#F00'
                },
                categories: [815, 817, 818, 816, 866, 362]
            },
            'ADX': {
                categories: [410]
            }
        }
    },
    'slot_bottom_listing': {
        enabled: true,
        types: {
            'CSA': {
                params: {
                    number: 2,
                    colorTitleLink: '#0F0'
                },
                categories: [815, 817, 818, 816, 866, 362]
            },
            'ADX': {
                categories: [410]
            }
        }
    }
};
