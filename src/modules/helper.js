const cloneDeep = require('lodash.clonedeep');
const fse = require('fs-extra');

const imageToBase64String = file => {
  return fse.readFile(file).then(bitmap => new Buffer(bitmap).toString('base64'));
};

const base64StringToBuffer = base64EncodedString => {
  return Buffer.from(base64EncodedString.replace(/^data:image\/\w+;base64,/, ''), 'base64');
};

const imageToBase64Buffer = file => {
  return imageToBase64String(file)
    .then(base64EncodedString => base64StringToBuffer(base64EncodedString));
};

const stringTobase64 = string => {
  return Buffer.from(string).toString('base64');
};

const basicAuthString = () => {
  const password = process.env.VISUAL_DROID_PASSWORD;
  const base64String = stringTobase64(`:${password}`);
  return `Basic ${base64String}`;
};

const getMetaDataFilters = (originalObj, metadata) => {
  const obj = cloneDeep(originalObj);
  const keys = Object.keys(metadata);
  keys.forEach(key => {
    const value = metadata[key];
    if (!obj[key]) {
      obj[key] = [value];
    } else if (!obj[key].includes(value)) {
      obj[key].push(value);
    }
  });
  return obj;
};

module.exports = {
  imageToBase64String,
  base64StringToBuffer,
  imageToBase64Buffer,
  getMetaDataFilters,
  basicAuthString
};
