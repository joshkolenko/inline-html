import fs from 'fs';
import path from 'path';

import { inlineHTML } from '../src';

try {
  const htmlPath = path.resolve('example/src/index.html');
  const htmlStr = fs.readFileSync(htmlPath, 'utf8');

  const loadPaths = ['example/sass/load/path'];

  const html = {
    path: await inlineHTML(htmlPath, { loadPaths }),
    str: await inlineHTML(htmlStr, { dir: 'example/src', loadPaths }),
  };

  console.log(html.path);

  const distPath = path.resolve('example/dist');

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  } else {
    fs.rmSync(distPath, { recursive: true });
    fs.mkdirSync(distPath);
  }

  fs.writeFileSync(path.join(distPath, 'path.html'), html.path);
  // fs.writeFileSync(path.join(distPath, 'str.html'), html.str);
} catch (error) {
  console.log(error);
}
