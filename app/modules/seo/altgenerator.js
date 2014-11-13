var AlterGenerator = function () {
    this.data = {
        title: null,
        categoryName: null,
        parentCategoryName: null,
        optinalsByCategories: null,
        price: null,
        preCurrency: null,
        postCurrency: null,
        description: null,
        countryName: null,
        stateName: null,
        cityName: null,
        neighborhood: null

    };

};

AlterGenerator.prototype.fill = function (item) {
    this.data.title = item.title;
    this.data.categoryName = item.category.name;
    this.data.optinalsByCategories = 'TODO';
    this.data.price = item.price.amount;
    this.data.preCurrency = item.price.preCurrency;
    this.data.postCurrency = item.price.postCurrency;
    this.data.description = item.description;
    this.data.countryName = this.getCountryName(item);
    this.data.stateName = this.getStateName(item);
    this.data.cityName = this.getCityName(item);
    this.data.neighborhood = this.getNeighborhoodName(item);

    // console.log(item);
};

AlterGenerator.prototype.getCountryName = function (item) {
    if (item.location && item.location.type == 'country' ) {
        return item.location.name;
    }
}

AlterGenerator.prototype.getStateName = function (item) {
    if (item.location && item.location.children[0] && item.location.children[0].type == 'state') {
        return item.location.children[0].name;
    }
    else {
        return '';
    }
}

AlterGenerator.prototype.getCityName = function (item) {
    if (item.location && item.location.children[0] && item.location.children[0].children[0]) {
        return item.location.children[0].children[0].name;
    }
    else {
        return '';
    }
}
AlterGenerator.prototype.getNeighborhoodName = function (item) {
    if (item.location && item.location.children[0] && item.location.children[0].children[0] && item.location.children[0].children[0].children[0]) {
        return  item.location.children[0].children[0].children[0].name;
    }
    else {
        return '';
    }
}



module.exports = function (item) {
    var instance = new AlterGenerator();
    instance.fill(item);
    return instance;
};

