#!/usr/bin/env node
/**
 * CLI
 *
 * @since 0.0.1
 */
import { main } from '.';
import * as chalk from 'chalk';
// tslint:disable-next-line: no-console
main().catch(function (e) { return console.log(chalk.bold.red("Unexpected error: " + e)); });
