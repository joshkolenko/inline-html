/**
 * Takes a path to an HTML file and returns a string
 * with all `script` & `link` tags with attribute `inline`
 * (or user-defined attribute) replaced with compiled
 * versions of the tags' contents. Tags with `inline`
 * (or user-defined attribute) must link
 * to an external file.
 *
 * Supports `sass` & `ts`
 *  */

export declare const inlineHTML: (
  /** Path to HTML file */
  htmlPath: string,
  /** Attribute used to find style & script tags to inline. Defaults to `inline` */
  attribute?: 'inline' | string
) => Promise<string>;
