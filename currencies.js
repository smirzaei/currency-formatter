const currenciesMap = require('./currencies.json');

module.exports = Object.keys(currenciesMap).map(key => currenciesMap[key]);