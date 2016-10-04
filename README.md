
# TypeScript loader for Vue-loader [![Build Status](https://travis-ci.org/HerringtonDarkholme/vue-ts-loader.svg?branch=master)](https://travis-ci.org/HerringtonDarkholme/vue-ts-loader)

Type-check your script in your Vue-loader. Easier importing _.ts_ file in vue's SFC.

![screenshot](https://raw.githubusercontent.com/HerringtonDarkholme/vue-ts-example/master/screen.png)

## Getting Started

Tutorials and examples can be [found here](http://herringtondarkholme.github.io/2016/10/03/vue2-ts2/).

### Installation

```
npm install vue-ts-loader
```

You will also need to install TypeScript if you have not already.

```
npm install typescript
```

You also need install vue-loader and friends. Please refer to vue-loader's [documentation](http://vue-loader.vuejs.org/en/index.html).

### Running

Use webpack like normal, including `webpack --watch` and `webpack-dev-server`, or through another
build system using the [Node.js API](http://webpack.github.io/docs/node.js-api.html).

### Compatibility

The current version is compatible with TypeScript 2.0.

### Configuration

1. Create or update `webpack.config.js` like so:

    ```javascript
    module.exports = {
      entry: './app.vue',
      output: {
        filename: 'bundle.js'
      },
      resolve: {
        // Add `.ts` and `.vue` as a resolvable extension.
        extensions: ['', '.ts', '.vue']
      },
      module: {
        loaders: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.vue$/, loader: 'vue-loader' },
          { test: /\.tsx?$/, loader: 'vue-ts-loader' }
        ]
      },
      vue: {
        loaders: {
          ts: 'vue-ts-loader'
        },
        // important for cooperating with vue-loader
        esModule: true
      },
    }
    ```

2. Add a `tsconfig.json` file. <a name="tsconfig"></a>

    ```javascript
    {
      "compilerOptions": {
        "target": "es5",
        "sourceMap": true
      },
      "exclude": [
        "node_modules"
      ]
    }
    ```

The [tsconfig.json](https://github.com/Microsoft/TypeScript/wiki/tsconfig.json) file controls
TypeScript-related options so that your IDE, the `tsc` command, and this loader all share the
same options. TypeScript files from all subdirectories will get included except the ones matching `exclude`.

### Failing the build on TypeScript compilation error

When the build fails (i.e. at least one typescript compile error occured), vue-ts-loader does **not** propagate the build failure to webpack.  The upshot of this is you can fail to notice an erroring build. This is inconvenient; particularly in continuous integration scenarios.  If you want to ensure that the build failure is propogated it is advised that you make use of the [webpack-fail-plugin](https://www.npmjs.com/package/webpack-fail-plugin).  This plugin that will make the process return status code 1 when it finishes with errors in single-run mode. Et voilà! Build failure.

For more background have a read of [this issue](https://github.com/TypeStrong/ts-loader/issues/108).

#### Options

There are two types of options: TypeScript options (aka "compiler options") and loader options.
TypeScript options should be set using a tsconfig.json file. Loader options can be set either
using a query when specifying the loader or through the `ts` property in the webpack configuration.

```javascript
module.exports = {
  ...
  module: {
    loaders: [
      // specify option using query
      { test: /\.tsx?$/, loader: 'vue-ts-loader?compiler=ntypescript' }
    ]
  },
  // specify option using `ts` property
  ts: {
    compiler: 'ntypescript'
  }
}
```

##### transpileOnly *(boolean) (default=false)*

If you want to speed up compilation significantly you can set this flag.
However, many of the benefits you get from static type checking between
different dependencies in your application will be lost. You should also
set the `isolatedModules` TypeScript option if you plan to ever make use
of this.

##### silent *(boolean) (default=false)*

If true, no console.log messages will be emitted. Note that most error
messages are emitted via webpack which is not affected by this flag.

##### ignoreDiagnostics *(number[]) (default=[])*

You can squelch certain TypeScript errors by specifying an array of diagnostic
codes to ignore.

##### compiler *(string) (default='typescript')*

Allows use of TypeScript compilers other than the official one. Should be
set to the NPM name of the compiler, eg [`ntypescript`](https://github.com/basarat/ntypescript).

##### configFileName *(string) (default='tsconfig.json')*

Allows you to specify a custom configuration file.

##### compilerOptions *(object) (default={})*

Allows overriding TypeScript options. Should be specified in the same format
as you would do for the `compilerOptions` property in tsconfig.json.

##### instance *(string)*

Advanced option to force files to go through different instances of the
TypeScript compiler. Can be used to force segregation between different parts
of your code.

### Loading other resources and code splitting

Loading css and other resources is possible but you will need to make sure that
you have defined the `require` function in a declaration file.

```typescript
declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};
```

Then you can simply require assets or chunks per the [webpack documentation](http://webpack.github.io/docs).

```js
require('!style!css!./style.css');
```

The same basic process is required for code splitting. In this case, you `import` modules you need but you
don't directly use them. Instead you require them at [split points](http://webpack.github.io/docs/code-splitting.html#defining-a-split-point).
See [this example](test/codeSplitting) for more details.

## Contributing

Please see the [contributer's guide](CONTRIBUTING.md).

## License

MIT License
