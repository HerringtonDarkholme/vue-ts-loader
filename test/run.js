var assert = require("assert")
var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var webpack = require('webpack');
var webpackVersion = require('webpack/package.json').version;
var regexEscape = require('escape-string-regexp');
var typescript = require('typescript');
var glob = require('glob');
var argv = require('yargs').argv;
var semver = require('semver');
var loader = require('../dist/index')

// force colors on for tests since expected output has colors
require('colors').enabled = true;

var saveOutputMode = argv['save-output'];
var testDirs = argv['test'] ? [ argv['test'] ] : fs.readdirSync(__dirname);

console.log('Using webpack version ' + webpackVersion);
console.log('Using typescript version ' + typescript.version);

var typescriptVersion = semver.major(typescript.version) + '.' + semver.minor(typescript.version);

// set up new empty staging area
var rootPath = path.resolve(__dirname, '..');
var stagingPath = path.resolve(rootPath, '.test');
rimraf.sync(stagingPath);

var testLibs = ['testLib', '@types']

// loop through each test directory
testDirs.forEach(function(test) {
    var testPath = path.join(__dirname, test);
    if (fs.statSync(testPath).isDirectory()) {

        if (testLibs.indexOf(test) >= 0) return;

        describe(test, function() {
            it('should have the correct output', createTest(test, testPath, {}));

            if (test == 'declarationOutput') { return; }
            if (test == 'declarationWatch') { return; }
            if (test == 'issue71') { return; }
            it('should work with transpile', createTest(test, testPath, {transpile: true}));
        });
    }
});


function loadConfig(testStagingPath, webpackOutput) {
    var config = require(path.join(testStagingPath, 'webpack.config'));
    config.output.path = webpackOutput;
    config.resolveLoader = { alias: { 'ts-loader': require('path').join(__dirname, "../dist/index.js") } }
    config.context = testStagingPath;
    config.resolveLoader = config.resolveLoader || {};
    config.resolveLoader.alias = config.resolveLoader.alias || {};
    config.resolveLoader.alias.newLine = path.join(__dirname, 'newline.loader.js');
    config.module.loaders.push({ test: /\.js$/, loader: 'newLine' });
    config.ts = config.ts || {};
    config.ts.silent = true;
    config.ts.compilerOptions = {
        newLine: 'LF'
    }
    return config
}

