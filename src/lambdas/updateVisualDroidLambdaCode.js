/* eslint-disable no-console*/
console.log('Loading function');
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const CODE_BUCKET_NAME = process.env.CODE_BUCKET_NAME;
const CODE_FILE_NAME = process.env.CODE_FILE_NAME;
const path = require('path');
const scriptName = path.basename(__filename).slice(0, -3);

const updateVisualDroidLambdaCode = function(event, context) {
  const key = event.Records[0].s3.object.key;
  const bucket = event.Records[0].s3.bucket.name;
  if (bucket === CODE_BUCKET_NAME && key === CODE_FILE_NAME) {
    lambdaListFunctions()
      .then(getListOfFunctionsToUpdate())
      .then(updateFunctions())
      .catch(err => {
        console.log(err, err.stack);
      });
  } else {
    context.succeed(`skipping zip ${ key } in bucket ${ bucket}`);
  }
};

const lambdaListFunctions = params => {
  const lambda = new AWS.Lambda();
  return new Promise((resolve, reject) => lambda.listFunctions(params, (err, url) => (err ? reject(err) : resolve(url))));
};

const lambdaListTags = params => {
  const lambda = new AWS.Lambda();
  return new Promise((resolve, reject) => lambda.listTags(params, (err, url) => (err ? reject(err) : resolve(url))));
};

const lambdaUpdateFunctionCode = params => {
  const lambda = new AWS.Lambda();
  return new Promise((resolve, reject) => lambda.updateFunctionCode(params, (err, url) => (err ? reject(err) : resolve(url))));
};

const getListOfFunctionsToUpdate = () => data => {
  return Promise.filter(data.Functions, f => {
    return lambdaListTags({ Resource: f
      .FunctionArn })
      .then(tagObj => tagObj.Tags.UpdateFunction && tagObj.Tags.UpdateFunction === 'true' && !f.FunctionName.includes(scriptName));
  });
};

const updateFunctions = () => listOfFunctionsToUpdate => {
  return listOfFunctionsToUpdate.forEach(f => {
    const functionName = f.FunctionName;
    const params = {
      FunctionName: functionName,
      S3Key: CODE_FILE_NAME,
      S3Bucket: CODE_BUCKET_NAME
    };
    console.log(`uploaded to lambda function: ${ functionName}`);
    return lambdaUpdateFunctionCode(params);
  });
};

module.exports = {
  updateVisualDroidLambdaCode
};
