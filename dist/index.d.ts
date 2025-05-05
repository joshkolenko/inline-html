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
    minifyJs?: boolean | {
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
export declare const inlineHTML: (source: string, options?: Options) => Promise<string>;
