#!/usr/bin/env node

/*************************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

const shell = require('shelljs');
const ParseSketch = require('./parse-sketch');
const util = require('./svggo-util');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const fs = require('fs-extra');
const cheerio = require('cheerio');
let $;
// This command is provided by Sketch to find where your Sketch App/sketchtool is
const whereIsSketch = shell.exec(`mdfind kMDItemCFBundleIdentifier == 'com.bohemiancoding.sketch3' | head -n 1`,
    { silent: true });
let count = 0;
const sketchTool = `${whereIsSketch.trim()}/Contents/Resources/sketchtool/bin/sketchtool`;
module.exports = class SketchSVG {
    constructor() {
        this.svgUtil = util;
    }

    /**
     * Initializes the class with the desired file
     * @param {String} filename the path to the file, coming from command line arg
     */
    async init(filename) {
        await new ParseSketch().init(filename).then(async (value) => {
            const allLayers = this.getLayers(value);
            await this.runCmdLine(allLayers, value);
            console.log(`Number of files converted: ${count}`);
            await this.parseSVGFiles();
            await this.finalizeHtmlAndCleanup();
        });
    }
    /**
     * After the tmpsvgs are created, it reads those and gets the SVG code via this.getSVGs
     * @returns {Promise} A promise that is resolved after we get SVG code.
     */
    async parseSVGFiles() {
        const filePath = `${__dirname}/tmpsvgs`;
        return new Promise((resolve, reject) => {
            fs.readdir(filePath, async (err, items) => {
                if (err) throw err;
                await this.getSVGs(filePath, items);
                resolve();
            });
        });
    }

    /**
     * Gets all layers from the Sketch object that is imported
     * @param {String} value the path to the file
     * @returns {Object} The object that contains the first layer
     */
    getLayers(value) {
        const allLayers = shell.exec(`${sketchTool} list layers ${value}`, { silent: true });
        return JSON.parse(allLayers).pages[0].layers[0]; // TODO: add ebay/retriever code here
    }

    /**
     * Generates the proper SVG for the HTML output for the editor
     * @param {String} value the svg it is currently processing
     * @param {Number} idx the svg index it is currently processing
     */
    prepareSVGandBase64(val, idx) {
        const finalName = `testsvg_${idx}`;
        const setSVGTemplate = (name, thisIdx) => `<svg data-name='${name}' class='svg_icn svg_icon_${thisIdx}'
            focusable="false" height="24" width="24"><use xlink:href="#${name}"></use></svg>`;
        const setTemplate = setSVGTemplate(finalName, idx);
        const $val = $(val.svg);
        $val.attr('id', finalName);
        $($(val.svg), 'use').attr('href', `#${finalName}`);
        $(setTemplate).appendTo('#svg_demo');
        $val.appendTo('#svg_area');
        const bs64Div = `<div id="${finalName}_base64" class="hidden">${val.base64}</div>`;
        $(bs64Div).appendTo('#base64_area');
    }

    stripName(name) {
        const newName = name.split('_');
        newName.pop();
        return newName.join('_')
    }

    getRawSvgs(obj) {
        obj.sort((a, b) => a.name.localeCompare(b.name));
        return obj.map((f) => {
            const stripped = this.stripName(f.name);
            return f.svg.replace(new RegExp(`${stripped}_[\\d\\.]+`), stripped);
        }).join('\n');
    }

    getLessVariables(obj) {
        obj.sort((a, b) => a.name.localeCompare(b.name));
        return obj.map((f) => `@${this.stripName(f.name)}-base64: "${f.base64}";`).join('\n');
    }

    /**
     * Updates index.html with the proper data and writes the file as well as the output.json file
     * @param {Object} resolvedObj the raw JSON that we are outputting after the SVGs are converted
     */
    async generateHtmlPage(resolvedObj) {
        await fs.writeFile(`${__dirname}/output.json`, JSON.stringify(resolvedObj));
        await fs.writeFile(`${__dirname}/svg.html`, this.getRawSvgs(resolvedObj));
        await fs.writeFile(`${__dirname}/variables.less`, this.getLessVariables(resolvedObj));
        await fs.readFile(`${__dirname}/index.html`).then((data) => {
            $ = cheerio.load(data.toString());
            $('#svg_demo').empty();
            $('#svg_area').empty();
            $('#base64_area').empty();
            resolvedObj.forEach(this.prepareSVGandBase64);
            fs.writeFile(`${__dirname}/index.html`, $.html());
        });
    }

    /**
     * Executes the sketchtool command line that exports the layers of the desired layer to svg format
     * @param {Array} allLayers the layers we want to export to SVG
     * @param {String} fileName the .sketch filename
     * @returns {Promise} A promise that is resolved after we get SVG code.
     */
    runCmdLine(allLayers, fileName) {
        return Promise.all(allLayers.layers.map((layerObj, idx) => {
            return new Promise((resolve, reject) => {
                const id = layerObj.id;
                const name = encodeURIComponent(layerObj.name);
                /* eslint-disable max-len */
                shell.exec(`${sketchTool} export layers ${fileName} --item=${id} --filename=${Math.random()}--${name}.svg --output=${__dirname}/tmpsvgs --formats=svg`);
                count++;
                resolve();
            });
        }));
    }

    /**
     * Simple output and cleanup of everything after we convert & compress SVG code
     * @returns {Promise} A promise that is resolved after everything is done.
     */
    finalizeHtmlAndCleanup() {
        return new Promise(async (resolve, reject) => {
            await fs.remove(`${__dirname}/tmpsvgs`);
            await fs.remove(`${__dirname}/temp.sketch`);
            /* eslint-disable max-len */
            console.log(`${colors.cyan(`One sec! ${emoji.emojify(':recycle: ')} files...`)}\n\n
            ${emoji.emojify(':bird:')}  ${colors.yellow('Need to make customizations? Use our fancy editor for that!'
                , `${__dirname}/index.html`)}
            ${emoji.emojify(':penguin:')}  ${colors.magenta('Want the full JSON output of <symbols/> and base64 encodings? Go to:'
                    , `${__dirname}/output.json`)}\n\n
            We're all done here, Have a great day!\n
            `);
            resolve();
        });
    }
    /**
     * Gets the SVG files that were generated and runs the svgGO util to compress, then puts them in an
     * array to be generated via generateHtmlPage function
     * @param {String} filePath the filepath of the temporary SVG that was created by sketchtool CLI
     * @param {String} items the SVG
     * @returns {Promise} A promise that is resolved after we generate HTML page and output.json
     */
    getSVGs(filePath, items) {
        return new Promise(async (resolve, reject) => {
            const arrayOfSVGs = [];
            for (let i = 0; i < items.length; i++) {
                const file = `${filePath}/${items[i]}`;
                if (file.split('.').pop() === 'svg') {
                    await this.svgUtil(`${filePath}/${items[i]}`).then(val => {
                        arrayOfSVGs.push(val);
                    });
                }
            }
            await this.generateHtmlPage(arrayOfSVGs);
            resolve();
        });
    }
};
