const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const SVGSketch = require('../lib/index');
const ParseSketch = require('../lib/parse-sketch');
const fs = require('fs-extra');
const mockSVGArr = require('./mock-data/svgArr');

const process = {
    argv: ['', '', './samples/multitest.sketch']
};

const mockTempSketch = './test/mock-data/temp.sketch';

describe('index.js -- Testing the overall index flow', () => {
    let instance;
    beforeEach(() => {
        instance = new SVGSketch();
    });
    afterEach(() => {
        instance = null;
    });

    it('should create a new SVGSketch class instance and call init, with no artboard argv file', (done) => {
        const parseSpy = sinon.spy(ParseSketch.prototype, 'init');
        new Promise(async(resolve, reject) => {
            await instance.init(process.argv[2]);
            resolve();
        }).then(() => {
            expect(parseSpy.calledOnce).to.equal(true);

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

    it('should run generateHtmlPage and make sure we read and write to the index.html page', (done) => {
        const fsSpy = sinon.spy(fs, 'readFile');
        const fsWriteSpy = sinon.spy(fs, 'writeFile');
        const cleanupSpy = sinon.spy(SVGSketch.prototype, 'finalizeHtmlAndCleanup');

        new Promise(async(resolve) => {
            await instance.generateHtmlPage(mockSVGArr);
            resolve();
        }).then(() => {
            expect(fsSpy.calledOnce).to.equal(true);
            expect(fsWriteSpy.calledOnce).to.equal(true);
            expect(cleanupSpy.calledOnce).to.equal(true);
            done();
        });
    });
});
