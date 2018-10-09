const { getImageFromS3, generateThumbnail, uploadImageToS3 } = require('../modules/processImages.js');
const path = require('path');
const MAX_WIDTH = 240;
const MAX_HEIGHT = 320;

const createThumbnail = function(event, context, callback) {
  const message = event.Records[0].Sns.Message;
  const messageObj = JSON.parse(message);
  const imagePath = messageObj.Records[0].s3.object.key;

  if (!imagePath.includes('thumbnail') &&
     (imagePath.includes('images') ||
      imagePath.includes('diff') ||
      imagePath.includes('new')
     )) {
    const imageName = path.basename(imagePath);
    const dirName = path.dirname(imagePath);
    const parentFolderName = path.basename(dirName);
    const grandParentFolderName = path.dirname(dirName);

    const thumbnailFolderName = path.join(grandParentFolderName, 'thumbnail', parentFolderName, imageName);

    // Download key
    getImageFromS3(imagePath)
      .then(originalImageBuffer => generateThumbnail(originalImageBuffer, MAX_WIDTH, MAX_HEIGHT))
      .then(thumbnailBuffer => uploadImageToS3(thumbnailFolderName, thumbnailBuffer))
      .catch(err => callback(err, err.stack));
  }
};

module.exports = {
  createThumbnail
};
