const { emptyContents, getFolderNameForProject } = require('../modules/processImages.js');
const { validateDeleteFolderJson } = require('../modules/verifyJson');

const deleteFolder = function(jsonObj, context, callback) {
  const deleteFolderJson = validateDeleteFolderJson(jsonObj);
  if (!deleteFolderJson.isValid) {
    callback(deleteFolderJson.error);
    return;
  }

  const { project } = jsonObj;
  const projectName = project.name;
  const branchSha = project.branchSha;

  emptyContents(getFolderNameForProject(projectName, branchSha))
    .then(() => callback(null, { emptyFolder: true }))
    .catch(err => {
      return callback(err);
    });
};

module.exports = {
  deleteFolder
};
