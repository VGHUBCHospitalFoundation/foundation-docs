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

var INKY_TEMPLATE = multiline(function() {/*
<div class="docs-code-wrapper">
  <span class="docs-code-language" data-docs-code-current>HTML</span>
  <button class="docs-code-toggle" type="button" data-docs-code-toggle>Switch to Inky</button>
  <div class="docs-code docs-code-inky" data-docs-code>
    <pre>
      <code class="{0}">{1}</code>
    </pre>
  </div>
  <div class="docs-code docs-code-html" data-docs-code>
    <pre>
      <code class="{0}">{2}</code>
    </pre>
  </div>
</div>
<p class="docs-code-language">DEMO</p>
<iframe class="docs-code-iframe" src="examples/{3}"></iframe>
*/}).replace(/(^(\s)*|\n)/gm, '');

var IFRAME_TEMPLATE = multiline(function() {/*
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Title of the email</title>
      </head>
    <body>
    <table border="0" cellspacing="0" cellpadding="1" width="552" align="center" bgcolor="#c9c9c9">
      <tbody>
        <tr>
          <td>
            <table border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#ffffff">
              <tbody>
                <tr>
                  <td valign="top">
                    <table border="0" cellspacing="0" cellpadding="15" width="100%">
                      <tbody>
                        <tr>
                          <td>
                          <!--TEASER TEXT START-->
                            <table border="0" cellspacing="0" cellpadding="0" width="520">
                              <tbody>
                                <tr>
                                  <td width="450" valign="middle">
                                    <!-- <p style="font-family: Arial,Helvetica,sans-serif; font-size: 11px; margin: 0px; padding: 0px; color: #636366;">Short teaser text to preview any items or discuss an overarching theme</p> -->
                                  </td>
                                  <td width="20" valign="top">&nbsp;</td>
                                  <td width="100" valign="middle">
                                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;padding:0;color:#636366" align="right"><a style="color:#636366" href="http://support.vghfoundation.ca/site/MessageViewer" target="_blank">View online</a></p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tbody>
                        <tr>
                          <td height="1" valign="top">
                            <img style="display:block" src="http://support.vghfoundation.ca/custom/df_2016/images/vgh-enews-grey-divide-line.jpg" border="0" alt="" width="100%" height="1">
                          </td>
                        </tr>
                        <tr>
                          <td height="1" valign="top">
                            <img style="display:block" src="http://support.vghfoundation.ca/custom/df_2016/images/vgh-enews-grey-divide-line.jpg" border="0" alt="" width="100%" height="1">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <!-- message start --><convio:session name="63" param="1"></convio:session>
                    {0}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <table cellspacing="0" cellpadding="1" width="552" align="center" bgcolor="#c9c9c9">
      <tbody>
        <tr>
          <td valign="top">
            <table style="text-align:center;margin:auto" border="0" cellspacing="0" cellpadding="0" width="100%" align="center">
              <tbody>
                <tr>
                  <td valign="top" bgcolor="#f6f6f6">
                    <table border="0" cellspacing="0" cellpadding="30" width="100%" bgcolor="f6f6f6">
                      <tbody>
                        <tr>
                          <td>
                            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;margin:0;padding:0;color:#636366;line-height:22px" align="center">VGH &amp; UBC Hospital Foundation<br>190-855 West 12 Ave<br>Vancouver, BC V5Z 1M9, Canada<br>604 875 4676 | 1 877 875 4676<br>Charity Number 132173063RR0001<br><br><span style="color:#83c447"><strong><a style="color:#83c447;text-decoration:none" href="http://vghfoundation.ca/privacy-policy/" target="_blank">Privacy Policy</a></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="color:#83c447;text-decoration:none" href="http://vghfoundation.ca/about/contact/" target="_blank"><strong>Contact Us</strong></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="color:#83c447;text-decoration:none" href="http://support.vghfoundation.ca/site/CO"><strong>Unsubscribe</strong></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="color:#83c447;text-decoration:none" href="http://support.vghfoundation.ca/site/ConsInterestsUser"><strong>Manage My Preferences</strong></a></span>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td height="1" valign="top">
                    <img style="display:block" src="http://support.vghfoundation.ca/custom/df_2016/images/vgh-enews-grey-divide-line.jpg" border="0" alt="" width="100%" height="1">
                  </td>
                </tr>
                    <tr>
                      <td valign="top"><table border="0" cellspacing="0" cellpadding="20" width="100%">
                        <tbody>
                          <tr>
                            <td>
                              <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;padding:0;color:#636366" align="center">&copy; Copyright 2016. All rights reserved.</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table><!--FOOTER END-->
    </body>
  </html>
*/});

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
  var iframeCode = format(IFRAME_TEMPLATE, [output]);
  var iframeFile = 'example-' + (fileCounter++) + '.html';

  // Create folder for code samples if it doesn't exist
  if (!fs.existsSync(examplesPath)) {
    mkdirp(examplesPath);
  }

  // Write an iframe with the full HTML needed to the build folder
  fs.writeFileSync(path.join(examplesPath, iframeFile), iframeCode);

  // Return a final code sample with Inky source, HTML source, and iframe reference
  return format(INKY_TEMPLATE, [
    'html',
    strip(inkyCode),
    strip(htmlCode),
    iframeFile
  ]);
}
