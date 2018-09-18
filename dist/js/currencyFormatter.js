(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.currencyFormatter = {})));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var accounting = createCommonjsModule(function (module, exports) {
	/*!
	 * accounting.js v0.4.1
	 * Copyright 2014 Open Exchange Rates
	 *
	 * Freely distributable under the MIT license.
	 * Portions of accounting.js are inspired or borrowed from underscore.js
	 *
	 * Full details and documentation:
	 * http://openexchangerates.github.io/accounting.js/
	 */

	(function(root, undefined) {

		/* --- Setup --- */

		// Create the local library object, to be exported or referenced globally later
		var lib = {};

		// Current version
		lib.version = '0.4.1';


		/* --- Exposed settings --- */

		// The library's settings configuration object. Contains default parameters for
		// currency and number formatting
		lib.settings = {
			currency: {
				symbol : "$",		// default currency symbol is '$'
				format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
				decimal : ".",		// decimal point separator
				thousand : ",",		// thousands separator
				precision : 2,		// decimal places
				grouping : 3		// digit grouping (not implemented yet)
			},
			number: {
				precision : 0,		// default precision on numbers is 0
				grouping : 3,		// digit grouping (not implemented yet)
				thousand : ",",
				decimal : "."
			}
		};


		/* --- Internal Helper Methods --- */

		// Store reference to possibly-available ECMAScript 5 methods for later
		var nativeMap = Array.prototype.map,
			nativeIsArray = Array.isArray,
			toString = Object.prototype.toString;

		/**
		 * Tests whether supplied parameter is a string
		 * from underscore.js
		 */
		function isString(obj) {
			return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
		}

		/**
		 * Tests whether supplied parameter is a string
		 * from underscore.js, delegates to ECMA5's native Array.isArray
		 */
		function isArray(obj) {
			return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
		}

		/**
		 * Tests whether supplied parameter is a true object
		 */
		function isObject(obj) {
			return obj && toString.call(obj) === '[object Object]';
		}

		/**
		 * Extends an object with a defaults object, similar to underscore's _.defaults
		 *
		 * Used for abstracting parameter handling from API methods
		 */
		function defaults(object, defs) {
			var key;
			object = object || {};
			defs = defs || {};
			// Iterate over object non-prototype properties:
			for (key in defs) {
				if (defs.hasOwnProperty(key)) {
					// Replace values with defaults only if undefined (allow empty/zero values):
					if (object[key] == null) object[key] = defs[key];
				}
			}
			return object;
		}

		/**
		 * Implementation of `Array.map()` for iteration loops
		 *
		 * Returns a new Array as a result of calling `iterator` on each array value.
		 * Defers to native Array.map if available
		 */
		function map(obj, iterator, context) {
			var results = [], i, j;

			if (!obj) return results;

			// Use native .map method if it exists:
			if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

			// Fallback for native .map:
			for (i = 0, j = obj.length; i < j; i++ ) {
				results[i] = iterator.call(context, obj[i], i, obj);
			}
			return results;
		}

		/**
		 * Check and normalise the value of precision (must be positive integer)
		 */
		function checkPrecision(val, base) {
			val = Math.round(Math.abs(val));
			return isNaN(val)? base : val;
		}


		/**
		 * Parses a format string or object and returns format obj for use in rendering
		 *
		 * `format` is either a string with the default (positive) format, or object
		 * containing `pos` (required), `neg` and `zero` values (or a function returning
		 * either a string or object)
		 *
		 * Either string or format.pos must contain "%v" (value) to be valid
		 */
		function checkCurrencyFormat(format) {
			var defaults = lib.settings.currency.format;

			// Allow function as format parameter (should return string or object):
			if ( typeof format === "function" ) format = format();

			// Format can be a string, in which case `value` ("%v") must be present:
			if ( isString( format ) && format.match("%v") ) {

				// Create and return positive, negative and zero formats:
				return {
					pos : format,
					neg : format.replace("-", "").replace("%v", "-%v"),
					zero : format
				};

			// If no format, or object is missing valid positive value, use defaults:
			} else if ( !format || !format.pos || !format.pos.match("%v") ) {

				// If defaults is a string, casts it to an object for faster checking next time:
				return ( !isString( defaults ) ) ? defaults : lib.settings.currency.format = {
					pos : defaults,
					neg : defaults.replace("%v", "-%v"),
					zero : defaults
				};

			}
			// Otherwise, assume format was fine:
			return format;
		}


		/* --- API Methods --- */

		/**
		 * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
		 * Alias: `accounting.parse(string)`
		 *
		 * Decimal must be included in the regular expression to match floats (defaults to
		 * accounting.settings.number.decimal), so if the number uses a non-standard decimal 
		 * separator, provide it as the second argument.
		 *
		 * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
		 *
		 * Doesn't throw any errors (`NaN`s become 0) but this may change in future
		 */
		var unformat = lib.unformat = lib.parse = function(value, decimal) {
			// Recursively unformat arrays:
			if (isArray(value)) {
				return map(value, function(val) {
					return unformat(val, decimal);
				});
			}

			// Fails silently (need decent errors):
			value = value || 0;

			// Return the value as-is if it's already a number:
			if (typeof value === "number") return value;

			// Default decimal point comes from settings, but could be set to eg. "," in opts:
			decimal = decimal || lib.settings.number.decimal;

			 // Build regex to strip out everything except digits, decimal point and minus sign:
			var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
				unformatted = parseFloat(
					("" + value)
					.replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
					.replace(regex, '')         // strip out any cruft
					.replace(decimal, '.')      // make sure decimal point is standard
				);

			// This will fail silently which may cause trouble, let's wait and see:
			return !isNaN(unformatted) ? unformatted : 0;
		};


		/**
		 * Implementation of toFixed() that treats floats more like decimals
		 *
		 * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
		 * problems for accounting- and finance-related software.
		 */
		var toFixed = lib.toFixed = function(value, precision) {
			precision = checkPrecision(precision, lib.settings.number.precision);
			var power = Math.pow(10, precision);

			// Multiply up by precision, round accurately, then divide and use native toFixed():
			return (Math.round(lib.unformat(value) * power) / power).toFixed(precision);
		};


		/**
		 * Format a number, with comma-separated thousands and custom precision/decimal places
		 * Alias: `accounting.format()`
		 *
		 * Localise by overriding the precision and thousand / decimal separators
		 * 2nd parameter `precision` can be an object matching `settings.number`
		 */
		var formatNumber = lib.formatNumber = lib.format = function(number, precision, thousand, decimal) {
			// Resursively format arrays:
			if (isArray(number)) {
				return map(number, function(val) {
					return formatNumber(val, precision, thousand, decimal);
				});
			}

			// Clean up number:
			number = unformat(number);

			// Build options object from second param (if object) or all params, extending defaults:
			var opts = defaults(
					(isObject(precision) ? precision : {
						precision : precision,
						thousand : thousand,
						decimal : decimal
					}),
					lib.settings.number
				),

				// Clean up precision
				usePrecision = checkPrecision(opts.precision),

				// Do some calc:
				negative = number < 0 ? "-" : "",
				base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
				mod = base.length > 3 ? base.length % 3 : 0;

			// Format the number:
			return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
		};


		/**
		 * Format a number into currency
		 *
		 * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
		 * defaults: (0, "$", 2, ",", ".", "%s%v")
		 *
		 * Localise by overriding the symbol, precision, thousand / decimal separators and format
		 * Second param can be an object matching `settings.currency` which is the easiest way.
		 *
		 * To do: tidy up the parameters
		 */
		var formatMoney = lib.formatMoney = function(number, symbol, precision, thousand, decimal, format) {
			// Resursively format arrays:
			if (isArray(number)) {
				return map(number, function(val){
					return formatMoney(val, symbol, precision, thousand, decimal, format);
				});
			}

			// Clean up number:
			number = unformat(number);

			// Build options object from second param (if object) or all params, extending defaults:
			var opts = defaults(
					(isObject(symbol) ? symbol : {
						symbol : symbol,
						precision : precision,
						thousand : thousand,
						decimal : decimal,
						format : format
					}),
					lib.settings.currency
				),

				// Check format (returns object with pos, neg and zero):
				formats = checkCurrencyFormat(opts.format),

				// Choose which format to use for this value:
				useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

			// Return with currency symbol added:
			return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
		};


		/**
		 * Format a list of numbers into an accounting column, padding with whitespace
		 * to line up currency symbols, thousand separators and decimals places
		 *
		 * List should be an array of numbers
		 * Second parameter can be an object containing keys that match the params
		 *
		 * Returns array of accouting-formatted number strings of same length
		 *
		 * NB: `white-space:pre` CSS rule is required on the list container to prevent
		 * browsers from collapsing the whitespace in the output strings.
		 */
		lib.formatColumn = function(list, symbol, precision, thousand, decimal, format) {
			if (!list) return [];

			// Build options object from second param (if object) or all params, extending defaults:
			var opts = defaults(
					(isObject(symbol) ? symbol : {
						symbol : symbol,
						precision : precision,
						thousand : thousand,
						decimal : decimal,
						format : format
					}),
					lib.settings.currency
				),

				// Check format (returns object with pos, neg and zero), only need pos for now:
				formats = checkCurrencyFormat(opts.format),

				// Whether to pad at start of string or after currency symbol:
				padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

				// Store value for the length of the longest string in the column:
				maxLength = 0,

				// Format the list according to options, store the length of the longest string:
				formatted = map(list, function(val, i) {
					if (isArray(val)) {
						// Recursively format columns if list is a multi-dimensional array:
						return lib.formatColumn(val, opts);
					} else {
						// Clean up the value
						val = unformat(val);

						// Choose which format to use for this value (pos, neg or zero):
						var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

							// Format this value, push into formatted list and save the length:
							fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

						if (fVal.length > maxLength) maxLength = fVal.length;
						return fVal;
					}
				});

			// Pad each number in the list and send back the column of numbers:
			return map(formatted, function(val, i) {
				// Only if this is a string (not a nested array, which would have already been padded):
				if (isString(val) && val.length < maxLength) {
					// Depending on symbol position, pad after symbol or at index 0:
					return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
				}
				return val;
			});
		};


		/* --- Module Definition --- */

		// Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
		// Otherwise, just add `accounting` to the global object
		{
			if (module.exports) {
				exports = module.exports = lib;
			}
			exports.accounting = lib;
		}

		// Root will be `window` in browser or `global` on the server:
	}(commonjsGlobal));
	});
	var accounting_1 = accounting.accounting;

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	// Generated using ShowCurrencies.java
	var map = {
	AD: 'EUR',
	AE: 'AED',
	AF: 'AFN',
	AG: 'XCD',
	AI: 'XCD',
	AL: 'ALL',
	AM: 'AMD',
	AN: 'ANG',
	AO: 'AOA',
	AR: 'ARS',
	AS: 'USD',
	AT: 'EUR',
	AU: 'AUD',
	AW: 'AWG',
	AX: 'EUR',
	AZ: 'AZN',
	BA: 'BAM',
	BB: 'BBD',
	BD: 'BDT',
	BE: 'EUR',
	BF: 'XOF',
	BG: 'BGN',
	BH: 'BHD',
	BI: 'BIF',
	BJ: 'XOF',
	BL: 'EUR',
	BM: 'BMD',
	BN: 'BND',
	BO: 'BOB',
	BQ: 'USD',
	BR: 'BRL',
	BS: 'BSD',
	BT: 'BTN',
	BV: 'NOK',
	BW: 'BWP',
	BY: 'BYR',
	BZ: 'BZD',
	CA: 'CAD',
	CC: 'AUD',
	CD: 'CDF',
	CF: 'XAF',
	CG: 'XAF',
	CH: 'CHF',
	CI: 'XOF',
	CK: 'NZD',
	CL: 'CLP',
	CM: 'XAF',
	CN: 'CNY',
	CO: 'COP',
	CR: 'CRC',
	CU: 'CUP',
	CV: 'CVE',
	CW: 'ANG',
	CX: 'AUD',
	CY: 'EUR',
	CZ: 'CZK',
	DE: 'EUR',
	DJ: 'DJF',
	DK: 'DKK',
	DM: 'XCD',
	DO: 'DOP',
	DZ: 'DZD',
	EC: 'USD',
	EE: 'EUR',
	EG: 'EGP',
	EH: 'MAD',
	ER: 'ERN',
	ES: 'EUR',
	ET: 'ETB',
	FI: 'EUR',
	FJ: 'FJD',
	FK: 'FKP',
	FM: 'USD',
	FO: 'DKK',
	FR: 'EUR',
	GA: 'XAF',
	GB: 'GBP',
	GD: 'XCD',
	GE: 'GEL',
	GF: 'EUR',
	GG: 'GBP',
	GH: 'GHS',
	GI: 'GIP',
	GL: 'DKK',
	GM: 'GMD',
	GN: 'GNF',
	GP: 'EUR',
	GQ: 'XAF',
	GR: 'EUR',
	GS: 'GBP',
	GT: 'GTQ',
	GU: 'USD',
	GW: 'XOF',
	GY: 'GYD',
	HK: 'HKD',
	HM: 'AUD',
	HN: 'HNL',
	HR: 'HRK',
	HT: 'HTG',
	HU: 'HUF',
	ID: 'IDR',
	IE: 'EUR',
	IL: 'ILS',
	IM: 'GBP',
	IN: 'INR',
	IO: 'USD',
	IQ: 'IQD',
	IR: 'IRR',
	IS: 'ISK',
	IT: 'EUR',
	JE: 'GBP',
	JM: 'JMD',
	JO: 'JOD',
	JP: 'JPY',
	KE: 'KES',
	KG: 'KGS',
	KH: 'KHR',
	KI: 'AUD',
	KM: 'KMF',
	KN: 'XCD',
	KP: 'KPW',
	KR: 'KRW',
	KW: 'KWD',
	KY: 'KYD',
	KZ: 'KZT',
	LA: 'LAK',
	LB: 'LBP',
	LC: 'XCD',
	LI: 'CHF',
	LK: 'LKR',
	LR: 'LRD',
	LS: 'LSL',
	LT: 'LTL',
	LU: 'EUR',
	LV: 'LVL',
	LY: 'LYD',
	MA: 'MAD',
	MC: 'EUR',
	MD: 'MDL',
	ME: 'EUR',
	MF: 'EUR',
	MG: 'MGA',
	MH: 'USD',
	MK: 'MKD',
	ML: 'XOF',
	MM: 'MMK',
	MN: 'MNT',
	MO: 'MOP',
	MP: 'USD',
	MQ: 'EUR',
	MR: 'MRO',
	MS: 'XCD',
	MT: 'EUR',
	MU: 'MUR',
	MV: 'MVR',
	MW: 'MWK',
	MX: 'MXN',
	MY: 'MYR',
	MZ: 'MZN',
	NA: 'NAD',
	NC: 'XPF',
	NE: 'XOF',
	NF: 'AUD',
	NG: 'NGN',
	NI: 'NIO',
	NL: 'EUR',
	NO: 'NOK',
	NP: 'NPR',
	NR: 'AUD',
	NU: 'NZD',
	NZ: 'NZD',
	OM: 'OMR',
	PA: 'PAB',
	PE: 'PEN',
	PF: 'XPF',
	PG: 'PGK',
	PH: 'PHP',
	PK: 'PKR',
	PL: 'PLN',
	PM: 'EUR',
	PN: 'NZD',
	PR: 'USD',
	PS: 'ILS',
	PT: 'EUR',
	PW: 'USD',
	PY: 'PYG',
	QA: 'QAR',
	RE: 'EUR',
	RO: 'RON',
	RS: 'RSD',
	RU: 'RUB',
	RW: 'RWF',
	SA: 'SAR',
	SB: 'SBD',
	SC: 'SCR',
	SD: 'SDG',
	SE: 'SEK',
	SG: 'SGD',
	SH: 'SHP',
	SI: 'EUR',
	SJ: 'NOK',
	SK: 'EUR',
	SL: 'SLL',
	SM: 'EUR',
	SN: 'XOF',
	SO: 'SOS',
	SR: 'SRD',
	ST: 'STD',
	SV: 'SVC',
	SX: 'ANG',
	SY: 'SYP',
	SZ: 'SZL',
	TC: 'USD',
	TD: 'XAF',
	TF: 'EUR',
	TG: 'XOF',
	TH: 'THB',
	TJ: 'TJS',
	TK: 'NZD',
	TL: 'USD',
	TM: 'TMT',
	TN: 'TND',
	TO: 'TOP',
	TR: 'TRY',
	TT: 'TTD',
	TV: 'AUD',
	TW: 'TWD',
	TZ: 'TZS',
	UA: 'UAH',
	UG: 'UGX',
	UM: 'USD',
	US: 'USD',
	UY: 'UYU',
	UZ: 'UZS',
	VA: 'EUR',
	VC: 'XCD',
	VE: 'VEF',
	VG: 'USD',
	VI: 'USD',
	VN: 'VND',
	VU: 'VUV',
	WF: 'XPF',
	WS: 'WST',
	YE: 'YER',
	YT: 'EUR',
	ZA: 'ZAR',
	ZM: 'ZMK',
	ZW: 'ZWL'
	};

	var map_1 = map;

	var getCountryCode = function(localeString) {
	    var components = localeString.split("_");
	    if (components.length == 2) {
	        return components.pop();
	    }
	    components = localeString.split("-");
	    if (components.length == 2) {
	        return components.pop();
	    }
	    return localeString;
	};

	var getCurrency = function(locale) {
	    var countryCode = getCountryCode(locale).toUpperCase();
	    if (countryCode in map_1) {
	        return map_1[countryCode];
	    }
	    return null;
	};

	var getLocales = function(currencyCode) {
	    currencyCode = currencyCode.toUpperCase();
	    var locales = [];
	    for (countryCode in map_1) {
	        if (map_1[countryCode] === currencyCode) {
	            locales.push(countryCode);
	        }
	    }
	    return locales;
	};

	var localeCurrency = {
		getCurrency: getCurrency,
		getLocales: getLocales
	};

	var currencies = {
	  AED: {
	    code: "AED",
	    symbol: "د.إ.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  AFN: {
	    code: "AFN",
	    symbol: "؋",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  ALL: {
	    code: "ALL",
	    symbol: "Lek",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  AMD: {
	    code: "AMD",
	    symbol: "֏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  ANG: {
	    code: "ANG",
	    symbol: "ƒ",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  AOA: {
	    code: "AOA",
	    symbol: "Kz",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  ARS: {
	    code: "ARS",
	    symbol: "$",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  AUD: {
	    code: "AUD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  AWG: {
	    code: "AWG",
	    symbol: "ƒ",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  AZN: {
	    code: "AZN",
	    symbol: "₼",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BAM: {
	    code: "BAM",
	    symbol: "КМ",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BBD: {
	    code: "BBD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  BDT: {
	    code: "BDT",
	    symbol: "৳",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 0
	  },
	  BGN: {
	    code: "BGN",
	    symbol: "лв.",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BHD: {
	    code: "BHD",
	    symbol: "د.ب.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 3
	  },
	  BIF: {
	    code: "BIF",
	    symbol: "FBu",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  BMD: {
	    code: "BMD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  BND: {
	    code: "BND",
	    symbol: "$",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  BOB: {
	    code: "BOB",
	    symbol: "Bs",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BRL: {
	    code: "BRL",
	    symbol: "R$",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BSD: {
	    code: "BSD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  BTC: {
	    code: "BTC",
	    symbol: "Ƀ",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 8
	  },
	  BTN: {
	    code: "BTN",
	    symbol: "Nu.",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 1
	  },
	  BWP: {
	    code: "BWP",
	    symbol: "P",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  BYR: {
	    code: "BYR",
	    symbol: "р.",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  BZD: {
	    code: "BZD",
	    symbol: "BZ$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CAD: {
	    code: "CAD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CDF: {
	    code: "CDF",
	    symbol: "FC",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CHF: {
	    code: "CHF",
	    symbol: "Fr",
	    thousandsSeparator: "'",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  CLP: {
	    code: "CLP",
	    symbol: "$",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  CNY: {
	    code: "CNY",
	    symbol: "¥",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  COP: {
	    code: "COP",
	    symbol: "$",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  CRC: {
	    code: "CRC",
	    symbol: "₡",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CUC: {
	    code: "CUC",
	    symbol: "CUC",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CUP: {
	    code: "CUP",
	    symbol: "$MN",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CVE: {
	    code: "CVE",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  CZK: {
	    code: "CZK",
	    symbol: "Kč",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  DJF: {
	    code: "DJF",
	    symbol: "Fdj",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  DKK: {
	    code: "DKK",
	    symbol: "kr.",
	    thousandsSeparator: "",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  DOP: {
	    code: "DOP",
	    symbol: "RD$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  DZD: {
	    code: "DZD",
	    symbol: "د.ج.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  EGP: {
	    code: "EGP",
	    symbol: "ج.م.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  ERN: {
	    code: "ERN",
	    symbol: "Nfk",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  ETB: {
	    code: "ETB",
	    symbol: "ETB",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  EUR: {
	    code: "EUR",
	    symbol: "€",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  FJD: {
	    code: "FJD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  FKP: {
	    code: "FKP",
	    symbol: "£",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GBP: {
	    code: "GBP",
	    symbol: "£",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GEL: {
	    code: "GEL",
	    symbol: "Lari",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  GHS: {
	    code: "GHS",
	    symbol: "₵",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GIP: {
	    code: "GIP",
	    symbol: "£",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GMD: {
	    code: "GMD",
	    symbol: "D",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GNF: {
	    code: "GNF",
	    symbol: "FG",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  GTQ: {
	    code: "GTQ",
	    symbol: "Q",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  GYD: {
	    code: "GYD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  HKD: {
	    code: "HKD",
	    symbol: "HK$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  HNL: {
	    code: "HNL",
	    symbol: "L.",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  HRK: {
	    code: "HRK",
	    symbol: "kn",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  HTG: {
	    code: "HTG",
	    symbol: "G",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  HUF: {
	    code: "HUF",
	    symbol: "Ft",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  IDR: {
	    code: "IDR",
	    symbol: "Rp",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  ILS: {
	    code: "ILS",
	    symbol: "₪",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  INR: {
	    code: "INR",
	    symbol: "₹",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  IQD: {
	    code: "IQD",
	    symbol: "د.ع.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  IRR: {
	    code: "IRR",
	    symbol: "﷼",
	    thousandsSeparator: ",",
	    decimalSeparator: "/",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  ISK: {
	    code: "ISK",
	    symbol: "kr.",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 0
	  },
	  JMD: {
	    code: "JMD",
	    symbol: "J$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  JOD: {
	    code: "JOD",
	    symbol: "د.ا.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 3
	  },
	  JPY: {
	    code: "JPY",
	    symbol: "¥",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  KES: {
	    code: "KES",
	    symbol: "KSh",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  KGS: {
	    code: "KGS",
	    symbol: "сом",
	    thousandsSeparator: " ",
	    decimalSeparator: "-",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  KHR: {
	    code: "KHR",
	    symbol: "៛",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  KMF: {
	    code: "KMF",
	    symbol: "CF",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  KPW: {
	    code: "KPW",
	    symbol: "₩",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  KRW: {
	    code: "KRW",
	    symbol: "₩",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  KWD: {
	    code: "KWD",
	    symbol: "د.ك.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 3
	  },
	  KYD: {
	    code: "KYD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  KZT: {
	    code: "KZT",
	    symbol: "₸",
	    thousandsSeparator: " ",
	    decimalSeparator: "-",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  LAK: {
	    code: "LAK",
	    symbol: "₭",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  LBP: {
	    code: "LBP",
	    symbol: "ل.ل.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  LKR: {
	    code: "LKR",
	    symbol: "₨",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 0
	  },
	  LRD: {
	    code: "LRD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  LSL: {
	    code: "LSL",
	    symbol: "M",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  LYD: {
	    code: "LYD",
	    symbol: "د.ل.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 3
	  },
	  MAD: {
	    code: "MAD",
	    symbol: "د.م.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  MDL: {
	    code: "MDL",
	    symbol: "lei",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  MGA: {
	    code: "MGA",
	    symbol: "Ar",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  MKD: {
	    code: "MKD",
	    symbol: "ден.",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  MMK: {
	    code: "MMK",
	    symbol: "K",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MNT: {
	    code: "MNT",
	    symbol: "₮",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MOP: {
	    code: "MOP",
	    symbol: "MOP$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MRO: {
	    code: "MRO",
	    symbol: "UM",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MTL: {
	    code: "MTL",
	    symbol: "₤",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MUR: {
	    code: "MUR",
	    symbol: "₨",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MVR: {
	    code: "MVR",
	    symbol: "MVR",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 1
	  },
	  MWK: {
	    code: "MWK",
	    symbol: "MK",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MXN: {
	    code: "MXN",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MYR: {
	    code: "MYR",
	    symbol: "RM",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  MZN: {
	    code: "MZN",
	    symbol: "MT",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  NAD: {
	    code: "NAD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  NGN: {
	    code: "NGN",
	    symbol: "₦",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  NIO: {
	    code: "NIO",
	    symbol: "C$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  NOK: {
	    code: "NOK",
	    symbol: "kr",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  NPR: {
	    code: "NPR",
	    symbol: "₨",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  NZD: {
	    code: "NZD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  OMR: {
	    code: "OMR",
	    symbol: "﷼",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 3
	  },
	  PAB: {
	    code: "PAB",
	    symbol: "B/.",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  PEN: {
	    code: "PEN",
	    symbol: "S/.",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  PGK: {
	    code: "PGK",
	    symbol: "K",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  PHP: {
	    code: "PHP",
	    symbol: "₱",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  PKR: {
	    code: "PKR",
	    symbol: "₨",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  PLN: {
	    code: "PLN",
	    symbol: "zł",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  PYG: {
	    code: "PYG",
	    symbol: "₲",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  QAR: {
	    code: "QAR",
	    symbol: "﷼",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  RON: {
	    code: "RON",
	    symbol: "lei",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  RSD: {
	    code: "RSD",
	    symbol: "Дин.",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  RUB: {
	    code: "RUB",
	    symbol: "₽",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  RWF: {
	    code: "RWF",
	    symbol: "RWF",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  SAR: {
	    code: "SAR",
	    symbol: "﷼",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  SBD: {
	    code: "SBD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SCR: {
	    code: "SCR",
	    symbol: "₨",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SDD: {
	    code: "SDD",
	    symbol: "LSd",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SDG: {
	    code: "SDG",
	    symbol: "£‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SEK: {
	    code: "SEK",
	    symbol: "kr",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  SGD: {
	    code: "SGD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SHP: {
	    code: "SHP",
	    symbol: "£",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SLL: {
	    code: "SLL",
	    symbol: "Le",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SOS: {
	    code: "SOS",
	    symbol: "S",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SRD: {
	    code: "SRD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  STD: {
	    code: "STD",
	    symbol: "Db",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SVC: {
	    code: "SVC",
	    symbol: "₡",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  SYP: {
	    code: "SYP",
	    symbol: "£",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  SZL: {
	    code: "SZL",
	    symbol: "E",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  THB: {
	    code: "THB",
	    symbol: "฿",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  TJS: {
	    code: "TJS",
	    symbol: "TJS",
	    thousandsSeparator: " ",
	    decimalSeparator: ";",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  TMT: {
	    code: "TMT",
	    symbol: "m",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  TND: {
	    code: "TND",
	    symbol: "د.ت.‏",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 3
	  },
	  TOP: {
	    code: "TOP",
	    symbol: "T$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  TRY: {
	    code: "TRY",
	    symbol: "TL",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  TTD: {
	    code: "TTD",
	    symbol: "TT$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  TVD: {
	    code: "TVD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  TWD: {
	    code: "TWD",
	    symbol: "NT$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  TZS: {
	    code: "TZS",
	    symbol: "TSh",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  UAH: {
	    code: "UAH",
	    symbol: "₴",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  UGX: {
	    code: "UGX",
	    symbol: "USh",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  USD: {
	    code: "USD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  UYU: {
	    code: "UYU",
	    symbol: "$U",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  UZS: {
	    code: "UZS",
	    symbol: "сўм",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  VEB: {
	    code: "VEB",
	    symbol: "Bs.",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  VEF: {
	    code: "VEF",
	    symbol: "Bs. F.",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  VND: {
	    code: "VND",
	    symbol: "₫",
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 1
	  },
	  VUV: {
	    code: "VUV",
	    symbol: "VT",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 0
	  },
	  WST: {
	    code: "WST",
	    symbol: "WS$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  XAF: {
	    code: "XAF",
	    symbol: "F",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  XCD: {
	    code: "XCD",
	    symbol: "$",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  XBT: {
	    code: "XBT",
	    symbol: "Ƀ",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  XOF: {
	    code: "XOF",
	    symbol: "F",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  XPF: {
	    code: "XPF",
	    symbol: "F",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  YER: {
	    code: "YER",
	    symbol: "﷼",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  ZAR: {
	    code: "ZAR",
	    symbol: "R",
	    thousandsSeparator: " ",
	    decimalSeparator: ",",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  ZMW: {
	    code: "ZMW",
	    symbol: "ZK",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  WON: {
	    code: "WON",
	    symbol: "₩",
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  }
	};
	var currencies_1 = currencies;

	var localeFormats = {
	  de: {
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  el: {
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    decimalDigits: 2
	  },
	  "en-US": {
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  "en-IE": {
	    symbolOnLeft: true,
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  "zh-CN": {
	    thousandsSeparator: ",",
	    decimalSeparator: ".",
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    decimalDigits: 2
	  },
	  es: {
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    symbolOnLeft: false,
	    spaceBetweenAmountAndSymbol: true,
	    decimalDigits: 2
	  },
	  it: {
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    decimalDigits: 2
	  },
	  nl: {
	    symbolOnLeft: true,
	    spaceBetweenAmountAndSymbol: false,
	    thousandsSeparator: ".",
	    decimalSeparator: ",",
	    decimalDigits: 2
	  }
	};
	var localeFormats_1 = localeFormats;

	var defaultCurrency = {
	  symbol: '',
	  thousandsSeparator: ',',
	  decimalSeparator: '.',
	  symbolOnLeft: true,
	  spaceBetweenAmountAndSymbol: false,
	  decimalDigits: 2
	};
	var defaultLocaleFormat = {};
	var formatMapping = [{
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

	function format(value, options) {
	  var code = options.code || options.locale && localeCurrency.getCurrency(options.locale);
	  var localeMatch = /^([a-z]+)([_-]([a-z]+))?$/i.exec(options.locale) || [];
	  var language = localeMatch[1];
	  var region = localeMatch[3];
	  var localeFormat = objectAssign({}, defaultLocaleFormat, localeFormats_1[language] || {}, localeFormats_1[language + '-' + region] || {});
	  var currency = objectAssign({}, defaultCurrency, findCurrency(code), localeFormat);
	  var symbolOnLeft = currency.symbolOnLeft;
	  var spaceBetweenAmountAndSymbol = currency.spaceBetweenAmountAndSymbol;
	  var format = formatMapping.filter(function (f) {
	    return f.symbolOnLeft == symbolOnLeft && f.spaceBetweenAmountAndSymbol == spaceBetweenAmountAndSymbol;
	  })[0].format;
	  return accounting.formatMoney(value, {
	    symbol: isUndefined(options.symbol) ? currency.symbol : options.symbol,
	    decimal: isUndefined(options.decimal) ? currency.decimalSeparator : options.decimal,
	    thousand: isUndefined(options.thousand) ? currency.thousandsSeparator : options.thousand,
	    precision: typeof options.precision === 'number' ? options.precision : currency.decimalDigits,
	    format: ['string', 'object'].indexOf(typeof options.format) > -1 ? options.format : format
	  });
	}

	function findCurrency(currencyCode) {
	  return currencies_1[currencyCode];
	}

	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	function unformat(value, options) {
	  var code = options.code || options.locale && localeCurrency.getCurrency(options.locale);
	  var localeFormat = localeFormats_1[options.locale] || defaultLocaleFormat;
	  var currency = objectAssign({}, defaultCurrency, findCurrency(code), localeFormat);
	  var decimal = isUndefined(options.decimal) ? currency.decimalSeparator : options.decimal;
	  return accounting.unformat(value, decimal);
	}

	var currencyFormatter = {
	  defaultCurrency: defaultCurrency,

	  get currencies() {
	    // In favor of backwards compatibility, the currencies map is converted to an array here
	    return Object.keys(currencies_1).map(function (key) {
	      return currencies_1[key];
	    });
	  },

	  findCurrency: findCurrency,
	  format: format,
	  unformat: unformat
	};
	var currencyFormatter_1 = currencyFormatter.defaultCurrency;
	var currencyFormatter_2 = currencyFormatter.currencies;
	var currencyFormatter_3 = currencyFormatter.findCurrency;
	var currencyFormatter_4 = currencyFormatter.format;
	var currencyFormatter_5 = currencyFormatter.unformat;

	exports.default = currencyFormatter;
	exports.defaultCurrency = currencyFormatter_1;
	exports.currencies = currencyFormatter_2;
	exports.findCurrency = currencyFormatter_3;
	exports.format = currencyFormatter_4;
	exports.unformat = currencyFormatter_5;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=currencyFormatter.js.map
