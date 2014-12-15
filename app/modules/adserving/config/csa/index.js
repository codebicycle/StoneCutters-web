'use strict';
// CSA Ads Default Config
module.exports = {
    enabled : true,
    options: {
        pubId: 'olx-browse',
        queryCategories: [16, 185, 190, 821],
        query: '',
        channel: 'OLX_[countrycode]',
        hl: 'en',
        adPage: 3,
        adsafe: 'Medium',
        ie: 'UTF-8',
        oe: 'UTF-8',
        linkTarget: '_blank'
    },
    params: {
        container: '[slot_empty]',
        number: 3,
        width: '100%',
        fontFamily: 'arial',

        rolloverLinkUnderline: false,
        fontSizeTitle: 16,
        lineHeightTitle: 24,
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

        rolloverAdBackgroundColor: '#FFF',
        clickableBackgrounds: true,

        lines: 3,
        longerHeadlines: true,
        domainLinkAboveDescription: false
    }
};
