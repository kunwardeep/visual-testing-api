/* eslint-disable no-console*/
const { getImageFromS3, getImageMetadataFromS3, uploadImageProcessedStatus } = require('../modules/processImages.js');
const Promise = require('bluebird');
const { processCompareImage, getComparisonParams } = require('../modules/compareImage.js');

const compareImage = function(event) {
  const message = event.Records[0].Sns.Message;
  const messageObj = JSON.parse(message);
  const imagePath = messageObj.Records[0].s3.object.key;
  console.log('Compare Image', imagePath);
  if (!imagePath.includes('thumbnail') && !imagePath.includes('.txt') && imagePath.includes('images')) {
    Promise.props({
      metadata: getImageMetadataFromS3(imagePath),
      imagebuffer: getImageFromS3(imagePath)
    }).then(function(result) {
      const metadata = result.metadata;
      if (typeof metadata.processimage === 'undefined') {
        console.log(`Not comparing images, 'processImage' metadata not provided`);
        return;
      }
      const { project, key, looksSameAlgoOptions } = getComparisonParams(metadata);
      if (project.branchSha === project.compareSha) {
        console.log(`Not comparing images, branchSha an compareSha are the same `);
        return;
      }

      processCompareImage(project, key, result.imagebuffer, looksSameAlgoOptions, metadata)
        .then(compareResult => {
          if (compareResult.compared) {
            uploadImageProcessedStatus(project, key, compareResult.payload)
              .then(() => {
                console.log(`Image compared - ${key}`);
              })
              .catch(err => {
                console.error(err);
              });
          } else {
            console.error(`Error in image comparison - ${key} - Error - ${compareResult.payload}`);
          }
        });
    });
  }
};

module.exports = {
  compareImage
};
