/*************************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

const cheerio = require('cheerio');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const SketchSVG = require('../lib/index');
const ParseSketch = require('../lib/parse-sketch');
const fs = require('fs-extra');
const mockSVGArr = require('./mock-data/svgArr');

const process = {
    argv: ['', '', './samples/multitest.sketch']
};

const mockItems = ['12345--Confirmation.svg', '12345--Mask.svg', '12345--Exclamation.svg'];
const mockTempSVGPaths = './test/mock-data/tmpsvgs';
const mockTempSketch = './test/mock-data/temp.sketch';

describe('index.js -- Testing the overall index flow', () => {
    let instance;
    beforeEach(() => {
        instance = new SketchSVG();
    });
    afterEach(() => {
        instance = null;
    });

    it('should create a new SketchSVG class instance and call init, with no artboard argv file', (done) => {
        const parseSpy = sinon.spy(ParseSketch.prototype, 'init');
        const cleanupSpy = sinon.spy(SketchSVG.prototype, 'finalizeHtmlAndCleanup');

        new Promise(async(resolve, reject) => {
            await instance.init(process.argv[2]);
            resolve();
        }).then(() => {
            expect(parseSpy.calledOnce).to.equal(true);
            expect(cleanupSpy.calledOnce).to.equal(true);
            // Check if temp files are gone
            expect(fs.existsSync('./lib/tmpsvgs')).to.equal(false);
            expect(fs.existsSync('./lib/temp.sketch')).to.equal(false);
            done();
        });
    });

    it('should run getLayers and return a JSON object with the proper layers given a proper temp sketch file path', () => {
        const result = instance.getLayers(mockTempSketch);
        expect(result.name).to.equal('sketchSVGTempGroup');
        expect(result.layers.length).to.equal(3);
    });

    it('should run getSVGs and resolve a promise and call generateHtmlPage', (done) => {
        const generateHTMLSpy = sinon.spy(SketchSVG.prototype, 'generateHtmlPage');
        const svgUtilSpy = sinon.spy(instance, 'svgUtil');
        instance.getSVGs(mockTempSVGPaths, mockItems).then(() => {
            expect(generateHTMLSpy.calledOnce).to.equal(true);
            expect(svgUtilSpy.calledThrice).to.equal(true);
            done();
        });
    });

    it('should run generateHtmlPage and make sure we read and write to the index.html page, then make sure the SVGs were injected properly', (done) => {
        const fsSpy = sinon.spy(fs, 'readFile');
        const fsWriteSpy = sinon.spy(fs, 'writeFile');

        new Promise(async(resolve) => {
            await instance.generateHtmlPage(mockSVGArr);
            resolve();
        }).then(() => {
            expect(fsSpy.calledOnce).to.equal(true);
            expect(fsWriteSpy.calledTwice).to.equal(true);
            fs.readFile('./lib/index.html', (err, data) => {
                const $ = cheerio.load(data.toString());
                expect($('#svg_area symbol').length).to.equal(3);
                expect($('#base64_area div').length).to.equal(3);

                $('#svg_area symbol').each((idx, el) => {
                    const thisPath = $(el, 'path').html();
                    let expectedPath = cheerio.load(mockSVGArr[idx].svg);
                    expectedPath = $(expectedPath.html(), 'path').html();
                    expect(thisPath).to.deep.equal(expectedPath);
                });

                $('#base64_area div').each((idx, el) => {
                    const thisPath = $(el).text();
                    expect(thisPath).to.deep.equal(mockSVGArr[idx].base64);
                });
                done();
            });
        });
    });
});
