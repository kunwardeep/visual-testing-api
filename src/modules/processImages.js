const Promise = require('bluebird');
const AWS = require('aws-sdk');
const config = require('../config');
const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');
const fse = require('fs-extra');
const looksSame = require('looks-same');
const PROCESSED_FILE_PREFIX = 'processed_';
const PROCESSED_FILE_SUFFIX = '.txt';

const getDiffParams = (actualImage, expectedImage, diffImage, options = {}) => {
  const diffParam = {
    diff: diffImage,
    reference: expectedImage,
    current: actualImage,
    highlightColor: '#ff00ff' // color to highlight the differences
  };
  return Object.assign({}, diffParam, options);
};

const createDiff = (actualImage, expectedImage, diffImage, options) => {
  return new Promise((resolve, reject) => {
    const diffParams = getDiffParams(actualImage, expectedImage, diffImage, options);
    looksSame.createDiff(diffParams, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const compareImageUsingLooksSame = obj => {
  const actualImage = obj.actualImage;
  const expectedImage = obj.expectedImage;
  const diffImage = obj.diffImage;
  const options = typeof obj.options !== 'undefined' ? obj.options : {};
  return new Promise((resolve, reject) => {
    looksSame(actualImage, expectedImage, Object.assign({}, options), (err, equal) => {
      if (err) {
        reject(err);
      } else {
        resolve(equal);
      }
    });
  })
    .then(isEqual => {
      return typeof diffImage !== 'undefined' ?
        createDiff(actualImage, expectedImage, diffImage, Object.assign({}, options)).then(() => isEqual) :
        isEqual;
    });
};

const uploadObjectToS3 = (objectName, body = '', metadata = {}) => {
  const s3 = new AWS.S3();

  const param = {
    Bucket: process.env.S3_BUCKET,
    Key: objectName,
    Body: body,
    ContentEncoding: config.image.contentEncoding,
    ContentType: config.image.ContentType,
    Metadata: metadata
  };

  return s3.upload(param).promise()
    .then(() => {
      /* eslint-disable no-console*/
      console.log('Uploaded Image');
      return true;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const uploadImageToS3 = (imageName, buffer, metadata) => {
  return uploadObjectToS3(imageName, buffer, metadata);
};

const copyObject = (name, destinationBucket, metadata, metadataDirective) => {
  const s3 = new AWS.S3();
  const param = { Bucket: destinationBucket, CopySource: path.join(process.env.S3_BUCKET, name), Key: name };
  if (typeof metadataDirective !== 'undefined') {
    param.MetadataDirective = metadataDirective;
  }
  if (typeof metadata !== 'undefined') {
    param.Metadata = metadata;
  }
  return s3.copyObject(param).promise()
    .then(data => data.Body)
    .catch(err => {
      console.error(err, err.stack);
      throw err;
    });
};

const touchImage = name => {
  // We are imitating the touchImage functionality by overwriting the current image with itself.
  // AWS s3 only allows you to do that if you replace the current metadata.
  // Hence we need to retrieve the current metadata pass it to the copyObject function
  return getImageMetadataFromS3(name)
    .then(metadata => copyObject(name, process.env.S3_BUCKET, metadata, 'REPLACE'));
};

const getObjectFromS3 = (name, newParams) => {
  const s3 = new AWS.S3();
  const param = newParams || { Bucket: process.env.S3_BUCKET, Key: name };

  return s3.getObject(param).promise()
    .then(data => {
      /* eslint-disable no-console*/
      console.log('Got object from s3', data);
      return data.Body;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const getImageFromS3 = name => {
  const param = {
    Bucket: process.env.S3_BUCKET,
    Key: name,
    ResponseContentEncoding: config.image.contentEncoding,
    ResponseContentType: config.image.contentType
  };
  return getObjectFromS3(name, param);
};

const deleteObjectFromS3 = name => {
  const s3 = new AWS.S3();

  const param = {
    Bucket: process.env.S3_BUCKET,
    Key: name
  };
  return s3.deleteObject(param).promise()
    .then(data => {
      /* eslint-disable no-console*/
      console.log('Deleted image s3', data);
      return data;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const s3GetSignedUrls = opts => {
  const s3 = new AWS.S3();

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', opts, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};

const getImageMetadataFromS3 = name => {
  const s3 = new AWS.S3();
  const param = {
    Bucket: process.env.S3_BUCKET,
    Key: name
  };

  return s3.headObject(param).promise()
    .then(data => {
      /* eslint-disable no-console*/
      console.log('Got Metadata');
      return data.Metadata;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const getImageUrlFromS3 = name => {
  const param = {
    Bucket: process.env.S3_BUCKET,
    Key: name,
    Expires: 3600, // 1hr
    ResponseContentEncoding: config.image.contentEncoding,
    ResponseContentType: config.image.contentType
  };
  return s3GetSignedUrls(param)
    .then(data => {
      /* eslint-disable no-console*/
      console.log('Got image url');
      return data;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const getListOfObjectsFromS3 = folderName => {
  const s3 = new AWS.S3();
  const param = {
    Bucket: process.env.S3_BUCKET,
    Prefix: folderName,
    MaxKeys: 1000
  };

  return s3.listObjects(param).promise()
    .then(data => {
      /* eslint-disable no-console*/
      console.log('Got list of Objects');
      console.log(param);
      console.log(data);
      return data.Contents;
    })
    .catch(err => {
      console.log(err, err.stack);
      throw err;
    });
};

const getImageUrls = (diffImage, branchImage, compareToImage) => {
  const diffUrlPromise = getImageUrlFromS3(diffImage);
  const branchUrlPromise = getImageUrlFromS3(branchImage);
  const compareToUrlPromise = getImageUrlFromS3(compareToImage);

  return Promise.all([diffUrlPromise, branchUrlPromise, compareToUrlPromise])
    .then(promises => ({ diff: promises[0], branch: promises[1], compareTo: promises[2] }))
    .catch(err => {
      throw err;
    });
};

const emptyContents = folderName => {
  return getListOfObjectsFromS3(folderName)
    .then(items => items.forEach(item => {
      console.log(item);
      return deleteObjectFromS3(item.Key);
    }));
};

const getImagesFolderName = (projectName, sha) => path.join(projectName, sha, 'images');

const getImagePath = (projectName, sha, imageName) => {
  const imagesFolderName = getImagesFolderName(projectName, sha);
  return path.join(imagesFolderName, imageName);
};

const getImagePathForThumbnail = (projectName, sha, imageName, imageFolder) => path.join(projectName, sha, 'thumbnail', imageFolder, imageName);

const getImagePathForNewThumbnail = (projectName, sha, imageName) => getImagePathForThumbnail(projectName, sha, imageName, 'new');

const getImagePathForBranchThumbnail = (projectName, sha, imageName) => getImagePathForThumbnail(projectName, sha, imageName, 'images');

const getImagePathForDiffThumbnail = (projectName, sha, imageName) => getImagePathForThumbnail(projectName, sha, imageName, 'diff');

const getFolderNameForDiffs = (projectName, sha) => path.join(projectName, sha, 'diff');

const getImagePathForDiff = (projectName, sha, imageName) => {
  const diffFolderName = getFolderNameForDiffs(projectName, sha);
  return path.join(diffFolderName, imageName);
};

const getFolderNameForProject = (projectName, sha) => path.join(projectName, sha);

const getFolderNameForNewImages = (projectName, sha) => path.join(projectName, sha, 'new');

const getImagePathForNewImage = (projectName, sha, imageName) => {
  const newImagesFolderName = getFolderNameForNewImages(projectName, sha);
  return path.join(newImagesFolderName, imageName);
};

const getImagePathForTestStatus = (projectName, sha) => path.join(projectName, sha, 'testStatus', 'testStatus.txt');

const imageProcessedFileName = key => `${PROCESSED_FILE_PREFIX}${key}${PROCESSED_FILE_SUFFIX}`;

const getImagePathForProcessedStatus = (projectName, sha, key) => path.join(projectName, sha, 'images', imageProcessedFileName(key));

const sanitizeImageProcessedFileName = fileName => fileName.replace(PROCESSED_FILE_PREFIX, '').replace(PROCESSED_FILE_SUFFIX, '');

const generateThumbnail = (image, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    gm(image).size(function(err, size) {
      if (err) {
        reject(err);
      }
      // Infer the scaling factor to avoid stretching the image unnaturally.
      const scalingFactor = Math.min(
        maxWidth / size.width,
        maxHeight / size.height
      );
      const width = scalingFactor * size.width;
      const height = scalingFactor * size.height;

      // Transform the image buffer in memory.
      gm(image).resize(width, height)
        .toBuffer(null, function(error, buffer) {
          if (error) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
  });
};

const saveFileToLambdaStorage = (base64Data, fileName) => {
  return fse.writeFile(fileName, base64Data, 'base64')
    .then(() => {
      /* eslint-disable no-console*/
      console.log(`File written ${fileName}`);
    })
    .catch(err => {
      throw err;
    });
};

const uploadTestStatus = (project, testStatus = false) => {
  const testStatusFile = getImagePathForTestStatus(project.name, project.branchSha);
  return uploadObjectToS3(testStatusFile, testStatus.toString());
};

const uploadImageProcessedStatus = (project, key, compareResult = false) => {
  const processedStatusFile = getImagePathForProcessedStatus(project.name, project.branchSha, key);
  return uploadObjectToS3(processedStatusFile, compareResult.toString());
};

module.exports = {
  compareImageUsingLooksSame,
  uploadImageToS3,
  getImageFromS3,
  getListOfObjectsFromS3,
  getImageUrlFromS3,
  getImageUrls,
  getImagePath,
  getFolderNameForDiffs,
  getImagePathForDiff,
  getImageMetadataFromS3,
  uploadObjectToS3,
  getImagePathForNewImage,
  getFolderNameForNewImages,
  getImagePathForTestStatus,
  getObjectFromS3,
  generateThumbnail,
  getImagePathForNewThumbnail,
  getImagePathForBranchThumbnail,
  getImagePathForDiffThumbnail,
  saveFileToLambdaStorage,
  emptyContents,
  getFolderNameForProject,
  deleteObjectFromS3,
  uploadTestStatus,
  getDiffParams,
  uploadImageProcessedStatus,
  getImagesFolderName,
  touchImage,
  sanitizeImageProcessedFileName
};
