module.exports = {
    entry: './app.tsx',
    output: {
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.tsx', '.ts', '.js']
    },
    externals: {
        react: true,
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'babel-loader?presets[]=react!ts-loader' }
        ]
    }
}

// for test harness purposes only, you would not need this in a normal project
module.exports.resolveLoader = { alias: { 'ts-loader': require('path').join(__dirname, "../../dist/index.js") } }
