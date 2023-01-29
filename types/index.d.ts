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
  /** Attribute used to find style & script tags to inline. Defaults to `inline` */
  attribute?: 'inline' | string
) => Promise<string>;
