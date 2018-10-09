const { Validator } = require('jsonschema');

// Need to refactor this, plenty of duplication

const getJsonSchemas = () => {
  const projectSchema = {
    'id': '/Project',
    'type': 'object',
    'properties': {
      'name': { 'type': 'string', 'minLength': 1 },
      'branchSha': { 'type': 'string', 'minLength': 1 },
      'compareSha': { 'type': 'string', 'minLength': 1 }
    },
    'required': ['name', 'branchSha', 'compareSha']
  };

  const imageSchema = {
    'id': '/Image',
    'type': 'object',
    'properties': {
      'base64EncodeString': { 'type': 'string', 'minLength': 1 },
      'key': { 'type': 'string', 'minLength': 1 }
    },
    'required': ['base64EncodeString', 'key']
  };

  const metadataSchema = {
    'id': '/Metadata',
    'type': 'object',
    'properties': {
      'imageName': { 'type': 'string', 'minLength': 1 }
    },
    'required': ['imageName']
  };

  const testStatusSchema = {
    'id': '/TestStatus',
    'type': 'boolean'
  };
  return { projectSchema, imageSchema, metadataSchema, testStatusSchema };
};

const validateImageComparisonJson = jsonBody => {
  const { projectSchema, imageSchema, metadataSchema } = getJsonSchemas();

  const schema = {
    'id': '/ImageSave',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' },
      'image': { '$ref': '/Image' },
      'metadata': { '$ref': '/Metadata' }
    },
    'required': ['project', 'image', 'metadata']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  v.addSchema(imageSchema, '/Image');
  v.addSchema(metadataSchema, '/Metadata');

  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateImageSaveJson = jsonBody => {
  const { projectSchema, imageSchema, metadataSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ImageSave',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' },
      'image': { '$ref': '/Image' },
      'metadata': { '$ref': '/Metadata' }
    },
    'required': ['project', 'image', 'metadata']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  v.addSchema(imageSchema, '/Image');
  v.addSchema(metadataSchema, '/Metadata');

  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateImageDiffJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();

  const schema = {
    'id': '/ListImageDiff',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateListOfNewImageJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ListNewImages',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateSetTestStatusJson = jsonBody => {
  const { projectSchema, testStatusSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ImageSave',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' },
      'testStatus': { '$ref': '/TestStatus' }
    },
    'required': ['project', 'testStatus']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  v.addSchema(testStatusSchema, '/TestStatus');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateGetTestStatusJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ListNewImages',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateDeleteFolderJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ListNewImages',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateImageProcessedJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ImageProcessed',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

const validateRetryCompareImageJson = jsonBody => {
  const { projectSchema } = getJsonSchemas();
  projectSchema.required = ['name', 'branchSha'];

  const schema = {
    'id': '/ImageProcessed',
    'type': 'object',
    'properties': {
      'project': { '$ref': '/Project' }
    },
    'required': ['project']
  };

  const v = new Validator();
  v.addSchema(projectSchema, '/Project');
  const options = { nestedErrors: true, disableFormat: true };

  const validationResult = v.validate(jsonBody, schema, options);
  const errors = validationResult.errors.map(t => t.stack);

  if (errors.length > 0) {
    return { isValid: false, error: errors };
  }
  return { isValid: true };
};

module.exports = {
  validateImageComparisonJson,
  validateImageSaveJson,
  validateImageDiffJson,
  validateSetTestStatusJson,
  validateListOfNewImageJson,
  validateGetTestStatusJson,
  validateDeleteFolderJson,
  validateImageProcessedJson,
  validateRetryCompareImageJson
};
