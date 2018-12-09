const caseName = require("../src/caseName");

describe("caseName", () => {
  it("properly cases a name", () => {
    const casedInput = caseName("test-case");
    expect(casedInput).to.equal("testCase");
  });

  it("preserves capitalization", () => {
    const casedInput = caseName("Test-case");
    expect(casedInput).to.equal("TestCase");
  });

  it("preserves acronym case", () => {
    const casedInput = caseName("globalIDResolver", true);
    expect(casedInput).to.equal("globalIDResolver");
  });

  it("keeps special starting characters", () => {
    const casedInput = caseName("_ctx");
    expect(casedInput).to.equal("_ctx");
    const casedInput2 = caseName("@blueprintjs/core");
    expect(casedInput2).to.equal("@blueprintjsCore");
  });
});
