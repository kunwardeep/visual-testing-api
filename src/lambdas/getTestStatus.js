const { getImagePathForTestStatus, getObjectFromS3 } = require('../modules/processImages.js');
const { validateGetTestStatusJson } = require('../modules/verifyJson');

const getTestStatus = function(jsonObj, context, callback) {
  const imageComparisonJson = validateGetTestStatusJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project } = jsonObj;
  const testStatusFile = getImagePathForTestStatus(project.name, project.branchSha);

  getObjectFromS3(testStatusFile)
    .then(body => callback(null, { pass: body.toString() === 'true' }))
    .catch(err => {
      if (err.code === 'NoSuchKey') {
        callback(null, { pass: false });
      }
      return callback(err);
    });
};

module.exports = {
  getTestStatus
};
