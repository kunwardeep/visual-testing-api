const REST_API_ID = process.env.REST_API_ID;
const AWS_REGION = process.env.AWS_REGION;
const VISUAL_DROID_URL = `https://${REST_API_ID}.execute-api.${AWS_REGION}.amazonaws.com/Prod`;
const LIST_OF_IMAGE_DIFF_URL = `${VISUAL_DROID_URL}/listOfImageDiff`;
const LIST_OF_NEW_IMAGES_URL = `${VISUAL_DROID_URL}/listOfNewImages`;
const SET_TEST_STATUS_URL = `${VISUAL_DROID_URL}/setTestStatus`;
const GET_TEST_STATUS_URL = `${VISUAL_DROID_URL}/getTestStatus`;
const SAVE_IMAGE_URL = `${VISUAL_DROID_URL}/saveImage`;
const SAVE_AND_COMPARE_IMAGE_URL = `${VISUAL_DROID_URL}/saveAndCompareImage`;
const DELETE_FOLDER_URL = `${VISUAL_DROID_URL}/deleteFolder`;
const IMAGES_PROCESSED_URL = `${VISUAL_DROID_URL}/imagesProcessed`;

const PROJECT_NAME = 'temp';
const request = require('axios');

const { imageToBase64String, basicAuthString } = require('../src/modules/helper');
const redImageName = 'red.png';
const redImageLoc = `./images/test/${redImageName}`;
const textImageName = 'red_text.png';
const textImageLoc = `./images/test/${textImageName}`;
const antiAliasImage01Name = 'antiAlias_1.png';
const antiAliasImage01Loc = `./images/test/${antiAliasImage01Name}`;
const antiAliasImage02Name = 'antiAlias_2.png';
const antiAliasImage02Loc = `./images/test/${antiAliasImage02Name}`;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

request.defaults.headers.common.Authorization = basicAuthString();
const callApi = (apiEndPoint, payload) => {
  return request.post(apiEndPoint, payload)
    .then(response => {
      return response.data;
    });
};

const deleteFolder = folderName => callApi(DELETE_FOLDER_URL, { project: { name: PROJECT_NAME, branchSha: folderName } });
const randomFolderName = () => Math.ceil(Math.random() * 1000).toString();

const sleep = milliseconds => {
  const start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
};

const imagesProcessedFinished = (folderName, retry = 1) => {
  if (retry === 5) {
    return false;
  }
  sleep(1000);
  return imagesProcessed(folderName)
    .then(result => {
      return result.status ? true : imagesProcessedFinished(folderName, retry + 1);
    });
};

const imagesProcessed = folderName => {
  const payload = {
    project: {
      name: PROJECT_NAME,
      branchSha: folderName
    }
  };
  return callApi(IMAGES_PROCESSED_URL, payload);
};

const saveImage = (folderName, imageName, imageLoc, compareFolderName, looksSameAlgoOptions) => {
  const payload = {
    project: {
      name: PROJECT_NAME,
      branchSha: folderName
    },
    image: {
      key: imageName
    },
    metadata: {
      imageName,
      width: '1',
      height: '2',
      os: '3',
      osVersion: '4',
      browser: '5',
      browserVersion: '6'
    }
  };
  if (typeof compareFolderName !== 'undefined') {
    payload.project.compareSha = compareFolderName;
  }
  if (typeof looksSameAlgoOptions !== 'undefined') {
    payload.image.looksSameAlgoOptions = looksSameAlgoOptions;
  }
  return imageToBase64String(imageLoc)
    .then(base64str => {
      payload.image.base64EncodeString = base64str;
      return callApi(SAVE_IMAGE_URL, payload);
    });
};

const saveAndCompareImageForLooksSame = (folderName, compareFolderName, imageName, imageLoc, looksSameAlgoOptions = { 'strict': true }) => {
  const payload = {
    project: {
      name: PROJECT_NAME,
      branchSha: folderName,
      compareSha: compareFolderName
    },
    image: {
      key: imageName,
      looksSameAlgoOptions
    },
    metadata: {
      imageName,
      width: '1',
      height: '2',
      os: '3',
      osVersion: '4',
      browser: '5',
      browserVersion: '6'
    }
  };
  return imageToBase64String(imageLoc)
    .then(base64str => {
      payload.image.base64EncodeString = base64str;
      return callApi(SAVE_AND_COMPARE_IMAGE_URL, payload);
    });
};

describe('/deleteFolder', () => {
  const expectedResult = { emptyFolder: true };

  it('Can delete non existant folder', () => {
    return expect(deleteFolder(randomFolderName())).to.eventually.deep.equal(expectedResult);
  });

  it('Can delete existant folder', () => {
    const folderName = randomFolderName();
    return saveImage(folderName, redImageName, redImageLoc)
      .then(() => expect(deleteFolder(folderName)).to.eventually.deep.equal(expectedResult));
  });
});

