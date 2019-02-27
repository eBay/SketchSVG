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
module.exports = class SVGSketch {
    constructor() {
        this.svgUtil = util;
    }

    async init(filename) {
        await new ParseSketch().init(filename).then(async(value) => {
            const allLayers = this.getLayers(value);
            await this.runCmdLine(allLayers, value);
            console.log(`Number of files converted: ${count}`);
            await this.parseSVGFiles();
            await this.finalizeHtmlAndCleanup();
        });
    }

    async parseSVGFiles() {
        const filePath = `${__dirname}/tmpsvgs`;
        return new Promise((resolve, reject) => {
            fs.readdir(filePath, async(err, items) => {
                if (err) throw err;
                await this.getSVGs(filePath, items);
                resolve();
            });
        });
    }

    getLayers(value) {
        const allLayers = shell.exec(`${sketchTool} list layers ${value}`, { silent: true });
        return JSON.parse(allLayers).pages[0].layers[0]; // TODO: add ebay/retriever code here
    }

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

    async generateHtmlPage(resolvedObj) {
        await fs.writeFile(`${__dirname}/output.json`, JSON.stringify(resolvedObj));
        await fs.readFile(`${__dirname}/index.html`).then((data) => {
            $ = cheerio.load(data.toString());
            $('#svg_demo').empty();
            $('#svg_area').empty();
            $('#base64_area').empty();
            resolvedObj.forEach(this.prepareSVGandBase64);
            fs.writeFile(`${__dirname}/index.html`, $.html());
        });
    }

    runCmdLine(allSlices, fileName) {
        return new Promise((resolve, reject) => {
            allSlices.layers.forEach((layerObj, idx) => {
                const id = layerObj.id;
                const name = encodeURIComponent(layerObj.name);
                /* eslint-disable max-len */
                shell.exec(`${sketchTool} export layers ${fileName} --item=${id} --filename=${Math.random()}--${name}.svg --output=${__dirname}/tmpsvgs --formats=svg`);
                count++;
                resolve();
            });
        });
    }

    finalizeHtmlAndCleanup() {
        return new Promise(async(resolve, reject) => {
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

    getSVGs(filePath, items) {
        return new Promise(async(resolve, reject) => {
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
