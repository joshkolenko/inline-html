var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parse } from 'node-html-parser';
import browserslist from 'browserslist';
import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs';
import { transform as lightningcss, browserslistToTargets } from 'lightningcss';
import { compile as sass } from 'sass';
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
export const inlineHTML = (source, options) => __awaiter(void 0, void 0, void 0, function* () {
    const config = Object.assign({ attribute: 'inline', transformCss: true }, options);
    let html, dir;
    if (fs.existsSync(source) && fs.lstatSync(source).isFile()) {
        html = fs.readFileSync(source, 'utf-8');
        dir = path.parse(source).dir;
    }
    else {
        html = source;
        dir = (options === null || options === void 0 ? void 0 : options.dir) || process.cwd();
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
            let output;
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
            }
            else {
                output = source;
            }
            node.replaceWith(`<style>\n${output.trim()}\n</style>`);
        }
        if (node.tagName === 'SCRIPT') {
            const filePath = path.resolve(dir, node.getAttribute('src') || '');
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found at: ${filePath}`);
            }
            const buildOptions = {
                entryPoints: [filePath],
                format: 'iife',
                bundle: true,
                write: false,
            };
            if (config.minifyJs === true) {
                buildOptions.minify = true;
            }
            else if (typeof config.minifyJs === 'object') {
                const { identifiers, syntax, whitespace } = config.minifyJs;
                buildOptions.minifyIdentifiers = identifiers;
                buildOptions.minifySyntax = syntax;
                buildOptions.minifyWhitespace = whitespace;
            }
            const result = yield esbuild.build(buildOptions);
            const output = result.outputFiles[0].text;
            node.replaceWith(`<script>\n${output}</script>`);
        }
    }
    return document.toString();
});
