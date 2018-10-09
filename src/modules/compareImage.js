const path = require('path');
const uuidv1 = require('uuid/v1');
const { imageToBase64Buffer } = require('./helper');
const { compareImageUsingLooksSame, uploadImageToS3, getImageFromS3, getImagePath, getImagePathForDiff, getImageUrlFromS3,
  getImagePathForNewImage, getImageUrls, uploadTestStatus } = require('./processImages.js');

const processCompareImage = (project, key, actualImageBuffer, looksSameAlgoOptions, metadata) => {
  const uuid = uuidv1();
  const diffImageLoc = path.join('/', 'tmp', `diff_${uuid}.png`);
  const projectName = project.name;
  const branchSha = project.branchSha;
  const branchImage = getImagePath(projectName, branchSha, key);
  const compareSha = project.compareSha;

  const expectedImage = getImagePath(projectName, compareSha, key);
  const diffImage = getImagePathForDiff(projectName, branchSha, key);

  return getImageFromS3(expectedImage)
    .then(expectedImageBuffer => compareImageUsingLooksSame({ options: looksSameAlgoOptions, actualImage: actualImageBuffer, expectedImage: expectedImageBuffer, diffImage: diffImageLoc }))
    .then(imagesMatch => !imagesMatch ?
      processDiffImages(project, diffImageLoc, diffImage, metadata, branchImage, expectedImage, imagesMatch, key) :
      { upload: true, imagesMatch, key })
    .then(payload => ({ compared: true, payload }))
    .catch(err => err.code === 'NoSuchKey' ?
      processNewImages(project, projectName, branchSha, key, actualImageBuffer, metadata) :
      { compared: false, payload: err }
    );
};

const getComparisonParams = metadata => {
  const processimage = JSON.parse(metadata.processimage);
  const project = processimage.project;
  const image = processimage.image;
  const key = image.key;
  const looksSameAlgoOptions = typeof image.looksSameAlgoOptions !== 'undefined' ? image.looksSameAlgoOptions : {};
  return { project, key, looksSameAlgoOptions };
};

const processDiffImages = (project, diffImageLoc, diffImage, metadata, branchImage, expectedImage, imagesMatch, key) => {
  return uploadTestStatus(project, false)
    .then(() => saveAndRetrieveImageUrls(diffImageLoc, diffImage, metadata, branchImage, expectedImage))
    .then(urls => ({ upload: true, urls, imagesMatch, key }))
    .catch(err => {
      throw err;
    });
};

const processNewImages = (project, projectName, branchSha, key, actualImageBuffer, metadata) => {
  return uploadTestStatus(project, false)
    .then(() => saveAndRetrieveNewImageUrl(projectName, branchSha, key, actualImageBuffer, metadata))
    .then(newUrl => ({ compared: true, payload: { upload: true, urls: { newUrl }, imagesMatch: false, key } }))
    .catch(err => {
      throw err;
    });
};

const saveAndRetrieveNewImageUrl = (projectName, branchSha, key, actualImageBuffer, metadata) => {
  const newImage = getImagePathForNewImage(projectName, branchSha, key);
  return uploadImageToS3(newImage, actualImageBuffer, metadata)
    .then(() => getImageUrlFromS3(newImage))
    .catch(error => {
      throw error;
    });
};

const saveAndRetrieveImageUrls = (diffImageLoc, diffImage, metadata, branchImage, expectedImage) =>
  imageToBase64Buffer(diffImageLoc)
    .then(base64Buffer => uploadImageToS3(diffImage, base64Buffer, metadata))
    .then(() => getImageUrls(diffImage, branchImage, expectedImage));

module.exports = {
  processCompareImage,
  getComparisonParams
};
