"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @since 0.0.1
 */
var chalk = require("chalk");
var A = require("fp-ts/lib/Array");
var Console_1 = require("fp-ts/lib/Console");
var IO = require("fp-ts/lib/IO");
var pipeable_1 = require("fp-ts/lib/pipeable");
var T = require("fp-ts/lib/Task");
var TE = require("fp-ts/lib/TaskEither");
var fs = require("fs");
var glob = require("glob");
var ES6_GLOB_PATTERN = 'es6/**/*.@(ts|js)';
var packages = ['fp-ts', 'fp-ts-contrib', 'monocle-ts', 'io-ts', 'io-ts-types', 'elm-ts'];
var regexp = new RegExp("(\\s(?:from|module)\\s['|\"](?:" + packages.join('|') + "))\\/lib\\/([\\w-\\/]+['|\"])", 'gm');
/**
 * @since 0.0.1
 */
exports.replace = function (s) { return s.replace(regexp, '$1/es6/$2'); };
var readFile = TE.taskify(fs.readFile);
var writeFile = TE.taskify(fs.writeFile);
function modifyFile(f) {
    return function (path) {
        return pipeable_1.pipe(readFile(path, 'utf8'), TE.map(f), TE.chain(function (content) { return writeFile(path, content); }));
    };
}
function modifyFiles(f) {
    return function (paths) {
        return pipeable_1.pipe(A.array.traverse(TE.taskEither)(paths, modifyFile(f)), TE.map(function () { return undefined; }));
    };
}
function modifyGlob(f) {
    return function (pattern) { return pipeable_1.pipe(glob.sync(pattern), TE.right, TE.chain(modifyFiles(f))); };
}
var replaceFiles = modifyGlob(exports.replace)(ES6_GLOB_PATTERN);
var exit = function (code) { return function () { return process.exit(code); }; };
function onLeft(e) {
    return T.fromIO(pipeable_1.pipe(Console_1.log(e), IO.chain(function () { return exit(1); })));
}
function onRight() {
    return T.fromIO(Console_1.log(chalk.bold.green('import rewrite succeeded!')));
}
/**
 * @since 0.0.1
 */
exports.main = pipeable_1.pipe(replaceFiles, TE.fold(onLeft, onRight));
