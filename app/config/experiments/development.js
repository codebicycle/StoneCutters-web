'use strict';

module.exports = {
    html4ShowShops: {
        enabled: true,
        platforms: ['html4'],
        markets: ['ke'],
        name: 'show-shops',
        alternatives: {
            ITEMS: 'items',
            CALL_TO_ACTION: 'calltoactions'
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
        name: 'growth-categories-suggestion',
        alternatives: {
            CONTROL_1: 'control1',
            CONTROL_2: 'control2',
            CONTROL_3: 'control3',
            CONTROL_4: 'control4',
            CONTROL_5: 'control5',
            CONTROL_6: 'control6',
            CONTROL_7: 'control7',
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
        enabled: true,
        platforms: ['desktop'],
        markets: ['gt'],
        name: 'dgd-open-item-in-new-tab',
        alternatives: {
            CONTROL: 'control',
            OPEN_ITEM_IN_NEW_TAB: 'open-item-in-new-tab'
        },
        autoParticipate: true,
        fraction: 1
    }
};
