const accounting = require('accounting');
const assign = require('object-assign');
const localeCurrency = require('locale-currency');

const currencies = require('./currencies.json');
const localeFormats = require('./localeFormats.json');

const defaultCurrency = {
    symbol: '',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
};
const defaultLocaleFormat = {};

const formatMapping = [{
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    format: {
        pos: '%s%v',
        neg: '-%s%v',
        zero: '%s%v'
    }
}, {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    format: {
        pos: '%s %v',
        neg: '-%s %v',
        zero: '%s %v'
    }
}, {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    format: {
        pos: '%v%s',
        neg: '-%v%s',
        zero: '%v%s'
    }
}, {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    format: {
        pos: '%v %s',
        neg: '-%v %s',
        zero: '%v %s'
    }
}];

function isUndefined (val) {
    return typeof val === 'undefined';
}

const format = function format (value, options) {
    const code = options.code || (options.locale && localeCurrency.getCurrency(options.locale));
    const localeMatch = /^([a-z]+)([_-]([a-z]+))?$/i.exec(options.locale) || [];
    const language = localeMatch[1];
    const region = localeMatch[3];

    const localeFormat = assign({}, defaultLocaleFormat,
        localeFormats[language] || {},
        localeFormats[`${language}-${region}`] || {});

    const {
        decimalDigits,
        decimalSeparator,
        spaceBetweenAmountAndSymbol,
        symbol,
        symbolOnLeft,
        thousandsSeparator
    } = assign({}, defaultCurrency, findCurrency(code), localeFormat);

    var [{ format }] = formatMapping.filter((f) => (f.symbolOnLeft === symbolOnLeft && f.spaceBetweenAmountAndSymbol === spaceBetweenAmountAndSymbol));

    return accounting.formatMoney(value, {
        decimal: isUndefined(options.decimal) ? decimalSeparator : options.decimal,
        format: ['string', 'object'].indexOf(typeof options.format) > -1 ? options.format : format,
        precision: typeof options.precision === 'number' ? options.precision : decimalDigits,
        symbol: isUndefined(options.symbol) ? symbol : options.symbol,
        thousand: isUndefined(options.thousand) ? thousandsSeparator : options.thousand
    });
};

const findCurrency = (currencyCode) => currencies[currencyCode];

const unformat = (value, options) => {
    const code = options.code || (options.locale && localeCurrency.getCurrency(options.locale));
    const localeFormat = localeFormats[options.locale] || defaultLocaleFormat;

    const { decimalSeparator } = assign({}, defaultCurrency, findCurrency(code), localeFormat);
    const decimal = isUndefined(options.decimal) ? decimalSeparator : options.decimal;

    return accounting.unformat(value, decimal);
};

module.exports = {
    defaultCurrency,
    get currencies () {
        // In favor of backwards compatibility, the currencies map is converted to an array here
        return Object.keys(currencies).map((key) => currencies[key]);
    },
    findCurrency,
    format,
    unformat
};
