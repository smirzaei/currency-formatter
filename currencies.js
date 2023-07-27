var formatter = require('./index')

/**
 * This module exists purely for backwards compatibility reasons. Historically, the currencies
 * would be stored in an array available through the default export from this exact file.
 * We've opted to store currencies in a JSON object now (currencies.json).
 */
module.exports = formatter.currencies