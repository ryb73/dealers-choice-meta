"use strict";

const path = require("path");

module.exports = (srcFile, buildDir) => {
    let filename = path.basename(srcFile, ".js");

    return {
        entry:  {
            [filename]: srcFile,
        },

        output: {
            path: buildDir,
            filename: "[name].js",
        },

        module: {
            loaders: [{
                test: /\.js$/,
                loader: "babel-loader"
            },{
                test: /\.json$/,
                loader: "json",
            }],
        },

        resolve: {
            extensions: ["", ".js", ".json"],
        },

        resolveLoader: {
          root: path.join(__dirname, "../node_modules"),
        },
    };
};
