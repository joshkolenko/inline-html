import fs from 'fs';
import path from 'path';

import { inlineHTML } from '../src/index.js';

(async () => {
  try {
    const htmlPath = path.resolve('example/src/index.html');
    const htmlStr = fs.readFileSync(
      path.resolve('example/src/index.html'),
      'utf8'
    );

    const pathInlined = await inlineHTML(htmlPath);
    const strInlined = await inlineHTML(htmlStr, { dir: 'example/src' });

    console.log({ pathInlined, strInlined });
  } catch (error) {
    console.log(error);
  }
})();
