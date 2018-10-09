const { uploadImageToS3 } = require('../modules/processImages.js');
const { processCompareImage } = require('../modules/compareImage.js');
const { validateImageComparisonJson } = require('../modules/verifyJson');
const { base64StringToBuffer } = require('../modules/helper');
const { getImagePath } = require('../modules/processImages.js');

const saveAndCompareImage = function(jsonObj, context, callback) {
  const imageComparisonJson = validateImageComparisonJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project, image, metadata } = jsonObj;
  const projectName = project.name;
  const branchSha = project.branchSha;
  const key = image.key;
  const branchImage = getImagePath(projectName, branchSha, key);
  const actualImageBuffer = base64StringToBuffer(image.base64EncodeString);
  const looksSameAlgoOptions = typeof image.looksSameAlgoOptions !== 'undefined' ? image.looksSameAlgoOptions : {};

  uploadImageToS3(branchImage, actualImageBuffer, metadata)
    .then(() => processCompareImage(project, key, actualImageBuffer, looksSameAlgoOptions, metadata))
    .then(result => result.compared ? callback(null, result.payload) : callback(result.payload));
};

module.exports = {
  saveAndCompareImage
};
