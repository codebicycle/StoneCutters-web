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
        trackPage: 'selectCategoryLevel2',
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
    'items#safetytips#email': {
        trackPage: 'tapEmail'
    },
    'items#safetytips#call': {
        trackPage: 'tapCall'
    },
    'items#safetytips#sms': {
        trackPage: 'tapSms'
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
    'items#delete': {
        trackPage: 'myAccount',
        sellerType: 'private'
    },
    'items#filter': {
        trackPage: 'selectFilters'
    },
    'items#sort': {
        trackPage: 'selectSort'
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
    'post#flow#desktop_edit_step1': {
        trackPage: 'editFormStep1'
    },
    'post#flow#categories': {
        trackPage: 'postingFormStep2'
    },
    'post#flowMarketing': {
        trackPage: 'postingFormStep1'
    },
    'post#flowMarketing#desktop_step1': {
        trackPage: 'postingFormStep1'
    },
    'post#flowMarketing#desktop_step2': {
        trackPage: 'postingFormStep2'
    },
    'post#flowMarketing#desktop_edit_step1': {
        trackPage: 'editFormStep1'
    },
    'post#flowMarketing#categories': {
        trackPage: 'postingFormStep2'
    },
    'post#renew': {
        trackPage: 'postingFormStep1'
    },
    'post#renew#desktop_step1': {
        trackPage: 'postingFormStep1'
    },
    'post#renew#desktop_step2': {
        trackPage: 'postingFormStep2'
    },
    'post#renew#desktop_edit_step1': {
        trackPage: 'editFormStep1'
    },
    'post#renew#categories': {
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
    'users#registersuccess': {
        trackPage: 'registerSent'
    },
    'users#login': {
        trackPage: 'login'
    },
    'users#myolx': {
        trackPage: 'myAccount'
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
    'users#readmessages': {
        trackPage: 'myAccount'
    },
    'users#lostpassword': {
        trackPage: 'myAccount'
    },
    'users#conversation': {
        trackPage: 'myAccount'
    },
    'users#conversations': {
        trackPage: 'myAccount'
    },
    'users#conversationmail': {
        trackPage: 'myAccount'
    },
    'users#report': {
        trackPage: 'myAccount'
    },
    'users#unsubscribe': {
        trackPage: 'myAccount'
    },
    'users#editpersonalinfo': {
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
    },
    'locations#list': {
        trackPage: 'selectCity'
    }
};
