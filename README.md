# inline-html

This module takes a path to an HTML file and returns a promise that resolves with a string of HTML with all `link` and `script` tags with an `inline` attribute replaced with respective inline `style` and `script` elements.

---

## Planned features

- Option to minify or format output `html`

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
└── example
    ├── index.html
    ├── styles
    │   └── example.scss
    └── js
        └── example.js
```

For this example, this is the code in `index.html`

```html
<div>
  <h2>Example html</h2>
</div>

<link rel="stylesheet" href="styles/example.scss" inline />
<!-- example.scss contents
  div {
    h2 {
      color: blue;

      a {
        color: red;
      }
    }
  }
-->

<script src="js/example.js" inline></script>
<!-- example.js contents
  console.log('hello world') 
-->
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
<div>
  <h2>Example html</h2>
</div>

<style>
  div h2 {
    color: blue;
  }
  div h2 a {
    color: red;
  }
</style>

<script>
  console.log('hello world');
</script>
```

You can also provide a second argument to the `inlineHTML` function to change the attribute that the script looks for. Defaults to `inline`.

For example:

```js
import { inlineHTML } from '@joshkolenko/inline-html';

(async () => {
  const html = await inlineHTML('example/index.html', 'bundle');

  // ...
})();
```
