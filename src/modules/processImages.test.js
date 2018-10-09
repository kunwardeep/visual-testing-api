const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const { compareImageUsingLooksSame, getDiffParams } = require('./processImages.js');

describe('Image comparison using Looks Same', () => {
  describe('Options not set', () => {
    it('Images match', () => {
      const expectedImage = './images/test/red.png';
      const actualImage = './images/test/red.png';
      return expect(compareImageUsingLooksSame({ expectedImage, actualImage })).to.eventually.be.true;
    });

    it('Images dont match', () => {
      const expectedImage = './images/test/red.png';
      const actualImage = './images/test/red_text.png';
      const diffImage = './images/test/diff/diff_looks_same_no_options.png';
      return expect(compareImageUsingLooksSame({ expectedImage, actualImage, diffImage })).to.eventually.be.false;
    });
  });

  describe('Options set', () => {
    describe('Check with options - strict', () => {
      const expectedImage = './images/test/red.png';
      const actualImage = './images/test/red_text.png';

      describe('Images dont match', () => {
        it('Strict - true', () => {
          const diffImage = './images/test/diff/diff_looks_same_strict_option_true.png';
          return expect(compareImageUsingLooksSame({ options: { 'strict': true }, expectedImage, actualImage, diffImage })).to.eventually.be.false;
        });
        it('Strict - false', () => {
          const diffImage = './images/test/diff/diff_looks_same_strict_option_false.png';
          return expect(compareImageUsingLooksSame({ options: { 'strict': false }, expectedImage, actualImage, diffImage })).to.eventually.be.false;
        });
      });
    });

    describe('Check with options - tolerance', () => {
      const expectedImage = './images/test/rounded_corners_01.png';
      const actualImage = './images/test/rounded_corners_02.png';

      describe('Images dont match', () => {
        const diffImage = './images/test/diff/diff_looks_same_strict_true.png';
        it('Strict is set to true and no tolerance', () => {
          return expect(compareImageUsingLooksSame({ options: { 'strict': true }, expectedImage, actualImage, diffImage })).to.eventually.be.false;
        });
      });

      describe('Images match', () => {
        const tolerance = '0.75';
        it(`Tolerance of - ${tolerance} is set`, () => {
          return expect(compareImageUsingLooksSame({ options: { tolerance }, expectedImage, actualImage })).to.eventually.be.true;
        });
      });
    });

    describe('Check with options - strict and Anti Aliasing', () => {
      const expectedImage = './images/test/antiAlias_1.png';
      const actualImage = './images/test/antiAlias_2.png';

      describe('Images match', () => {
        it('Images are different and match because anti aliasing is turned on', () => {
          return expect(compareImageUsingLooksSame({ options: { 'strict': true, ignoreAntialiasing: true }, expectedImage, actualImage })).to.eventually.be.true;
        });

        it('Images are different but match because anti aliasing is not set', () => {
          return expect(compareImageUsingLooksSame({ options: { 'strict': true }, expectedImage, actualImage })).to.eventually.be.true;
        });
      });

      describe('Images do not match', () => {
        const diffImage = './images/test/diff/diff_looks_same_antiAlias_off.png';
        it('Images are different and do not match because anti aliasing is turned off', () => {
          return expect(compareImageUsingLooksSame({ options: { 'strict': true, ignoreAntialiasing: false }, expectedImage, actualImage, diffImage })).to.eventually.be.false;
        });
      });
    });

    describe('Check with options - tolerance & anti aliasing', () => {
      const expectedImage = './images/test/antiAlias_1.png';
      const actualImage = './images/test/antiAlias_2.png';

      const tolerance = '0.75';

      describe('Images match', () => {
        it('Images are different and match because anti aliasing is turned on', () => {
          return expect(compareImageUsingLooksSame({ options: { tolerance, ignoreAntialiasing: true }, expectedImage, actualImage })).to.eventually.be.true;
        });

        it('Images are different but match because anti aliasing is not set', () => {
          return expect(compareImageUsingLooksSame({ options: { tolerance }, expectedImage, actualImage })).to.eventually.be.true;
        });
      });

      describe('Images do not match', () => {
        const diffImage = './images/test/diff/diff_looks_same__tolerance_off_antiAlias_off.png';
        it('Images are different and do not match because anti aliasing is turned off', () => {
          return expect(compareImageUsingLooksSame({ options: { tolerance, ignoreAntialiasing: false }, expectedImage, actualImage, diffImage })).to.eventually.be.false;
        });
      });
    });

    describe('Set Diff Params', () => {
      const referenceImage = 'expectedImage.png';
      const currentImage = 'actualImage.png';
      const diffImage = 'diffImage.png';

      const getExpectedResult = obj => Object.assign({}, {
        reference: referenceImage,
        current: currentImage,
        diff: diffImage,
        highlightColor: '#ff00ff'
      }, obj);

      const testDataArr = [
        { options: { strict: true }, expectedResult: getExpectedResult({ strict: true }) },
        { options: { strict: true, ignoreAntialiasing: false }, expectedResult: getExpectedResult({ strict: true, ignoreAntialiasing: false }) },
        { options: { strict: true, ignoreAntialiasing: true }, expectedResult: getExpectedResult({ strict: true, ignoreAntialiasing: true }) },
        { options: { tolerance: 4.4, ignoreAntialiasing: true }, expectedResult: getExpectedResult({ tolerance: 4.4, ignoreAntialiasing: true }) },
        { options: { tolerance: 4.4, ignoreAntialiasing: false }, expectedResult: getExpectedResult({ tolerance: 4.4, ignoreAntialiasing: false }) },
        { options: { ignoreCaret: true }, expectedResult: getExpectedResult({ ignoreCaret: true }) }
      ];

      testDataArr.forEach(testData => {
        it(`Should set the options ${JSON.stringify(testData.options)} correctly`, () => {
          const diffParams = getDiffParams(currentImage, referenceImage, diffImage, testData.options);
          return expect(diffParams).to.deep.equal(testData.expectedResult);
        });
      });
    });
  });
});
