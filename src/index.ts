import { parse } from 'node-html-parser';
import path from 'path';
import esbuild from 'esbuild';
import fs from 'fs';
import sass from 'sass';

export const inlineHTML = async (
  htmlPath: string,
  attribute: string = 'inline'
) => {
  const dir = path.parse(htmlPath).dir;
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const document = parse(html);

  const nodes = Array.from(document.querySelectorAll(`[${attribute}]`));

  for (const node of nodes) {
    if (node.tagName === 'LINK') {
      const output = sass.compile(
        path.resolve(dir, node.getAttribute('href') || '')
      ).css;

      node.replaceWith(`<style>\n${output}\n</style>`);
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

      node.replaceWith(`<script>\n${output}</script>`);
    }
  }

  return document.toString();
};
