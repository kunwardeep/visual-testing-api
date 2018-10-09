const { validateRetryCompareImageJson } = require('../modules/verifyJson');
const { getImagesFolderName, getListOfObjectsFromS3, touchImage, sanitizeImageProcessedFileName } = require('../modules/processImages.js');
const Promise = require('bluebird');

const retryCompareImage = function(jsonObj, context, callback) {
  const retryCompareImageJson = validateRetryCompareImageJson(jsonObj);

  if (!retryCompareImageJson.isValid) {
    callback(retryCompareImageJson.error);
    return;
  }

  const sanitizedKeys = items => items.map(item => sanitizeImageProcessedFileName(item.Key));
  const occursOnlyOnce = (files, fileToCount) => files.reduce((count, file) => count + (file === fileToCount), 0) === 1;
  const filterUnprocessed = files => files.filter(file => occursOnlyOnce(files, file));

  const { project } = jsonObj;
  const imagesFolderName = getImagesFolderName(project.name, project.branchSha);

  getListOfObjectsFromS3(imagesFolderName)
    .then(items => filterUnprocessed(sanitizedKeys(items)))
    .then(pendingImages => Promise.map(pendingImages, pendingImage => touchImage(pendingImage)))
    .then(() => callback(null, { retryProcessed: true }))
    .catch(err => callback(err, err.stack));
};

module.exports = {
  retryCompareImage
};
