const Promise = require('bluebird');
const path = require('path');

const { getListOfObjectsFromS3, getImagePathForNewImage, getImageMetadataFromS3, getFolderNameForNewImages, getImageUrlFromS3, getImagePathForNewThumbnail } = require('../modules/processImages.js');
const { getMetaDataFilters } = require('../modules/helper');
const { validateListOfNewImageJson } = require('../modules/verifyJson');

const listOfNewImages = function(jsonObj, context, callback) {
  const imageComparisonJson = validateListOfNewImageJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project } = jsonObj;
  const newImagesFolderName = getFolderNameForNewImages(project.name, project.branchSha);
  const json = { metadataFilters: {}, images: [] };

  getListOfObjectsFromS3(newImagesFolderName)
    .then(items => {
      return Promise.map(items, item => {
        const imageKey = path.basename(item.Key);
        const projectName = project.name;
        const branchSha = project.branchSha;
        const newImage = getImagePathForNewImage(projectName, branchSha, imageKey);
        const thumbnail = getImagePathForNewThumbnail(projectName, branchSha, imageKey);

        const metadataPromise = getImageMetadataFromS3(newImage);
        const imageUrlPromise = getImageUrlFromS3(newImage);
        const thumbnailUrlPromise = getImageUrlFromS3(thumbnail);

        return Promise.all([metadataPromise, imageUrlPromise, thumbnailUrlPromise])
          .then(promises => {
            const metadata = promises[0];
            const imageUrl = promises[1];
            const thumbnailUrl = promises[2];

            json.metadataFilters = getMetaDataFilters(json.metadataFilters, metadata);
            json.images.push({ key: imageKey, metadata, imageUrl, thumbnailUrl });
          })
          .catch(err => {
            throw err;
          });
      });
    })
    .then(() => callback(null, json))
    .catch(err => callback(err, err.stack));
};

module.exports = {
  listOfNewImages
};
