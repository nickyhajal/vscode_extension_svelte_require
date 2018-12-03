const caseName = require('../src/caseName')
const isRequire = require('../src/isRequire')
const expect = require('chai').expect

describe('caseName', () => {
  it('properly cases a name', () => {
    const casedInput = caseName('test-case')
    expect(casedInput).to.equal('testCase')
  })

  it('preserves capitalization', () => {
    const casedInput = caseName('Test-case')
    expect(casedInput).to.equal('TestCase')
  })

  it('preserves acronym case', () => {
    const casedInput = caseName('globalIDResolver', true)
    expect(casedInput).to.equal('globalIDResolver')
  })

  it('keeps special starting characters', () => {
    const casedInput = caseName('_ctx')
    expect(casedInput).to.equal('_ctx')
    const casedInput2 = caseName('@blueprintjs/core')
    expect(casedInput2).to.equal('@blueprintjsCore')
  })
})

describe('isRequire', () => {
  it('finds require', () => {
    const findsRequireStatement = isRequire("const _ = require('lodash')")
    expect(findsRequireStatement).to.be.ok
  })

  it('finds import', () => {
    const findsImportStatement = isRequire("import _ from 'lodash'")
    expect(findsImportStatement).to.be.ok
  })

  it('should not find import', () => {
    const findsImport = isRequire("const b = 'something'")
    expect(findsImport).to.not.be.ok
  })
})
