module.exports = {
    entry: './index.vue',
    output: {
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.ts', '.vue']
    },
    module: {
        loaders: [
            { test: /\.vue$/, loader: 'vue' }
        ]
    },
    vue: {
      loaders: {
        js: 'ts-loader'
      }
    }
}