describe('/setTestStatus', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName));
  it('Can set the test status as true', () => {
    const payload =
    {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      },
      testStatus: true
    };
    const expectedResult = { statusUpdated: true, setStatusTo: true };
    return expect(callApi(SET_TEST_STATUS_URL, payload)).to.eventually.deep.equal(expectedResult);
  });

  it('Can set the test status as false', () => {
    const payload =
    {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      },
      testStatus: false
    };
    const expectedResult = { statusUpdated: true, setStatusTo: false };
    return expect(callApi(SET_TEST_STATUS_URL, payload)).to.eventually.deep.equal(expectedResult);
  });
});

describe('/getTestStatus', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName));

  it('Returns current test status as true, if test status is true', () => {
    const payloadGetTestStatus = {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      }
    };
    const payloadSetTestStatus =
    {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      },
      testStatus: true
    };
    const expectedResult = { pass: true };
    return callApi(SET_TEST_STATUS_URL, payloadSetTestStatus)
      .then(() => expect(callApi(GET_TEST_STATUS_URL, payloadGetTestStatus)).to.eventually.deep.equal(expectedResult));
  });
  it('Returns current test status as false, is test status is false', () => {
    const payloadGetTestStatus = {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      }
    };
    const payloadSetTestStatus =
    {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      },
      testStatus: false
    };
    const expectedResult = { pass: false };
    return callApi(SET_TEST_STATUS_URL, payloadSetTestStatus)
      .then(() => expect(callApi(GET_TEST_STATUS_URL, payloadGetTestStatus)).to.eventually.deep.equal(expectedResult));
  });
  it('Returns current test status as false, if no status is present', () => {
    const payloadGetTestStatus = {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      }
    };
    const expectedResult = { pass: false };
    return expect(callApi(GET_TEST_STATUS_URL, payloadGetTestStatus)).to.eventually.deep.equal(expectedResult);
  });
});

describe('/saveImage', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName));

  describe('And payload does not contain compareSha', () => {
    it('Should save image in s3 bucket', () => {
      const expectedResult = { upload: true };
      return expect(saveImage(folderName, redImageName, redImageLoc)).to.eventually.deep.equal(expectedResult);
    });
  });
  describe('And payload contains compareSha', () => {
    it('Should save image in s3 bucket', () => {
      const expectedResult = { upload: true };
      return expect(saveImage(folderName, redImageName, redImageLoc, 'folderNonExistant', { strict: true, ignoreAntialiasing: true })).to.eventually.deep.equal(expectedResult);
    });
  });
});

describe('/saveAndCompareImageUsingLooksSame', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName));

  it('No existing image to compare to', () => {
    return saveAndCompareImageForLooksSame(folderName, 'folderNonExistant', redImageName, redImageLoc)
      .then(result => {
        /* eslint-disable no-unused-expressions */
        expect(result.imagesMatch, 'Property - Images Match').to.be.false;
        expect(result.upload, 'Property - Upload').to.be.true;
        expect(result.urls, 'Property - urls').to.have.property('newUrl');
      });
  });

  describe('Existing image exists', () => {
    describe('Not using ignoreAntialiasing option', () => {
      const compareToFolderName = randomFolderName();
      before(() => saveImage(compareToFolderName, redImageName, redImageLoc));

      it('Image same as current image', () => {
        return saveAndCompareImageForLooksSame(folderName, compareToFolderName, redImageName, redImageLoc)
          .then(result => {
          /* eslint-disable no-unused-expressions */
            expect(result.imagesMatch, 'Property - Images Match').to.be.true;
            expect(result.upload, 'Property - Upload').to.be.true;
          });
      });

      it('Image different to current image', () => {
        return saveAndCompareImageForLooksSame(folderName, compareToFolderName, redImageName, textImageLoc)
          .then(result => {
          /* eslint-disable no-unused-expressions */
            expect(result.imagesMatch, 'Property - Images Match').to.be.false;
            expect(result.upload, 'Property - Upload').to.be.true;
            expect(result.urls, 'Property - urls - diff').to.have.property('diff');
            expect(result.urls, 'Property - urls - branch').to.have.property('branch');
            expect(result.urls, 'Property - urls - compareTo').to.have.property('compareTo');
          });
      });
    });
    describe('Using ignoreAntialiasing option', () => {
      const compareToFolderName = randomFolderName();
      beforeEach(() => saveImage(compareToFolderName, antiAliasImage01Name, antiAliasImage01Loc));

      it('Image same as current image', () => {
        return saveAndCompareImageForLooksSame(folderName, compareToFolderName, antiAliasImage01Name, antiAliasImage01Loc, { strict: true, ignoreAntialiasing: true })
          .then(result => {
            /* eslint-disable no-unused-expressions */
            expect(result.imagesMatch, 'Property - Images Match').to.be.true;
            expect(result.upload, 'Property - Upload').to.be.true;
          });
      });

      it('Image different to current image, but antialias turned false', () => {
        return saveAndCompareImageForLooksSame(folderName, compareToFolderName, antiAliasImage01Name, antiAliasImage02Loc, { strict: true, ignoreAntialiasing: false })
          .then(result => {
            /* eslint-disable no-unused-expressions */
            expect(result.imagesMatch, 'Property - Images Match').to.be.false;
            expect(result.upload, 'Property - Upload').to.be.true;
            expect(result.urls, 'Property - urls - diff').to.have.property('diff');
            expect(result.urls, 'Property - urls - branch').to.have.property('branch');
            expect(result.urls, 'Property - urls - compareTo').to.have.property('compareTo');
          });
      });

      it('Image different to current image, but antialias turned true', () => {
        return saveAndCompareImageForLooksSame(folderName, compareToFolderName, antiAliasImage01Name, antiAliasImage02Loc, { strict: true, ignoreAntialiasing: true })
          .then(result => {
            /* eslint-disable no-unused-expressions */
            expect(result.imagesMatch, 'Property - Images Match').to.be.true;
            expect(result.upload, 'Property - Upload').to.be.true;
          });
      });
    });
  });
});

