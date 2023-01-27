import { JSDOM } from 'jsdom';
import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import sass from 'sass';
import prettier from 'prettier';
export const inlineHTML = async (
/** Path to HTML file */
htmlPath, 
/** Attribute used to find style & script tags to inline. Defaults to `inline` */
attribute = 'inline') => {
    const dir = path.parse(htmlPath).dir;
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const nodes = Array.from(document.querySelectorAll(`[${attribute}]`));
    for (const node of nodes) {
        if (node.tagName === 'LINK') {
            const output = sass.compile(path.resolve(dir, node.getAttribute('href') || '')).css;
            const el = document.createElement('style');
            el.innerHTML = output;
            node.replaceWith(el);
        }
        if (node.tagName === 'SCRIPT') {
            const result = await esbuild.build({
                entryPoints: [path.resolve(dir, node.getAttribute('src') || '')],
                format: 'iife',
                bundle: true,
                write: false,
                logLevel: 'error',
            });
            const output = result.outputFiles[0].text;
            const el = document.createElement('script');
            el.innerHTML = output;
            node.replaceWith(el);
        }
    }
    const bundled = document.body.innerHTML;
    const formatted = prettier.format(bundled, {
        parser: 'html',
        printWidth: 500,
    });
    return formatted;
};
