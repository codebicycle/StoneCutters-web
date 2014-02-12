module.exports = function(match) {
  match('?*params',           'home#index');
  match('',                   'home#index');

  match('categories',     'categories#index');
  match('items',          'items#index');
  match('categories?*params',     'categories#index');
  match('items?*params',          'items#index');

  match('search',          'items#search');
  match('search?*params',         'items#search');
  
  match('categories/:id?*params',	'categories#show');
  match('categories/:id',	'categories#show');
  match('items/:id',				      'items#show');

  match('location',       'location#index');
};
