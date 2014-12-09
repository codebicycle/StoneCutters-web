'use strict';

module.exports = {
    slot_top_listing_gallery: {
        enabled: true,
        defaultType: 'CSA',
        channelName: 'ListingGallery',
        channelLocation: 'Top',
        types: {
            CSA: {
                ifSeo: 1,
                params: {
                    number: 3
                },
                excludedCategories: []
            }
        }
    },
    slot_top_listing: {
        enabled: true,
        defaultType: 'CSA',
        channelName: 'Listing',
        channelLocation: 'Top',
        types: {
            CSA: {
                ifSeo: 1,
                params: {
                    number: 3
                },
                excludedCategories: []
            }
        }
    },
    slot_bottom_listing: {
        enabled: true,
        defaultType: 'CSA',
        channelName: 'Listing',
        channelLocation: 'Bottom',
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
