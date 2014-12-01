'use strict';
// CSA Ads Default Config
module.exports = {
    enabled : true,
    options: {
        pubId: 'olx',
        queryCategories: [16, 185, 190, 821],
        query: '',
        channel: 'OLX_[countrycode]',
        hl: 'en',
        adPage: 3,
        adsafe: 'Medium'
    },
    params: {
        container: '[slot_empty]',
        number: 3,
        width: '100%',
        fontFamily: 'arial',

        rolloverLinkUnderline: false,
        fontSizeTitle: 16,
        lineHeightTitle: 26,
        colorTitleLink: '#38B',
        noTitleUnderline: true,

        fontSizeDomainLink: 12,
        lineHeightDomainLink: 16,
        colorDomainLink: '#999',

        fontSizeDescription: 12,
        lineHeightDescription: 16,
        colorText: '#999',

        colorAdSeparator: '#CCC',

        verticalSpacing: 2,

        clickableBackgrounds: true,

        adIconLocation: 'ad-left',
        adIconWidth: 143,
        adIconHeight: 112,
        adIconSpacingAbove: 4,
        adIconSpacingBefore: 6,
        adIconSpacingAfter: 15,
        adIconUrl: 'http://afs.googleusercontent.com/olx/olx_pt.png',

        rolloverAdBackgroundColor: '#FFF',

        lines: 3,
        longerHeadlines: true,
        domainLinkAboveDescription: false
    }
};
