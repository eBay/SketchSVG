/** ***********************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

const fs = require('fs-extra');
const SVGO = require('svgo');
const cheerio = require('cheerio');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const SVGOInstance = new SVGO({
    plugins: require('../config.json')
});

/**
 * This file could use some splitting up, but basically what happens is we read the SVG file here,
 * use SVGO to compress the SVG and then spit it out in the console.log as well as send it to
 * lib/index.js to deal with and generate the final HTML page and output.json.
 * @param {Object} filepath temp/whatever.svg filepath
 * @returns {Promise} A promise that is sends the final generated JSON object
 */
module.exports = (filepath) => new Promise((resolve, reject) => {
    const getName = filepath.split('--')[1].split('.svg')[0];
    const finalName = `${getName}_${Math.random()}`;

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        SVGOInstance.optimize(data, { path: filepath }).then((result) => {
            const $ = cheerio.load(result.data);
            const $svg = $('svg');
            const $use = $('use');
            const $path = $('path');
            const svgAttrs = $svg[0] ? $svg[0].attribs : {};
            const useAttrs = $use[0] ? $use[0].attribs : {};
            let newPath;
            let viewBoxAttr;
            const width = 21;
            const height = 21;
            const attrArray = [];
            $use.removeAttr('href');

            for (const prop in useAttrs) {
                if (Object.prototype.hasOwnProperty.call(useAttrs, prop)) {
                    $path.attr(prop, useAttrs[prop]);
                }
            }

            for (const prop in svgAttrs) {
                if (prop === 'viewBox') {
                    viewBoxAttr = svgAttrs[prop];
                }
            }

            $path.each((itm, el) => {
                const $this = $(el);
                newPath = $.html($this);
                const attrs = $this.attr();
                if (attrs) {
                    delete attrs.d;
                }
                for (const prop in attrs) {
                    attrArray.push(`${prop}='${attrs[prop]}'`);
                }
                if ($this.attr() && (!$this.attr().fill || $this.attr().fill === 'none')) {
                    $this.attr('fill', '#828282');
                }
            });
            const finalSymbol = `<symbol id="${finalName}" viewBox="${viewBoxAttr}">${newPath}</symbol>`;
            const dAttr = $(newPath).attr('d');
            const preEncodedSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBoxAttr}" ${attrArray.join(' ')}><path d="${dAttr}"/></svg>`;
            const encodeBuffer = Buffer.from(preEncodedSVG);
            const encodedSVG = `url('data:image/svg+xml;base64, ${encodeBuffer.toString('base64')}')`;

            /* eslint-disable max-len */
            console.log(`\n\n${emoji.emojify(':tada: :tada: :tada:')} Conversion complete for this SVG! ${emoji.emojify(':tada: :tada: :tada:')} \n`);
            console.log('SVG Symbol:');
            console.log(`${colors.green(finalSymbol)}\n\n`);
            console.log('Base64 Encode:');
            console.log(`${colors.magenta(encodedSVG)}\n`);

            const finalObj = { svg: finalSymbol, base64: encodedSVG, name: finalName };
            resolve(finalObj);
        });
    });
});

