const { uploadTestStatus } = require('../modules/processImages.js');
const { validateSetTestStatusJson } = require('../modules/verifyJson');

const setTestStatus = function(jsonObj, context, callback) {
  const imageComparisonJson = validateSetTestStatusJson(jsonObj);
  if (!imageComparisonJson.isValid) {
    callback(imageComparisonJson.error);
    return;
  }

  const { project, testStatus } = jsonObj;

  uploadTestStatus(project, testStatus)
    .then(() => callback(null, { statusUpdated: true, setStatusTo: testStatus }))
    .catch(err => {
      callback(err);
    });
};

module.exports = {
  setTestStatus
};
