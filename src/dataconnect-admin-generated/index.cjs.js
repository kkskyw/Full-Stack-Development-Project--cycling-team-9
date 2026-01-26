const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'full-stack-development-project--cycling-team-9',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function createOrganization(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateOrganization', inputVars, inputOpts);
}
exports.createOrganization = createOrganization;

function listEvents(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListEvents', undefined, inputOpts);
}
exports.listEvents = listEvents;

function signupForEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SignupForEvent', inputVars, inputOpts);
}
exports.signupForEvent = signupForEvent;

function listVolunteers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListVolunteers', undefined, inputOpts);
}
exports.listVolunteers = listVolunteers;

