const fs = require('fs')
const path = require('path')

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
