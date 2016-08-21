"use strict";

let config           = require("config").get("dc-db-interface"),
    r                = require("rethinkdbdash")().db(config.db),
    presetTransforms = require("./lib/preset-transforms");

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

    return { getPreset, getPresets };
}

module.exports = createDbInterface();