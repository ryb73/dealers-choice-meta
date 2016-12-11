"use strict";

const lernaJson = require("../lerna.json"),
      semver    = require("semver");

console.log(semver.inc(lernaJson.version, "patch"));