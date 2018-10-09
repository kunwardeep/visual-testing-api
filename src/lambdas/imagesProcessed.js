const { getImagesFolderName, getListOfObjectsFromS3 } = require('../modules/processImages.js');
const { validateImageProcessedJson } = require('../modules/verifyJson');

const imagesProcessed = function(jsonObj, context, callback) {
  const imageProcessedJson = validateImageProcessedJson(jsonObj);
  if (!imageProcessedJson.isValid) {
    callback(imageProcessedJson.error);
    return;
  }

  const { project } = jsonObj;
  const imagesFolderName = getImagesFolderName(project.name, project.branchSha);

  getListOfObjectsFromS3(imagesFolderName)
    .then(items => {
      const txtFiles = items.filter(item => item.Key.includes('.txt'));
      const imageFiles = items.filter(item => !item.Key.includes('.txt'));
      const numOfTextFiles = txtFiles.length;
      const numOfImageFiles = imageFiles.length;
      return numOfTextFiles === 0 || numOfTextFiles !== numOfImageFiles ?
        { status: false, progress: `${numOfTextFiles}/${numOfImageFiles}` } :
        { status: true };
    })
    .then(result => callback(null, result))
    .catch(err => callback(err, err.stack));
};

module.exports = {
  imagesProcessed
};