describe('/listOfNewImages', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName)
    .then(() => saveAndCompareImageForLooksSame(folderName, 'folderNonExistant', redImageName, redImageLoc)));

  it('Return list of the new images', () => {
    const expectedMetadataFilters = {
      browserversion: [ '6' ],
      imagename: [ 'red.png' ],
      width: [ '1' ],
      browser: [ '5' ],
      osversion: [ '4' ],
      height: [ '2' ],
      os: [ '3' ] };
    const expectedMetaData = { browserversion: '6',
      imagename: 'red.png',
      width: '1',
      browser: '5',
      osversion: '4',
      height: '2',
      os: '3' };

    const payload = {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName
      }
    };
    return callApi(LIST_OF_NEW_IMAGES_URL, payload)
      .then(result => {
        expect(result.metadataFilters, 'Property - MetadataFilters').to.deep.equal(expectedMetadataFilters);
        expect(result.images.length, 'Property - Images - length').to.equal(1);
        expect(result.images[0].key, 'Property - Images - length').to.equal(redImageName);
        expect(result.images[0].metadata, 'Property - MetaData').to.deep.equal(expectedMetaData);
        expect(result.images[0], 'Property - images - imageUrl').to.have.property('imageUrl');
        expect(result.images[0], 'Property - images - thumbnailUrl').to.have.property('thumbnailUrl');
      });
  });
});

describe('/listOfImageDiff', () => {
  const folderName = randomFolderName();
  const compareToFolderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName)
    .then(() => saveImage(compareToFolderName, redImageName, redImageLoc))
    .then(() => saveAndCompareImageForLooksSame(folderName, compareToFolderName, redImageName, textImageLoc)));

  it('Return list of the new images', () => {
    const expectedMetadataFilters = {
      browserversion: [ '6' ],
      imagename: [ 'red.png' ],
      width: [ '1' ],
      browser: [ '5' ],
      osversion: [ '4' ],
      height: [ '2' ],
      os: [ '3' ] };
    const expectedMetaData = { browserversion: '6',
      imagename: 'red.png',
      width: '1',
      browser: '5',
      osversion: '4',
      height: '2',
      os: '3' };

    const payload = {
      project: {
        name: PROJECT_NAME,
        branchSha: folderName,
        compareSha: compareToFolderName
      }
    };
    return callApi(LIST_OF_IMAGE_DIFF_URL, payload)
      .then(result => {
        expect(result.metadataFilters, 'Property - MetadataFilters').to.deep.equal(expectedMetadataFilters);
        expect(result.images.length, 'Property - Images - length').to.equal(1);
        expect(result.images[0].key, 'Property - Images - length').to.equal(redImageName);
        expect(result.images[0].metadata, 'Property - MetaData').to.deep.equal(expectedMetaData);
        expect(result.images[0].urls, 'Property - images - urls - diff').to.have.property('diff');
        expect(result.images[0].urls, 'Property - images - urls - branch').to.have.property('branch');
        expect(result.images[0].urls, 'Property - images - urls - compareTo').to.have.property('compareTo');
        expect(result.images[0].thumbnailUrls, 'Property - images - thumbnailUrls - diff').to.have.property('diff');
        expect(result.images[0].thumbnailUrls, 'Property - images - thumbnailUrls - branch').to.have.property('branch');
        expect(result.images[0].thumbnailUrls, 'Property - images - thumbnailUrls - compareTo').to.have.property('compareTo');
      });
  });
});

describe('Test async work flow', () => {
  const folderName = randomFolderName();
  beforeEach(() => deleteFolder(folderName));

  it('should return the status of images processed', () => {
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(saveImage(folderName, `${i}_${redImageName}`, redImageLoc, 'folderNonExistant', { strict: true, ignoreAntialiasing: true }));
    }
    return Promise.all(promises)
      .then(() => expect(imagesProcessedFinished(folderName), 'Images finished processing').to.eventually.equal(true));
  });
});
