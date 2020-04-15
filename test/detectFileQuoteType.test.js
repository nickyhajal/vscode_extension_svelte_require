const detectFileQuoteType = require("../src/detectFileQuoteType");

describe("detectFileQuoteType", () => {
  it("file with double quotes", () => {
    const codeBlocks = ['import test from "test"'];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal('"');
  });

  it("file with single quotes", () => {
    const codeBlocks = ["import test from 'test'"];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal("'");
  });

  it("cannot find require statement", () => {
    const quoteType = detectFileQuoteType(["const a = 1"]);
    expect(quoteType).to.equal(false);
  });
});
