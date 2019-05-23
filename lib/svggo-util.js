/*************************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

const fs = require('fs-extra');
const path = require('path');
const SVGO = require('svgo');
const cheerio = require('cheerio');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const svgo = new SVGO({
    plugins: require('../config.json')
});

module.exports = (filename) => new Promise((resolve) => {
    const filepath = path.resolve(__dirname, filename);
    let count = 0;
    let thisSVG;
    fs.readFile(filepath, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }
        svgo.optimize(data, {path: filepath}).then(function(result) {
            const $ = cheerio.load(result.data);
            const $svg = $('svg');
            const $use = $('use');
            const $path = $('path');
            const svgAttrs = $svg[0].attribs;
            const useAttrs = $use[0].attribs;
            let newPath;
            let viewBoxAttr;
            let width = 24;
            let height = 24;

            $use.removeAttr('href');
            for(prop in useAttrs) {
                $path.attr(prop, useAttrs[prop]);
            }

            for(prop in svgAttrs) {
                if (prop === 'viewBox'){
                    viewBoxAttr = svgAttrs[prop];
                }
            }

            $path.each(function(index, elem) {
                var $this = $(this);
                newPath = $.html($this);
            });

            let finalSymbol = `<symbol viewBox="${viewBoxAttr}">${newPath}</symbol>`;
            const dAttr = $(newPath).attr('d');

            const preEncodedSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBoxAttr}"><path d="${dAttr}"/></svg>`;
            const encodedSVG = new Buffer.from(preEncodedSVG).toString('base64');


            console.log(`\n\n ${emoji.emojify(':tada: :tada: :tada:')} Conversion complete for this SVG!\n`)
            console.log('SVG Symbol:');
            console.log(colors.green(finalSymbol) + '\n\n');
            console.log('Base64 Encode:');
            console.log(colors.magenta(encodedSVG) + '\n');
            resolve(finalSymbol);
        });
    });
});

