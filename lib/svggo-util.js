const fs = require('fs-extra');
const SVGO = require('svgo');
const cheerio = require('cheerio');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const SVGOInstance = new SVGO({
    plugins: require('../config.json')
});

module.exports = (filepath) => new Promise((resolve, reject) => {
    const getName = filepath.split('--')[1].split('.svg')[0];
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
            const width = 24;
            const height = 24;

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

            $path.each(function(index, elem) {
                const $this = $(this);
                newPath = $.html($this);
            });
            const finalName = `${getName}_${Math.random()}`;
            const finalSymbol = `<symbol id="${finalName}" viewBox="${viewBoxAttr}">${newPath}</symbol>`;
            const dAttr = $(newPath).attr('d');

            const preEncodedSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBoxAttr}"><path d="${dAttr}"/></svg>`;
            const encodeBuffer = Buffer.from(preEncodedSVG);
            const encodedSVG = `url('data:image/svg+xml;base64, ${encodeBuffer.toString('base64')}')`;

            console.log(`\n\n ${emoji.emojify(':tada: :tada: :tada:')} Conversion complete for this SVG!\n`);
            console.log('SVG Symbol:');
            console.log(`${colors.green(finalSymbol) }\n\n`);
            console.log('Base64 Encode:');
            console.log(`${colors.magenta(encodedSVG) }\n`);

            const finalObj = { svg: finalSymbol, base64: encodedSVG, name: finalName };
            resolve(finalObj);
        });
    });
});

