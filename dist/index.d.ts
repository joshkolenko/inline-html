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
export declare const inlineHTML: (p: string, options?: Options) => Promise<string>;
export {};
