"use strict";
/* jshint mocha: true */

let assert = require("chai").assert;

// I'm going to say for now that making sure we can
// require the module is sufficient for testing
describe("dc-test", function() {
  it("can be required", function() {
    assert.ok(require(".."));
  });
});