module.exports = function(target, source = {}) {
  return target in source ? source[target] : null
}
