"use strict";

const config                        = require("config").get("dc-db-interface"),
      r                             = require("rethinkdbdash")().db(config.db),
      presetTransforms              = require("./lib/preset-transforms"),
      transformBlueBookConfigFromDb = require("./lib/transform-blue-book-config-from-db");

function createDbInterface() {
    function getPreset(id) {
        return r.table("presets").get(id).run()
            .then(presetTransforms.transformPresetFromDb)
            .catch(() => { throw new Error("Invalid preset ID: " + id); });
    }

    function getPresets() {
        return r.table("presets").pluck("id", "name").run()
            .catch(() => { throw new Error("Unable to retrieve presets"); });
    }

    function getBlueBookConfig() {
        return r.table("blueBooks").run()
            .then(transformBlueBookConfigFromDb)
            .catch(() => { throw new Error("Unable to retrieve bluebook configuration."); });
    }

    return { getPreset, getPresets, getBlueBookConfig };
}

module.exports = createDbInterface();