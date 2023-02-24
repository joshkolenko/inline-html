import { inlineHTML } from '../dist/esm/index.js';

(async () => {
  try {
    const html = await inlineHTML('src/index.html');

    // console.log(html);
  } catch (error) {
    console.log(error.message);
  }
})();
