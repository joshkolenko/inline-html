import { Config } from 'prettier';

/** ---
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
 * const html = inlineHTML('path/to/file')
 * console.log(html)
 * ```
 *  */

export declare const inlineHTML: (
  /** Path to HTML file */
  path: string,
  /** Options object, set custom attribute & format settings */
  options?: Options
) => Promise<string>;

export declare interface Options {
  /** Attribute inline-html looks for to inline tag. Defaults to `inline` */
  attribute?: string;
  /** Uses _Prettier_ to format. Set to `false` for no formatting. Prettier options: https://prettier.io/docs/en/options.html */
  format?: false | Config;
}
