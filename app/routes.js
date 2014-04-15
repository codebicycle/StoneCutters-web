'use strict';

module.exports = function(match) {
    match('?*params', 'home#index');
    match('', 'home#index');

/*
Categories/Search:
   /{slug}-cat-{catId}
   /{slug}-cat-{catId}-p-2
      ex: /telefonos-celulares-cat-831-p-2
   /{slug}-cat-{catId}/filters

Item:
   /{slug}-iid-{itemId}
      ex. pelotero-con-aro-de-basquet-opcional-96-pelotitas-iid-631256107

   /{slug}-iid-{itemId}/reply

*/
    match('categories', 'categories#index');
    match('items', 'items#index');
    match('categories?*params', 'categories#index');
    match('items?*params', 'items#index');

    match('nf/search/:search?', 'items#search');
    match('nf/search/:search/:page/:sort?', 'items#search');
    match('nf/search/:search/filters', 'items#filters');

    match('categories/:id?*params', 'categories#show');
    match('categories/:id', 'categories#show');
    match('items/:id', 'items#show');
    match('items/:id/reply', 'items#reply');

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
};
