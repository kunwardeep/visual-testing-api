const { uploadImageToS3, getImagePath } = require('../modules/processImages.js');
const { base64StringToBuffer } = require('../modules/helper');
const { validateImageSaveJson } = require('../modules/verifyJson');

const saveImage = function(jsonObj, context, callback) {
  const imageComparisonJson = validateImageSaveJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project, image, metadata } = jsonObj;
  const branchSha = project.branchSha;
  const projectName = project.name;
  const branchImage = getImagePath(projectName, branchSha, image.key);
  const buffer = base64StringToBuffer(image.base64EncodeString);

  if (project.compareSha) {
    const processImage = {
      project,
      image: { key: image.key }
    };
    if (typeof image.looksSameAlgoOptions !== 'undefined') {
      processImage.image.looksSameAlgoOptions = image.looksSameAlgoOptions;
    }
    metadata.processImage = JSON.stringify(processImage);
  }
  uploadImageToS3(branchImage, buffer, metadata)
    .then(() => callback(null, { upload: true }))
    .catch(err => callback(err));
};

module.exports = {
  saveImage
};
