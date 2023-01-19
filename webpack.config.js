const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require('webpack-node-externals')
module.exports = {
    entry: {
        server: './web-server.js',
    },
    output: {
        filename: 'web-server.js',
        path: 'C:\\testwww',
        clean: true
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    plugins: [new CopyPlugin({
        patterns: [
            {
                from: "*.php",
                to: "[path][name].[ext]",
            }
        ],
        options: {
            concurrency: 100,
        },
    })]
}