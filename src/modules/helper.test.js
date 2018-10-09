/* eslint-disable  no-console*/
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const { getMetaDataFilters } = require('./helper');

describe('getMetaDataFilters', () => {
  it('Returns a set of filters when filters is empty', () => {
    const filterData = {};

    const metadata = {
      browserversion: '6',
      imagename: 'red_text',
      width: '1'
    };

    const expectedFilter = {
      browserversion: ['6'],
      imagename: ['red_text'],
      width: ['1']
    };

    return expect(getMetaDataFilters(filterData, metadata)).to.deep.equal(expectedFilter);
  });

  it('adds to a set of filters when filters is not empty', () => {
    const filterData = {
      browserversion: [ '1' ],
      imagename: [ 'red' ],
      width: [ '2' ],
      browser: [ '3' ],
      osversion: [ '4' ]
    };

    const metadata = {
      browserversion: '6',
      imagename: 'red_text',
      width: '1'
    };

    const expectedFilter = {
      browserversion: ['1', '6'],
      imagename: ['red', 'red_text'],
      width: ['2', '1'],
      browser: [ '3' ],
      osversion: [ '4' ]
    };

    return expect(getMetaDataFilters(filterData, metadata)).to.deep.equal(expectedFilter);
  });

  it('adds to a set of filters when filters is not empty, but does add duplicates', () => {
    const filterData = {
      browserversion: [ '1' ],
      imagename: [ 'red' ],
      width: [ '2' ]
    };

    const metadata = {
      browserversion: '6',
      imagename: 'red_text',
      width: '2'
    };

    const expectedFilter = {
      browserversion: ['1', '6'],
      imagename: ['red', 'red_text'],
      width: ['2']
    };

    return expect(getMetaDataFilters(filterData, metadata)).to.deep.equal(expectedFilter);
  });
});
