import { parse } from 'node-html-parser';

import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs';
import * as sass from 'sass';
import prettier from 'prettier';

import type { Config } from 'prettier';

interface Options {
  /** Attribute inline-html looks for to inline tag. Defaults to `inline` */
  attribute?: string;
  /** Directory where paths in html will resolved relative to. Defaults to `process.cwd()` */
  dir?: string;
  /** Uses _Prettier_ to format. Set to `false` for no formatting. Prettier options: https://prettier.io/docs/en/options.html */
  format?: false | Config;
  /** Paths on the filesystem that Sass will look in when resolving imports */
  loadPaths?: string[] | [];
}

/**
 * Takes a path to an HTML file and returns a string
 * with all `script` & `link` tags with attribute `inline`
 * (or user-defined attribute) replaced with compiled
 * versions of the tags' contents. Tags with `inline`
 * (or user-defined attribute) must link
 * to an external file.
 *
 * Supports `sass` & `ts`
 *
 * @example
 *
 * ```js
 * import inlineHTML from 'inline-html'
 *
 * const html = await inlineHTML('path/to/file')
 * console.log(html)
 * ```
 *
 * @param p Path to HTML file
 * @param options Options object, set custom attribute, sass `loadPaths` & format settings
 * @returns
 */
export const inlineHTML = async (p: string, options?: Options) => {
  const config: Options = {
    attribute: 'inline',
    loadPaths: [],
    format: {
      printWidth: 200,
      tabWidth: 2,
      semi: true,
    },
    ...options,
  };

  let html: string, dir: string;

  if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
    html = fs.readFileSync(p, 'utf-8');
    dir = path.parse(p).dir;
  } else {
    html = p;
    dir = options?.dir || process.cwd();
  }

  const document = parse(html, {
    comment: true,
  });

  const nodes = Array.from(document.querySelectorAll(`[${config.attribute}]`));

  for (const node of nodes) {
    if (node.tagName === 'LINK') {
      const filePath = path.resolve(dir, node.getAttribute('href') || '');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }

      const output = sass.compile(filePath, {
        charset: false,
        loadPaths: config.loadPaths,
      }).css;

      node.replaceWith(`<style>\n${output}\n</style>`);
    }

    if (node.tagName === 'SCRIPT') {
      const filePath = path.resolve(dir, node.getAttribute('src') || '');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }

      const result = await esbuild.build({
        entryPoints: [filePath],
        format: 'iife',
        bundle: true,
        write: false,
      });

      const output = result.outputFiles[0].text;

      node.replaceWith(`<script>\n${output}</script>`);
    }
  }

  if (!config.format) {
    return document.toString();
  }

  const formatted = prettier.format(document.toString(), {
    parser: 'html',
    ...config.format,
  });

  return formatted;
};
