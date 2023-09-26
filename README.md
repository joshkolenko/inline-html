# inline-html

**As of `V0.4.1` this module is now `ESM` only. Use previous versions for `CJS` support.**

This module takes a path to an HTML file and returns a promise that resolves with a string of HTML. Output HTML has all `link` and `script` tags with the `inline` attribute replaced with the content of the linked file compiled and inlined in a `style` or `script` tag. Output HTML is formatted using [Prettier](https://github.com/prettier/prettier).

---

## How it works

Install the package in your project

```
npm i @joshkolenko/inline-html
```

Say you have a project named `example` that consists of 3 files: `index.html`, `example.scss` & `example.js` and a file `index.js` outside of the project where you're going to be calling the `inlineHTML` module.

The folder structure looks like this:

```
├── index.js
└── src
    ├── index.html
    ├── index.ts
    ├── main.scss
    └── module.ts
```

For this example, this is the code in `index.html`. (See other example code in `example/`)

```html
<body>
  <h2>Hello, world!</h2>
</body>

<link rel="stylesheet" href="main.scss" inline />

<script src="index.ts" inline></script>
```

Notice the `inline` attribute on the `link` and `script` tags. This tells `inlineHTML` that you want these tags replaced with the compiled contents of the referenced files.

In `index.js` you can call `inlineHTML` like this:

```js
import { inlineHTML } from '@joshkolenko/inline-html';

(async () => {
  const html = await inlineHTML('example/index.html');

  // ...
})();
```

This is the resulting `html`

```html
<body>
  <h2>Hello, world!</h2>
</body>

<style>
  body {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  body h2 {
    font-size: 2rem;
  }
</style>

<script>
  'use strict';
  (() => {
    // example/src/module.ts
    var str = 'Hello, world!';

    // example/src/index.ts
    console.log(str);
  })();
</script>
```

You can also provide an `options` object as the second argument.

| Property   | Description                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| attribute? | Attribute inlineHTML will look for to inline tags. Defaults to `inline`                   |
| dir?       | Directory where paths in html string be will resolved from. Defaults to `process.cwd()`   |
| format?    | Prettier config object. Default values are `printWidth: 200`, `tabWidth: 2`, `semi: true` |
| loadPaths? | Paths on the filesystem that Sass will look in when resolving imports                     |

For more Prettier options, see the [documentation](https://prettier.io/docs/en/options.html).

For example:

```js
import { inlineHTML } from '@joshkolenko/inline-html';

(async () => {
  const html = await inlineHTML('example/index.html', {
    attribute: 'bundle',
    format: {
      printWidth: 60,
      tabWidth: 3,
      semi: false,
    },
  });

  // ...
})();
```

As of `V0.3.0`, you can now pass an html string as the first parameter to `inlineHTML`. The paths in the `html` string will be resolved relative to the current working directory, or you can pass a `dir` option to the `Options` object to resolve the paths relative to the specified path.

```js
(async () => {
  const htmlPath = path.resolve('example/src/index.html');
  const htmlStr = await fs.readFile(htmlPath, 'utf8');

  const html = await inlineHTML(htmlStr, {
    dir: 'example',
  });

  // ...
})();
```
