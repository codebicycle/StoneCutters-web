'use strict';

module.exports = {
    'categories#list': {
        trackPage: 'home'
    },
    'categories#show#listing': {
        trackPage: 'resultSet',
        resultSetType: 'browse',
        resultSetFormat: 'list'
    },
    'categories#showig#listing': {
        trackPage: 'resultSet',
        resultSetType: 'browse',
        resultSetFormat: 'gallery'
    },
    'categories#show': {
        trackPage: 'resultSet_subcategories',
        resultSetType: 'browse',
        resultSetFormat: 'list'
    },
    'searches#search': {
        trackPage: 'resultSet',
        resultSetType: 'search',
        resultSetFormat: 'list'
    },
    'searches#searchig': {
        trackPage: 'resultSet',
        resultSetType: 'search',
        resultSetFormat: 'gallery'
    },
    'searches#filter': {
        trackPage: 'resultSet',
        resultSetType: 'search',
        resultSetFormat: 'list'
    },
    'searches#filterig': {
        trackPage: 'resultSet',
        resultSetType: 'search',
        resultSetFormat: 'gallery'
    },
    'searches#statics': {
        trackPage: 'resultSet',
        resultSetType: 'static',
        resultSetFormat: 'list'
    },
    'searches#allresults': {
        trackPage: 'resultSet',
        resultSetType: 'browse',
        resultSetFormat: 'list'
    },
    'searches#allresultsig': {
        trackPage: 'resultSet',
        resultSetType: 'browse',
        resultSetFormat: 'gallery'
    },
    'items#success': {
        trackPage: 'replySent'
    },
    'items#reply': {
        trackPage: 'replyForm'
    },
    'items#show': {
        trackPage: 'item',
        sellerType: 'private'
    },
    'items#gallery': {
        trackPage: 'item',
        sellerType: 'private'
    },
    'items#map': {
        trackPage: 'item',
        sellerType: 'private'
    },
    'locations#list': {
        trackPage: 'resultSet_locations'
    },
    'post#location': {
        trackPage: 'postingFormStep1'
    },
    'post#flow': {
        trackPage: 'postingFormStep1'
    },
    'post#flow#desktop_step1': {
        trackPage: 'postingFormStep1'
    },
    'post#flow#desktop_step2': {
        trackPage: 'postingFormStep2'
    },
    'post#flow#categories': {
        trackPage: 'postingFormStep2'
    },
    'post#subcategories': {
        trackPage: 'postingFormStep2'
    },
    'post#form': {
        trackPage: 'postingFormStep3'
    },
    'post#success': {
        trackPage: 'postingSent'
    },
    'post#edit': {
        trackPage: 'editFormStep1'
    },
    'post#editsuccess': {
        trackPage: 'editSent'
    },
    'users#register': {
        trackPage: 'registerFormStep1'
    },
    'users#login': {
        trackPage: 'login'
    },
    'users#myads': {
        trackPage: 'myAccount'
    },
    'users#favorites': {
        trackPage: 'myAccount'
    },
    'users#messages': {
        trackPage: 'myAccount'
    },
    'users#lostpassword': {
        trackPage: 'myAccount'
    },
    'pages#terms': {
        trackPage: 'terms'
    },
    'pages#help': {
        trackPage: 'help'
    },
    'pages#interstitial': {
        trackPage: 'interstitial'
    },
    'pages#error': {
        trackPage: 'notFound'
    },
    'pages#allstates': {
        trackPage: 'sitemap'
    },
    'pages#sitemap': {
        trackPage: 'sitemapcalendar'
    },
    'pages#about': {
        trackPage: 'about'
    }
};
