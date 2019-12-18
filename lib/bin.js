#!/usr/bin/env node
"use strict";
/**
 * CLI
 *
 * @since 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var chalk = require("chalk");
// tslint:disable-next-line: no-console
_1.main().catch(function (e) { return console.log(chalk.bold.red("Unexpected error: " + e)); });
