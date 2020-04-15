const isRequire = require("../src/isRequire");

describe("isRequire", () => {
  it("finds require", () => {
    const findsRequireStatement = isRequire("const _ = require('lodash')");
    expect(findsRequireStatement).to.be.ok;
  });

  it("finds import", () => {
    const findsImportStatement = isRequire("import _ from 'lodash'");
    expect(findsImportStatement).to.be.ok;
  });

  it("should not find import", () => {
    const findsImport = isRequire("const b = 'something'");
    expect(findsImport).to.not.be.ok;
  });
});
