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
import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs';
import * as sass from 'sass';
import prettier from 'prettier';
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
export const inlineHTML = (p, options) => __awaiter(void 0, void 0, void 0, function* () {
    const config = Object.assign({ attribute: 'inline', loadPaths: [], format: {
            printWidth: 200,
            tabWidth: 2,
            semi: true,
        } }, options);
    let html, dir;
    if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
        html = fs.readFileSync(p, 'utf-8');
        dir = path.parse(p).dir;
    }
    else {
        html = p;
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
            const result = yield esbuild.build({
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
    const formatted = prettier.format(document.toString(), Object.assign({ parser: 'html' }, config.format));
    return formatted;
});
