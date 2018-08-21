const _ = require('lodash')

module.exports = function(originalName, preserveAcronymCase) {
  if (preserveAcronymCase) {
    const caseName = _.startCase(originalName)
      .split(' ')
      .join('')

    if (/^[a-z]/.test(originalName)) {
      return _.lowerFirst(caseName)
    }

    return caseName
  }

  return originalName.slice(0, 1) + _.camelCase(originalName).slice(1)
}