var vueLoaderId = /id=data-v-[^!]+/g
var savedOutputs = {}
function createTest(test, testPath, options) {

    // set up paths
    var testStagingPath = path.join(stagingPath, test+(options.transpile ? '.transpile' : '')),
        actualOutput = path.join(testStagingPath, 'actualOutput'),
        expectedOutput = path.join(testStagingPath, 'expectedOutput-'+typescriptVersion),
        webpackOutput = path.join(testStagingPath, '.output'),
        baselineOutput = path.join(testPath, 'expectedOutput-'+typescriptVersion);

    function normalizeTestPath(str) {
        return str
          .replace(new RegExp(regexEscape(testStagingPath+path.sep), 'g'), '')
          .replace(new RegExp(regexEscape(rootPath+path.sep), 'g'), '')
          .replace(new RegExp(regexEscape(rootPath), 'g'), '')
          .replace(vueLoaderId, '')
          .replace(/\.transpile/g, '');
    }

    return function(done) {
        this.timeout(60000); // sometimes it just takes awhile

        if (saveOutputMode) {
            var savedOutput = savedOutputs[test] = savedOutputs[test] || {};
            var regularSavedOutput = savedOutput.regular = savedOutput.regular || {};
            var transpiledSavedOutput = savedOutput.transpiled = savedOutput.transpiled || {};
            var currentSavedOutput = options.transpile ? transpiledSavedOutput : regularSavedOutput;
            mkdirp.sync(baselineOutput);
        }

        // copy all input to a staging area
        mkdirp.sync(testStagingPath);
        fs.copySync(testPath, testStagingPath);


        // ensure output directories
        mkdirp.sync(actualOutput);
        mkdirp.sync(webpackOutput);

        function removeHash(hash) {
            glob.sync('**/*', {cwd: webpackOutput, nodir: true}).forEach(function(file) {
                var content = fs.readFileSync(path.join(webpackOutput, file), 'utf-8');
                content = content.split(hash).join('[hash]');
                fs.writeFileSync(path.join(webpackOutput, file), content);
            });
        }

        function saveOutputToBaseline(patch) {
            // loop through webpackOutput and rename to .transpiled if needed
            glob.sync('**/*', {cwd: webpackOutput, nodir: true}).forEach(function(file) {
                var patchedFileName = patch+'/'+file;
                currentSavedOutput[patchedFileName] = fs.readFileSync(path.join(webpackOutput, file), 'utf-8');

                if (options.transpile) {
                    if (regularSavedOutput[patchedFileName] !== transpiledSavedOutput[patchedFileName]) {
                        var extension = path.extname(file);
                        fs.renameSync(
                            path.join(webpackOutput, file),
                            path.join(webpackOutput, path.basename(file, extension)+'.transpiled'+extension)
                        );
                    }
                }
            });

            fs.copySync(webpackOutput, baselineOutput, { clobber: true });
        }

        function makePatchDir() {
            var patch = 'patch'+(iteration-1);
            actualOutput = path.join(testStagingPath, 'actualOutput', patch);
            expectedOutput = path.join(testStagingPath, 'expectedOutput-'+typescriptVersion, patch);
            baselineOutput = path.join(testPath, 'expectedOutput-'+typescriptVersion, patch)
            mkdirp.sync(actualOutput);
            mkdirp.sync(expectedOutput);
            if (saveOutputMode) mkdirp.sync(baselineOutput);
            return patch
        }

        function writeErrorFile(err, patch) {
            var errFileName = 'err.txt';
            var errString = normalizeTestPath(err.toString())

            fs.writeFileSync(path.join(actualOutput, errFileName), errString);
            if (saveOutputMode) {
                var patchedErrFileName = patch+'/'+errFileName;
                currentSavedOutput[patchedErrFileName] = errString;

                if (options.transpile) {
                    if (regularSavedOutput[patchedErrFileName] !== transpiledSavedOutput[patchedErrFileName]) {
                        fs.writeFileSync(path.join(baselineOutput, 'err.transpiled.txt'), errString);
                    }
                }
                else {
                    fs.writeFileSync(path.join(baselineOutput, errFileName), errString);
                }
            }
        }

        function writeOutputFileList(stats, patch) {
            lastHash = stats.hash;

            var statsFileName = 'output.txt';
            var newAssets = {};
            Object.keys(stats.compilation.assets).forEach(function(asset) {
                newAssets[asset] = stats.compilation.assets[asset];
            });
            stats.compilation.assets = newAssets;

            var statsString = stats.toString({timings: false, version: false, hash: false})
            statsString = normalizeTestPath(statsString)

            fs.writeFileSync(path.join(actualOutput, statsFileName), statsString);

            if (!saveOutputMode) {
              return;
            }
            var patchedStatsFileName = patch+'/'+statsFileName;
            currentSavedOutput[patchedStatsFileName] = statsString;

            if (options.transpile) {
                if (regularSavedOutput[patchedStatsFileName] !== transpiledSavedOutput[patchedStatsFileName]) {
                    fs.writeFileSync(path.join(baselineOutput, 'output.transpiled.txt'), statsString);
                }
            }
            else {
                fs.writeFileSync(path.join(baselineOutput, statsFileName), statsString);
            }
        }


        // execute webpack

        var config = loadConfig(testStagingPath, webpackOutput)
        if (options.transpile) config.ts.transpileOnly = true;


        function watch(err, stats) {
            var patch = '';
            if (iteration > 0) {
              patch = makePatchDir()
            }

            // replace the hash if found in the output since it can change depending
            // on environments and we're not super interested in it
            if (stats) {
              removeHash(stats.hash)
            }

            // output results
            if (saveOutputMode) {
              saveOutputToBaseline(patch)
            }
            fs.copySync(webpackOutput, actualOutput);
            rimraf.sync(webpackOutput);

            if (err) {
              writeErrorFile(err, patch)
            }

            if (stats && stats.hash != lastHash) {
              writeOutputFileList(stats, patch)
            }

            // massage any .transpiled. files
            glob.sync('**/*', {cwd: expectedOutput, nodir: true}).forEach(function(file) {
                if (/\.transpiled/.test(file)) {
                    if (options.transpile) { // rename if we're in transpile mode
                        var extension = path.extname(file);
                        fs.renameSync(
                            path.join(expectedOutput, file),
                            path.join(expectedOutput, path.dirname(file), path.basename(file, '.transpiled'+extension)+extension)
                        );
                    }
                    else { // otherwise delete
                        fs.unlinkSync(path.join(expectedOutput, file));
                    }

                }
            });

            // compare actual to expected
            var actualFiles = glob.sync('**/*', {cwd: actualOutput, nodir: true}),
                expectedFiles = glob.sync('**/*', {cwd: expectedOutput, nodir: true})
                    .filter(function(file) { return !/^patch/.test(file); }),
                allFiles = {};

            actualFiles.map(function(file) { allFiles[file] = true });
            expectedFiles.map(function(file) { allFiles[file] = true });

            Object.keys(allFiles).forEach(function(file) {
                try {
                    var actual = fs.readFileSync(path.join(actualOutput, file)).toString().replace(/\r\n/g, '\n');
                }
                catch (e) { actual = '!!!actual file doesnt exist!!!' }

                try {
                    var expected = fs.readFileSync(path.join(expectedOutput, file)).toString().replace(/\r\n/g, '\n');
                }
                catch (e) { expected = '!!!expected file doesnt exist!!!' }

                assert.equal(actual.toString(), expected.toString(), (patch?patch+'/':patch) + file + ' is different between actual and expected');
            });

            // check for new files to copy in
            var patchPath = path.join(testStagingPath, 'patch'+iteration);
            if (fs.existsSync(patchPath)) {
                iteration++;

                // can get inconsistent results if copying right away
                setTimeout(function() {
                    fs.copySync(patchPath, testStagingPath, {clobber: true});
                }, 1000);
            }
            else {
                watcher.close(function() {
                    // clean instances
                    loader._cleanup()
                    done();
                });
            }
        }

        var iteration = 0;
        var lastHash;
        var watcher = webpack(config).watch({aggregateTimeout: 1500}, watch);
    };
}
