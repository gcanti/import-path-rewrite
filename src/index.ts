/**
 * @since 0.0.1
 */
import * as chalk from 'chalk'
import * as A from 'fp-ts/lib/Array'
import { log } from 'fp-ts/lib/Console'
import { Endomorphism } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs'
import * as glob from 'glob'

const ES6_GLOB_PATTERN = 'es6/**/*.@(d.ts|js)'
const DIST_ES6_GLOB_PATTERN = 'dist/es6/**/*.@(d.ts|js)'

const packages = [
  'fp-ts',
  'monocle-ts',
  'io-ts',
  'io-ts-types',
  'elm-ts',
  'fp-ts-contrib',
  'fp-ts-rxjs',
  'fp-ts-routing',
  'newtype-ts',
  'fp-ts-fluture',
  'parser-ts',
  'retry-ts',
  'hyper-ts',
  'fp—ts-local-storage'
]

const regexp = new RegExp(`(\\s(?:from|module)\\s['|"](?:${packages.join('|')}))\\/lib\\/([\\w-\\/]+['|"])`, 'gm')

/**
 * @since 0.0.1
 */
export const replace: Endomorphism<string> = s => s.replace(regexp, '$1/es6/$2')

const readFile = TE.taskify<fs.PathLike, string, NodeJS.ErrnoException, string>(fs.readFile)

const writeFile = TE.taskify<fs.PathLike, string, NodeJS.ErrnoException, void>(fs.writeFile)

function modifyFile(f: Endomorphism<string>): (path: string) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return path =>
    pipe(
      readFile(path, 'utf8'),
      TE.map(f),
      TE.chain(content => writeFile(path, content)),
      TE.chain(() => TE.rightIO(log(`${path} rewritten`)))
    )
}

function modifyFiles(f: Endomorphism<string>): (paths: Array<string>) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return paths =>
    pipe(
      A.array.traverse(TE.taskEither)(paths, modifyFile(f)),
      TE.map(() => undefined)
    )
}

function modifyGlob(f: Endomorphism<string>): (pattern: string) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return pattern => pipe(glob.sync(pattern), TE.right, TE.chain(modifyFiles(f)))
}

const modify = modifyGlob(replace)

const replaceFiles = pipe(
  modify(ES6_GLOB_PATTERN),
  TE.chain(() => modify(DIST_ES6_GLOB_PATTERN))
)

const exit = (code: 0 | 1): IO.IO<void> => () => process.exit(code)

function onLeft(e: NodeJS.ErrnoException): T.Task<void> {
  return T.fromIO(
    pipe(
      log(e),
      IO.chain(() => exit(1))
    )
  )
}

function onRight(): T.Task<void> {
  return T.fromIO(log(chalk.bold.green('import rewrite succeeded!')))
}

/**
 * @since 0.0.1
 */
export const main = pipe(replaceFiles, TE.fold(onLeft, onRight))
