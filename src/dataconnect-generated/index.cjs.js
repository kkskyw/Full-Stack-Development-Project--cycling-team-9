const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'full-stack-development-project--cycling-team-9',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createOrganizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganization', inputVars);
}
createOrganizationRef.operationName = 'CreateOrganization';
exports.createOrganizationRef = createOrganizationRef;

exports.createOrganization = function createOrganization(dcOrVars, vars) {
  return executeMutation(createOrganizationRef(dcOrVars, vars));
};

const listEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEvents');
}
listEventsRef.operationName = 'ListEvents';
exports.listEventsRef = listEventsRef;

exports.listEvents = function listEvents(dc) {
  return executeQuery(listEventsRef(dc));
};

const signupForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SignupForEvent', inputVars);
}
signupForEventRef.operationName = 'SignupForEvent';
exports.signupForEventRef = signupForEventRef;

exports.signupForEvent = function signupForEvent(dcOrVars, vars) {
  return executeMutation(signupForEventRef(dcOrVars, vars));
};

const listVolunteersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVolunteers');
}
listVolunteersRef.operationName = 'ListVolunteers';
exports.listVolunteersRef = listVolunteersRef;

exports.listVolunteers = function listVolunteers(dc) {
  return executeQuery(listVolunteersRef(dc));
};
