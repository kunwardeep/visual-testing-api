const Promise = require('bluebird');
const path = require('path');

const { getListOfObjectsFromS3, getImageUrls, getImagePath, getImagePathForDiff, getImageMetadataFromS3, getFolderNameForDiffs,
  getImagePathForBranchThumbnail, getImagePathForDiffThumbnail } = require('../modules/processImages.js');
const { getMetaDataFilters } = require('../modules/helper');
const { validateImageDiffJson } = require('../modules/verifyJson');

const listOfImageDiff = function(jsonObj, context, callback) {
  const imageComparisonJson = validateImageDiffJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project } = jsonObj;
  const diffFolderName = getFolderNameForDiffs(project.name, project.branchSha);
  const json = { metadataFilters: {}, images: [] };

  getListOfObjectsFromS3(diffFolderName)
    .then(items => {
      return Promise.map(items, item => {
        const imageKey = path.basename(item.Key);
        const projectName = project.name;
        const branchSha = project.branchSha;
        const compareSha = project.compareSha;

        const branchImage = getImagePath(projectName, branchSha, imageKey);
        const compareImage = getImagePath(projectName, compareSha, imageKey);
        const diffImage = getImagePathForDiff(projectName, branchSha, imageKey);
        const branchThumbnailImage = getImagePathForBranchThumbnail(projectName, branchSha, imageKey);
        const compareThumbnailImage = getImagePathForBranchThumbnail(projectName, compareSha, imageKey);
        const diffThumbnailImage = getImagePathForDiffThumbnail(projectName, branchSha, imageKey);

        const metadataPromise = getImageMetadataFromS3(diffImage);
        const imageUrlsPromise = getImageUrls(diffImage, branchImage, compareImage);
        const thumbnailUrlsPromise = getImageUrls(diffThumbnailImage, branchThumbnailImage, compareThumbnailImage);

        return Promise.all([metadataPromise, imageUrlsPromise, thumbnailUrlsPromise])
          .then(promises => {
            const metadata = promises[0];
            const urls = promises[1];
            const thumbnailUrls = promises[2];

            json.metadataFilters = getMetaDataFilters(json.metadataFilters, metadata);
            json.images.push({ key: imageKey, metadata, urls, thumbnailUrls });
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
  listOfImageDiff
};
