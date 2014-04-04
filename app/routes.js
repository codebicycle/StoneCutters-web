'use strict';

module.exports = function(match) {
    match('?*params', 'home#index');
    match('', 'home#index');

    match('categories', 'categories#index');
    match('items', 'items#index');
    match('categories?*params', 'categories#index');
    match('items?*params', 'items#index');

    match('search', 'items#search');
    match('search?*params', 'items#search');

    match('categories/:id?*params', 'categories#show');
    match('categories/:id', 'categories#show');
    match('items/:id', 'items#show');
    match('items/:id/reply', 'items#reply');

    match('location', 'location#index');
    match('registration', 'user#registration');
    match('login', 'user#login');
    match('my-ads', 'user#my-ads');
    match('favorites', 'user#favorites');

    match('post', 'post#index');
    match('post/:categoryId', 'post#subcat');
    match('post/:categoryId/:subcategoryId', 'post#form');

    match('terms', 'pages#terms');
};
