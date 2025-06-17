import { parse } from 'node-html-parser';

import browserslist from 'browserslist';
import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs';

import { transform as lightningcss, browserslistToTargets } from 'lightningcss';
import { compile as sass } from 'sass';

export interface Options {
  /** Attribute inline-html looks for to inline tag. Defaults to `inline` */
  attribute?: string;
  /** Transform CSS files with LightningCSS */
  transformCss?: boolean;
  /** Browser support target. Defaults to  */
  cssTarget?: string | string[];
  /** Directory where paths in html string be will resolved from. Defaults to `process.cwd()` */
  dir?: string;
  /** Paths on the filesystem that Sass will look in when resolving imports */
  loadPaths?: string[] | [];
  minifyCss?: boolean;
  minifyJs?:
    | boolean
    | {
        identifiers?: boolean;
        syntax?: boolean;
        whitespace?: boolean;
      };
}

/**
 * Takes either a path to an HTML file or an html string and
 * returns a string with all `script` & `link` tags with
 * attribute `inline` (or user-defined attribute) replaced with
 * compiled versions of the tags' contents. Tags with `inline`
 * (or user-defined attribute) must link to an external file.
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
 * @param source Path to HTML file or HTML string
 * @param options Options object, set custom attribute, sass `loadPaths` & format settings
 * @returns
 */
export const inlineHTML = async (source: string, options?: Options) => {
  const config: Options = {
    attribute: 'inline',
    transformCss: true,
    ...options,
  };

  let html: string, dir: string;

  if (fs.existsSync(source) && fs.lstatSync(source).isFile()) {
    html = fs.readFileSync(source, 'utf-8');
    dir = path.parse(source).dir;
  } else {
    html = source;
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

      let source = fs.readFileSync(filePath, 'utf-8');
      let output: string;

      if (path.extname(filePath) === '.sass' || path.extname(filePath) === '.scss') {
        source = sass(filePath, {
          charset: false,
          loadPaths: config.loadPaths || [],
        }).css;
      }

      if (config.transformCss) {
        const { code } = lightningcss({
          filename: filePath,
          code: Buffer.from(source),
          minify: config.minifyCss,
          targets: browserslistToTargets(browserslist(config.cssTarget || 'last 2 versions')),
        });

        output = code.toString();
      } else {
        output = source;
      }

      node.replaceWith(`<style>\n${output.trim()}\n</style>`);
    }

    if (node.tagName === 'SCRIPT') {
      const filePath = path.resolve(dir, node.getAttribute('src') || '');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }

      const buildOptions: esbuild.BuildOptions = {
        entryPoints: [filePath],
        format: 'iife',
        bundle: true,
        write: false,
        logLevel: 'silent',
      };

      if (config.minifyJs === true) {
        buildOptions.minify = true;
      } else if (typeof config.minifyJs === 'object') {
        const { identifiers, syntax, whitespace } = config.minifyJs;

        buildOptions.minifyIdentifiers = identifiers;
        buildOptions.minifySyntax = syntax;
        buildOptions.minifyWhitespace = whitespace;
      }

      const result = await esbuild.build(buildOptions);
      const output = result.outputFiles[0].text;

      node.replaceWith(`<script>\n${output}</script>`);
    }
  }

  return document.toString();
};
