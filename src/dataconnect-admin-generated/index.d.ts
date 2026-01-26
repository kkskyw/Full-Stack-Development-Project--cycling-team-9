import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateOrganizationData {
  organization_insert: Organization_Key;
}

export interface CreateOrganizationVariables {
  name: string;
  email: string;
}

export interface EventSignup_Key {
  volunteerId: UUIDString;
  eventId: UUIDString;
  __typename?: 'EventSignup_Key';
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface ListEventsData {
  events: ({
    id: UUIDString;
    title: string;
    date: DateString;
    time: string;
    location: string;
    description: string;
  } & Event_Key)[];
}

export interface ListVolunteersData {
  volunteers: ({
    id: UUIDString;
    displayName: string;
    email: string;
    phoneNumber?: string | null;
    skills?: string[] | null;
  } & Volunteer_Key)[];
}

export interface Organization_Key {
  id: UUIDString;
  __typename?: 'Organization_Key';
}

export interface SignupForEventData {
  eventSignup_insert: EventSignup_Key;
}

export interface SignupForEventVariables {
  volunteerId: UUIDString;
  eventId: UUIDString;
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface Volunteer_Key {
  id: UUIDString;
  __typename?: 'Volunteer_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateOrganization' Mutation. Allow users to execute without passing in DataConnect. */
export function createOrganization(dc: DataConnect, vars: CreateOrganizationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrganizationData>>;
/** Generated Node Admin SDK operation action function for the 'CreateOrganization' Mutation. Allow users to pass in custom DataConnect instances. */
export function createOrganization(vars: CreateOrganizationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrganizationData>>;

/** Generated Node Admin SDK operation action function for the 'ListEvents' Query. Allow users to execute without passing in DataConnect. */
export function listEvents(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEventsData>>;
/** Generated Node Admin SDK operation action function for the 'ListEvents' Query. Allow users to pass in custom DataConnect instances. */
export function listEvents(options?: OperationOptions): Promise<ExecuteOperationResponse<ListEventsData>>;

/** Generated Node Admin SDK operation action function for the 'SignupForEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function signupForEvent(dc: DataConnect, vars: SignupForEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SignupForEventData>>;
/** Generated Node Admin SDK operation action function for the 'SignupForEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function signupForEvent(vars: SignupForEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SignupForEventData>>;

/** Generated Node Admin SDK operation action function for the 'ListVolunteers' Query. Allow users to execute without passing in DataConnect. */
export function listVolunteers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListVolunteersData>>;
/** Generated Node Admin SDK operation action function for the 'ListVolunteers' Query. Allow users to pass in custom DataConnect instances. */
export function listVolunteers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListVolunteersData>>;

