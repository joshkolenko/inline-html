import { expect, describe, test } from 'vitest';

import fs from 'fs';
import path from 'path';

import { inlineHTML, type Options } from '../src';

const baseOptions: Options = { loadPaths: ['test/fixtures/scss/load/path/'] };
const fileOptions: Options = { ...baseOptions };
const stringOptions: Options = { ...baseOptions, dir: 'test/fixtures/' };

const filePath = path.resolve('test/fixtures/index.html');
const fileContents = fs.readFileSync(filePath, 'utf-8');

describe('inline', () => {
  test('file', async () => {
    const filePath = path.resolve('test/fixtures/html/index.html');
    const html = await inlineHTML(filePath, fileOptions);
    expect(html).toMatchSnapshot();
  });

  test('string', async () => {
    const html = await inlineHTML(fileContents, stringOptions);
    expect(html).toMatchSnapshot();
  });
});

describe('compile & inline', () => {
  test('css', async () => {
    const html = `<link rel="stylesheet" href="css/main.css" inline />`;
    const result = await inlineHTML(html, stringOptions);
    expect(result).toMatchSnapshot();
  });

  test('scss', async () => {
    const html = `<link rel="stylesheet" href="scss/main.scss" inline />`;
    const result = await inlineHTML(html, stringOptions);
    expect(result).toMatchSnapshot();
  });

  test('js', async () => {
    const html = `<script src="js/index.js" inline></script>`;
    const result = await inlineHTML(html, stringOptions);
    expect(result).toMatchSnapshot();
  });

  test('ts', async () => {
    const html = `<script src="ts/index.ts" inline></script>`;
    const result = await inlineHTML(html, stringOptions);
    expect(result).toMatchSnapshot();
  });
});

describe('options', () => {
  test('attribute', async () => {
    const html = `<link rel="stylesheet" href="css/main.css" custom-attribute />`;
    const result = await inlineHTML(html, { ...stringOptions, attribute: 'custom-attribute' });
    expect(result).toMatchSnapshot();
  });

  test('disable css transform', async () => {
    const result = await inlineHTML(filePath, { ...fileOptions, transformCss: false });
    expect(result).toMatchSnapshot();
  });

  test('minify css', async () => {
    const result = await inlineHTML(filePath, { ...fileOptions, minifyCss: true });
    expect(result).toMatchSnapshot();
  });

  test('minify js', async () => {
    const result = await inlineHTML(filePath, { ...fileOptions, minifyJs: true });
    expect(result).toMatchSnapshot();
  });
});
