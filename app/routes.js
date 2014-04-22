'use strict';

module.exports = function(match) {
    match('?*params', 'home#index');
    match('', 'home#index');

    match('search/:search?', 'items#search');
    match('search/:search/-p-:page/:filters?', 'items#search');
    match('nf/search/:search?', 'items#search');
    match('nf/search/:search/-p-:page/:filters?', 'items#search');

    match('location', 'location#index');
    match('register', 'user#registration');
    match('login', 'user#login');
    match('myolx/myadslisting', 'user#my-ads');
    match('myolx/favoritelisting', 'user#favorites');

    match('posting', 'post#index');
    match('posting/:categoryId', 'post#subcat');
    match('posting/:categoryId/:subcategoryId', 'post#form');

    match('terms', 'pages#terms');
    match('help', 'pages#help');
    match('interstitial', 'pages#interstitial');

    match(':title-iid-:itemId(\\d+$)', 'items#show');
    match(':title-iid-:itemId(\\d+)/reply', 'items#reply');

    match(':title-cat-:catId(\\d+$)', 'categories#show');
    match(':title-cat-:catId(\\d+)-p-:page(\\d+$)', 'items#index');
    match(':title-cat-:catId(\\d+)-p-:page(\\d+)/:filters?', 'items#index');
};
