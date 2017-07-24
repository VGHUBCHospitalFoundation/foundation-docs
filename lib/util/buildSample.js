var beautify = require('js-beautify').html;
var Cheerio = require('cheerio');
var Inky = require('inky').Inky;
var format = require('string-template');
var hljs = require('highlight.js');
var multiline = require('multiline');
var fs = require('fs');
var path = require('path');
var strip = require('strip-indent');
var mkdirp = require('mkdirp').sync;

var fileCounter = 0;
var examplesPath = path.join(process.cwd(), './docs/examples');
var templatesPath = path.join(process.cwd(), './dist/');

var INKY_TEMPLATE = multiline(function() {/*
<div class="docs-code-wrapper">
  <span class="docs-code-language">HTML</span>
  <div class="docs-code docs-code-html" data-docs-code>
    <pre>
      <code class="{0}">{1}</code>
    </pre>
  </div>
</div>
<p class="docs-code-language">DEMO</p>
<iframe class="docs-code-iframe docs-code-bordered" src="examples/{2}" data-docs-code-current></iframe>

*/}).replace(/(^(\s)*|\n)/gm, '');

/**
 * Renders an Inky code sample, showing Inky code alongside compiled HTML, as well as an iframe with the live HTML sample.
 * @param {string} code - Inky code to process.
 * @returns {string} HTML for the Inky and HTML examples. The function also writes an HTML file to disk containing the live HTML example, with the Foundation for Emails CSS referenced.
 */
module.exports = function(code) {
  // Load Inky code sample into Inky parser
  var $ = Cheerio.load(code);
  var output = new Inky().releaseTheKraken($);

  // Separate Inky code and HTML code
  var inkyCode = hljs.highlight('html', code).value;
  var htmlCode = hljs.highlight('html', beautify(output, { indent_size: 2 })).value;

  // Create iframe code

  var BORDERED_IFRAME_TEMPLATE = fs.readFileSync('./dist/wrapper_for_building_previews.html', "utf-8");

  var borderedIframeCode = format(BORDERED_IFRAME_TEMPLATE, [output]);
  var borderedIframeFile = 'example-' + (fileCounter++) + '.html';

  var REGULAR_IFRAME_TEMPLATE = fs.readFileSync('./dist/wrapper_for_building_previews.html', "utf-8");

  var regularIframeCode = format(REGULAR_IFRAME_TEMPLATE, [output]);
  var regularIframeFile = 'example-' + (fileCounter++) + '.html';

  // Create folder for code samples if it doesn't exist
  if (!fs.existsSync(examplesPath)) {
    mkdirp(examplesPath);
  }

  // Write an iframe with the full HTML needed to the build folder
  fs.writeFileSync(path.join(examplesPath, borderedIframeFile), borderedIframeCode);
  fs.writeFileSync(path.join(examplesPath, regularIframeFile), regularIframeCode);

  // Return a final code sample with Inky source, HTML source, and iframe reference
  return format(INKY_TEMPLATE, [
    'html',
    strip(htmlCode),
    borderedIframeFile,
    regularIframeFile,
  ]);
}
