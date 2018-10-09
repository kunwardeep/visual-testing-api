/* eslint-disable  no-console*/
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const jsonValidator = require('./verifyJson');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ImageComparison Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1',
        compareSha: '1'
      },
      image: {
        base64EncodeString: '1',
        key: '1'
      },
      metadata: {
        imageName: '1'
      }
    };
    const result = jsonValidator.validateImageComparisonJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
     {
       compareSha: '1'
     },
      image: {
        base64EncodeString: '1',
        key: '1'
      },
      metadata: {
        imageName: '1'
      }
    };

    const result = jsonValidator.validateImageComparisonJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "name"',
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});

describe('ImageSave Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1'
      },
      image: {
        base64EncodeString: '1',
        key: '1'
      },
      metadata: {
        imageName: '1'
      }
    };
    const result = jsonValidator.validateImageSaveJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1'
      },
      image: {
        base64EncodeString: '1',
        key: '1'
      },
      metadata: {
        imageName: '1'
      }
    };
    const result = jsonValidator.validateImageSaveJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});

describe('Get Images Diff Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1',
        compareSha: '1'
      }
    };
    const result = jsonValidator.validateImageDiffJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        compareSha: '1'
      }
    };

    const result = jsonValidator.validateImageDiffJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});

describe('Test Status Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1'
      },
      'testStatus': true
    };
    const result = jsonValidator.validateSetTestStatusJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1'
      }
    };
    const result = jsonValidator.validateSetTestStatusJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"',
        'instance requires property "testStatus"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});

describe('Get New Image List Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1'
      }
    };
    const result = jsonValidator.validateListOfNewImageJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1'
      }
    };
    const result = jsonValidator.validateListOfNewImageJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });

  describe('Delete Folder Payload validator', () => {
    it('Valid Json', () => {
      const jsonBody = {
        'project':
        {
          name: '1',
          branchSha: '1'
        }
      };
      const result = jsonValidator.validateDeleteFolderJson(jsonBody);
      return expect(result.isValid).to.be.true;
    });

    describe('InValid Json', () => {
      const jsonBody = {
        'project':
        {
          name: '1'
        }
      };
      const result = jsonValidator.validateDeleteFolderJson(jsonBody);
      it('Returns false', () => {
        return expect(result.isValid).to.be.false;
      });
      it('Returns error messages', () => {
        const errors = [
          'instance.project requires property "branchSha"'
        ];
        return expect(result.error).to.deep.equal(errors);
      });
    });
  });
});

describe('ImageProcessed Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1'
      }
    };
    const result = jsonValidator.validateImageProcessedJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1'
      }
    };
    const result = jsonValidator.validateImageProcessedJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});

describe('Retry Compare Images Payload validator', () => {
  it('Valid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1',
        branchSha: '1'
      }
    };
    const result = jsonValidator.validateImageProcessedJson(jsonBody);
    return expect(result.isValid).to.be.true;
  });

  describe('InValid Json', () => {
    const jsonBody = {
      'project':
      {
        name: '1'
      }
    };
    const result = jsonValidator.validateImageProcessedJson(jsonBody);
    it('Returns false', () => {
      return expect(result.isValid).to.be.false;
    });
    it('Returns error messages', () => {
      const errors = [
        'instance.project requires property "branchSha"'
      ];
      return expect(result.error).to.deep.equal(errors);
    });
  });
});
