const ns = require('node-sketch');
const colors = require('colors/safe');
const emoji = require('node-emoji');

module.exports = (filename) => {return new Promise((resolve, reject) => {
ns.read(filename).then((sketch = {}) => {
        if (!sketch) {
            console.error('Not a valid sketch file');
            reject();
        } 

        let tempArr = [];
        const layers = sketch.pages[0].layers;
        
        sketch.foreignSymbols.forEach((instance, idx)=> {
            instance.layers = instance.layers.filter((thisLayer)=> {
                return thisLayer.name.includes('Swatch') === false;
            });
            // return instance;
        });
        sketch.save('temp.sketch').then(()=>{
           console.log(emoji.emojify(':male_mage: :sparkles:') + colors.green(`Automagically${emoji.emojify(':sparkles:')} extracted SVGs from sketch! Woohoo!`));
           console.log(colors.gray('\nOkay, now let\'s compress and convert to an easy copy/paste format...'));
            resolve('temp.sketch');
        });
        
    });
    });
};
