import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateOrganizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
  operationName: string;
}
export const createOrganizationRef: CreateOrganizationRef;

export function createOrganization(vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;
export function createOrganization(dc: DataConnect, vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface ListEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
  operationName: string;
}
export const listEventsRef: ListEventsRef;

export function listEvents(): QueryPromise<ListEventsData, undefined>;
export function listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface SignupForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignupForEventVariables): MutationRef<SignupForEventData, SignupForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SignupForEventVariables): MutationRef<SignupForEventData, SignupForEventVariables>;
  operationName: string;
}
export const signupForEventRef: SignupForEventRef;

export function signupForEvent(vars: SignupForEventVariables): MutationPromise<SignupForEventData, SignupForEventVariables>;
export function signupForEvent(dc: DataConnect, vars: SignupForEventVariables): MutationPromise<SignupForEventData, SignupForEventVariables>;

interface ListVolunteersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVolunteersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVolunteersData, undefined>;
  operationName: string;
}
export const listVolunteersRef: ListVolunteersRef;

export function listVolunteers(): QueryPromise<ListVolunteersData, undefined>;
export function listVolunteers(dc: DataConnect): QueryPromise<ListVolunteersData, undefined>;

