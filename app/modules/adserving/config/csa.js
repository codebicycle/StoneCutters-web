'use strict';

module.exports = {
    enabled: true,
    'default': {
        queryCategories: [16, 185, 190, 821],
        seo: 4,
        options: {
            pubId: 'olx',
            query: '',
            channel: 'OLX_[countrycode]',
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
    },
    'custom': {
        seo: 3,
        params: {
            number: 3,
            fontSizeTitle: 18,
            adIconLocation: 'ad-left',
            adIconWidth: 143,
            adIconHeight: 112,
            adIconSpacingAbove: 4,
            adIconSpacingBefore: 6,
            adIconSpacingAfter: 15,
            adIconUrl: 'http://afs.googleusercontent.com/olx/olx_[langcode].png'
        }
    },
    language: {
        'default': 'es',
        list: ['es', 'en', 'pt', 'it', 'fr'],
        pattern: '[langcode]'
    },
    clientsIds: ['us', 'es', 'za']
};
