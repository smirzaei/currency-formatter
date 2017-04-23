const fs = require('fs')
const path = require('path')

// Currencies
const currenciesDir = path.resolve(__dirname + '/../currencies')
const currenciesIndexFilePath = path.resolve(currenciesDir + '/index.json')

if (fs.existsSync(currenciesIndexFilePath)) {
  fs.unlinkSync(currenciesIndexFilePath)
}

const currencyFiles = fs.readdirSync(currenciesDir)
const currencies = currencyFiles.reduce((p, c) => {
  const fileContent = fs.readFileSync(path.resolve(currenciesDir + "/" + c))
  const currencyInfo = JSON.parse(fileContent)
  p[currencyInfo.code] = currencyInfo

  return p
}, {})

fs.writeFileSync(currenciesIndexFilePath, JSON.stringify(currencies, null, 2))

// Locales
const localesDir = path.resolve(__dirname + '/../locales')
const localesIndexFilePath = path.resolve(localesDir + '/index.json')

if (fs.existsSync(localesIndexFilePath)) {
  fs.unlinkSync(localesIndexFilePath)
}

const localeFiles = fs.readdirSync(localesDir)
const locales = localeFiles.reduce((p, c) => {
  const fileContent = fs.readFileSync(path.resolve(localesDir + "/" + c))
  const localeInfo = JSON.parse(fileContent)
  p[c.replace('.json', '')] = localeInfo

  return p
}, {})

fs.writeFileSync(localesIndexFilePath, JSON.stringify(locales, null, 2))
