const { basicAuthString } = require('../modules/helper');
const auth = function(event, context, callback) {
  const authorizationHeader = event.headers.Authorization;
  if (authorizationHeader && authorizationHeader === basicAuthString()) {
    callback(null, generateAllow(event));
    return;
  }
  callback(null, generateDeny(event));
};

const generatePolicy = function(effect, event) {
  const authResponse = {};
  // Using user string as principalId. Ideally this is the authenticated user name
  // https:// docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html
  authResponse.principalId = 'user';
  if (effect && event.resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = event.methodArn.replace(event.path, '/*');
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const generateAllow = function(event) {
  return generatePolicy('Allow', event);
};

const generateDeny = function(event) {
  return generatePolicy('Deny', event);
};

module.exports = {
  auth
};
