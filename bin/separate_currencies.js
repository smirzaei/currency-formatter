const fs = require('fs')
const path = require('path')
const currencies = require('../currencies')

currencies.forEach(c => {
  fs.writeFileSync(path.resolve(__dirname, "../currencies/" + c.code +".json"), JSON.stringify(c, null, 2))
})
