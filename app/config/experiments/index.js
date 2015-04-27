'use strict';

module.exports = {
    html4ShowShops: {
        enabled: false,
        platforms: ['html4'],
        markets: ['ke'],
        name: 'show-shops',
        alternatives: {
            ITEMS: 'items',
            CALL_TO_ACTION: 'calltoactions',
            CALL_TO_ACTION_MAP: 'calltoactions_map'
        },
        firstClick: true,
        autoParticipate: true
    },
    desktopDGD23ShowSimplifiedReplyForm: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar', 'co'],
        name: 'desktop-dgd23-show-simplified-reply-form',
        alternatives: {
            CONTROL: 'control',
            SHOW_SIMPLIFIED_REPLY_FORM: 'show-simplified-reply-form'
        },
        autoParticipate: true
    },
    growthCategorySuggestion: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar'],
        name: 'growth-category-suggestion',
        fraction: 0.3,
        alternatives: {
            CONTROL: 'control',
            SUGGESTED: 'suggested',
            SINGLE: 'single'
        }
    },
    dgdCategoryCars: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar', 'co'],
        name: 'dgd-category-cars',
        alternatives: {
            CONTROL: 'control',
            GALLERY: 'gallery'
        },
        autoParticipate: true
    },
    dgdHidePhoneNumber: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['uy'],
        name: 'hide-phone-number',
        alternatives: {
            CONTROL: 'control',
            HIDE_PHONE_NUMBER: 'hide-phone-number'
        },
        autoParticipate: false
    },
    dgdOpenItemInNewTab: {
        enabled: false,
        platforms: ['desktop'],
        markets: ['gt'],
        name: 'dgd-open-item-in-new-tab',
        alternatives: {
            CONTROL1: 'control',
            CONTROL2: 'control',
            CONTROL3: 'control',
            CONTROL4: 'control',
            CONTROL5: 'control',
            CONTROL6: 'control',
            CONTROL7: 'control',
            CONTROL8: 'control',
            CONTROL9: 'control',
            OPEN_ITEM_IN_NEW_TAB: 'open-item-in-new-tab'
        },
        autoParticipate: true,
        fraction: 1
    }
};
