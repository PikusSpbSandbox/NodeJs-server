const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        server: './app.js',
    },
    output: {
        filename: 'web-server.js',
        path: 'C:\\testwww',
        clean: true
    },
    target: 'node',
    externalsPresets: { node: true },
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },
    plugins: [  new CopyPlugin({
        patterns: [
            {
                from: "php-proxy/*.php",
                to: "[name][ext]",
            },
            {
                from: "php-proxy/node-out.log",
                to: "[name][ext]",
            },
            {
                from: "php-proxy/.node-pid",
                to: "[name][ext]",
            }
        ],
        options: {
            concurrency: 100,
        },
    })]
}