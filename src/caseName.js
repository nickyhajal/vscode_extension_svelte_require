const _ = require('lodash')

module.exports = function(originalName) {
  const caseName = _.startCase(originalName).split(' ').join('')

  if (/^[a-z]/.test(originalName)) {
    return _.lowerFirst(caseName)
  }

  return caseName
}
