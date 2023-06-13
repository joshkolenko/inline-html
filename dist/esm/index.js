import { parse } from "node-html-parser";
import path from "path";
import esbuild from "esbuild";
import fs from "fs";
import sass from "sass";
import prettier from "prettier";
const inlineHTML = async (source, options) => {
  const config = {
    attribute: "inline",
    format: {
      printWidth: 200,
      tabWidth: 2,
      semi: true
    },
    ...options
  };
  let html, dir;
  if (fs.existsSync(source) && fs.lstatSync(source).isFile()) {
    html = fs.readFileSync(source, "utf-8");
    dir = path.parse(source).dir;
  } else {
    html = source;
    dir = options?.dir || process.cwd();
  }
  const document = parse(html, {
    comment: true
  });
  const nodes = Array.from(document.querySelectorAll(`[${config.attribute}]`));
  for (const node of nodes) {
    if (node.tagName === "LINK") {
      const filePath = path.resolve(dir, node.getAttribute("href") || "");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }
      const output = sass.compile(filePath, {
        charset: false
      }).css;
      node.replaceWith(`<style>
${output}
</style>`);
    }
    if (node.tagName === "SCRIPT") {
      const filePath = path.resolve(dir, node.getAttribute("src") || "");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }
      const result = await esbuild.build({
        entryPoints: [filePath],
        format: "iife",
        bundle: true,
        write: false
      });
      const output = result.outputFiles[0].text;
      node.replaceWith(`<script>
${output}<\/script>`);
    }
  }
  if (!config.format) {
    return document.toString();
  }
  const formatted = prettier.format(document.toString(), {
    parser: "html",
    ...config.format
  });
  return formatted;
};
export {
  inlineHTML
};
