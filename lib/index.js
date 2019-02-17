#!/usr/bin/env node

const shell = require('shelljs');
const parseSketch = require('./parse-sketch');
const util = require('./svggo-util');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const terminalLink = require('terminal-link');
// This command is provided by Sketch to find where your Sketch App/sketchtool is
let whereIsSketch = shell.exec(`mdfind kMDItemCFBundleIdentifier == 'com.bohemiancoding.sketch3' | head -n 1`);
const sketchTool = `${whereIsSketch.trim()}/Contents/Resources/sketchtool/bin/sketchtool`;
let filename;
if (!process.argv[2]) {
    console.log('please include a valid <filePath> such as sketchsvg /Users/bob/test.sketch');
    return;
} else {
    filename = process.argv[2];
}

parseSketch(filename).then((value)=> {

    let allSlices = shell.exec(`${sketchTool} list slices ${value}`, {silent:true});
    allSlices = JSON.parse(allSlices).pages[0];

    runCmdLine(allSlices, value).then(() => {
        // here we will grab the svg files from /tmp, open each one and rewrite the SVG XML
        const filePath = __dirname + '/tmpsvgs';
        fs.readdir(filePath, (err, items) => {
                if (err) throw err;
                new Promise(async (resolve, reject) => {
                    let arrayOfSVGs = [];
                    for (let i= 0; i<items.length; i++) {
                        await util(filePath + '/' + items[i]).then((value) => {
                            arrayOfSVGs.push(value);
                        });
                    }
                    resolve(arrayOfSVGs);
                }).then((arrValue) => {
                    generateHtmlPage(arrValue);        
                    new Promise(async (resolve) => {
                        await fs.remove(__dirname + '/tmpsvgs');
                        await fs.remove(__dirname + '/temp.sketch');
                        resolve();
                    }).then(() => {
                        console.log(colors.cyan(`One sec! Sending temp files to the ${emoji.emojify(':recycle: ')} Bin ...`));
                        console.log('Done! Check these out here:');
                        console.log('Done!\nClean as a whistle! Have a great day!');
                    });
                }); 
            });
    });
});

const generateHtmlPage = (svgArr) => {
    fs.readFile(__dirname + '/index.html').then((data) => {
        const $ = cheerio.load(data.toString());
        $('#svg_demo').empty();
        $('#svg_area').empty();
        let setSVGTemplate = (name, idx) => {return `<svg data-name='${name}' class='svg_icn svg_icon_${idx}' focusable="false" height="24" width="24"><use xlink:href="#${name}"></use></svg>`};
        svgArr.forEach((val, idx) => {
            const name = 'testsvg_' + idx;
            const setTemplate = setSVGTemplate(name, idx);
            let $val = $(val);
            $val.attr('id', name);
            $($(val), 'use').attr('href', '#' + name);
            $(setTemplate).appendTo('#svg_demo');
            $val.appendTo('#svg_area');
        });

        fs.writeFile(__dirname + '/index.html', $.html()).then(() => {
            console.log(terminalLink('Need to make customizations? Use our fancy editor for that!', __dirname + '/index.html'));
        });
    });
}

const runCmdLine = (allSlices, fileName) => {
    return new Promise((resolve, reject) => {
        allSlices.slices.forEach((slicedObject, idx) => {
            const id = slicedObject.id;
            const name = encodeURIComponent(slicedObject.name);
            shell.exec(`${sketchTool} export slices ${fileName} --item=${id} --filename=${name}.svg --output=${__dirname}/tmpsvgs --formats=svg`);
            resolve();
        });
    });
}
